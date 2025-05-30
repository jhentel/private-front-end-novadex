import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface GlobalSearchStore {
  sortBy: string;
  order: string;
  setSortBy: (sortBy: string) => void;
  setOrder: (order: string) => void;
}

export const useGlobalSearchStore = create<GlobalSearchStore>()(
  persist(
    (set) => ({
      sortBy: "marketCap",
      order: "desc",
      setSortBy: (sortBy) => set({ sortBy }),
      setOrder: (order) => set({ order }),
    }),
    {
      name: "global-search-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
