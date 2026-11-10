import { useCallback, useEffect, useRef, useState } from "react";
import { lessonAPI } from "@/lib/api";
import { LessonData } from "@/types";

/**
 * Returns `value` only once it has stopped changing for `delayMs`, so typing
 * "recursion" sends one request instead of nine.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

type Status = "loading" | "loadingMore" | "idle" | "error";

/**
 * Shared lessons matching `query`, one page at a time.
 *
 * Every request for a query shares that query's AbortController, so when the
 * query changes, its first page and any "load more" still in flight are
 * cancelled and can't land on top of the new results.
 */
export function useSharedLessons(query: string, idToken?: string) {
  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!idToken) return;
    const controller = new AbortController();
    controllerRef.current = controller;
    setStatus("loading");

    lessonAPI
      .getSharedLessons({ query, idToken, signal: controller.signal })
      .then((page) => {
        setLessons(page.results);
        setNextCursor(page.nextCursor);
        setStatus("idle");
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus("error");
      });

    return () => controller.abort();
  }, [query, idToken]);

  const loadMore = useCallback(() => {
    const controller = controllerRef.current;
    if (!nextCursor || status !== "idle" || !idToken || !controller) return;
    setStatus("loadingMore");

    lessonAPI
      .getSharedLessons({
        query,
        cursor: nextCursor,
        idToken,
        signal: controller.signal,
      })
      .then((page) => {
        setLessons((previous) => [...previous, ...page.results]);
        setNextCursor(page.nextCursor);
        setStatus("idle");
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus("error");
      });
  }, [query, nextCursor, status, idToken]);

  return { lessons, status, hasMore: nextCursor !== null, loadMore };
}
