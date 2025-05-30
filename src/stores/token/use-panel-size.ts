import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PanelTradesSizeState {
  width: string;
  height: number;
  setPanelTradesWidth: (width: string) => void;
  setPanelTradesHeight: (height: number) => void;
}

export const usePanelTradesSizeStore = create<PanelTradesSizeState>()(
  persist(
    (set) => ({
      width: "400px",
      height: 460,
      setPanelTradesWidth: (width: string) =>
        set(() => ({
          width,
        })),
      setPanelTradesHeight: (height: number) =>
        set(() => ({
          height,
        })),
    }),
    {
      name: "panel-trades-size",
    },
  ),
);
