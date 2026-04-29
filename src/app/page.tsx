"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  usePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";
import FluidImage from "./components/FluidImage";
import FontFeature from "./components/FontFeature";
import { useTheme } from "./components/ThemeProvider";
import { getGlassGradientBorderClass, getGlassGradientBorderClassInner, getGlassGradientBorderClassRainbow } from "./components/glassGradientBorder";
import ModalTemplate from "./components/ModalTemplate";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import FluidVideo from "./components/FluidVideo";

function CustomTypeface({
  src,
  alt,
  imagePosition = "center",
  plain = false,
  white = false,
}: {
  src: string;
  alt: string;
  imagePosition?: "top" | "center" | "bottom" | string;
  plain?: boolean;
  white?: boolean;
}) {
  const textureSrc = "https://i.ibb.co/p60ctrWz/image.png";
  const texturePosition =
    imagePosition === "top"
      ? "center top"
      : imagePosition === "bottom"
        ? "center bottom"
        : imagePosition === "center"
          ? "center center"
          : imagePosition;
  const { resolvedTheme } = useTheme();

  if(white) {
    return (
      <img src={src} alt={alt} className={`w-auto h-[90px] my-10 mx-auto invert`} />
    );
  }

  if(plain) {
    return (
      <img src={src} alt={alt} className={`w-auto h-[90px] my-10 mx-auto opacity-10 ${resolvedTheme === 'dark' ? 'invert' : ''}`} />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className="opacity-90 w-full max-w-[560px] h-10 sm:h-[90px] my-10 mx-auto"
      style={{
        backgroundImage: `url(${textureSrc})`,
        backgroundSize: "cover",
        backgroundPosition: texturePosition,
        WebkitMaskImage: `url(${src})`,
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        WebkitMaskPosition: "center",
        maskImage: `url(${src})`,
        maskRepeat: "no-repeat",
        maskSize: "contain",
        maskPosition: "center",
      }}
    />
  );
}

function StartNowButton() {
  const { resolvedTheme } = useTheme();
  const lessonCardBorder = getGlassGradientBorderClass(
    resolvedTheme,
    "rounded-4xl",
  );
  const glassBorder = getGlassGradientBorderClassRainbow(
    resolvedTheme,
    "rounded-full",
  );
  const ctaPreviewImageLight = "https://i.ibb.co/spyccjTZ/image.png";
  const ctaPreviewImageDark = "https://i.ibb.co/qYz7H47W/image.png";
  const ctaCalloutBackgroundImage = "https://i.ibb.co/p60ctrWz/image.png";
  const isDarkMode = resolvedTheme === "dark";
  return (
    <div
      className={`relative -mb-1 w-full p-px overflow-hidden shadow-[0_0_70px_0_rgba(0,0,0,0.08)] rounded-t-4xl rounded-b-none ${lessonCardBorder.gradientClass}`}
    >
      <div
        className="w-full min-h-0 overflow-hidden bg-backdrop p-5 pb-0"
        style={{
          borderTopLeftRadius: lessonCardBorder.innerBorderRadiusStyle.borderRadius,
          borderTopRightRadius: lessonCardBorder.innerBorderRadiusStyle.borderRadius,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          borderBottomWidth: 0,
        }}
      >
        <div className="relative w-full overflow-hidden rounded-t-lg">
          <img
            src={ctaPreviewImageLight}
            alt=""
            className="invisible block w-full border border-theme-border h-auto min-h-0 object-contain object-top rounded-t-lg align-top"
            aria-hidden
          />
          <img
            src={ctaPreviewImageLight}
            alt=""
            className="absolute top-0 left-0 w-full border border-theme-border h-full min-h-0 object-contain object-top rounded-t-lg align-top transition-opacity duration-500 ease-out"
            style={{ opacity: isDarkMode ? 0 : 1 }}
          />
          <img
            src={ctaPreviewImageDark}
            alt=""
            className="absolute top-0 left-0 w-full border border-theme-border h-full min-h-0 object-contain object-top rounded-t-lg align-top transition-opacity duration-500 ease-out"
            style={{ opacity: isDarkMode ? 1 : 0 }}
          />
          <div className="absolute inset-0 top-0 left-0 w-full h-full bg-black/10 z-10"/>
        </div>
      </div>
      <motion.div
        initial={{ scale: 1.3 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: false, amount: 0 }}
        transition={{
          type: "spring",
          stiffness: 420,
          damping: 14,
          mass: 0.65,
        }}
        className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-invert-30 backdrop-blur-xl px-5 py-12 rounded-3xl border border-white/20 shadow-[0_0px_32px_rgba(0,0,0,0.1)]"
      >
        <div className={`shadow-[0px_0px_20px_rgba(0,0,0,0.06)] p-px overflow-hidden ${glassBorder.gradientClass} ${glassBorder.outerBorderRadiusClass}`}>
          <Link
            href="/chat"
            style={glassBorder.innerBorderRadiusStyle}
            className="inline-flex items-center justify-center cursor-pointer hover:bg-white px-8 py-6 text-3xl font-light hover:text-black transition-all bg-white/95 backdrop-blur-2xl text-black"
          >
            Start now
          </Link>
        </div>
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

  const { resolvedTheme } = useTheme();
  const glassBorder = getGlassGradientBorderClass(
    resolvedTheme,
    "rounded-3xl",
  );
  
  return (
    <div ref={sectionRef} className="flex flex-row w-[155%] sm:w-full items-stretch justify-center gap-3">
      <motion.div animate={{ x: isInView ? 0 : 20, display: isInView ? "block" : "none" }} transition={{ duration: 0.5, ease: "easeOut", delay: 0 }} initial={{ x: 90 }} className="w-[2%] bg-base-20 opacity-10 rounded-2xl"></motion.div>
      <motion.div animate={{ x: isInView ? 0 : 40, display: isInView ? "block" : "none" }} transition={{ duration: 0.5, ease: "easeOut", delay: 0 }} initial={{ x: 80 }} className="w-[4%] bg-base-20 opacity-20 rounded-2xl"></motion.div>
      <motion.div animate={{ x: isInView ? 0 : 30, display: isInView ? "block" : "none" }} transition={{ duration: 0.5, ease: "easeOut", delay: 0 }} initial={{ x: 60 }} className="w-[6%] bg-base-20 opacity-30 rounded-2xl"></motion.div>
      <motion.div animate={{ x: isInView ? 0 : 20, display: isInView ? "block" : "none" }} transition={{ duration: 0.5, ease: "easeOut", delay: 0 }} initial={{ x: 40 }} className="w-[8%] bg-base-20 opacity-40 rounded-2xl"></motion.div>
      <div className={`relative p-px overflow-hidden shadow-[0_0_70px_0_rgba(0,0,0,0.08)] w-full max-w-2xl ${glassBorder.gradientClass} ${glassBorder.outerBorderRadiusClass}`}>
        <div className="bg-container-primary" style={glassBorder.innerBorderRadiusStyle}>
          {/* Header */}
          <div className="grid grid-cols-3 border-b border-theme-border">
            <div className="p-6 flex items-end">
              <span className="text-xs font-medium text-text-40 uppercase tracking-wider"></span>
            </div>
            <div className="p-6 text-center border-x border-theme-border">
              <span className="text-xs font-medium text-text-40 uppercase tracking-wider">Free</span>
              <p className="text-2xl font-semibold text-primary-text mt-1">$0</p>
              <p className="text-xs text-text-40">forever</p>
            </div>
            <div className="p-6 text-center bg-base-5">
              <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Pro</span>
              <p className="text-2xl font-semibold text-primary-text mt-1">$5</p>
              <p className="text-xs text-text-40">per month</p>
            </div>
          </div>

          {/* Features */}
          {[
            { feature: "Monthly tokens", free: "200,000", paid: "1,000,000", tooltip: "Tokens refresh monthly" },
            { feature: "Conversation context", free: "6 messages", paid: "25 messages", tooltip: "Messages per conversation" },
            { feature: "Submissions with explanation", free: "1 per day", paid: "Unlimited", tooltip: "Get detailed explanations for your code submissions" },
            { feature: "Exercises per lesson", free: "2", paid: "10", tooltip: "Number of exercises available per lesson" },
            { feature: "Additional tokens", free: "Standard price", paid: "Cheaper rates", tooltip: "Purchase extra tokens when needed" },
          ].map((row, index) => (
            <div key={`feature-${index}`} className="grid grid-cols-3 border-b border-theme-border last:border-b-0 hover:bg-base-5 transition-colors">
              <div className="p-4 flex items-center">
                <span className="text-sm text-text-80 border-b border-dashed border-base-30 cursor-help" title={row.tooltip}>{row.feature}</span>
              </div>
              <div className="p-4 flex items-center justify-center border-x border-theme-border">
                <span className="text-sm text-text-60">{row.free}</span>
              </div>
              <div className="p-4 flex items-center justify-center bg-base-5">
                <span className="text-sm font-medium text-text-80">{row.paid}</span>
              </div>
            </div>
          ))}

          {/* CTA Row */}
          <div className="grid grid-cols-3 border-t border-theme-border">
            <div className="p-4"></div>
            <div className="p-4 flex items-center justify-center border-x border-theme-border">
              <Link href="/chat" className="px-4 py-2 text-sm font-medium text-text-70 hover:text-primary-text transition-colors underline">
                Get Started
              </Link>
            </div>
            <div className="p-4 flex items-center justify-center bg-base-5">
              <button className="px-4 py-2 text-sm font-medium text-secondary-text bg-primary-text rounded-full hover:opacity-90 transition-colors">
                Upgrade
              </button>
            </div>
          </div>
        </div>
      </div>
      <motion.div animate={{ x: isInView ? 0 : -20, display: isInView ? "block" : "none" }} initial={{ x: -40 }} transition={{ duration: 0.5, ease: "easeOut", delay: 0 }} className="w-[8%] bg-base-20 opacity-40 rounded-2xl"></motion.div>
      <motion.div animate={{ x: isInView ? 0 : -30, display: isInView ? "block" : "none" }} initial={{ x: -60 }} transition={{ duration: 0.5, ease: "easeOut", delay: 0 }} className="w-[6%] bg-base-20 opacity-30 rounded-2xl"></motion.div>
      <motion.div animate={{ x: isInView ? 0 : -40, display: isInView ? "block" : "none" }} initial={{ x: -80 }} transition={{ duration: 0.5, ease: "easeOut", delay: 0}} className="w-[4%] bg-base-20 opacity-20 rounded-2xl"></motion.div>
      <motion.div animate={{ x: isInView ? 0 : -50, display: isInView ? "block" : "none" }} initial={{ x: -90 }} transition={{ duration: 0.5, ease: "easeOut", delay: 0 }} className="w-[2%] bg-base-20 opacity-10 rounded-2xl"></motion.div>
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
          <p className="text-4xl sm:text-6xl max-w-2xl text-text-30">A fun and interactive way to learn code</p>
          <p className="text-base max-w-xl text-text-50">Structured, AI-guided lessons paired with interactive exercises that explain your code, catch mistakes, and help concepts actually click.</p>
        </div>
        {isInView && (
          <div className="hidden sm:flex flex-row gap-4">
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: isInView ? 0 : 50, opacity: isInView ? 1 : 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full aspect-[1] bg-base-10 rounded-[3rem] overflow-hidden"
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
              className="w-full aspect-[1] bg-base-10 rounded-[3rem] overflow-hidden"
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
              className="w-full aspect-[1] bg-base-10 rounded-[3rem] overflow-hidden"
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

type BeginnerLesson = {
  language: string;
  level: string;
  title: string;
  description: string;
  challenge: string;
  codeLanguage: string;
  snippet: string;
  likes: string;
  forks: string;
  color: string;
  colorLight: string;
};

function BeginnerLessonArticle({
  lesson,
  innerStyle,
}: {
  lesson: BeginnerLesson;
  innerStyle: React.CSSProperties;
}) {
  return (
    <article
      className="relative p-5 h-full flex flex-col bg-backdrop"
      style={innerStyle}
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xs px-2 py-1 rounded-full bg-base-10 text-text-70">
          {lesson.language}
        </span>
        <span className="text-xs px-2 py-1 rounded-full bg-base-10 text-text-70">
          {lesson.level}
        </span>
      </div>

      <h3 className="text-xl font-light text-text-50 mb-2">
        {lesson.title}
      </h3>
      <p className="text-sm text-text-70 mb-4">{lesson.description}</p>

      <div className="mb-4 p-3 rounded-xl bg-base-5 border border-base-10">
        <p className="text-sm text-primary-text">
          <span className="font-semibold">Challenge: </span>
          {lesson.challenge}
        </p>
      </div>

      <div className="rounded-xl w-full overflow-hidden relative">
        <SyntaxHighlighter
          language={lesson.codeLanguage}
          style={vscDarkPlus}
          wrapLongLines={true}
          codeTagProps={{
            style: {
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            },
          }}
          customStyle={{
            width: "100%",
            margin: 0,
            padding: "0.75rem 1rem",
            background: "#1E1E1E",
            fontSize: "13px",
            overflowX: "hidden",
          }}
        >
          {lesson.snippet}
        </SyntaxHighlighter>
        
        <button
          type="button"
          className="absolute left-5 right-5 bottom-5 cursor-pointer px-4 py-3 rounded-full bg-white backdrop-blur-sm text-black text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Try this lesson
        </button>
      </div>
    </article>
  );
}

function BoxInView({
  className,
  children,
  withAspectRatio = true,
  scale = 0.8,
  yOffsetProp = 30,
}: {
  className?: string;
  children?: React.ReactNode;
  withAspectRatio?: boolean;
  scale?: number;
  yOffsetProp?: number;
}) {
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

  const yOffset = isAboveViewport ? -1 * yOffsetProp : yOffsetProp;
  const yOffsetOut = isAboveViewport ? -1 * yOffsetProp : yOffsetProp;

  return (
    <motion.div 
      ref={boxRef} 
      initial={{ scale: scale, opacity: 0, y: yOffset, borderRadius: "0.5rem" }} 
      animate={{ 
        scale: isInView ? 1 : 1, 
        y: isInView ? 0 : yOffsetOut, 
        opacity: isInView ? 1 : 0, 
        borderRadius: isInView ? "3rem" : "0.5rem" 
      }} 
      transition={{ duration: 0.3, ease: "easeOut" }} 
      className={`col-span-1 w-full ${
        withAspectRatio
          ? "aspect-[3/2] overflow-hidden shadow-[0_0_70px_0_rgba(0,0,0,0.08)]"
          : ""
      } ${className}`}
    >
      {children}
    </motion.div>
  );
}

type MarketingInfoCardData = {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  shadowClass: string;
};

type QuestionBubbleCard = {
  id: string;
  question: string;
  language: string;
  level: string;
  title: string;
  description: string;
  challenge: string;
  codeLanguage: string;
  snippet: string;
};

type QuestionBubbleStackBorder = {
  outerBorderRadiusClass: string;
  gradientClass: string;
  innerBorderRadiusStyle: React.CSSProperties;
};

const navSectionIds = ["features", "get-started", "pricing", "leetcode"] as const;
type NavSectionId = (typeof navSectionIds)[number];

function QuestionBubbleStackContent({ card }: { card: QuestionBubbleCard }) {
  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-xs px-2 py-1 rounded-full bg-base-10 text-text-70">
          {card.language}
        </span>
        <span className="text-xs px-2 py-1 rounded-full bg-base-10 text-text-70">
          {card.level}
        </span>
      </div>
      <h3 className="text-xl sm:text-2xl font-semibold text-primary-text mb-2">{card.title}</h3>
      <p className="text-text-70 max-w-3xl text-sm sm:text-base mb-4">{card.description}</p>
      <div className="mb-4 p-3 rounded-2xl bg-base-5 border border-base-10">
        <p className="text-sm text-primary-text">
          <span className="font-semibold">Challenge: </span>
          {card.challenge}
        </p>
      </div>
      <div className="rounded-2xl w-full overflow-hidden mb-4">
        <SyntaxHighlighter
          language={card.codeLanguage}
          style={vscDarkPlus}
          wrapLongLines={true}
          codeTagProps={{
            style: {
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            },
          }}
          customStyle={{
            width: "100%",
            margin: 0,
            padding: "0.75rem 1rem",
            background: "#1E1E1E",
            fontSize: "12px",
            overflowX: "hidden",
          }}
        >
          {card.snippet}
        </SyntaxHighlighter>
      </div>
      <button
        type="button"
        className="mx-auto mt-1 inline-flex w-full cursor-pointer items-center justify-center rounded-full bg-primary-text px-5 py-3 text-sm font-medium text-background"
      >
        Try this lesson
      </button>
    </>
  );
}

const Q_STACK = {
  t: 0.8,
  /** Shared easing so new + old read as one transition */
  ease: [0.32, 0.72, 0.2, 1] as [number, number, number, number],
} as const;

const questionBubbleStackVariants = {
  /** New card: arrive from below + fade in (no scale) */
  initial: { y: 36, opacity: 0, scale: 1, zIndex: 10 },
  animate: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { delay: 0.15, duration: Q_STACK.t, ease: Q_STACK.ease },
  },
  /** Outgoing: shrink + nudge up, then fully transparent; AnimatePresence unmounts when this finishes */
  exit: {
    y: -28,
    scale: 0.8,
    opacity: 0,
    transition: { duration: Q_STACK.t, ease: Q_STACK.ease },
  },
};

/**
 * One animated layer. Pinned in a single grid cell with the other layer for overlap; height from content.
 */
function QuestionBubbleStackLayer({
  card,
  border,
}: {
  card: QuestionBubbleCard;
  border: QuestionBubbleStackBorder;
}) {
  const [isPresent] = usePresence();
  return (
    <motion.div
      className={[
        "relative col-start-1 row-start-1 w-full min-w-0 min-h-0 transform-gpu will-change-transform p-px shadow-[0_0_70px_0_rgba(0,0,0,0.08)] [transform-style:preserve-3d] [backface-visibility:hidden]",
        border.outerBorderRadiusClass,
        border.gradientClass,
        isPresent ? "z-20 pointer-events-auto" : "z-0 pointer-events-none",
      ].join(" ")}
      style={{ transformOrigin: "50% 50% 0" }}
      variants={questionBubbleStackVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div
        className="h-full w-full min-h-0 overflow-hidden bg-container-primary"
        style={border.innerBorderRadiusStyle}
      >
        <article className="p-6 sm:p-8">
          <QuestionBubbleStackContent card={card} />
        </article>
      </div>
    </motion.div>
  );
}

/**
 * `stackKey` changes on every chip press so AnimatePresence always unmounts the previous instance
 * after its exit; bringing the same card back is a new mount and runs enter again. No sizer / height measure.
 */
function QuestionBubbleStack({
  card,
  border,
  stackKey,
}: {
  card: QuestionBubbleCard;
  border: QuestionBubbleStackBorder;
  /** Increments on each question-chip click; drives React key, not the card id alone */
  stackKey: number;
}) {
  return (
    <div className="relative w-full min-h-[18rem] overflow-visible [isolation:isolate] [perspective:1100px] sm:min-h-[17rem]">
      <div className="grid w-full min-w-0 grid-cols-1 [grid-template-rows:minmax(0,auto)] place-content-start">
        <AnimatePresence initial={false} mode="sync">
          <QuestionBubbleStackLayer key={stackKey} card={card} border={border} />
        </AnimatePresence>
      </div>
    </div>
  );
}

function MarketingInfoCard({
  card,
}: {
  card: MarketingInfoCardData;
}) {
  const { resolvedTheme } = useTheme();
  const borderClass = getGlassGradientBorderClass(
    resolvedTheme,
    "rounded-4xl",
  );
  return (
    <BoxInView
      withAspectRatio={false}
      className="w-full min-w-0 h-full flex-none overflow-visible shadow-[0_0_10px_0_rgba(0,0,0,0.05)] max-md:max-w-full md:flex-1"
    >
      <div className={`p-px ${card.shadowClass} ${borderClass.outerBorderRadiusClass} ${borderClass.gradientClass}`}>
        <div
          className="p-5 bg-backdrop h-full w-full overflow-hidden"
          style={borderClass.innerBorderRadiusStyle}
        >
          <p className="text-base-20 mt-4 mb-4 tracking-wide text-3xl font-light">
            {card.title}
          </p>
          <p className="mb-4">{card.description}</p>
          <img
            src={card.imageSrc}
            alt={card.imageAlt}
            className="w-full aspect-[16/10] object-cover rounded-3xl"
          />
        </div>
      </div>
    </BoxInView>
  );
}

function ContactModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { resolvedTheme } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  return (
    <ModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      title="Contact"
      showHeader={false}
      maxWidthClassName="max-w-md"
      containerClassName="px-4"
      contentClassName="relative py-8 px-6 bg-background m-3 rounded-2xl"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 p-1 rounded-lg text-text-60 hover:text-primary-text hover:bg-base-10 transition-colors z-10"
      >
        <Icon icon="solar:close-circle-linear" className="w-5 h-5" />
      </button>
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <img
            src="/logo.png"
            alt="Logo"
            className={`w-10 h-10 ${resolvedTheme === "dark" ? "invert" : ""}`}
          />
          <span className="font-semibold text-xl text-primary-text">dontvibecode</span>
        </div>
        <p className="text-sm text-text-70">
          Send us a message, we would love to hear from you!
        </p>
      </div>

      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          onClose();
        }}
      >
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full rounded-xl border border-theme-border bg-container-primary px-4 py-3 text-sm text-primary-text outline-none focus:ring-2 focus:ring-primary-text/15"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-xl border border-theme-border bg-container-primary px-4 py-3 text-sm text-primary-text outline-none focus:ring-2 focus:ring-primary-text/15"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us what you need..."
          rows={4}
          className="w-full resize-none rounded-xl border border-theme-border bg-container-primary px-4 py-3 text-sm text-primary-text outline-none focus:ring-2 focus:ring-primary-text/15"
        />
        <button
          type="submit"
          className="w-full cursor-pointer rounded-full bg-primary-text px-4 py-3 text-sm font-medium text-background transition-all hover:opacity-90"
        >
          Send message
        </button>
      </form>
    </ModalTemplate>
  );
}

function AboutFullscreenModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50 bg-background overflow-y-auto">
          <div className="sticky top-0 z-20 p-4 border-b border-base-10 bg-background/95 backdrop-blur">
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-base-10 rounded-lg transition-colors"
            >
              <Icon icon="solar:arrow-left-linear" className="w-6 h-6 text-primary-text" />
            </button>
          </div>
          <div className="relative">
            <div className="pointer-events-none max-w-5xl h-screen fixed top-0 left-0 right-0 mx-auto border-l border-r border-theme-border" aria-hidden />
            <div className="relative z-10 max-w-5xl mx-auto px-6 pt-10 pb-14">
              <img src="/logo.png" alt="Logo" className="h-12 w-12 mx-auto mb-8" />
              <h2 className="text-center text-3xl sm:text-4xl font-light text-primary-text mb-4">
                About
              </h2>
              <p className="text-center text-text-70 max-w-3xl mx-auto mb-8">
                We strive to make learning code a more enjoyable and interactive experience, whether you are a complete beginner or a professional who wants to explore new problems.
              </p>
              <h2 className="text-center text-3xl sm:text-4xl font-light text-primary-text mb-4">
                Team
              </h2>
              <div className="flex flex-row max-w-xl mx-auto">
                <div className="text-center font-light flex-1 flex flex-col items-center justify-center gap-2">
                  <div className="h-16 w-16 rounded-full bg-container-secondary">
                  </div>
                  <p>Stefan Chao</p>
                  <p className="text-base-30">Co-founder</p>
                  <p>2x founder, built products used by 500,000+ users</p>
                </div>
                <div className="text-center font-light flex-1 flex flex-col items-center justify-center gap-2">
                  <div className="h-16 w-16 rounded-full bg-container-secondary">
                  </div>
                  <p>Peter Li</p>
                  <p className="text-base-30">Co-founder</p>
                  <p>A<br/>guy</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isThemeIconHovered, setIsThemeIconHovered] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const { resolvedTheme, setTheme } = useTheme();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const lessonCardBorder = getGlassGradientBorderClass(
    resolvedTheme,
    "rounded-4xl",
  );
  const lessonCardBorderRainbow = getGlassGradientBorderClassRainbow(
    resolvedTheme,
    "rounded-3xl",
  );
  const isDarkMode = resolvedTheme === "dark";
  const currentModeIcon = isDarkMode ? "solar:moon-linear" : "solar:sun-linear";
  const hoverModeIcon = isDarkMode ? "solar:sun-linear" : "solar:moon-linear";
  const [beginnerMobileTab, setBeginnerMobileTab] = useState<
    "Java" | "Python" | "C++"
  >("Java");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [activeNavSection, setActiveNavSection] = useState<NavSectionId | null>(null);

  const scrollToSection = useCallback((sectionId: NavSectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  useEffect(() => {
    const sectionRatios = new Map<NavSectionId, number>();
    navSectionIds.forEach((id) => sectionRatios.set(id, 0));

    const recomputeActiveSection = () => {
      const featuresEl = document.getElementById("features");
      if (featuresEl && window.scrollY + 120 < featuresEl.offsetTop) {
        setActiveNavSection(null);
        return;
      }
      const leetcodeEl = document.getElementById("leetcode");
      if (
        leetcodeEl &&
        window.scrollY + 140 >
          leetcodeEl.offsetTop + leetcodeEl.offsetHeight
      ) {
        setActiveNavSection(null);
        return;
      }

      let bestId: NavSectionId | null = null;
      let bestRatio = -1;
      navSectionIds.forEach((id) => {
        const ratio = sectionRatios.get(id) ?? 0;
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestId = id;
        }
      });

      if (bestRatio <= 0) {
        const anchorY = window.scrollY + window.innerHeight * 0.35;
        let fallbackId: NavSectionId | null = null;
        navSectionIds.forEach((id) => {
          const el = document.getElementById(id);
          if (el && el.offsetTop <= anchorY) fallbackId = id;
        });
        setActiveNavSection(fallbackId);
        return;
      }

      setActiveNavSection(bestId);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id as NavSectionId;
          sectionRatios.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
        });
        recomputeActiveSection();
      },
      {
        root: null,
        rootMargin: "-30% 0px -45% 0px",
        threshold: [0, 0.2, 0.4, 0.6, 0.8, 1],
      },
    );

    navSectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    recomputeActiveSection();
    window.addEventListener("scroll", recomputeActiveSection, { passive: true });
    window.addEventListener("resize", recomputeActiveSection);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", recomputeActiveSection);
      window.removeEventListener("resize", recomputeActiveSection);
    };
  }, []);

  const sampleLessons = [
    {
      language: "Python",
      level: "Beginner",
      color: "bg-[rgba(85,115,85,0.7)]",
      colorLight: "bg-[rgba(175,235,174,0.3)]",
      title: "Build a Task Prioritizer",
      description:
        "Practice list processing and conditionals by sorting tasks based on urgency and due date.",
      challenge:
        "Write a function that accepts tasks and returns only the top 3 tasks sorted by priority score.",
      likes: "1.2k",
      forks: "340",
      codeLanguage: "python",
      snippet: `def score(task):
    urgency = task.get("urgency", 0)
    days_left = task.get("days_left", 7)
    penalty = max(0, 7 - days_left)
    return urgency * 10 + penalty

def top_tasks(tasks):
    ranked = sorted(tasks, key=score, reverse=True)
    top_three = ranked[:3]
    return top_three`,
    },
    {
      language: "Java",
      level: "Beginner",
      color: "bg-[rgba(86,98,117,0.7)]",
      colorLight: "bg-[rgba(189,187,252,0.3)]",
      title: "Filter Invalid Transactions",
      description:
        "Use loops and validation checks to clean a list of transactions before further processing.",
      challenge:
        "Implement a method that returns transactions where amount > 0 and status is APPROVED.",
      likes: "980",
      forks: "210",
      codeLanguage: "java",
      snippet: `public static List<Transaction> filterValid(List<Transaction> txs) {
    List<Transaction> result = new ArrayList<>();
    for (Transaction tx : txs) {
        boolean positiveAmount = tx.amount() > 0;
        boolean approved = "APPROVED".equals(tx.status());
        if (positiveAmount && approved) {
            result.add(tx);
        }
    }
    return result;
}`,
    },
    {
      language: "C++",
      level: "Beginner",
      color: "bg-[rgba(120,89,86,0.7)]",
      colorLight: "bg-[rgba(252,193,187,0.3)]",
      title: "Track Longest Streak",
      description:
        "Strengthen array traversal skills by finding the longest consecutive streak in user activity data.",
      challenge:
        "Given a vector of daily activity values, return the length of the longest non-decreasing streak.",
      likes: "760",
      forks: "180",
      codeLanguage: "cpp",
      snippet: `int longestStreak(const vector<int>& a) {
    if (a.empty()) return 0;
    int best = 1;
    int cur = 1;
    for (size_t i = 1; i < a.size(); i++) {
        if (a[i] >= a[i - 1]) {
            cur++;
            best = max(best, cur);
        } else {
            cur = 1;
        }
    }
    return best;
}`,
    },
  ];
  const selectedBeginnerMobileLesson =
    sampleLessons.find((l) => l.language === beginnerMobileTab) ?? sampleLessons[0];

  const features = [
    { text: "Learn to code", id: "learn", color: "text-pink-400" },
    { text: "Tailored lessons", id: "tailored", color: "text-blue-400" },
    { text: "Interactive coding", id: "interactive", color: "text-green-400" },
    { text: "Relevant sources", id: "sources", color: "text-yellow-400" },
    { text: "Track your progress", id: "track", color: "text-purple-400" },
    { text: "Bookmark your favorites", id: "improve", color: "text-orange-400" },
  ];
  const marketingInfoCards: MarketingInfoCardData[] = [
    {
      id: "all-levels-a",
      title: "Built around your questions.",
      description:
        "Start from what you actually want to learn. Dontvibecode turns your questions into structured lessons tailored to your level.",
      imageSrc: "https://i.ibb.co/DD7kgYrN/image.png",
      imageAlt: "Learning path",
      shadowClass: "shadow-[0px_0px_50px_rgba(0,0,0,0.02)]",
    },
    {
      id: "interactive",
      title: "Learn by doing, not just reading.",
      description:
        "Work through interactive code snippets and exercises that reinforce every concept as you go.",
      imageSrc: "https://i.ibb.co/W4jYnwzS/image.png",
      imageAlt: "Interactive coding",
      shadowClass: "shadow-[0px_0px_50px_rgba(0,0,0,0.08)]",
    },
    {
      id: "sources",
      title: "Track your progress",
      description:
        "With fun exercises, you can keep track of your progress and see how you're doing.",
      imageSrc: "https://i.ibb.co/Tx1MF9Jf/image.png",
      imageAlt: "Relevant sources",
      shadowClass: "shadow-[0px_0px_50px_rgba(0,0,0,0.02)]",
    },
    {
      id: "progress",
      title: "Personalised feedback",
      description:
        "Receive intelligent, personalised feedback that breaks down your answers.",
      imageSrc: "https://i.ibb.co/yBP8Jf06/image.png",
      imageAlt: "Progress tracking",
      shadowClass: "shadow-[0px_0px_50px_rgba(0,0,0,0.08)]",
    },
    {
      id: "all-levels-b",
      title: "From first steps to deep dives.",
      description:
        "Whether you're starting out or refining advanced skills, each lesson adjusts to what you need to improve next.",
      imageSrc: "https://i.ibb.co/M5MCYtnT/image.png",
      imageAlt: "Learning support",
      shadowClass: "shadow-[0px_0px_50px_rgba(0,0,0,0.08)]",
    },
  ];
  const questionBubbleCards: QuestionBubbleCard[] = [
    {
      id: "start",
      question: "How do I start coding?",
      language: "Python",
      level: "Beginner",
      title: "Build your first coding routine",
      description:
        "Start with short daily exercises and simple projects so you build consistent momentum without feeling overwhelmed.",
      challenge:
        "Write a function that keeps only unfinished tasks and returns the next 3 tasks to do.",
      codeLanguage: "python",
      snippet: `def next_tasks(tasks):
    todo = [t for t in tasks if not t["done"]]
    return todo[:3]`,
    },
    {
      id: "loops",
      question: "When should I use loops?",
      language: "Java",
      level: "Beginner",
      title: "Use loops with confidence",
      description:
        "Use loops when you need to repeat logic over lists or ranges, and pick the loop type that keeps code readable.",
      challenge:
        "Count how many scores are at least 80 and return that total.",
      codeLanguage: "java",
      snippet: `public static int countPassing(int[] scores) {
    int count = 0;
    for (int score : scores) {
        if (score >= 80) count++;
    }
    return count;
}`,
    },
    {
      id: "debug",
      question: "Why is my code failing?",
      language: "JavaScript",
      level: "Beginner",
      title: "Debug step by step",
      description:
        "Break the problem into smaller checks, verify assumptions, and isolate one bug at a time to find issues faster.",
      challenge:
        "Guard against missing values and return a safe fallback username.",
      codeLanguage: "javascript",
      snippet: `function getUsername(user) {
  if (!user || !user.name) return "guest";
  return user.name.trim();
}`,
    },
    {
      id: "functions",
      question: "How do functions help?",
      language: "TypeScript",
      level: "Beginner",
      title: "Write reusable function blocks",
      description:
        "Functions help you reuse logic, reduce duplication, and make your code easier to test and maintain.",
      challenge:
        "Create a reusable formatter that uppercases labels and trims spaces.",
      codeLanguage: "typescript",
      snippet: `function formatLabel(label: string): string {
  return label.trim().toUpperCase();
}`,
    },
    {
      id: "arrays",
      question: "How do arrays work?",
      language: "Python",
      level: "Beginner",
      title: "Understand list-style data",
      description:
        "Arrays store ordered values, making it easier to iterate through related data and transform it with clear patterns.",
      challenge:
        "Return only even numbers from a list while preserving order.",
      codeLanguage: "python",
      snippet: `def even_values(nums):
    return [n for n in nums if n % 2 == 0]`,
    },
    {
      id: "objects",
      question: "When to use objects?",
      language: "JavaScript",
      level: "Beginner",
      title: "Model real data clearly",
      description:
        "Objects are great for grouping related properties like user info, settings, and structured responses.",
      challenge:
        "Build a user profile object from separate input values.",
      codeLanguage: "javascript",
      snippet: `function makeProfile(name, role) {
  return { name, role, active: true };
}`,
    },
    {
      id: "clean",
      question: "How to write clean code?",
      language: "Java",
      level: "Beginner",
      title: "Keep code simple and clear",
      description:
        "Use meaningful names, small functions, and consistent formatting so your code is easier to read and improve.",
      challenge:
        "Rename vague variables and split one large method into smaller steps.",
      codeLanguage: "java",
      snippet: `public static int totalPrice(int[] prices) {
    int total = 0;
    for (int price : prices) total += price;
    return total;
}`,
    },
    {
      id: "practice",
      question: "What should I practice next?",
      language: "TypeScript",
      level: "Beginner",
      title: "Choose focused next steps",
      description:
        "Practice one weak topic at a time and pair it with a small project to turn concepts into real skill.",
      challenge:
        "Prioritize topics by difficulty and return the next one to train.",
      codeLanguage: "typescript",
      snippet: `type Topic = { name: string; difficulty: number };
function nextTopic(topics: Topic[]): Topic | null {
  return topics.sort((a, b) => b.difficulty - a.difficulty)[0] ?? null;
}`,
    },
    {
      id: "projects",
      question: "How do I build projects?",
      language: "C++",
      level: "Beginner",
      title: "Turn ideas into projects",
      description:
        "Start with a tiny scope, ship a first version quickly, then improve features in small iterations.",
      challenge:
        "Track completed milestones and return true when at least 3 are done.",
      codeLanguage: "cpp",
      snippet: `bool readyToShip(const vector<bool>& done) {
    int count = 0;
    for (bool m : done) if (m) count++;
    return count >= 3;
}`,
    },
  ];
  const [selectedQuestionBubbleId, setSelectedQuestionBubbleId] = useState(
    questionBubbleCards[0].id,
  );
  const [questionStackKey, setQuestionStackKey] = useState(0);
  const selectedQuestionBubbleCard =
    questionBubbleCards.find((card) => card.id === selectedQuestionBubbleId) ??
    questionBubbleCards[0];
  const videoRef = useRef<HTMLVideoElement>(null);
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
    <div ref={containerRef} className="relative min-h-[300vh] overflow-x-hidden bg-background text-primary-text pt-16">
      <div className="relative inset-0 z-0 w-[calc(100%-2rem)] h-auto aspect-square sm:h-[calc(100vh-2rem-3.5rem)] rounded-3xl overflow-hidden border border-theme-border m-[1rem]">
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
                <CustomTypeface src="/text.png" alt="Logo" imagePosition="20%" white={true} />
                <p className="text-sm sm:text-xl md:text-2xl text-white sm:text-white/90 mb-2">
                Code like it matters. Think deeper.
                </p>
                <p className="relative z-30 text-sm sm:text-xl md:text-2xl text-white sm:text-white/90 mb-4">
                Build better. No AI crutches.
                </p>
              </div>

              <div className="bg-white/10 shadow-[inset_0_0_50px_0_rgba(244,244,244,0.4)] backdrop-blur-sm border border-white/30 rounded-3xl p-3 sm:p-5 max-w-2xl w-full mx-auto pointer-events-auto">
              <input 
                type="text" 
                className="placeholder:text-white/80 text-sm sm:text-base text-white pb-0 sm:pb-4 m-2 sm:m-0 text-left w-full outline-none" 
                placeholder="What's not working? Let's think it through" 
              />
              <div className="flex items-center gap-3">
                <button className="cursor-pointer px-4 sm:px-6 py-1 sm:py-2 rounded-full bg-white/20 backdrop-blur-4xl text-white border border-white/10 hover:bg-white/30 transition-all text-sm sm:text-base">
                Beginner
                </button>
                <button className="cursor-pointer px-4 sm:px-6 py-1 sm:py-2 rounded-full bg-white/20 backdrop-blur-4xl text-white border border-white/10 hover:bg-white/30 transition-all text-sm sm:text-base">
                Gemini
                </button>
                <Link href="/chat" className="cursor-pointer ml-auto w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur-4xl text-white border border-white/10 hover:bg-white/30 transition-all text-sm sm:text-base -rotate-45 flex items-center justify-center">
                  <svg className="opacity-70" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m5 12l-.604-5.437C4.223 5.007 5.825 3.864 7.24 4.535l11.944 5.658c1.525.722 1.525 2.892 0 3.614L7.24 19.466c-1.415.67-3.017-.472-2.844-2.028zm0 0h7"/></svg>
                </Link>
              </div>
              </div>
          </motion.div>
          </section>

        </div>
        {/* <FluidImage
        src="https://i.ibb.co/Cs1xKn8W/image.png"
          //src="https://images.unsplash.com/photo-1761767380566-7a86c3e653a3?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
          fluidIntensity={0.0003}
          cursorRadius={0.0003}
        /> */}
      <FluidVideo
          src="https://cdn.dribbble.com/userupload/19479288/file/original-2fe56320d01f1d5808904309aa3af385.mp4"
          className="absolute inset-0 w-full h-full object-cover"
          fluidIntensity={0.001}
          cursorRadius={0.0005}
          playbackRate={0.5}
        />
      </div>

      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-4 mx-1">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Logo" className="shadow-[0px_0px_50px_rgba(0,0,0,0.08)] w-10 h-10" />
          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
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
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden shadow-[0px_0px_50px_rgba(0,0,0,0.08)] cursor-pointer px-2.5 py-2.5 rounded-full bg-primary-text text-background transition-all flex items-center justify-center"
          >
            <Icon icon="solar:hamburger-menu-outline" className="w-5 h-5" />
          </button>
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-8 font-light shadow-[0px_0px_50px_rgba(0,0,0,0.08)] bg-invert-20 backdrop-blur-lg border border-base-10 rounded-3xl px-6 py-2.5  ">
            <button
              type="button"
              onClick={() => scrollToSection("features")}
              className={`cursor-pointer hover:font-regular max-w-2xl mx-auto transition-all duration-300 ${
                activeNavSection === "features"
                  ? "text-primary-text font-semibold tracking-wide"
                  : "text-base-40 hover:text-primary-text"
              }`}
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("get-started")}
              className={`cursor-pointer hover:font-regular max-w-2xl mx-auto transition-all duration-300 ${
                activeNavSection === "get-started"
                  ? "text-primary-text font-semibold tracking-wide"
                  : "text-base-40 hover:text-primary-text"
              }`}
            >
              Get Started
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("pricing")}
              className={`cursor-pointer hover:font-regular max-w-2xl mx-auto transition-all duration-300 ${
                activeNavSection === "pricing"
                  ? "text-primary-text font-semibold tracking-wide"
                  : "text-base-40 hover:text-primary-text"
              }`}
            >
              Pricing
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("leetcode")}
              className={`cursor-pointer hover:font-regular max-w-2xl mx-auto transition-all duration-300 ${
                activeNavSection === "leetcode"
                  ? "text-primary-text font-semibold tracking-wide"
                  : "text-base-40 hover:text-primary-text"
              }`}
            >
              Leetcode
            </button>
            </div>
            <Link href="/chat" className="shadow-[0px_0px_50px_rgba(0,0,0,0.08)] cursor-pointer px-5 pr-4 py-2.5 rounded-full bg-primary-text text-background transition-all flex items-center gap-2">
              Log in
            </Link>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-50 md:hidden bg-backdrop backdrop-blur-xl"
          >
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-1.5 left-2.5 cursor-pointer px-2.5 py-2.5 rounded-full text-text-60 transition-all flex items-center justify-center"
            >
              <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-full" />
            </button>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-1.5 right-2.5 cursor-pointer px-2.5 py-2.5 rounded-full text-text-60 transition-all flex items-center justify-center"
            >
              <Icon icon="jam:close" className="w-10 h-10" />
            </button>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
              className="h-full w-full flex flex-col items-center justify-center gap-4 px-6"
            >
              <motion.button
                type="button"
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="text-2xl w-full max-w-xs cursor-pointer transition-all flex items-center justify-center"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  scrollToSection("features");
                }}
              >
                Features
              </motion.button>
              <motion.button
                type="button"
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="text-2xl w-full max-w-xs cursor-pointer transition-all flex items-center justify-center"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  scrollToSection("get-started");
                }}
              >
                Get Started
              </motion.button>
              <motion.button
                type="button"
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="text-2xl w-full max-w-xs cursor-pointer transition-all flex items-center justify-center"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  scrollToSection("pricing");
                }}
              >
                Price
              </motion.button>
              <motion.button
                type="button"
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="text-2xl w-full max-w-xs cursor-pointer transition-all flex items-center justify-center"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  scrollToSection("leetcode");
                }}
              >
                Leetcode
              </motion.button>
              <motion.div
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Link
                  href="/chat"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-fit max-w-xs text-xl cursor-pointer px-8 py-3 rounded-full bg-primary-text text-background transition-all flex items-center justify-center"
                >
                  Log in
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <section id="features" className="scroll-mt-28">
        <div className="max-w-5xl mx-auto mt-10 w-full px-4 md:px-0">

          <p
            className="text-start text-3xl font-light py-10 mb-2 max-w-4xl bg-clip-text text-base-30"
            // style={{
            //   backgroundImage: "url('https://i.ibb.co/p60ctrWz/image.png')",
            //   backgroundSize: "cover",
            //   backgroundPosition: "center",
            // }}
          >
            Ask anything and start learning right away. Dontvibecode generates a tailored lesson focused on exactly what you need to improve.
          </p>

          <div className="flex-col sm:flex-col max-md:gap-4">
            <div className="flex w-full max-md:flex-col max-md:gap-4 flex-row gap-6 md:items-end">
            {marketingInfoCards.slice(0, 2).map((card) => (
              <MarketingInfoCard
                key={card.id}
                card={card}
              />
            ))}
            </div>
            <div className="flex w-full max-md:flex-col max-md:gap-4 max-md:mt-0 flex-row gap-6 mt-6">
            {marketingInfoCards.slice(2).map((card) => (
              <MarketingInfoCard
                key={card.id}
                card={card}
              />
            ))}
            </div>
          </div>
        </div>
      </section>

      <section
        className="relative z-10 flex flex-col items-center justify-center mx-auto my-10"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, var(--_gradient-diagonal-line))",
        }}
      >
        <div className="h-[1px] bg-base-20 w-full absolute bottom-0 left-0 right-0"/>
        <div className="h-[1px] bg-base-20 w-full absolute top-0 left-0 right-0"/>
        <div className="max-w-7xl bg-background">
          <div ref={containerRef} className="relative overflow-hidden w-full border-r border-l border-base-20 py-12">
            <p className="text-4xl sm:text-5xl max-w-2xl text-text-50 font-light text-center mx-10">
              Learning to code has never been so easy.
              <br />
              <motion.span
                initial={{ opacity: 0, y: -14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="inline-block text-sm"
              >
                - <span className="font-semibold">Rome Rogers</span>, co-founder @ <span className="underline">foundersventures</span>
              </motion.span>
            </p>
          </div>
        </div>
      </section>

      <section id="get-started" className="relative z-10 flex flex-col items-center justify-center py-10 px-4 scroll-mt-28">
        <CustomTypeface src="https://i.ibb.co/1JfVkdx7/image.png" alt="Get Started typeface" plain={true} />
        <p 
          className="text-center text-xl font-light mb-10 bg-clip-text text-base-30"
          // style={{
          //   backgroundImage: "url('https://i.ibb.co/p60ctrWz/image.png')",
          //   backgroundSize: "cover",
          //   backgroundPosition: "center",
          // }}
        >Not sure where to start? Try one of our beginner lessons:</p>
        <div className="md:hidden w-full max-w-5xl">
          <div
            className="flex w-full gap-1 sm:gap-2 mb-4 p-0.5 sm:p-1 rounded-2xl bg-base-5 border border-base-10"
            role="tablist"
            aria-label="Beginner lesson language"
          >
            {(["Java", "Python", "C++"] as const).map((lang) => {
              const selected = beginnerMobileTab === lang;
              return (
                <button
                  key={lang}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setBeginnerMobileTab(lang)}
                  className={`flex-1 min-w-0 rounded-xl py-2 sm:py-2.5 px-0.5 sm:px-1.5 text-sm font-medium transition-colors ${
                    selected
                      ? "bg-primary-text text-container-primary"
                      : "text-text-70 hover:bg-base-10"
                  }`}
                >
                  Learn {lang}
                </button>
              );
            })}
          </div>
          <BoxInView
            key={beginnerMobileTab}
            withAspectRatio={false}
            className="w-full"
            scale={0.98}
            yOffsetProp={0}
          >
            <div
              className={`p-px ${lessonCardBorderRainbow.outerBorderRadiusClass} ${lessonCardBorderRainbow.gradientClass}`}
            >
              <BeginnerLessonArticle
                lesson={selectedBeginnerMobileLesson as BeginnerLesson}
                innerStyle={lessonCardBorderRainbow.innerBorderRadiusStyle}
              />
            </div>
          </BoxInView>
        </div>

        <div className="hidden md:grid w-full max-w-5xl grid-cols-3 gap-5">
          {sampleLessons.map((lesson, index) => {
            const columnIndex = index % 3;
            const initialX = columnIndex === 0 ? 40 : columnIndex === 2 ? -40 : 0;
            const initialY = columnIndex === 1 ? 0 : 0;
            const borderClass = `p-px ${lessonCardBorderRainbow.outerBorderRadiusClass} ${lessonCardBorderRainbow.gradientClass}`;

            return (
            <motion.div
              key={lesson.language}
              initial={{ opacity: 0, x: initialX, y: initialY, scale: 1 }}
              whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              viewport={{ once: false, amount: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className={borderClass}
            >
              <BeginnerLessonArticle
                lesson={lesson as BeginnerLesson}
                innerStyle={lessonCardBorderRainbow.innerBorderRadiusStyle}
              />
            </motion.div>
            );
          })}
        </div>
      </section>

      <section 
        className="relative z-10 flex flex-col items-center justify-center mx-auto my-10"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, var(--_gradient-diagonal-line))",
        }}
      >
        <div className="h-[1px] bg-base-20 w-full absolute bottom-0 left-0 right-0"/>
        <div className="h-[1px] bg-base-20 w-full absolute top-0 left-0 right-0"/>
        <div className="max-w-5xl bg-background mx-auto py-12 px-0 sm:px-4 md:px-8 border-l border-r border-base-20 w-full min-w-0">
        <p className="text-center text-2xl font-semibold mb-6">See what others are asking:</p>
          <div className="md:hidden w-full min-w-0 overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-gutter:stable]">
            <div className="flex flex-nowrap gap-2 w-max pb-1">
              {questionBubbleCards.map((questionCard) => {
                const isSelected = selectedQuestionBubbleId === questionCard.id;
                return (
                  <button
                    key={questionCard.id}
                    type="button"
                    onClick={() => {
                      setQuestionStackKey((k) => k + 1);
                      setSelectedQuestionBubbleId(questionCard.id);
                    }}
                    className={`shrink-0 cursor-pointer rounded-full px-3 py-2 text-lg first:ml-4 last:mr-4 border transition-all ${
                      isSelected
                        ? "bg-primary-text text-container-primary border-primary-text"
                        : "bg-container-primary/70 text-primary-text border-theme-border hover:bg-base-10"
                    }`}
                  >
                    {questionCard.question}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="hidden md:flex flex-col gap-2 items-center">
            {[0, 1].map((rowIndex) => (
              <div key={rowIndex} className="flex flex-wrap justify-center gap-2">
                {questionBubbleCards
                  .slice(
                    rowIndex === 0 ? 0 : 4,
                    rowIndex === 0 ? 4 : questionBubbleCards.length,
                  )
                  .map((questionCard) => {
                    const isSelected =
                      selectedQuestionBubbleId === questionCard.id;
                    return (
                      <button
                        key={questionCard.id}
                        type="button"
                        onClick={() => {
                          setQuestionStackKey((k) => k + 1);
                          setSelectedQuestionBubbleId(questionCard.id);
                        }}
                        className={`cursor-pointer rounded-full px-4 py-2 text-sm sm:text-base border transition-all ${
                          isSelected
                            ? "bg-primary-text text-container-primary border-primary-text"
                            : "bg-container-primary/70 text-primary-text border-theme-border hover:bg-base-10"
                        }`}
                      >
                        {questionCard.question}
                      </button>
                    );
                  })}
              </div>
            ))}
          </div>

          <div className="mt-8 px-4 sm:px-0 w-full max-w-2xl mx-auto min-w-0">
            <QuestionBubbleStack
              card={selectedQuestionBubbleCard}
              border={lessonCardBorder}
              stackKey={questionStackKey}
            />
          </div>
        </div>
      </section>

      {/* <section className="relative z-10 flex items-start justify-center py-10 px-4">
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
                    : "text-text-30"
                }`}
              >
                {feature.text}
              </motion.h2>
            </div>
          ))}
        </div>
      </section> */}

      {/* <section className="px-4 mt-20 min-h-[10vh] flex flex-col items-center justify-center gap-20">
        <InfoSection />
      </section> */}

      {/* <section className="my-10 min-h-auto sm:min-h-[100vh] flex flex-col items-center justify-center gap-20">
        <div className="px-4 w-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            width="100%"
            height="100"
            fill="none"
            className="opacity-10 text-primary-text"
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
            <BoxInView className="relative order-2 sm:order-0 border border-theme-border bg-container-primary flex flex-col justify-center items-center gap-4">
              <div className="absolute top-0 left-0 right-0 mx-auto w-full h-full max-w-md border-x-[1px] border-base-20">
              </div>
              <span className="h-[1px] bg-base-20 w-full rounded-full"/>
              <div className="relatieve z-20 max-w-md text-center text-lg px-4 font-regular text-text-60">
                <p>Our AI understands how you think and builds a personalized learning path with interactive exercises that help you actually master coding concepts.</p>
              </div>
              <span className="h-[1px] bg-base-20 w-full rounded-full"/>
            </BoxInView>
            <BoxInView>
              <img
                src="https://i.ibb.co/XrTR0jxF/image.png"
                alt="Image"
                className="w-full h-full object-cover rounded-3xl"
                width={500}
                height={500}
              />
            </BoxInView>
          </div>

          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BoxInView>
              <img
                src="https://i.ibb.co/TMKQxGmG/image.png"
                alt="Image"
                className="w-full h-full object-cover rounded-3xl"
                width={500}
                height={500}
              />
            </BoxInView>
            <BoxInView>
              <img
                src="https://i.ibb.co/d0vgBLdM/image.png"
                alt="Image"
                className="w-full h-full object-cover rounded-3xl"
                width={500}
                height={500}
              />
            </BoxInView>
          </div>

          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BoxInView>
              <img
                src="https://i.ibb.co/JWjw1qbq/image.png"
                alt="Image"
                className="w-full h-full object-cover rounded-3xl"
                width={500}
                height={500}
              />
            </BoxInView>
            <BoxInView className="relative border order-first sm:order-none border-theme-border bg-container-primary flex flex-col justify-center items-center gap-4">
              <div className="absolute top-0 left-0 right-0 mx-auto w-full h-full max-w-md border-x-[1px] border-base-20">
              </div>
              <span className="h-[1px] bg-base-20 w-full rounded-full"/>
              <div className="relatieve z-20 max-w-md text-center text-lg px-4 font-regular text-text-60">
                <p>Code, submit, and learn faster. Our AI analyzes your solutions in real time, tells you what’s right or wrong, and guides you toward cleaner, more efficient code.</p>
              </div>
              <span className="h-[1px] bg-base-20 w-full rounded-full"/>
            </BoxInView>
          </div>
        </div>

      </section> */}

      <section id="pricing" className="mx-4 mb-10 min-h-[100vh] flex flex-col items-center justify-center gap-20 scroll-mt-28">
        <CustomTypeface src="https://i.ibb.co/gbFQq0P9/image.png" alt="Get Started typeface" plain={true} />
        <PricingSection />
      </section>

      <section id="leetcode" className="relative z-10 flex flex-col items-center justify-center mx-auto my-10 scroll-mt-28">
        <div className="h-[1px] bg-base-20 w-full absolute bottom-0 left-0 right-0"/>
        <div className="h-[1px] bg-base-20 w-full absolute top-0 left-0 right-0"/>

        <div className="relative overflow-hidden max-w-5xl border-l border-r border-base-20 bg-[radial-gradient(120%_120%_at_50%_0%,rgba(124,58,237,0.28)_0%,rgba(84,160,255,0.18)_40%,rgba(0,0,0,0)_100%)]">
          <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-10 top-1/3 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0)_35%)]" />

          <div className="relative z-10 px-6 py-12 sm:px-10 sm:py-14 lg:px-14">
            <img 
              src="https://i.ibb.co/dsbGg9f5/image.png" 
              alt="LeetCode Trainer" 
              className={`absolute -bottom-0 left-0 scale-105 -z-10 h-fit opacity-5 object-cover rounded-3xl ${resolvedTheme === 'dark' ? 'invert' : ''}`} 
            />
            <div className="grid grid-cols-1 gap-8 lg:gap-10 items-stretch">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-theme-border bg-primary-text pl-3 pr-4 py-2 text-xs sm:text-sm text-background">
                  <Icon icon="hugeicons:leetcode" className="h-5 w-5" />
                  <span className="mt-0.5">LeetCode Trainer</span>
                </div>

                <div className="mt-5 max-w-3xl">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-thin tracking-tight text-primary-text">
                    Practice LeetCode with live AI coaching.
                  </h2>
                  <p className="mt-4 text-base sm:text-lg text-text-70">
                    Get unstuck faster with step-by-step hints, pattern detection, and targeted feedback that helps you solve problems on your own.
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <span className="rounded-full border border-theme-border bg-container-primary/70 px-4 py-2 text-sm text-text-60">Guided hints, not full answers</span>
                  <span className="rounded-full border border-theme-border bg-container-primary/70 px-4 py-2 text-sm text-text-60">Time + space complexity coaching</span>
                  <span className="rounded-full border border-theme-border bg-container-primary/70 px-4 py-2 text-sm text-text-60">Pattern-based question drills</span>
                </div>

                <form
                  className="mt-10 w-full max-w-md mx-auto"
                  onSubmit={(e) => {
                    e.preventDefault();
                  }}
                >
                  <div
                    className="flex w-full min-h-[2.75rem] sm:min-h-12 items-center gap-0 rounded-full border border-base-20 bg-white p-1.5 pl-4"
                  >
                    <input
                      type="email"
                      name="email"
                      id="leet-trainer-waitlist-email"
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={waitlistEmail}
                      onChange={(e) => setWaitlistEmail(e.target.value)}
                      className="min-w-0 flex-1 bg-transparent py-0 pr-2 text-sm sm:text-base text-zinc-900 placeholder:text-zinc-400 outline-none"
                    />
                    <button
                      type="submit"
                      className="shrink-0 cursor-pointer rounded-full bg-black px-4 py-2 text-sm sm:px-6 sm:py-2.5 sm:text-base font-medium text-white transition-all hover:opacity-90"
                    >
                      Join waitlist
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto pt-6 px-4">
        <StartNowButton />
      </section>

      {/* Footer */}
      <Footer
        onOpenContact={() => setIsContactModalOpen(true)}
        onOpenAbout={() => setIsAboutModalOpen(true)}
      />
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
      <AboutFullscreenModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />
    </div>
  );
}

