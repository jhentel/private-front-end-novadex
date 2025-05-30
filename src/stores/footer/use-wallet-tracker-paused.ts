import { create } from "zustand";

type WalletTrackerPaused = {
  isWalletTrackerHovered: boolean;
  isLoadingWalletTracker: boolean;
  setIsWalletTrackerHovered: (isWalletTrackerHovered: boolean) => void;
  setIsLoadingWalletTracker: (isLoadingWalletTracker: boolean) => void;
};

export const useWalletTrackerPaused = create<WalletTrackerPaused>()((set) => ({
  isWalletTrackerHovered: false,
  isLoadingWalletTracker: true,
  setIsWalletTrackerHovered: (isWalletTrackerHovered) =>
    set(() => ({ isWalletTrackerHovered })),
  setIsLoadingWalletTracker: (isLoadingWalletTracker) =>
    set(() => ({ isLoadingWalletTracker })),
}));
