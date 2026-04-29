"use client";

import React from "react";
import FluidImage from "./FluidImage";

interface FluidVideoProps {
  src: string;
  className?: string;
  fluidIntensity?: number;
  cursorRadius?: number;
  playbackRate?: number;
  isStatic?: boolean;
  ariaLabel?: string;
}

export default function FluidVideo({
  src,
  className = "",
  fluidIntensity = 0.0003,
  cursorRadius = 0.0003,
  playbackRate = 1,
  isStatic = false,
  ariaLabel = "Fluid video",
}: FluidVideoProps) {
  return (
    <FluidImage
      src=""
      videoSrc={src}
      alt={ariaLabel}
      className={className}
      fluidIntensity={fluidIntensity}
      cursorRadius={cursorRadius}
      isStatic={isStatic}
      videoPlaybackRate={playbackRate}
    />
  );
}
