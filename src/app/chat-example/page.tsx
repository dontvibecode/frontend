"use client";

/**
 * EXAMPLE: Chat page using the centralized API service
 * This demonstrates how to use the new API service in a real component
 */

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import api from "@/lib/api";
import { User, Conversation, MessageData } from "@/types";

export default function ChatExamplePage() {
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [experienceLevel] = useState("Beginner");

  // Load user data on mount
  useEffect(() => {
    async function loadUser() {
      if (session?.user?.email) {
        const idToken = (session.user as any).idToken;

        try {
          // Try to get existing user
          const userData = await api.user.getUser(
            session.user.email,
            idToken
          );
          setUser(userData);
        } catch (error) {
          // If user doesn't exist, create one
          try {
            const newUser = await api.user.createUser(
              {
                username: session.user.name || session.user.email?.split("@")[0] || "User",
                email: session.user.email,
                method: "google",
              },
              idToken
            );
            setUser(newUser);
          } catch (createError) {
            console.error("Error creating user:", createError);
          }
        }
      }
    }

    loadUser();
  }, [session?.user?.email]);

  // Load conversations when user is loaded
  useEffect(() => {
    async function loadConversations() {
      if (session?.user?.email) {
        const idToken = (session.user as any).idToken;

        try {
          const conversationsData = await api.conversation.getConversations(
            session.user.email,
            idToken
          );
          
          // Transform backend data to frontend format
          const formattedConversations: Conversation[] = conversationsData.map(
            (conv: any) => ({
              id: conv.id.toString(),
              title: conv.title,
              lastActive: conv.last_active,
            })
          );
          
          setConversations(formattedConversations);
        } catch (error) {
          console.error("Error loading conversations:", error);
        }
      }
    }

    if (user) {
      loadConversations();
    }
  }, [user, session?.user?.email]);

  // Handle sending a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim() || !session?.user?.email) return;

    const idToken = (session.user as any).idToken;
    setLoading(true);

    try {
      // Send message
      const response = await api.message.sendMessage(
        {
          text: inputMessage.trim(),
          conversation: currentConversationId,
          from_user: true,
          model_used: "gemini-2.5-pro",
          json: {},
          experience_level: experienceLevel,
        },
        idToken
      );

      // Get the conversation ID from response
      const conversationId = response.conversation.toString();
      setCurrentConversationId(conversationId);

      // Fetch updated messages
      const updatedMessages = await api.conversation.getConversationMessages(
        conversationId,
        idToken
      );

      // Transform messages to frontend format
      const formattedMessages: MessageData[] = updatedMessages.map(
        (msg: any) => ({
          text: msg.text,
          conversation: msg.conversation,
          fromUser: msg.from_user,
          modelUsed: msg.model_used,
          json: msg.json,
        })
      );

      setMessages(formattedMessages);
      setInputMessage("");

      // Reload conversations list
      const conversationsData = await api.conversation.getConversations(
        session.user.email,
        idToken
      );
      
      const formattedConversations: Conversation[] = conversationsData.map(
        (conv: any) => ({
          id: conv.id.toString(),
          title: conv.title,
          lastActive: conv.last_active,
        })
      );
      
      setConversations(formattedConversations);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle clicking on a conversation
  const handleConversationClick = async (conversation: Conversation) => {
    if (!session?.user?.email) return;

    const idToken = (session.user as any).idToken;

    try {
      const messagesData = await api.conversation.getConversationMessages(
        conversation.id,
        idToken
      );

      // Transform messages to frontend format
      const formattedMessages: MessageData[] = messagesData.map(
        (msg: any) => ({
          text: msg.text,
          conversation: msg.conversation,
          fromUser: msg.from_user,
          modelUsed: msg.model_used,
          json: msg.json,
        })
      );

      setMessages(formattedMessages);
      setCurrentConversationId(conversation.id);
    } catch (error) {
      console.error("Error loading conversation:", error);
    }
  };

  // Handle starting a new chat
  const handleNewChat = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setInputMessage("");
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Left Sidebar - Conversations */}
      <aside className="w-64 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-lg">Conversations</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <button
            onClick={handleNewChat}
            className="w-full p-3 text-left bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mb-4"
          >
            + New Chat
          </button>

          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => handleConversationClick(conv)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                currentConversationId === conv.id
                  ? "bg-blue-100 border border-blue-300"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <div className="font-medium text-sm">{conv.title}</div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(conv.lastActive).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>

        {user && (
          <div className="p-4 border-t border-gray-200">
            <div className="text-sm font-medium">{user.username}</div>
            <div className="text-xs text-gray-500">{user.email}</div>
          </div>
        )}
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <p className="text-2xl mb-2">👋</p>
                <p>Start a conversation!</p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.fromUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-2xl p-4 rounded-2xl ${
                    msg.fromUser
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? "..." : "Send"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

