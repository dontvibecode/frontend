"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";
import Link from "next/link";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  canClose: boolean;
}

function GoogleButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="cursor-pointer w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-full drop-shadow-customShadow bg-white text-sm font-medium text-gray-700 relative overflow-hidden"
    >
      {/* Animated circular fill overlay */}
      <motion.div
        className="absolute"
        initial={{ width: 0, height: 0, opacity: 0.4 }}
        animate={{
          width: isHovered ? "800px" : "0px",
          height: isHovered ? "800px" : "0px",
          opacity: isHovered ? 1 : 0.4,
        }}
        transition={{
          duration: isHovered ? 0.7 : 0.3,
          ease: isHovered ? "easeOut" : "easeOut",
        }}
        style={{
          background: "#000",
          borderRadius: "50%",
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          transform: "translate(-50%, -50%)",
          zIndex: 1,
          filter: "none",
        }}
      />

      {/* Content with z-index to stay above the overlay */}
      <div className="relative z-10 flex items-center justify-center w-full">
        <motion.svg
          className="w-5 h-5 mr-3"
          viewBox="0 0 24 24"
          animate={{
            filter: isHovered ? "brightness(0) invert(1)" : "brightness(1) invert(0)",
          }}
          transition={{ duration: 0.3 }}
        >
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </motion.svg>
        <motion.span
          animate={{
            color: isHovered ? "white" : "rgb(55, 65, 81)",
          }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.span>
      </div>
    </motion.button>
  );
}

export default function LoginModal({ isOpen, onClose, canClose }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signIn("google", {
        callbackUrl: "/chat",
        redirect: true,
      });
    } catch (error) {
      console.error("Authentication error:", error);
      setIsLoading(false);
    }
  };

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
            onClick={canClose ? onClose : undefined}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-white py-8 px-6 drop-shadow-2xl border border-gray-200 rounded-2xl mx-4">
              {/* Close Button */}
              {canClose && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              {/* Logo */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-full" />
                  <span className="font-semibold text-xl text-gray-900">dontvibe</span>
                </div>
                <p className="text-sm text-gray-600">
                  Sign in to save your progress and access your lessons
                </p>
              </div>

              {/* Divider with text */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-base">
                  <span className="px-3 bg-white text-gray-900 font-semibold">
                    Log in or sign up
                  </span>
                </div>
              </div>

              {/* Login Button */}
              <div className="space-y-3">
                <GoogleButton onClick={handleGoogleLogin}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    "Continue with Google"
                  )}
                </GoogleButton>
              </div>

              {/* Footer Links */}
              <div className="mt-8 text-center">
                <div className="text-xs text-gray-500 space-x-3">
                  <Link href="/terms" className="underline hover:text-gray-700 transition-colors">
                    Terms of Use
                  </Link>
                  <span>|</span>
                  <Link href="/privacy" className="underline hover:text-gray-700 transition-colors">
                    Privacy Policy
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

