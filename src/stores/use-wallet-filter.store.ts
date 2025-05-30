import { create } from "zustand";

interface WalletFilterStore {
  walletFilter: string;
  setWalletFilter: (value: string) => void;
}

export const useWalletFilterStore = create<WalletFilterStore>()((set) => ({
  walletFilter: "",
  setWalletFilter: (value) =>
    set(() => ({
      walletFilter: value,
    })),
}));
