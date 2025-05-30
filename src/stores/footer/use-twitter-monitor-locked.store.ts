import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type TwitterModalMode = "side" | "locked" | "full";
type TwitterMonitorSnappedState = {
  snappedSide: "none" | "left" | "right";
  nearSnappedSide: "none" | "left" | "right";
};
type TwitterMonitorSize = {
  width: number;
  height: number;
};
type TwitterMonitorPosition = {
  x: number;
  y: number;
};

type PreviousState = {
  modalMode: TwitterModalMode;
  size: TwitterMonitorSize;
};

type TwitterMonitorLockedState = {
  twitterMonitorModalMode: TwitterModalMode;
  setTwitterMonitorModalMode: (mode?: TwitterModalMode) => void;

  isOpenTwitterMonitorModal: boolean;
  toggleOpenTwitterMonitorModal: () => void;
  setIsOpenTwitterMonitorModal: (val: boolean) => void;

  twitterMonitorSize: TwitterMonitorSize;
  setTwitterMonitorSize: (
    fn: (state: TwitterMonitorSize) => TwitterMonitorSize,
  ) => void;

  twitterMonitorSnappedState: TwitterMonitorSnappedState;
  setTwitterMonitorSnappedState: (
    fn: (state: TwitterMonitorSnappedState) => TwitterMonitorSnappedState,
  ) => void;

  isTwitterMonitorInitialized: boolean;
  setIsTwitterMonitorInitialized: (val: boolean) => void;

  twitterMonitorPosition: TwitterMonitorPosition;
  setTwitterMonitorPosition: (position: TwitterMonitorPosition) => void;

  previousState: PreviousState | null;
  setPreviousState: (state: PreviousState) => void;

  hasRestoredPreviousState: boolean;
  setHasRestoredPreviousState: (val: boolean) => void;
};

export const useTwitterMonitorLockedStore = create<TwitterMonitorLockedState>()(
  persist(
    (set, get) => ({
      twitterMonitorModalMode: "side",
      setTwitterMonitorModalMode: (mode = "side") =>
        set(() => ({ twitterMonitorModalMode: mode })),

      isOpenTwitterMonitorModal: false,
      toggleOpenTwitterMonitorModal: () =>
        set(() => ({
          isOpenTwitterMonitorModal: !get().isOpenTwitterMonitorModal,
        })),
      setIsOpenTwitterMonitorModal: (val) =>
        set(() => ({ isOpenTwitterMonitorModal: val })),

      twitterMonitorSize: { width: 560, height: 560 },
      setTwitterMonitorSize: (fn) =>
        set((state) => ({ twitterMonitorSize: fn(state.twitterMonitorSize) })),

      twitterMonitorSnappedState: {
        snappedSide: "none",
        nearSnappedSide: "none",
      },
      setTwitterMonitorSnappedState: (fn) =>
        set((state) => ({
          twitterMonitorSnappedState: fn(state.twitterMonitorSnappedState),
        })),

      isTwitterMonitorInitialized: false,
      setIsTwitterMonitorInitialized: (val) =>
        set(() => ({ isTwitterMonitorInitialized: val })),

      twitterMonitorPosition: { x: 0, y: 0 },
      setTwitterMonitorPosition: (position) =>
        set(() => ({ twitterMonitorPosition: position })),

      previousState: null,
      setPreviousState: (state) => set(() => ({ previousState: state })),

      hasRestoredPreviousState: false,
      setHasRestoredPreviousState: (val) =>
        set(() => ({ hasRestoredPreviousState: val })),
    }),
    {
      name: "twitter-monitor-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
