import { create } from "zustand";

type TradesTableSettingState = {
  isPaused: boolean;
  isSorting: boolean;
  dateOrder: "ASC" | "DESC";
  type: "BUY" | "SELL";
  usdcOrSol: "USDC" | "SOL";
  totalSOL: "USDC" | "SOL";
  setIsPaused: (state: boolean) => void;
  setIsSorting: (state: boolean) => void;
  setDateOrder: (order: "ASC" | "DESC") => void;
  setType: (type: "BUY" | "SELL") => void;
  setUsdcOrSol: (mcOrPrice: "USDC" | "SOL") => void;
  setTotalSOLCurrency: (newTotalSOLCurrency: "USDC" | "SOL") => void;
  scrollOffsetValue: number;
  setScrollOffsetValue: (newScrollOffsetValue: number) => void;
  cleanup: () => void;
};

export const useTradesTableSettingStore = create<TradesTableSettingState>()(
  (set) => ({
    isPaused: false,
    isSorting: false,
    dateOrder: "ASC",
    type: "BUY",
    usdcOrSol: "USDC",
    totalSOL: "USDC",
    setIsPaused: (newState) => set(() => ({ isPaused: newState })),
    setIsSorting: (newState) => set(() => ({ isSorting: newState })),
    setDateOrder: (newDateOrder) => set(() => ({ dateOrder: newDateOrder })),
    setType: (newType) => set(() => ({ type: newType })),
    setUsdcOrSol: (newState) => set(() => ({ usdcOrSol: newState })),
    setTotalSOLCurrency: (newTotalSOLCurrency) =>
      set(() => ({ totalSOL: newTotalSOLCurrency })),
    scrollOffsetValue: 0,
    setScrollOffsetValue: (newScrollOffsetValue) =>
      set(() => ({ scrollOffsetValue: newScrollOffsetValue })),
    cleanup: () =>
      set(() => ({
        isPaused: false,
        isSorting: false,
        dateOrder: "ASC",
        type: "BUY",
        usdcOrSol: "USDC",
        totalSOL: "USDC",
        scrollOffsetValue: 0,
      })),
  }),
);
