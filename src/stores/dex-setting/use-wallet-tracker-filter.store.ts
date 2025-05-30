import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { SolCoin, SolUsdc } from "../token/use-token-cards-filter.store";

type WalletTrackerFilterState = {
  minSol: number;
  excludeSells: boolean;
  excludeBuys: boolean;
  totalFilter: {
    min: number;
    max: number;
  };

  // Derived state
  activeFilterCount: number;

  // Actions
  setMinSol: (value: number) => void;
  setExcludeSells: (value: boolean) => void;
  setExcludeBuys: (value: boolean) => void;
  setTotalFilter: (value: { min: number; max: number }) => void;
  resetFilters: () => void;

  setAmountType: (v: SolUsdc) => void;
  amountType: SolUsdc;
  setRemainingType: (v: SolCoin) => void;
  remainingType: SolCoin;
};

const initialState = {
  minSol: 0,
  excludeSells: false,
  excludeBuys: false,
  totalFilter: {
    min: 0,
    max: 0,
  },
};

// Helper function to calculate active filter count
const calculateActiveFilterCount = (
  state: Pick<
    WalletTrackerFilterState,
    "minSol" | "excludeSells" | "excludeBuys" | "totalFilter"
  >,
) => {
  let count = 0;
  if (state.minSol > 0) count++;
  if (state.excludeSells) count++;
  if (state.excludeBuys) count++;
  if (state.totalFilter.min > 0 || state.totalFilter.max > 0) count++;
  return count;
};

export const useWalletTrackerFilterStore = create<WalletTrackerFilterState>()(
  persist(
    (set) => ({
      ...initialState,
      amountType: "SOL",
      setAmountType: (v) => set({ amountType: v }),

      remainingType: "SOL",
      setRemainingType: (v) => set({ remainingType: v }),

      // Initial derived state
      activeFilterCount: calculateActiveFilterCount(initialState),

      setMinSol: (value) =>
        set((state) => {
          const newState = { ...state, minSol: value };
          return {
            ...newState,
            activeFilterCount: calculateActiveFilterCount(newState),
          };
        }),

      setExcludeSells: (value) =>
        set((state) => {
          const newState = { ...state, excludeSells: value };
          return {
            ...newState,
            activeFilterCount: calculateActiveFilterCount(newState),
          };
        }),

      setExcludeBuys: (value) =>
        set((state) => {
          const newState = { ...state, excludeBuys: value };
          return {
            ...newState,
            activeFilterCount: calculateActiveFilterCount(newState),
          };
        }),

      setTotalFilter: (value) =>
        set((state) => {
          const newState = { ...state, totalFilter: value };
          return {
            ...newState,
            activeFilterCount: calculateActiveFilterCount(newState),
          };
        }),

      resetFilters: () =>
        set({
          ...initialState,
          activeFilterCount: calculateActiveFilterCount(initialState),
        }),
    }),
    {
      name: "wallet-tracker-filter",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
