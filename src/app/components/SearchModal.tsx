"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getGlassGradientBorderClass } from "./glassGradientBorder";
import { useTheme } from "./ThemeProvider";

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
  const { resolvedTheme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLButtonElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

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

  // Scroll selected item into view
  useEffect(() => {
    if (selectedItemRef.current && resultsContainerRef.current) {
      selectedItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedIndex]);

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
            <div className={`w-full p-px mb-2 ${getGlassGradientBorderClass(resolvedTheme, "rounded-xl").outerBorderRadiusClass} ${getGlassGradientBorderClass(resolvedTheme, "rounded-xl").gradientClass} ${getGlassGradientBorderClass(resolvedTheme, "rounded-xl").outerBorderRadiusClass}`}>
              <div
                className="bg-container-primary shadow-2xl overflow-hidden"
                style={getGlassGradientBorderClass(resolvedTheme, "rounded-xl").innerBorderRadiusStyle}
              >
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-base-10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    className="text-text-70 flex-shrink-0"
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
                    className="flex-1 text-base text-primary-text placeholder-text-70 outline-none bg-transparent"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="p-1 hover:bg-base-5 cursor-pointer rounded transition-colors"
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
                <div ref={resultsContainerRef} className="max-h-[60vh] overflow-y-auto">
                  {searchQuery ? (
                    allResults.length > 0 ? (
                      <div className="p-2">
                        {filteredConversations.length > 0 && (
                          <div className="mb-2 flex flex-col gap-2">
                            <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              Conversations
                            </div>
                            {filteredConversations.map((conversation, idx) => {
                              const globalIdx = idx;
                              return (
                                <button
                                  key={conversation.id}
                                  ref={selectedIndex === globalIdx ? selectedItemRef : null}
                                  onClick={() => handleSelect({ ...conversation, resultType: "conversation" })}
                                  onMouseEnter={() => setSelectedIndex(globalIdx)}
                                  className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                                    selectedIndex === globalIdx
                                      ? "bg-base-5 text-primary-text"
                                      : "hover:bg-base-5 text-primary-text"
                                  }`}
                                >
                                  <div className={`
                                    w-8 h-8 rounded-xl bg-base-5 flex items-center justify-center flex-shrink-0
                                    ${selectedIndex === globalIdx ? "bg-base-10" : "bg-base-5"}
                                  `}>
                                    {selectedIndex === globalIdx ? (
                                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><g fill="none" fillRule="evenodd"><path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M12 2c.901 0 1.774.12 2.605.344a3 3 0 0 0 .425 5.495l.378.129a1 1 0 0 1 .624.624l.13.378a3 3 0 0 0 5.493.425A10 10 0 0 1 22 12c0 5.523-4.477 10-10 10H4a2 2 0 0 1-2-2v-8C2 6.477 6.477 2 12 2m0 12H9a1 1 0 1 0 0 2h3a1 1 0 1 0 0-2m3-4H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2m4-9a1 1 0 0 1 .946.677l.13.378c.3.879.99 1.57 1.87 1.87l.377.129a1 1 0 0 1 0 1.892l-.378.13c-.879.3-1.57.99-1.87 1.87l-.129.377a1 1 0 0 1-1.892 0l-.13-.378a3 3 0 0 0-1.87-1.87l-.377-.129a1 1 0 0 1 0-1.892l.378-.13c.879-.3 1.57-.99 1.87-1.87l.129-.377A1 1 0 0 1 19 1" strokeWidth="0.2" stroke="currentColor"/></g></svg>
                                    ): (
                                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><g fill="none"><path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M20 12q0-.452-.049-.89a1 1 0 0 1 1.988-.22Q22 11.437 22 12c0 5.523-4.477 10-10 10H4a2 2 0 0 1-2-2v-8C2 6.477 6.477 2 12 2q.563 0 1.11.06a1 1 0 0 1-.22 1.989A8 8 0 0 0 4 12v8h8a8 8 0 0 0 8-8m-8 2a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2zm3-4a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2zm4-9a1 1 0 0 1 .946.677l.13.378c.3.879.99 1.57 1.87 1.87l.377.129a1 1 0 0 1 0 1.892l-.378.13c-.879.3-1.57.99-1.87 1.87l-.129.377a1 1 0 0 1-1.892 0l-.13-.378a3 3 0 0 0-1.87-1.87l-.377-.129a1 1 0 0 1 0-1.892l.378-.13c.879-.3 1.57-.99 1.87-1.87l.129-.377l.062-.146A1 1 0 0 1 19 1m0 3.196a5 5 0 0 1-.804.804q.449.355.804.803q.356-.447.803-.803A5 5 0 0 1 19 4.196" strokeWidth="0.1" stroke="currentColor"/></g></svg>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{conversation.title}</div>
                                    {conversation.tags && conversation.tags.length > 0 && (
                                      <div className="flex gap-1 mt-0.5">
                                        {conversation.tags.slice(0, 3).map((tag: string) => (
                                          <span
                                            key={tag}
                                            className={`
                                              text-xs px-1.5 py-0.5 bg-base-10 text-text-70 group-hover:bg-base-10 rounded transition-colors duration-200
                                              ${selectedIndex === globalIdx
                                                ? "bg-base-10 text-primary-text"
                                                : "hover:bg-base-10 text-primary-text"}
                                            `}
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
                          <div className="flex flex-col gap-2">
                            <div className="px-3 text-xs font-semibold text-text-70 uppercase tracking-wide">
                              Bookmarked Exercises
                            </div>
                            {filteredExercises.map((exercise: any, idx: number) => {
                              const globalIdx = filteredConversations.length + idx;
                              return (
                                <button
                                  key={exercise.id || idx}
                                  ref={selectedIndex === globalIdx ? selectedItemRef : null}
                                  onClick={() => handleSelect({ ...exercise, resultType: "exercise" })}
                                  onMouseEnter={() => setSelectedIndex(globalIdx)}
                                  className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                                    selectedIndex === globalIdx
                                      ? "bg-base-5 text-primary-text"
                                      : "hover:bg-base-5 text-primary-text"
                                  }`}
                                >
                                  <div className={`
                                    w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0
                                    ${selectedIndex === globalIdx ? "bg-gray-200" : "bg-gray-100"}
                                  `}>
                                    {selectedIndex !== globalIdx ? (
                                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><g fill="none" fillRule="evenodd"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M4 5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v16.028c0 1.22-1.38 1.93-2.372 1.221L12 18.229l-5.628 4.02c-.993.71-2.372 0-2.372-1.22zm3-1a1 1 0 0 0-1 1v15.057l5.128-3.663a1.5 1.5 0 0 1 1.744 0L18 20.057V5a1 1 0 0 0-1-1z" strokeWidth="0.2" stroke="currentColor"/></g></svg>                                  
                                    ) : (
                                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><g fill="none"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M4 5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v16.028c0 1.22-1.38 1.93-2.372 1.221L12 18.229l-5.628 4.02c-.993.71-2.372 0-2.372-1.22z" strokeWidth="0.2" stroke="currentColor"/></g></svg>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{exercise.title || `Exercise ${exercise.id}`}</div>
                                    {exercise.tags && exercise.tags.length > 0 && (
                                      <div className="flex gap-1 mt-0.5">
                                        {exercise.tags.slice(0, 3).map((tag: string) => (
                                          <span
                                            key={tag}
                                            className={`
                                              text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 group-hover:bg-gray-200 rounded transition-colors duration-200
                                              ${selectedIndex === globalIdx
                                                ? "bg-gray-200 text-gray-700"
                                                : "hover:bg-gray-200 text-gray-700"}
                                            `}
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
                        <div className="text-text-70 mb-2">
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
                        <p className="text-text-70">No results found for "{searchQuery}"</p>
                      </div>
                    )
                  ) : recentSearches.length > 0 ? (
                    <div className="p-2">
                      <div className="flex items-center justify-between px-3 py-1.5">
                        <span className="text-xs font-semibold text-text-70 uppercase tracking-wide">
                          Recent Searches
                        </span>
                        <button
                          onClick={clearRecentSearches}
                          className="text-xs text-text-70 hover:text-text-70 transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                      {recentSearches.map((search, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSearchQuery(search)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-base-5 transition-colors text-primary-text"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="text-text-70">
                            <path fill="currentColor" d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89l.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7s-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.95 8.95 0 0 0 13 21a9 9 0 0 0 0-18" />
                          </svg>
                          <span>{search}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="py-16 text-center">
                      <p className="text-text-70">No recent searches</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="border-t border-base-10"></div>
                <div className="flex items-center justify-between px-4 py-3 bg-container-secondary m-2 rounded-xl">
                  <div className="flex items-center gap-4 text-xs text-text-70">
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-container-primary border border-base-10 rounded text-[10px] text-text-70 font-medium">esc</kbd>
                      <span>to close</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-text-70">
                    <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] text-gray-500 font-medium">↑</kbd>
                    <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] text-gray-500 font-medium">↓</kbd>
                      <span>to navigate</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
