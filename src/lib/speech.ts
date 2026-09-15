/**
 * Narration helpers with no React in them: which timing mark is playing, which
 * elements show it, and a silent clip that unlocks audio playback.
 */
import type { SpeechMark } from "@/types/api";

export const SPEECH_RATES = [0.75, 1, 1.25, 1.5, 1.75, 2] as const;

/** Added to whatever is being read aloud; styled in globals.css. */
export const SPEECH_ACTIVE_CLASS = "speech-active";

/**
 * Index of the mark playing at `seconds`: the last one that has started, or
 * -1 before the first. Marks are sorted by start time and this runs on every
 * timeupdate event, so it is a binary search.
 */
export function activeMarkIndex(marks: SpeechMark[], seconds: number): number {
  let low = 0;
  let high = marks.length - 1;
  let found = -1;
  while (low <= high) {
    const middle = (low + high) >> 1;
    if (marks[middle].start <= seconds) {
      found = middle;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }
  return found;
}

/**
 * Elements showing one spoken line of a message, wherever that message is on
 * screen: a lesson can be showing in the chat and in the lesson panel at once.
 *
 * Markdown tags every block it renders with data-speech-line, so the matching
 * line is found. A field rendered as one plain element has no line tags, so
 * the whole element stands in for every line of it.
 */
export function findSpeechTargets(
  root: ParentNode,
  messageId: number,
  field: string,
  line: number
): Element[] {
  const targets: Element[] = [];
  root
    .querySelectorAll(`[data-speech-message="${messageId}"] [data-speech-field="${field}"]`)
    .forEach((fieldElement) => {
      const lines = fieldElement.querySelectorAll(`[data-speech-line="${line}"]`);
      if (lines.length > 0) {
        lines.forEach((element) => targets.push(element));
      } else if (!fieldElement.querySelector("[data-speech-line]")) {
        targets.push(fieldElement);
      }
    });
  return targets;
}

let silentClip: string | null = null;

/**
 * A 10 ms silent WAV as a data URI, built once. Playing it during a click
 * unlocks an audio element, so that element may play later without a click,
 * when a slow reply finally arrives. Safari blocks that otherwise.
 */
export function silentAudioDataUri(): string {
  if (silentClip) return silentClip;

  const sampleRate = 8000;
  const sampleCount = 80;
  const view = new DataView(new ArrayBuffer(44 + sampleCount));
  const writeText = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
  };

  writeText(0, "RIFF");
  view.setUint32(4, 36 + sampleCount, true);
  writeText(8, "WAVE");
  writeText(12, "fmt ");
  view.setUint32(16, 16, true); // format chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate, true); // bytes per second at 8-bit mono
  view.setUint16(32, 1, true); // bytes per sample frame
  view.setUint16(34, 8, true); // bits per sample
  writeText(36, "data");
  view.setUint32(40, sampleCount, true);
  for (let i = 0; i < sampleCount; i++) view.setUint8(44 + i, 128); // 8-bit silence sits at the midpoint

  let binary = "";
  new Uint8Array(view.buffer).forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  silentClip = `data:audio/wav;base64,${btoa(binary)}`;
  return silentClip;
}

/** Why the browser's voice is reading instead of ElevenLabs, in a few words. */
export function browserVoiceNotice(reason: string): string {
  switch (reason) {
    case "speech_daily_limit":
      return "Daily voice limit reached · browser voice";
    case "speech_budget_exhausted":
      return "Voice credits used up · browser voice";
    case "speech_too_long":
      return "Too long for premium voice · browser voice";
    default:
      return "Premium voice unavailable · browser voice";
  }
}
