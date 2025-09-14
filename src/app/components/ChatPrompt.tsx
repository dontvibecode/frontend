import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { motion, Variants } from "framer-motion";
import { ExperienceLevel, ExperienceLevels } from "@/types";

interface ChatPromptProps {
  message: string;
  setMessage: (message: string) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isSending: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  experienceLevel: string;
  setExperienceLevel: (level: ExperienceLevel) => void;
  model: string;
  setModel: (model: string) => void;
}

export const ChatBox = ({
  handleSubmit,
  message,
  isSending,
  setMessage,
  handleInputChange,
  handleKeyDown,
  experienceLevel,
  setExperienceLevel,
  model,
  setModel
}: ChatPromptProps) => {
  const [experienceDropdownOpen, setExperienceDropdownOpen] = useState(false);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [hoveredExperienceIndex, setHoveredExperienceIndex] = useState<number | null>(null);
  const [hoveredModelIndex, setHoveredModelIndex] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const experienceLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'novice', label: 'Novice' },
    { value: 'junior', label: 'Junior' },
    { value: 'senior', label: 'Senior' }
  ];
  
  const models = [
    { value: 'gemini', label: 'Gemini' },
    { value: 'sonnet', label: 'Sonnet' }
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setExperienceDropdownOpen(false);
        setModelDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <textarea
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="What's not working? Let's think it through."
          className="w-full min-h-[120px] p-4 pr-12 border border-white/20 rounded-3xl resize-none bg-white/70 outline-none text-black placeholder-black/50 backdrop-blur-xl"
          rows={4}
        />
            
        <div ref={dropdownRef} className="absolute bottom-5 left-4 flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setExperienceDropdownOpen(!experienceDropdownOpen)}
              className="cursor-pointer flex items-center gap-2 px-3 py-2 text-sm bg-white/90 border border-black/5 rounded-full text-black/80 hover:bg-white hover:border-black/10 transition-all duration-200 backdrop-blur-xl drop-shadow-customShadowDark"
            >
              <span className="font-semibold text-black">
                {experienceLevel}
              </span>
              <Icon 
                icon="mingcute:down-line" 
                className={`w-4 h-4 transition-transform duration-200 ${experienceDropdownOpen ? 'rotate-180' : ''}`} 
              />
            </button>
            
              <div 
                className={`absolute top-full left-0 mt-2 p-1 flex flex-col gap-1 bg-white/80 backdrop-blur-3xl border border-white/30 rounded-xl shadow-lg min-w-[140px] z-10 overflow-hidden transition-all duration-300 ease-out ${
                  experienceDropdownOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                style={{
                  height: experienceDropdownOpen ? `${ExperienceLevels.length * 40 + 12}px` : '0px'
                }}
                onMouseLeave={() => setHoveredExperienceIndex(null)}
              >
                {/* Sliding hover background */}
                <div
                  className={`absolute w-[calc(100%-8px)] h-[40px] bg-black border border-white/10 rounded-xl transition-all duration-200 ease-out ${
                    hoveredExperienceIndex !== null ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    transform: hoveredExperienceIndex !== null 
                      ? `translateY(${hoveredExperienceIndex * 42}px)` 
                      : 'translateY(0px)',
                    left: '4px',
                    top: '2px'
                  }}
                />
                
                {ExperienceLevels.map((level, index) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => {
                      setExperienceLevel(level);
                      setExperienceDropdownOpen(false);
                      setHoveredExperienceIndex(null);
                    }}
                    onMouseEnter={() => setHoveredExperienceIndex(index)}
                    className={`relative cursor-pointer rounded-xl w-full text-left px-4 py-2 text-sm transition-colors duration-150 hover:text-white ${
                      experienceLevel === level ? 'text-black font-semibold' : 'text-black'
                    }`}
                    style={{ height: '40px' }}
                  >
                    {level}
                  </button>
                ))}
              </div>
          </div>

          <div className="relative">
            <button
              type="button"
              // Only single model for now
              // onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-white/90 border border-black/5 rounded-full text-black/80 backdrop-blur-xl drop-shadow-customShadowDark"
            >
              <span className="font-medium text-black">
                {models.find(m => m.value === model)?.label || 'Model'}
              </span>
            </button>

            {/* Temporarily disabled */}
            <div 
              className={`absolute top-full left-0 mt-2 p-1 flex flex-col gap-1 bg-white/40 backdrop-blur-xl border border-white/30 rounded-xl shadow-lg min-w-[120px] z-10 overflow-hidden transition-all duration-300 ease-out ${
                modelDropdownOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              style={{
                height: modelDropdownOpen ? `${models.length * 40 + 12}px` : '0px'
              }}
            >
              {models.map((modelOption) => (
                <button
                  key={modelOption.value}
                  type="button"
                  onClick={() => {
                    setModel(modelOption.value);
                    setModelDropdownOpen(false);
                  }}
                  className={`cursor-pointer hover:bg-white/80 rounded-xl w-full text-left px-4 py-2 text-sm transition-colors duration-150 ${
                    model === modelOption.value ? 'text-black font-semibold bg-white/90' : 'text-black'
                  }`}
                  style={{ height: '40px' }}
                >
                  {modelOption.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        

        <button
          type="submit"
          disabled={!message.trim() || isSending}
          className="absolute bottom-5 right-4 p-2 rounded-full bg-black text-white disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 hover:bg-gray-700 dark:hover:bg-gray-500 transition-colors duration-200 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          {isSending ? (
            <Icon icon="mingcute:loading-line" className="w-5 h-5 text-white animate-spin" />
          ) : (
            <Icon icon="mingcute:arrow-right-up-fill" className="w-5 h-5 text-white" />
          )}
        </button>
      </div>
    </form>
  );
};

export default function ChatPrompt({ 
  message, 
  setMessage, 
  handleSubmit, 
  isSending, 
  handleInputChange, 
  handleKeyDown,
  experienceLevel,
  setExperienceLevel,
  model,
  setModel
}: ChatPromptProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full flex flex-col items-center"
    >
      <motion.div 
        className="text-center mb-8"
        variants={itemVariants}
      >
        <div className="mb-6">
          <img
            src="https://i.imgur.com/3Oiecme.png"
            alt="dontvibecode logo"
            width={400}
            height={120}
            className="mx-auto max-w-full h-auto"
          />
        </div>
        
        <p className="text-base lg:text-lg text-black font-regular px-4">
          Code like it matters. Think deeper. Build better. No AI crutches.
        </p>
      </motion.div>

      <motion.div 
        className="w-full max-w-2xl"
        variants={itemVariants}
      >
        
        <ChatBox 
          handleSubmit={handleSubmit}
          message={message}
          isSending={isSending}
          setMessage={setMessage}
          handleInputChange={handleInputChange}
          handleKeyDown={handleKeyDown}
          experienceLevel={experienceLevel}
          setExperienceLevel={setExperienceLevel}
          model={model}
          setModel={setModel}
        />
        
        <p className="text-sm text-black/40 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </motion.div>
    </motion.div>
  );
}