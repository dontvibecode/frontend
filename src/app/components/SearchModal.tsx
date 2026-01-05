"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchResult {
  id: string;
  title: string;
  type: "conversation" | "exercise" | "bookmark";
  tags?: string[];
  preview?: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  conversations?: any[];
  bookmarkedExercises?: any[];
  onSelectConversation?: (conversation: any) => void;
  onSelectExercise?: (exercise: any) => void;
}

export default function SearchModal({
  isOpen,
  onClose,
  searchQuery,
  setSearchQuery,
  conversations = [],
  bookmarkedExercises = [],
  onSelectConversation,
  onSelectExercise,
}: SearchModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Filter results based on search query
  const filteredConversations = conversations.filter(
    (c) =>
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tags?.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredExercises = bookmarkedExercises.filter(
    (e: any) =>
      e.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.tags?.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const allResults = [
    ...filteredConversations.map((c) => ({ ...c, resultType: "conversation" })),
    ...filteredExercises.map((e: any) => ({ ...e, resultType: "exercise" })),
  ];

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, allResults.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && allResults[selectedIndex]) {
        e.preventDefault();
        handleSelect(allResults[selectedIndex]);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, allResults]);

  const handleSelect = (result: any) => {
    // Save to recent searches
    if (searchQuery.trim()) {
      const updated = [searchQuery, ...recentSearches.filter((s) => s !== searchQuery)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
    }

    if (result.resultType === "conversation") {
      onSelectConversation?.(result);
    } else {
      onSelectExercise?.(result);
    }
    onClose();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.04, ease: "easeOut" }}
            className="fixed top-[10%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  className="text-gray-400 flex-shrink-0"
                >
                  <path
                    fill="currentColor"
                    d="M10.5 2a8.5 8.5 0 1 0 5.262 15.176l3.652 3.652a1 1 0 0 0 1.414-1.414l-3.652-3.652A8.5 8.5 0 0 0 10.5 2M4 10.5a6.5 6.5 0 1 1 13 0a6.5 6.5 0 0 1-13 0"
                  />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chats"
                  className="flex-1 text-base text-gray-900 placeholder-gray-400 outline-none bg-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M6.4 19L5 17.6l5.6-5.6L5 6.4L6.4 5l5.6 5.6L17.6 5L19 6.4L13.4 12l5.6 5.6l-1.4 1.4l-5.6-5.6z"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {/* Results Area */}
              <div className="max-h-[60vh] overflow-y-auto">
                {searchQuery ? (
                  allResults.length > 0 ? (
                    <div className="p-2">
                      {filteredConversations.length > 0 && (
                        <div className="mb-2">
                          <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Conversations
                          </div>
                          {filteredConversations.map((conversation, idx) => {
                            const globalIdx = idx;
                            return (
                              <button
                                key={conversation.id}
                                onClick={() => handleSelect({ ...conversation, resultType: "conversation" })}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                                  selectedIndex === globalIdx
                                    ? "bg-blue-50 text-blue-700"
                                    : "hover:bg-gray-50 text-gray-700"
                                }`}
                              >
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                                    <path
                                      fill="currentColor"
                                      d="M12 3c5.5 0 10 3.58 10 8s-4.5 8-10 8c-1.24 0-2.43-.18-3.53-.5C5.55 21 2 21 2 21c2.33-2.33 2.7-3.9 2.75-4.5C3.05 15.07 2 13.13 2 11c0-4.42 4.5-8 10-8"
                                    />
                                  </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate">{conversation.title}</div>
                                  {conversation.tags && conversation.tags.length > 0 && (
                                    <div className="flex gap-1 mt-0.5">
                                      {conversation.tags.slice(0, 3).map((tag: string) => (
                                        <span
                                          key={tag}
                                          className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  className="text-gray-300 flex-shrink-0"
                                >
                                  <path fill="currentColor" d="M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6l-6 6z" />
                                </svg>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {filteredExercises.length > 0 && (
                        <div>
                          <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Bookmarked Exercises
                          </div>
                          {filteredExercises.map((exercise: any, idx: number) => {
                            const globalIdx = filteredConversations.length + idx;
                            return (
                              <button
                                key={exercise.id || idx}
                                onClick={() => handleSelect({ ...exercise, resultType: "exercise" })}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                                  selectedIndex === globalIdx
                                    ? "bg-blue-50 text-blue-700"
                                    : "hover:bg-gray-50 text-gray-700"
                                }`}
                              >
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="text-blue-500">
                                    <path fill="currentColor" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                  </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate">{exercise.title || `Exercise ${exercise.id}`}</div>
                                  {exercise.tags && exercise.tags.length > 0 && (
                                    <div className="flex gap-1 mt-0.5">
                                      {exercise.tags.slice(0, 3).map((tag: string) => (
                                        <span
                                          key={tag}
                                          className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  className="text-gray-300 flex-shrink-0"
                                >
                                  <path fill="currentColor" d="M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6l-6 6z" />
                                </svg>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-16 text-center">
                      <div className="text-gray-400 mb-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="48"
                          height="48"
                          viewBox="0 0 24 24"
                          className="mx-auto opacity-50"
                        >
                          <path
                            fill="currentColor"
                            d="M10.5 2a8.5 8.5 0 1 0 5.262 15.176l3.652 3.652a1 1 0 0 0 1.414-1.414l-3.652-3.652A8.5 8.5 0 0 0 10.5 2M4 10.5a6.5 6.5 0 1 1 13 0a6.5 6.5 0 0 1-13 0"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-500">No results found for "{searchQuery}"</p>
                    </div>
                  )
                ) : recentSearches.length > 0 ? (
                  <div className="p-2">
                    <div className="flex items-center justify-between px-3 py-1.5">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Recent Searches
                      </span>
                      <button
                        onClick={clearRecentSearches}
                        className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                    {recentSearches.map((search, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSearchQuery(search)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-gray-50 transition-colors text-gray-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="text-gray-400">
                          <path fill="currentColor" d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89l.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7s-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.95 8.95 0 0 0 13 21a9 9 0 0 0 0-18" />
                        </svg>
                        <span>{search}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <p className="text-gray-400">No recent searches</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-100">
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] text-gray-500 font-medium">esc</kbd>
                    <span>to close</span>
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

