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
import { Icon } from "@iconify/react";
import { speechAPI } from "@/lib/api";
import {
  SPEECH_ACTIVE_CLASS,
  SPEECH_RATES,
  activeMarkIndex,
  browserVoiceNotice,
  findSpeechTargets,
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
}

const IDLE: SpeechState = { track: null, status: "idle", engine: null, notice: null };
// Audio links are signed for six hours; reuse one for comfortably less.
const CLIP_REUSE_MS = 5 * 60 * 60 * 1000;
const NOTICE_MS = 5000;

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
    (url: string, marks: SpeechMark[], playId: number) => {
      const audio = getAudio();
      engineRef.current = "elevenlabs";
      marksRef.current = marks;
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
        if (clip.kind === "audio") playAudio(clip.url, clip.marks, playId);
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
    }),
    [state, rate, voiceEnabled, play, toggle, stop, unlock, setRate, setVoiceEnabled, previewVoice]
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
  const icon =
    status === "playing"
      ? "solar:pause-bold"
      : status === "paused"
        ? "solar:play-bold"
        : "solar:volume-loud-linear";

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
      {status === "loading" ? <Spinner /> : <Icon icon={icon} className="w-4 h-4" />}
      {label && <span>{status === "loading" ? "Preparing…" : action}</span>}
    </button>
  );
}

/** Floating controls while something is being read, with the ElevenLabs credit. */
export function SpeechMiniPlayer() {
  const speech = useSpeech();
  if (!speech) return null;

  const { state, rate } = speech;
  const { track } = state;
  if (!track && !state.notice) return null;

  const nextRate =
    SPEECH_RATES[(SPEECH_RATES.findIndex((option) => option === rate) + 1) % SPEECH_RATES.length];
  const caption =
    state.status === "loading"
      ? "Preparing audio…"
      : state.engine === "browser"
        ? state.notice
        : "Voice by ElevenLabs";

  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 py-1.5 pl-1.5 pr-4 rounded-full bg-container-primary border border-theme-border shadow-lg text-primary-text"
    >
      {track ? (
        <>
          <button
            type="button"
            onClick={() => speech.toggle(track.messageId, track.scope)}
            aria-label={
              state.status === "playing" ? "Pause" : state.status === "loading" ? "Cancel" : "Resume"
            }
            className="w-8 h-8 rounded-full bg-primary-text text-secondary-text flex items-center justify-center cursor-pointer"
          >
            {state.status === "loading" ? (
              <Spinner />
            ) : (
              <Icon
                icon={state.status === "playing" ? "solar:pause-bold" : "solar:play-bold"}
                className="w-4 h-4"
              />
            )}
          </button>
          <button
            type="button"
            onClick={() => speech.stop()}
            aria-label="Stop reading"
            className="w-8 h-8 rounded-full hover:bg-base-10 flex items-center justify-center cursor-pointer text-text-70"
          >
            <Icon icon="solar:stop-bold" className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => speech.setRate(nextRate)}
            aria-label={`Reading speed ${rate}x. Click to change.`}
            className="h-8 min-w-12 px-2 rounded-full hover:bg-base-10 text-sm font-semibold tabular-nums cursor-pointer"
          >
            {rate}×
          </button>
          <span className="ml-1 text-xs text-text-70 whitespace-nowrap">{caption}</span>
        </>
      ) : (
        <span className="px-2.5 py-1.5 text-xs text-text-70">{state.notice}</span>
      )}
    </div>
  );
}
