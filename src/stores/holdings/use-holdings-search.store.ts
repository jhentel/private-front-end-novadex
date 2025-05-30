import { create } from "zustand";

type HoldingsSearchState = {
  searchQuery: string;
  setSearchQuery: (newSearch: string) => void;
};

export const useHoldingsSearchStore = create<HoldingsSearchState>()((set) => ({
  searchQuery: "",
  setSearchQuery: (newSearch: string) => {
    set({ searchQuery: newSearch });
  },
}));
