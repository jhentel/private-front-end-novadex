import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WindowType = "footer" | "popup" | "snap";
export type WindowName = "twitter" | "wallet_tracker";

export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

export interface PopupState {
  name: WindowName;
  isOpen: boolean;
  position: WindowPosition;
  size: WindowSize;
  mode: WindowType;
  snappedOffset: number;
  snappedSide: "none" | "left" | "right";
  isInitialized: boolean;
}

interface CurrentSnappedPopup {
  left: WindowName[];
  right: WindowName[];
}

type Side = "none" | "left" | "right";

interface PopupStore {
  popups: PopupState[];
  setPopupState: (
    name: WindowName,
    updater: (popup: PopupState) => PopupState,
  ) => void;
  resetPopup: (name: WindowName) => void;
  resetAllPopups: () => void;
  togglePopup: (name: WindowName) => void;

  remainingScreenWidth: number;
  setRemainingScreenWidth: (updater: (prev: number) => number) => void;

  currentSnappedPopup: CurrentSnappedPopup;
  addSnappedPopup: (side: Side, name: WindowName) => void;
  removeSnappedPopup: (name: WindowName) => void;

  prevSnappedLeft: WindowName | undefined;
  prevSnappedRight: WindowName | undefined;
}

export const defaultPopupState = (name: WindowName): PopupState => ({
  name,
  isOpen: false,
  position: { x: 0, y: 0 },
  size: { width: 420, height: 350 },
  mode: "footer",
  isInitialized: false,
  snappedSide: "none",
  snappedOffset: 0,
});

export const usePopupByName = (name: WindowName) =>
  usePopupStore((state) => state.popups.find((p) => p.name === name)!);

export const usePopupStore = create<PopupStore>()(
  persist(
    (set, get) => ({
      prevSnappedRight: undefined,
      prevSnappedLeft: undefined,

      popups: [
        defaultPopupState("twitter"),
        defaultPopupState("wallet_tracker"),
      ],

      setPopupState: (name, updater) => {
        set((state) => ({
          popups: state.popups.map((popup) =>
            popup.name === name ? updater(popup) : popup,
          ),
        }));
      },

      togglePopup: (name) => {
        set((state) => ({
          popups: state.popups.map((popup) =>
            popup.name === name ? { ...popup, isOpen: !popup.isOpen } : popup,
          ),
        }));
      },

      resetPopup: (name) => {
        set((state) => ({
          popups: state.popups.map((popup) =>
            popup.name === name ? defaultPopupState(name) : popup,
          ),
          remainingScreenWidth: 0,
        }));
      },

      resetAllPopups: () => {
        set((state) => ({
          popups: [
            defaultPopupState("twitter"),
            defaultPopupState("wallet_tracker"),
          ],
          remainingScreenWidth: 0,
          currentSnappedPopup: {
            left: [],
            right: [],
          },
          prevSnappedLeft: undefined,
          prevSnappedRight: undefined,
        }));
      },

      remainingScreenWidth: 0,

      setRemainingScreenWidth: (updater) => {
        set((state) => ({
          remainingScreenWidth: updater(state.remainingScreenWidth),
        }));
      },

      currentSnappedPopup: {
        left: [],
        right: [],
      },

      addSnappedPopup: (side, name) => {
        const popup = get().popups.find((p) => p.name === name);
        if (!popup) throw new Error("Popup not found");
        if (side !== "none") {
          const exists = get().currentSnappedPopup[side].find(
            (p) => p === name,
          );
          if (exists) return;

          set((state) => ({
            currentSnappedPopup: {
              ...state.currentSnappedPopup,
              [side]: [...state.currentSnappedPopup[side], popup.name],
            },
          }));
        }
      },

      removeSnappedPopup: (name) => {
        set((state) => {
          const { left, right } = state.currentSnappedPopup;

          const popup =
            left.find((p) => p === name) || right.find((p) => p === name);
          if (!popup) return {}; // Popup not snapped, skip

          const isLeft = left.some((p) => p === name);

          return {
            currentSnappedPopup: {
              left: isLeft ? left.filter((p) => p !== name) : left,
              right: !isLeft ? right.filter((p) => p !== name) : right,
            },
            ...(isLeft
              ? {
                  prevSnappedLeft: left.find((p) => p === name),
                  prevSnappedRight: undefined,
                }
              : {
                  prevSnappedLeft: undefined,
                  prevSnappedRight: right.find((p) => p === name),
                }),
          };
        });
      },
    }),
    { name: "popup-state" },
  ),
);
