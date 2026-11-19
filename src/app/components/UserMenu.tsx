"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { signOut, useSession } from "next-auth/react";
import { User } from "@/types";
import { useTheme } from "./ThemeProvider";
import { getGlassGradientBorderClassInner } from "./glassGradientBorder";

interface UserMenuProps {
  user: User | null;
  userLoading: boolean;
  onOpenSettings: () => void;
  onUpgrade: () => void;
  onFeedback: () => void;
  /** Called instead of opening the menu when nobody is signed in. */
  onLoginRequired?: () => void;
  /** Must give the wrapper a position, since the dropdown is anchored to it. */
  className?: string;
}

export default function UserMenu({
  user,
  userLoading,
  onOpenSettings,
  onUpgrade,
  onFeedback,
  onLoginRequired,
  className = "relative",
}: UserMenuProps) {
  const { data: session, status } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const menuBorder = getGlassGradientBorderClassInner(resolvedTheme, "rounded-xl");
  const isDark = resolvedTheme === "dark";

  const handleProfileClick = () => {
    if (status === "unauthenticated") {
      onLoginRequired?.();
      return;
    }
    setIsOpen((open) => !open);
  };

  // Every item except the theme toggle closes the menu before acting.
  const closeThen = (action: () => void) => () => {
    setIsOpen(false);
    action();
  };

  return (
    <div className={className}>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop to close menu */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.15 }}
              className={`absolute bottom-full left-0 right-0 mb-2 z-50 p-px shadow-lg ${menuBorder.outerBorderRadiusClass} ${menuBorder.gradientClass}`}
            >
              <div
                className="bg-container-primary overflow-hidden"
                style={menuBorder.innerBorderRadiusStyle}
              >
                {/* Email */}
                <div className="px-4 py-3 border-b border-theme-border">
                  <span className="text-sm text-text-60">
                    {user?.email || session?.user?.email}
                  </span>
                </div>

                <div className="py-1">
                  <MenuItem
                    icon="solar:settings-linear"
                    label="Settings"
                    onClick={closeThen(onOpenSettings)}
                  />
                  <MenuItem
                    icon="solar:arrow-up-linear"
                    label="Upgrade plan"
                    onClick={closeThen(onUpgrade)}
                  />

                  {/* Theme Toggle */}
                  <button
                    onClick={() => setTheme(isDark ? "light" : "dark")}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-primary-text hover:bg-base-10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-5 h-5">
                        <motion.div
                          initial={false}
                          animate={{
                            scale: isDark ? 1 : 0,
                            rotate: isDark ? 0 : 90,
                            opacity: isDark ? 1 : 0,
                          }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="absolute inset-0"
                        >
                          <Icon icon="solar:moon-linear" className="w-5 h-5 text-text-60" />
                        </motion.div>
                        <motion.div
                          initial={false}
                          animate={{
                            scale: isDark ? 0 : 1,
                            rotate: isDark ? -90 : 0,
                            opacity: isDark ? 0 : 1,
                          }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="absolute inset-0"
                        >
                          <Icon icon="solar:sun-linear" className="w-5 h-5 text-text-60" />
                        </motion.div>
                      </div>
                      <span>{isDark ? "Dark mode" : "Light mode"}</span>
                    </div>
                    {/* Toggle Switch */}
                    <div
                      className={`w-9 h-5 rounded-full relative transition-colors ${isDark ? "bg-emerald-500" : "bg-base-20"}`}
                    >
                      <motion.div
                        initial={false}
                        animate={{ x: isDark ? 16 : 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
                      />
                    </div>
                  </button>

                  <MenuItem
                    icon="solar:chat-round-dots-linear"
                    label="Feedback"
                    onClick={closeThen(onFeedback)}
                  />
                </div>

                <div className="border-t border-theme-border py-1">
                  <MenuItem
                    icon="solar:logout-2-linear"
                    label="Log out"
                    onClick={closeThen(() => signOut())}
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* User Profile Button */}
      {userLoading ? (
        // Same metrics as the loaded row, so nothing shifts when it
        // arrives. Without this the avatar briefly showed a fallback
        // initial next to a blank name.
        <div className="w-full flex items-center gap-2 p-2 animate-pulse">
          <div className="w-8 h-8 rounded-full bg-base-10" />
          <div className="flex flex-col justify-start items-start gap-1.5">
            <div className="h-3 w-24 bg-base-10 rounded" />
            <div className="h-2 w-8 bg-base-10 rounded" />
          </div>
        </div>
      ) : (
        <button
          className="w-full flex items-center gap-2 cursor-pointer hover:bg-base-5 rounded-lg p-2 transition-colors duration-200"
          onClick={handleProfileClick}
        >
          <div className="flex items-center gap-2">
            {user?.preferences?.profileImage ? (
              <img
                src={user.preferences.profileImage}
                alt={session?.user?.name || "User"}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-loading flex items-center justify-center text-white text-sm font-semibold">
                {user?.username?.charAt(0)?.toUpperCase() ||
                  session?.user?.name?.charAt(0)?.toUpperCase() ||
                  "U"}
              </div>
            )}
            <div className="flex flex-col justify-start items-start">
              <span className="text-sm font-medium">{user?.username}</span>
              {user?.membership === "pro" && (
                <span className="mr-1 text-xs text-base-30 uppercase tracking-wide">
                  Pro
                </span>
              )}
            </div>
          </div>
        </button>
      )}
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-primary-text hover:bg-base-10 transition-colors"
    >
      <Icon icon={icon} className="w-5 h-5 text-text-60" />
      <span>{label}</span>
    </button>
  );
}
