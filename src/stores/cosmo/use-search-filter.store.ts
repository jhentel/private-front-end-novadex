import { create } from "zustand";

type SearchFilterState = {
  // Search terms for each list type
  searchTerms: {
    newlyCreated: string;
    aboutToGraduate: string;
    graduated: string;
  };
  // Active search term (used in mobile view)
  activeSearchTerm: string;
  // Actions
  setSearchTerm: (
    listType: keyof SearchFilterState["searchTerms"],
    term: string,
  ) => void;
  setActiveSearchTerm: (term: string) => void;
  clearAllSearchTerms: () => void;
};

export const useSearchFilterStore = create<SearchFilterState>((set) => ({
  searchTerms: {
    newlyCreated: "",
    aboutToGraduate: "",
    graduated: "",
  },
  activeSearchTerm: "",

  setSearchTerm: (listType, term) =>
    set((state) => ({
      searchTerms: {
        ...state.searchTerms,
        [listType]: term,
      },
    })),

  setActiveSearchTerm: (term) => set({ activeSearchTerm: term }),

  clearAllSearchTerms: () =>
    set({
      searchTerms: {
        newlyCreated: "",
        aboutToGraduate: "",
        graduated: "",
      },
      activeSearchTerm: "",
    }),
}));
