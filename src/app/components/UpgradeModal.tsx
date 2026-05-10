"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { useTheme } from "./ThemeProvider";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDowngrade: () => void;
  onSelectPro: () => void;
  onSelectTokens: () => void;
  subscriptionActive?: boolean | null;
  membershipExpiresAt?: string | null;
}

export default function UpgradeModal({
  isOpen,
  onClose,
  onDowngrade,
  onSelectPro,
  onSelectTokens,
  subscriptionActive,
  membershipExpiresAt,
}: UpgradeModalProps) {
  const { resolvedTheme } = useTheme();
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-background scrollbar-hide overflow-y-auto"
        >
          {/* Header with back button */}
          <div className="sticky top-0 z-20 p-4 border-b border-base-10">
            <button
              onClick={onClose}
              className="p-2 hover:bg-base-10 rounded-lg transition-colors"
            >
              <Icon icon="solar:arrow-left-linear" className="w-6 h-6 text-primary-text" />
            </button>
          </div>

          {/* Content */}
          <div className="relative">
            <div className="pointer-events-none max-w-6xl h-screen fixed top-0 left-0 right-0 mx-auto border-l border-r border-theme-border" aria-hidden />
            <div className="relative z-10 max-w-6xl mx-auto px-6 pt-6 pb-1">
              {/* Title */}
              <img src="https://i.ibb.co/kgxtgpK6/image.png" alt="Logo" className={`h-12 mx-auto mb-8 ${resolvedTheme === 'dark' ? 'invert' : ''}`}/>

              {/* Cards Container */}
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {/* Free Plan */}
                <div className="bg-container-primary border border-theme-border rounded-2xl p-6 flex flex-col">
                  <div className="mb-6">
                    <div className="w-12 h-12 mb-4 text-text-60">
                      <Icon icon="solar:user-linear" className="w-full h-full" />
                    </div>
                    <h2 className="text-xl font-semibold text-primary-text">Free</h2>
                    <p className="text-sm text-text-60">Get started learning</p>
                  </div>

                  <div className="mb-6">
                    <span className="text-4xl font-semibold text-primary-text">$0</span>
                    <span className="text-sm text-text-60 ml-2">forever</span>
                  </div>

                  <button
                    onClick={onDowngrade}
                    disabled={!subscriptionActive}
                    className="w-full py-3 px-4 bg-base-10 text-primary-text font-medium rounded-full mb-6 disabled:opacity-50 cursor-pointer"
                  >
                    {membershipExpiresAt ? subscriptionActive ? "Downgrade" : `Pro membership valid until ${new Date(membershipExpiresAt).toLocaleDateString()}` : "Current plan"}
                  </button>

                  <div className="space-y-3 text-sm">
                    <FeatureItem text="5,000 tokens per month" />
                    <FeatureItem text="Gemini 2.5 Pro model" />
                    <FeatureItem text="Generate lessons (500 tokens)" />
                    <FeatureItem text="7 days lesson history" />
                    <FeatureItem text="Interactive exercises" />
                    <FeatureItem text="Real-time AI feedback (150 tokens)" />
                    <FeatureItem text="5 additional exercises per lesson" />
                    <FeatureItem text="5 solution explanations per day" />
                  </div>
                </div>

                {/* Pro Plan */}
                <div className="bg-container-primary border border-theme-border rounded-2xl p-6 flex flex-col relative">
                  {/* Popular badge */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-emerald-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                      Popular
                    </span>
                  </div>

                  <div className="mb-6">
                    <div className="w-12 h-12 mb-4 text-text-60">
                      <Icon icon="solar:star-linear" className="w-full h-full" />
                    </div>
                    <h2 className="text-xl font-semibold text-primary-text">Pro</h2>
                    <p className="text-sm text-text-60">Learn without limits</p>
                  </div>

                  <div className="mb-6">
                    <span className="text-4xl font-semibold text-primary-text">$5</span>
                    <span className="text-sm text-text-60 ml-2">/ month</span>
                  </div>

                  <button
                    onClick={onSelectPro}
                    className="w-full py-3 px-4 bg-primary-text text-background font-medium rounded-full mb-6 hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                  >
                    {membershipExpiresAt ? subscriptionActive ? "Current plan | Click to manage" : "Resume subscription" : "Get Pro plan"}
                  </button>

                  <p className="text-xs text-text-60 mb-4">Everything in Free, plus:</p>
                  <div className="space-y-3 text-sm">
                    <FeatureItem text="50,000 tokens per month" highlight />
                    <FeatureItem text="Gemini Pro & Sonnet models" highlight />
                    <FeatureItem text="Fast lesson generation (750 tokens)" highlight />
                    <FeatureItem text="Unlimited lesson history" highlight />
                    <FeatureItem text="Unlimited additional exercises" highlight />
                    <FeatureItem text="Unlimited solution explanations" highlight />
                  </div>
                </div>

                {/* Token Purchase */}
                <div className="bg-container-primary border border-theme-border rounded-2xl p-6 flex flex-col">
                  <div className="mb-6">
                    <div className="w-12 h-12 mb-4 text-text-60">
                      <Icon icon="solar:bolt-linear" className="w-full h-full" />
                    </div>
                    <h2 className="text-xl font-semibold text-primary-text">Token Pack</h2>
                    <p className="text-sm text-text-60">One-time purchase</p>
                  </div>

                  <div className="mb-6">
                    <span className="text-4xl font-semibold text-primary-text">$5</span>
                    <span className="text-sm text-text-60 ml-2">one-time</span>
                  </div>

                  <button
                    type="button"
                    onClick={onSelectTokens}
                    className="relative z-10 w-full cursor-pointer py-3 px-4 bg-primary-text text-background font-medium rounded-full mb-6 transition-all duration-200 hover:opacity-90 active:scale-[0.99]"
                  >
                    Buy 200k tokens
                  </button>

                  <p className="text-xs text-text-60 mb-4">Perfect for:</p>
                  <div className="space-y-3 text-sm">
                    <FeatureItem text="200,000 tokens added instantly" />
                    <FeatureItem text="Tokens never expire" />
                    <FeatureItem text="Use with any plan" />
                    <FeatureItem text="Stack multiple purchases" />
                    <FeatureItem text="No commitment required" />
                  </div>
                </div>
                {/* <button>
                  <h1>Change Payment Method</h1>
                </button> */}
              </div>
            </div>
            <div className="h-[1px] bg-base-10 w-full absolute bottom-0 left-0 right-0"/>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FeatureItem({ text, highlight = false }: { text: string; highlight?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <Icon 
        icon="solar:check-circle-linear" 
        className={`w-5 h-5 flex-shrink-0 ${highlight ? 'text-emerald-500' : 'text-text-40'}`} 
      />
      <span className={highlight ? 'text-primary-text' : 'text-text-70'}>{text}</span>
    </div>
  );
}

function TableSection({ title }: { title: string }) {
  return (
    <div className="grid grid-cols-3 border-b border-theme-border bg-base-10/50">
      <div className="p-3 text-xs font-semibold text-primary-text uppercase tracking-wide">{title}</div>
      <div className="p-3 border-x border-theme-border"></div>
      <div className="p-3"></div>
    </div>
  );
}

function TableRow({ 
  feature, 
  free, 
  pro,
  isLast = false 
}: { 
  feature: string; 
  free: string | boolean; 
  pro: string | boolean;
  isLast?: boolean;
}) {
  return (
    <div className={`grid grid-cols-3 ${!isLast ? 'border-b border-theme-border' : ''} hover:bg-base-5/50 transition-colors`}>
      <div className="p-4 text-sm text-text-70">{feature}</div>
      <div className="p-4 text-sm text-center border-x border-theme-border">
        {typeof free === 'boolean' ? (
          free ? (
            <Icon icon="solar:check-circle-bold" className="w-5 h-5 text-emerald-500 mx-auto" />
          ) : (
            <Icon icon="solar:close-circle-linear" className="w-5 h-5 text-text-30 mx-auto" />
          )
        ) : (
          <span className="text-text-60">{free}</span>
        )}
      </div>
      <div className="p-4 text-sm text-center">
        {typeof pro === 'boolean' ? (
          pro ? (
            <Icon icon="solar:check-circle-bold" className="w-5 h-5 text-emerald-500 mx-auto" />
          ) : (
            <Icon icon="solar:close-circle-linear" className="w-5 h-5 text-text-30 mx-auto" />
          )
        ) : (
          <span className="text-primary-text font-medium">{pro}</span>
        )}
      </div>
    </div>
  );
}
