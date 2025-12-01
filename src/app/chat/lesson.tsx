"use client";

import React, { useState } from "react";
import { MessageData } from "@/types";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface LessonProps {
  message: MessageData;
  userPrompt?: string;
}

export default function Lesson({ message, userPrompt }: LessonProps) {
  const jsonData = message.json;
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);

  if (!jsonData) return null;

  const currentExercise = jsonData.exercises?.[activeExerciseIndex];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white mt-6 rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.0.04)]">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900">
          {jsonData.exercises?.[0]?.filename?.replace('.java', '').replace('.py', '').replace('.js', '') || 'Lesson'}
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

      {/* Activity Section */}
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
          <div className="bg-[#1E1E1E] rounded-lg overflow-hidden mb-4">
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
                  margin: 0,
                  padding: '1rem',
                  background: '#1E1E1E',
                }}
                showLineNumbers
              >
                {currentExercise.code}
              </SyntaxHighlighter>
            </div>
          </div>

          {/* Continue Button */}
          <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center mb-4">
            <button className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium transition-colors">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
              Continue with exercises
            </button>
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
    </div>
  );
}
