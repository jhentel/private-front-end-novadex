import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type WalletTrackerModalMode = "side" | "locked" | "full";
type WalletTrackerSnappedState = {
  snappedSide: "none" | "left" | "right";
  nearSnappedSide: "none" | "left" | "right";
};
type WalletTrackerMonitorSize = {
  width: number;
  height: number;
};
type WalletTrackerPosition = {
  x: number;
  y: number;
};

type WalletTrackerPreviousState = {
  modalMode: WalletTrackerModalMode;
  size: WalletTrackerMonitorSize;
};

type WalletTrackerLockedState = {
  walletTrackerModalMode: WalletTrackerModalMode;
  setWalletTrackerModalMode: (mode?: WalletTrackerModalMode) => void;

  isOpenWalletTrackerModal: boolean;
  toggleOpenWalletTrackerModal: () => void;
  setIsOpenWalletTrackerModal: (val: boolean) => void;

  walletTrackerSize: WalletTrackerMonitorSize;
  setWalletTrackerSize: (
    fn: (state: WalletTrackerMonitorSize) => WalletTrackerMonitorSize,
  ) => void;

  walletTrackerSnappedState: WalletTrackerSnappedState;
  setWalletTrackerSnappedState: (
    fn: (state: WalletTrackerSnappedState) => WalletTrackerSnappedState,
  ) => void;

  isWalletTrackerInitialized: boolean;
  setIsWalletTrackerInitialized: (val: boolean) => void;

  walletTrackerPosition: WalletTrackerPosition;
  setWalletTrackerPosition: (position: WalletTrackerPosition) => void;

  previousState: WalletTrackerPreviousState | null;
  setPreviousState: (state: WalletTrackerPreviousState) => void;

  hasRestoredPreviousState: boolean;
  setHasRestoredPreviousState: (val: boolean) => void;
};

export const useWalletTrackerLockedStore = create<WalletTrackerLockedState>()(
  persist(
    (set, get) => ({
      walletTrackerModalMode: "side",
      setWalletTrackerModalMode: (mode = "side") =>
        set(() => ({ walletTrackerModalMode: mode })),

      isOpenWalletTrackerModal: false,
      toggleOpenWalletTrackerModal: () =>
        set(() => ({
          isOpenWalletTrackerModal: !get().isOpenWalletTrackerModal,
        })),
      setIsOpenWalletTrackerModal: (val) =>
        set(() => ({ isOpenWalletTrackerModal: val })),

      walletTrackerSize: { width: 560, height: 560 },
      setWalletTrackerSize: (fn) =>
        set((state) => ({ walletTrackerSize: fn(state.walletTrackerSize) })),

      walletTrackerSnappedState: {
        snappedSide: "none",
        nearSnappedSide: "none",
      },
      setWalletTrackerSnappedState: (fn) =>
        set((state) => ({
          walletTrackerSnappedState: fn(state.walletTrackerSnappedState),
        })),

      isWalletTrackerInitialized: false,
      setIsWalletTrackerInitialized: (val) =>
        set(() => ({ isWalletTrackerInitialized: val })),

      walletTrackerPosition: { x: 0, y: 0 },
      setWalletTrackerPosition: (position) =>
        set(() => ({ walletTrackerPosition: position })),

      previousState: null,
      setPreviousState: (state) => set(() => ({ previousState: state })),

      hasRestoredPreviousState: false,
      setHasRestoredPreviousState: (val) =>
        set(() => ({ hasRestoredPreviousState: val })),
    }),
    {
      name: "wallet-tracker-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
