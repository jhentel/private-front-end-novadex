import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import cookies from "js-cookie";

export type MoreFilterState = {
  isLoadingFilterFetch: boolean;
  setIsLoadingFilterFetch: (newState: boolean) => void;
  filters: {
    preview: {
      checkBoxes: {
        mintAuth: boolean;
        freezeAuth: boolean;
        onlyLPBurned: boolean;
        top10Holders: boolean;
        hideBundled: boolean;
        withAtLeast1Social: boolean;
      };
      showKeywords: string;
      byCurrentLiquidity: {
        min: number | undefined;
        max: number | undefined;
      };
      byVolume: {
        min: number | undefined;
        max: number | undefined;
      };
      byAge: {
        min: number | undefined;
        max: number | undefined;
      };
      byMarketCap: {
        min: number | undefined;
        max: number | undefined;
      };
      byTXNS: {
        min: number | undefined;
        max: number | undefined;
      };
      byBuys: {
        min: number | undefined;
        max: number | undefined;
      };
      bySells: {
        min: number | undefined;
        max: number | undefined;
      };
    };
    genuine: {
      checkBoxes: {
        mintAuth: boolean;
        freezeAuth: boolean;
        onlyLPBurned: boolean;
        top10Holders: boolean;
        hideBundled: boolean;
        withAtLeast1Social: boolean;
      };
      showKeywords: string;
      byCurrentLiquidity: {
        min: number | undefined;
        max: number | undefined;
      };
      byVolume: {
        min: number | undefined;
        max: number | undefined;
      };
      byAge: {
        min: number | undefined;
        max: number | undefined;
      };
      byMarketCap: {
        min: number | undefined;
        max: number | undefined;
      };
      byTXNS: {
        min: number | undefined;
        max: number | undefined;
      };
      byBuys: {
        min: number | undefined;
        max: number | undefined;
      };
      bySells: {
        min: number | undefined;
        max: number | undefined;
      };
    };
  };
  toggleCheckbox: (
    filterKey: keyof MoreFilterState["filters"]["preview"]["checkBoxes"],
    filterType: keyof MoreFilterState["filters"],
  ) => void;
  setShowKeywords: (
    value: string,
    filterType: keyof MoreFilterState["filters"],
  ) => void;
  setRangeFilter: (
    filterKey: keyof Omit<
      MoreFilterState["filters"]["preview"],
      "showKeywords" | "doNotShowKeywords"
    >,
    value: number | undefined,
    rangeType: "min" | "max",
    filterType: keyof MoreFilterState["filters"],
  ) => void;
  resetMoreFilters: (filterType: keyof MoreFilterState["filters"]) => void;
  applyMoreFilters: () => void;
};

export const useMoreFilterStore = create<MoreFilterState>()(
  persist(
    (set) => ({
      isLoadingFilterFetch: false,
      setIsLoadingFilterFetch: (newState) =>
        set(() => ({
          isLoadingFilterFetch: newState,
        })),
      filters: {
        preview: {
          showKeywords: "",
          checkBoxes: {
            mintAuth: false,
            freezeAuth: false,
            onlyLPBurned: false,
            hideBundled: false,
            top10Holders: false,
            withAtLeast1Social: false,
          },
          byCurrentLiquidity: {
            min: undefined,
            max: undefined,
          },
          byVolume: {
            min: undefined,
            max: undefined,
          },
          byAge: {
            min: undefined,
            max: undefined,
          },
          byMarketCap: {
            min: undefined,
            max: undefined,
          },
          byTXNS: {
            min: undefined,
            max: undefined,
          },
          byBuys: {
            min: undefined,
            max: undefined,
          },
          bySells: {
            min: undefined,
            max: undefined,
          },
        },
        genuine: {
          showKeywords: "",
          checkBoxes: {
            mintAuth: false,
            freezeAuth: false,
            onlyLPBurned: false,
            hideBundled: false,
            top10Holders: false,
            withAtLeast1Social: false,
          },
          byCurrentLiquidity: {
            min: undefined,
            max: undefined,
          },
          byVolume: {
            min: undefined,
            max: undefined,
          },
          byAge: {
            min: undefined,
            max: undefined,
          },
          byMarketCap: {
            min: undefined,
            max: undefined,
          },
          byTXNS: {
            min: undefined,
            max: undefined,
          },
          byBuys: {
            min: undefined,
            max: undefined,
          },
          bySells: {
            min: undefined,
            max: undefined,
          },
        },
      },
      toggleCheckbox: (filterKey, filterType) =>
        set((state) => ({
          filters: {
            ...state.filters,
            [filterType]: {
              ...state.filters[filterType],
              checkBoxes: {
                ...state.filters[filterType].checkBoxes,
                [filterKey]: !state.filters[filterType].checkBoxes[filterKey],
              },
            },
          },
        })),
      setShowKeywords: (value, filterType) =>
        set((state) => ({
          filters: {
            ...state.filters,
            [filterType]: {
              ...state.filters[filterType],
              showKeywords: value,
            },
          },
        })),
      setRangeFilter: (filterKey, value, rangeType, filterType) =>
        set((state) => ({
          filters: {
            ...state.filters,
            [filterType]: {
              ...state.filters[filterType],
              [filterKey]: {
                ...state.filters[filterType][filterKey],
                [rangeType]: value,
              },
            },
          },
        })),
      resetMoreFilters: (filterType) =>
        set((state) => {
          const updatedFilters = {
            filters: {
              ...state.filters,
              [filterType]: {
                showKeywords: "",
                checkBoxes: {
                  mintAuth: false,
                  freezeAuth: false,
                  onlyLPBurned: false,
                  hideBundled: false,
                  top10Holders: false,
                  withAtLeast1Social: false,
                },
                byTop10HoldersPercentage: {
                  min: undefined,
                  max: undefined,
                },
                byCurrentLiquidity: {
                  min: undefined,
                  max: undefined,
                },
                byVolume: {
                  min: undefined,
                  max: undefined,
                },
                byAge: {
                  min: undefined,
                  max: undefined,
                },
                byMarketCap: {
                  min: undefined,
                  max: undefined,
                },
                byTXNS: {
                  min: undefined,
                  max: undefined,
                },
                byBuys: {
                  min: undefined,
                  max: undefined,
                },
                bySells: {
                  min: undefined,
                  max: undefined,
                },
              },
            },
          };

          cookies.remove("trending-more-filter");

          return updatedFilters;
        }),
      applyMoreFilters: () =>
        set((state) => {
          const newGenuine = { ...state.filters.preview };

          const encodedNewGenuine = btoa(JSON.stringify(newGenuine));
          cookies.set("trending-more-filter", encodedNewGenuine);
          return { filters: { ...state.filters, genuine: newGenuine } };
        }),
    }),
    {
      name: "trending-more-filter",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
