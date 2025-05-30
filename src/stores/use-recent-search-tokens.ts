import { DEX } from "@/types/ws-general";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type RecentToken = {
  symbol: string;
  mint: string;
  image: string;
  dex: DEX;
};

type RecentSearchTokensState = {
  recentTokens: RecentToken[];
  setRecentSearchTokens: (recentTokens: RecentToken[]) => void;
};

export const useRecentSearchTokensStore = create<RecentSearchTokensState>()(
  persist(
    (set) => ({
      recentTokens: [],
      setRecentSearchTokens: (newRecentTokens) =>
        set(() => ({ recentTokens: newRecentTokens })),
    }),
    {
      name: "recent-search-tokens",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
