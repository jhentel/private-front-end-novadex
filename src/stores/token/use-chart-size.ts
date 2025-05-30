import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type ChartSizeState = {
  height: number | string | undefined;
  setChartHeight: (height: number | string | undefined) => void;
};

export const useChartSizeStore = create<ChartSizeState>()(
  persist(
    (set) => ({
      height: 408,
      setChartHeight: (height) =>
        set(() => ({
          height,
        })),
    }),
    {
      name: "chart-size-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
