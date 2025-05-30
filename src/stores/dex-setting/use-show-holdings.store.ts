import { create } from "zustand";

type ShowHoldingsState = {
  showHoldings: boolean;
  toggleShowHoldings: (state: boolean) => void;
};

export const useShowHoldingsStore = create<ShowHoldingsState>()((set) => ({
  showHoldings: true,
  toggleShowHoldings: (state) => set(() => ({ showHoldings: state })),
}));
