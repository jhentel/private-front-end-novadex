import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type SortRow =
  | "TOKEN"
  | "WALLET"
  | "INVESTED"
  | "REMAINING"
  | "SOLD"
  | "PNL"
  | "DATE"
  | null;

type HoldingsFilterState = {
  filters: {
    preview: {
      withRemainingTokens: boolean;
    };
    genuine: {
      withRemainingTokens: boolean;
    };
  };
  setWithRemainingTokens: (type: "preview" | "genuine", value: boolean) => void;
  toggleWithRemainingTokens: (
    filterType: keyof HoldingsFilterState["filters"],
  ) => void;
  resetHoldingsFilters: (
    filterType: keyof HoldingsFilterState["filters"],
  ) => void;
  applyHoldingsFilters: () => void;
  sortType: "ASC" | "DESC" | "NONE";
  setSortType: (sortType: "ASC" | "DESC" | "NONE") => void;
  sortRow: SortRow;
  setSortRow: (sortRow: SortRow) => void;
};

export const useHoldingsFilterStore = create<HoldingsFilterState>()(
  persist(
    (set) => ({
      filters: {
        preview: {
          withRemainingTokens: false,
        },
        genuine: {
          withRemainingTokens: false,
        },
      },
      setWithRemainingTokens: (type, value) =>
        set((state) => ({
          ...state,
          filters: {
            ...state.filters,
            [type]: {
              ...state.filters[type],
              withRemainingTokens: value,
            },
          },
        })),
      toggleWithRemainingTokens: (filterType) =>
        set((state) => ({
          filters: {
            ...state.filters,
            [filterType]: {
              ...state.filters[filterType],
              withRemainingTokens:
                !state.filters[filterType].withRemainingTokens,
            },
          },
        })),
      resetHoldingsFilters: (filterType) =>
        set((state) => ({
          filters: {
            ...state.filters,
            [filterType]: {
              withRemainingTokens: false,
            },
          },
        })),
      applyHoldingsFilters: () => {
        // console.log("Holdings Filters applied!");

        set((state) => ({
          filters: {
            ...state.filters,
            genuine: { ...state.filters.preview },
          },
        }));
      },
      sortType: "NONE",
      setSortType: (sortType) => set({ sortType }),
      sortRow: "TOKEN",
      setSortRow: (sortRow) => set({ sortRow }),
    }),
    {
      name: "holdings-filter",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
