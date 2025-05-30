import { cn } from "@/libraries/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import React from "react";

const SellBuyBadge = ({
  type,
  size = "md",
  isExpanded = false,
}: {
  type: "buy" | "sell";
  size?: "sm" | "md";
  isExpanded?: boolean;
}) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full font-geistSemiBold text-xs md:h-7 md:w-7",
              type === "buy"
                ? "bg-[#1CAD9C33]/20 text-success"
                : "bg-[#F65B9333]/20 text-destructive",
              size == "sm" && "h-4 w-4 text-[10px] md:h-5 md:w-5",
              isExpanded && "w-auto px-2 py-3",
            )}
          >
            {type === "buy"
              ? isExpanded
                ? "Buy"
                : "B"
              : isExpanded
                ? "Sell"
                : "S"}
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="z-[9999] bg-[#17172B] px-2 py-1 text-xs"
          sideOffset={5}
          tooltipArrowBgColor="#17172B"
        >
          {type === "buy" ? "Buy" : "Sell"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default React.memo(SellBuyBadge);
