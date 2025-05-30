// @ts-nocheck

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { mergeDeepLeft } from "ramda";

export type GraduatedFilterState = {
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
  setPreviewSearch: (value: string) => void;
  graduatedFiltersCount: number;
  toggleGraduatedFilter: (
    filterKey: keyof GraduatedFilterState["filters"]["preview"]["checkBoxes"],
    filterType: keyof GraduatedFilterState["filters"],
  ) => void;
  setShowKeywords: (
    value: string,
    filterType: keyof GraduatedFilterState["filters"],
  ) => void;
  setDoNotShowKeywords: (
    value: string,
    filterType: keyof GraduatedFilterState["filters"],
  ) => void;
  setRangeFilter: (
    filterKey: keyof Omit<
      GraduatedFilterState["filters"]["preview"],
      "checkBoxes" | "showKeywords" | "doNotShowKeywords"
    >,
    value: number | undefined,
    rangeType: "min" | "max",
    filterType: keyof GraduatedFilterState["filters"],
  ) => void;
  resetGraduatedFilters: (
    filterType: keyof GraduatedFilterState["filters"],
  ) => void;
  applyGraduatedFilters: () => void;
  updateGraduatedFiltersCount: () => void;
};

export const useGraduatedFilterStore = create<GraduatedFilterState>()(
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
      graduatedFiltersCount: 0,
      toggleGraduatedFilter: (filterKey, filterType) =>
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
      resetGraduatedFilters: (filterType) => {
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
          graduatedFiltersCount:
            state.graduatedFiltersCount < 10
              ? state.graduatedFiltersCount + 1
              : 0,
        }));
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
      applyGraduatedFilters: () => {
        // console.log("Graduated Filters applied!");

        set((state) => ({
          filters: {
            ...state.filters,
            genuine: { ...state.filters.preview },
          },
        }));
      },
      updateGraduatedFiltersCount: () => {
        set((state) => ({
          graduatedFiltersCount:
            state.graduatedFiltersCount < 10
              ? state.graduatedFiltersCount + 1
              : 0,
        }));
      },
    }),
    {
      name: "graduated-filter",
      storage: createJSONStorage(() => localStorage),
      version: 5,
      migrate: (persistedState, version) => {
        if (version === 0) {
          delete (persistedState as GraduatedFilterState)!.filters!.preview!
            .checkBoxes!.meteora_dyn;
          delete (persistedState as GraduatedFilterState)!.filters!.genuine!
            .checkBoxes!.meteora_dyn;
          delete (persistedState as GraduatedFilterState)!.filters!.preview!
            .checkBoxes!.meteora_dlmm;
          delete (persistedState as GraduatedFilterState)!.filters!.genuine!
            .checkBoxes!.meteora_dlmm;
        }

        if (version === 1) {
          delete (persistedState as GraduatedFilterState)!.filters!.preview!
            .checkBoxes!.pumpfun;
          delete (persistedState as GraduatedFilterState)!.filters!.genuine!
            .checkBoxes!.pumpfun;
          delete (persistedState as GraduatedFilterState)!.filters!.preview!
            .checkBoxes!.dynamic_bonding_curve;
          delete (persistedState as GraduatedFilterState)!.filters!.genuine!
            .checkBoxes!.dynamic_bonding_curve;
          delete (persistedState as GraduatedFilterState)!.filters!.preview!
            .checkBoxes!.moonshot;
          delete (persistedState as GraduatedFilterState)!.filters!.genuine!
            .checkBoxes!.moonshot;
          delete (persistedState as GraduatedFilterState)!.filters!.preview!
            .checkBoxes!.launchlab;
          delete (persistedState as GraduatedFilterState)!.filters!.genuine!
            .checkBoxes!.launchlab;
        }

        if (version === 2) {
          delete (persistedState as GraduatedFilterState)!.filters!.preview!
            .checkBoxes!.raydium;
          delete (persistedState as GraduatedFilterState)!.filters!.genuine!
            .checkBoxes!.raydium;
          delete (persistedState as GraduatedFilterState)!.filters!.preview!
            .checkBoxes!.meteora_amm;
          delete (persistedState as GraduatedFilterState)!.filters!.genuine!
            .checkBoxes!.meteora_amm;
          delete (persistedState as GraduatedFilterState)!.filters!.preview!
            .checkBoxes!.meteora_amm_v2;
          delete (persistedState as GraduatedFilterState)!.filters!.genuine!
            .checkBoxes!.meteora_amm_v2;
          delete (persistedState as GraduatedFilterState)!.filters!.preview!
            .checkBoxes!.pumpswap;
          delete (persistedState as GraduatedFilterState)!.filters!.genuine!
            .checkBoxes!.pumpswap;
        }

        if (version === 3) {
          delete (persistedState as GraduatedFilterState)!.filters!.preview!
            .checkBoxes!.believe;
          delete (persistedState as GraduatedFilterState)!.filters!.genuine!
            .checkBoxes!.believe;
        }

        if (version === 4) {
          delete (persistedState as GraduatedFilterState)!.filters!.preview!
            .checkBoxes!.pumpswap;
          delete (persistedState as GraduatedFilterState)!.filters!.genuine!
            .checkBoxes!.pumpswap;
        }

        return persistedState as GraduatedFilterState;
      },
      merge: (persistedState, currentState) =>
        mergeDeepLeft(persistedState as GraduatedFilterState, currentState),
    },
  ),
);
