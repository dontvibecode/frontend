"use client";

import React from "react";
import { motion } from "framer-motion";

const ExpandedSkeletonLoader: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full h-full p-6 space-y-8 overflow-hidden"
    >
      {/* Header Section */}
      <div className="flex items-center justify-between mt-12">
        <div className="flex items-center gap-3">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
      
      {/* Progress Header Skeleton */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          {/* Circular Progress + Text */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse" />
            <div className="space-y-2">
              <div className="h-5 w-36 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-3 w-28 bg-gray-100 rounded-full animate-pulse" />
            </div>
          </div>
          {/* Stat Boxes */}
          <div className="flex gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col items-center px-4 py-2 aspect-[2] bg-gray-50 rounded-xl min-w-[80px]">
           
              </div>
            ))}
          </div>
        </div>
        {/* Languages + Bookmarked Row */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-5 w-24 bg-gray-200 rounded-full animate-pulse" />
          </div>
        </div>
      </div>


      {/* Main Content Area */}
      <div className="bg-white rounded-2xl space-y-5">
        {/* Explanation Section */}
        <div className="space-y-3">
          <div className="h-6 w-40 bg-gray-200 rounded-full animate-pulse" />
          <div className="space-y-2 w-2/3">
            <div className="h-4 w-9/10 bg-gray-100 rounded-full animate-pulse" />
            <div className="h-4 w-full bg-gray-100 rounded-full animate-pulse" />
            <div className="h-4 w-5/6 bg-gray-100 rounded-full animate-pulse" />
            <div className="h-4 w-full bg-gray-100 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Code Block Skeleton */}
        {/* <div className="bg-[#1e1e1e] rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="ml-2 h-3 w-24 bg-gray-600 rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-1/3 bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-gray-700 rounded animate-pulse ml-4" />
            <div className="h-4 w-1/2 bg-gray-700 rounded animate-pulse ml-4" />
            <div className="h-4 w-3/4 bg-gray-700 rounded animate-pulse ml-8" />
            <div className="h-4 w-1/4 bg-gray-700 rounded animate-pulse ml-4" />
            <div className="h-4 w-1/3 bg-gray-700 rounded animate-pulse" />
          </div>
        </div> */}

        {/* Exercise Tabs Skeleton */}
        <div className="flex gap-2 pt-2">
          <div className="aspect-[3] w-full bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
};

export default ExpandedSkeletonLoader;

