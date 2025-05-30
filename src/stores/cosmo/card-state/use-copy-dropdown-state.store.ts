import { create } from "zustand";

interface CopyDropdownState {
  isAnyDropdownOpen: boolean;
  setDropdownOpen: (isOpen: boolean) => void;
}

export const useCopyDropdownState = create<CopyDropdownState>((set) => ({
  isAnyDropdownOpen: false,
  setDropdownOpen: (isOpen: boolean) => set({ isAnyDropdownOpen: isOpen }),
}));
