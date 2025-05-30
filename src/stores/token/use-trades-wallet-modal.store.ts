import { create } from "zustand";

type TradesWalletModalState = {
  wallet: string;
  setWallet: (wallet: string) => void;
  cleanup: () => void;
};

export const useTradesWalletModalStore = create<TradesWalletModalState>()(
  (set) => ({
    wallet: "",
    setWallet: (wallet) =>
      set((state) => ({
        ...state,
        wallet: wallet,
      })),
    cleanup: () =>
      set(() => ({
        wallet: "",
      })),
  }),
);
