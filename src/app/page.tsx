"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Conversation,
  ExperienceLevel,
  InstructorResponse,
  MessageData,
  User,
  UserPreferences,
} from "@/types/api";
import ChatPrompt, { ChatBox } from "./components/ChatPrompt";
import ResponseUI from "./components/ResponseUI";
import SessionSkeleton from "./components/SessionSkeleton";
import UserProfilePopup from "./components/UserProfilePopup";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";

type RawConversation = {
  id: number;
  title: string;
  user: number;
  created_at: string;
  last_active: string;
};

type RawMessageData = {
  id: number;
  text: string;
  conversation: number;
  from_user: boolean;
  model_used: string;
  json: InstructorResponse | null;
};

export default function Home(): React.JSX.Element {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [message, setMessage] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [response, setResponse] = useState<MessageData | null>(null);
  const [experienceLevel, setExperienceLevel] =
    useState<ExperienceLevel>("Beginner");
  const [model, setModel] = useState<string>("gemini");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [title, setTitle] = useState<string>("");
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [userAndpreferencesLoaded, setUserAndPreferencesLoaded] =
    useState<boolean>(false);

  const [messages, setMessages] = useState<MessageData[]>([]);

  useEffect(() => {
    const loadUser = async () => {
      console.log({ user: session?.user });
      if (session?.user?.email) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}api/chat/user/${session.user.email}/`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Request-Headers": "*",
                Authorization: `Bearer ${(session.user as any).idToken}`,
              },
            }
          );
          console.log({ responseStatus: response.ok });
          if (response.ok) {
            const userWithPreferences = await response.json();
            console.log({ userWithPreferences });

            setUser(userWithPreferences);
            console.log(
              "User preferences loaded in main page:",
              userWithPreferences
            );
            setUserAndPreferencesLoaded(true);
          } else {
            const createdUser = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}api/chat/user/`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Access-Control-Request-Headers": "*",
                  Authorization: `Bearer ${(session.user as any).idToken}`,
                },
                body: JSON.stringify({
                  username:
                    session.user.name || session.user.email?.split("@")[0],
                  email: session.user.email,
                  method: "google",
                }),
              }
            );
            const userWithPreferences = await createdUser.json();
            setUser(userWithPreferences);
            console.log("New user created with email:", session.user.email);
          }
        } catch (error) {
          console.error("Error loading user preferences:", error);
          // Clear preferences if loading fails
          setUser(null);
          setUserAndPreferencesLoaded(false);
          router.push("/login?error=timeout");
        }
      } else if (status === "unauthenticated") {
        // Clear preferences when not authenticated
        setUser(null);
        setUserAndPreferencesLoaded(false);
        router.push("/login?error=timeout");
      }
    };
    loadUser();
  }, [session?.user?.email, status, router]);

  const fetchSessions = useCallback(async () => {
    if (user?.email) {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}api/chat/conversations/${user.email}/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Request-Headers": "*",
            Authorization: `Bearer ${(session?.user as any).idToken}`,
          },
        }
      );
      const data = await response.json();
      console.log({ data });
      const conversations: Conversation[] = data.map(
        (session: RawConversation) => ({
          id: session.id.toString(),
          title: session.title,
          lastActive: session.last_active,
        })
      );

      console.log("Sessions:", data);
      setConversations(conversations);
      setInitialLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions, user]);

  useEffect(() => {
    setTitle(
      conversations.find((s) => s.id === currentConversationId)?.title ||
        "New Chat"
    );
    console.log("Title set to:", title);
    console.log({ conversations });
    console.log({ currentConversationId });
  }, [currentConversationId, conversations]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    if (isSending) return;
    setIsSending(true);

    if (!message.trim()) return;

    try {
      console.log({ sessionBeforePost: session });
      const InstructorResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}api/chat/message/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Request-Headers": "*",
            Authorization: `Bearer ${(session?.user as any).idToken}`,
          },
          body: JSON.stringify({
            text: message.trim(),
            conversation: currentConversationId,
            from_user: true,
            model_used: "gemini-2.5-pro",
            json: {},
            experience_level: experienceLevel,
          }),
        }
      );

      if (!InstructorResponse.ok) {
        throw new Error(`HTTP error! status: ${InstructorResponse.status}`);
      }

      const InstructorResponseData = await InstructorResponse.json();
      
      const conversationId = InstructorResponseData.conversation.toString() || null;
      setCurrentConversationId(conversationId);
      
      console.log({ currentConversationId });
      // New logic: any number of messages
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}api/chat/conversations/messages/${conversationId}/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Request-Headers": "*",
            Authorization: `Bearer ${(session?.user as any).idToken}`,
          },
        }
      );
      const responseData: RawMessageData[] = await response.json();
      const data: MessageData[] = responseData.map(
        (message: RawMessageData) => ({
          text: message.text,
          conversation: message.conversation,
          fromUser: message.from_user,
          modelUsed: message.model_used,
          json: message.json,
        })
      );
      await fetchSessions();
      setMessages(data);
    } catch (error) {
      console.error("Error submitting message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ): void => {
    setMessage(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleConversationClick = async (convo: Conversation) => {
    console.log("Selected convo:", convo);
    setResponse(null);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}api/chat/conversations/messages/${convo.id}/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Request-Headers": "*",
          Authorization: `Bearer ${(session?.user as any).idToken}`,
        },
      }
    );
    const responseData: RawMessageData[] = await response.json();
    setCurrentConversationId(convo.id);
    const data: MessageData[] = responseData.map((message: RawMessageData) => ({
      text: message.text,
      conversation: message.conversation,
      fromUser: message.from_user,
      modelUsed: message.model_used,
      json: message.json,
    }));
    setMessages(data);
    fetchSessions();
  };


  const handleNewChat = (): void => {
    setMessages([]);
    setResponse(null);
    setCurrentConversationId(null);
  };

  const onEditUser = async (updatedUserData: {
    username?: string;
    email?: string;
    method?: string;
    preferences?: UserPreferences;
  }) => {
    try {
      console.log("Updating user with data:", JSON.stringify(updatedUserData));
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}api/chat/user/${user?.email}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Request-Headers": "*",
            Authorization: `Bearer ${(session?.user as any).idToken}`,
          },
          body: JSON.stringify(updatedUserData),
        }
      );
      console.log({ responseStatus: response.ok });
      if (response.ok) {
        const updatedUser = await response.json();
        console.log({ updatedUser });
        setUser(updatedUser);
        console.log("User updated in main page:", { updatedUser });
      } else {
        throw new Error("Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const userProfilePopup = useMemo(() => {
    if (user) {
      return (
        <UserProfilePopup
          isOpen={userAndpreferencesLoaded ? isProfilePopupOpen : false}
          user={user}
          closePopup={() => setIsProfilePopupOpen(false)}
          onEditUser={onEditUser}
        />
      );
    }
  }, [user, userAndpreferencesLoaded, isProfilePopupOpen]);

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 30,
      filter: "blur(4px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  console.log({ msgs: messages });

  return (
    <div className="min-h-screen bg-[#e5e5e5]">
      <div className="flex h-screen">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="relative w-80 bg-white/80 rounded-r-2xl backdrop-blur-sm flex flex-col">
          <div className="absolute z-20 bottom-4 left-0 right-2 p-4 pb-0">
            <button
              onClick={() => {
                if (userAndpreferencesLoaded) {
                  setIsProfilePopupOpen(true);
                }
              }}
              className="w-full flex items-center space-x-3 bg-[#EEEEEE] rounded-2xl p-4 drop-shadow-customShadowDark mt-2 hover:bg-[#E0E0E0] transition-colors duration-200 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
                {status === "loading" || !userAndpreferencesLoaded ? (
                  <div className="w-full h-full bg-black/10 rounded-full animate-pulse"></div>
                ) : user?.preferences?.profileImage || session?.user?.image ? (
                  <img
                    src={
                      user?.preferences?.profileImage ||
                      session?.user?.image ||
                      ""
                    }
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-semibold text-sm">
                    {user?.username ?? "U"}
                  </span>
                )}
              </div>
              <div className="flex-1 text-left">
                {status === "loading" || !userAndpreferencesLoaded ? (
                  <>
                    <div className="h-4 bg-black/10 rounded-full animate-pulse mb-2 w-24"></div>
                    <div className="h-4 bg-black/10 rounded-full animate-pulse w-32"></div>
                  </>
                ) : (
                  <>
                    <h3 className="font-semibold text-black">
                      {user?.username || "User"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {session?.user?.email || "Click to edit profile"}
                    </p>
                  </>
                )}
              </div>
            </button>
          </div>

          <div className="p-4">
            <button
              onClick={handleNewChat}
              className="cursor-pointer w-full bg-black/80 text-white rounded-2xl py-3 px-4 hover:bg-black transition-colors duration-300 flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>New Chat</span>
            </button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="px-4 pb-2">
              <h4 className="text-base font-semibold text-gray-500">
                Recent Sessions:
              </h4>
            </div>

            <div className="flex-1 overflow-y-auto px-4 space-y-2 sidebar-scroll">
              {initialLoading ? (
                <SessionSkeleton count={8} />
              ) : (
                conversations.map((session, index) => (
                  <button
                    key={index}
                    onClick={() => handleConversationClick(session)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 group cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h5 className="font-medium text-sm text-black truncate">
                        {session.title}
                      </h5>
                      <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2">
                        {new Date(session.lastActive).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" }
                        )}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="relative flex-1 flex flex-col lg:ml-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover transition-all duration-1000 ease-in-out"
            aria-hidden="true"
            ref={(video) => {
              if (video) {
                video.style.transition = "filter 1s ease-in-out";
                video.playbackRate = response ? 0 : isSending ? 1 : 0.2;
              }
            }}
          >
            <source src="/videos/loading.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          <div className="lg:hidden flex items-center justify-between p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xs border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label="Open sidebar"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              dontvibecode
            </h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
          <div className="h-screen m-4 flex-1 flex flex-col bg-white/20 backdrop-blur-xs border border-black/10 shadow-[inset_0_0px_40px_rgba(0,0,0,0.1)] rounded-lg overflow-hidden">
            <div className="flex-1 overflow-y-auto flex flex-col items-center justify-start p-4 lg:p-8 main-scroll">
              {messages.length > 0 ? (
                <ResponseUI
                  onBack={handleNewChat}
                  title={title}
                  itemVariants={itemVariants}
                  messages={messages}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <ChatPrompt />
                </div>
              )}
              <motion.div
                className="absolute bottom-0 left-0 right-2 z-20 bg-black/25 backdrop-blur-sm py-4"
                variants={itemVariants}
              >
                <div className="max-w-2xl mx-auto px-4 pt-4">
                  <ChatBox
                    handleSubmit={handleSubmit}
                    message={message}
                    isSending={isSending}
                    handleInputChange={handleInputChange}
                    handleKeyDown={handleKeyDown}
                    experienceLevel={experienceLevel}
                    setExperienceLevel={setExperienceLevel}
                    model={model}
                    setModel={setModel}
                  />
                  <p className="text-sm text-black/40 text-center mt-2">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      {userProfilePopup}
    </div>
  );
}
