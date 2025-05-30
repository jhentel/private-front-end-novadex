import { create } from "zustand";

type StoredWalletState = {
  storedWalletList: string[];
  selectedWalletList: string[];
  toggleSelectWallet: (wallet: string) => void;
};

export const useStoredWalletStore = create<StoredWalletState>((set) => ({
  storedWalletList: [
    "Wallet 1",
    "Wallet 2",
    "Wallet 3",
    "Wallet 4",
    "Wallet 5",
    "Wallet 6",
  ],
  selectedWalletList: [
    "Wallet 1",
    "Wallet 2",
    "Wallet 3",
    "Wallet 4",
    "Wallet 5",
    "Wallet 6",
  ],
  toggleSelectWallet: (wallet) =>
    set((state) => {
      const isSelected = state.selectedWalletList.includes(wallet);

      return {
        selectedWalletList: isSelected
          ? state.selectedWalletList.length > 1
            ? state.selectedWalletList.filter((w) => w !== wallet)
            : state.selectedWalletList
          : [...state.selectedWalletList, wallet],
      };
    }),
}));
