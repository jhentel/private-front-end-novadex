import { cn } from "@/libraries/utils";
import React from "react";

const CircleCount = ({ value }: { value: number }) => {
  const strValue = value?.toString();
  return (
    <div
      className={cn(
        "flex size-8 items-center justify-center rounded-full bg-white/[6%] p-1",
        strValue?.length >= 3 ? "aspect-auto w-auto" : "aspect-square",
      )}
    >
      <div
        className={cn(
          "flex size-full items-center justify-center rounded-full bg-white/[16%] font-geistSemiBold text-xs leading-none text-fontColorPrimary",
          strValue?.length >= 3 ? "aspect-auto w-auto" : "aspect-square",
        )}
      >
        {value}
      </div>
    </div>
  );
};

export default React.memo(CircleCount);
