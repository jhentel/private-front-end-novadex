import { create } from "zustand";

interface SelectedTrendingTimeState {
  selectedTrendingTime:
    | "none"
    | "volume_5m"
    | "volume_1h"
    | "volume_6h"
    | "volume_24h";
  setSelectedTrendingTime: (
    value: "none" | "volume_5m" | "volume_1h" | "volume_6h" | "volume_24h",
  ) => void;
}

export const useSelectedTrendingTime = create<SelectedTrendingTimeState>(
  (set) => ({
    selectedTrendingTime: "none",
    setSelectedTrendingTime: (value) => set({ selectedTrendingTime: value }),
  }),
);
