"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { speechAPI } from "@/lib/api";
import {
  SPEECH_ACTIVE_CLASS,
  SPEECH_RATES,
  activeMarkIndex,
  browserVoiceNotice,
  findSpeechTargets,
  formatClock,
  silentAudioDataUri,
} from "@/lib/speech";
import type {
  SpeechClipResult,
  SpeechMark,
  SpeechScope,
  SpeechUnit,
  UserPreferences,
} from "@/types/api";

type SpeechStatus = "idle" | "loading" | "playing" | "paused";
type SpeechEngine = "elevenlabs" | "browser";

interface SpeechTrack {
  messageId: number;
  scope: SpeechScope;
}

interface SpeechTarget {
  messageId: number;
  field: string;
  line: number;
}

export interface SpeechState {
  track: SpeechTrack | null;
  status: SpeechStatus;
  engine: SpeechEngine | null;
  notice: string | null;
}

export interface SpeechProgress {
  current: number;
  duration: number;
}

export interface SpeechController {
  state: SpeechState;
  rate: number;
  voiceEnabled: boolean;
  play: (messageId: number, scope: SpeechScope) => Promise<void>;
  toggle: (messageId: number, scope: SpeechScope) => void;
  stop: () => void;
  unlock: () => void;
  setRate: (rate: number) => void;
  setVoiceEnabled: (enabled: boolean) => void;
  previewVoice: (url: string) => void;
  /** Jumps to a point in ElevenLabs audio. The browser's voice can't seek. */
  seek: (seconds: number) => void;
  /**
   * Calls `listener` whenever the audio's position or length changes and
   * returns a function that stops it. The player's timeline updates several
   * times a second this way without re-rendering anything else.
   */
  subscribeToProgress: (listener: (progress: SpeechProgress) => void) => () => void;
}

const IDLE: SpeechState = { track: null, status: "idle", engine: null, notice: null };
// Audio links are signed for six hours; reuse one for comfortably less.
const CLIP_REUSE_MS = 5 * 60 * 60 * 1000;
const NOTICE_MS = 5000;
const PROGRESS_EVENTS = ["timeupdate", "durationchange", "seeking", "emptied"];

const SpeechContext = createContext<SpeechController | null>(null);

export const SpeechContextProvider = SpeechContext.Provider;

/** The narration controller, or null outside the chat page. */
export function useSpeech() {
  return useContext(SpeechContext);
}

function canUseBrowserVoice() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Plays narration for one message at a time: ElevenLabs audio when the server
 * can provide it, the browser's own voice when it can't.
 *
 * Playback bookkeeping lives in refs, not React state. Audio events fire
 * several times a second and highlighting toggles a class on the DOM
 * directly, so a long lesson never re-renders just because a new line began.
 * Only coarse changes (loading, playing, paused) go through state.
 */
