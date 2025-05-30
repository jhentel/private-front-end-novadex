import { create } from "zustand";
import { persist } from "zustand/middleware";

export const customizeableCols = [
  {
    value: "date-age",
    title: "DATE/AGE",
  },
  {
    value: "type",
    title: "Type",
  },
  {
    value: "market_cap",
    title: "Market Cap",
  },
  {
    value: "value",
    title: "Value",
  },
  {
    value: "amount-of-tokens",
    title: "Amount of tokens",
  },
  {
    value: "total",
    title: "Total",
  },
  {
    value: "maker",
    title: "Maker",
  },
  {
    value: "actions",
    title: "Actions",
  },
];
export const initColumnValues = [
  "date-age",
  "type",
  "market_cap",
  "value",
  "amount-of-tokens",
  "total",
  "maker",
  "actions",
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
