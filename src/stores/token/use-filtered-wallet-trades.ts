import { create } from "zustand";
import { Trade } from "@/types/nova_tv.types";

type FilteredWalletTradesState = {
  wallet: string;
  trades: Trade[];
  setFilteredWallet: (wallet: string) => void;
  setFilteredWalletTrades: (trades: Trade[]) => void;
  resetFilteredWalletTradesState: () => void;
  cleanup: () => void;
};

export const useFilteredWalletTradesStore = create<FilteredWalletTradesState>()(
  (set) => ({
    wallet: "",
    trades: [],
    setFilteredWallet: (wallet) =>
      set(() => ({
        wallet: wallet,
      })),
    setFilteredWalletTrades: (trades) =>
      set(() => ({
        trades: trades,
      })),
    resetFilteredWalletTradesState: () => {
      set(() => ({
        wallet: "",
        trades: [],
      }));
    },
    cleanup: () =>
      set(() => ({
        wallet: "",
        trades: [],
      })),
  }),
);
