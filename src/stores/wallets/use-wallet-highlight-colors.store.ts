import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Wallet = {
  name: string;
  emoji: string;
  address: string;
};

export type WalletWithColor = Wallet & {
  color: string;
};

export type WalletHighlightColorsState = {
  wallets: Record<string, WalletWithColor>; // address as key
  setWalletColor: (wallet: Wallet, color: string) => void;
  deleteWalletColor: (address: string) => void;
};

export const useWalletHighlightStore = create<WalletHighlightColorsState>()(
  persist(
    (set, get) => ({
      wallets: {},
      setWalletColor: (wallet, color) => {
        const updatedWallet: WalletWithColor = { ...wallet, color };
        set({
          wallets: {
            ...get().wallets,
            [wallet.address]: updatedWallet,
          },
        });
      },

      deleteWalletColor: (address) => {
        const { [address]: _, ...rest } = get().wallets;
        set({ wallets: rest });
      },
    }),
    {
      name: "nova-wallet-highlight-store",
    },
  ),
);
