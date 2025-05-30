import { cn } from "@/libraries/utils";
import { PresetId } from "@/types/preset";
import React from "react";

interface PresetButtonSelectionProps {
  onClick: (value: PresetId) => void;
  value: PresetId;
}

const presetList = ["N1", "N2", "N3"];

const PresetButtonSelection = ({
  value,
  onClick,
}: PresetButtonSelectionProps) => {
  return (
    <div className="flex h-[40px] px-4 md:px-0 w-full items-center gap-x-4 overflow-hidden rounded-t-[8px] border-b border-border xl:bg-[#24242C]">
      {presetList.map((preset, index) => {
        const isSelected = value === preset;

        return (
          <button
            key={index + preset}
            onClick={() => onClick(preset as PresetId)}
            type="button"
            className="relative flex h-[40px] w-full flex-col items-center justify-center md:max-w-[120px] md:gap-x-3"
          >
            {/* Main content - takes up full height except for indicator space */}
            <div className="flex h-[37px] items-center justify-center">
              <span
                className={cn(
                  "text-nowrap font-geistSemiBold text-sm",
                  isSelected ? "text-[#DF74FF]" : "text-fontColorSecondary",
                )}
              >
                {preset}
              </span>
            </div>

            {/* Indicator - takes up the remaining 3px of height */}
            <div
              className={cn(
                "h-[3px] w-full rounded-t-[100px]",
                isSelected ? "bg-primary" : "bg-transparent",
              )}
            />
          </button>
        );
      })}
    </div>
  );
};

export default PresetButtonSelection;
