"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/libraries/utils";

const TOOLTIP_DELAY = 100;
const TOOLTIP_OFFSET = 4;
const DEFAULT_BG_COLOR = "#2B2B3B";

const animationStyles = {
  top: "animate-slideDownAndFade",
  bottom: "animate-slideUpAndFade",
  left: "animate-slideRightAndFade",
  right: "animate-slideLeftAndFade",
} as const;

const tooltipBaseClassName =
  "relative z-[999] rounded-sm bg-[#2B2B3B] px-3 py-1.5 text-xs text-fontColorPrimary shadow-[0_4px_16px_#00000] backdrop-blur-[4px]";

// Simplified TooltipContent with better memoization
const TooltipContent = React.memo(
  React.forwardRef<
    React.ElementRef<typeof TooltipPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
      showTriangle?: boolean;
      tooltipArrowBgColor?: string;
      isWithAnimation?: boolean;
      arrowWidth?: number;
      arrowHeight?: number;
    }
  >(
    (
      {
        className,
        showTriangle = true,
        tooltipArrowBgColor = DEFAULT_BG_COLOR,
        side = "top",
        sideOffset = TOOLTIP_OFFSET,
        isWithAnimation = true,
        arrowWidth = 11,
        arrowHeight = 5,
        ...props
      },
      ref,
    ) => (
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          ref={ref}
          side={side}
          sideOffset={sideOffset}
          className={cn(
            tooltipBaseClassName,
            isWithAnimation && animationStyles[side],
            className,
          )}
          {...props}
        >
          {showTriangle && (
            <TooltipPrimitive.Arrow
              width={arrowWidth}
              height={arrowHeight}
              style={{ fill: tooltipArrowBgColor }}
            />
          )}
          {props.children}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    ),
  ),
);

TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// Simplified TooltipTrigger
const TooltipTrigger = React.memo(TooltipPrimitive.Trigger);
TooltipTrigger.displayName = TooltipPrimitive.Trigger.displayName;

// Optimized TooltipProvider with reduced state management
const TooltipProviderCustom = React.memo(
  ({ children }: { children: React.ReactNode }) => (
    <TooltipPrimitive.Provider delayDuration={0}>
      <TooltipErrorBoundary>
        <TooltipPrimitive.Root>{children}</TooltipPrimitive.Root>
      </TooltipErrorBoundary>
    </TooltipPrimitive.Provider>
  ),
);

TooltipProviderCustom.displayName = "TooltipProviderCustom";

// Simplified ErrorBoundary
class TooltipErrorBoundary extends React.PureComponent<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

// Simplified Tooltip
const Tooltip = React.memo(TooltipPrimitive.Root);
Tooltip.displayName = TooltipPrimitive.Root.displayName;

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProviderCustom as TooltipProvider,
};
