"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

type FeedbackType = "bug" | "feature" | "general" | null;

export default function FeedbackModal({ isOpen, onClose, userEmail }: FeedbackModalProps) {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim() || !feedbackType) return;
    
    setSubmitting(true);
    
    // Simulate sending feedback (replace with actual API call)
    try {
      // TODO: Replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Feedback submitted:", {
        type: feedbackType,
        message,
        email: userEmail,
        timestamp: new Date().toISOString(),
      });
      
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        // Reset state after closing
        setTimeout(() => {
          setFeedbackType(null);
          setMessage("");
          setSubmitted(false);
        }, 300);
      }, 1500);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset state after closing
    setTimeout(() => {
      setFeedbackType(null);
      setMessage("");
      setSubmitted(false);
    }, 300);
  };

  const feedbackTypes = [
    { id: "bug" as const, icon: "solar:bug-linear", label: "Bug Report", color: "text-red-500" },
    { id: "feature" as const, icon: "solar:lightbulb-linear", label: "Feature Request", color: "text-amber-500" },
    { id: "general" as const, icon: "solar:chat-round-dots-linear", label: "General Feedback", color: "text-blue-500" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-container-primary border border-theme-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-theme-border">
                <h2 className="text-lg font-semibold text-primary-text">Send Feedback</h2>
                <button
                  onClick={handleClose}
                  className="p-1 hover:bg-base-10 rounded-lg transition-colors"
                >
                  <Icon icon="solar:close-circle-linear" className="w-5 h-5 text-text-60" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-8"
                  >
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                      <Icon icon="solar:check-circle-bold" className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-medium text-primary-text mb-1">Thank you!</h3>
                    <p className="text-sm text-text-60">Your feedback has been submitted.</p>
                  </motion.div>
                ) : (
                  <>
                    {/* Message Input */}
                    <div className="mb-4">
                      <label className="text-sm font-medium text-text-60 mb-2 block">
                        Your message
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tell us what's on your mind..."
                        rows={4}
                        className="w-full p-3 bg-base-10 border border-theme-border rounded-xl text-sm text-primary-text placeholder:text-text-40 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                      />
                    </div>

                    {/* Email Display */}
                    {userEmail && (
                      <div className="mb-4 text-xs text-text-40">
                        Sending as: {userEmail}
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      onClick={handleSubmit}
                      disabled={!message.trim() || !feedbackType || submitting}
                      className="w-full py-3 px-4 bg-primary-text text-base-5 font-medium rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-base-5/30 border-t-base-5 rounded-full animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Icon icon="solar:plain-linear" className="w-4 h-4" />
                          <span>Send Feedback</span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
