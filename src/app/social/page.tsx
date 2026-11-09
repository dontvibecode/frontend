
"use client";

import Link from "next/link";
import { useState } from "react";
import { useTheme } from "../components/ThemeProvider";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";

export default function SocialPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const [isThemeIconHovered, setIsThemeIconHovered] = useState(false);
  const isDarkMode = resolvedTheme === "dark";
  const currentModeIcon = isDarkMode ? "solar:moon-linear" : "solar:sun-linear";
  const hoverModeIcon = isDarkMode ? "solar:sun-linear" : "solar:moon-linear";

  return (
    <div>
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-4 mx-1">
        <div className="flex items-center gap-4">
          <img
            src="/logo.png"
            alt="Logo"
            className="shadow-[0px_0px_50px_rgba(0,0,0,0.08)] w-10 h-10"
          />
          <button
            type="button"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            onMouseEnter={() => setIsThemeIconHovered(true)}
            onMouseLeave={() => setIsThemeIconHovered(false)}
            onFocus={() => setIsThemeIconHovered(true)}
            onBlur={() => setIsThemeIconHovered(false)}
            aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
            className="shadow-[0px_0px_50px_rgba(0,0,0,0.08)] group cursor-pointer px-2.5 py-2.5 rounded-full bg-invert-20 border border-base-10 text-primary-text backdrop-blur-lg hover:bg-primary-text hover:text-container-primary transition-colors"
          >
            <div className="relative w-5 h-5">
              <motion.div
                className="absolute inset-0"
                animate={{
                  opacity: isThemeIconHovered ? 0 : 1,
                  y: isThemeIconHovered ? -4 : 0,
                  scale: isThemeIconHovered ? 0.92 : 1,
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Icon
                  icon={currentModeIcon}
                  className="w-5 h-5 text-text-60 group-hover:text-container-primary transition-colors"
                />
              </motion.div>
              <motion.div
                className="absolute inset-0"
                animate={{
                  opacity: isThemeIconHovered ? 1 : 0,
                  y: isThemeIconHovered ? 0 : 4,
                  scale: isThemeIconHovered ? 1 : 0.92,
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Icon
                  icon={hoverModeIcon}
                  className="w-5 h-5 text-text-60 group-hover:text-container-primary transition-colors"
                />
              </motion.div>
            </div>
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/chat"
              className="shadow-[0px_0px_50px_rgba(0,0,0,0.08)] cursor-pointer px-5 pr-4 py-2.5 rounded-full bg-primary-text text-background transition-all flex items-center gap-2"
            >
              Log in
            </Link>
          </div>
        </div>
      </header>
      <main className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="max-w-md text-center flex flex-col items-center"
        >
          <div className="mb-6 w-14 h-14 rounded-2xl bg-base-10 border border-base-10 flex items-center justify-center shadow-[0px_0px_50px_rgba(0,0,0,0.08)]">
            <Icon icon="solar:users-group-rounded-linear" className="w-7 h-7 text-text-70" />
          </div>
          <span className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-60">
            Coming soon
          </span>
          <h1 className="text-3xl font-semibold text-primary-text mb-3">
            Community lessons are on the way
          </h1>
          <p className="text-text-70 mb-8 leading-relaxed">
            Soon you&apos;ll be able to browse lessons other learners have shared,
            and fork them into your own chats. In the meantime, keep sharing
            yours from the chat.
          </p>
          <Link
            href="/chat"
            className="shadow-[0px_0px_50px_rgba(0,0,0,0.08)] px-5 py-2.5 rounded-full bg-primary-text text-background transition-all flex items-center gap-2"
          >
            Back to chat
            <Icon icon="solar:arrow-right-linear" className="w-4 h-4" />
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