export function useSpeechController({
  idToken,
  preferences,
  onPreferencesChange,
}: {
  idToken?: string;
  preferences?: UserPreferences;
  onPreferencesChange: (changes: Partial<UserPreferences>) => void;
}): SpeechController {
  const [state, setState] = useState<SpeechState>(IDLE);
  const [rate, setRateState] = useState(preferences?.speechRate ?? 1);
  const voiceEnabled = preferences?.voiceEnabled ?? false;

  // Handlers and async continuations read the latest values from refs, so
  // they never act on a stale render.
  const stateRef = useRef<SpeechState>(IDLE);
  const settingsRef = useRef({
    idToken,
    voiceId: preferences?.voiceId ?? "",
    rate,
    onPreferencesChange,
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previewRef = useRef<HTMLAudioElement | null>(null);
  const engineRef = useRef<SpeechEngine | null>(null);
  const trackRef = useRef<SpeechTrack | null>(null);
  const marksRef = useRef<SpeechMark[]>([]);
  const markIndexRef = useRef(-1);
  // Length from the server's timings, shown until the browser has read the
  // audio file's own.
  const durationRef = useRef(0);
  const highlightedRef = useRef<Element[]>([]);
  const clipKeyRef = useRef<string | null>(null);
  // Bumped whenever playback stops or restarts. Anything asynchronous that
  // finishes under an older value has been superseded and must do nothing.
  const playIdRef = useRef(0);
  const unlockedRef = useRef(false);
  const clipsRef = useRef(new Map<string, { clip: SpeechClipResult; fetchedAt: number }>());
  const requestsRef = useRef(new Map<string, Promise<SpeechClipResult>>());

  useEffect(() => {
    settingsRef.current.idToken = idToken;
    settingsRef.current.voiceId = preferences?.voiceId ?? "";
    settingsRef.current.onPreferencesChange = onPreferencesChange;
  });

  const commit = useCallback((next: SpeechState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const update = useCallback(
    (changes: Partial<SpeechState>) => commit({ ...stateRef.current, ...changes }),
    [commit]
  );

  const highlight = useCallback((target: SpeechTarget | null) => {
    highlightedRef.current.forEach((element) => element.classList.remove(SPEECH_ACTIVE_CLASS));
    highlightedRef.current = target
      ? findSpeechTargets(document, target.messageId, target.field, target.line)
      : [];
    highlightedRef.current.forEach((element) => element.classList.add(SPEECH_ACTIVE_CLASS));
    // "nearest" scrolls only when the line is out of view, so reading along
    // never yanks the page around.
    highlightedRef.current[0]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, []);

  const followAudio = useCallback(
    (seconds: number) => {
      const track = trackRef.current;
      const marks = marksRef.current;
      if (!track || marks.length === 0) return;
      const index = activeMarkIndex(marks, seconds);
      if (index === markIndexRef.current) return;
      markIndexRef.current = index;
      highlight(
        index < 0
          ? null
          : { messageId: track.messageId, field: marks[index].field, line: marks[index].line }
      );
    },
    [highlight]
  );

  /** Silences everything and forgets the track. Leaves React state alone. */
  const halt = useCallback(() => {
    playIdRef.current += 1;
    engineRef.current = null;
    trackRef.current = null;
    marksRef.current = [];
    markIndexRef.current = -1;
    durationRef.current = 0;
    audioRef.current?.pause();
    if (canUseBrowserVoice()) window.speechSynthesis.cancel();
    highlight(null);
  }, [highlight]);

  const finish = useCallback(
    (notice: string | null = null) => {
      halt();
      commit({ ...IDLE, notice });
    },
    [halt, commit]
  );

  const getAudio = useCallback(() => {
    if (audioRef.current) return audioRef.current;

    const audio = new Audio();
    audio.preload = "auto";
    // The silent unlock clip fires these events too, so each handler only
    // acts while ElevenLabs narration is what's loaded.
    const narrating = () => engineRef.current === "elevenlabs" && trackRef.current !== null;
    audio.addEventListener("playing", () => {
      if (narrating()) update({ status: "playing" });
    });
    audio.addEventListener("pause", () => {
      if (narrating() && !audio.ended) update({ status: "paused" });
    });
    audio.addEventListener("timeupdate", () => {
      if (narrating()) followAudio(audio.currentTime);
    });
    audio.addEventListener("ended", () => {
      if (narrating()) finish();
    });
    audio.addEventListener("error", () => {
      if (!narrating()) return;
      // Most likely the signed link expired; fetch a fresh one next time.
      if (clipKeyRef.current) clipsRef.current.delete(clipKeyRef.current);
      finish("Couldn't play that audio. Try again.");
    });
    audioRef.current = audio;
    return audio;
  }, [update, followAudio, finish]);

  /**
   * Call from a click or key press. A browser only lets audio start later,
   * outside any user action, if the same element already played during one,
   * and a reply can take many seconds to arrive. So play a moment of silence
   * now, while the click still counts.
   */
  const unlock = useCallback(() => {
    if (unlockedRef.current || engineRef.current || typeof window === "undefined") return;
    const audio = getAudio();
    audio.src = silentAudioDataUri();
    audio
      .play()
      .then(() => {
        unlockedRef.current = true;
      })
      .catch(() => {
        // Not inside a user action after all; the next click tries again.
      });
    if (canUseBrowserVoice()) {
      // iOS applies the same rule to the browser's voice.
      const primer = new SpeechSynthesisUtterance(" ");
      primer.volume = 0;
      window.speechSynthesis.speak(primer);
    }
  }, [getAudio]);

  const fetchClip = useCallback((messageId: number, scope: SpeechScope) => {
    const { idToken: token, voiceId } = settingsRef.current;
    const key = `${messageId}:${scope}:${voiceId}`;
    clipKeyRef.current = key;

    const stored = clipsRef.current.get(key);
    if (stored && Date.now() - stored.fetchedAt < CLIP_REUSE_MS) {
      return Promise.resolve(stored.clip);
    }
    // A second click while the first request is still out shares it.
    let request = requestsRef.current.get(key);
    if (!request) {
      request = speechAPI
        .getClip(messageId, scope, token)
        .then((clip) => {
          if (clip.kind === "audio") clipsRef.current.set(key, { clip, fetchedAt: Date.now() });
          return clip;
        })
        .finally(() => {
          requestsRef.current.delete(key);
        });
      requestsRef.current.set(key, request);
    }
    return request;
  }, []);

  const playAudio = useCallback(
    (url: string, marks: SpeechMark[], duration: number | null, playId: number) => {
      const audio = getAudio();
      engineRef.current = "elevenlabs";
      marksRef.current = marks;
      durationRef.current = duration ?? 0;
      // Loading a new source resets playbackRate to defaultPlaybackRate.
      audio.defaultPlaybackRate = settingsRef.current.rate;
      audio.src = url;
      audio.playbackRate = settingsRef.current.rate;
      update({ engine: "elevenlabs" });
      audio.play().catch((error) => {
        if (playId !== playIdRef.current || !trackRef.current) return;
        // Usually autoplay refusing because the tap that started this was too
        // long ago. Stay paused, so one tap on play carries on.
        console.warn("Narration is waiting for a tap:", error);
        update({ status: "paused" });
      });
    },
    [getAudio, update]
  );

  const playWithBrowserVoice = useCallback(
    (units: SpeechUnit[], reason: string, track: SpeechTrack, playId: number) => {
      if (!canUseBrowserVoice()) {
        finish("This browser can't read aloud.");
        return;
      }
      const synth = window.speechSynthesis;
      synth.cancel();
      engineRef.current = "browser";

      // One utterance per line: Chrome quietly cuts off long utterances after
      // about 15 seconds, and each line's start event says what to highlight.
      units.forEach((unit, index) => {
        const utterance = new SpeechSynthesisUtterance(unit.text);
        utterance.rate = settingsRef.current.rate;
        utterance.onstart = () => {
          if (playId === playIdRef.current) {
            highlight({ messageId: track.messageId, field: unit.field, line: unit.line });
          }
        };
        utterance.onerror = (event) => {
          // "interrupted" and "canceled" mean this code stopped it on purpose.
          if (playId !== playIdRef.current) return;
          if (event.error !== "interrupted" && event.error !== "canceled") finish();
        };
        if (index === units.length - 1) {
          utterance.onend = () => {
            if (playId === playIdRef.current) finish();
          };
        }
        synth.speak(utterance);
      });

      commit({ track, status: "playing", engine: "browser", notice: browserVoiceNotice(reason) });
    },
    [finish, highlight, commit]
  );

  const play = useCallback(
    async (messageId: number, scope: SpeechScope) => {
      halt();
      previewRef.current?.pause();
      const playId = playIdRef.current;
      unlock();

      const track = { messageId, scope };
      trackRef.current = track;
      commit({ track, status: "loading", engine: null, notice: null });

      try {
        const clip = await fetchClip(messageId, scope);
        if (playId !== playIdRef.current) return;
        if (clip.kind === "audio") playAudio(clip.url, clip.marks, clip.duration, playId);
        else playWithBrowserVoice(clip.units, clip.reason, track, playId);
      } catch (error) {
        if (playId !== playIdRef.current) return;
        console.error("Narration failed:", error);
        finish("Couldn't read that aloud. Try again.");
      }
    },
    [halt, unlock, commit, fetchClip, playAudio, playWithBrowserVoice, finish]
  );

  const stop = useCallback(() => {
    halt();
    previewRef.current?.pause();
    const audio = audioRef.current;
    if (audio?.getAttribute("src")) {
      // Drop the source so the browser stops downloading it.
      audio.removeAttribute("src");
      audio.load();
    }
    commit(IDLE);
  }, [halt, commit]);

  const toggle = useCallback(
    (messageId: number, scope: SpeechScope) => {
      const { track, status, engine } = stateRef.current;
      if (!track || track.messageId !== messageId || track.scope !== scope) {
        void play(messageId, scope);
      } else if (status === "loading") {
        stop();
      } else if (engine === "browser" && canUseBrowserVoice()) {
        if (status === "playing") window.speechSynthesis.pause();
        else window.speechSynthesis.resume();
        update({ status: status === "playing" ? "paused" : "playing" });
      } else if (audioRef.current) {
        if (status === "playing") audioRef.current.pause();
        else audioRef.current.play().catch(() => update({ status: "paused" }));
      }
    },
    [play, stop, update]
  );

  const seek = useCallback(
    (seconds: number) => {
      const audio = audioRef.current;
      if (!audio || engineRef.current !== "elevenlabs") return;
      audio.currentTime = Math.max(0, seconds);
      // Move the highlight now rather than on the next timeupdate.
      followAudio(audio.currentTime);
    },
    [followAudio]
  );

  const subscribeToProgress = useCallback(
    (listener: (progress: SpeechProgress) => void) => {
      const audio = getAudio();
      const report = () => {
        const known = Number.isFinite(audio.duration) && audio.duration > 0;
        listener({
          current: audio.currentTime,
          duration: known ? audio.duration : durationRef.current,
        });
      };
      PROGRESS_EVENTS.forEach((name) => audio.addEventListener(name, report));
      report();
      return () => PROGRESS_EVENTS.forEach((name) => audio.removeEventListener(name, report));
    },
    [getAudio]
  );

  const setRate = useCallback((next: number) => {
    setRateState(next);
    settingsRef.current.rate = next;
    const audio = audioRef.current;
    if (audio) {
      audio.defaultPlaybackRate = next;
      audio.playbackRate = next;
    }
    // The browser voice fixes each line's rate when the line is queued, so
    // there a change applies from the next narration.
    settingsRef.current.onPreferencesChange({ speechRate: next });
  }, []);

  const setVoiceEnabled = useCallback(
    (enabled: boolean) => {
      if (!enabled) stop();
      settingsRef.current.onPreferencesChange({ voiceEnabled: enabled });
    },
    [stop]
  );

  const previewVoice = useCallback(
    (url: string) => {
      stop();
      const preview = new Audio(url);
      previewRef.current = preview;
      preview.play().catch((error) => console.warn("Voice preview failed:", error));
    },
    [stop]
  );

  // The saved speed arrives with the user, after the first render.
  useEffect(() => {
    const saved = preferences?.speechRate;
    if (!saved || saved === settingsRef.current.rate) return;
    setRateState(saved);
    settingsRef.current.rate = saved;
    if (audioRef.current) {
      audioRef.current.defaultPlaybackRate = saved;
      audioRef.current.playbackRate = saved;
    }
  }, [preferences?.speechRate]);

  // A notice with nothing playing is a one-off message; clear it after a moment.
  useEffect(() => {
    if (!state.notice || state.track) return;
    const timer = setTimeout(() => update({ notice: null }), NOTICE_MS);
    return () => clearTimeout(timer);
  }, [state.notice, state.track, update]);

  // Signing out ends narration, and so does leaving the page.
  useEffect(() => {
    if (!idToken && stateRef.current.track) stop();
  }, [idToken, stop]);

  useEffect(
    () => () => {
      halt();
      previewRef.current?.pause();
    },
    [halt]
  );

  return useMemo(
    () => ({
      state,
      rate,
      voiceEnabled,
      play,
      toggle,
      stop,
      unlock,
      setRate,
      setVoiceEnabled,
      previewVoice,
      seek,
      subscribeToProgress,
    }),
    [
      state,
      rate,
      voiceEnabled,
      play,
      toggle,
      stop,
      unlock,
      setRate,
      setVoiceEnabled,
      previewVoice,
      seek,
      subscribeToProgress,
    ]
  );
}

// Playback icons are drawn inline (shapes from the Solar set the rest of the
// app loads through Iconify). Iconify downloads icons on first use, and an
// icon that fails to arrive here leaves a blank, unusable control.
const ICONS = {
  play: (
    <path
      fill="currentColor"
      d="M21.4086 9.35258C23.5305 10.5065 23.5305 13.4935 21.4086 14.6474L8.59662 21.6145C6.53435 22.736 4 21.2763 4 18.9671L4 5.0329C4 2.72368 6.53435 1.26402 8.59661 2.38548L21.4086 9.35258Z"
    />
  ),
  pause: (
    <g fill="currentColor">
      <path d="M2 6C2 4.11438 2 3.17157 2.58579 2.58579C3.17157 2 4.11438 2 6 2C7.88562 2 8.82843 2 9.41421 2.58579C10 3.17157 10 4.11438 10 6V18C10 19.8856 10 20.8284 9.41421 21.4142C8.82843 22 7.88562 22 6 22C4.11438 22 3.17157 22 2.58579 21.4142C2 20.8284 2 19.8856 2 18V6Z" />
      <path d="M14 6C14 4.11438 14 3.17157 14.5858 2.58579C15.1716 2 16.1144 2 18 2C19.8856 2 20.8284 2 21.4142 2.58579C22 3.17157 22 4.11438 22 6V18C22 19.8856 22 20.8284 21.4142 21.4142C20.8284 22 19.8856 22 18 22C16.1144 22 15.1716 22 14.5858 21.4142C14 20.8284 14 19.8856 14 18V6Z" />
    </g>
  ),
  volume: (
    <g fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M1.53479 10.9714C1.60847 9.76255 1.64531 9.15814 1.95854 8.57679C2.24473 8.04563 2.7923 7.53042 3.33988 7.27707C3.93921 6.99979 4.62617 6.99979 6.00008 6.99979C6.51215 6.99979 6.76819 6.99979 7.0162 6.95791C7.26138 6.9165 7.50046 6.84478 7.72795 6.74438C7.95806 6.64283 8.17181 6.50189 8.59932 6.22002L8.81825 6.07566C11.3612 4.39898 12.6327 3.56063 13.7001 3.92487C13.9047 3.9947 14.1028 4.09551 14.2797 4.21984C15.2024 4.86829 15.2725 6.37699 15.4127 9.3944C15.4646 10.5117 15.5 11.4679 15.5 11.9998C15.5 12.5317 15.4646 13.4879 15.4127 14.6052C15.2725 17.6226 15.2024 19.1313 14.2797 19.7797C14.1028 19.9041 13.9047 20.0049 13.7001 20.0747C12.6327 20.4389 11.3612 19.6006 8.81825 17.9239L8.59932 17.7796C8.17181 17.4977 7.95806 17.3567 7.72795 17.2552C7.50046 17.1548 7.26138 17.0831 7.0162 17.0417C6.76819 16.9998 6.51215 16.9998 6.00008 16.9998C4.62617 16.9998 3.93921 16.9998 3.33988 16.7225C2.7923 16.4692 2.24473 15.9539 1.95854 15.4228C1.64531 14.8414 1.60847 14.237 1.53479 13.0282C1.51299 12.6706 1.5 12.3222 1.5 11.9998C1.5 11.6774 1.51299 11.329 1.53479 10.9714Z" />
      <path strokeLinecap="round" d="M20 6C20 6 21.5 7.8 21.5 12C21.5 16.2 20 18 20 18" />
      <path strokeLinecap="round" d="M18 9C18 9 18.5 9.9 18.5 12C18.5 14.1 18 15 18 15" />
    </g>
  ),
  close: (
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      d="M6 6l12 12M18 6L6 18"
    />
  ),
};

function SpeechIcon({ name, className = "w-4 h-4" }: { name: keyof typeof ICONS; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`shrink-0 ${className}`} aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

function Spinner() {
  return (
    <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
  );
}

/**
 * Play, pause or resume one message's narration. Icon-only by default; pass a
 * label for a larger button such as "Narrate lesson".
 */
export function SpeakButton({
  messageId,
  scope,
  label,
  className = "",
}: {
  messageId?: number;
  scope: SpeechScope;
  label?: string;
  className?: string;
}) {
  const speech = useSpeech();
  if (!speech || messageId === undefined) return null;

  const { track } = speech.state;
  const isThisTrack = !!track && track.messageId === messageId && track.scope === scope;
  const status: SpeechStatus = isThisTrack ? speech.state.status : "idle";
  const action = {
    idle: label ?? "Read aloud",
    loading: "Cancel",
    playing: "Pause",
    paused: "Resume",
  }[status];
  const icon = status === "playing" ? "pause" : status === "paused" ? "play" : "volume";

  return (
    <button
      type="button"
      onClick={(event) => {
        // Lesson cards open when clicked; reading one aloud shouldn't.
        event.stopPropagation();
        speech.toggle(messageId, scope);
      }}
      aria-label={action}
      title={action}
      className={`shrink-0 flex items-center justify-center text-text-70 cursor-pointer transition-colors ${
        label
          ? "gap-1.5 h-8 px-3 rounded-full bg-base-10 hover:bg-base-20 text-sm font-medium"
          : "w-7 h-7 rounded-full hover:bg-base-10"
      } ${className}`}
    >
      {status === "loading" ? <Spinner /> : <SpeechIcon name={icon} />}
      {label && <span>{status === "loading" ? "Preparing…" : action}</span>}
    </button>
  );
}

/**
 * Floating controls while something is being read: play/pause, a timeline you
 * can drag, speed, and close. Credits ElevenLabs when its voice is playing.
 */
export function SpeechMiniPlayer() {
  const speech = useSpeech();
  const [progress, setProgress] = useState<SpeechProgress>({ current: 0, duration: 0 });

  const track = speech?.state.track ?? null;
  const hasTimeline = speech?.state.engine === "elevenlabs" && track !== null;
  const subscribeToProgress = speech?.subscribeToProgress;

  // Position updates re-render only this component, never the page.
  useEffect(() => {
    if (!hasTimeline || !subscribeToProgress) {
      setProgress({ current: 0, duration: 0 });
      return;
    }
    return subscribeToProgress(setProgress);
  }, [hasTimeline, subscribeToProgress, track?.messageId, track?.scope]);

  if (!speech) return null;
  const { state, rate } = speech;

  if (!track) {
    if (!state.notice) return null;
    return (
      <div
        role="status"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-4 py-2.5 rounded-full bg-container-primary border border-theme-border shadow-lg text-xs text-text-70"
      >
        {state.notice}
      </div>
    );
  }

  const isPlaying = state.status === "playing";
  const isLoading = state.status === "loading";
  const playLabel = isLoading ? "Cancel" : isPlaying ? "Pause" : "Resume";
  const nextRate =
    SPEECH_RATES[(SPEECH_RATES.findIndex((option) => option === rate) + 1) % SPEECH_RATES.length];
  const caption = isLoading
    ? "Preparing audio…"
    : state.engine === "browser"
      ? state.notice
      : "Voice by ElevenLabs";
  const canSeek = hasTimeline && progress.duration > 0;

  return (
    <div
      role="region"
      aria-label="Reading aloud"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[min(28rem,calc(100vw-2rem))] flex items-center gap-3 p-2 rounded-2xl bg-container-primary border border-theme-border shadow-lg text-primary-text"
    >
      <button
        type="button"
        onClick={() => speech.toggle(track.messageId, track.scope)}
        aria-label={playLabel}
        title={playLabel}
        className="w-9 h-9 shrink-0 rounded-full bg-primary-text text-secondary-text flex items-center justify-center cursor-pointer"
      >
        {isLoading ? <Spinner /> : <SpeechIcon name={isPlaying ? "pause" : "play"} className="w-3.5 h-3.5" />}
      </button>

      <div className="flex-1 min-w-0">
        {/* The browser's voice can't report a position or jump to one. */}
        {state.engine !== "browser" && (
          <div className="flex items-center gap-2 text-[11px] tabular-nums text-text-70">
            <span className="w-7 shrink-0 text-right">{formatClock(progress.current)}</span>
            <input
              type="range"
              min={0}
              max={progress.duration || 1}
              step={0.1}
              value={Math.min(progress.current, progress.duration)}
              onChange={(event) => speech.seek(Number(event.target.value))}
              disabled={!canSeek}
              aria-label="Reading position"
              aria-valuetext={`${formatClock(progress.current)} of ${formatClock(progress.duration)}`}
              className="flex-1 min-w-0 h-1 accent-primary-text cursor-pointer disabled:cursor-default disabled:opacity-40"
            />
            <span className="w-7 shrink-0">{formatClock(progress.duration)}</span>
          </div>
        )}
        <p className="text-[11px] text-text-70 truncate">{caption}</p>
      </div>

      <button
        type="button"
        onClick={() => speech.setRate(nextRate)}
        aria-label={`Reading speed ${rate}x. Click to change.`}
        title="Reading speed"
        className="h-8 min-w-11 shrink-0 px-2 rounded-full hover:bg-base-10 text-sm font-semibold tabular-nums cursor-pointer"
      >
        {rate}×
      </button>
      <button
        type="button"
        onClick={() => speech.stop()}
        aria-label="Stop reading and close"
        title="Stop reading and close"
        className="w-8 h-8 shrink-0 rounded-full text-text-70 hover:bg-base-10 hover:text-primary-text flex items-center justify-center cursor-pointer transition-colors"
      >
        <SpeechIcon name="close" />
      </button>
    </div>
  );
}
