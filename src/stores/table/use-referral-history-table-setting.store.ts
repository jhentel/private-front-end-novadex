import { create } from "zustand";

type ReferralHistoryTableSettingState = {
  dateOrder: "ASC" | "DESC";
  newRefereesOrder: "ASC" | "DESC";
  earningsOrder: "ASC" | "DESC";
  setDateOrder: (order: "ASC" | "DESC") => void;
  setNewRefereesOrder: (order: "ASC" | "DESC") => void;
  setEarningsOrder: (order: "ASC" | "DESC") => void;
  cleanup: () => void;
};

export const useReferralHistoryTableSettingStore =
  create<ReferralHistoryTableSettingState>()((set) => ({
    dateOrder: "ASC",
    newRefereesOrder: "ASC",
    earningsOrder: "ASC",
    setDateOrder: (newDateOrder) => set(() => ({ dateOrder: newDateOrder })),
    setNewRefereesOrder: (newRefereesOrder) =>
      set(() => ({ newRefereesOrder: newRefereesOrder })),
    setEarningsOrder: (newEarningsOrder) =>
      set(() => ({ earningsOrder: newEarningsOrder })),
    cleanup: () =>
      set(() => ({
        dateOrder: "ASC",
        newRefereesOrder: "ASC",
        earningsOrder: "ASC",
      })),
  }));
