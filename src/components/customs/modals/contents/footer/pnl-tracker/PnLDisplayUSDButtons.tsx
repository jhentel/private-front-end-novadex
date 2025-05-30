// ######## Libraries 📦 & Hooks 🪝 ########
import * as React from "react";
import { usePnlSettings } from "@/stores/use-pnl-settings";

// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { imageList } from "./PnLImageSelector";

// ######## Types 🗨️ ########
import type { Display } from "./types";

const displayOptions = ["USD", "SOL", "Both"];

const PnLDisplayUSDButtons = ({
  activeDisplay,
  setActiveDisplay,
}: {
  activeDisplay: string | number;
  setActiveDisplay: (preset: Display) => void;
  onDisplaySelect?: () => void;
}) => {
  const { selectedTheme } = usePnlSettings();
  const availableCurrency = imageList.find(
    (item) => item.themeId === selectedTheme,
  )?.availableCurrency;
  const handleButtonClick = (option: Display) => {
    setActiveDisplay(option);
  };
  React.useEffect(() => {
    if (availableCurrency !== "all" && activeDisplay === "Both") {
      setActiveDisplay("SOL");
    }
  }, [selectedTheme]);
  return (
    <div className="flex h-[32px] w-full flex-shrink-0 items-center overflow-hidden rounded-[8px] border border-border">
      <div className="h-full flex-grow p-[3px]">
        <div className="flex h-full w-full items-center gap-[1px] rounded-[6px] bg-white/[6%] p-0.5">
          {availableCurrency === "all" ? (
            <>
              {displayOptions?.map((option, index) => {
                const isActive = activeDisplay === option;
                return (
                  <button
                    type="button"
                    key={index + option}
                    onClick={() => handleButtonClick(option as Display)}
                    className={cn(
                      "h-full w-full rounded-[6px] px-3 font-geistSemiBold text-sm leading-3 text-fontColorPrimary duration-300",
                      isActive ? "bg-white/[12%]" : "bg-transparent",
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </>
          ) : (
            <>
              {displayOptions?.slice(0, -1).map((option, index) => {
                const isActive = activeDisplay === option;
                return (
                  <button
                    type="button"
                    key={index + option}
                    onClick={() => handleButtonClick(option as Display)}
                    className={cn(
                      "h-full w-full rounded-[6px] px-3 font-geistSemiBold text-sm leading-3 text-fontColorPrimary duration-300",
                      isActive ? "bg-white/[12%]" : "bg-transparent",
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(PnLDisplayUSDButtons);
