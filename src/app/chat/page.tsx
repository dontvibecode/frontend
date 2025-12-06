"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Conversation, MessageData, User, UserPreferences } from "@/types/api";
import Lesson from "./lesson";
import LoginModal from "../components/LoginModal";
import UserProfilePopup from "../components/UserProfilePopup";

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
  const jsonData = message?.json;

  if (!jsonData || Object.keys(jsonData).length === 0 || !message) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-3">
        <p className="text-sm text-gray-700">{message?.text}</p>
      </div>
    );
  }

  return (
    <div
      onClick={() =>
        setSelectedLesson({
          originalMessage: previousMessage,
          response: message,
        })
      }
      className="cursor-pointer bg-white border border-gray-200 rounded-2xl p-3"
    >
      {/* Breakdown */}
      <h1 className="text-xl text-gray-700 mb-3 font-semibold">
        {jsonData.lessonTitle ??
          (jsonData as any).lesson_title ??
          "No Title Available"}
      </h1>
      {jsonData.breakdown && (
        <p className="text-sm text-gray-700 mb-3 font-regular">
          {jsonData.breakdown}
        </p>
      )}

      {/* Explanation */}
      {/* {jsonData.explanation && (
        <p className="text-sm text-gray-600 mb-4">
          {jsonData.explanation}
        </p>
      )} */}

      {/* Lesson Content Card */}
      {(jsonData.exercises || jsonData.recommendedReadings) && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase">
              Lesson
            </span>
            <button className="text-gray-400 hover:text-gray-600">
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
              <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <span>🎯</span> Activities
              </h4>
              <div className="space-y-2">
                {jsonData.exercises.map((exercise, index) => (
                  <div
                    key={index}
                    className="p-3 bg-white rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="font-medium text-sm mb-1">
                          {exercise.filename}
                        </div>
                        <p className="text-xs text-gray-600">{exercise.text}</p>
                      </div>
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0"></div>
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
                <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <span>📖</span> Reading
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {jsonData.recommendedReadings.map((reading, index) => (
                    <a
                      key={index}
                      href={reading.Url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white rounded-lg border border-gray-200 p-3 hover:border-gray-300 hover:shadow-sm transition-all group"
                    >
                      <h5 className="text-xs font-semibold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {reading.title}
                      </h5>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                        {reading.sourceDescription}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
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
        </div>
      )}
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
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [userPrompts, setUserPrompts] = useState<Map<number, string>>(
    new Map()
  );
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserProfilePopup, setShowUserProfilePopup] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  // Show login modal if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      setShowLoginModal(true);
    } else if (status === "authenticated" && session?.user?.email) {
      setShowLoginModal(false);
      async function loadConversations() {
        try {
          const idToken = (session?.user as any)?.idToken;
          if (!idToken) {
            console.error("No idToken found in session");
            return;
          }

          const conversationsData = await api.conversation.getConversations(
            session?.user?.email as string,
            idToken
          );
          setConversations(conversationsData);
          console.log("Conversations loaded:", conversationsData);
        } catch (error: any) {
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

  const handleConversationClick = async (conversation: Conversation) => {
    try {
      console.log("Selected conversation:", conversation);
      const messagesData = await api.conversation.getConversationMessages(
        Number(conversation.id),
        (session?.user as any)?.idToken
      );
      setConversationId(Number(conversation.id));
      setMessages(messagesData);
      setSelectedLesson(null);
      setUserPrompts(new Map());
    } catch (error: any) {
      console.error("Error loading conversation messages:", error);
      if (isTokenError(error)) {
        await signOut({ redirect: false });
        // router.push("/login?error=session_expired");
      }
    }
  };

  const sendMessage = async () => {
    if (status === "unauthenticated") {
      setShowLoginModal(true);
      return;
    }
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
        },
      ]);

      const response = await api.message.sendMessage(
        {
          text: currentMessage,
          conversation: conversationId,
          from_user: true,
          model_used: "gemini-2.5-pro",
          json: {},
          experience_level: "beginner",
        },
        idToken
      ); // Pass the idToken as second parameter

      // if(response.error) {
      //   setMessages([
      //     ...messages,
      //     { isSending: false, text: currentMessage, fromUser: true, conversation: 0, modelUsed: "gemini-2.5-pro", json: null },
      //     { isSending: false, text: response.error, fromUser: false, conversation: 0, modelUsed: "gemini-2.5-pro", json: null }
      //   ]);
      //   return;
      // }

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
        (session?.user as any)?.idToken
      );

      console.log({ messagesData });

      setMessages(messagesData);

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
    }
  };

  const handleUserProfileClick = () => {
    if (status === "unauthenticated") {
      setShowLoginModal(true);
      return;
    } else {
      setShowUserProfilePopup(true);
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
    await api.user.updateUser(
      session?.user?.email as string,
      updatedUserData,
      (session?.user as any)?.idToken
    );
    setShowUserProfilePopup(false);
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
      {/* User Profile Popup */}
      <UserProfilePopup
        isOpen={showUserProfilePopup}
        closePopup={() => setShowUserProfilePopup(false)}
        user={session?.user as User}
        onEditUser={onEditUser}
      />
      {/* Left Sidebar */}
      <aside className="w-64 border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-full" />
            <span className="font-semibold text-lg">dontvibe</span>
          </div>
        </div>

        {/* Sandbox Section */}
        <div className="px-4 py-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Sandbox
          </h3>
          <div className="space-y-1">
            <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
              <span className="text-sm">👍</span>
              <span className="text-sm">Sorting an array</span>
            </div>
            <div className="px-2 py-1">
              <div className="text-xs text-gray-500">C++ 4 exercises</div>
            </div>
            <div className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
              <span className="text-sm text-red-600">Debug type error</span>
              <div className="flex gap-1 mt-1">
                <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">
                  TypeScript
                </span>
                <span className="text-xs text-gray-500">1 exercise</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 flex-1 overflow-y-auto">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Chats
          </h3>
          <div className="space-y-1">
            {conversations.map((conversation: Conversation, index: number) => (
              <div
                key={index}
                onClick={() => handleConversationClick(conversation)}
                className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <div className="text-sm font-medium mb-1">
                  {conversation.title}
                </div>
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                    {conversation.lastActive}
                  </span>
                </div>
              </div>
            ))}
            <div className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
              <div className="text-sm font-medium mb-1">
                Chat app with friends
              </div>
              <div className="flex flex-wrap gap-1">
                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                  Cassandra
                </span>
                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                  Sockets
                </span>
                <span className="text-xs text-gray-500">+ 4 more</span>
              </div>
            </div>
            <div className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
              <div className="text-sm font-medium mb-1">
                Fitness Tracking App
              </div>
              <div className="flex flex-wrap gap-1">
                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                  Firebase
                </span>
                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                  Bluetooth APIs
                </span>
                <span className="text-xs text-gray-500">+ 2 more</span>
              </div>
            </div>
            <div className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
              <div className="text-sm font-medium mb-1">
                Event Ticketing Platform
              </div>
              <div className="flex flex-wrap gap-1">
                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                  Stripe
                </span>
                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                  Supabase
                </span>
                <span className="text-xs text-gray-500">+ 3 more</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-2 border-t border-gray-200">
          <button
            className="w-full flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded-lg p-2 transition-colors duration-200"
            onClick={handleUserProfileClick}
          >
            <div className="flex items-center gap-2">
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                  {session?.user?.name?.[0]?.toUpperCase() ||
                    session?.user?.email?.[0]?.toUpperCase() ||
                    "U"}
                </div>
              )}
              <span className="text-sm font-medium">
                {session?.user?.name ||
                  session?.user?.email?.split("@")[0] ||
                  "User"}
              </span>
            </div>
          </button>
        </div>
      </aside>

      {/* Middle - Lesson Window */}
      <main className="flex-1 p-4 bg-gray-50 overflow-y-auto scrollbar-hide">
        {selectedLesson ? (
          <Lesson
            message={selectedLesson.response}
            userPrompt={selectedLesson.originalMessage}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h1 className="text-5xl md:text-6xl font-bold text-gray-300 mb-4">
                Code like it matters.
              </h1>
              <h2 className="text-5xl md:text-6xl font-bold text-gray-300 mb-4">
                Think deeper.
              </h2>
              <h2 className="text-5xl md:text-6xl font-bold text-gray-300">
                Build better. No AI crutches.
              </h2>

              {/* Cursor Graphic */}
              <motion.div
                className="absolute top-1/2 left-1/2"
                animate={{
                  x: [-20, 20, -20],
                  y: [-20, 20, -20],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Image
                  src="/cursor.png"
                  alt="Cursor"
                  width={150}
                  height={150}
                  className="opacity-50"
                />
              </motion.div>
            </motion.div>
          </div>
        )}
      </main>

      <aside className="w-96 border-l border-gray-200 flex flex-col bg-white">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message: MessageData, index: number) => {
            return !!(message.fromUser || (message as any).from_user) ? (
              <div key={index} className="w-full flex justify-end">
                <motion.div
                  className="w-fit bg-gray-100 rounded-2xl p-3 self-end"
                  animate={
                    message.isSending
                      ? {
                          opacity: [0.6, 1, 0.6],
                          scale: [0.98, 1, 0.98],
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
                  <p className="text-sm text-gray-800">{message.text}</p>
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
        </div>

        <div className="p-4 border-t border-gray-200">
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
            className="w-full h-20 p-2 border border-gray-200 rounded-lg text-sm resize-none text-black placeholder-gray-400 disabled:bg-gray-50"
            placeholder="What's not working? Let's think it through."
            value={message}
          />
          <div className="flex items-center gap-2">
            <button className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition-all">
              Beginner
            </button>
            <button className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition-all">
              Gemini
            </button>
            <button
              onClick={sendMessage}
              disabled={loading || !message.trim()}
              className="ml-auto w-8 h-8 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
