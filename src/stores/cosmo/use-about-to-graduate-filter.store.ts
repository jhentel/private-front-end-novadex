// @ts-nocheck

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { mergeDeepLeft } from "ramda";

export type AboutToGraduateFilterState = {
  isLoadingFilterFetch: boolean;
  setIsLoadingFilterFetch: (newState: boolean) => void;
  filters: {
    preview: {
      checkBoxes: {
        pumpfun: boolean;
        moonshot: boolean;
        launchlab: boolean;
        // boop: boolean;
        dynamic_bonding_curve: boolean;
        launch_a_coin: boolean;
        bonk: boolean;
        showHide: boolean;
      };
      showKeywords: string;
      doNotShowKeywords: string;
      byHoldersCount: {
        min: number | undefined;
        max: number | undefined;
      };
      byTop10Holders: {
        min: number | undefined;
        max: number | undefined;
      };
      byDevHoldingPercentage: {
        min: number | undefined;
        max: number | undefined;
      };
      byDevMigrated: {
        min: number | undefined;
        max: number | undefined;
      };
      bySnipers: {
        min: number | undefined;
        max: number | undefined;
      };
      byInsiderHoldingPercentage: {
        min: number | undefined;
        max: number | undefined;
      };
      byBotHolders: {
        min: number | undefined;
        max: number | undefined;
      };
      byAge: {
        min: number | undefined;
        max: number | undefined;
      };
      byCurrentLiquidity: {
        min: number | undefined;
        max: number | undefined;
      };
      byVolume: {
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
        pumpfun: boolean;
        moonshot: boolean;
        launchlab: boolean;
        // boop: boolean;
        dynamic_bonding_curve: boolean;
        launch_a_coin: boolean;
        bonk: boolean;
        showHide: boolean;
      };
      showKeywords: string;
      doNotShowKeywords: string;
      byHoldersCount: {
        min: number | undefined;
        max: number | undefined;
      };
      byTop10Holders: {
        min: number | undefined;
        max: number | undefined;
      };
      byDevHoldingPercentage: {
        min: number | undefined;
        max: number | undefined;
      };
      byDevMigrated: {
        min: number | undefined;
        max: number | undefined;
      };
      bySnipers: {
        min: number | undefined;
        max: number | undefined;
      };
      byInsiderHoldingPercentage: {
        min: number | undefined;
        max: number | undefined;
      };
      byBotHolders: {
        min: number | undefined;
        max: number | undefined;
      };
      byAge: {
        min: number | undefined;
        max: number | undefined;
      };
      byCurrentLiquidity: {
        min: number | undefined;
        max: number | undefined;
      };
      byVolume: {
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
  setPreviewSearch: (v: string) => void;
  aboutToGraduateFiltersCount: number;
  toggleAboutToGraduateFilter: (
    filterKey: keyof AboutToGraduateFilterState["filters"]["preview"]["checkBoxes"],
    filterType: keyof AboutToGraduateFilterState["filters"],
  ) => void;
  setShowKeywords: (
    value: string,
    filterType: keyof AboutToGraduateFilterState["filters"],
  ) => void;
  setDoNotShowKeywords: (
    value: string,
    filterType: keyof AboutToGraduateFilterState["filters"],
  ) => void;
  setRangeFilter: (
    filterKey: keyof Omit<
      AboutToGraduateFilterState["filters"]["preview"],
      "checkBoxes" | "showKeywords" | "doNotShowKeywords"
    >,
    value: number | undefined,
    rangeType: "min" | "max",
    filterType: keyof AboutToGraduateFilterState["filters"],
  ) => void;
  resetAboutToGraduateFilters: (
    filterType: keyof AboutToGraduateFilterState["filters"],
  ) => void;
  applyAboutToGraduateFilters: () => void;
  updateAboutToGraduateFiltersCount: () => void;
};

export const useAboutToGraduateFilterStore =
  create<AboutToGraduateFilterState>()(
    persist(
      (set) => ({
        isLoadingFilterFetch: false,
        setIsLoadingFilterFetch: (newState) =>
          set(() => ({
            isLoadingFilterFetch: newState,
          })),
        filters: {
          preview: {
            checkBoxes: {
              pumpfun: true,
              moonshot: true,
              launchlab: true,
              // boop: true,
              dynamic_bonding_curve: true,
              launch_a_coin: true,
              bonk: true,
              showHide: false,
            },
            showKeywords: "",
            doNotShowKeywords: "",
            byHoldersCount: {
              min: undefined,
              max: undefined,
            },
            byTop10Holders: {
              min: undefined,
              max: undefined,
            },
            byDevHoldingPercentage: {
              min: undefined,
              max: undefined,
            },
            byDevMigrated: {
              min: undefined,
              max: undefined,
            },
            bySnipers: {
              min: undefined,
              max: undefined,
            },
            byInsiderHoldingPercentage: {
              min: undefined,
              max: undefined,
            },
            byBotHolders: {
              min: undefined,
              max: undefined,
            },
            byAge: {
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
            checkBoxes: {
              pumpfun: true,
              moonshot: true,
              launchlab: true,
              // boop: true,
              dynamic_bonding_curve: true,
              launch_a_coin: true,
              bonk: true,
              showHide: false,
            },
            showKeywords: "",
            doNotShowKeywords: "",
            byHoldersCount: {
              min: undefined,
              max: undefined,
            },
            byTop10Holders: {
              min: undefined,
              max: undefined,
            },
            byDevHoldingPercentage: {
              min: undefined,
              max: undefined,
            },
            byDevMigrated: {
              min: undefined,
              max: undefined,
            },
            bySnipers: {
              min: undefined,
              max: undefined,
            },
            byInsiderHoldingPercentage: {
              min: undefined,
              max: undefined,
            },
            byBotHolders: {
              min: undefined,
              max: undefined,
            },
            byAge: {
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
        setPreviewSearch: (v) =>
          set((state) => ({
            filters: {
              ...state.filters,
              preview: {
                ...state.filters.preview,
                showKeywords: v,
              },
            },
          })),
        aboutToGraduateFiltersCount: 0,
        toggleAboutToGraduateFilter: (filterKey, filterType) =>
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
        setDoNotShowKeywords: (value, filterType) =>
          set((state) => ({
            filters: {
              ...state.filters,
              [filterType]: {
                ...state.filters[filterType],
                doNotShowKeywords: value,
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
        resetAboutToGraduateFilters: (filterType) =>
          set((state) => ({
            isLoadingFilterFetch: true,
            filters: {
              ...state.filters,
              [filterType]: {
                checkBoxes: {
                  pumpfun: true,
                  moonshot: true,
                  launchlab: true,
                  // boop: true,
                  dynamic_bonding_curve: true,
                  launch_a_coin: true,
                  bonk: true,
                  showHide: false,
                },
                showKeywords: "",
                doNotShowKeywords: "",
                byHoldersCount: {
                  min: undefined,
                  max: undefined,
                },
                byTop10Holders: {
                  min: undefined,
                  max: undefined,
                },
                byDevHoldingPercentage: {
                  min: undefined,
                  max: undefined,
                },
                byDevMigrated: {
                  min: undefined,
                  max: undefined,
                },
                bySnipers: {
                  min: undefined,
                  max: undefined,
                },
                byInsiderHoldingPercentage: {
                  min: undefined,
                  max: undefined,
                },
                byBotHolders: {
                  min: undefined,
                  max: undefined,
                },
                byAge: {
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
            // Update the filter count to trigger a refetch
            aboutToGraduateFiltersCount:
              state.aboutToGraduateFiltersCount < 10
                ? state.aboutToGraduateFiltersCount + 1
                : 0,
          })),
        applyAboutToGraduateFilters: () => {
          // console.log("About To Graduate Filters applied!");

          set((state) => ({
            filters: {
              ...state.filters,
              genuine: { ...state.filters.preview },
            },
          }));
        },
        updateAboutToGraduateFiltersCount: () => {
          set((state) => ({
            aboutToGraduateFiltersCount:
              state.aboutToGraduateFiltersCount < 10
                ? state.aboutToGraduateFiltersCount + 1
                : 0,
          }));
        },
      }),
      {
        name: "about-to-graduate-filter",
        storage: createJSONStorage(() => localStorage),
        version: 1,
        migrate: (persistedState, version) => {
          if (version === 0) {
            delete (persistedState as AboutToGraduateFilterState)!.filters!
              .preview!.checkBoxes!.believe;
            delete (persistedState as AboutToGraduateFilterState)!.filters!
              .genuine!.checkBoxes!.believe;
          }
        },
        merge: (persistedState, currentState) =>
          mergeDeepLeft(
            persistedState as AboutToGraduateFilterState,
            currentState,
          ),
      },
    ),
  );
