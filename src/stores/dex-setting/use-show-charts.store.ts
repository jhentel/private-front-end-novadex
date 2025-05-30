import { create } from "zustand";

type ShowChartsState = {
  showCharts: boolean;
  toggleShowCharts: (state: boolean) => void;
};

export const useShowChartsStore = create<ShowChartsState>()((set) => ({
  showCharts: true,
  toggleShowCharts: (state) => set(() => ({ showCharts: state })),
}));
