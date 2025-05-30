import { create } from "zustand";

type HoldersTableSettingState = {
  boughtCurrency: "USDC" | "SOL";
  remainingCurrency: "USDC" | "SOL";
  setBoughtCurrency: (newBoughtCurrency: "USDC" | "SOL") => void;
  setRemainingCurrency: (newRemainingCurrency: "USDC" | "SOL") => void;
};

export const useHoldersTableSettingStore = create<HoldersTableSettingState>()(
  (set) => ({
    boughtCurrency: "USDC",
    remainingCurrency: "USDC",
    setBoughtCurrency: (newBoughtCurrency) =>
      set(() => ({ boughtCurrency: newBoughtCurrency })),
    setRemainingCurrency: (newRemainingCurrency) =>
      set(() => ({ remainingCurrency: newRemainingCurrency })),
  }),
);
