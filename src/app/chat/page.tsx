"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { getGlassGradientBorderClass, getGlassGradientBorderClassInner, getGlassGradientBorderClassRainbow } from "../components/glassGradientBorder";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  Conversation,
  Exercise,
  MessageData,
  TokenData,
  User,
  UserPreferences,
} from "@/types/api";
import Lesson from "./lesson";
import LoginModal from "../components/LoginModal";
import UserProfilePopup from "../components/UserProfilePopup";
import SearchModal from "../components/SearchModal";
import UpgradeModal from "../components/UpgradeModal";
import { StreamingThoughts } from "../components/StreamingThoughts";
import { Icon } from "@iconify/react";
import { Markdown } from "@/lib/markdownParser";
import PaymentModal from "../components/PaymentModal";
import { useTheme } from "../components/ThemeProvider";
import FeedbackModal from "../components/FeedbackModal";
import ModalTemplate from "../components/ModalTemplate";

const TypewriterHero = () => {
  const lines = [
    "Code like it matters.",
    "Think deeper.",
    "Build better. No AI crutches.",
  ];

  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const typeSpeed = 50;
    const deleteSpeed = 30;
    const pauseAfterLine = 800;
    const pauseAfterComplete = 2500;
    const pauseBeforeDelete = 1500;

    if (isPaused) return;

    const currentLine = lines[currentLineIndex];

    // Typing phase
    if (!isDeleting && currentCharIndex <= currentLine.length) {
      const timeout = setTimeout(() => {
        const newLines = [...displayedLines];
        newLines[currentLineIndex] = currentLine.slice(0, currentCharIndex);
        setDisplayedLines(newLines);

        if (currentCharIndex === currentLine.length) {
          // Finished typing current line
          if (currentLineIndex < lines.length - 1) {
            // Move to next line after pause
            setIsPaused(true);
            setTimeout(() => {
              setCurrentLineIndex(currentLineIndex + 1);
              setCurrentCharIndex(0);
              setIsPaused(false);
            }, pauseAfterLine);
          } else {
            // All lines typed, pause then start deleting
            setIsPaused(true);
            setTimeout(() => {
              setIsDeleting(true);
              setIsPaused(false);
            }, pauseAfterComplete);
          }
        } else {
          setCurrentCharIndex(currentCharIndex + 1);
        }
      }, typeSpeed);

      return () => clearTimeout(timeout);
    }

    // Deleting phase
    if (isDeleting) {
      const totalChars = displayedLines.join("").length;

      if (totalChars === 0) {
        // All deleted, restart
        setIsPaused(true);
        setTimeout(() => {
          setIsDeleting(false);
          setCurrentLineIndex(0);
          setCurrentCharIndex(0);
          setDisplayedLines([]);
          setIsPaused(false);
        }, pauseBeforeDelete);
        return;
      }

      const timeout = setTimeout(() => {
        const newLines = [...displayedLines];
        // Find last non-empty line and remove a character
        for (let i = newLines.length - 1; i >= 0; i--) {
          if (newLines[i] && newLines[i].length > 0) {
            newLines[i] = newLines[i].slice(0, -1);
            if (newLines[i].length === 0 && i > 0) {
              newLines.pop();
            }
            break;
          } else if (i > 0) {
            newLines.pop();
          }
        }
        setDisplayedLines(newLines);
      }, deleteSpeed);

      return () => clearTimeout(timeout);
    }
  }, [
    currentCharIndex,
    currentLineIndex,
    isDeleting,
    isPaused,
    displayedLines,
    lines,
  ]);

  // Determine which line should show the cursor
  const getCursorLineIndex = () => {
    if (isDeleting) {
      for (let i = displayedLines.length - 1; i >= 0; i--) {
        if (displayedLines[i] && displayedLines[i].length > 0) return i;
      }
      return 0;
    }
    return currentLineIndex;
  };

  const cursorLineIndex = getCursorLineIndex();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      {lines.map((line, index) => {
        const Tag = index === 0 ? "h1" : "h2";
        const displayedText = displayedLines[index] || "";
        const showCursor = index === cursorLineIndex;

        return (
          <Tag
            key={index}
            className={`text-5xl monospace md:text-6xl font-light text-base-30 ${index < lines.length - 1 ? "mb-4" : ""}`}
          >
            {displayedText}
            {showCursor && (
              <motion.span
                className="inline-block w-8 h-12 mb-1 md:h-14 bg-base-30 ml-1 align-middle"
                animate={{ opacity: [0.8, 0, 0.8] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </Tag>
        );
      })}
    </motion.div>
  );
};

const ThoughtDropdown = ({ thought }: { thought: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Count the number of steps by counting bold headers (lines starting with **)
  const stepCount = useMemo(() => {
    const matches = thought.match(/\*\*[^*]+\*\*/g);
    return matches ? matches.length : 1;
  }, [thought]);

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-base-40 cursor-pointer hover:text-text-70 transition-colors"
      >
        <motion.svg
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-3 h-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </motion.svg>
        <span className="font-medium">
          Thought for {stepCount} step{stepCount !== 1 ? "s" : ""}
        </span>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden scrollbar-hide"
          >
            <div className="mt-3 pl-5 border-l-2 border-base-20 text-sm text-text-70 space-y-3 max-h-64 overflow-y-auto scrollbar-hide">
              <Markdown>{thought}</Markdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const AIResponse = ({
  message,
  previousMessage,
  setSelectedLesson,
}: {
  message: MessageData;
  previousMessage: string;
  setSelectedLesson: (lesson: {
    originalMessage: string;
    response: MessageData;
  }) => void;
}) => {
  const { resolvedTheme } = useTheme();
  const jsonData = message?.json;

  if (!jsonData || Object.keys(jsonData).length === 0 || !message) {
    return (
      <div className="bg-base-10 border border-theme-border rounded-2xl p-3">
        <div className="text-sm text-text-90">
          <Markdown compact>{message?.text as string}</Markdown>
        </div>
      </div>
    );
  }

  const lessonGlassBorder = getGlassGradientBorderClassInner(
    resolvedTheme,
    "rounded-xl",
  );

  return (
    <div
      onClick={() =>
        setSelectedLesson({
          originalMessage: previousMessage,
          response: message,
        })
      }
      className={`
        cursor-pointer bg-container-primary border border-base-10 rounded-2xl
      `}
    >
      <div className={`p-3 bg-backdrop rounded-2xl`}>
        {/* Breakdown */}
        <h1 className="text-xl text-primary-text mb-3 font-semibold">
          {jsonData.lessonTitle ??
            (jsonData as any).lesson_title ??
            "No Title Available"}
        </h1>

        {message.thought && <ThoughtDropdown thought={message.thought} />}

        {jsonData.breakdown && (
          <p className="text-sm text-primary-text mb-3 font-regular">
            {jsonData.breakdown}
          </p>
        )}

        {/* Lesson Content Card */}
        {(jsonData.exercises || jsonData.recommendedReadings) && (
          <div
            className={`p-px ${lessonGlassBorder.outerBorderRadiusClass} ${lessonGlassBorder.gradientClass}`}
          >
            <div
              className="bg-gradient-to-b from-container-primary to-background  p-4"
              style={lessonGlassBorder.innerBorderRadiusStyle}
            >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-primary-text uppercase">
                Lesson
              </span>
              <button className="text-primary-text hover:text-primary-text">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {/* Exercises/Activities */}
            {jsonData.exercises && jsonData.exercises.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-primary-text mb-2 flex items-center gap-1">
                  <span>🎯</span> Activities
                </h4>
                <div className="space-y-2">
                  {jsonData.exercises.map((exercise, index) => (
                    <div
                      key={index}
                      className="p-3 bg-base-5 rounded-lg border border-base-10"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="font-medium text-sm mb-1">
                            {exercise.filename}
                          </div>
                          <p className="text-xs text-primary-text">
                            {exercise.text}
                          </p>
                        </div>
                        <div className="w-5 h-5 rounded-full border-2 border-theme-border flex-shrink-0"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Readings */}
            {jsonData.recommendedReadings &&
              jsonData.recommendedReadings.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-primary-text mb-2 flex items-center gap-1">
                    <span>📖</span> Reading
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {jsonData.recommendedReadings.map((reading, index) => (
                      <a
                        key={index}
                        href={reading.Url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-base-5 rounded-lg border border-base-10 p-3 hover:border-theme-border hover:shadow-sm transition-all group"
                      >
                        <h5 className="text-xs font-semibold text-primary-text mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {reading.title}
                        </h5>
                        <p className="text-xs text-primary-text mb-2 line-clamp-2">
                          {reading.sourceDescription}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-primary-text">
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>{reading.readingTime} min</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            <div>
              <h4 className="text-xs font-semibold text-primary-text my-2 flex items-center gap-1">
                <span>🏷️</span> Tags
              </h4>
              {jsonData.tags && jsonData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {jsonData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 bg-base-10 text-primary-text rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs font-regular text-text-90 uppercase mt-3">
                {new Date(message.created_at).toLocaleString().split(",")[0]}
              </p>
            </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to check if error is token-related
const isTokenError = (error: any): boolean => {
  const errorString =
    error?.response?.data?.detail || error?.message || JSON.stringify(error);
  return (
    errorString.includes("Token expired") ||
    errorString.includes("Token is invalid") ||
    errorString.includes("401") ||
    errorString.includes("Unauthorized")
  );
};

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [message, setMessage] = useState("");
  const [streamStage, setStreamStage] = useState<
    | "routing"
    | "routing_thought"
    | "instructor"
    | "instructor_thought"
    | "complete"
    | "error"
    | null
  >(null);
  const [thoughtStream, setThoughtStream] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [userPrompts, setUserPrompts] = useState<Map<number, string>>(
    new Map(),
  );
  const [lessonExpanded, setLessonExpanded] = useState(false);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [showSkeletonMinTime, setShowSkeletonMinTime] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"subscription" | "tokens">("subscription");
  const [showUserProfilePopup, setShowUserProfilePopup] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [bookmarkedExercises, setBookmarkedExercises] = useState<Exercise[]>(
    [],
  );
  const [bookmarksLoading, setBookmarksLoading] = useState(true);
  const [bookmarksExpanded, setBookmarksExpanded] = useState(false);
  const [difficultyIndex, setDifficultyIndex] = useState(0);
  const [chatMenuOpen, setChatMenuOpen] = useState(-1);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const showSubscriptionSuccessModal = false;
  const showTokenPurchaseSuccessModal = false;
  const showPlusBadge = false;
  const difficultyLevels = ["Beginner", "Novice", "Junior", "Senior"];
  const isDebouncing = useRef(false);

  const cycleDifficulty = useCallback(() => {
    if (isDebouncing.current) return;
    isDebouncing.current = true;
    setDifficultyIndex((prev) => (prev + 1) % difficultyLevels.length);
    setTimeout(() => {
      isDebouncing.current = false;
    }, 500);
  }, [difficultyLevels.length]);

  // Show login modal if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      setShowLoginModal(true);
    } else if (status === "authenticated" && session?.user?.email) {
      console.log("Authenticated user email:", session?.user?.email);
      console.log(status);
      setShowLoginModal(false);
      async function loadConversations() {
        try {
          const idToken = (session?.user as any)?.idToken;
          if (!idToken) {
            console.error("No idToken found in session");
            return;
          }

          // Fetch both in parallel, with minimum 1 second delay
          const [conversationsData, bookmarkedExercisesData] =
            await Promise.all([
              api.conversation.getConversations(
                session?.user?.email as string,
                idToken,
              ),
              api.conversation.getBookmarkedExercises(
                session?.user?.email as string,
                idToken,
              ),
              new Promise((resolve) => setTimeout(resolve, 1000)), // minimum 1 second
            ]);

          // Set both values at the same time
          setConversations(conversationsData);
          setBookmarkedExercises(bookmarkedExercisesData);
          setConversationsLoading(false);
          setBookmarksLoading(false);
        } catch (error: any) {
          setConversationsLoading(false);
          setBookmarksLoading(false);
          console.error("Error loading conversations:", error);
          if (isTokenError(error)) {
            await signOut({ redirect: false });
            // router.push("/login?error=session_expired");
          }
        }
      }
      loadConversations();
    }
  }, [status, router, session]);

  useEffect(() => {
    const loadUser = async () => {
      const idToken = (session?.user as any)?.idToken;
      if (session?.user?.email && idToken) {
        try {
          const response = await api.user.getUser(session.user.email, idToken);
          console.log("user response: ", { response });
          setUser(response);
          // Fetch token usage
          const tokenUsage = await api.user.getTokenUsage(
            session.user.email,
            idToken,
          );
          setTokenData(tokenUsage);
        } catch (error) {
          const response = await api.user.createUser(
            {
              username: session.user.name || session.user.email?.split("@")[0],
              email: session.user.email as string,
              method: "google",
            },
            idToken,
          );
          setUser(response);
          // Fetch token usage for new user
          try {
            const tokenUsage = await api.user.getTokenUsage(
              session.user.email,
              idToken,
            );
            setTokenData(tokenUsage);
          } catch (e) {
            console.error("Failed to fetch token usage:", e);
          }
        }
      }
    };
    loadUser();
  }, [session?.user?.email]);

  // Global Ctrl+K listener for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
        setSearchQuery("");
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        setConversationId(null);
        setMessages([]);
        setLessonExpanded(false);
        setSelectedLesson(null);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleConversationClick = async (conversation: Conversation) => {
    try {
      console.log("Selected conversation:", conversation);
      const messagesData = await api.conversation.getConversationMessages(
        Number(conversation.id),
        (session?.user as any)?.idToken,
      );
      setConversationId(Number(conversation.id));
      setMessages(messagesData);
      setSelectedLesson(null);
      setLessonExpanded(false);
      setUserPrompts(new Map());
    } catch (error: any) {
      console.error("Error loading conversation messages:", error);
      if (isTokenError(error)) {
        await signOut({ redirect: false });
        // router.push("/login?error=session_expired");
      }
    }
  };

  const handleBookmarkedExerciseClick = async (exercise: any) => {
    // Start loading with minimum 1 second display
    setLessonLoading(true);
    setShowSkeletonMinTime(true);
    const minTimePromise = new Promise<void>((resolve) =>
      setTimeout(() => {
        setShowSkeletonMinTime(false);
        resolve();
      }, 1000),
    );

    try {
      const idToken = (session?.user as any)?.idToken;
      if (!idToken) {
        console.error("No idToken found");
        setLessonLoading(false);
        return;
      }

      // Fetch the conversation messages using the conversation id from the exercise
      const conversationId = exercise.message__conversation_id;
      console.log("Conversation ID:", conversationId);
      const messagesData = await api.conversation.getConversationMessages(
        conversationId,
        idToken,
      );

      // Find the message that contains this exercise
      const exerciseMessage = messagesData.find(
        (msg: MessageData) => msg.id === exercise.message_id,
      );

      if (exerciseMessage) {
        // Set the conversation context
        setConversationId(conversationId);
        setMessages(messagesData);

        // Find the user's prompt (previous message from user)
        const messageIndex = messagesData.findIndex(
          (msg: MessageData) => msg.id === exercise.message_id,
        );
        const userPrompt =
          messageIndex > 0 ? messagesData[messageIndex - 1]?.text || "" : "";

        // Wait for minimum time before showing the lesson
        await minTimePromise;

        // Set the selected lesson with the exercise message
        setSelectedLesson({
          originalMessage: userPrompt,
          response: exerciseMessage,
        });

        // Expand the lesson view
        setLessonExpanded(true);
      } else {
        console.error("Exercise message not found in conversation");
        await minTimePromise;
      }
    } catch (error: any) {
      console.error("Error loading bookmarked exercise:", error);
      await minTimePromise;
      if (isTokenError(error)) {
        await signOut({ redirect: false });
      }
    } finally {
      setLessonLoading(false);
    }
  };

  const handleBookmarkChange = (
    exerciseId: number,
    bookmarked: boolean,
    exerciseData: any,
  ) => {
    if (bookmarked) {
      // Add to bookmarked exercises list
      setBookmarkedExercises((prev) => {
        // Check if already exists
        if (prev.some((ex: any) => ex.id === exerciseId)) {
          return prev;
        }
        return [...prev, exerciseData];
      });
    } else {
      // Remove from bookmarked exercises list
      setBookmarkedExercises((prev) =>
        prev.filter((ex: any) => ex.id !== exerciseId),
      );
    }
  };

  const sendMessage = async () => {
    if (status === "unauthenticated") {
      setShowLoginModal(true);
      return;
    }

    const scrollToBottom = () => {
      const chatContainer = document.getElementById("chat-container");
      if (chatContainer) {
        chatContainer.scrollTo({
          top: chatContainer.scrollHeight,
          behavior: "smooth",
        });
      }
    };

    // Scroll after a small delay to allow the new message to render
    setTimeout(scrollToBottom, 100);

    if (!message.trim() || !session?.user?.email) {
      console.error("Missing message or session");
      return;
    }

    const currentMessage = message;
    setLoading(true);
    try {
      const idToken = (session.user as any)?.idToken;

      if (!idToken) {
        console.error("No idToken found in session");
        setLoading(false);
        return;
      }
      setMessages([
        ...messages,
        {
          isSending: true,
          text: currentMessage,
          fromUser: true,
          conversation: 0,
          modelUsed: "gemini-2.5-pro",
          json: null,
          created_at: new Date().toISOString(),
        },
      ]);

      // Use streaming API
      const response = await api.message.sendMessageStreaming(
        {
          created_at: new Date().toISOString(),
          text: currentMessage,
          conversation: conversationId,
          from_user: true,
          model_used: "placeholder",
          json: {},
          experience_level: difficultyLevels[difficultyIndex],
        },
        (event) => {
          // Update stage
          setStreamStage(event.stage);

          // Handle thought streams - append new thoughts
          if (
            event.stage === "routing_thought" ||
            event.stage === "instructor_thought"
          ) {
            setThoughtStream((prev) => prev + (event.data as string));
          }

          // Clear thoughts when moving from routing to instructor
          if (event.stage === "instructor") {
            setThoughtStream("");
          }
        },
        idToken,
      );

      if (
        response.json &&
        response.json.exercises &&
        response.json.exercises.length > 0
      ) {
        setSelectedLesson({
          originalMessage: currentMessage,
          response: response,
        });
      }

      console.log({ response });

      if (conversationId === null && response.conversation) {
        setConversationId(Number(response.conversation));
        console.log("Covnersation ID set to:", response.conversation);
      }

      const messagesData = await api.conversation.getConversationMessages(
        response.conversation,
        (session?.user as any)?.idToken,
      );

      console.log({ messagesData });

      setMessages(messagesData);

      // Scroll to bottom after response arrives
      setTimeout(() => {
        const chatContainer = document.getElementById("chat-container");
        if (chatContainer) {
          chatContainer.scrollTo({
            top: chatContainer.scrollHeight,
            behavior: "smooth",
          });
        }
      }, 100);

      // Track user prompt for this lesson
      const newPrompts = new Map(userPrompts);
      newPrompts.set(messagesData.length - 1, currentMessage);
      setUserPrompts(newPrompts);

      setMessage(""); // Clear the input
    } catch (error: any) {
      console.error("Error sending message:", error);

      // Remove the "sending" message on error
      setMessages(messages.filter((m) => !m.isSending));

      if (isTokenError(error)) {
        await signOut({ redirect: false });
        // router.push("/login?error=session_expired");
      } else {
        // Show error message to user
        alert("Failed to send message. Please try again.");
      }
    } finally {
      setLoading(false);
      setStreamStage(null);
      setThoughtStream("");
    }
  };

  const handleUserProfileClick = () => {
    if (status === "unauthenticated") {
      setShowLoginModal(true);
      return;
    } else {
      setShowUserMenu(!showUserMenu);
    }
  };

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  const onEditUser = async (updatedUserData: {
    username?: string;
    email?: string;
    method?: string;
    preferences?: UserPreferences;
  }) => {
    const email = user?.email || session?.user?.email;
    const idToken = (session?.user as any)?.idToken;
    if (email && idToken) {
      await api.user.updateUser(
        session?.user?.email as string,
        updatedUserData,
        idToken,
      );

      setShowUserProfilePopup(false);

      // Refresh user data
      const response = await api.user.getUser(email, idToken);
      setUser(response);
    }
  };

  const chatMenuDropdown = (conversationId: number) => {
    setChatMenuOpen(conversationId);
  };

  const openSearch = () => {
    setSearchOpen(true);
    setSearchQuery("");
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        canClose={false}
        onClose={() => setShowLoginModal(false)}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={closeSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        conversations={conversations}
        bookmarkedExercises={bookmarkedExercises}
        onSelectConversation={(conversation) => {
          handleConversationClick(conversation);
          closeSearch();
        }}
        onSelectExercise={(exercise) => {
          handleBookmarkedExerciseClick(exercise);
          closeSearch();
        }}
      />

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSelectPro={() => {
          setShowUpgradeModal(false);
          setPaymentMode("subscription");
          setShowPaymentModal(true);
        }}
        onSelectTokens={() => {
          setShowUpgradeModal(false);
          setPaymentMode("tokens");
          setShowPaymentModal(true);
        }}
        currentPlan={user?.membership}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        idToken={(session?.user as any)?.idToken}
        membership={user?.membership}
        subscriptionActive={user?.subscriptionActive}
        userEmail={user?.email || ""}
        setUser={(user) => setUser(user)}
        setTokenData={setTokenData}
        initialMode={paymentMode}
      />

      {/* User Profile Popup */}
      <UserProfilePopup
        isOpen={showUserProfilePopup}
        closePopup={() => setShowUserProfilePopup(false)}
        user={user}
        onEditUser={onEditUser}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        userEmail={user?.email}
        idToken={(session?.user as any)?.idToken}
      />

      {/* Subscription Success Modal */}
      <ModalTemplate
        isOpen={showSubscriptionSuccessModal}
        onClose={() => {}}
        title="Subscription Active"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-8"
        >
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
            <Icon icon="solar:check-circle-bold" className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-lg font-medium text-primary-text mb-1">Purchase successful</h3>
          <p className="text-sm text-text-60 text-center">
            Your subscription is now active and Plus features are unlocked.
          </p>
        </motion.div>
      </ModalTemplate>

      {/* TODO: Implement token purchase success modal */}
      <ModalTemplate
        isOpen={showTokenPurchaseSuccessModal}
        onClose={() => {}}
        title="Tokens Added"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-8"
        >
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
            <Icon icon="solar:check-circle-bold" className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-lg font-medium text-primary-text mb-1">Purchase successful</h3>
          <p className="text-sm text-text-60 text-center">
            Your additional tokens are now available to use.
          </p>
        </motion.div>
      </ModalTemplate>

      <aside className="w-64 border-r border-theme-border flex flex-col">
        <div className="p-2 flex flex-row border-b border-theme-border">
          <div
            onClick={() => router.push("/")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <img src="/logo.png" alt="Logo" className={`w-8 h-8`} />
          </div>
        </div>
        <div className="relative flex-1 overflow-y-auto">
          <div className="sticky top-0 left-0 right-0 z-20 px-4 py-3 flex flex-col items-center gap-2">
            <button
              onClick={openSearch}
              className="cursor-pointer w-full flex flex-row items-center gap-2 bg-opaque-button hover:bg-opaque-button-hover transition-colors duration-300 shadow-[inset_0_0_0px_30px_rgba(244,244,244,0.03)] backdrop-blur-lg overflow-hidden border border-button-border hover:border-button-border-hover rounded-2xl p-3 mx-auto"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                className="text-currentColor"
              >
                <g
                  fill="none"
                  fillRule="evenodd"
                  stroke="currentColor"
                  strokeWidth={0}
                >
                  <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
                  <path
                    fill="currentColor"
                    d="M10.5 2a8.5 8.5 0 1 0 5.262 15.176l3.652 3.652a1 1 0 0 0 1.414-1.414l-3.652-3.652A8.5 8.5 0 0 0 10.5 2M4 10.5a6.5 6.5 0 1 1 13 0a6.5 6.5 0 0 1-13 0"
                  />
                </g>
              </svg>
              <span className="text-sm text-currentColor m-0 font-medium tracking-wide">
                Search
              </span>
              <div className="text-base-40 absolute top-0 bottom-0 right-0 flex items-center justify-center px-2">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-background border border-button-border rounded text-[10px] font-medium">
                    Ctrl
                  </kbd>
                  <kbd className="px-1.5 py-0.5 bg-background border border-button-border rounded text-[10px] font-medium">
                    K
                  </kbd>
                </span>
              </div>
            </button>
            <button
              onClick={() => {
                setConversationId(null);
                setMessages([]);
                setLessonExpanded(false);
                setSelectedLesson(null);
              }}
              className="cursor-pointer w-full flex flex-row items-center gap-2 bg-opaque-button hover:bg-opaque-button-hover transition-colors duration-300 shadow-[inset_0_0_0px_30px_rgba(244,244,244,0.03)] backdrop-blur-lg overflow-hidden border border-button-border hover:border-button-border-hover rounded-2xl p-3 text-primary-text mx-auto"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={20}
                height={20}
                viewBox="0 0 24 24"
                className="text-currentColor"
              >
                <g
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                >
                  <path d="M10.371 4.25H8.25a5 5 0 0 0-5 5v6.5a5 5 0 0 0 5 5h6.5a5 5 0 0 0 5-5v-2.121"></path>
                  <path d="M12.299 14.75a1.86 1.86 0 0 0 1.316-.545l6.59-6.59a1.86 1.86 0 0 0 0-2.633l-1.187-1.187a1.86 1.86 0 0 0-2.633 0l-6.59 6.59a1.86 1.86 0 0 0-.545 1.316v3.049z"></path>
                </g>
              </svg>
              <span className="text-sm text-currentColor m-0 font-medium tracking-wide">
                New Chat
              </span>
            </button>
          </div>

          {bookmarkedExercises.length > 0 && (
            <div className="px-4 py-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Bookmarked Exercises
              </h3>
              <div className="space-y-1">
                {bookmarksLoading ? (
                  // Loading skeletons
                  <>
                    {[0, 1].map((idx) => (
                      <div
                        key={idx}
                        className="w-full p-2 rounded-lg animate-pulse"
                      >
                        <div className="flex flex-col w-full gap-2">
                          <div className="h-3 bg-base-10 rounded w-3/4"></div>
                          <div className="flex gap-1">
                            <div className="h-5 bg-base-10 rounded w-12"></div>
                            <div className="h-5 bg-base-10 rounded w-16"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    {(bookmarksExpanded
                      ? bookmarkedExercises
                      : bookmarkedExercises.slice(0, 2)
                    ).map((exercise: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => handleBookmarkedExerciseClick(exercise)}
                        className="w-full group flex items-center gap-2 p-2 rounded-lg hover:bg-base-5 cursor-pointer text-left duration-200 ease-in-out"
                      >
                        <div className="flex flex-col w-full">
                          <span className="text-xs text-currentColor font-medium overflow-wrap break-words whitespace-pre-wrap">
                            {exercise.title || `Exercise ${exercise.id}`}
                          </span>
                          {exercise.tags && exercise.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {exercise.tags.slice(0, 3).map((tag: string) => (
                                <span
                                  key={tag}
                                  className="text-xs px-2 py-0.5 bg-base-10 text-base-40 rounded group-hover:bg-base-5 transition-colors duration-200"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                    {bookmarkedExercises.length > 2 && (
                      <div>
                        <p
                          onClick={() =>
                            setBookmarksExpanded(!bookmarksExpanded)
                          }
                          className="text-xs text-base-40 font-regular hover:text-base-30 mt-2 cursor-pointer underline text-center transition-colors duration-200"
                        >
                          {bookmarksExpanded ? "View Less" : "View More"}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Pinned Section */}
          {conversations.filter((c) => c.pinned).length > 0 && (
            <div className="px-4 py-3">
              <h3 className="text-xs font-semibold text-base-40 uppercase mb-2 flex items-center gap-1.5">
                Pinned
              </h3>
              <div className="space-y-1">
                {conversations
                  .filter((c) => c.pinned)
                  .map((conversation: Conversation, index: number) => (
                    <div
                      key={`pinned-${index}`}
                      onClick={() => handleConversationClick(conversation)}
                      className="relative p-2 rounded-lg hover:bg-base-5 group cursor-pointer duration-200 ease-in-out"
                    >
                      <div className="flex flex-row justify-between items-center">
                        <div className="text-sm text-currentColor font-medium mb-1">
                          {conversation.title}
                        </div>
                        <div
                          onMouseEnter={() =>
                            chatMenuDropdown(Number(conversation.id))
                          }
                          onMouseLeave={() => setChatMenuOpen(-1)}
                          className="relative"
                        >
                          <div className="text-xs text-base-40 hover:text-base-30 cursor-pointer transition-colors duration-200">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                            >
                              <path
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 12a1 1 0 1 0 2 0 1 1 0 1 0-2 0m7 0a1 1 0 1 0 2 0 1 1 0 1 0-2 0m7 0a1 1 0 1 0 2 0 1 1 0 1 0-2 0"
                              ></path>
                            </svg>
                          </div>
                          {/* Delete and Unpin buttons */}
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{
                              display:
                                chatMenuOpen === Number(conversation.id)
                                  ? "flex"
                                  : "none",
                              opacity:
                                chatMenuOpen === Number(conversation.id)
                                  ? 1
                                  : 0,
                              y:
                                chatMenuOpen === Number(conversation.id)
                                  ? 0
                                  : -10,
                            }}
                            transition={{
                              type: "spring",
                              damping: 10,
                              stiffness: 300,
                            }}
                            className="absolute top-6 right-0 z-50 flex gap-2"
                          >
                            <motion.div
                              initial={{ x: 10, y: -2 }}
                              animate={{
                                x:
                                  chatMenuOpen === Number(conversation.id)
                                    ? 0
                                    : 10,
                                y:
                                  chatMenuOpen === Number(conversation.id)
                                    ? -2
                                    : -2,
                              }}
                              transition={{
                                x: {
                                  type: "spring",
                                  damping: 10,
                                  stiffness: 300,
                                },
                                y: {
                                  type: "spring",
                                  damping: 10,
                                  stiffness: 300,
                                },
                                scale: { duration: 0.1 },
                              }}
                              onClick={async (e) => {
                                e.stopPropagation();
                                setChatMenuOpen(-1);
                                await api.conversation.pinConversation(
                                  Number(conversation.id),
                                  (session?.user as any)?.idToken,
                                );
                                if (user?.email) {
                                  const idToken = (session?.user as any)
                                    ?.idToken;
                                  const conversationsData =
                                    await api.conversation.getConversations(
                                      user.email,
                                      idToken,
                                    );
                                  setConversations(conversationsData);
                                }
                              }}
                              className="bg-container-secondary border border-base-5 text-currentColor backdrop-blur-md rounded-full p-2 cursor-pointer transition-colors"
                            >
                              <Icon
                                icon="octicon:pin-slash-16"
                                className="w-4 h-4"
                              />
                            </motion.div>
                            <motion.div
                              transition={{ scale: { duration: 0.1 } }}
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (user?.email) {
                                  setChatMenuOpen(-1);
                                  await api.conversation.deleteConversation(
                                    Number(conversation.id),
                                    (session?.user as any)?.idToken,
                                  );
                                  const idToken = (session?.user as any)
                                    ?.idToken;
                                  const conversationsData =
                                    await api.conversation.getConversations(
                                      user.email,
                                      idToken,
                                    );
                                  setConversations(conversationsData);
                                }
                              }}
                              className="bg-red-500 text-white backdrop-blur-md border border-black/10 rounded-full p-2 cursor-pointer"
                            >
                              <Icon
                                icon="octicon:trash-16"
                                className="w-4 h-4"
                              />
                            </motion.div>
                          </motion.div>
                        </div>
                      </div>
                      {conversation.exercises_count &&
                        (conversation?.exercises_correct_count ?? 0) +
                          (conversation?.exercises_almost_count ?? 0) >
                          0 && (
                          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden flex mb-2">
                            {conversation.exercises_correct_count &&
                              conversation.exercises_correct_count > 0 && (
                                <div
                                  className="bg-emerald-500 h-full"
                                  style={{
                                    width: `${(conversation.exercises_correct_count / conversation.exercises_count) * 100}%`,
                                  }}
                                />
                              )}
                            {conversation.exercises_almost_count &&
                              conversation.exercises_almost_count > 0 && (
                                <div
                                  className="bg-amber-400 h-full"
                                  style={{
                                    width: `${(conversation.exercises_almost_count / conversation.exercises_count) * 100}%`,
                                  }}
                                />
                              )}
                          </div>
                        )}
                      <div className="flex flex-wrap gap-1">
                        {conversation?.tags &&
                          conversation?.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {conversation.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-xs px-2 py-0.5 bg-base-10 text-base-40 rounded group-hover:bg-base-5 transition-colors duration-200"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        {conversation?.tags &&
                          conversation?.tags?.length > 2 && (
                            <span className="text-xs text-base-40">
                              + {conversation.tags.length - 2} more
                            </span>
                          )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Regular Chats Section */}
          <div className="px-4 py-3 flex-1">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Chats
            </h3>
            <div className="space-y-1">
              {conversationsLoading ? (
                // Loading skeletons
                <>
                  {[0, 1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className="w-full p-2 rounded-lg animate-pulse"
                    >
                      <div className="flex flex-col w-full gap-2">
                        <div className="h-4 bg-base-10 rounded w-2/3"></div>
                        <div className="flex gap-1">
                          <div className="h-5 bg-base-10 rounded w-14"></div>
                          <div className="h-5 bg-base-10 rounded w-12"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : conversations.length <= 0 ? (
                <div className="w-full rounded-lg">
                  <div className="flex flex-col w-full gap-2">
                    <span className="text-xs text-base-40 font-regular">
                      Your chats will show up here
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  {conversations
                    .filter((c) => !c.pinned)
                    .map((conversation: Conversation, index: number) => (
                      <div
                        key={`chat-${index}`}
                        onClick={() => handleConversationClick(conversation)}
                        className="relative p-2 rounded-lg hover:bg-base-5 group cursor-pointer duration-200 ease-in-out"
                      >
                        <div className="flex flex-row justify-between items-center">
                          <div className="text-sm text-currentColor font-medium mb-1">
                            {conversation.title}
                          </div>
                          <div
                            onMouseEnter={() =>
                              chatMenuDropdown(Number(conversation.id))
                            }
                            onMouseLeave={() => setChatMenuOpen(-1)}
                            className="relative"
                          >
                            <div className="text-xs text-gray-400 hover:text-black cursor-pointer transition-colors duration-200">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  fill="none"
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M4 12a1 1 0 1 0 2 0 1 1 0 1 0-2 0m7 0a1 1 0 1 0 2 0 1 1 0 1 0-2 0m7 0a1 1 0 1 0 2 0 1 1 0 1 0-2 0"
                                ></path>
                              </svg>
                            </div>
                            {/* Delete and Pin buttons */}
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{
                                display:
                                  chatMenuOpen === Number(conversation.id)
                                    ? "flex"
                                    : "none",
                                opacity:
                                  chatMenuOpen === Number(conversation.id)
                                    ? 1
                                    : 0,
                                y:
                                  chatMenuOpen === Number(conversation.id)
                                    ? 0
                                    : -10,
                              }}
                              transition={{
                                type: "spring",
                                damping: 10,
                                stiffness: 300,
                              }}
                              className="absolute top-6 right-0 z-50 flex gap-2"
                            >
                              <motion.div
                                initial={{ x: 10, y: -2 }}
                                animate={{
                                  x:
                                    chatMenuOpen === Number(conversation.id)
                                      ? 0
                                      : 10,
                                  y:
                                    chatMenuOpen === Number(conversation.id)
                                      ? -2
                                      : -2,
                                }}
                                transition={{
                                  x: {
                                    type: "spring",
                                    damping: 10,
                                    stiffness: 300,
                                  },
                                  y: {
                                    type: "spring",
                                    damping: 10,
                                    stiffness: 300,
                                  },
                                  scale: { duration: 0.1 },
                                }}
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  setChatMenuOpen(-1);
                                  await api.conversation.pinConversation(
                                    Number(conversation.id),
                                    (session?.user as any)?.idToken,
                                  );
                                  if (user?.email) {
                                    const idToken = (session?.user as any)
                                      ?.idToken;
                                    const conversationsData =
                                      await api.conversation.getConversations(
                                        user.email,
                                        idToken,
                                      );
                                    setConversations(conversationsData);
                                  }
                                }}
                                className="bg-container-secondary border border-base-5 text-currentColor backdrop-blur-md rounded-full p-2 cursor-pointer transition-colors"
                              >
                                <Icon
                                  icon="octicon:pin-16"
                                  className="w-4 h-4"
                                />
                              </motion.div>
                              <motion.div
                                transition={{
                                  x: {
                                    type: "spring",
                                    damping: 10,
                                    stiffness: 300,
                                  },
                                  y: {
                                    type: "spring",
                                    damping: 10,
                                    stiffness: 300,
                                  },
                                  scale: { duration: 0.1 },
                                }}
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (user?.email) {
                                    setChatMenuOpen(-1);
                                    await api.conversation.deleteConversation(
                                      Number(conversation.id),
                                      (session?.user as any)?.idToken,
                                    );
                                    const idToken = (session?.user as any)
                                      ?.idToken;
                                    const conversationsData =
                                      await api.conversation.getConversations(
                                        user.email,
                                        idToken,
                                      );
                                    setConversations(conversationsData);
                                  }
                                }}
                                className="bg-red-500 text-white backdrop-blur-md border border-black/10 rounded-full p-2 cursor-pointer"
                              >
                                <Icon
                                  icon="octicon:trash-16"
                                  className="w-4 h-4"
                                />
                              </motion.div>
                            </motion.div>
                          </div>
                        </div>
                        {conversation.exercises_count &&
                          (conversation?.exercises_correct_count ?? 0) +
                            (conversation?.exercises_almost_count ?? 0) >
                            0 && (
                            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden flex mb-2">
                              {conversation.exercises_correct_count &&
                              conversation.exercises_correct_count > 0 ? (
                                <div
                                  className="bg-emerald-500 h-full"
                                  style={{
                                    width: `${(conversation.exercises_correct_count / conversation.exercises_count) * 100}%`,
                                  }}
                                />
                              ) : null}
                              {conversation.exercises_almost_count &&
                              conversation.exercises_almost_count > 0 ? (
                                <div
                                  className="bg-amber-400 h-full"
                                  style={{
                                    width: `${(conversation.exercises_almost_count / conversation.exercises_count) * 100}%`,
                                  }}
                                />
                              ) : null}
                            </div>
                          )}
                        <div className="flex flex-wrap gap-1">
                          {conversation?.tags &&
                            conversation?.tags?.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {conversation.tags.slice(0, 2).map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-xs px-2 py-0.5 bg-base-10 text-base-40 rounded group-hover:bg-base-5 transition-colors duration-200"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          {conversation?.tags &&
                            conversation?.tags?.length > 2 && (
                              <div className="flex flex-wrap gap-1">
                                <span className="text-xs text-base-40">
                                  + {conversation.tags.length - 3} more
                                </span>
                              </div>
                            )}
                        </div>
                      </div>
                    ))}
                </>
              )}
            </div>
          </div>
        </div>
        {/* User Profile */}
        <div className="p-2 border-t border-theme-border">
          {(() => {
            const tokenCardBorderRainbow = getGlassGradientBorderClassRainbow(resolvedTheme, "rounded-xl");
            const tokenCardBorder = getGlassGradientBorderClassInner(resolvedTheme, "rounded-xl");
            return (
              <div className={`w-full p-px mb-2 ${tokenCardBorderRainbow.outerBorderRadiusClass} ${tokenCardBorderRainbow.gradientClass}`}>
                <div
                  className="p-3 bg-container-primary"
                  style={tokenCardBorderRainbow.innerBorderRadiusStyle}
                >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-currentColor">
                    {tokenData
                      ? (
                          tokenData.token_limit - tokenData.token_used
                        ).toLocaleString()
                      : 0}
                  </span>
                  <span className="text-xs text-base-40">tokens remaining</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setShowUpgradeModal(true)} className="text-xs text-base-40 hover:text-base-60 underline cursor-pointer">Get more</button>
              </div>
            </div>
            {/* {tokenData && (
              <div className="mt-2">
                <div className="h-1.5 bg-violet-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(((tokenData.token_limit - tokenData.token_used) / tokenData.token_limit) * 100, 100)}%`,
                    }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-violet-400 to-purple-500"
                  />
                </div>
              </div>
            )} */}
                </div>
              </div>
            );
          })()}
          <div className="relative">
            {/* User Menu Dropdown */}
            <AnimatePresence>
              {showUserMenu && (
                <>
                  {/* Backdrop to close menu */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowUserMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute bottom-full left-0 right-0 mb-2 z-50 p-px shadow-lg ${getGlassGradientBorderClassInner(resolvedTheme, "rounded-xl").outerBorderRadiusClass} ${getGlassGradientBorderClassInner(resolvedTheme, "rounded-xl").gradientClass}`}
                  >
                    <div
                      className="bg-container-primary overflow-hidden"
                      style={getGlassGradientBorderClassInner(resolvedTheme, "rounded-xl").innerBorderRadiusStyle}
                    >
                      {/* Email */}
                      <div className="px-4 py-3 border-b border-theme-border">
                        <span className="text-sm text-text-60">{user?.email || session?.user?.email}</span>
                      </div>
                    
                      {/* Menu Items */}
                      <div className="py-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setShowUserProfilePopup(true);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-primary-text hover:bg-base-10 transition-colors"
                      >
                        <Icon icon="solar:settings-linear" className="w-5 h-5 text-text-60" />
                        <span>Settings</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setShowUpgradeModal(true);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-primary-text hover:bg-base-10 transition-colors"
                      >
                        <Icon icon="solar:arrow-up-linear" className="w-5 h-5 text-text-60" />
                        <span>Upgrade plan</span>
                      </button>
                      
                      {/* Theme Toggle */}
                      <button
                        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-primary-text hover:bg-base-10 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative w-5 h-5">
                            <motion.div
                              initial={false}
                              animate={{
                                scale: resolvedTheme === "dark" ? 1 : 0,
                                rotate: resolvedTheme === "dark" ? 0 : 90,
                                opacity: resolvedTheme === "dark" ? 1 : 0,
                              }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                              className="absolute inset-0"
                            >
                              <Icon icon="solar:moon-linear" className="w-5 h-5 text-text-60" />
                            </motion.div>
                            <motion.div
                              initial={false}
                              animate={{
                                scale: resolvedTheme === "light" ? 1 : 0,
                                rotate: resolvedTheme === "light" ? 0 : -90,
                                opacity: resolvedTheme === "light" ? 1 : 0,
                              }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                              className="absolute inset-0"
                            >
                              <Icon icon="solar:sun-linear" className="w-5 h-5 text-text-60" />
                            </motion.div>
                          </div>
                          <span>{resolvedTheme === "dark" ? "Dark mode" : "Light mode"}</span>
                        </div>
                        {/* Toggle Switch */}
                        <div className={`w-9 h-5 rounded-full relative transition-colors ${resolvedTheme === "dark" ? "bg-emerald-500" : "bg-base-20"}`}>
                          <motion.div
                            initial={false}
                            animate={{ x: resolvedTheme === "dark" ? 16 : 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
                          />
                        </div>
                      </button>
                      
                      {/* Feedback */}
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setShowFeedbackModal(true);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-primary-text hover:bg-base-10 transition-colors"
                      >
                        <Icon icon="solar:chat-round-dots-linear" className="w-5 h-5 text-text-60" />
                        <span>Feedback</span>
                      </button>
                      </div>
                    
                      {/* Logout */}
                      <div className="border-t border-theme-border py-1">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            signOut();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-primary-text hover:bg-base-10 transition-colors"
                        >
                          <Icon icon="solar:logout-2-linear" className="w-5 h-5 text-text-60" />
                          <span>Log out</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* User Profile Button */}
            <button
              className="w-full flex items-center gap-2 cursor-pointer hover:bg-base-5 rounded-lg p-2 transition-colors duration-200"
              onClick={handleUserProfileClick}
            >
              <div className="flex items-center gap-2">
                {user?.preferences?.profileImage ? (
                  <img
                    src={user.preferences.profileImage}
                    alt={session?.user?.name || "User"}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-loading flex items-center justify-center text-white text-sm font-semibold">
                    {user?.username?.charAt(0)?.toUpperCase() ||
                      session?.user?.name?.charAt(0)?.toUpperCase() ||
                      "U"}
                  </div>
                )}
                <div className="flex flex-col justify-start items-start">
                  <span className="text-sm font-medium">{user?.username}</span>
                  {/* TODO: Implement show plus badge logic */}
                  {(true || showPlusBadge) && (
                    <span className="mr-1 text-xs text-base-30 uppercase tracking-wide">
                      Pro
                    </span>
                  )}
                </div>
              </div>
            </button>
          </div>
        </div>
      </aside>

      {/* Middle - Lesson Window */}
      <main className="relative flex-1 bg-backdrop overflow-y-auto overflow-x-hidden scrollbar-hide">
        {selectedLesson ? (
          <Lesson
            setLessonExpanded={setLessonExpanded}
            message={selectedLesson.response}
            userPrompt={selectedLesson.originalMessage}
            lessonExpanded={lessonExpanded}
            abilityLevel={difficultyLevels[difficultyIndex]}
            tabSize={user?.preferences?.tabSize ?? 2}
            initialExpandedLesson={lessonExpanded}
            onBookmarkChange={handleBookmarkChange}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <TypewriterHero />
          </div>
        )}
      </main>

      {lessonExpanded && (
        <aside
          onClick={() => setLessonExpanded(false)}
          className="cursor-pointer border-l px-4 py-6 border-theme-border flex flex-col bg-base-10 overflow-hidden justify-start items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            className="text-primary-text opacity-40"
          >
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 21.25a9.25 9.25 0 1 0-8.307-5.177c.108.22.144.468.089.706l-.816 3.536a.6.6 0 0 0 .72.72l3.535-.817a1.06 1.06 0 0 1 .706.09A9.2 9.2 0 0 0 12 21.25M7.97 9.886h8.06m-8.06 4.228h5.748"
            ></path>
          </svg>
        </aside>
      )}

      {!lessonExpanded && (
        <aside className="w-96 border-l border-theme-border flex flex-col bg-base">
          <div
            className="flex-1 overflow-y-auto p-4 space-y-4"
            id="chat-container"
          >
            {messages.map((message: MessageData, index: number) => {
              return !!(message.fromUser || (message as any).from_user) ? (
                <div key={index} className="w-full flex justify-end">
                  <motion.div
                    className="w-fit bg-blue-100 rounded-2xl p-3 self-end"
                    animate={
                      message.isSending
                        ? {
                            opacity: [0.6, 1, 0.6],
                          }
                        : {
                            opacity: 1,
                            scale: 1,
                          }
                    }
                    transition={
                      message.isSending
                        ? {
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }
                        : {
                            duration: 0.2,
                          }
                    }
                  >
                    <div className="text-sm text-slate-900">
                      <Markdown compact>{message.text as string}</Markdown>
                    </div>
                  </motion.div>
                </div>
              ) : (
                <AIResponse
                  key={index}
                  message={message}
                  previousMessage={
                    messages[index - 1]?.text || "**NO PREVIOUS MESSAGE FOUND**"
                  }
                  setSelectedLesson={setSelectedLesson}
                />
              );
            })}
            <AnimatePresence mode="wait">
              {loading && streamStage && (
                <StreamingThoughts
                  key="streaming"
                  stage={streamStage}
                  thoughts={thoughtStream}
                />
              )}
            </AnimatePresence>
          </div>

          <div className="p-4 border-t border-theme-border">
            {(() => {
              const inputBorder = getGlassGradientBorderClassInner(resolvedTheme, "rounded-xl");
              return (
                <div className={`w-full h-20 mb-3 p-px ${inputBorder.outerBorderRadiusClass} ${inputBorder.gradientClass}`}>
                  <textarea
              rows={4}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              disabled={loading}
              className="w-full h-full p-3 bg-container-primary text-sm text-primary-text placeholder:text-text-40 resize-none outline-none"
              style={inputBorder.innerBorderRadiusStyle}
              placeholder="What's not working? Let's think it through."
                value={message}
              />
                </div>
              );
            })()}
            <div className="flex items-center gap-2">
              <button
                onClick={cycleDifficulty}
                className="cursor-pointer font-semibold px-4 py-1.5 rounded-full bg-base-10 text-text-70 text-sm hover:bg-base-20 transition-all overflow-hidden relative h-8 min-w-18"
              >
                <div className="flex items-center gap-1">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                      key={difficultyLevels[difficultyIndex]}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{
                        duration: 0.25,
                        ease: "easeInOut",
                        type: "spring",
                        damping: 10,
                        stiffness: 300,
                      }}
                    >
                      {difficultyLevels[difficultyIndex]}
                    </motion.div>
                  </AnimatePresence>
                  <Icon
                    icon="iconamoon:arrow-down-2-bold"
                    className="text-primary-text w-4 h-4"
                  />
                </div>
              </button>
              <button className="cursor-pointer font-semibold px-4 py-1.5 rounded-full bg-base-10 text-text-70 text-sm hover:bg-base-20 transition-all h-8 flex items-center">
                Gemini
              </button>
              <button
                onClick={sendMessage}
                disabled={loading || !message.trim()}
                className="ml-auto w-8 h-8 rounded-full bg-primary-text flex items-center justify-center hover:bg-gray-800 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    className="text-primary-text w-4 h-4"
                  >
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
