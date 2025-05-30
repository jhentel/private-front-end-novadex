import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/libraries/utils";
import Image from "next/image";
import React from "react";
import { CachedImage } from "../CachedImage";
import { usePopupStore } from "@/stores/use-popup-state";

const HeadCol = ({
  label,
  tooltipContent,
  className,
  sortButton,
  sortButtonAfterTooltip,
  isWithBorder,
  style,
}: {
  label: string | React.ReactNode;
  tooltipContent?: string;
  className?: string;
  sortButton?: React.ReactNode;
  sortButtonAfterTooltip?: React.ReactNode;
  isWithBorder?: boolean;
  style?: React.CSSProperties;
}) => {
  return (
    <div
      className={cn(
        "flex h-full w-full min-w-[120px] items-center gap-x-1",
        className,
      )}
      style={style}
    >
      <span
        className={cn(
          "header__table__text border-border font-geistSemiBold",
          !isWithBorder && "!border-b-transparent",
        )}
      >
        {label}
        {sortButton}
        {tooltipContent && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative aspect-square h-3 w-3 flex-shrink-0">
                  <CachedImage
                    src="/icons/info-tooltip.png"
                    alt="Info Tooltip Icon"
                    fill
                    quality={50}
                    className="object-contain"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent className="z-[999]">
                <p>{tooltipContent}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {sortButtonAfterTooltip}
      </span>
    </div>
  );
};

export default React.memo(HeadCol);
