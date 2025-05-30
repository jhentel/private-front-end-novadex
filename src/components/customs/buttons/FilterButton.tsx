import React, { useState } from "react";
import BaseButton from "./BaseButton";
import { cn } from "@/libraries/utils";
import Image from "next/image";
export interface FilterButtonProps {
  handleOpen: () => void;
  isActive: boolean;
  text?: string;
  suffixEl?: React.ReactNode;
  className?: string;
  size?: "default" | "icon";
}
const FilterButton = ({
  handleOpen,
  isActive,
  text,
  suffixEl,
  className,
  size = "default",
}: FilterButtonProps) => {
  const [IsHovered, setIsHovered] = useState(false);
  return (
    <BaseButton
      type="button"
      onClick={(e) => {
        e.preventDefault();
        handleOpen();
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      variant="rounded"
      className={cn(
        "relative hidden h-[24px] items-center justify-between gap-x-1 overflow-hidden rounded-[23px] border pl-2.5 pr-3 text-xs duration-100 lg:flex",
        isActive || IsHovered
          ? "border-primary bg-primary/[8%]"
          : "border-border bg-white/[4%]",
        size === "icon" && "size-8 justify-center rounded-lg px-1 py-0.5",
        className,
      )}
    >
      <div className="relative flex aspect-square h-4 w-4 flex-shrink-0 items-center justify-center">
        <Image
          src={"/icons/filter.png"}
          alt="Filter Icon"
          fill
          quality={100}
          className={cn(
            "absolute object-contain opacity-100 transition-all duration-100",
            (isActive || IsHovered) && "opacity-0",
          )}
        />
        <Image
          src={"/icons/active-filter.svg"}
          alt="Filter Icon"
          fill
          quality={100}
          className={cn(
            "absolute z-[5] object-contain opacity-0 transition-all duration-100",
            (isActive || IsHovered) && "opacity-100",
          )}
        />
      </div>

      <span
        className={cn(
          "flex items-center justify-center gap-x-2 text-nowrap font-geistSemiBold duration-200 group-hover/button:text-primary",
          isActive || IsHovered ? "text-primary" : "text-fontColorPrimary",
          size === "icon" && "hidden",
        )}
      >
        {text}
        {suffixEl}
      </span>
    </BaseButton>
  );
};

export default FilterButton;
