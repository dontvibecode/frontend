"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import FluidImage from "./components/FluidImage";
import FontFeature from "./components/FontFeature";

function ScrollingFeatures() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false });
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  
  const xOffset = useTransform(scrollYProgress, [0, 1], ["-80px", "80px"]);

  return (
    <div ref={containerRef} className="relative overflow-hidden w-full border-r border-l border-gray-300 py-12">
      <motion.div 
        style={{ x: xOffset }}
        className="grid grid-cols-3 -ml-[30px] w-[calc(100%+60px)] gap-4"
      >
        <motion.div
          animate={{
            borderRadius: isInView ? "5rem" : "1rem" 
          }} 
          transition={{ duration: 0.4, ease: "easeOut" }} 
          className="relative w-full aspect-square bg-gray-300 rounded-[4rem] overflow-hidden">
            <FluidImage
              isStatic={true}
              src="https://i.ibb.co/q3hSWLMM/image.png"
              alt="Info 1"
              className="w-full h-full object-cover"
              fluidIntensity={0.0006}
              cursorRadius={0.001}
            />
        </motion.div>
        <motion.div
          animate={{
            borderRadius: isInView ? "5rem" : "1rem" 
          }} 
          transition={{ duration: 0.4, ease: "easeOut" }} 
          className="w-full aspect-square bg-gray-300 rounded-[4rem] overflow-hidden">
            <FluidImage
              isStatic={true}
              src="https://i.ibb.co/0xg5dJZ/image.png"
              alt="Info 1"
              className="w-full h-full object-cover"
              fluidIntensity={0.0006}
              cursorRadius={0.001}
            />
        </motion.div>
        <motion.div
          animate={{
            borderRadius: isInView ? "5rem" : "1rem" 
          }} 
          transition={{ duration: 0.4, ease: "easeOut" }} 
          className="w-full aspect-square bg-gray-300 rounded-[4rem] overflow-hidden">
            <FluidImage
              isStatic={true}
              src="https://i.ibb.co/QF8rWzxt/image.png"
              alt="Info 1"
              className="w-full h-full object-cover"
              fluidIntensity={0.0006}
              cursorRadius={0.001}
            />
        
        </motion.div>
      </motion.div>
    </div>
  );
}

function PricingSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const isInView = useInView(sectionRef, { once: false });
  
  return (
    <div ref={sectionRef} className="flex flex-row w-[155%] sm:w-full items-stretch justify-center gap-3">
      <motion.div animate={{ x: isInView ? 0 : 20, display: isInView ? "block" : "none" }} transition={{ duration: 0.5, ease: "easeOut", delay: 0 }} initial={{ x: 90 }} className="w-[2%] bg-gray-50 rounded-2xl"></motion.div>
      <motion.div animate={{ x: isInView ? 0 : 40, display: isInView ? "block" : "none" }} transition={{ duration: 0.5, ease: "easeOut", delay: 0 }} initial={{ x: 80 }} className="w-[4%] bg-gray-300 opacity-10 rounded-2xl"></motion.div>
      <motion.div animate={{ x: isInView ? 0 : 30, display: isInView ? "block" : "none" }} transition={{ duration: 0.5, ease: "easeOut", delay: 0 }} initial={{ x: 60 }} className="w-[6%] bg-gray-300 opacity-20 rounded-2xl"></motion.div>
      <motion.div animate={{ x: isInView ? 0 : 20, display: isInView ? "block" : "none" }} transition={{ duration: 0.5, ease: "easeOut", delay: 0 }} initial={{ x: 40 }} className="w-[8%] bg-gray-300 opacity-30 rounded-2xl"></motion.div>
      <div className="relative bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-[0_0_70px_0_rgba(0,0,0,0.08)] w-full max-w-2xl">
        {/* Header */}
        <div className="grid grid-cols-3 border-b border-gray-100">
          <div className="p-6 flex items-end">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider"></span>
          </div>
          <div className="p-6 text-center border-x border-gray-100">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Free</span>
            <p className="text-2xl font-semibold text-gray-900 mt-1">$0</p>
            <p className="text-xs text-gray-400">forever</p>
          </div>
          <div className="p-6 text-center bg-gray-50">
            <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Pro</span>
            <p className="text-2xl font-semibold text-gray-900 mt-1">$5</p>
            <p className="text-xs text-gray-400">per month</p>
          </div>
        </div>

        {/* Tokens Section */}
        <div className="grid grid-cols-3 border-b border-gray-100 bg-gray-50/30">
          <div className="p-3 flex items-center">
            <span className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Tokens</span>
          </div>
          <div className="p-3 border-x border-gray-100"></div>
          <div className="p-3 bg-gray-50/50"></div>
        </div>
        {[
          { feature: "Monthly tokens included", free: "5,000", paid: "50,000", tooltip: "Tokens refresh monthly" },
          { feature: "Models", free: "Gemini 2.5 Pro", paid: "Gemini Pro, Sonnet", tooltip: "Tokens refresh monthly" },
        ].map((row, index) => (
          <div key={`tokens-${index}`} className="grid grid-cols-3 border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
            <div className="p-4 flex items-center">
              <span className="text-sm text-gray-700 border-b border-dashed border-gray-300 cursor-help" title={row.tooltip}>{row.feature}</span>
            </div>
            <div className="p-4 flex items-center justify-center border-x border-gray-100">
              {typeof row.free === "boolean" ? (
                <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {row.free}
                </span>
              )}
            </div>
            <div className="p-4 flex items-center justify-center bg-gray-50/50">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {row.paid}
              </span>
            </div>
          </div>
        ))}

        {/* Lesson Generation Section */}
        <div className="grid grid-cols-3 border-b border-gray-100 bg-gray-50/30">
          <div className="p-3 flex items-center">
            <span className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Lessons</span>
          </div>
          <div className="p-3 border-x border-gray-100"></div>
          <div className="p-3 bg-gray-50/50"></div>
        </div>
        {[
          { feature: "Generate lessons", free: "500 tokens", paid: "500 tokens", tooltip: "AI-generated coding lessons tailored to you" },
          { feature: "Fast lesson generation", free: false, paid: "750 tokens", tooltip: "Generate lessons 2x faster with premium models" },
          { feature: "Lesson history", free: "7 days", paid: "Unlimited", tooltip: "Access your past lessons" },
        ].map((row, index) => (
          <div key={`lessons-${index}`} className="grid grid-cols-3 border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
            <div className="p-4 flex items-center">
              <span className="text-sm text-gray-700 border-b border-dashed border-gray-300 cursor-help" title={row.tooltip}>{row.feature}</span>
            </div>
            <div className="p-4 flex items-center justify-center border-x border-gray-100">
              {typeof row.free === "boolean" ? (
                <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {row.free}
                </span>
              )}
            </div>
            <div className="p-4 flex items-center justify-center bg-gray-50/50">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {row.paid}
              </span>
            </div>
          </div>
        ))}

        {/* Exercises Section */}
        <div className="grid grid-cols-3 border-b border-gray-100 bg-gray-50/30">
          <div className="p-3 flex items-center">
            <span className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Exercises</span>
          </div>
          <div className="p-3 border-x border-gray-100"></div>
          <div className="p-3 bg-gray-50/50"></div>
        </div>
        {[
          { feature: "Interactive exercises", free: true, paid: true, tooltip: "Hands-on coding practice" },
          { feature: "Real-time AI feedback", free: "150 tokens", paid: "150 tokens", tooltip: "Get instant feedback on your solutions" },
          { feature: "Generate additional exercises", free: "5 per lesson", paid: "Unlimited", tooltip: "Create more practice problems" },
          { feature: "Solution explanations", free: "5 per day", paid: "Unlimited", tooltip: "Detailed breakdowns of optimal solutions" },
        ].map((row, index) => (
          <div key={`exercises-${index}`} className="grid grid-cols-3 border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50 transition-colors">
            <div className="p-4 flex items-center">
              <span className="text-sm text-gray-700 border-b border-dashed border-gray-300 cursor-help" title={row.tooltip}>{row.feature}</span>
            </div>
            <div className="p-4 flex items-center justify-center border-x border-gray-100">
              {typeof row.free === "boolean" ? (
                row.free ? (
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )
              ) : (
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {row.free}
                </span>
              )}
            </div>
            <div className="p-4 flex items-center justify-center bg-gray-50/50">
              {typeof row.paid === "boolean" ? (
                row.paid ? (
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )
              ) : (
                <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {row.paid}
                </span>
              )}
            </div>
          </div>
        ))}

        {/* CTA Row */}
        <div className="grid grid-cols-3 border-t border-gray-100">
          <div className="p-4"></div>
          <div className="p-4 flex items-center justify-center border-x border-gray-100">
            <Link href="/chat" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors underline">
              Get Started
            </Link>
          </div>
          <div className="p-4 flex items-center justify-center bg-gray-50">
            <button className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-full hover:bg-gray-800 transition-colors">
              Upgrade
            </button>
          </div>
        </div>
      </div>
      <motion.div animate={{ x: isInView ? 0 : -20, display: isInView ? "block" : "none" }} initial={{ x: -40 }} transition={{ duration: 0.5, ease: "easeOut", delay: 0 }} className="w-[8%] bg-gray-300 opacity-30 rounded-2xl"></motion.div>
      <motion.div animate={{ x: isInView ? 0 : -30, display: isInView ? "block" : "none" }} initial={{ x: -60 }} transition={{ duration: 0.5, ease: "easeOut", delay: 0 }} className="w-[6%] bg-gray-300 opacity-20 rounded-2xl"></motion.div>
      <motion.div animate={{ x: isInView ? 0 : -40, display: isInView ? "block" : "none" }} initial={{ x: -80 }} transition={{ duration: 0.5, ease: "easeOut", delay: 0}} className="w-[4%] bg-gray-300 opacity-10 rounded-2xl"></motion.div>
      <motion.div animate={{ x: isInView ? 0 : -50, display: isInView ? "block" : "none" }} initial={{ x: -90 }} transition={{ duration: 0.5, ease: "easeOut", delay: 0 }} className="w-[2%] bg-gray-50 rounded-2xl"></motion.div>
    </div>
  );
}

function InfoSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const isInView = useInView(sectionRef, { once: false });
  
  const yParallax = useTransform(scrollYProgress, [0, 1], ["200px", "-150px"]);

  return (
    <div ref={sectionRef} className="w-full grid grid-cols-[30%_70%] max-w-7xl overflow-visible">
      <div className="relative overflow-hidden rounded-[3rem]">
        <motion.div 
          style={{ y: yParallax }}
          className="w-full aspect-auto sm:aspect-[2/3] overflow-hidden object-cover flex flex-col gap-4"
        >
          <FluidImage
            isStatic={true}
            src="https://i.ibb.co/1JXNB6M9/image.png"
            alt="Info 1"
            className="hidden sm:block w-full h-full object-cover rounded-[3rem]"
            fluidIntensity={0.0006}
            cursorRadius={0.001}
          />
          <FluidImage
            isStatic={true}
            src="https://i.ibb.co/bj1hh6k4/image.png"
            alt="Info 1"
            className="block sm:hidden w-full h-full object-cover rounded-[3rem] aspect-square"
            fluidIntensity={0.0006}
            cursorRadius={0.001}
          />
          <FluidImage
            isStatic={true}
            src="https://i.ibb.co/B2ksDSt3/image.png"
            alt="Info 1"
            className="block sm:hidden w-full h-full object-cover rounded-[3rem] aspect-square"
            fluidIntensity={0.0006}
            cursorRadius={0.001}
          />
          <FluidImage
            isStatic={true}
            src="https://i.ibb.co/8n3zcMWv/image.png"
            alt="Info 1"
            className="block sm:hidden w-full h-full object-cover rounded-[3rem] aspect-square"
            fluidIntensity={0.0006}
            cursorRadius={0.001}
          />
        </motion.div>
      </div>
      <div className="w-full pl-4 flex flex-col gap-6 py-6">
        <div className="flex flex-col ml-4 gap-4">
          <p className="text-4xl sm:text-6xl max-w-2xl text-gray-300">A fun and interactive way to learn code</p>
          <p className="text-base max-w-xl text-gray-400">Structured, AI-guided lessons paired with interactive exercises that explain your code, catch mistakes, and help concepts actually click.</p>
        </div>
        {isInView && (
          <div className="hidden sm:flex flex-row gap-4">
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: isInView ? 0 : 50, opacity: isInView ? 1 : 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full aspect-[1] bg-gray-100 rounded-[3rem] overflow-hidden"
            >
              <FluidImage
                isStatic={true}
                src="https://i.ibb.co/bj1hh6k4/image.png"
                alt="Info 1"
                className="w-full h-full object-cover"
                fluidIntensity={0.0006}
                cursorRadius={0.001}
              />
            </motion.div>
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: isInView ? 0 : 50, opacity: isInView ? 1 : 0 }}
              transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
              className="w-full aspect-[1] bg-gray-100 rounded-[3rem] overflow-hidden"
            >
              <FluidImage
                isStatic={true}
                src="https://i.ibb.co/B2ksDSt3/image.png"
                alt="Info 1"
                className="w-full h-full object-cover"
                fluidIntensity={0.0006}
                cursorRadius={0.001}
              />
            </motion.div>
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: isInView ? 0 : 50, opacity: isInView ? 1 : 0 }}
              transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
              className="w-full aspect-[1] bg-gray-100 rounded-[3rem] overflow-hidden"
            >
              <FluidImage
                isStatic={true}
                src="https://i.ibb.co/8n3zcMWv/image.png"
                alt="Info 1"
                className="w-full h-full object-cover"
                fluidIntensity={0.0006}
                cursorRadius={0.001}
              />
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

