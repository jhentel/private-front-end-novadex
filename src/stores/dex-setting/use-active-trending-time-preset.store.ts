import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type TrendingTime = "1M" | "5M" | "30M" | "1H";

type TrendingTimeState = {
  activeTrendingTime: TrendingTime;
  trendingTimeOptions: TrendingTime[];
  setActiveTrendingTime: (newActiveTrendingTime: TrendingTime) => void;
};

const trendingTimeOptions: TrendingTime[] = ["1M", "5M", "30M", "1H"];

export const useActiveTrendingTimeStore = create<TrendingTimeState>()(
  persist(
    (set) => ({
      activeTrendingTime: "1M",
      trendingTimeOptions,
      setActiveTrendingTime: (newActiveTrendingTime) =>
        set(() => ({ activeTrendingTime: newActiveTrendingTime })),
    }),
    {
      name: "trending-time-filter",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
