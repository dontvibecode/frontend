"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const features = [
    { text: "Learn to code", id: "learn", color: "text-pink-400" },
    { text: "Tailored lessons", id: "tailored", color: "text-blue-400" },
    { text: "Interactive snippets", id: "interactive", color: "text-green-400" },
    { text: "Relevant sources", id: "sources", color: "text-yellow-400" },
    { text: "Track your progress", id: "track", color: "text-purple-400" },
    { text: "Improve", id: "improve", color: "text-orange-400" },
  ];

  // Calculate which line should be highlighted based on scroll
  const [activeLineIndex, setActiveLineIndex] = useState(-1);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const windowHeight = window.innerHeight;
      const screenCenter = windowHeight / 2;

      // Find the element closest to the center of the screen
      const lineElements = document.querySelectorAll(".feature-line");
      let closestIndex = -1;
      let closestDistance = Infinity;

      lineElements.forEach((element, index) => {
        const rect = element.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2;
        const distance = Math.abs(elementCenter - screenCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveLineIndex(closestIndex);

      // Position cursor based on the closest element
      if (lineElements[closestIndex]) {
        const rect = lineElements[closestIndex].getBoundingClientRect();
        setCursorPosition({
          x: rect.left - 60, // Position cursor to the left of text
          y: rect.top + rect.height / 2 - 20, // Center vertically
        });
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial call

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-[300vh] overflow-x-hidden bg-white pt-14">
      <div className="relative inset-0 z-0 w-[calc(100%-2rem)] h-[calc(100vh-2rem-3.5rem)] rounded-3xl overflow-hidden border border-gray-200 m-[1rem]">
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
          <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl"
          >
              <img src="/text.png" alt="Logo" className="w-auto h-20 mb-4 invert" />
              <p className="text-xl md:text-2xl text-white/90 mb-2">
              Code like it matters. Think deeper.
              </p>
              <p className="text-xl md:text-2xl text-white/90 mb-4">
              Build better. No AI crutches.
              </p>

              {/* Question Input */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 max-w-2xl mx-auto shadow-2xl">
              <p className="text-gray-600 mb-4 text-left">
                  What's not working? Let's think it through
              </p>
              <div className="flex items-center gap-3">
                  <button className="px-6 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all">
                  Beginner
                  </button>
                  <button className="px-6 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all">
                  Gemini
                  </button>
                  <button className="ml-auto w-10 h-10 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition-all">
                  <svg
                      viewBox="0 0 24 24"
                      fill="white"
                      className="w-5 h-5"
                  >
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                  </button>
              </div>
              </div>
          </motion.div>
          </section>

        </div>
        <Image
          src="/splash.png"
          alt="Background"
          fill
          className="absoluteobject-cover"
          priority
        />
      </div>

      {/* Animated Cursor */}
      <motion.div
        className="fixed z-50 pointer-events-none"
        animate={{
          x: cursorPosition.x,
          y: cursorPosition.y,
        }}
        transition={{
          type: "spring",
          damping: 20,
          stiffness: 100,
        }}
        style={{
          width: "40px",
          height: "40px",
        }}
      >
        <Image
          src="/cursor.png"
          alt="Cursor"
          width={40}
          height={40}
          className="drop-shadow-lg"
        />
      </motion.div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-4">
        <div className="flex items-center">
          <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-full" />
        </div>
        <div className="flex items-center gap-4">
          <button className="px-6 py-2 rounded-full bg-white/10 backdrop-blur-sm text-gray-800 hover:bg-white/20 transition-all">
            Hello
          </button>
          <button className="px-6 py-2 rounded-full bg-black text-white hover:bg-gray-800 transition-all">
            Hello
          </button>
        </div>
      </header>

      {/* Features Section with Scroll Animation */}
      <section className="relative z-10 min-h-[200vh] flex items-start justify-center pt-20 pb-40 px-4">
        <div className="max-w-4xl w-full">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className={`feature-line py-4 transition-all duration-500 text-6xl md:text-8xl`}
            >
              <motion.h2
                className={`font-bold transition-all duration-500 ${
                  activeLineIndex === index
                    ? feature.color
                    : "text-gray-300"
                }`}
              >
                {feature.text}
              </motion.h2>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Spacer */}
      <div className="relative z-10 h-screen"></div>
    </div>
  );
}

