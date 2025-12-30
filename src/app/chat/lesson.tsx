"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageData } from "@/types";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import api from "@/lib/api";
import { useSession } from "next-auth/react";

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
  abilityLevel: string;
}

interface ExerciseModuleProps {
  data: any;
  messageId?: number;
  abilityLevel?: string;
  index?: number;
}

export function ExerciseModule({ data, messageId, abilityLevel, index = 0 }: ExerciseModuleProps) {
  const [editedCode, setEditedCode] = useState<Record<string, string>>({});
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showSaveReminder, setShowSaveReminder] = useState(false);
  const { data: session } = useSession();
  
  const lastSavedCodeRef = useRef<Record<string, string>>({});
  const saveReminderTimerRef = useRef<NodeJS.Timeout | null>(null);
  const SAVE_REMINDER_DELAY = 10000; // Auto remind to save after 10 seconds

  const currentExercise = data.exercises?.[activeExerciseIndex];
  
  const hasUnsavedChanges = useCallback(() => {
    if (!data.exercises) return false;
    return data.exercises.some((exercise: any) => {
      const currentCode = editedCode[exercise.filename] ?? exercise.code;
      const savedCode = lastSavedCodeRef.current[exercise.filename] ?? exercise.user_submission ?? exercise.code;
      return currentCode !== savedCode;
    });
  }, [editedCode, data.exercises]);

  useEffect(() => {
    if (data.exercises) {
      const initialCode: Record<string, string> = {};
      const initialSaved: Record<string, string> = {};
      data.exercises.forEach((exercise: any) => {
        if (exercise.user_submission) {
          initialCode[exercise.filename] = exercise.user_submission;
          initialSaved[exercise.filename] = exercise.user_submission;
        } else {
          initialSaved[exercise.filename] = exercise.code;
        }
      });
      lastSavedCodeRef.current = initialSaved;
      if (Object.keys(initialCode).length > 0) {
        setEditedCode(prev => ({ ...initialCode, ...prev }));
      }
    }
  }, [data.exercises]);

  useEffect(() => {
    if (saveReminderTimerRef.current) {
      clearTimeout(saveReminderTimerRef.current);
    }
    
    if (!hasUnsavedChanges()) {
      setShowSaveReminder(false);
      return;
    }
    
    saveReminderTimerRef.current = setTimeout(() => {
      if (hasUnsavedChanges()) {
        setShowSaveReminder(true);
      }
    }, SAVE_REMINDER_DELAY);
    
    return () => {
      if (saveReminderTimerRef.current) {
        clearTimeout(saveReminderTimerRef.current);
      }
    };
  }, [editedCode, hasUnsavedChanges]);

  const saveCodeProgress = async () => {
    const idToken = (session?.user as any)?.idToken;
    if (!idToken) {
      console.error('No idToken found in session');
      return;
    }
    
    setSaving(true);
    try {
      // TODO: Save code progress to database
      // const response = await api.exercise.saveCodeProgress({
      //   exercise_id: data.exercise_id ?? data.exercises[activeExerciseIndex]?.exercise_id,
      //   user_submissions: editedCode,
      // }, idToken);
      
      // Simulate save delay (remove when API is implemented)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update last saved state
      const savedState: Record<string, string> = {};
      data.exercises?.forEach((exercise: any) => {
        savedState[exercise.filename] = editedCode[exercise.filename] ?? exercise.code;
      });
      lastSavedCodeRef.current = savedState;
      
      // Hide reminder
      setShowSaveReminder(false);
      
      console.log('Code progress saved');
    } catch (error) {
      console.error('Failed to save code progress:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!messageId || !abilityLevel || !data.exercises?.length) return;
    
    const idToken = (session?.user as any)?.idToken;
    if (!idToken) {
      console.error('No idToken found in session');
      return;
    }

    setSubmitting(true);
    try {
      const exerciseFileIds: number[] = [];
      const userSubmissions: string[] = [];
      
      data.exercises.forEach((exercise: any, idx: number) => {
        exerciseFileIds.push(exercise.id ?? idx);
        userSubmissions.push(editedCode[exercise.filename] ?? exercise.code);
      });

      console.log({
          ability_level: abilityLevel.toLowerCase(),
          message_id: messageId,
          exercise_id: data.exercise_id ?? data.exercises[activeExerciseIndex]?.exercise_id,
          exercise_file_ids: exerciseFileIds,
          user_submissions: userSubmissions,
      });

      const response = await api.exercise.submitExercise({
        ability_level: abilityLevel.toLowerCase(),
        message_id: messageId,
        exercise_id: data.exercise_id ?? data.exercises[activeExerciseIndex]?.exercise_id,
        exercise_file_ids: exerciseFileIds,
        user_submissions: userSubmissions,
      }, idToken);

      const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
      console.log('Parsed feedback:', parsedResponse);
      setFeedbackData(parsedResponse);
      
    } catch (error) {
      console.error('Failed to submit exercise:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="text-sm mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold text-gray-900">{currentExercise.title || 'Exercise ' + (index + 1)}</h2>
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
      <p className="text-black font-medium text-lg mb-4">{currentExercise.text || 'Exercise ' + (index + 1)}</p>
      <div className="bg-[#2D2D2D] px-4 py-2 rounded-t-lg">
        <span className="text-gray-300 text-sm">{currentExercise.filename}</span>
      </div>
      {data.exercises && data.exercises.length > 1 && (
        <div className="bg-[#252526] flex items-center overflow-x-auto border-b border-[#1E1E1E]">
          {data.exercises.map((exercise: any, index: number) => {
            const ext = exercise.filename.split('.').pop() || '';
            const iconColors: Record<string, string> = {
              'py': 'text-yellow-400',
              'java': 'text-orange-500', 
              'js': 'text-yellow-300',
              'ts': 'text-blue-400',
              'tsx': 'text-blue-400',
              'jsx': 'text-blue-300',
            };
            const iconColor = iconColors[ext] || 'text-gray-400';
            
            return (
              <button
                key={index}
                onClick={() => setActiveExerciseIndex(index)}
                className={`cursor-pointer group relative flex items-center gap-2 px-3 py-2 text-[13px] font-normal transition-colors duration-150 border-r border-[#1E1E1E] min-w-max ${
                  activeExerciseIndex === index
                    ? 'bg-[#1E1E1E] text-white'
                    : 'bg-[#2D2D2D] text-gray-400 hover:bg-[#2A2A2A] hover:text-gray-300'
                }`}
              >
                {/* Active tab top accent */}
                {activeExerciseIndex === index && (
                  <span className="absolute top-0 left-0 right-0 h-[2px] bg-[#007ACC]" />
                )}
                {/* File type icon */}
                <svg className={`w-4 h-4 flex-shrink-0 ${iconColor}`} viewBox="0 0 24 24" fill="currentColor">
                  {ext === 'py' ? (
                    <path d="M12 0C5.4 0 5.8 2.8 5.8 2.8v2.9h6.4v.9H3.8S0 6.2 0 12.1s3.3 5.7 3.3 5.7h2v-2.7s-.1-3.3 3.2-3.3h5.5s3.1 0 3.1-3v-5S17.5 0 12 0zm-3.1 1.7c.6 0 1 .5 1 1s-.5 1-1 1c-.6 0-1-.5-1-1s.5-1 1-1z M12 24c6.6 0 6.2-2.8 6.2-2.8v-2.9h-6.4v-.9h8.4s3.8.4 3.8-5.5-3.3-5.7-3.3-5.7h-2v2.7s.1 3.3-3.2 3.3H10s-3.1 0-3.1 3v5s-.4 3.8 5.1 3.8zm3.1-1.7c-.6 0-1-.5-1-1s.5-1 1-1c.6 0 1 .5 1 1s-.5 1-1 1z"/>
                  ) : ext === 'java' ? (
                    <path d="M8.9 18.6s-1 .6.7.8c2.1.3 3.2.2 5.5-.3 0 0 .6.4 1.5.7-5.2 2.3-11.9-.1-7.7-1.2m-.6-2.8s-1.2.9.6 1c2.2.2 4 .2 7-.3 0 0 .4.4 1.1.7-6.4 1.9-13.5.1-8.7-1.4m5.1-4.7c1.3 1.5-.3 2.8-.3 2.8s3.3-1.7 1.8-3.8c-1.4-2-2.5-3 3.3-6.4 0 0-9.1 2.3-4.8 7.4m7.6 11s.7.6-.8 1.1c-2.9.9-12.1 1.2-14.6 0-.9-.4.8-.9 1.3-1 .5-.1.8-.1.8-.1-1-.7-6.2 1.3-2.6 1.9 9.6 1.6 17.5-.7 15.9-1.9m-10.9-7.9s-4.4 1-1.6 1.4c1.2.2 3.6.1 5.8-.1 1.8-.1 3.6-.4 3.6-.4s-.6.3-1.1.6c-4.4 1.2-12.9.6-10.5-.5 2.1-1 3.8-1 3.8-1m7.8 4.4c4.5-2.3 2.4-4.6.9-4.3-.4.1-.5.2-.5.2s.1-.2.4-.3c2.8-1 5 3-1 4.5 0 0 .1-.1.2-.1"/>
                  ) : (
                    <path d="M3 3h18v18H3V3zm16.5 15.5v-11h-15v11h15zM6.5 8.5h4v4h-4v-4z"/>
                  )}
                </svg>
                <span>{data.exercises[index].filename}</span>
              </button>
            );
          })}
        </div>
      )}
      <CodeMirror
        value={editedCode[currentExercise.filename] ?? currentExercise.code}
        onChange={(value: string) => setEditedCode(prev => ({ ...prev, [currentExercise.filename]: value }))}
        theme={vscodeDark}
        extensions={[getLanguageExtension(currentExercise.filename)]}
        style={{ fontSize: '14px' }}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
        }}
      />
      {/* Save Reminder Banner */}
      <AnimatePresence>
        {showSaveReminder && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mt-2"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-sm text-amber-800">You have unsaved changes</span>
            </div>
            <button
              onClick={saveCodeProgress}
              disabled={saving}
              className="cursor-pointer text-sm font-medium text-amber-700 hover:text-amber-900 hover:bg-amber-100 px-3 py-1 rounded-md transition-colors"
            >
              {saving ? 'Saving...' : 'Save now'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className="cursor-pointer w-fit flex flex-row items-center gap-2 bg-black/5 hover:bg-black/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 shadow-[inset_0_0_0px_30px_rgba(244,244,244,0.03)] backdrop-blur-lg overflow-hidden border border-white/30 rounded-2xl py-3 px-5"
          >
            {submitting ? (
              <>
                <svg className="animate-spin w-4 h-4 text-black" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-sm text-black m-0 font-medium tracking-wide">Checking...</span>
              </>
            ) : (
              <span className="text-sm text-black m-0 font-medium tracking-wide">Submit</span>
            )}
          </button>
          <button 
            onClick={saveCodeProgress}
            disabled={saving || !hasUnsavedChanges()}
            className="cursor-pointer flex items-center gap-2 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors group border border-gray-200"
          >
            {saving ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-sm font-medium">Saving...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span className="text-sm font-medium">Save</span>
              </>
            )}
          </button>
        </div>
        <button 
          onClick={() => setEditedCode(prev => ({ ...prev, [currentExercise.filename]: currentExercise.code }))}
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
        {feedbackData?.correctness === 2 && feedbackData && (
          <motion.div
            key="correct"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mt-6 relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-lime-50 border border-emerald-200/60 p-5"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/30 to-lime-200/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-200/20 to-emerald-200/20 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-lime-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-emerald-900 mb-1">
                    {feedbackData.heading}
                  </h3>
                  <p className="text-sm text-emerald-700/80 leading-relaxed whitespace-pre-wrap">
                    {feedbackData.summary}
                  </p>
                </div>
              </div>

              {/* <div className="mt-4 flex items-center gap-3">
                <button 
                  onClick={() => { setFeedbackData(null); }}
                  className="cursor-pointer px-4 py-2 text-sm font-medium text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100/50 rounded-lg transition-colors"
                >
                  Dismiss
                </button>
              </div> */}
            </div>
          </motion.div>
        )}

        {feedbackData?.correctness === 1 && feedbackData && (
          <motion.div
            key="partially_correct"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mt-6 relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200/60 p-5"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/30 to-yellow-200/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-200/20 to-amber-200/20 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-amber-900 mb-1">
                    {feedbackData.heading}
                  </h3>
                  <p className="text-sm text-amber-700/80 leading-relaxed whitespace-pre-wrap">
                    {feedbackData.summary}
                  </p>
                </div>
              </div>

              {/* Code diffs */}
              {feedbackData.corrections?.diffs?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-amber-200/50 space-y-4">
                  {feedbackData.corrections.diffs.map((diff: any, idx: number) => (
                    <div key={idx}>
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="text-sm font-medium text-amber-800">{diff.headline}</span>
                      </div>
                      
                      <div className="mb-3">
                        <div className="text-xs font-medium text-rose-600 mb-1 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                          Your code:
                        </div>
                        <div className="rounded-lg overflow-hidden border border-rose-200/50">
                          <SyntaxHighlighter
                            language={currentExercise?.filename?.endsWith('.py') ? 'python' : currentExercise?.filename?.endsWith('.java') ? 'java' : 'javascript'}
                            style={vscDarkPlus}
                            customStyle={{ margin: 0, padding: '0.75rem 1rem', background: '#1E1E1E', fontSize: '13px' }}
                          >
                            {diff.incorrect_code}
                          </SyntaxHighlighter>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="text-xs font-medium text-emerald-600 mb-1 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          Suggested fix:
                        </div>
                        <div className="rounded-lg overflow-hidden border border-emerald-200/50">
                          <SyntaxHighlighter
                            language={currentExercise?.filename?.endsWith('.py') ? 'python' : currentExercise?.filename?.endsWith('.java') ? 'java' : 'javascript'}
                            style={vscDarkPlus}
                            customStyle={{ margin: 0, padding: '0.75rem 1rem', background: '#1E1E1E', fontSize: '13px' }}
                          >
                            {diff.correct_code}
                          </SyntaxHighlighter>
                        </div>
                      </div>

                      <p className="text-sm text-amber-700/70 leading-relaxed">{diff.comment}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Statements */}
              {feedbackData.corrections?.statements?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-amber-200/50">
                  {feedbackData.corrections.statements.map((statement: string, idx: number) => (
                    <p key={idx} className="text-sm text-amber-700/70 leading-relaxed mb-2">{statement}</p>
                  ))}
                </div>
              )}

              {/* <div className="mt-4 flex items-center gap-3">
                <button 
                  onClick={() => { setFeedbackData(null); }}
                  className="cursor-pointer px-4 py-2 text-sm font-medium text-amber-700 hover:text-amber-900 hover:bg-amber-100/50 rounded-lg transition-colors"
                >
                  Dismiss
                </button>
              </div> */}
            </div>
          </motion.div>
        )}

        {feedbackData?.correctness === 0 && feedbackData && (
          <motion.div
            key="incorrect"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mt-6 relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-200/60 p-5"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-200/30 to-orange-200/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-red-200/20 to-rose-200/20 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center shadow-lg shadow-rose-500/25">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-rose-900 mb-1">
                    {feedbackData.heading}
                  </h3>
                  <p className="text-sm text-rose-700/80 leading-relaxed whitespace-pre-wrap">
                    {feedbackData.summary}
                  </p>
                </div>
              </div>

              {/* Code diffs */}
              {feedbackData.corrections?.diffs?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-rose-200/50 space-y-4">
                  {feedbackData.corrections.diffs.map((diff: any, idx: number) => (
                    <div key={idx}>
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="text-sm font-medium text-rose-800">{diff.headline}</span>
                      </div>
                      
                      <div className="mb-3">
                        <div className="text-xs font-medium text-rose-600 mb-1 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                          Your code:
                        </div>
                        <div className="rounded-lg overflow-hidden border border-rose-200/50">
                          <SyntaxHighlighter
                            language={currentExercise?.filename?.endsWith('.py') ? 'python' : currentExercise?.filename?.endsWith('.java') ? 'java' : 'javascript'}
                            style={vscDarkPlus}
                            customStyle={{ margin: 0, padding: '0.75rem 1rem', background: '#1E1E1E', fontSize: '13px' }}
                          >
                            {diff.incorrect_code}
                          </SyntaxHighlighter>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="text-xs font-medium text-emerald-600 mb-1 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          Suggested fix:
                        </div>
                        <div className="rounded-lg overflow-hidden border border-emerald-200/50">
                          <SyntaxHighlighter
                            language={currentExercise?.filename?.endsWith('.py') ? 'python' : currentExercise?.filename?.endsWith('.java') ? 'java' : 'javascript'}
                            style={vscDarkPlus}
                            customStyle={{ margin: 0, padding: '0.75rem 1rem', background: '#1E1E1E', fontSize: '13px' }}
                          >
                            {diff.correct_code}
                          </SyntaxHighlighter>
                        </div>
                      </div>

                      <p className="text-sm text-rose-700/70 leading-relaxed">{diff.comment}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Statements */}
              {feedbackData.corrections?.statements?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-rose-200/50">
                  {feedbackData.corrections.statements.map((statement: string, idx: number) => (
                    <p key={idx} className="text-sm text-rose-700/70 leading-relaxed mb-2">{statement}</p>
                  ))}
                </div>
              )}
{/* 
              <div className="mt-4 flex items-center gap-3">
                <button 
                  onClick={() => { setFeedbackData(null); }}
                  className="cursor-pointer px-4 py-2 text-sm font-medium text-rose-700 hover:text-rose-900 hover:bg-rose-100/50 rounded-lg transition-colors"
                >
                  Dismiss
                </button>
              </div> */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Lesson({ message, userPrompt, setLessonExpanded, lessonExpanded, abilityLevel }: LessonProps) {
  const jsonData = message.json;
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [editedCode, setEditedCode] = useState<Record<string, string>>({});
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [fetchedExercises, setFetchedExercises] = useState<any>(null);
  const { data: session } = useSession();
  const [generatingExercises, setGeneratingExercises] = useState(false);
  
  if (!jsonData) return null;

  const currentExercise = jsonData.exercises?.[activeExerciseIndex];

  const expandExercises = () => {
    setLessonExpanded(true);
    fetchExercises();
  };

  const fetchExercises = async () => {
    const idToken = (session?.user as any)?.idToken;
    if (!idToken) {
      console.error('No idToken found in session');
      return;
    }
    
    setLoadingExercises(true);
    try {
      const response = await api.exercise.getExercises(message.id!, idToken);
      console.log('Fetched exercises:', response);
      setFetchedExercises(response);
    } catch (error) {
      console.error('Failed to fetch exercises:', error);
    } finally {
      setLoadingExercises(false);
    }
  };

  const generateExercises = async () => {
    setGeneratingExercises(true);
    const idToken = (session?.user as any)?.idToken;
    if (!idToken) {
      console.error('No idToken found in session');
      setGeneratingExercises(false);
      return;
    }
    try {
      const response = await api.exercise.getNewExercise(message.id!, abilityLevel.toLowerCase(), idToken);
      console.log('New exercises:', response);
      
      // Transform and add to fetchedExercises
      const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
      
      // Use exercise_id from response
      const exerciseId = parsedResponse.exercise_id;
      
      // Transform exercise_files array to files format
      const newExerciseData = {
        correctness: null,
        files: parsedResponse.exercise_files.map((exercise: any, idx: number) => ({
          ...exercise,
          id: idx,
          exercise_id: exerciseId,
          user_submission: null
        }))
      };
      
      // Add to fetchedExercises using exercise_id as key
      setFetchedExercises((prev: any) => ({
        ...prev,
        [exerciseId]: newExerciseData
      }));
    } catch (error) {
      console.error('Failed to generate exercises:', error);
    } finally {
      setGeneratingExercises(false);
    }
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

          <div className="p-8 pb-0 pt-16 flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Expanded Lesson View</h1>
            {/* Render exercises from numeric keys in fetchedExercises */}
            {fetchedExercises && Object.keys(fetchedExercises)
              .filter(key => !isNaN(Number(key))) // Get only numeric keys (exercise IDs)
              .map((exerciseId, idx) => {
                const exerciseData = fetchedExercises[exerciseId];
                return (
                  <ExerciseModule 
                    key={exerciseId} 
                    index={idx} 
                    data={{ 
                      exercises: exerciseData.files,
                      exercise_id: Number(exerciseId),
                      correctness: exerciseData.correctness
                    }} 
                    messageId={message.id} 
                    abilityLevel={abilityLevel} 
                  />
                );
              })
            }
            {/* Fallback: render from jsonData.exercises if no fetchedExercises with numeric keys */}
            {(!fetchedExercises || Object.keys(fetchedExercises).filter(key => !isNaN(Number(key))).length === 0) && jsonData.exercises && (
              <ExerciseModule 
                data={jsonData} 
                messageId={message.id} 
                abilityLevel={abilityLevel} 
                index={0} 
              />
            )}

            <div className="relative rounded-t-xl overflow-hidden">
            <div className="absolute inset-0 z-10 backdrop-blur-xs bg-white/0 flex items-end justify-center">
              <div className="rounded-t-xl bg-white py-4 w-[80%] flex items-center justify-center">
                <button 
                  className="cursor-pointer w-fit flex flex-row items-center gap-2 bg-black/5 hover:bg-black/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 shadow-[inset_0_0_0px_30px_rgba(244,244,244,0.03)] backdrop-blur-lg overflow-hidden border border-white/30 rounded-2xl py-3 px-5"
                  onClick={generateExercises}
                  disabled={generatingExercises}
                > 
                  {generatingExercises ? (
                    <>
                      <svg className="animate-spin w-4 h-4 text-black" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="text-sm text-black m-0 font-medium tracking-wide">Generating...</span>
                    </>
                  ) : (
                    <span className="text-sm text-black m-0 font-medium tracking-wide">Unlock more exercises</span>
                  )}
                </button>
              </div>
            </div>
            <div className="bg-[#2D2D2D]">
                <div className="flex flex-row items-center justify-between">
                  <span className="mx-4 my-2">Java.java</span>
                </div>
            <SyntaxHighlighter
              language={'java'}
              style={vscDarkPlus}
              showLineNumbers
              customStyle={{ margin: 0, padding: '0 1rem', background: '#1E1E1E', fontSize: '13px' }}
            >
              {`
public class PlaceholderService {
    private final String serviceName;
    private final Instant initializedAt;
    private boolean enabled;
              `}
            </SyntaxHighlighter>
              </div>
            </div>
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
            {jsonData.exercises && jsonData.exercises.length > 1 && (
              <div className="bg-[#252526] flex items-center overflow-x-auto border-b border-[#1E1E1E]">
                {jsonData.exercises.map((exercise, index) => {
                  const ext = exercise.filename.split('.').pop() || '';
                  const iconColors: Record<string, string> = {
                    'py': 'text-yellow-400',
                    'java': 'text-orange-500', 
                    'js': 'text-yellow-300',
                    'ts': 'text-blue-400',
                    'tsx': 'text-blue-400',
                    'jsx': 'text-blue-300',
                  };
                  const iconColor = iconColors[ext] || 'text-gray-400';
                  
                  return (
                    <button
                      key={index}
                      onClick={() => setActiveExerciseIndex(index)}
                      className={`cursor-pointer group relative flex items-center gap-2 px-3 py-2 text-[13px] font-normal transition-colors duration-150 border-r border-[#1E1E1E] min-w-max ${
                        activeExerciseIndex === index
                          ? 'bg-[#1E1E1E] text-white'
                          : 'bg-[#2D2D2D] text-gray-400 hover:bg-[#2A2A2A] hover:text-gray-300'
                      }`}
                    >
                      {/* Active tab top accent */}
                      {activeExerciseIndex === index && (
                        <span className="absolute top-0 left-0 right-0 h-[2px] bg-[#007ACC]" />
                      )}
                      {/* File type icon */}
                      <svg className={`w-4 h-4 flex-shrink-0 ${iconColor}`} viewBox="0 0 24 24" fill="currentColor">
                        {ext === 'py' ? (
                          <path d="M12 0C5.4 0 5.8 2.8 5.8 2.8v2.9h6.4v.9H3.8S0 6.2 0 12.1s3.3 5.7 3.3 5.7h2v-2.7s-.1-3.3 3.2-3.3h5.5s3.1 0 3.1-3v-5S17.5 0 12 0zm-3.1 1.7c.6 0 1 .5 1 1s-.5 1-1 1c-.6 0-1-.5-1-1s.5-1 1-1z M12 24c6.6 0 6.2-2.8 6.2-2.8v-2.9h-6.4v-.9h8.4s3.8.4 3.8-5.5-3.3-5.7-3.3-5.7h-2v2.7s.1 3.3-3.2 3.3H10s-3.1 0-3.1 3v5s-.4 3.8 5.1 3.8zm3.1-1.7c-.6 0-1-.5-1-1s.5-1 1-1c.6 0 1 .5 1 1s-.5 1-1 1z"/>
                        ) : ext === 'java' ? (
                          <path d="M8.9 18.6s-1 .6.7.8c2.1.3 3.2.2 5.5-.3 0 0 .6.4 1.5.7-5.2 2.3-11.9-.1-7.7-1.2m-.6-2.8s-1.2.9.6 1c2.2.2 4 .2 7-.3 0 0 .4.4 1.1.7-6.4 1.9-13.5.1-8.7-1.4m5.1-4.7c1.3 1.5-.3 2.8-.3 2.8s3.3-1.7 1.8-3.8c-1.4-2-2.5-3 3.3-6.4 0 0-9.1 2.3-4.8 7.4m7.6 11s.7.6-.8 1.1c-2.9.9-12.1 1.2-14.6 0-.9-.4.8-.9 1.3-1 .5-.1.8-.1.8-.1-1-.7-6.2 1.3-2.6 1.9 9.6 1.6 17.5-.7 15.9-1.9m-10.9-7.9s-4.4 1-1.6 1.4c1.2.2 3.6.1 5.8-.1 1.8-.1 3.6-.4 3.6-.4s-.6.3-1.1.6c-4.4 1.2-12.9.6-10.5-.5 2.1-1 3.8-1 3.8-1m7.8 4.4c4.5-2.3 2.4-4.6.9-4.3-.4.1-.5.2-.5.2s.1-.2.4-.3c2.8-1 5 3-1 4.5 0 0 .1-.1.2-.1"/>
                        ) : (
                          <path d="M3 3h18v18H3V3zm16.5 15.5v-11h-15v11h15zM6.5 8.5h4v4h-4v-4z"/>
                        )}
                      </svg>
                      <span>{exercise.filename}</span>
                    </button>
                  );
                })}
              </div>
            )}
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
