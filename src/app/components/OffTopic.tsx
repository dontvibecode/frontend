import React, { useRef } from "react";
import { ExperienceLevel, InstructorResponse, MessageData, RecommendedReading } from "@/types/api";
import { Icon } from "@iconify/react";
import { motion, useInView, Variants } from "framer-motion";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import TextUnroll from "./TextUnroll";
import { ChatBox } from "./ChatPrompt";

interface OffTopicProps {
  response: string;
  onBack?: () => void;
  userPrompt?: string;
  title: string;
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

export default function OffTopic({ 
  response, 
  onBack, 
  userPrompt, 
  title,
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
}: OffTopicProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      filter: "blur(4px)"
    },
    visible: { 
      opacity: 1, 
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      className="w-full max-w-4xl h-full flex flex-col justify-between mx-auto px-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >

       <div className="flex flex-col gap-4">
         <motion.div 
           className="bg-white/60 rounded-3xl w-fit max-w-[60%] drop-shadow-customShadow border border-gray-200 p-4 space-y-6 backdrop-blur-sm self-end"
           variants={itemVariants}
         >
          <div>
            <TextUnroll
              text={userPrompt || "This topic is off-topic for coding assistance."}
              className="text-gray-800 font-semibold"
              duration={200}
              delay={0}
              chunkSize={{ min: 3, max: 5 }}
            />
          </div>
        </motion.div>
        <div className="flex flex-row gap-4">
          <div className="flex flex-row rounded-full overflow-hidden m-0">
            <img src="/logo.png" alt="dontvibecode logo" className="rounded-full w-10 h-10" />
          </div>
          <motion.div 
            className="flex flex-row items-center gap-3 bg-white/60 rounded-3xl w-fit max-w-[60%] drop-shadow-customShadow border border-gray-200 p-4 space-y-6 backdrop-blur-sm"
            variants={itemVariants}
          >
            <TextUnroll
              text={response || "This topic is off-topic for coding assistance."}
              className="text-gray-800"
              duration={500}
              delay={500}
              chunkSize={{ min: 3, max: 5 }}
            />
          </motion.div>
        </div>
      </div>


      {/* Chat prompt here */}
      <motion.div
        variants={itemVariants}
        className="w-full max-w-2xl mx-auto"
      >
        <ChatBox
          message={message}
          setMessage={setMessage}
          handleSubmit={handleSubmit}
          isSending={isSending}
          handleInputChange={handleInputChange}
          handleKeyDown={handleKeyDown}
          experienceLevel={experienceLevel}
          setExperienceLevel={setExperienceLevel}
          model={model}
          setModel={setModel}
        />
      </motion.div>
    </motion.div>
  );
}