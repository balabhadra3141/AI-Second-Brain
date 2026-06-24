'use client';

export default function SkeletonCard({ variant = 'default' }: { variant?: 'task' | 'knowledge' | 'idea' | 'default' }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-raised p-5">
      {/* Header skeleton */}
      <div className="mb-3 flex items-center gap-2.5">
        <div className="skeleton-shimmer h-4 w-16 rounded-md" />
        <div className="skeleton-shimmer h-3 w-12 rounded" />
      </div>

      {/* Content skeleton — varies by type */}
      {variant === 'task' && (
        <div className="flex gap-3">
          <div className="skeleton-shimmer mt-0.5 h-[18px] w-[18px] flex-shrink-0 rounded-[5px]" />
          <div className="flex-1 space-y-2">
            <div className="skeleton-shimmer h-4 w-full rounded" />
            <div className="skeleton-shimmer h-4 w-3/4 rounded" />
            <div className="mt-3 flex gap-3">
              <div className="skeleton-shimmer h-3 w-10 rounded" />
              <div className="skeleton-shimmer h-3 w-20 rounded" />
            </div>
          </div>
        </div>
      )}

      {variant === 'knowledge' && (
        <>
          <div className="border-l-2 border-skeleton-shine pl-4 space-y-2">
            <div className="skeleton-shimmer h-4 w-full rounded" />
            <div className="skeleton-shimmer h-4 w-full rounded" />
            <div className="skeleton-shimmer h-4 w-2/3 rounded" />
            <div className="skeleton-shimmer mt-2 h-3 w-40 rounded" />
          </div>
          <div className="mt-4 space-y-1.5">
            <div className="skeleton-shimmer h-7 w-36 rounded-lg" />
            <div className="skeleton-shimmer h-7 w-44 rounded-lg" />
          </div>
        </>
      )}

      {variant === 'idea' && (
        <>
          <div className="flex gap-3">
            <div className="skeleton-shimmer h-7 w-7 flex-shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="skeleton-shimmer h-4 w-full rounded" />
              <div className="skeleton-shimmer h-4 w-5/6 rounded" />
            </div>
          </div>
          <div className="mt-4 ml-10 space-y-2">
            <div className="skeleton-shimmer h-3 w-16 rounded" />
            <div className="skeleton-shimmer h-3.5 w-3/4 rounded" />
            <div className="skeleton-shimmer h-3.5 w-2/3 rounded" />
            <div className="skeleton-shimmer h-3.5 w-1/2 rounded" />
          </div>
        </>
      )}

      {variant === 'default' && (
        <div className="space-y-2">
          <div className="skeleton-shimmer h-4 w-full rounded" />
          <div className="skeleton-shimmer h-4 w-5/6 rounded" />
          <div className="skeleton-shimmer h-4 w-2/3 rounded" />
        </div>
      )}
    </div>
  );
}
