import { create } from "zustand";

type IsGraduatedCardHoveredState = {
  isGraduatedCardHovered: boolean;
  setGraduatedCardHoverState: (newState: boolean) => void;
};

export const useIsGraduatedCardHoveredStore =
  create<IsGraduatedCardHoveredState>()((set) => ({
    isGraduatedCardHovered: false,
    setGraduatedCardHoverState: (newState) =>
      set(() => ({ isGraduatedCardHovered: newState })),
  }));
