import { create } from "zustand";

type HoldingTableSettingState = {
  investedOrder: "ASC" | "DESC";
  soldOrder: "ASC" | "DESC";
  remainingOrder: "ASC" | "DESC";
  PLOrder: "ASC" | "DESC";
  setInvestedOrder: (order: "ASC" | "DESC") => void;
  setSoldOrder: (order: "ASC" | "DESC") => void;
  setRemainingOrder: (order: "ASC" | "DESC") => void;
  setPLOrder: (order: "ASC" | "DESC") => void;
};

export const useHoldingTableSettingStore = create<HoldingTableSettingState>()(
  (set) => ({
    investedOrder: "ASC",
    soldOrder: "ASC",
    remainingOrder: "ASC",
    PLOrder: "ASC",
    setInvestedOrder: (newInvestedOrder) =>
      set(() => ({ investedOrder: newInvestedOrder })),
    setSoldOrder: (newSoldOrder) => set(() => ({ soldOrder: newSoldOrder })),
    setRemainingOrder: (newRemainingOrder) =>
      set(() => ({ remainingOrder: newRemainingOrder })),
    setPLOrder: (newPLOrder) => set(() => ({ PLOrder: newPLOrder })),
  }),
);