function Footer({
  onOpenContact,
  onOpenAbout,
}: {
  onOpenContact: () => void;
  onOpenAbout: () => void;
}) {
  const footerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const productLinks = [
    { label: "Features", href: "#features" },
    { label: "Get Started", href: "#get-started" },
    { label: "Pricing", href: "#pricing" },
    { label: "Leetcode", href: "#leetcode" },
  ];

  const companyLinks = [
    { label: "About", action: onOpenAbout },
    { label: "Contact", action: onOpenContact },
  ];

  const handleProductLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault();
    const sectionId = href.replace("#", "");
    if (!sectionId) return;
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <footer ref={footerRef} className="relative z-10">
      <div className="mx-4 relative bg-container-primary border border-theme-border rounded-3xl overflow-hidden mb-14 shadow-[0_0_70px_0_rgba(0,0,0,0.08)]">
        <div className="relative z-10 px-8 md:px-12 pt-12 pb-8">
          <div className="flex flex-col lg:flex-row justify-between gap-12">
            <div className="max-w-md">
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.png" alt="Logo" className="w-8 h-8" />
                <span className="font-semibold text-xl text-primary-text">dontvibecode</span>
              </div>
              <p className="text-text-70 text-sm leading-relaxed mb-6">
                dontvibecode makes learning code simple, fun, and intuitive. Learn better, build faster, and level up skills that stay with you.              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="text-text-70 hover:text-primary-text transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a href="#" className="text-text-70 hover:text-primary-text transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a href="#" className="text-text-70 hover:text-primary-text transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a href="#" className="text-text-70 hover:text-primary-text transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8 lg:gap-16">
              <div>
                <h3 className="font-semibold text-primary-text mb-4">Product</h3>
                <ul className="space-y-3">
                  {productLinks.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        onClick={(e) => handleProductLinkClick(e, link.href)}
                        className="text-text-70 hover:text-primary-text text-sm transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-primary-text mb-4">Company</h3>
                <ul className="space-y-3">
                  {companyLinks.map((link) => (
                    <li key={link.label}>
                      <button
                        type="button"
                        onClick={link.action}
                        className="cursor-pointer text-text-70 hover:text-primary-text text-sm transition-colors"
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mt-12 pt-8 border-t border-theme-border">
            <p className="text-text-60 text-sm">© 2026 dontvibe. All rights reserved.</p>
            {/* <div className="flex items-center gap-6 mt-4 md:mt-0">
              <a href="#" className="text-text-60 hover:text-primary-text text-sm underline transition-colors">Privacy Policy</a>
              <a href="#" className="text-text-60 hover:text-primary-text text-sm underline transition-colors">Terms of Service</a>
              <a href="#" className="text-text-60 hover:text-primary-text text-sm underline transition-colors">Cookies Settings</a>
            </div> */}
          </div>
        </div>
      </div>

      <motion.div 
        className={`relative -ml-[20vw] w-[300vw] sm:w-[140vw] pointer-events-none overflow-hidden`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          version="1"
          style={{ opacity: 0.09, marginBottom: "-30px", filter: resolvedTheme === "dark" ? "invert(1)" : "invert(0)" }}
          viewBox="0 0 1452 192"
        >
          <path d="M38.2 17.2C17.6 19.8 11.1 27.3 9 51.3c-1.2 13.7-1.2 64.5-.1 85.8 1 17.8 2.2 21.2 9.3 27.3 7.5 6.4 11.4 7 44.8 7.1 32 0 35.4-.4 46.8-5.6 14.2-6.5 28.3-19 36-31.9 3.7-6.2 9.3-21.1 10.4-27.5.2-1.1 1.3 2.7 2.5 8.4 4.9 23.1 17.4 39.8 37.5 49.9 22.3 11.3 45.8 11.2 68.8-.1 12.1-5.9 23.9-17.7 30.1-29.9 2.4-4.9 4.7-8.8 5-8.8s.9 5 1.3 11c1.3 22.3 4.5 29 16.1 34.1 12.6 5.6 27 0 30.5-11.9.6-2 1.4-9.8 1.7-17.4.3-7.5 1-14.2 1.5-15 1.5-2.3 5.1 3.1 8.2 12.7 6 18.3 7.9 22.5 12.1 26.9 5.2 5.3 11.4 7.6 20.9 7.6 7.9 0 15.3-2.8 19.3-7.1 8.3-9.2 11.8-25.7 13.5-62.9.6-14.6 1.2-26.6 1.3-26.7.1-.2 1.9.6 4.1 1.8 3.1 1.6 5 1.9 9.4 1.4 4.7-.5 6-.3 8 1.3 2.3 1.8 2.5 2.7 2.4 9.4-.1 4-1.6 14.2-3.4 22.8-2.6 12.6-3.1 16.8-2.6 22.5 1.7 20.4 11.7 33.6 27.1 36 8.8 1.4 19.6-5.5 24-15.4.9-2 2-4.5 2.5-5.6 1.5-3.4 2.8-9.6 4.1-19.8 1-7.8 1-12.5 0-23-2.3-24.8-2.2-25 6.9-24 5.5.5 5.8.4 9.8-3.1 2.5-2.3 4.7-5.5 5.8-8.7l1.8-5 1.7 10.3c3.9 24.3 11.9 46.4 23.3 64.8 8.3 13.5 16.6 22.1 26.6 27.7 5.9 3.2 7.2 3.6 14 3.6 6.3 0 8.4-.4 13-2.8 7.5-3.8 12.1-7.7 18.8-15.9 8.4-10.4 9.9-12.8 16.2-25 9.2-17.8 14.5-34.2 18.1-55.6 2.5-15.1 2.3-32.9-.5-39.5-2.8-6.7-6.7-11.5-11.5-14.3-3.9-2.3-5.7-2.7-12.1-2.6-19.7.1-28.1 12-37.8 53.4-2 8.5-3.3 12.5-4.3 12.5s-2.2-4.9-4.5-18c-6.7-39-12.9-47.9-32.9-47.7-7.3 0-13.7 2.6-18.2 7.4-4.3 4.4-8.2 14.4-9 22.5l-.6 6.6-2.5-4.9c-4.9-9.7-7.9-12.2-18.7-15.6-6.3-2.1-9-2.3-27.5-2.2-17.7 0-21.7.3-29.3 2.2-13.4 3.4-17.4 5.8-22.2 13.8l-2.1 3.5-2.3-4.3c-3.6-6.6-8-10.6-13.8-12.8-6.7-2.5-13.9-2.6-19.5-.1-5.2 2.2-7.1 4.2-9.9 10.6-2 4.4-2.3 7.3-2.8 23.2-.3 10-.9 18.4-1.2 18.7-2.5 2.5-6.8-5-12.4-21.9-6.1-18.2-9.9-23.7-18.6-27.4-7.1-3.1-18.1-3.1-24.4-.1-9 4.4-14.7 15-16.9 31.6-.7 5.8-1.5 10.7-1.8 11s-1.8-2.1-3.2-5.2c-5.5-12-17.6-26.5-25.2-30.4-1.6-.8-3.6-1.9-4.4-2.5-.8-.7-4-2.2-7-3.5-26.3-11.1-56.2-7-77.6 10.5-11.9 9.8-19.2 21.2-24.1 38l-1.7 6-.9-8.5c-.9-8.7-5-24.3-7.1-27-.6-.8-1.8-2.8-2.6-4.5-2.2-4.4-14.9-16.5-21.2-20.3C111 24.4 91.7 19 67.5 17c-13.8-1.1-19.1-1.1-29.3.2m44.2 51.2c4.4 1.8 6.6 5.2 6.6 9.9 0 3.1-.7 4.6-3.4 7.3-3 3-4 3.4-8.8 3.4-6.3 0-8.2-1.4-9.2-7.2-.8-4.6.8-11.9 3-13.5 2.3-1.7 7.6-1.6 11.8.1M237.3 82c3.7 4.1 3.5 7.4-.7 11.6-4.1 4.1-8.4 4.5-13.3 1.1-5.8-3.8-5.9-10.7-.3-14.5 4.8-3.2 10.4-2.5 14.3 1.8M1001.3 18.4c-21.9 4.2-35.8 12.5-51.5 30.9-6.8 7.9-14.2 27.7-15.5 41.3l-.6 6.3-2-3.9c-3.6-7.3-8.4-9.3-23.2-9.4-7.8-.1-9-.3-9.3-1.9-.8-3.9 1.7-5 9.5-4.3 8.6.7 14.2-1 19-5.6 9.5-9.2 7.7-24.9-3.7-32.4-12.1-8.1-43.2-8.5-60-.8-11.6 5.3-18.2 15.7-20 31.3-.5 4.7-1 17-1 27.3 0 10.4-.4 18.8-.8 18.8-.5 0-1.5-1.9-2.2-4.3-1.6-5.6-5.2-11.6-9.6-16.1-3.6-3.7-3.6-3.7-1.7-5.9 1-1.2 3-4.6 4.4-7.6 2-4.6 2.4-7 2.4-15s-.4-10.3-2.2-13.7c-5-9.3-12-15-23.6-19.1-16.3-5.7-59.6-3.4-75.5 4-10 4.6-10.4 7.8-9.9 70.3.4 53 .5 54.7 5.8 58.5 1.6 1.1 6.8 2.9 11.6 4.1 12.4 2.9 56.6 3.8 66.4 1.4 19.8-5 29.4-15.8 33.5-37.6l1.8-9.5 1.2 7.3c4.8 28 14.7 36.7 44.6 39.8 15.4 1.5 32.9-4.3 39-13.2 3.3-4.7 5.4-13.5 4.4-18.7-1.7-9.3-11.4-14.7-23.8-13.3-7 .8-11.1-1-10.6-4.7.3-2.1.8-2.2 10.8-2.2 5.8 0 11.4-.1 12.5-.3 3.4-.4 9.4-7 10.9-12.1.8-2.6 1.6-4 1.9-3.1 1.6 5.1 3.7 12.4 3.7 13.2 0 .6 1.2 3.8 2.7 7.2 7.7 17.4 23 32.5 41.6 40.9 16.1 7.3 44.3 7.6 60.9.6 11.5-4.9 21-13 26.4-22.5 1.9-3.3 3.4-6.8 3.4-7.7 0-2.4 2.7-2.1 3.5.4.7 2.2 8.4 12 12.4 15.8 17.8 16.9 45.4 24.1 69.6 18.1 13.4-3.3 23.7-9.1 33.6-19 4.7-4.7 9.3-9.9 10.2-11.5 3.9-7.1 6.8-14 8.4-19.6.9-3.2 2-5.9 2.5-5.9.4 0 .8 5.3.8 11.7 0 18.1 1.4 28.7 4.4 33.8 3.1 5.2 9.9 9.9 16.9 11.6 7.1 1.7 49.6.5 58.7-1.6 20.7-4.9 38-19 48.3-39.5 1.5-3 2.7-6.4 2.8-7.5.1-3.7 1.7 1.8 3.4 11.8 3.6 21.2 12.5 31.5 30.2 35.2 17 3.6 33.3 2.4 43.7-3.3s15.3-16.2 12.7-27.6c-2.1-9.4-9.1-13.2-22.3-12.2-8.5.7-10.8-.4-10.8-5V120l11.8.2c11.1.3 11.9.2 15-2.2 5-3.7 7.6-9.3 7.6-16.5 0-7-1.9-11.3-6.6-14.7-2.9-2-4.7-2.3-15-2.7-12.5-.3-14-1-11.7-5.3 1-1.9 1.8-2 8.5-1.5 12.9 1 20.4-3.3 24.3-13.8 2.1-5.4 2.1-5.5.1-11.9-2.1-6.7-7.2-12.6-12.8-14.7-15.7-6-43.7-4.8-58.1 2.5-8.8 4.5-14.9 13.8-17.1 26.1-2.3 13-2.2 12.9-6.5 4.6-11.6-22-35-34.8-70.3-38.2-22.5-2.2-40.4.1-48.1 6.3-6.3 5-9.1 17.6-9.1 41.8 0 12.7-.8 14.3-2.9 5.8-2.8-11.5-13-28.5-20.8-34.6-1.9-1.5-4.6-3.7-6.1-4.9-4.4-3.7-16.2-9-25.2-11.3-44.6-11.4-91 21.9-91 65.2 0 4.3-.4 7.8-.9 7.8-.4 0-1.9-.8-3.2-1.8-7.7-5.9-18.8-7.3-34.9-4.3-15.9 2.9-19.4 2.8-23-.8-5.2-5.2-5.2-11.3.2-16.3 4.2-3.9 9.5-3.8 15.4.1 15.9 10.8 37.3 3.8 43.3-14.1 2.9-8.5 2.8-20.2-.2-28.1-4.3-11.2-13.6-19.2-26.6-22.9-8.7-2.5-27.2-3.2-36.8-1.4M783.2 64.7c4.1 4.6 1.7 10.3-4.2 10.3s-8.1-6.2-3.4-9.9c3.3-2.6 5.6-2.7 7.6-.4m496.5 13.8c5.7 2.4 7.3 4.3 7.3 8.8 0 9.5-14.8 14.6-18 6.1-1.8-4.6-1.2-12.2 1-14.4 2.4-2.4 4.8-2.5 9.7-.5m-135.7 1c3.6 1.8 5 4.3 5 8.5s-4.9 9-9.2 9c-10.1 0-14.6-12.1-6.5-17.1 3.8-2.3 6.8-2.4 10.7-.4M784.1 125c1.3.7 1.9 2.1 1.9 4.5 0 3.7-2 5.5-6.2 5.5-3.5 0-6-2.3-6-5.4 0-4.6 5.6-7.1 10.3-4.6M686 32.9c-8.5 2.7-13.1 6.6-16.9 14.1-5.5 10.8-6.6 20.5-6.6 59.5 0 30.8.2 35.8 1.8 41.4 4.7 16.4 18.6 26.8 32.5 24.1 12.8-2.4 19.7-9.6 22.7-23.9 3.7-17.6 4.1-58.6.8-85.1-2-16.8-5.3-22.9-14.6-27.6-5.5-2.8-15.1-4-19.7-2.5"></path>
        </svg>
        <div className="absolute bottom-0 top-0 left-0 right-0 bg-gradient-to-b from-transparent to-background"></div>
      </motion.div>
    </footer>
  );
}

