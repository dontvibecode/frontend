import { motion } from "framer-motion";
import { Markdown } from "@/lib/markdownParser";

const ThinkingAnimation = () => {
  const fillDuration = 0.5;
  const lines = [
    { width: "74%" },
    { width: "78%" },
    { width: "65%" },
    { width: "45%" },
  ];
  const totalFillTime = lines.length * fillDuration;
  const cycleDuration = totalFillTime + 1; // Extra time to hold before reset

  return (
    <motion.div
      key={Date.now()} // Force remount to restart animation cycle
      className="h-fit w-full flex flex-col items-start justify-start gap-2 py-2"
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{
        duration: cycleDuration,
        repeat: Infinity,
        times: [0, 0.1, 0.8, 1],
        ease: "easeInOut"
      }}
    >
      {lines.map((line, idx) => (
        <div
          key={idx}
          className="h-3 rounded bg-white overflow-hidden relative"
          style={{ width: line.width }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
              delay: idx * fillDuration,
            }}
          />
          <motion.div
            className="h-full bg-gray-200/60 rounded"
            initial={{ width: "0%" }}
            animate={{ width: ["0%", "0%", "100%", "100%"] }}
            transition={{
              duration: cycleDuration,
              repeat: Infinity,
              times: [
                0,
                (idx * fillDuration) / cycleDuration,
                ((idx + 1) * fillDuration) / cycleDuration,
                1
              ],
              ease: "easeOut",
            }}
          />
        </div>
      ))}
    </motion.div>
  );
};


export const StreamingThoughts = ({
  stage,
  thoughts
}: {
  stage: 'routing' | 'routing_thought' | 'instructor' | 'instructor_thought' | 'complete' | 'error' | null;
  thoughts: string;
}) => {
  if (!stage) return null;

  const stageInfo: Record<string, { label: string; icon: string; component?: React.ReactElement }> = {
    routing: { label: '', icon: '', component: <ThinkingAnimation /> },
    routing_thought: { label: '', icon: '', component: <ThinkingAnimation /> },
    instructor: { label: 'Creating your lesson', icon: '✦' },
    instructor_thought: { label: 'Generating content', icon: '✦' },
  };

  const info = stageInfo[stage];
  if (!info) return null;

  return (
    <>
      {info.component ? (
        info.component
      ) : (
        <>
          <motion.div
            className="w-full flex flex-col items-start justify-start gap-2 py-3 px-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Stage indicator */}
            <div className="flex items-center gap-2">


              <motion.span
                className="text-indigo-400"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {info.icon}
              </motion.span>
              <span
                className="text-sm font-medium text-gray-500 tracking-wide"
                style={{ fontFamily: "'SF Mono', 'Fira Code', monospace" }}
              >
                {info.label}
              </span>


              <div className="flex gap-0.5">
                {[0, 1, 2].map((dotIdx) => (
                  <motion.span
                    key={dotIdx}
                    className="w-1 h-1 rounded-full bg-indigo-300"
                    animate={{
                      opacity: [0.2, 1, 0.2],
                      scale: [0.8, 1, 0.8],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: dotIdx * 0.15,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Streaming thoughts */}
            {thoughts && (
              <motion.div
                className="text-sm text-gray-600 italic border-l-2 border-indigo-200 pl-3 ml-4 max-h-48 overflow-y-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Markdown>{thoughts}</Markdown>
                <motion.span
                  className="inline-block w-2 h-4 bg-indigo-400 ml-0.5"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </>
  );
};