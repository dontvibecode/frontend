"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { useTheme } from "../components/ThemeProvider";
import { getGlassGradientBorderClass } from "./glassGradientBorder";
interface ModalTemplateProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidthClassName?: string;
  contentClassName?: string;
  /** When false, title row and header close control are hidden (content-only layout). */
  showHeader?: boolean;
  /** When false, clicking the backdrop does not call onClose. */
  closeOnBackdrop?: boolean;
  /** Extra classes on the centered modal container (e.g. horizontal padding). */
  containerClassName?: string;
}

export default function ModalTemplate({
  isOpen,
  onClose,
  title,
  children,
  maxWidthClassName = "max-w-md",
  contentClassName = "p-4 bg-background m-3 rounded-2xl",
  showHeader = true,
  closeOnBackdrop = true,
  containerClassName = "",
}: ModalTemplateProps) {
  const { resolvedTheme } = useTheme();
  const modalBorder = getGlassGradientBorderClass(resolvedTheme, "rounded-2xl");
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={closeOnBackdrop ? onClose : undefined}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.1, ease: "easeInOut" }}
            className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full ${maxWidthClassName} ${containerClassName}`.trim()}
          >
            <div className={`${modalBorder.outerBorderRadiusClass} p-px shadow-2xl ${modalBorder.gradientClass}`}>
              <div
                className="bg-container-primary overflow-hidden"
                style={modalBorder.innerBorderRadiusStyle}
              >
                {showHeader && (
                  <div className="flex items-center justify-between p-4 pb-0">
                    <h2 className="text-lg font-semibold text-primary-text">{title}</h2>
                    <button
                      type="button"
                      onClick={onClose}
                      className="p-1 hover:bg-base-10 rounded-lg transition-colors"
                    >
                      <Icon icon="solar:close-circle-linear" className="w-5 h-5 text-text-60" />
                    </button>
                  </div>
                )}
                <div className={contentClassName + " shadow-[0_0_30px_rgba(0,0,0,0.07)]"}>{children}</div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
