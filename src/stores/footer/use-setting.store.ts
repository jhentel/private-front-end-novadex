import { create } from "zustand";

type SettingState = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export const useSettingStore = create<SettingState>()((set) => ({
  isOpen: false,
  setIsOpen: (isOpen) => set(() => ({ isOpen })),
}));
