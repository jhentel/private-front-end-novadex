import { create } from "zustand";

export type SortOrder = "ASC" | "DESC" | "NONE";
export type SortRow =
  "CREATED" |
  "LIQUIDITY" |
  "MKTCAP" |
  "VOLUME" |
  "TXNS" |
  "VOLUME1M" |
  "VOLUME5M" |
  "VOLUME30M" |
  "VOLUME1H"


type HoldingTableSettingState = {
  sortOrder: SortOrder;
  currentSortedRow?: SortRow;
  toggleSort: (Row?: SortRow) => void;
};

export const useTrendingSortStore = create<HoldingTableSettingState>()(
  (set) => ({
    currentSortedRow: undefined,
    sortOrder: "NONE",
    toggleSort: (row) => set((state) => {
      const isSameRow = state.currentSortedRow === row;

      return {
        currentSortedRow: row,
        sortOrder: isSameRow
          ? state.sortOrder === "NONE"
            ? "ASC"
            : state.sortOrder === "ASC"
              ? "DESC"
              : "NONE"
          : "ASC", // reset to ASC when changing to a new row
      };
    }),
  }),
);
