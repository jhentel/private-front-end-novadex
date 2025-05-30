import { cn } from "@/libraries/utils";
import React from "react";

const ProcessorSelectionButton = ({
  value,
  setValue,
  template = ["Jito", "Node", "Ultra", "Ultra v2"],
  className,
  variant = "light",
}: {
  value?: string;
  setValue: (processor: string) => void;
  template?: string[];
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
          "flex h-full w-full rounded-[6px]",
          variant === "light" ? "bg-white/[8%]" : "bg-secondary",
        )}
      >
        {template.map((processor, index) => {
          return (
            <button
              key={index + processor}
              type="button"
              onClick={() => setValue(processor)}
              className={cn(
                "w-full cursor-pointer rounded-[6px] font-geistSemiBold text-sm text-fontColorPrimary duration-300 hover:text-[#cccce1]",
                value === processor && variant === "light"
                  ? "bg-white/[8%] text-fontColorPrimary"
                  : value === processor && variant === "dark"
                    ? "bg-white/[4%] text-fontColorPrimary"
                    : "",
              )}
            >
              {processor}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProcessorSelectionButton;
