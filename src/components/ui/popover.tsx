"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as Sentry from "@sentry/nextjs";

import { cn } from "@/libraries/utils";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverContent = React.memo(
  React.forwardRef<
    React.ElementRef<typeof PopoverPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
      isWithAnimation?: boolean;
    }
  >(
    (
      {
        className,
        align = "center",
        // isWithAnimation = false,
        sideOffset = 4,
        ...props
      },
      ref,
    ) => (
      <PopoverErrorBoundary>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            ref={ref}
            align={align}
            sideOffset={sideOffset}
            className={cn(
              "z-50 w-72 rounded-[8px] border border-border bg-[#080811] p-4 text-fontColorPrimary outline-none",
              // isWithAnimation &&
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
              className,
            )}
            {...props}
          />
        </PopoverPrimitive.Portal>
      </PopoverErrorBoundary>
    ),
  ),
);
PopoverContent.displayName =
  PopoverPrimitive.Content.displayName || "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };

class PopoverErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn(
      "React #185 Error Related 🚫 - PopoverContent crashed:",
      error,
      errorInfo,
    );
    Sentry.captureException(
      new Error(
        `Error 🔴 - (PopoverContent crashed:): ${errorInfo} | ${error}`,
      ),
    );
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}
