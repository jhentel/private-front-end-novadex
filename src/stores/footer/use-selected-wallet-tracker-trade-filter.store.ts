import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type SelectedWalletTrackerTradeFilterAddressesState = {
  selectedWalletAddresses: string[];
  setSelectedWalletAddresses: (addresses: string[]) => void;
};

export const useSelectedWalletTrackerTradeAddressesFilterStore =
  create<SelectedWalletTrackerTradeFilterAddressesState>()(
    persist(
      (set) => ({
        selectedWalletAddresses: [],
        setSelectedWalletAddresses: (addresses) =>
          set(() => ({ selectedWalletAddresses: addresses })),
      }),
      {
        name: "wallet-addresses-filter-storage", // unique name for localStorage key
        storage: createJSONStorage(() => localStorage), // use localStorage
      },
    ),
  );
