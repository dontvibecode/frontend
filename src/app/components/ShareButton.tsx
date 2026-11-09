import { lessonAPI } from "@/lib/api";
import { setLessonShared, useLessonShared } from "@/lib/lessonShareStore";
import { Check, Globe, Share2 } from "lucide-react";
import { useState } from "react";

interface Props {
  lessonId: number;
  shared?: boolean;
  size?: number;
  idToken?: string;
  label?: boolean;
}

export function ShareButton({
  lessonId,
  shared = false,
  size = 16,
  idToken,
  label = false,
}: Props) {
  const isShared = useLessonShared(lessonId, shared);
  const setIsShared = (next: boolean) => setLessonShared(lessonId, next);
  const [isPending, setIsPending] = useState(false);
  const [justShared, setJustShared] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPending) return;

    const nextState = !isShared;
    setIsShared(nextState);
    setIsPending(true);
    if (nextState) {
      setJustShared(true);
      setTimeout(() => setJustShared(false), 1800);
    }

    try {
      const response = await lessonAPI.toggleLessonShare(lessonId, idToken);
      if (response) {
        setIsShared(response.shared);
      } else {
        setIsShared(!nextState);
      }
    } catch {
      setIsShared(!nextState);
    } finally {
      setIsPending(false);
    }
  };

  const title = isShared
    ? "Published to community — click to unpublish"
    : "Publish lesson to community";

  if (label) {
    return (
      <button
        type="button"
        onClick={handleShare}
        disabled={isPending}
        title={title}
        aria-label={title}
        className={`shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-full text-sm font-medium cursor-pointer transition-all duration-200 border ${
          isShared
            ? "bg-blue-500/10 dark:bg-blue-400/15 text-blue-600 dark:text-blue-400 border-blue-500/25 dark:border-blue-400/30 hover:bg-blue-500/15 dark:hover:bg-blue-400/20"
            : "bg-base-10 hover:bg-base-20 text-text-70 hover:text-primary-text border-transparent"
        }`}
      >
        {justShared ? (
          <Check size={14} className="stroke-[2.25]" />
        ) : isShared ? (
          <Globe size={14} className="stroke-[2]" />
        ) : (
          <Share2 size={14} className="stroke-[2]" />
        )}
        <span>
          {justShared ? "Published" : isShared ? "Shared" : "Share"}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={isPending}
      title={title}
      aria-label={title}
      className={`shrink-0 w-7 h-7 flex items-center justify-center rounded-full cursor-pointer transition-all duration-200 ${
        isShared
          ? "bg-blue-500/12 dark:bg-blue-400/15 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/25 dark:ring-blue-400/30 hover:bg-blue-500/20"
          : "text-text-70 hover:text-primary-text hover:bg-base-10"
      }`}
    >
      {justShared ? (
        <Check size={size - 1} className="stroke-[2.25]" />
      ) : isShared ? (
        <Globe size={size - 1} className="stroke-[2]" />
      ) : (
        <Share2 size={size - 1} className="stroke-[2]" />
      )}
    </button>
  );
}


