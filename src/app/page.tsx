'use client';

import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { InstructorResponse, MessageData } from "@/types/api";
import ChatPrompt from "./components/ChatPrompt";
import ResponseUI from "./components/ResponseUI";
import SessionSkeleton from "./components/SessionSkeleton";
import { RecentSession } from "@/types/api";
import { m } from "framer-motion";

export default function Home(): React.JSX.Element {
  const [message, setMessage] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [response, setResponse] = useState<MessageData | null>(null);
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [experienceLevel, setExperienceLevel] = useState<string>('beginner');
  const [model, setModel] = useState<string>('gemini');
  const [sessions, setSessions] = useState<RecentSession[]>([]);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSessions = async () => {
      const response = await fetch('/api/recent-sessions');
      const data = await response.json();
      console.log('Sessions:', data);
      setSessions(data);
      setInitialLoading(false);
    };

    fetchSessions();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if(isSending) return;
    setIsSending(true);
    
    if (!message.trim()) return;
    
    try {
      const InstructorResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/chat/message/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Request-Headers': '*',
        },
        body: JSON.stringify({ 
          text: message.trim(),
          conversation: 0, // testing
          from_user: true,
          model_used: "gemini-2.5-pro",
          json: {}
        }),
      });

      console.log({ InstructorResponse})
      
      if (!InstructorResponse.ok) {
        throw new Error(`HTTP error! status: ${InstructorResponse.status}`);
      }
      console.log({ InstructorResponse })
      const data: MessageData = await InstructorResponse.json();
      if (!data.json) {
        console.log({ text: data.text })
      } else {
        setUserPrompt(message.trim());
        setResponse(data);
        console.log('API Response:', data);
        setMessage(''); 
      }
    } catch (error) {
      console.error('Error submitting message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setMessage(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleSessionClick = (session: RecentSession): void => {
    console.log('Selected session:', session);
    setResponse(null);
    setTimeout(() => {
      setResponse(session);
      setUserPrompt(session.prompt);
    }, 100);
  };

  const handleBackToChat = (): void => {
    setResponse(null);
    setUserPrompt('');
  };

  return (
    <div className="min-h-screen bg-[#e5e5e5]">
      <div className="flex h-screen">
        
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        <div className="w-80 bg-white/80 rounded-r-2xl backdrop-blur-sm flex flex-col">
          
          <div className="p-4 pb-0">
            <div className="flex items-center space-x-3 bg-black/10 rounded-2xl p-4 drop-shadow-customShadow mt-2">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">JD</span>
              </div>
              <div>
                <h3 className="font-semibold text-black">Jane Doe</h3>
                <p className="text-sm text-gray-500">Developer</p>
              </div>
            </div>
          </div>

          <div className="p-4">
            <button onClick={() => setResponse(null)} className="cursor-pointer w-full bg-black/80 text-white rounded-2xl py-3 px-4 hover:bg-black transition-colors duration-300 flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span>New Chat</span>
            </button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="px-4 pb-2">
              <h4 className="text-base font-semibold text-gray-500">Recent Sessions:</h4>
            </div>
            
            <div className="flex-1 overflow-y-auto px-4 space-y-2 sidebar-scroll">
              {initialLoading ? (
                <SessionSkeleton count={8} />
              ) : (
                sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => handleSessionClick(session)}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 group cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h5 className="font-medium text-sm text-black truncate">
                      {session.title}
                    </h5>
                    <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2">
                      {new Date(session.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {session.prompt}
                  </p>
                </button>
              )))}
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
                video.style.transition = 'filter 1s ease-in-out';
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
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
            
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">dontvibecode</h1>
            
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
          
            <div className="h-screen m-4 flex-1 flex flex-col bg-white/20 backdrop-blur-xs border border-black/10 shadow-[inset_0_0px_40px_rgba(0,0,0,0.1)] rounded-lg overflow-hidden">
              <div className="flex-1 overflow-y-auto flex flex-col items-center justify-start p-4 lg:p-8 main-scroll">
                {response && (response.json) ?
                  <ResponseUI response={response.json} onBack={handleBackToChat} userPrompt={userPrompt} />
                  :
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <ChatPrompt 
                      message={message} 
                      setMessage={setMessage} 
                      handleSubmit={handleSubmit} 
                      isSending={isSending} 
                      handleInputChange={handleInputChange} 
                      handleKeyDown={handleKeyDown} 
                      experienceLevel={experienceLevel} setExperienceLevel={setExperienceLevel} model={model} setModel={setModel} />
                  </div>
                }
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
