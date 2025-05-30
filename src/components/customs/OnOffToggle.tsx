import React from "react";
import LabelStatusIndicator from "@/components/customs/LabelStatusIndicator";
import { cn } from "@/libraries/utils";
import { ToggleStatusType } from "@/types/global";

export const SnipeModeToggle = ({
  value,
  setValue,
  className,
  variant = "light",
}: {
  value: "fast" | "secure";
  setValue: (status: "fast" | "secure") => void;
  className?: string;
  variant?: "light" | "dark";
}) => {
  return (
    <div
      className={cn(
        "relative h-[34px] w-full rounded-[8px] border border-border p-[3px]",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-full w-full rounded-[6px] bg-white/[8%]",
          variant === "light" ? "" : "bg-secondary",
        )}
      >
        <button
          type="button"
          onClick={() => setValue("fast")}
          className={cn(
            "w-full cursor-pointer rounded-[6px] font-geistSemiBold text-sm text-fontColorSecondary duration-300 hover:text-[#cccce1]",
            value === "fast" && variant === "light"
              ? "bg-white/[8%] text-fontColorPrimary"
              : value === "fast" && variant === "dark"
                ? "bg-white/[4%] text-fontColorPrimary"
                : "",
          )}
        >
          Fast
        </button>
        <button
          type="button"
          onClick={() => setValue("secure")}
          className={cn(
            "w-full cursor-pointer rounded-[6px] font-geistSemiBold text-sm text-fontColorSecondary duration-300 hover:text-[#cccce1]",
            value === "secure" && variant === "light"
              ? "bg-white/[8%] text-fontColorPrimary"
              : value === "secure" && variant === "dark"
                ? "bg-white/[4%] text-fontColorPrimary"
                : "",
          )}
        >
          Secure
        </button>
      </div>
    </div>
  );
};

const OnOffToggle = ({
  value,
  setValue,
  className,
  variant = "light",
  disabled = false,
}: {
  value: ToggleStatusType;
  setValue: (status: ToggleStatusType) => void;
  className?: string;
  variant?: "light" | "dark";
  disabled?: boolean;
}) => {
  return (
    <div
      className={cn(
        "relative h-[34px] w-full rounded-[8px] border border-border p-[3px]",
        className,
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <div
        className={cn(
          "flex h-full w-full rounded-[6px] bg-white/[8%]",
          variant === "light" ? "" : "bg-secondary",
          disabled && "cursor-not-allowed",
        )}
      >
        <button
          type="button"
          disabled={disabled}
          onClick={() => setValue("OFF")}
          className={cn(
            "w-full cursor-pointer rounded-[6px] font-geistSemiBold text-sm text-fontColorPrimary duration-300 hover:text-[#cccce1]",
            value === "OFF" && variant === "light"
              ? "bg-white/[8%] text-fontColorPrimary"
              : value === "OFF" && variant === "dark"
                ? "bg-white/[4%] text-fontColorPrimary"
                : "",
            disabled && "cursor-not-allowed",
          )}
        >
          OFF
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setValue("ON")}
          className={cn(
            "w-full cursor-pointer rounded-[6px] font-geistSemiBold text-sm text-fontColorPrimary duration-300 hover:text-[#cccce1]",
            value === "ON" && variant === "light"
              ? "bg-white/[8%] text-fontColorPrimary"
              : value === "ON" && variant === "dark"
                ? "bg-white/[4%] text-fontColorPrimary"
                : "",
            disabled && "cursor-not-allowed",
          )}
        >
          ON
        </button>
      </div>
    </div>
  );
};

export default React.memo(OnOffToggle);
