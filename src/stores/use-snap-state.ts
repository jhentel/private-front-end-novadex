import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface SnappedSize {
  width: number;
  height: number;
}

interface CurrentSnapped {
  name: string | null;
  side: "left" | "right" | "none";
  isOpen: boolean;
}

interface SnapState {
  currentSnapped: CurrentSnapped;
  setCurrentSnapped: (snapped: CurrentSnapped) => void;
  resetCurrentSnapped: () => void;

  snappedSize: SnappedSize;
  setSnappedSize: (fn: (state: SnappedSize) => SnappedSize) => void;
}

export const useSnapStateStore = create<SnapState>()(
  persist(
    (set) => ({
      currentSnapped: {
        name: null,
        side: "none",
        isOpen: false,
      },
      setCurrentSnapped: (snapped) => set({ currentSnapped: snapped }),
      resetCurrentSnapped: () =>
        set({ currentSnapped: { name: null, side: "none", isOpen: false } }),

      snappedSize: {
        width: 0,
        height: 0,
      },
      setSnappedSize: (fn) =>
        set((state) => ({ snappedSize: fn(state.snappedSize) })),
    }),
    {
      name: "snap-state-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
