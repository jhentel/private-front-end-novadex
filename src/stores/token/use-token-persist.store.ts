import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { SolUsdc } from "./use-token-cards-filter.store";

type TokenPersistState = {
  tradesValue: SolUsdc;
  setTradesValue: (value: SolUsdc) => void;
  tradesTokenSol: SolUsdc;
  setTradesTokenSol: (value: SolUsdc) => void;
};

export const useTokenPersist = create<TokenPersistState>()(
  persist(
    (set) => ({
      tradesValue: "SOL",
      setTradesValue: (value) => set({ tradesValue: value }),
      tradesTokenSol: "SOL",
      setTradesTokenSol: (value) => set({ tradesTokenSol: value }),
    }),
    {
      name: "token-persist",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
