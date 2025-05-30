import { create } from "zustand";
import { persist } from "zustand/middleware";

type TradePanelState = {
  isOpen: boolean;
  position: { top: number; right: number };
  setIsOpen: (isOpen: boolean) => void;
  setPosition: (position: { top: number; right: number }) => void;
  size: { width: number; height: number };
  setSize: (size: { width: number; height: number }) => void;
};

const getDefaultPosition = () => {
  if (typeof window === "undefined") return { top: 0, right: 0 };

  return {
    top: Math.max(
      0,
      Math.min(window.innerHeight / 2 - 180, window.innerHeight - 361),
    ),
    right: Math.max(
      0,
      Math.min(window.innerWidth / 2 - 178, window.innerWidth - 357),
    ),
  };
};

export const useOpenInstantTrade = create(
  persist<TradePanelState>(
    (set, get) => ({
      isOpen: false,
      position: get()?.position || getDefaultPosition(),
      setIsOpen: (isOpen) => set(() => ({ isOpen })),
      setPosition: (position) => {
        set((state) => {
          if (
            state.position.top === position.top &&
            state.position.right === position.right
          ) {
            return state;
          }
          return { ...state, position };
        });
      },
      size: { width: 280, height: 350 },
      setSize: (size) => {
        set((state) => {
          if (state.size.width === size.width && state.size.height === size.height) {
            return state;
          }
          return { ...state, size };
        });
      },
    }),
    {
      name: "trade-panel-store",
    },
  ),
);
