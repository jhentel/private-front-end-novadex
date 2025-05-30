import { create } from "zustand";

type MyPositionTableSettingState = {
  investedCurrency: "USDC" | "SOL";
  setInvestedCurrency: (newInvestedCurrency: "USDC" | "SOL") => void;
};

export const useMyPositionTableSettingStore =
  create<MyPositionTableSettingState>()((set) => ({
    investedCurrency: "USDC",
    setInvestedCurrency: (newInvestedCurrency) =>
      set(() => ({ investedCurrency: newInvestedCurrency })),
  }));
