import { create } from "zustand";

interface WhatsNewState {
  isShowWhatsNew: boolean;
  toggleWhatsNew: () => void;
  setIsShowWhatsNew: (value: boolean) => void;
}

export const useWhatsNewStore = create<WhatsNewState>((set) => ({
  isShowWhatsNew: false,
  toggleWhatsNew: () =>
    set((state) => ({ isShowWhatsNew: !state.isShowWhatsNew })),
  setIsShowWhatsNew: (value) => set({ isShowWhatsNew: value }),
}));
