import React, { useRef } from "react";
import { ApiResponse, RecommendedReading } from "@/types/api";
import { Icon } from "@iconify/react";
import { motion, useInView, Variants } from "framer-motion";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import TextUnroll from "./TextUnroll";

// Separate component for reading cards to properly handle useInView
const ReadingCard: React.FC<{ reading: RecommendedReading; index: number }> = ({ reading, index }) => {
  const readingRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(readingRef, { once: true, margin: "-100px" });

  return (
    <motion.div 
      ref={readingRef}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 30 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: "easeOut"
      }}
      className="drop-shadow-customShadow bg-white/60 hover:bg-white/80 rounded-2xl p-4 backdrop-blur-sm border border-gray-200 transition-colors duration-300 cursor-pointer"
    >
      <div className="h-24 bg-gray-200 rounded mb-3">
        {/* Image placeholder */}
      </div>
      <h3 className="font-medium text-gray-900 text-sm mb-1">
        {reading.title}
      </h3>
      <p className="text-xs text-gray-600">
        {reading.sourceDescription}
      </p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-500">{reading.readingTime} min read</span>
        <Icon icon="mingcute:external-link-line" className="w-4 h-4 text-gray-400" />
      </div>
    </motion.div>
  );
};

interface ResponseUIProps {
  response: ApiResponse;
  onBack?: () => void;
  userPrompt?: string;
}

export default function ResponseUI({ response, onBack, userPrompt }: ResponseUIProps) {
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
      className="w-full max-w-4xl mx-auto p-6 space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="text-center relative"
        variants={itemVariants}
      >
        {onBack && (
          <button 
            onClick={onBack}
            className="cursor-pointer absolute left-0 bottom-0 text-gray-600 hover:text-black transition-colors duration-300"
          >
            <Icon icon="mingcute:square-arrow-left-line" className="w-7 h-7" />
          </button>
        )}
        {/* TODO: Title needed for original response object */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{response.title || "Title Here"}</h1>
        <button 
          className="cursor-pointer absolute right-0 bottom-0 pb-[1px] bg-[#5B5454] rounded-xl text-white transition-colors duration-300"
        >
          <Icon icon="mingcute:file-download-fill" className="w-5 h-5 m-1.5" />
        </button>
      </motion.div>
      <div className="w-full h-[1px] rounded-full bg-black/20"></div>
      <motion.div 
        className="bg-white/60 rounded-3xl drop-shadow-customShadow border border-gray-200 p-6 space-y-6 backdrop-blur-sm"
        variants={itemVariants}
      >
        <div>
          <h2 className="text-lg font-semibold text-gray-500 mb-4">Prompt:</h2>
          <div className="border-l-4 border-blue-200 pl-4 bg-blue-100/50 py-3 rounded-r-xl">
            <p className="text-gray-800 leading-relaxed">
              {userPrompt}
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-500 mb-4">Breakdown:</h2>
          <TextUnroll 
            text={response.breakdown}
            className="text-gray-800"
            duration={500}
            delay={500}
            chunkSize={{ min: 3, max: 5 }}
          />
        </div>

        <div>
          <TextUnroll 
            text={response.explanation}
            className="text-gray-800"
            duration={500}
            delay={1200}  
            chunkSize={{ min: 3, max: 5 }}
          />
        </div>

        <motion.div 
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 30 }}
          transition={{
            delay: 2,
            duration: 0.3
          }}
          className="bg-white/60 rounded-3xl drop-shadow-customShadow border border-gray-200 p-6 space-y-6 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Activity:</h3>
            <Icon icon="material-symbols:bookmark-outline" className="w-5 h-5 text-gray-400" />
          </div>
          <TextUnroll 
            text="Try to carefully read through the code and identify why it's producing incorrect 
              results. Use your debugging skills to trace the logic and pinpoint where things 
              might be going wrong."
            className="text-gray-800 mb-4"
            duration={500}
            delay={2200}  
            chunkSize={{ min: 3, max: 5 }}
          />

          <div className="flex flex-col gap-4">
            {response.exercises && response.exercises.length > 0 && response.exercises.map((exercise, index) => (
              <div key={index} className="rounded-lg overflow-hidden">
                <div className="bg-gray-900 flex items-center justify-between px-4 py-2">
                  <span className="text-gray-400 text-sm">{exercise.filename}</span>
                  <Icon icon="material-symbols:content-copy-outline" className="w-4 h-4 text-gray-400 cursor-pointer hover:text-white" />
                </div>

                {/* Note: Should return language for exercise so we can use correct syntax highlighting here etc */}
                <SyntaxHighlighter
                  language="javascript"
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    borderRadius: 0,
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}
                  showLineNumbers={true}
                  lineNumberStyle={{
                    minWidth: '3em',
                    paddingRight: '1em',
                    color: '#6b7280',
                    borderRight: '1px solid #374151',
                    marginRight: '1em'
                  }}
                >
                  {exercise.code}
                </SyntaxHighlighter>
              </div>
            ))}
          </div>

          {response.exercises.length > 0 && (
            <div className="mt-4 text-center">
              <button className="cursor-pointer inline-flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                <Icon icon="mingcute:flash-fill" className="w-4 h-4 mr-1" />
                Continue with exercises
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Sources</h2>
        
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {response.recommendedReadings.map((reading, index) => (
              <ReadingCard 
                key={index}
                reading={reading}
                index={index}
              />
            ))}
        </div>
      </motion.div>

      <motion.div 
        className="flex justify-center space-x-4 pt-4"
        variants={itemVariants}
      >
        <button className="cursor-pointer p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <Icon icon="mingcute:thumb-up-2-line" className="w-6 h-6" />
        </button>
        <button className="cursor-pointer p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <Icon icon="mingcute:thumb-down-2-line" className="w-6 h-6" />
        </button>
      </motion.div>
    </motion.div>
  );
}