function BoxInView({ className, children }: { className?: string, children?: React.ReactNode }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(boxRef, { once: false });
  const [isAboveViewport, setIsAboveViewport] = useState(false);

  useEffect(() => {
    const checkPosition = () => {
      if (!boxRef.current) return;
      const rect = boxRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // If element is not in view, determine if it's above or below
      if (!isInView) {
        // Element center is above viewport center means it's coming from above
        setIsAboveViewport(rect.top + rect.height / 2 < viewportHeight / 2);
      }
    };

    checkPosition();
    window.addEventListener("scroll", checkPosition, { passive: true });
    return () => window.removeEventListener("scroll", checkPosition);
  }, [isInView]);

  const yOffset = isAboveViewport ? 30 : -30;
  const yOffsetOut = isAboveViewport ? 30 : -30;

  return (
    <motion.div 
      ref={boxRef} 
      initial={{ scale: 0.8, y: yOffset, borderRadius: "0.5rem" }} 
      animate={{ 
        scale: isInView ? 1 : 0.8, 
        y: isInView ? 0 : yOffsetOut, 
        borderRadius: isInView ? "3rem" : "0.5rem" 
      }} 
      transition={{ duration: 0.4, ease: "easeOut" }} 
      className={`col-span-1 aspect-[3/2] w-full overflow-hidden shadow-[0_0_70px_0_rgba(0,0,0,0.08)] ${className}`}
    >
      {children}
    </motion.div>
  );
}

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
    { text: "Interactive coding", id: "interactive", color: "text-green-400" },
    { text: "Relevant sources", id: "sources", color: "text-yellow-400" },
    { text: "Track your progress", id: "track", color: "text-purple-400" },
    { text: "Bookmark your favorites", id: "improve", color: "text-orange-400" },
  ];

  // Calculate which line should be highlighted based on scroll
  const [activeLineIndex, setActiveLineIndex] = useState(-1);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const windowHeight = window.innerHeight;
      const screenCenter = windowHeight / 2;

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
    handleScroll();  

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-[300vh] overflow-x-hidden bg-white pt-14">
      <div className="relative inset-0 z-0 w-[calc(100%-2rem)] h-auto aspect-square sm:h-[calc(100vh-2rem-3.5rem)] rounded-3xl overflow-hidden border border-gray-200 m-[1rem]">
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <section className="relative w-full h-full z-10 min-h-0 sm:min-h-screen flex flex-col items-center justify-center px-2 sm:px-4 py-2 sm:py-4">
          <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, opacity: { duration: 0.1 } }}
              className="text-center max-w-4xl flex flex-col justify-between w-full h-full sm:h-auto"
          >
            <div className="h-10"/>
              <div className="flex flex-col items-center justify-center">
                <img src="/text.png" alt="Logo" className="w-auto h-10 sm:h-20 mb-4 invert" />
                <p className="text-sm sm:text-xl md:text-2xl text-white sm:text-white/90 mb-2">
                Code like it matters. Think deeper.
                </p>
                <p className="relative z-30 text-sm sm:text-xl md:text-2xl text-white sm:text-white/90 mb-4">
                Build better. No AI crutches.
                </p>
              </div>

              <div className="bg-white/5 shadow-[inset_0_0_50px_0_rgba(244,244,244,0.2)] backdrop-blur-xs border border-white/30 rounded-3xl p-3 sm:p-5 max-w-2xl w-full mx-auto pointer-events-auto">
              <input 
                type="text" 
                className="placeholder:text-white/80 text-sm sm:text-base text-white pb-0 sm:pb-4 m-2 sm:m-0 text-left w-full outline-none" 
                placeholder="What's not working? Let's think it through" 
              />
              <div className="flex items-center gap-3">
                <button className="cursor-pointer px-4 sm:px-6 py-1 sm:py-2 rounded-full bg-white/20 backdrop-blur-8xl text-white border border-white/10 hover:bg-white/30 transition-all text-sm sm:text-base">
                Beginner
                </button>
                <button className="cursor-pointer px-4 sm:px-6 py-1 sm:py-2 rounded-full bg-white/20 backdrop-blur-4xl text-white border border-white/10 hover:bg-white/30 transition-all text-sm sm:text-base">
                Gemini
                </button>
                <Link href="/chat" className="cursor-pointer ml-auto w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center text-black hover:bg-gray-800 transition-all -rotate-45 text-sm sm:text-base">
                  <svg className="opacity-70" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m5 12l-.604-5.437C4.223 5.007 5.825 3.864 7.24 4.535l11.944 5.658c1.525.722 1.525 2.892 0 3.614L7.24 19.466c-1.415.67-3.017-.472-2.844-2.028zm0 0h7"/></svg>
                </Link>
              </div>
              </div>
          </motion.div>
          </section>

        </div>
        <FluidImage
          src="https://images.unsplash.com/photo-1761767380566-7a86c3e653a3?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
          fluidIntensity={0.0003}
          cursorRadius={0.0003}
        />
      </div>

      {/* <motion.div
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
      </motion.div> */}

      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-4">
        <div className="flex items-center">
          <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-full" />
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-white/0 shadow-[inset_0_0_50px_0_rgba(244,244,244,0.2)] backdrop-blur-lg border border-white/30 rounded-3xl px-6 py-2 max-w-2xl mx-auto text-black">
            Features
          </button>
          <button className="bg-white/0 shadow-[inset_0_0_50px_0_rgba(244,244,244,0.2)] backdrop-blur-lg border border-white/30 rounded-3xl px-6 py-2 max-w-2xl mx-auto text-black">
            Pricing
          </button>
          <Link href="/chat" className="cursor-pointer px-5 pr-4 py-2 rounded-full bg-black text-white hover:bg-gray-800 transition-all flex items-center gap-2">
          Chat
          <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                >
                  <path
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="0.4"
                    d="M2.499 11a.5.5 0 0 1 .477.348l.256.797a1.01 1.01 0 0 0 .63.633l.789.248a.5.5 0 0 1 .001.954l-.79.252a1 1 0 0 0-.63.633l-.252.787a.5.5 0 0 1-.95.008l-.266-.79a1.03 1.03 0 0 0-.636-.639l-.781-.252a.5.5 0 0 1-.002-.95l.794-.26a1.02 1.02 0 0 0 .636-.634l.248-.786A.5.5 0 0 1 2.5 11ZM1 7.513a1 1 0 0 1 .69-.953l2.583-.844a3.95 3.95 0 0 0 2.465-2.457l.808-2.56A1 1 0 0 1 9.452.695l.832 2.598a3.9 3.9 0 0 0 2.448 2.453l2.569.811a1 1 0 0 1 .004 1.906l-2.572.823a3.9 3.9 0 0 0-2.449 2.454l-.82 2.565a1 1 0 0 1-1.9.014l-.866-2.567v-.002A3.97 3.97 0 0 0 4.24 9.284l-2.547-.821A1 1 0 0 1 1 7.513"
                  ></path>
                </svg>
          </Link>
        </div>
      </header>

      <section className="relative z-10 flex items-start justify-center py-10 px-4">
        <div className="max-w-4xl w-full">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className={`text-center sm:text-left feature-line py-2 sm:py-6 transition-all duration-500 text-4xl sm:text-6xl md:text-8xl`}
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

      <section className="relative  z-10 flex items-start justify-center mx-auto">
        <div className="h-[1px] bg-gray-300 w-full absolute bottom-0 left-0 right-0"/>
        <div className="h-[1px] bg-gray-300 w-full absolute top-0 left-0 right-0"/>
        <div className="max-w-7xl ">
          <ScrollingFeatures />
        </div>
      </section>

      <section className="px-4 mt-20 min-h-[10vh] flex flex-col items-center justify-center gap-20">
        <InfoSection />
      </section>

      <section className="my-10 min-h-auto sm:min-h-[100vh] flex flex-col items-center justify-center gap-20">
        <div className="px-4 w-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            width="100%"
            height="100"
            fill="none"
            className="opacity-10 text-black"
            viewBox="0 0 1657 316"
          >
            <path fill="url(#pattern0_1120_2)" d="M0 0h1657v316H0z"></path>
            <defs>
              <pattern
                id="pattern0_1120_2"
                width="1"
                height="1"
                patternContentUnits="objectBoundingBox"
              >
                <use xlinkHref="#image0_1120_2" transform="scale(.0006 .00316)"></use>
              </pattern>
              <FontFeature />
            </defs>
          </svg>
        </div>
        
        <div className="flex flex-col gap-4 mx-4 max-w-7xl">
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BoxInView className="relative order-2 sm:order-0 border border-gray-100 bg-white flex flex-col justify-center items-center gap-4">
              <div className="absolute top-0 left-0 right-0 mx-auto w-full h-full max-w-md border-x-[1px] border-gray-300">
              </div>
              <span className="h-[1px] bg-gray-300 w-full rounded-full"/>
              <div className="relatieve z-20 max-w-md text-center text-lg px-4 font-regular text-gray-400">
                <p>Our AI understands how you think and builds a personalized learning path with interactive exercises that help you actually master coding concepts.</p>
              </div>
              <span className="h-[1px] bg-gray-300 w-full rounded-full"/>
            </BoxInView>
            <BoxInView>
              <FluidImage
                src="https://i.ibb.co/XrTR0jxF/image.png"
                alt="Image"
                className="w-full h-full object-cover rounded-3xl"
                fluidIntensity={0.0006}
                cursorRadius={0.001}
              />
            </BoxInView>
          </div>

          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BoxInView>
              <FluidImage
                src="https://i.ibb.co/TMKQxGmG/image.png"
                alt="Image"
                className="w-full h-full object-cover rounded-3xl"
                fluidIntensity={0.0006}
                cursorRadius={0.001}
              />
            </BoxInView>
            <BoxInView>
              <FluidImage
                src="https://i.ibb.co/d0vgBLdM/image.png"
                alt="Image"
                className="w-full h-full object-cover rounded-3xl"
                fluidIntensity={0.0006}
                cursorRadius={0.001}
              />
            </BoxInView>
          </div>

          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BoxInView>
              <FluidImage
                src="https://i.ibb.co/JWjw1qbq/image.png"
                alt="Image"
                className="w-full h-full object-cover rounded-3xl"
                fluidIntensity={0.0006}
                cursorRadius={0.001}
              />
            </BoxInView>
            <BoxInView className="relative border order-first sm:order-none border-gray-100 bg-white flex flex-col justify-center items-center gap-4">
              <div className="absolute top-0 left-0 right-0 mx-auto w-full h-full max-w-md border-x-[1px] border-gray-300">
              </div>
              <span className="h-[1px] bg-gray-300 w-full rounded-full"/>
              <div className="relatieve z-20 max-w-md text-center text-lg px-4 font-regular text-gray-400">
                <p>Code, submit, and learn faster. Our AI analyzes your solutions in real time, tells you what’s right or wrong, and guides you toward cleaner, more efficient code.</p>
              </div>
              <span className="h-[1px] bg-gray-300 w-full rounded-full"/>
            </BoxInView>
          </div>
        </div>

      </section>

      <section className="mx-4 mt-20 my-10 min-h-[100vh] flex flex-col items-center justify-center gap-20">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          width="400"
          height="100"
          fill="none"
          viewBox="0 0 795 195"
        >
          <path fill="url(#pattern0_1104_6)" d="M0 0h795v195H0z"></path>
          <defs>
            <pattern
              id="pattern0_1104_6"
              width="1"
              height="1"
              patternContentUnits="objectBoundingBox"
            >
              <use xlinkHref="#image0_1104_6" transform="scale(.00126 .00513)"></use>
            </pattern>
            <image
              xlinkHref="data:image/png;base64,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"
              id="image0_1104_6"
              width="795"
              height="195"
              preserveAspectRatio="none"
            ></image>
          </defs>
        </svg>
        <PricingSection />
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

