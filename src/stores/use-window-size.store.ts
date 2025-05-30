import { create } from "zustand";

interface WindowSizeStore {
  width?: number;
  height?: number;
  setSize: (size: { width: number; height: number }) => void;
}

export const useWindowSizeStore = create<WindowSizeStore>((set) => ({
  width: undefined,
  height: undefined,
  setSize: (size) => set({ width: size.width, height: size.height }),
}));
