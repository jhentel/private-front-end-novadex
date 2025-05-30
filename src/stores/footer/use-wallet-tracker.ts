import { TrackedWallet } from "@/apis/rest/wallet-tracker";
import { create } from "zustand";
import { Preset } from "../dex-setting/use-active-preset.store";
import { Wallet } from "@/apis/rest/wallet-manager";
import { createJSONStorage, persist } from "zustand/middleware";

type WalletTrackerState = {
  trackedWallets: TrackedWallet[];
  setTrackedWallets: (wallets: TrackedWallet[]) => void;
  isLoadingTrackedWallets: boolean;
  setIsLoadingTrackedWallets: (loading: boolean) => void;
  trackerWalletsQuick: Wallet[];
  setTrackerWalletsQuick: (walletList: Wallet[]) => void;
  trackedEnabledSound: string[];
  setTrackerEnabledSound: (w: string[]) => void;
};

export const useWalletTrackerStore = create<WalletTrackerState>()(
  persist(
    (set) => ({
      trackedWallets: [],
      setTrackedWallets: (wallets) => set(() => ({ trackedWallets: wallets })),
      isLoadingTrackedWallets: false,
      setIsLoadingTrackedWallets: (loading) =>
        set(() => ({ isLoadingTrackedWallets: loading })),
      trackerWalletsQuick: [],
      setTrackerWalletsQuick: (walletList: Wallet[]) =>
        set(() => ({ trackerWalletsQuick: walletList })),
      trackedEnabledSound: [],
      setTrackerEnabledSound: (w) => set(() => ({ trackedEnabledSound: w })),
    }),
    {
      name: "wallet-tracker",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
