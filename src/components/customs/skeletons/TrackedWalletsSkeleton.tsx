"use client";
import React, { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/libraries/utils";
import { useWindowSizeStore } from "@/stores/use-window-size.store";

export default function TrackedWalletsSkeleton() {
  const [isMounted, setIsMounted] = useState(false);
  const width = useWindowSizeStore((state) => state.width);

  // Add this useEffect to handle hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Add this check to prevent hydration mismatch
  if (!isMounted) {
    return null; // or return a default layout
  }

  const isMobile = width && width < 768;

  return (
    <>
      {!isMobile ? (
        <div className="flex h-full w-full min-w-[300px] max-w-[400px] flex-col border-r border-border">
          <div className="w-full border-b border-border p-4">
            <div className="flex w-full items-center justify-between">
              <div className="flex w-[80%] flex-col gap-2">
                <Skeleton className="h-5 w-[60%] animate-pulse rounded bg-gradient-to-r" />
                <Skeleton className="h-5 w-[40%] animate-pulse rounded bg-gradient-to-r" />
              </div>

              <div className="flex w-[20%] gap-2">
                <Skeleton className="h-0.5 w-8 animate-pulse rounded bg-gradient-to-r" />
                <Skeleton className="h-0.5 w-16 animate-pulse rounded bg-gradient-to-r" />
              </div>
            </div>
          </div>
          {/* Search input skeleton */}
          <div className="w-full border-b border-border bg-white/[0.04] p-3">
            <div className="flex w-full items-center justify-between">
              <div className="flex w-[80%] flex-col gap-1">
                <Skeleton className="h-5 w-[70%] animate-pulse rounded bg-gradient-to-r" />
                <Skeleton className="mt-2 h-5 w-[30%] animate-pulse rounded bg-gradient-to-r" />
              </div>

              <div className="flex w-[20%] gap-2">
                <Skeleton className="h-0.5 w-8 animate-pulse rounded bg-gradient-to-r" />
                <Skeleton className="h-0.5 w-8 animate-pulse rounded bg-gradient-to-r" />
              </div>
            </div>
          </div>

          <div className="h-full w-full overflow-hidden">
            {[...Array(12)].map((_, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center rounded-md p-3 transition-all duration-200",
                  index === 0 && "mt-2",
                  index % 2 !== 0 && "bg-white/[0.04]",
                )}
              >
                <div className="flex flex-1 flex-col gap-y-1">
                  <Skeleton className="h-5 w-[80%] animate-pulse rounded bg-gradient-to-r" />
                  <Skeleton className="mt-2 h-5 w-[40%] animate-pulse rounded bg-gradient-to-r" />
                </div>
                <div className="flex items-center gap-x-1">
                  <Skeleton className="h-8 w-8 animate-pulse rounded bg-gradient-to-r" />
                  <Skeleton className="h-8 w-8 animate-pulse rounded bg-gradient-to-r" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
