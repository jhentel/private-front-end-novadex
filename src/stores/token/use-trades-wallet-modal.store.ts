import { Timeframe } from "@/apis/rest/wallet-trade";
import { create } from "zustand";

type TradesWalletModalState = {
  wallet: string;
  setWallet: (wallet: string) => void;
  selectedTimeframe: Timeframe;
  setSelectedTimeframe: (tf: Timeframe) => void;
  cleanup: () => void;
};

export const useTradesWalletModalStore = create<TradesWalletModalState>()(
  (set) => ({
    wallet: "",
    setWallet: (wallet) =>
      set((state) => ({
        ...state,
        wallet: wallet,
      })),
    selectedTimeframe: "1y",
    setSelectedTimeframe: (tf) => set({ selectedTimeframe: tf }),
    cleanup: () =>
      set(() => ({
        wallet: "",
        selectedTimeframe: "1y",
      })),
  }),
);
