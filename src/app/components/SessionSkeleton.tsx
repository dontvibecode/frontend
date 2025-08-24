import React from 'react';

interface SessionSkeletonProps {
  count?: number;
}

const SessionSkeletonItem: React.FC = () => (
  <div className="w-full p-3 rounded-lg animate-pulse">
    <div className="flex justify-between items-start mb-2">
      {/* Title skeleton */}
      <div className="h-5 bg-gray-300 rounded-full flex-1 mr-3"></div>
      {/* Date skeleton */}
      <div className="h-5 bg-gray-300 rounded-full w-12 flex-shrink-0"></div>
    </div>
    {/* Prompt text skeleton - two lines */}
    <div className="space-y-1">
      <div className="h-3 bg-gray-200 rounded-full w-full"></div>
      <div className="h-3 bg-gray-200 rounded-full w-3/4"></div>
    </div>
  </div>
);

const SessionSkeleton: React.FC<SessionSkeletonProps> = ({ count = 6 }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }, (_, index) => (
        <SessionSkeletonItem key={index} />
      ))}
    </div>
  );
};

export default SessionSkeleton;
