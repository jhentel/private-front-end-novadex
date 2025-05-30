import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type TokenMarketCapToggleState = {
  column: "token" | "market_cap";
  setColumn: (value: "token" | "market_cap") => void;
};

export const useTokenMarketCapToggleState = create<TokenMarketCapToggleState>()(
  persist(
    (set) => ({
      column: "token",
      setColumn: (value) => set({ column: value }),
    }),
    {
      name: "token-market-cap-toggle",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
