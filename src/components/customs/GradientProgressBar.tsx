"use client";
import { cn } from "@/libraries/utils";
import React from "react";

const GradientProgressBar = ({
  bondingCurveProgress,
  className,
  variant = "radial",
}: {
  bondingCurveProgress: number;
  className?: string;
  variant?: "radial" | "linear";
}) => {
  return (
    <>
      {variant === "radial" && (
        <div
          className={cn(
            "flex h-[10px] w-full items-center justify-start overflow-hidden rounded-[8px] bg-white/[4%]",
            className,
          )}
        >
          <div
            style={{ width: `${bondingCurveProgress}%` }}
            className="relative h-full overflow-hidden rounded-full bg-primary"
          >
            <span
              style={{
                background:
                  "radial-gradient(ellipse at top, #FFE2FF 0%, #FAD2FF 3%, #F0B0FF 10%, #E896FF 17%, #E383FF 25%, #DF74FF 32%, #DF74FF 41%, #673EC0 73%, #562495 100%)",
              }}
              className="absolute left-1/2 top-0 h-[20px] w-[115%] -translate-x-1/2"
            ></span>
          </div>
        </div>
      )}

      {variant === "linear" && (
        <div
          className={cn(
            "flex h-1 w-full items-center justify-start overflow-hidden rounded-[8px] bg-[#202037]",
            className,
          )}
        >
          <div
            style={{ width: `${bondingCurveProgress}%` }}
            className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-[#562495] to-[#DF74FF]"
          ></div>
        </div>
      )}
    </>
  );
};

export default GradientProgressBar;
