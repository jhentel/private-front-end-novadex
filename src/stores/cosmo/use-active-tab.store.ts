import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createJSONStorage } from "zustand/middleware";

export type TabLabel = "Newly Created" | "About to Graduate" | "Graduated";

type ActiveTabState = {
  activeTab: TabLabel;
  setActiveTab: (tab: TabLabel) => void;
};

export const useActiveTabStore = create<ActiveTabState>()(
  persist(
    (set) => ({
      activeTab: "Newly Created",
      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    {
      name: "cosmo-active-tab",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
