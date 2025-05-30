import { create } from "zustand";
import { Trade } from "@/types/nova_tv.types";
import { deduplicateCurrentTokenDeveloperTrades } from "@/helpers/deduplicateAndPrioritizeLatestData";

type CurrentTokenDeveloperTrades = {
  mint: string;
  developerTrades: Trade[];
  setCurrentTokenDeveloperTradesMint: (mint: string) => void;
  setCurrentTokenDeveloperTrades: (trades: Trade[] | Trade) => void;
  resetCurrentTokenDeveloperTradesState: () => void;
};

export const useCurrentTokenDeveloperTradesStore =
  create<CurrentTokenDeveloperTrades>()((set) => ({
    mint: "",
    developerTrades: [],
    setCurrentTokenDeveloperTradesMint: (mint) => {
      set(() => ({
        mint: mint,
      }));
    },
    setCurrentTokenDeveloperTrades: (newDeveloperTrades) =>
      set((state) => ({
        developerTrades: deduplicateCurrentTokenDeveloperTrades([
          ...state.developerTrades,
          ...(Array.isArray(newDeveloperTrades)
            ? newDeveloperTrades
            : [newDeveloperTrades]),
        ]),
      })),
    resetCurrentTokenDeveloperTradesState: () => {
      set(() => ({
        mint: "",
        developerTrades: [],
      }));
    },
  }));