function Footer() {
  const footerRef = useRef<HTMLDivElement>(null);
  const productLinks = [
    { label: "Features", href: "#" },
    { label: "Pricing", href: "#" },
    { label: "Integrations", href: "#" },
    { label: "Changelog", href: "#" },
  ];

  const resourceLinks = [
    { label: "Documentation", href: "#" },
    { label: "Tutorials", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Support", href: "#" },
  ];

  const companyLinks = [
    { label: "About", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Partners", href: "#" },
  ];

  return (
    <footer ref={footerRef} className="relative z-10">
      <div className="mx-4 relative bg-white border border-gray-200 rounded-3xl overflow-hidden mb-14 shadow-[0_0_70px_0_rgba(0,0,0,0.08)]">
        <div className="relative z-10 px-8 md:px-12 pt-12 pb-8">
          <div className="flex flex-col lg:flex-row justify-between gap-12">
            <div className="max-w-md">
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-full" />
                <span className="font-semibold text-xl text-gray-900">dontvibecode</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                dontvibecode makes learning code simple, fun, and intuitive. Learn better, build faster, and level up skills that stay with you.              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-8 lg:gap-16">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
                <ul className="space-y-3">
                  {productLinks.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Resources</h3>
                <ul className="space-y-3">
                  {resourceLinks.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
                <ul className="space-y-3">
                  {companyLinks.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mt-12 pt-8 border-t border-gray-200">
            <p className="text-gray-500 text-sm">© 2025 dontvibe. All rights reserved.</p>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-500 hover:text-gray-700 text-sm underline transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-500 hover:text-gray-700 text-sm underline transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-500 hover:text-gray-700 text-sm underline transition-colors">Cookies Settings</a>
            </div>
          </div>
        </div>
      </div>

      <motion.div 
        className="relative -ml-[20vw] w-[300vw] sm:w-[140vw] pointer-events-none overflow-hidden"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          version="1"
          style={{ opacity: 0.09, marginBottom: "-30px" }}
          viewBox="0 0 1452 192"
        >
          <path d="M38.2 17.2C17.6 19.8 11.1 27.3 9 51.3c-1.2 13.7-1.2 64.5-.1 85.8 1 17.8 2.2 21.2 9.3 27.3 7.5 6.4 11.4 7 44.8 7.1 32 0 35.4-.4 46.8-5.6 14.2-6.5 28.3-19 36-31.9 3.7-6.2 9.3-21.1 10.4-27.5.2-1.1 1.3 2.7 2.5 8.4 4.9 23.1 17.4 39.8 37.5 49.9 22.3 11.3 45.8 11.2 68.8-.1 12.1-5.9 23.9-17.7 30.1-29.9 2.4-4.9 4.7-8.8 5-8.8s.9 5 1.3 11c1.3 22.3 4.5 29 16.1 34.1 12.6 5.6 27 0 30.5-11.9.6-2 1.4-9.8 1.7-17.4.3-7.5 1-14.2 1.5-15 1.5-2.3 5.1 3.1 8.2 12.7 6 18.3 7.9 22.5 12.1 26.9 5.2 5.3 11.4 7.6 20.9 7.6 7.9 0 15.3-2.8 19.3-7.1 8.3-9.2 11.8-25.7 13.5-62.9.6-14.6 1.2-26.6 1.3-26.7.1-.2 1.9.6 4.1 1.8 3.1 1.6 5 1.9 9.4 1.4 4.7-.5 6-.3 8 1.3 2.3 1.8 2.5 2.7 2.4 9.4-.1 4-1.6 14.2-3.4 22.8-2.6 12.6-3.1 16.8-2.6 22.5 1.7 20.4 11.7 33.6 27.1 36 8.8 1.4 19.6-5.5 24-15.4.9-2 2-4.5 2.5-5.6 1.5-3.4 2.8-9.6 4.1-19.8 1-7.8 1-12.5 0-23-2.3-24.8-2.2-25 6.9-24 5.5.5 5.8.4 9.8-3.1 2.5-2.3 4.7-5.5 5.8-8.7l1.8-5 1.7 10.3c3.9 24.3 11.9 46.4 23.3 64.8 8.3 13.5 16.6 22.1 26.6 27.7 5.9 3.2 7.2 3.6 14 3.6 6.3 0 8.4-.4 13-2.8 7.5-3.8 12.1-7.7 18.8-15.9 8.4-10.4 9.9-12.8 16.2-25 9.2-17.8 14.5-34.2 18.1-55.6 2.5-15.1 2.3-32.9-.5-39.5-2.8-6.7-6.7-11.5-11.5-14.3-3.9-2.3-5.7-2.7-12.1-2.6-19.7.1-28.1 12-37.8 53.4-2 8.5-3.3 12.5-4.3 12.5s-2.2-4.9-4.5-18c-6.7-39-12.9-47.9-32.9-47.7-7.3 0-13.7 2.6-18.2 7.4-4.3 4.4-8.2 14.4-9 22.5l-.6 6.6-2.5-4.9c-4.9-9.7-7.9-12.2-18.7-15.6-6.3-2.1-9-2.3-27.5-2.2-17.7 0-21.7.3-29.3 2.2-13.4 3.4-17.4 5.8-22.2 13.8l-2.1 3.5-2.3-4.3c-3.6-6.6-8-10.6-13.8-12.8-6.7-2.5-13.9-2.6-19.5-.1-5.2 2.2-7.1 4.2-9.9 10.6-2 4.4-2.3 7.3-2.8 23.2-.3 10-.9 18.4-1.2 18.7-2.5 2.5-6.8-5-12.4-21.9-6.1-18.2-9.9-23.7-18.6-27.4-7.1-3.1-18.1-3.1-24.4-.1-9 4.4-14.7 15-16.9 31.6-.7 5.8-1.5 10.7-1.8 11s-1.8-2.1-3.2-5.2c-5.5-12-17.6-26.5-25.2-30.4-1.6-.8-3.6-1.9-4.4-2.5-.8-.7-4-2.2-7-3.5-26.3-11.1-56.2-7-77.6 10.5-11.9 9.8-19.2 21.2-24.1 38l-1.7 6-.9-8.5c-.9-8.7-5-24.3-7.1-27-.6-.8-1.8-2.8-2.6-4.5-2.2-4.4-14.9-16.5-21.2-20.3C111 24.4 91.7 19 67.5 17c-13.8-1.1-19.1-1.1-29.3.2m44.2 51.2c4.4 1.8 6.6 5.2 6.6 9.9 0 3.1-.7 4.6-3.4 7.3-3 3-4 3.4-8.8 3.4-6.3 0-8.2-1.4-9.2-7.2-.8-4.6.8-11.9 3-13.5 2.3-1.7 7.6-1.6 11.8.1M237.3 82c3.7 4.1 3.5 7.4-.7 11.6-4.1 4.1-8.4 4.5-13.3 1.1-5.8-3.8-5.9-10.7-.3-14.5 4.8-3.2 10.4-2.5 14.3 1.8M1001.3 18.4c-21.9 4.2-35.8 12.5-51.5 30.9-6.8 7.9-14.2 27.7-15.5 41.3l-.6 6.3-2-3.9c-3.6-7.3-8.4-9.3-23.2-9.4-7.8-.1-9-.3-9.3-1.9-.8-3.9 1.7-5 9.5-4.3 8.6.7 14.2-1 19-5.6 9.5-9.2 7.7-24.9-3.7-32.4-12.1-8.1-43.2-8.5-60-.8-11.6 5.3-18.2 15.7-20 31.3-.5 4.7-1 17-1 27.3 0 10.4-.4 18.8-.8 18.8-.5 0-1.5-1.9-2.2-4.3-1.6-5.6-5.2-11.6-9.6-16.1-3.6-3.7-3.6-3.7-1.7-5.9 1-1.2 3-4.6 4.4-7.6 2-4.6 2.4-7 2.4-15s-.4-10.3-2.2-13.7c-5-9.3-12-15-23.6-19.1-16.3-5.7-59.6-3.4-75.5 4-10 4.6-10.4 7.8-9.9 70.3.4 53 .5 54.7 5.8 58.5 1.6 1.1 6.8 2.9 11.6 4.1 12.4 2.9 56.6 3.8 66.4 1.4 19.8-5 29.4-15.8 33.5-37.6l1.8-9.5 1.2 7.3c4.8 28 14.7 36.7 44.6 39.8 15.4 1.5 32.9-4.3 39-13.2 3.3-4.7 5.4-13.5 4.4-18.7-1.7-9.3-11.4-14.7-23.8-13.3-7 .8-11.1-1-10.6-4.7.3-2.1.8-2.2 10.8-2.2 5.8 0 11.4-.1 12.5-.3 3.4-.4 9.4-7 10.9-12.1.8-2.6 1.6-4 1.9-3.1 1.6 5.1 3.7 12.4 3.7 13.2 0 .6 1.2 3.8 2.7 7.2 7.7 17.4 23 32.5 41.6 40.9 16.1 7.3 44.3 7.6 60.9.6 11.5-4.9 21-13 26.4-22.5 1.9-3.3 3.4-6.8 3.4-7.7 0-2.4 2.7-2.1 3.5.4.7 2.2 8.4 12 12.4 15.8 17.8 16.9 45.4 24.1 69.6 18.1 13.4-3.3 23.7-9.1 33.6-19 4.7-4.7 9.3-9.9 10.2-11.5 3.9-7.1 6.8-14 8.4-19.6.9-3.2 2-5.9 2.5-5.9.4 0 .8 5.3.8 11.7 0 18.1 1.4 28.7 4.4 33.8 3.1 5.2 9.9 9.9 16.9 11.6 7.1 1.7 49.6.5 58.7-1.6 20.7-4.9 38-19 48.3-39.5 1.5-3 2.7-6.4 2.8-7.5.1-3.7 1.7 1.8 3.4 11.8 3.6 21.2 12.5 31.5 30.2 35.2 17 3.6 33.3 2.4 43.7-3.3s15.3-16.2 12.7-27.6c-2.1-9.4-9.1-13.2-22.3-12.2-8.5.7-10.8-.4-10.8-5V120l11.8.2c11.1.3 11.9.2 15-2.2 5-3.7 7.6-9.3 7.6-16.5 0-7-1.9-11.3-6.6-14.7-2.9-2-4.7-2.3-15-2.7-12.5-.3-14-1-11.7-5.3 1-1.9 1.8-2 8.5-1.5 12.9 1 20.4-3.3 24.3-13.8 2.1-5.4 2.1-5.5.1-11.9-2.1-6.7-7.2-12.6-12.8-14.7-15.7-6-43.7-4.8-58.1 2.5-8.8 4.5-14.9 13.8-17.1 26.1-2.3 13-2.2 12.9-6.5 4.6-11.6-22-35-34.8-70.3-38.2-22.5-2.2-40.4.1-48.1 6.3-6.3 5-9.1 17.6-9.1 41.8 0 12.7-.8 14.3-2.9 5.8-2.8-11.5-13-28.5-20.8-34.6-1.9-1.5-4.6-3.7-6.1-4.9-4.4-3.7-16.2-9-25.2-11.3-44.6-11.4-91 21.9-91 65.2 0 4.3-.4 7.8-.9 7.8-.4 0-1.9-.8-3.2-1.8-7.7-5.9-18.8-7.3-34.9-4.3-15.9 2.9-19.4 2.8-23-.8-5.2-5.2-5.2-11.3.2-16.3 4.2-3.9 9.5-3.8 15.4.1 15.9 10.8 37.3 3.8 43.3-14.1 2.9-8.5 2.8-20.2-.2-28.1-4.3-11.2-13.6-19.2-26.6-22.9-8.7-2.5-27.2-3.2-36.8-1.4M783.2 64.7c4.1 4.6 1.7 10.3-4.2 10.3s-8.1-6.2-3.4-9.9c3.3-2.6 5.6-2.7 7.6-.4m496.5 13.8c5.7 2.4 7.3 4.3 7.3 8.8 0 9.5-14.8 14.6-18 6.1-1.8-4.6-1.2-12.2 1-14.4 2.4-2.4 4.8-2.5 9.7-.5m-135.7 1c3.6 1.8 5 4.3 5 8.5s-4.9 9-9.2 9c-10.1 0-14.6-12.1-6.5-17.1 3.8-2.3 6.8-2.4 10.7-.4M784.1 125c1.3.7 1.9 2.1 1.9 4.5 0 3.7-2 5.5-6.2 5.5-3.5 0-6-2.3-6-5.4 0-4.6 5.6-7.1 10.3-4.6M686 32.9c-8.5 2.7-13.1 6.6-16.9 14.1-5.5 10.8-6.6 20.5-6.6 59.5 0 30.8.2 35.8 1.8 41.4 4.7 16.4 18.6 26.8 32.5 24.1 12.8-2.4 19.7-9.6 22.7-23.9 3.7-17.6 4.1-58.6.8-85.1-2-16.8-5.3-22.9-14.6-27.6-5.5-2.8-15.1-4-19.7-2.5"></path>
        </svg>
        <div className="absolute bottom-0 top-0 left-0 right-0 bg-gradient-to-b from-transparent to-white"></div>
      </motion.div>
    </footer>
  );
}

