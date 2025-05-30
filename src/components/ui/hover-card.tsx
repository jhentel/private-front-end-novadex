"use client";

import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import * as Sentry from "@sentry/nextjs";

import { cn } from "@/libraries/utils";

const HoverCard = HoverCardPrimitive.Root;

const HoverCardTrigger = HoverCardPrimitive.Trigger;

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  {
    isWithAnimation?: boolean;
  } & React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(
  (
    {
      className,
      isWithAnimation = true,
      align = "center",
      sideOffset = 4,
      ...props
    },
    ref,
  ) => {
    const animation =
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2";
    return (
      <HoverCardErrorBoundary>
        <HoverCardPrimitive.Content
          ref={ref}
          align={align}
          sideOffset={sideOffset}
          className={cn(
            "z-50 w-64 rounded-md border border-neutral-200 bg-white p-4 text-neutral-950 shadow-md outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50",
            className,
            isWithAnimation && animation,
          )}
          {...props}
        />
      </HoverCardErrorBoundary>
    );
  },
);
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;

class HoverCardErrorBoundary extends React.Component<
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
      "React #185 Error Related 🚫 - HoverCardContent crashed:",
      error,
      errorInfo,
    );
    Sentry.captureException(
      new Error(
        `Error 🔴 - (HoverCardContent crashed:): ${errorInfo} | ${error}`,
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

export { HoverCard, HoverCardTrigger, HoverCardContent };
