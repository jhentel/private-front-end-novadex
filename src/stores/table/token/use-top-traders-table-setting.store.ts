import { create } from "zustand";

type TopTradersTableSettingState = {
  boughtCurrency: "USDC" | "SOL";
  remainingCurrency: "USDC" | "SOL";
  setBoughtCurrency: (newBoughtCurrency: "USDC" | "SOL") => void;
  setRemainingCurrency: (newRemainingCurrency: "USDC" | "SOL") => void;
};

export const useTopTradersTableSettingStore =
  create<TopTradersTableSettingState>()((set) => ({
    boughtCurrency: "USDC",
    remainingCurrency: "USDC",
    setBoughtCurrency: (newBoughtCurrency) =>
      set(() => ({ boughtCurrency: newBoughtCurrency })),
    setRemainingCurrency: (newRemainingCurrency) =>
      set(() => ({ remainingCurrency: newRemainingCurrency })),
  }));
