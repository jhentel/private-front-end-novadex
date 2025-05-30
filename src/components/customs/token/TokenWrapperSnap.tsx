import { cn } from "@/libraries/utils";
import { useSnapStateStore } from "@/stores/use-snap-state";
import React from "react";

const TokenWrapperSnap = ({ children }: { children: React.ReactNode }) => {
  const currentSnapped = useSnapStateStore((state) => state.currentSnapped);
  const isSnapOpen = currentSnapped.side !== "none" && currentSnapped.isOpen;
  return (
    <div
      className={cn(
        "relative mb-14 mt-4 flex w-full flex-col-reverse gap-x-2 gap-y-4 pb-4 md:mb-12 md:mt-2 md:flex-row md:gap-y-0 md:px-4 xl:mt-0 xl:flex-grow",
        isSnapOpen && "xl:flex-nowrap",
      )}
    >
      {children}
    </div>
  );
};

export default TokenWrapperSnap;
