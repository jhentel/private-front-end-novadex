import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type HoldingsMarqueeSortState = {
  sortType: "amount" | "recent";
  setSortType: (newSortType: "amount" | "recent") => void;
};

export const useHoldingsMarqueeSortStore = create<HoldingsMarqueeSortState>()(
  persist(
    (set) => ({
      sortType: "amount",
      setSortType: (newSortType: "amount" | "recent") => {
        set({ sortType: newSortType });
      },
    }),
    {
      name: "holdings-marquee-sort",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
