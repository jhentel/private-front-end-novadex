import { create } from "zustand";

type ActiveLanguageState = {
  language: "EN" | "US";
  setLanguage: (newLanguage: "EN" | "US") => void;
};

export const useActiveLanguageStore = create<ActiveLanguageState>()((set) => ({
  language: "EN",
  setLanguage: (newLanguage) => set(() => ({ language: newLanguage })),
}));
