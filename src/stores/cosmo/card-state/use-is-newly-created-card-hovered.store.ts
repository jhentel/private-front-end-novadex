import { create } from "zustand";

type IsNewlyCreatedCardHoveredState = {
  isNewlyCreatedCardHovered: boolean;
  setNewlyCreatedCardHoverState: (newState: boolean) => void;
};

export const useIsNewlyCreatedCardHoveredStore =
  create<IsNewlyCreatedCardHoveredState>()((set) => ({
    isNewlyCreatedCardHovered: false,
    setNewlyCreatedCardHoverState: (newState) =>
      set(() => ({ isNewlyCreatedCardHovered: newState })),
  }));
