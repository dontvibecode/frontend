"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageData } from "@/types";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";

const getLanguageExtension = (filename: string) => {
  if (filename.endsWith('.py')) return python();
  if (filename.endsWith('.java')) return java();
  return javascript();
};

interface LessonProps {
  message: MessageData;
  userPrompt?: string;
  setLessonExpanded: (expanded: boolean) => void;
  lessonExpanded: boolean;
}

type FeedbackState = 'correct' | 'incorrect' | null;

export function ExerciseModule({ exercise }: { exercise: any }) {
  const [editedCode, setEditedCode] = useState<Record<string, string>>({});
  const [feedbackState, setFeedbackState] = useState<FeedbackState>(null);

  // Demo: toggle between states on submit
  const handleSubmit = () => {
    setFeedbackState(prev => {
      if (prev === null) return 'incorrect';
      if (prev === 'incorrect') return 'correct';
      return null;
    });
  };

  return (
    <div key={exercise.filename} className="text-sm mb-4">

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold text-gray-900">{`<Exercise Name Here>`}</h2>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </button>
      </div>
      <p className="text-black font-medium text-lg mb-4">{exercise.text}</p>
      <div className="bg-[#2D2D2D] px-4 py-2 rounded-t-lg">
        <span className="text-gray-300 text-sm">{exercise.filename}</span>
      </div>
      <CodeMirror
        value={editedCode[exercise.filename] ?? exercise.code}
        onChange={(value: string) => setEditedCode(prev => ({ ...prev, [exercise.filename]: value }))}
        theme={vscodeDark}
        extensions={[getLanguageExtension(exercise.filename)]}
        style={{ fontSize: '14px' }}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
        }}
      />
      <div className="flex items-center justify-between mt-3">
        <button 
          onClick={handleSubmit}
          className="cursor-pointer w-fit flex flex-row items-center gap-2 bg-black/5 hover:bg-black/10 transition-colors duration-300 shadow-[inset_0_0_0px_30px_rgba(244,244,244,0.03)] backdrop-blur-lg overflow-hidden border border-white/30 rounded-2xl py-3 px-5"
        >
          <span className="text-sm text-black m-0 font-medium tracking-wide">Submit</span>
        </button>
        <button 
          onClick={() => setEditedCode(prev => ({ ...prev, [exercise.filename]: exercise.code }))}
          className="flex cursor-pointer items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors group"
        >
          <svg 
            className="w-4 h-4 group-hover:rotate-[-45deg] transition-transform" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
          <span className="text-sm font-medium">Reset Code</span>
        </button>
      </div>

      {/* Feedback Dialogs */}
      <AnimatePresence mode="wait">
        {feedbackState === 'correct' && (
          <motion.div
            key="correct"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mt-6 relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-lime-50 border border-emerald-200/60 p-5"
          >
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/30 to-lime-200/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-200/20 to-emerald-200/20 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative">
              {/* Header with icon */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-lime-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-emerald-900 mb-1">
                    Great job! Your solution is correct.
                  </h3>
                  <p className="text-sm text-emerald-700/80 leading-relaxed">
                    You successfully implemented the function using proper syntax and logic. The loop iterates through each element exactly as expected.
                  </p>
                </div>
              </div>

              {/* Improvement suggestions */}
              <div className="mt-4 pt-4 border-t border-emerald-200/50">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-sm font-medium text-emerald-800">Pro tip</span>
                </div>
                <p className="text-sm text-emerald-700/70 leading-relaxed">
                  Consider using a list comprehension for a more Pythonic approach. It would make your code more concise while maintaining readability.
                </p>
              </div>

              {/* Action buttons */}
              <div className="mt-4 flex items-center gap-3">
                <button 
                  onClick={() => setFeedbackState(null)}
                  className="cursor-pointer px-4 py-2 text-sm font-medium text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100/50 rounded-lg transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {feedbackState === 'incorrect' && (
          <motion.div
            key="incorrect"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mt-6 relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-200/60 p-5"
          >
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-200/30 to-orange-200/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-red-200/20 to-rose-200/20 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative">
              {/* Header with icon */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center shadow-lg shadow-rose-500/25">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-rose-900 mb-1">
                    Not quite right — let&apos;s take another look.
                  </h3>
                  <p className="text-sm text-rose-700/80 leading-relaxed">
                    There&apos;s an issue with your loop logic. The condition doesn&apos;t properly handle the edge case when the list is empty.
                  </p>
                </div>
              </div>

              {/* Error explanation with code */}
              <div className="mt-4 pt-4 border-t border-rose-200/50">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-sm font-medium text-rose-800">Issue found on line 3</span>
                </div>
                
                {/* Your code snippet */}
                <div className="mb-3">
                  <div className="text-xs font-medium text-rose-600 mb-1 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    Your code:
                  </div>
                  <div className="rounded-lg overflow-hidden border border-rose-200/50">
                    <SyntaxHighlighter
                      language="python"
                      style={vscDarkPlus}
                      customStyle={{
                        margin: 0,
                        padding: '0.75rem 1rem',
                        background: '#1E1E1E',
                        fontSize: '13px',
                      }}
                      wrapLines
                      lineProps={(lineNumber) => ({
                        style: lineNumber === 1 ? { backgroundColor: 'rgba(239, 68, 68, 0.2)', display: 'block' } : { display: 'block' }
                      })}
                    >
{`for i in range(len(items)):  # ← Issue here
    print(items[i])`}
                    </SyntaxHighlighter>
                  </div>
                </div>

                {/* Correct code snippet */}
                <div>
                  <div className="text-xs font-medium text-emerald-600 mb-1 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Suggested fix:
                  </div>
                  <div className="rounded-lg overflow-hidden border border-emerald-200/50">
                    <SyntaxHighlighter
                      language="python"
                      style={vscDarkPlus}
                      customStyle={{
                        margin: 0,
                        padding: '0.75rem 1rem',
                        background: '#1E1E1E',
                        fontSize: '13px',
                      }}
                      wrapLines
                      lineProps={(lineNumber) => ({
                        style: lineNumber === 1 ? { backgroundColor: 'rgba(34, 197, 94, 0.2)', display: 'block' } : { display: 'block' }
                      })}
                    >
{`if items:  # Check if list is not empty
    for item in items:  # Use direct iteration
        print(item)`}
                    </SyntaxHighlighter>
                  </div>
                </div>
              </div>

              {/* Explanation */}
              <div className="mt-4 pt-4 border-t border-rose-200/50">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span className="text-sm font-medium text-rose-800">Why this matters</span>
                </div>
                <p className="text-sm text-rose-700/70 leading-relaxed">
                  Using <code className="px-1.5 py-0.5 bg-rose-100 rounded text-rose-800 text-xs font-mono">range(len(items))</code> works, but iterating directly over the list is more Pythonic and avoids potential index errors. Always check for empty lists when your logic depends on having elements.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Lesson({ message, userPrompt, setLessonExpanded, lessonExpanded }: LessonProps) {
  const jsonData = message.json;
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [editedCode, setEditedCode] = useState<Record<string, string>>({});
  const [selectedExercise, setSelectedExercise] = useState<string>('Hello World');

  if (!jsonData) return null;

  const currentExercise = jsonData.exercises?.[activeExerciseIndex];

  const expandExercises = () => {
    setLessonExpanded(true);
  };

  return (
    <AnimatePresence mode="popLayout">
      {lessonExpanded ? (
        <motion.div
          key="expanded-drawer"
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0 z-50 bg-white overflow-y-auto"
        >
          {/* Close button */}
          <button 
            onClick={() => setLessonExpanded(false)}
            className="cursor-pointer absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors z-10"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="p-8 pt-16 flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Expanded Lesson View</h1>
            <div className="flex flex-row gap-4">
              {[
                'Hello World',
                'Looping',
                'Creating a Function',
              ].map((exercise) => (
                <button onClick={() => setSelectedExercise(exercise)} className={`${selectedExercise !== exercise ? 'bg-gray-100' : 'bg-gray-600'} cursor-pointer rounded-xl py-2 px-4 transition-all duration-200`}>
                  <p className={`text-sm font-medium ${selectedExercise !== exercise ? 'text-gray-600' : 'text-white'} transition-all duration-200`}>{exercise}</p>
                </button>
              ))}
            </div>
            {jsonData.exercises && jsonData.exercises.length > 0 && jsonData.exercises.map((exercise) => (
              <ExerciseModule key={exercise.filename} exercise={exercise} />
            ))}

          </div>
        </motion.div>
      ) : (
        <motion.div 
          key="collapsed-card"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="max-w-4xl mx-auto p-6 bg-white mt-6 rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.04)]"
        >
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900">
          {jsonData.lessonTitle ?? (jsonData as any).lesson_title ?? (jsonData.exercises?.[0]?.filename?.replace('.java', '').replace('.py', '').replace('.js', '') || 'Lesson')}
        </h1>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </button>
      </div>

      {/* User Prompt */}
      {userPrompt && (
        <div className="mb-6 bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-sm font-bold text-gray-500 mb-1">Prompt:</div>
          <p className="text-gray-800 text-base leading-relaxed">{userPrompt}</p>
        </div>
      )}

      {/* Breakdown/Explanation */}
      {jsonData.breakdown && (
        <div className="mb-6 leading-relaxed text-gray-800">
          {jsonData.breakdown}
        </div>
      )}

      {jsonData.explanation && (
        <div className="mb-8 leading-relaxed text-gray-700">
          {jsonData.explanation}
        </div>
      )}

      {/* Exercise Tabs */}
      {jsonData.exercises && jsonData.exercises.length > 1 && (
        <div className="mb-6">
          <div className="inline-flex p-1 bg-gray-100 rounded-xl">
            {jsonData.exercises.map((exercise, index) => (
              <button
                key={index}
                onClick={() => setActiveExerciseIndex(index)}
                className={`cursor-pointer relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeExerciseIndex === index
                    ? 'text-gray-900 bg-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    activeExerciseIndex === index 
                      ? 'bg-gradient-to-br from-green-100 to-lime-500' 
                      : 'bg-gray-300'
                  }`} />
                  {exercise.filename.replace(/\.(java|py|js|ts|tsx|jsx)$/, '')}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {currentExercise && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-gray-900">Activity:</h2>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </button>
          </div>

          <p className="text-gray-700 mb-4 leading-relaxed">
            {currentExercise.text}
          </p>

          {/* Code Editor */}
          <div className="bg-[#1E1E1E] rounded-lg mb-4">
            <div className="bg-[#2D2D2D] px-4 py-2 flex items-center justify-between border-b border-gray-700">
              <span className="text-gray-300 text-sm">
                {currentExercise.filename}
              </span>
              <button className="text-gray-400 hover:text-gray-200 transition-colors">
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
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
            <div className="text-sm">
              <SyntaxHighlighter
                language={
                  currentExercise.filename.endsWith('.py')
                    ? 'python'
                    : currentExercise.filename.endsWith('.java')
                    ? 'java'
                    : 'javascript'
                }
                style={vscDarkPlus}
                customStyle={{
                  scrollbarWidth: 'none',
                  margin: 0,
                  padding: '1rem 1rem 0 1rem',
                  background: '#1E1E1E',
                }}
                showLineNumbers
              >
                {currentExercise.code}
              </SyntaxHighlighter>
            </div>
            <div className="sticky bottom-0 left-6 right-6 ml-6 mr-6 py-4">
              <div className="bg-white/0 shadow-[inset_0_0_0px_30px_rgba(244,244,244,0.03)] backdrop-blur-md border border-white/30 rounded-3xl p-4 mx-auto">
              <button onClick={expandExercises} className="w-full flex flex-row justify-between items-center gap-2 text-white font-medium transition-colors">
                <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                >
                  <path
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="0.4"
                    d="M2.499 11a.5.5 0 0 1 .477.348l.256.797a1.01 1.01 0 0 0 .63.633l.789.248a.5.5 0 0 1 .001.954l-.79.252a1 1 0 0 0-.63.633l-.252.787a.5.5 0 0 1-.95.008l-.266-.79a1.03 1.03 0 0 0-.636-.639l-.781-.252a.5.5 0 0 1-.002-.95l.794-.26a1.02 1.02 0 0 0 .636-.634l.248-.786A.5.5 0 0 1 2.5 11ZM1 7.513a1 1 0 0 1 .69-.953l2.583-.844a3.95 3.95 0 0 0 2.465-2.457l.808-2.56A1 1 0 0 1 9.452.695l.832 2.598a3.9 3.9 0 0 0 2.448 2.453l2.569.811a1 1 0 0 1 .004 1.906l-2.572.823a3.9 3.9 0 0 0-2.449 2.454l-.82 2.565a1 1 0 0 1-1.9.014l-.866-2.567v-.002A3.97 3.97 0 0 0 4.24 9.284l-2.547-.821A1 1 0 0 1 1 7.513"
                  ></path>
                </svg>
                Continue with exercises
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  className="text-white cursor-pointer hover:scale-110 transition-transform"
                >
                  <path
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="0.4"
                    d="m12 2 .324.005a10 10 0 1 1-.648 0zm.613 5.21a1 1 0 0 0-1.32 1.497L13.584 11H8l-.117.007A1 1 0 0 0 8 13h5.584l-2.291 2.293-.083.094a1 1 0 0 0 1.497 1.32l4-4 .073-.082.064-.089.062-.113.044-.11.03-.112.017-.126L17 12l-.007-.118-.029-.148-.035-.105-.054-.113-.071-.111a1 1 0 0 0-.097-.112l-4-4z"
                  ></path>
                </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Feedback Buttons */}
          <div className="flex items-center justify-end gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors group">
              <svg
                className="w-5 h-5 text-gray-400 group-hover:text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                />
              </svg>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors group">
              <svg
                className="w-5 h-5 text-gray-400 group-hover:text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Sources Section */}
      {jsonData.recommendedReadings && jsonData.recommendedReadings.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {jsonData.recommendedReadings.map((reading, index) => (
              <a
                key={index}
                href={reading.Url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-gray-100 rounded-lg p-4 hover:bg-gray-200 transition-colors group h-40 flex flex-col"
              >
                <div className="flex-1 mb-2">
                  <h3 className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors mb-1 line-clamp-2">
                    {reading.title}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {reading.sourceDescription}
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  {reading.readingTime} min read
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
