"use client";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/libraries/utils";
import { useWindowSizeStore } from "@/stores/use-window-size.store";
import { useEffect, useState } from "react";

export default function WalletTrackerSkeleton() {
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

  // Mobile card-based skeleton layout
  if (isMobile) {
    return (
      <div className="flex h-full w-full flex-grow flex-col gap-4 bg-background p-4">
        {[...Array(4)].map((_, cardIndex) => (
          <div
            key={cardIndex}
            className="flex w-full flex-col rounded-lg border border-border bg-card shadow-sm"
          >
            {/* Card Header with Avatar/Icon */}
            <div className="flex w-full items-center justify-between bg-white/[0.04] p-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-6 animate-pulse rounded-full bg-gradient-to-r" />
                <Skeleton className="h-4 w-28 animate-pulse rounded bg-gradient-to-r" />
              </div>

              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 animate-pulse rounded bg-gradient-to-r" />
                <Skeleton className="h-5 w-5 animate-pulse rounded bg-gradient-to-r" />
                <Skeleton className="h-5 w-5 animate-pulse rounded bg-gradient-to-r" />
              </div>
            </div>

            {/* Card Content - 4 rows of data */}
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, rowIndex) => (
                <div key={rowIndex} className="flex flex-col gap-1 p-2">
                  {/* Label */}
                  <Skeleton className="h-4 w-16 animate-pulse rounded bg-gradient-to-r" />
                  {/* Value */}
                  <Skeleton className="h-4 w-10 animate-pulse rounded bg-gradient-to-r" />
                </div>
              ))}
            </div>

            <div className="bottom-0.5 border border-border" />

            {/* Card Footer */}
            <div className="flex items-center justify-between p-2">
              <Skeleton className="h-5 w-24 animate-pulse rounded bg-gradient-to-r" />
              <Skeleton className="h-8 w-24 animate-pulse rounded bg-gradient-to-r" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Desktop table skeleton layout
  return (
    <div className="flex h-full w-full flex-grow flex-col bg-background">
      <OverlayScrollbarsComponent
        defer
        element="div"
        className="table__modal__overlayscrollbar relative flex h-full w-full flex-grow overflow-y-scroll"
        options={{
          overflow: {
            x: "hidden",
            y: "hidden",
          },
          scrollbars: {
            theme: "os-theme-dark",
            visibility: "auto",
            autoHide: "never",
          },
        }}
      >
        <div className="w-full min-w-[1000px]">
          {/* Table Header */}
          <div className="sticky top-0 flex w-full items-center border-b border-border bg-background px-4 py-3">
            <div className="grid w-full grid-cols-7 gap-4">
              <Skeleton className="h-4 w-[90%] animate-pulse rounded bg-gradient-to-r" />
              <Skeleton className="h-4 w-[90%] animate-pulse rounded bg-gradient-to-r" />
              <Skeleton className="h-4 w-[90%] animate-pulse rounded bg-gradient-to-r" />
              <Skeleton className="h-4 w-[90%] animate-pulse rounded bg-gradient-to-r" />
              <Skeleton className="h-4 w-[90%] animate-pulse rounded bg-gradient-to-r" />
              <Skeleton className="h-4 w-[90%] animate-pulse rounded bg-gradient-to-r" />
              <Skeleton className="h-4 w-[90%] animate-pulse rounded bg-gradient-to-r" />
            </div>
          </div>

          {/* Table Body */}
          <div className="flex w-full flex-col">
            {[...Array(20)].map((_, index) => (
              <div
                key={index}
                className={cn(
                  "flex w-full items-center border-b border-border px-4 py-3",
                  // index === 0 && "mt-2",
                  index % 2 === 0 && "bg-white/[0.04]",
                )}
              >
                <div className="grid w-full grid-cols-7 items-center gap-4">
                  <div className="flex w-full items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04]">
                      <Skeleton className="h-12 w-12 animate-pulse rounded-full bg-gradient-to-r" />
                    </div>
                    <div className="flex w-full flex-col gap-2">
                      <Skeleton className="h-4 w-[80%] animate-pulse rounded bg-gradient-to-r" />
                      <Skeleton className="h-4 w-[60%] animate-pulse rounded bg-gradient-to-r" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-[85%] animate-pulse rounded bg-gradient-to-r" />
                  <Skeleton className="h-4 w-[85%] animate-pulse rounded bg-gradient-to-r" />
                  <Skeleton className="h-4 w-[85%] animate-pulse rounded bg-gradient-to-r" />
                  <Skeleton className="h-4 w-[85%] animate-pulse rounded bg-gradient-to-r" />
                  <Skeleton className="h-4 w-[85%] animate-pulse rounded bg-gradient-to-r" />
                  <Skeleton className="h-4 w-[85%] animate-pulse rounded bg-gradient-to-r" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </OverlayScrollbarsComponent>
    </div>
  );
}
