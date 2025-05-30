import { create } from "zustand";

type FreshWallet = {
  wallet: string;
  fundedAmount: string;
  fundedBy: string;
  timestamp: number;
};

type CurrentTokenFreshWalletsState = {
  freshWallets: FreshWallet[];
  setCurrentTokenFreshwallets: (newFreshWallets: FreshWallet[]) => void;
  cleanup: () => void;
};

export const useCurrentTokenFreshWalletsStore =
  create<CurrentTokenFreshWalletsState>()((set) => ({
    freshWallets: [],
    setCurrentTokenFreshwallets: (newFreshWallets) =>
      set(() => ({
        freshWallets: newFreshWallets,
      })),
    cleanup: () =>
      set(() => ({
        freshWallets: [],
      })),
  }));
