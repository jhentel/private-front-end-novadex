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
import LightTooltip from "@/components/customs/light-tooltip";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";

const StatBadge = React.memo(
  ({
    icon,
    value,
    label,
    tooltipLabel,
    valueColor,
    suffix,
    isMigrating,
  }: {
    icon?: string;
    value: number | string;
    label: string;
    tooltipLabel: string;
    valueColor: string;
    suffix?: string;
    isMigrating?: boolean;
  }) => (
    <LightTooltip tip={tooltipLabel} position="top">
      <div
        className={cn(
          "flex h-5 items-center justify-center gap-x-1 rounded-[4px] border border-[rgba(255,255,255,0.03)] bg-[#21212C] pl-1 pr-1.5",
          isMigrating && "bg-white/[8%]",
        )}
      >
        {icon ? (
          <Image
            src={`/icons/${icon}.svg`}
            alt={`${label} Icon`}
            height={16}
            width={16}
            quality={50}
            loading="lazy"
            className="relative aspect-square h-[14px] w-[14px] flex-shrink-0 lg:h-4 lg:w-4"
          />
        ) : (
          <span
            className={`font-geistSemiBold text-xs text-fontColorSecondary`}
          >
            {label}
          </span>
        )}
        <span className={`font-geistSemiBold text-sm ${valueColor}`}>
          {value}
          {suffix || ""}
        </span>
      </div>
    </LightTooltip>
  ),
);
StatBadge.displayName = "StatBadge";
export default StatBadge;