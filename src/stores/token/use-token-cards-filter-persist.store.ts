import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type SolUsdc = "SOL" | "USDC";

type TokenCardsFilterState = {
  tradesDateType: "DATE" | "AGE";
  setTradesDateType: (value: "DATE" | "AGE") => void;
};

export const useTokenCardsFilterStorePersist = create<TokenCardsFilterState>()(
  persist(
    (set) => ({
      tradesDateType: "DATE",
      setTradesDateType: (value) => set({ tradesDateType: value }),

      resetFilters: () =>
        set({
          tradesDateType: "DATE",
        }),
    }),
    {
      name: "token-cards-filter-persist",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
