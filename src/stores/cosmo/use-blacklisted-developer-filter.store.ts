import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import Cookies from "js-cookie";

type BlacklistedDeveloperFilterState = {
  blacklistedDevelopers: string[];
  isModalOpen: boolean;
  setIsModalOpen: (newState: boolean) => void;
  setBlacklistedDevelopers: (developers: string[]) => void;
  cleanup: () => void;
};

const COOKIE_NAME = "cosmo-blacklisted-developers";

function syncWithCookies(developers: string[]) {
  Cookies.set(COOKIE_NAME, JSON.stringify(developers), { expires: 365 });
}

export const useBlacklistedDeveloperFilterStore =
  create<BlacklistedDeveloperFilterState>()(
    persist(
      (set) => ({
        blacklistedDevelopers: [],
        isModalOpen: false,
        setIsModalOpen: (newState) => set(() => ({ isModalOpen: newState })),
        setBlacklistedDevelopers: (developers) => {
          syncWithCookies(developers);
          set(() => ({ blacklistedDevelopers: developers }));
        },
        cleanup: () => {
          syncWithCookies([]);
          set(() => ({
            blacklistedDevelopers: [],
            isModalOpen: false,
          }));
        },
      }),
      {
        name: "cosmo-blacklisted-developers",
        storage: createJSONStorage(() => localStorage),
      },
    ),
  );
