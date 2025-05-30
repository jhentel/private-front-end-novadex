import { create } from "zustand";

type MostProfitableTableSettingState = {
  investedOrder: "ASC" | "DESC";
  soldOrder: "ASC" | "DESC";
  setInvestedOrder: (order: "ASC" | "DESC") => void;
  setSoldOrder: (order: "ASC" | "DESC") => void;
};

export const useMostProfitableTableSettingStore =
  create<MostProfitableTableSettingState>()((set) => ({
    investedOrder: "ASC",
    soldOrder: "ASC",
    setInvestedOrder: (newInvestedOrder) =>
      set(() => ({ investedOrder: newInvestedOrder })),
    setSoldOrder: (newSoldOrder) => set(() => ({ soldOrder: newSoldOrder })),
  }));
