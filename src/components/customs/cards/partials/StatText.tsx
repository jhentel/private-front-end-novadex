"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React from "react";
// ######## Components 🧩 ########
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/libraries/utils";
import LightTooltip from "../../light-tooltip";

const StatText = ({
  icon,
  value,
  label,
  tooltipLabel,
  valueColor,
  customClassName,
  customClassIcon,
}: {
  icon?: string;
  value: string;
  label: string;
  tooltipLabel: string;
  valueColor: string;
  customClassName?: string;
  customClassIcon?: string;
}) => (
  <LightTooltip tip={tooltipLabel} position="top">
    <div className="flex items-center justify-center gap-x-[2px]">
      {icon ? (
        <Image
          src={`/icons/${icon}.svg`}
          alt={`${label} Icon`}
          height={16}
          width={16}
          quality={50}
          className={cn(
            "relative aspect-square size-4 flex-shrink-0",
            customClassIcon,
          )}
        />
      ) : (
        <span
          className={cn(
            "font-geistSemiBold text-xs text-fontColorSecondary",
            customClassName,
          )}
        >
          {label}
        </span>
      )}
      <span
        className={cn(
          `font-geistSemiBold text-xs ${valueColor}`,
          customClassName || "",
        )}
      >
        {value}
      </span>
    </div>
  </LightTooltip>
);
StatText.displayName = "StatText";
export default StatText;
