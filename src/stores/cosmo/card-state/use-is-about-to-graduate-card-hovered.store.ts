import { create } from "zustand";

type IsAboutToGraduateCardHoveredState = {
  isAboutToGraduateCardHovered: boolean;
  setAboutToGraduateCardHoverState: (newState: boolean) => void;
};

export const useIsAboutToGraduateCardHoveredStore =
  create<IsAboutToGraduateCardHoveredState>()((set) => ({
    isAboutToGraduateCardHovered: false,
    setAboutToGraduateCardHoverState: (newState) =>
      set(() => ({ isAboutToGraduateCardHovered: newState })),
  }));
