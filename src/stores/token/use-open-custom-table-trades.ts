import { create } from "zustand";
import { persist } from "zustand/middleware";

export const customizeableCols = [
    {
        value: "amount-of-tokens",
        title: "Amount of tokens",
    },
    {
        value: "value",
        title: "Value",
    },   
    {
        value: "maker",
        title: "Maker",
    }, 
    {
        value: "date-age",
        title: "DATE/AGE",
    },
];
export const initColumnValues = [
    "amount-of-tokens",
    "value",
    "maker",
    "date-age",
];

type CustomTableState = {
  selectedTableColumns: string[];
  setSelectedTableColumns: (values: string[]) => void;
};

export const useOpenCustomTable = create(
  persist<CustomTableState>(
    (set) => ({
      selectedTableColumns: initColumnValues,
      setSelectedTableColumns: (values) => {
        if (values.length > 0) {
          return set(() => ({ selectedTableColumns: values }));
        } else return;
      },
    }),
    {
      name: "custom-table-store",
    },
  ),
);
