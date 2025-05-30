"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
// ######## Components 🧩 ########
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import TwitterMonitorCardSkeleton from "./TwitterMonitorCardSkeleton";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";

// Define the ref type (same as in AllVariantTwitterMonitorList)
export interface TwitterMonitorSkeletonListRef {
  scrollTo: (options: ScrollToOptions) => void;
  scrollToTop: () => void;
  scrollToBottom: () => void;
  getScrollInstance: () => any;
  getScrollElement: () => HTMLElement | null;
}

const TwitterMonitorListSkeleton = forwardRef<
  TwitterMonitorSkeletonListRef,
  {
    count?: number;
    variant?: "small" | "large";
    isFullscreen?: boolean;
    className?: string;
  }
>(({ count = 5, variant = "small", isFullscreen = false, className }, ref) => {
  const osRef = useRef<any>(null);

  // Expose scroll methods to parent through ref
  useImperativeHandle(ref, () => ({
    scrollTo: (options: ScrollToOptions) => {
      try {
        const instance = osRef.current?.osInstance();
        if (instance) {
          const viewport = instance.elements()?.viewport;
          if (viewport) {
            viewport.scrollTo(options);
          }
        }
      } catch (error) {
        console.warn("Error in scrollTo:", error);
      }
    },
    scrollToTop: () => {
      try {
        const instance = osRef.current?.osInstance();
        if (instance) {
          const viewport = instance.elements()?.viewport;
          if (viewport) {
            viewport.scrollTo({ top: 0, behavior: "smooth" });
          }
        }
      } catch (error) {
        console.warn("Error in scrollToTop:", error);
      }
    },
    scrollToBottom: () => {
      try {
        const instance = osRef.current?.osInstance();
        if (instance) {
          const viewport = instance.elements()?.viewport;
          if (viewport) {
            viewport.scrollTo({
              top: viewport.scrollHeight,
              behavior: "smooth",
            });
          }
        }
      } catch (error) {
        console.warn("Error in scrollToBottom:", error);
      }
    },
    getScrollInstance: () => osRef.current?.osInstance(),
    getScrollElement: () => {
      try {
        const instance = osRef.current?.osInstance();
        return instance?.elements()?.viewport || null;
      } catch (error) {
        console.warn("Error getting scroll element:", error);
        return null;
      }
    },
  }));

  return (
    <div className={cn("col-span-1 flex w-full flex-grow", className)}>
      <OverlayScrollbarsComponent
        ref={osRef}
        defer
        element="div"
        className="invisible__overlayscrollbar relative w-full flex-grow"
        options={{
          scrollbars: {
            autoHide: "move",
            visibility: "auto",
          },
        }}
      >
        <div className={cn("absolute left-0 top-0 w-full flex-grow")}>
          <div
            className={cn(
              "flex h-auto w-full flex-col",
              isFullscreen ? "gap-y-4" : "gap-y-4",
            )}
          >
            {Array.from({ length: count }).map((_, index) => (
              <TwitterMonitorCardSkeleton key={index} variant={variant} />
            ))}
          </div>
        </div>
      </OverlayScrollbarsComponent>
    </div>
  );
});

TwitterMonitorListSkeleton.displayName = "TwitterMonitorListSkeleton";

export default TwitterMonitorListSkeleton;
