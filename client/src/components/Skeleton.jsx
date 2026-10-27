import React from 'react';

export const ItemCardSkeleton = () => {
  return (
    <div className="card overflow-hidden flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-sm">
      {/* Top Image area */}
      <div className="w-full h-48 animate-shimmer relative">
        <div className="absolute top-3 left-3 w-20 h-6 rounded-full bg-slate-300/60" />
        <div className="absolute top-3 right-3 w-16 h-6 rounded-full bg-slate-300/60" />
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="w-24 h-4 rounded bg-slate-200 animate-shimmer mb-3" />
          <div className="w-full h-5 rounded bg-slate-200 animate-shimmer mb-2" />
          <div className="w-3/4 h-5 rounded bg-slate-200 animate-shimmer mb-3" />
          <div className="w-full h-3 rounded bg-slate-100 animate-shimmer mb-1.5" />
          <div className="w-2/3 h-3 rounded bg-slate-100 animate-shimmer" />
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="w-28 h-4 rounded bg-slate-200 animate-shimmer" />
          <div className="w-20 h-4 rounded bg-slate-200 animate-shimmer" />
        </div>
      </div>
    </div>
  );
};

export const ItemDetailSkeleton = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Image gallery skeleton */}
        <div>
          <div className="w-full h-80 rounded-2xl animate-shimmer mb-4" />
          <div className="flex space-x-3">
            <div className="w-20 h-20 rounded-xl animate-shimmer" />
            <div className="w-20 h-20 rounded-xl animate-shimmer" />
            <div className="w-20 h-20 rounded-xl animate-shimmer" />
          </div>
        </div>

        {/* Right: Info skeleton */}
        <div className="space-y-5">
          <div className="flex space-x-2">
            <div className="w-24 h-7 rounded-full animate-shimmer" />
            <div className="w-20 h-7 rounded-full animate-shimmer" />
          </div>
          <div className="w-4/5 h-8 rounded-lg animate-shimmer" />
          <div className="w-1/2 h-5 rounded-lg animate-shimmer" />

          <div className="p-5 rounded-xl border border-slate-100 space-y-3 bg-white">
            <div className="w-full h-4 rounded animate-shimmer" />
            <div className="w-full h-4 rounded animate-shimmer" />
            <div className="w-3/4 h-4 rounded animate-shimmer" />
          </div>

          <div className="space-y-3 pt-4">
            <div className="w-full h-12 rounded-xl animate-shimmer" />
            <div className="w-full h-12 rounded-xl animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const ClaimCardSkeleton = () => {
  return (
    <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="w-36 h-5 rounded bg-slate-200 animate-shimmer" />
        <div className="w-20 h-6 rounded-full bg-slate-200 animate-shimmer" />
      </div>
      <div className="w-full h-4 rounded bg-slate-100 animate-shimmer" />
      <div className="w-2/3 h-4 rounded bg-slate-100 animate-shimmer" />
      <div className="pt-2 flex justify-end space-x-2">
        <div className="w-24 h-8 rounded-lg bg-slate-200 animate-shimmer" />
        <div className="w-24 h-8 rounded-lg bg-slate-200 animate-shimmer" />
      </div>
    </div>
  );
};

export default {
  ItemCardSkeleton,
  ItemDetailSkeleton,
  ClaimCardSkeleton,
};
