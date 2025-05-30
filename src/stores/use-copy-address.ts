import { create } from "zustand";

interface DetailCopied {
  mint: string;
  symbol: string;
  name: string;
  image: string;
}

interface CopiedState {
  detailCopied?: DetailCopied;
  setDetailCopied: (value: DetailCopied) => void;
}

export const useCopyAddress = create<CopiedState>((set) => ({
  detailCopied: undefined,
  setDetailCopied: (value: DetailCopied) => set({ detailCopied: value }),
}));
