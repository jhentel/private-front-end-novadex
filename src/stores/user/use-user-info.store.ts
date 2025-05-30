import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type UserInfoState = {
  isNewUser: boolean;
  setIsNewUser: (newState: boolean) => void;
  hasSeenTutorial: boolean;
  setHasSeenTutorial: (newState: boolean) => void;
  isCosmoTutorial: boolean;
  setIsCosmoTutorial: (newState: boolean) => void;
  isTrendingTutorial: boolean;
  setIsTrendingTutorial: (newState: boolean) => void;
  isHoldingsTutorial: boolean;
  setIsHoldingsTutorial: (newState: boolean) => void;
  isWalletManagerTutorial: boolean;
  setIsWalletManagerTutorial: (newState: boolean) => void;
  isTokenTutorial: boolean;
  setIsTokenTutorial: (newState: boolean) => void;
  isWalletTrackerTutorial: boolean;
  setIsWalletTrackerTutorial: (newState: boolean) => void;
  isTwitterMonitorTutorial: boolean;
  setIsTwitterMonitorTutorial: (newState: boolean) => void;
  type: "Simple" | "Advanced";
  setType: (newState: "Simple" | "Advanced") => void;
  setAllTutorialStates: () => void;
  resetAllTutorialStates: () => void;
};

export const useUserInfoStore = create<UserInfoState>()(
  persist(
    (set, get) => ({
      isNewUser: true,
      setIsNewUser: (newState) => set(() => ({ isNewUser: newState })),
      hasSeenTutorial: false,
      setHasSeenTutorial: (newState) =>
        set(() => ({ hasSeenTutorial: newState })),
      isCosmoTutorial: false,
      setIsCosmoTutorial: (newState) =>
        set(() => ({ isCosmoTutorial: newState })),
      isTrendingTutorial: false,
      setIsTrendingTutorial: (newState) =>
        set(() => ({ isTrendingTutorial: newState })),
      isHoldingsTutorial: false,
      setIsHoldingsTutorial: (newState) =>
        set(() => ({ isHoldingsTutorial: newState })),
      isWalletManagerTutorial: false,
      setIsWalletManagerTutorial: (newState) =>
        set(() => ({ isWalletManagerTutorial: newState })),
      isTokenTutorial: false,
      setIsTokenTutorial: (newState) =>
        set(() => ({ isTokenTutorial: newState })),
      isWalletTrackerTutorial: false,
      setIsWalletTrackerTutorial: (newState) =>
        set(() => ({ isWalletTrackerTutorial: newState })),
      isTwitterMonitorTutorial: false,
      setIsTwitterMonitorTutorial: (newState) =>
        set(() => ({ isTwitterMonitorTutorial: newState })),
      type: "Simple",
      setType: (newState) => set(() => ({ type: newState })),
      setAllTutorialStates: () =>
        set(() => {
          return {
            isCosmoTutorial: true,
            isTrendingTutorial: true,
            isHoldingsTutorial: true,
            isWalletManagerTutorial: true,
            isTokenTutorial: true,
            isWalletTrackerTutorial: true,
            isTwitterMonitorTutorial: true,
          };
        }),
      resetAllTutorialStates: () =>
        set(() => {
          return {
            isCosmoTutorial: false,
            isTrendingTutorial: false,
            isHoldingsTutorial: false,
            isWalletManagerTutorial: false,
            isTokenTutorial: false,
            isWalletTrackerTutorial: false,
            isTwitterMonitorTutorial: false,
          };
        }),
    }),
    {
      name: "user-info",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
