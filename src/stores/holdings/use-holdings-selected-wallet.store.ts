import { create } from "zustand";

type HoldingsSelectedWalletState = {
  selectedWalletList: string[];
  toggleSelectWallet: (wallet: string, allWallets: string[]) => void;
};

export const useHoldingsSelectedWalletStore =
  create<HoldingsSelectedWalletState>((set) => ({
    selectedWalletList: [
      "Wallet 1",
      "Wallet 2",
      "Wallet 3",
      "Wallet 4",
      "Wallet 5",
      "Wallet 6",
    ],
    toggleSelectWallet: (wallet, allWallets) =>
      set((state) => {
        // If "All" is clicked
        if (wallet === "All") {
          // If All is already selected, do nothing (maintain at least one selection)
          if (
            state.selectedWalletList.length === 1 &&
            state.selectedWalletList.includes("All")
          ) {
            return state;
          }
          // If All wasn't selected, select only All
          if (!state.selectedWalletList.includes("All")) {
            return {
              selectedWalletList: ["All"],
            };
          }
        }

        // If a regular wallet is clicked
        const isSelected = state.selectedWalletList.includes(wallet);

        // If All was selected and we're selecting a regular wallet
        if (state.selectedWalletList.includes("All")) {
          return {
            selectedWalletList: [wallet],
          };
        }

        // Calculate new selection list
        let newSelectedList = isSelected
          ? state.selectedWalletList.length > 1
            ? state.selectedWalletList.filter((w) => w !== wallet)
            : state.selectedWalletList
          : [...state.selectedWalletList, wallet];

        // Check if all individual wallets are selected
        const allIndividualWalletsSelected = allWallets.every((w) =>
          newSelectedList.includes(w),
        );

        // If all individual wallets are selected, switch to "All"
        if (allIndividualWalletsSelected) {
          newSelectedList = ["All"];
        }

        return {
          selectedWalletList: newSelectedList,
        };
      }),
  }));
