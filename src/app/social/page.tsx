"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../components/ThemeProvider";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { useSession } from "next-auth/react";
import { LessonData } from "@/types";
import { Markdown } from "@/lib/markdownParser";
import { useDebouncedValue, useSharedLessons } from "@/lib/useSharedLessons";

const SEARCH_DEBOUNCE_MS = 300;

export default function SocialPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const { data: session, status: sessionStatus } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const [isThemeIconHovered, setIsThemeIconHovered] = useState(false);
  const isDarkMode = resolvedTheme === "dark";
  const currentModeIcon = isDarkMode ? "solar:moon-linear" : "solar:sun-linear";
  const hoverModeIcon = isDarkMode ? "solar:sun-linear" : "solar:moon-linear";

  const idToken = (session?.user as any)?.idToken;
  const debouncedQuery = useDebouncedValue(searchQuery.trim(), SEARCH_DEBOUNCE_MS);
  const { lessons, status, hasMore, loadMore } = useSharedLessons(
    debouncedQuery,
    idToken,
  );

  // Ctrl+K focuses the search box; Escape clears it.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape" && document.activeElement === searchInputRef.current) {
        setSearchQuery("");
        searchInputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch the next page when the marker below the grid nears the viewport.
  useEffect(() => {
    const marker = loadMoreRef.current;
    if (!marker || !hasMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: "400px" },
    );
    observer.observe(marker);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const isRefreshing = status === "loading" && lessons.length > 0;

  return (
    <div>
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-4 mx-1">
        <div className="flex items-center gap-4">
          <img
            src="/logo.png"
            alt="Logo"
            className="shadow-[0px_0px_50px_rgba(0,0,0,0.08)] w-10 h-10"
          />
          <button
            type="button"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            onMouseEnter={() => setIsThemeIconHovered(true)}
            onMouseLeave={() => setIsThemeIconHovered(false)}
            onFocus={() => setIsThemeIconHovered(true)}
            onBlur={() => setIsThemeIconHovered(false)}
            aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
            className="shadow-[0px_0px_50px_rgba(0,0,0,0.08)] group cursor-pointer px-2.5 py-2.5 rounded-full bg-invert-20 border border-base-10 text-primary-text backdrop-blur-lg hover:bg-primary-text hover:text-container-primary transition-colors"
          >
            <div className="relative w-5 h-5">
              <motion.div
                className="absolute inset-0"
                animate={{
                  opacity: isThemeIconHovered ? 0 : 1,
                  y: isThemeIconHovered ? -4 : 0,
                  scale: isThemeIconHovered ? 0.92 : 1,
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Icon
                  icon={currentModeIcon}
                  className="w-5 h-5 text-text-60 group-hover:text-container-primary transition-colors"
                />
              </motion.div>
              <motion.div
                className="absolute inset-0"
                animate={{
                  opacity: isThemeIconHovered ? 1 : 0,
                  y: isThemeIconHovered ? 0 : 4,
                  scale: isThemeIconHovered ? 1 : 0.92,
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Icon
                  icon={hoverModeIcon}
                  className="w-5 h-5 text-text-60 group-hover:text-container-primary transition-colors"
                />
              </motion.div>
            </div>
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/chat"
              className="shadow-[0px_0px_50px_rgba(0,0,0,0.08)] cursor-pointer px-5 pr-4 py-2.5 rounded-full bg-primary-text text-background transition-all flex items-center gap-2"
            >
              Log in
            </Link>
          </div>
        </div>
      </header>
      {/* <main className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="max-w-md text-center flex flex-col items-center"
        >
          <div className="mb-6 w-14 h-14 rounded-2xl bg-base-10 border border-base-10 flex items-center justify-center shadow-[0px_0px_50px_rgba(0,0,0,0.08)]">
            <Icon icon="solar:users-group-rounded-linear" className="w-7 h-7 text-text-70" />
          </div>
          <span className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-60">
            Coming soon
          </span>
          <h1 className="text-3xl font-semibold text-primary-text mb-3">
            Community lessons are on the way
          </h1>
          <p className="text-text-70 mb-8 leading-relaxed">
            Soon you&apos;ll be able to browse lessons other learners have shared,
            and fork them into your own chats. In the meantime, keep sharing
            yours from the chat.
          </p>
          <Link
            href="/"
            className="shadow-[0px_0px_50px_rgba(0,0,0,0.08)] px-5 py-2.5 rounded-full bg-primary-text text-background transition-all flex items-center gap-2"
          >
            Back to landing page
            <Icon icon="solar:arrow-right-linear" className="w-4 h-4" />
          </Link>
        </motion.div>
      </main> */}
      <main className="min-h-screen px-6 md:px-12 pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-xl mx-auto mb-10">
            <label className="flex items-center gap-3 px-4 py-3 rounded-full bg-base-10 border border-base-10 focus-within:border-base-30 transition-colors shadow-[0px_0px_50px_rgba(0,0,0,0.08)]">
              <Icon
                icon={
                  status === "loading" && searchQuery
                    ? "svg-spinners:ring-resize"
                    : "solar:magnifer-linear"
                }
                className="w-5 h-5 text-text-60 shrink-0"
              />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search community lessons"
                aria-label="Search community lessons"
                className="flex-1 bg-transparent outline-none text-primary-text placeholder:text-text-60"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="text-text-60 hover:text-primary-text cursor-pointer"
                >
                  <Icon icon="solar:close-circle-linear" className="w-5 h-5" />
                </button>
              ) : (
                <kbd className="hidden md:inline text-xs text-text-60 border border-base-20 rounded-md px-1.5 py-0.5">
                  Ctrl K
                </kbd>
              )}
            </label>
          </div>

          {sessionStatus === "unauthenticated" ? (
            <EmptyState
              icon="solar:lock-keyhole-linear"
              title="Log in to browse community lessons"
            />
          ) : status === "loading" && lessons.length === 0 ? (
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-64 rounded-2xl border border-base-10 bg-base-10 animate-pulse"
                />
              ))}
            </section>
          ) : status === "error" && lessons.length === 0 ? (
            <EmptyState
              icon="solar:danger-triangle-linear"
              title="Couldn't load lessons"
              body="Check your connection and try again."
            />
          ) : lessons.length === 0 ? (
            <EmptyState
              icon="solar:magnifer-linear"
              title={
                debouncedQuery
                  ? `No lessons match "${debouncedQuery}"`
                  : "No lessons shared yet"
              }
              body={
                debouncedQuery
                  ? "Try a shorter or different word."
                  : "Share one from the chat and it'll show up here."
              }
            />
          ) : (
            <section
              className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity ${
                isRefreshing ? "opacity-60" : ""
              }`}
            >
              {lessons.map((lesson) => (
                <LessonCard key={lesson.id} lesson={lesson} />
              ))}
            </section>
          )}

          <div ref={loadMoreRef} className="h-px" />
          {status === "loadingMore" && (
            <div className="flex justify-center py-8">
              <Icon icon="svg-spinners:ring-resize" className="w-6 h-6 text-text-60" />
            </div>
          )}
          {status === "error" && lessons.length > 0 && (
            <div className="flex justify-center py-8">
              <button
                type="button"
                onClick={loadMore}
                className="text-sm text-text-70 hover:text-primary-text cursor-pointer"
              >
                Couldn&apos;t load more. Try again
              </button>
            </div>
          )}
          {!hasMore && status === "idle" && lessons.length > 0 && (
            <p className="text-center text-sm text-text-60 py-8">
              You&apos;ve reached the end
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

function LessonCard({ lesson }: { lesson: LessonData }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col p-6 bg-background shadow-[0_0_60px_rgba(0,0,0,0.04)] rounded-2xl border border-base-10"
    >
      <h2 className="text-xl font-medium text-primary-text pb-4 mb-4 border-b border-base-10">
        {lesson.title ?? "Untitled lesson"}
      </h2>
      {lesson.breakdown && (
        <div className="leading-relaxed text-text-90 mb-4 line-clamp-5">
          <Markdown>{lesson.breakdown}</Markdown>
        </div>
      )}
      {lesson.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {lesson.tags.map((tag) => (
            <span
              key={tag}
              className="text-sm text-text-90 bg-base-10 px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="mt-auto flex items-center justify-between gap-4">
        {lesson.author && (
          <span className="text-sm text-text-60 truncate">by {lesson.author}</span>
        )}
        <button className="ml-auto bg-opaque-button px-4 py-2 rounded-full shadow-[0px_0px_50px_rgba(0,0,0,0.08)] hover:bg-opaque-button-hover transition-colors cursor-pointer">
          <span className="font-medium text-primary-text">Fork this lesson</span>
        </button>
      </div>
    </motion.article>
  );
}

function EmptyState({
  icon,
  title,
  body,
}: {
  icon: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="flex flex-col items-center text-center py-24">
      <div className="mb-4 w-12 h-12 rounded-2xl bg-base-10 flex items-center justify-center">
        <Icon icon={icon} className="w-6 h-6 text-text-70" />
      </div>
      <h2 className="text-lg font-medium text-primary-text mb-1">{title}</h2>
      {body && <p className="text-sm text-text-70">{body}</p>}
    </div>
  );
}
