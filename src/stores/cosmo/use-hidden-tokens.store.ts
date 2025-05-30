import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import Cookies from "js-cookie";

type HiddenTokensState = {
  hiddenTokens: string[];
  setHiddenTokens: (tokens: string[]) => void;
  isTokenHidden: (tokenMint: string) => boolean;
  hideToken: (tokenMint: string) => void;
  unhideToken: (tokenMint: string) => void;
};

const STORAGE_NAME = "cosmo-hidden-tokens";

function syncWithCookies(tokens: string[]) {
  Cookies.set(STORAGE_NAME, JSON.stringify(tokens), { expires: 365 });
}

export const useHiddenTokensStore = create<HiddenTokensState>()(
  persist(
    (set, get) => ({
      hiddenTokens: [],
      setHiddenTokens: (tokens) => {
        syncWithCookies(tokens);
        set({ hiddenTokens: tokens });
      },
      isTokenHidden: (tokenMint) => get().hiddenTokens.includes(tokenMint),
      hideToken: (tokenMint) => {
        const current = get().hiddenTokens;
        if (!current.includes(tokenMint)) {
          const updated = [...current, tokenMint];
          syncWithCookies(updated);
          set({ hiddenTokens: updated });
        }
      },
      unhideToken: (tokenMint) => {
        const updated = get().hiddenTokens.filter((t) => t !== tokenMint);
        syncWithCookies(updated);
        set({ hiddenTokens: updated });
      },
    }),
    {
      name: "cosmo-hidden-tokens",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
