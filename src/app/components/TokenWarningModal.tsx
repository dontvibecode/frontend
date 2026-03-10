"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TokenWarningContextType {
  showTokenWarning: () => void;
  hideTokenWarning: () => void;
  isVisible: boolean;
}

const TokenWarningContext = createContext<TokenWarningContextType | undefined>(undefined);

export function useTokenWarning() {
  const context = useContext(TokenWarningContext);
  if (!context) {
    throw new Error("useTokenWarning must be used within a TokenWarningProvider");
  }
  return context;
}

interface TokenWarningProviderProps {
  children: React.ReactNode;
}

export function TokenWarningProvider({ children }: TokenWarningProviderProps) {
  const [isVisible, setIsVisible] = useState(false);

  const showTokenWarning = useCallback(() => {
    setIsVisible(true);
  }, []);

  const hideTokenWarning = useCallback(() => {
    setIsVisible(false);
  }, []);

  useEffect(() => {
    setGlobalTokenWarningHandler(showTokenWarning);
    return () => {
      setGlobalTokenWarningHandler(() => {});
    };
  }, [showTokenWarning]);

  return (
    <TokenWarningContext.Provider value={{ showTokenWarning, hideTokenWarning, isVisible }}>
      {children}
      <TokenWarningModal isVisible={isVisible} onClose={hideTokenWarning} />
    </TokenWarningContext.Provider>
  );
}

interface TokenWarningModalProps {
  isVisible: boolean;
  onClose: () => void;
}

function TokenWarningModal({ isVisible, onClose }: TokenWarningModalProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 1, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed top-1/2 max-w-sm left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background rounded-2xl shadow-2xl z-51 w-full max-w-3xl max-h-[80vh] overflow-hidden"
          >
            <div className="bg-container-primary border-b border-base-10">
            {/* Header */}
              <div className="p-6 pb-4">
                <h2 className="text-xl font-semibold text-primary-text">
                  Insufficient tokens
                </h2>
                <p className="mt-2 text-sm text-text-70 dark:text-text-30">
                  You don&apos;t have enough tokens to complete this action. Add more tokens to continue learning.
                </p>
              </div>

              {/* Token Display */}
              <div className="relative mx-6 mb-4 p-4 bg-base-5 rounded-xl border border-base-10 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1635776063043-ab23b4c226f6?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                alt="Token Warning" className="absolute top-0 left-0 w-full h-full object-cover" />
                <div className="flex items-center justify-between relative z-30">
                  <span className="text-sm text-white">You need</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 20 20" className="text-white">
                        <path fill="currentColor" fillRule="evenodd" d="M11.3 1.046A1 1 0 0 1 12 2v5h4a1 1 0 0 1 .82 1.573l-7 10A1 1 0 0 1 8 18v-5H4a1 1 0 0 1-.82-1.573l7-10a1 1 0 0 1 1.12-.38" clipRule="evenodd" strokeWidth="0.4" stroke="currentColor"/>
                      </svg>
                    </div>
                    <span className="text-base font-semibold text-gray-900 dark:text-white">More tokens</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 pt-2 pb-4 space-y-3">
                <button
                  onClick={() => {
                    window.location.href = "/settings?tab=tokens";
                  }}
                  className="w-full py-3 px-4 bg-primary-text text-secondary-text font-medium rounded-full hover:bg-text-80 cursor-pointer transition-colors duration-200 ease-in-out"
                >
                  Get tokens
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-3 px-4 bg-transparent text-gray-600 font-medium rounded-full hover:bg-base-10 cursor-pointer transition-colors duration-200 ease-in-out"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Global event emitter for showing token warning from outside React
let globalShowTokenWarning: (() => void) | null = null;

export function setGlobalTokenWarningHandler(handler: () => void) {
  globalShowTokenWarning = handler;
}

export function triggerTokenWarning() {
  if (globalShowTokenWarning) {
    globalShowTokenWarning();
  }
}
