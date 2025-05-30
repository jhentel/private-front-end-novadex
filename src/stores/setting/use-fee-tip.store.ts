import { create } from "zustand";
type FeeTipField = { fee: number | undefined; tip: number | undefined };

export type FeeTip = {
  data: FeeTipField;
  setFeeTipData: (data: FeeTipField) => void;
};

export const useFeeTip = create<FeeTip>()((set) => ({
  data: {
    fee: 0.0001,
    tip: 0.0001,
  },
  setFeeTipData: (data) => set({ data }),
}));
