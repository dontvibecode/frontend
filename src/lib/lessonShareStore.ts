import { useSyncExternalStore } from "react";

/**
 * Whether each lesson is shared, keyed by lesson (message) id, so every
 * <ShareButton /> for the same lesson shows the same state without prop drilling.
 *
 * Server data enters through primeLessonShares when messages are fetched, not
 * when a button mounts: the lesson panel renders a message object captured at
 * click time, which can be older than a toggle the user has just made.
 */

const sharedByLessonId = new Map<number, boolean>();
const listenersByLessonId = new Map<number, Set<() => void>>();

function notify(lessonId: number) {
  listenersByLessonId.get(lessonId)?.forEach((listener) => listener());
}

export function setLessonShared(lessonId: number, shared: boolean) {
  if (sharedByLessonId.get(lessonId) === shared) return;
  sharedByLessonId.set(lessonId, shared);
  notify(lessonId);
}

export function primeLessonShares(
  messages: { id: number; shared?: boolean }[],
) {
  messages.forEach((message) =>
    setLessonShared(message.id, Boolean(message.shared)),
  );
}

function subscribe(lessonId: number, listener: () => void) {
  let listeners = listenersByLessonId.get(lessonId);
  if (!listeners) {
    listeners = new Set();
    listenersByLessonId.set(lessonId, listeners);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) listenersByLessonId.delete(lessonId);
  };
}

export function useLessonShared(lessonId: number, fallback = false) {
  return useSyncExternalStore(
    (listener) => subscribe(lessonId, listener),
    () => sharedByLessonId.get(lessonId) ?? fallback,
    () => fallback,
  );
}
