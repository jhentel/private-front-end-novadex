import { create } from "zustand";

type TradeHistoryTableSettingState = {
  ageOrder: "ASC" | "DESC";
  type: "BUY" | "SELL";
  mcOrPrice: "MC" | "PRICE";
  totalSOL: "USDC" | "SOL";
  setAgeOrder: (order: "ASC" | "DESC") => void;
  setType: (type: "BUY" | "SELL") => void;
  setMCOrPrice: (mcOrPrice: "MC" | "PRICE") => void;
  setTotalSOLCurrency: (newTotalSOLCurrency: "USDC" | "SOL") => void;
};

export const useTradeHistoryTableSettingStore =
  create<TradeHistoryTableSettingState>()((set) => ({
    ageOrder: "ASC",
    type: "BUY",
    mcOrPrice: "MC",
    totalSOL: "USDC",
    setAgeOrder: (newAgeOrder) => set(() => ({ ageOrder: newAgeOrder })),
    setType: (newType) => set(() => ({ type: newType })),
    setMCOrPrice: (newState) => set(() => ({ mcOrPrice: newState })),
    setTotalSOLCurrency: (newTotalSOLCurrency) =>
      set(() => ({ totalSOL: newTotalSOLCurrency })),
  }));
