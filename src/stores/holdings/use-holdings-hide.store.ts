import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type HoldingsHideState = {
  hiddenTokenList: string[];
  setHiddenTokenList: (newHiddenTokenList: string[]) => void;
  isShowHiddenToken: boolean;
  setIsShowHiddenToken: (newShowHiddenToken: boolean) => void;
};

export const useHoldingsHideStore = create<HoldingsHideState>()(
  persist(
    (set) => ({
      hiddenTokenList: [],
      setHiddenTokenList: (newHiddenTokenList: string[]) => {
        set({ hiddenTokenList: newHiddenTokenList });
      },
      isShowHiddenToken: false,
      setIsShowHiddenToken: (newShowHiddenToken: boolean) => {
        set({ isShowHiddenToken: newShowHiddenToken });
      },
    }),
    {
      name: "holdings-hide",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
