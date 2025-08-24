import React from "react";
import { Icon } from "@iconify/react";
import { motion, Variants } from "framer-motion";

interface ChatPromptProps {
  message: string;
  setMessage: (message: string) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isSending: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export default function ChatPrompt({ 
  message, 
  setMessage, 
  handleSubmit, 
  isSending, 
  handleInputChange, 
  handleKeyDown 
}: ChatPromptProps) {
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
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative">
            <textarea
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="What's not working? Let's think it through."
              className="w-full min-h-[120px] p-4 pr-12 border border-white/20 rounded-3xl resize-none bg-white/80 outline-none text-black placeholder-black/50 backdrop-blur-xl"
              rows={4}
            />
            
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
        
        <p className="text-sm text-black/40 text-center mt-3">
          Press Enter to send, Shift+Enter for new line
        </p>
      </motion.div>
    </motion.div>
  );
}