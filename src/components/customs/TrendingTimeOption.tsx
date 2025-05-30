import React, { useState, useEffect } from "react";
import { useMoreFilterStore } from "@/stores/dex-setting/use-more-filter.store";
import {
  useActiveTrendingTimeStore,
  TrendingTime,
} from "@/stores/dex-setting/use-active-trending-time-preset.store";
import cookies from "js-cookie";
import { cn } from "@/libraries/utils";

interface TrendingTimeOptionProps {
  handleSendTrendingMessage: (interval?: "1m" | "5m" | "30m" | "1h") => void;
  initTrendingTime: "1m" | "5m" | "30m" | "1h";
  className?: string;
}

// initTrendingTime
const TrendingTimeOption: React.FC<TrendingTimeOptionProps> = ({
  handleSendTrendingMessage,
  initTrendingTime,
  className,
}) => {
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  const activeTrendingTime = useActiveTrendingTimeStore(
    (state) => state.activeTrendingTime,
  );
  const trendingTimeOptions = useActiveTrendingTimeStore(
    (state) => state.trendingTimeOptions,
  );
  const setActiveTrendingTime = useActiveTrendingTimeStore(
    (state) => state.setActiveTrendingTime,
  );
  const { setIsLoadingFilterFetch } = useMoreFilterStore();

  useEffect(() => {
    if (!isHydrated) {
      setIsHydrated(true);
    }
  }, []);

  const finalTrendingTime = isHydrated
    ? activeTrendingTime
    : initTrendingTime.toUpperCase();

  return (
    <div
      className={cn(
        "flex w-fit items-center justify-center rounded-[8px] border border-border",
        className,
      )}
    >
      <div className="flex h-[32px] flex-shrink-0 items-center overflow-hidden rounded-[8px]">
        <div className="h-full flex-grow p-[2px]">
          <div className="flex h-full w-full items-center rounded-[6px] bg-white/[6%]">
            {trendingTimeOptions?.map((option, index) => {
              const isActive = finalTrendingTime === option;

              return (
                <button
                  type="button"
                  key={index + option}
                  onClick={() => {
                    setActiveTrendingTime(option as TrendingTime);
                    cookies.set("trending-time-filter", option.toLowerCase());
                    handleSendTrendingMessage?.(
                      option.toLowerCase() as "1m" | "5m" | "30m" | "1h",
                    );
                    setIsLoadingFilterFetch(true);
                  }}
                  className={cn(
                    "h-full w-full rounded-[6px] px-3 font-geistSemiBold text-sm text-fontColorPrimary duration-300",
                    isActive ? "bg-white/[8%]" : "bg-transparent",
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendingTimeOption;
