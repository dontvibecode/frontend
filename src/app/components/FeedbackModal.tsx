"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { feedbackAPI } from "@/lib/api";
import ModalTemplate from "./ModalTemplate";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  idToken?: string;
}

// type FeedbackType = "bug" | "feature" | "general" | null;

export default function FeedbackModal({ isOpen, onClose, userEmail, idToken }: FeedbackModalProps) {
  // const [feedbackType, setFeedbackType] = useState<FeedbackType>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    // if (!message.trim() || !feedbackType || !userEmail) return;
    if (!message.trim()|| !userEmail) return;
    
    setSubmitting(true);
    
    // Simulate sending feedback (replace with actual API call)
    try {
      // TODO: Replace with actual API endpoint
      await feedbackAPI.sendFeedback(
        userEmail,
        message.trim(),
        idToken
      )
      
      console.log("Feedback submitted:", {
        // type: feedbackType,
        message,
        email: userEmail,
        timestamp: new Date().toISOString(),
      });
      
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        // Reset state after closing
        setTimeout(() => {
          // setFeedbackType(null);
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
      // setFeedbackType(null);
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
    <ModalTemplate
      isOpen={isOpen}
      onClose={handleClose}
      title="Send Feedback"
      contentClassName="p-4 bg-background m-3 rounded-2xl"
    >
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
          <div className="mb-4">
            <label className="text-sm font-medium text-text-60 mb-2 block">
              Your message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what's on your mind..."
              rows={4}
              className="w-full p-3 bg-base-10 border border-base-10 rounded-xl text-sm text-primary-text placeholder:text-text-40 resize-none outline-none"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!message.trim() || submitting}
            className={`hover:opacity-90 w-full py-3 px-4 rounded-full transition-all duration-300 font-medium flex items-center justify-center space-x-2 ${submitting
              ? "bg-primary-text text-secondary-text"
              : submitting
                ? "bg-primary-text text-secondary-text cursor-not-allowed"
                : "bg-primary-text text-secondary-text cursor-pointer"
              }`}
          >
            {submitting ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Sending...</span>
              </>
            ) : submitted ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Sent</span>
              </>
            ) : (
              <span>Send Feedback</span>
            )}
          </button>
        </>
      )}
    </ModalTemplate>
  );
}
