import React, { useState, useEffect, useCallback } from 'react';

interface TextUnrollProps {
  text: string;
  className?: string;
  duration?: number; // total animation duration in milliseconds
  delay?: number; // delay before starting animation
  chunkSize?: { min: number; max: number };
  onComplete?: () => void; // callback when animation completes
}

const TextUnroll: React.FC<TextUnrollProps> = ({ 
  text, 
  className = "", 
  duration = 2000,
  delay = 0,
  chunkSize = { min: 2, max: 4 },
  onComplete
}) => {
  const [visibleWords, setVisibleWords] = useState<number>(0);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const words = text.split(' ');

  // Calculate intervals based on total duration and word count
  const calculateIntervals = useCallback(() => {
    const totalChunks = Math.ceil(words.length / ((chunkSize.min + chunkSize.max) / 2));
    const baseInterval = duration / totalChunks;
    
    const intervals: number[] = [];
    let remainingWords = words.length;
    let remainingTime = duration;
    
    while (remainingWords > 0) {
      const chunkLength = Math.min(
        Math.floor(Math.random() * (chunkSize.max - chunkSize.min + 1)) + chunkSize.min,
        remainingWords
      );
      const interval = remainingTime / Math.ceil(remainingWords / chunkLength);
      intervals.push(interval);
      remainingWords -= chunkLength;
      remainingTime -= interval;
    }
    
    return intervals;
  }, [words.length, duration, chunkSize]);

  useEffect(() => {
    if (!hasStarted) return;
    if (visibleWords >= words.length) {
      onComplete?.();
      return;
    }

    const intervals = calculateIntervals();
    const currentIntervalIndex = Math.floor(visibleWords / ((chunkSize.min + chunkSize.max) / 2));
    const interval = intervals[currentIntervalIndex] || duration / 10;

    const timer = setTimeout(() => {
      const chunkLength = Math.floor(Math.random() * (chunkSize.max - chunkSize.min + 1)) + chunkSize.min;
      setVisibleWords(prev => Math.min(prev + chunkLength, words.length));
    }, interval);

    return () => clearTimeout(timer);
  }, [visibleWords, words.length, hasStarted, calculateIntervals, chunkSize, duration, onComplete]);

  // Handle delay and start animation
  useEffect(() => {
    setVisibleWords(0);
    setHasStarted(false);
    
    const delayTimer = setTimeout(() => {
      setHasStarted(true);
    }, delay);

    return () => clearTimeout(delayTimer);
  }, [text, delay]);

  return (
    <p className={`${className} leading-relaxed`}>
      {words.map((word, index) => (
        <span
          key={index}
          className={`inline transition-opacity duration-300 ${
            index < visibleWords ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            transitionDelay: `${Math.max(0, index - visibleWords + 1) * 50}ms`
          }}
        >
          {word}
          {index < words.length - 1 && ' '}
        </span>
      ))}
    </p>
  );
};

export default TextUnroll;
