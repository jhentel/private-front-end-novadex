// @ts-nocheck

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { mergeDeepLeft } from "ramda";
import cookies from "js-cookie";

export type DexesFilterState = {
  filters: {
    preview: {
      checkBoxes: {
        pumpfun: boolean;
        moonshot: boolean;
        launchlab: boolean;
        raydium: boolean;
        // boop: boolean;
        dynamic_bonding_curve: boolean;
        // launch_a_coin: boolean;
        bonk: boolean;
        meteora_amm_v2: boolean;
        meteora_amm: boolean;
        pumpswap: boolean;
      };
    };
    genuine: {
      checkBoxes: {
        pumpfun: boolean;
        moonshot: boolean;
        launchlab: boolean;
        raydium: boolean;
        // boop: boolean;
        dynamic_bonding_curve: boolean;
        // launch_a_coin: boolean;
        bonk: boolean;
        meteora_amm_v2: boolean;
        meteora_amm: boolean;
        pumpswap: boolean;
      };
    };
  };
  toggleDexesFilter: (
    filterKey: keyof DexesFilterState["filters"]["preview"]["checkBoxes"],
    filterType: keyof DexesFilterState["filters"],
  ) => void;
  resetDexesFilters: (filterType: keyof DexesFilterState["filters"]) => void;
  applyDexesFilters: () => void;
};

export const useDexesFilterStore = create<DexesFilterState>()(
  persist(
    (set) => ({
      filters: {
        preview: {
          checkBoxes: {
            pumpfun: true,
            moonshot: true,
            launchlab: true,
            raydium: true,
            // boop: true,
            dynamic_bonding_curve: true,
            // launch_a_coin: true,
            bonk: true,
            meteora_amm_v2: true,
            meteora_amm: true,
            pumpswap: true,
          },
        },
        genuine: {
          checkBoxes: {
            raydium: true,
            moonshot: true,
            launchlab: true,
            pumpfun: true,
            // boop: true,
            dynamic_bonding_curve: true,
            // launch_a_coin: true,
            bonk: true,
            meteora_amm_v2: true,
            meteora_amm: true,
            pumpswap: true,
          },
        },
      },
      toggleDexesFilter: (filterKey, filterType) =>
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
      resetDexesFilters: (filterType) =>
        set((state) => {
          const updatedFilters = {
            ...state.filters,
            [filterType]: {
              checkBoxes: {
                raydium: true,
                moonshot: true,
                launchlab: true,
                pumpfun: true,
                // boop: true,
                dynamic_bonding_curve: true,
                // launch_a_coin: true,
                bonk: true,
                meteora_amm_v2: true,
                meteora_amm: true,
                pumpswap: true,
              },
            },
          };

          cookies.remove("trending-dexes-filter");

          return { filters: updatedFilters };
        }),
      applyDexesFilters: () =>
        set((state) => {
          const newGenuine = { ...state.filters.preview };

          const encodedNewGenuine = btoa(JSON.stringify(newGenuine));
          cookies.set("trending-dexes-filter", encodedNewGenuine);
          return { filters: { ...state.filters, genuine: newGenuine } };
        }),
    }),
    {
      name: "trending-dexes-filter",
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: (persistedState, version) => {
        if (version === 0) {
          delete (persistedState as DexesFilterState)!.filters!.preview!
            .checkBoxes!.meteora_dyn;
          delete (persistedState as DexesFilterState)!.filters!.genuine!
            .checkBoxes!.meteora_dyn;
          delete (persistedState as DexesFilterState)!.filters!.preview!
            .checkBoxes!.meteora_dlmm;
          delete (persistedState as DexesFilterState)!.filters!.genuine!
            .checkBoxes!.meteora_dlmm;
        }
        if (version === 1) {
          delete (persistedState as DexesFilterState)!.filters!.preview!
            .checkBoxes!.boop;
          delete (persistedState as DexesFilterState)!.filters!.genuine!
            .checkBoxes!.boop;
          delete (persistedState as DexesFilterState)!.filters!.preview!
            .checkBoxes!.believe;
          delete (persistedState as DexesFilterState)!.filters!.genuine!
            .checkBoxes!.believe;
        }

        return persistedState as DexesFilterState;
      },
      merge: (persistedState, currentState) =>
        mergeDeepLeft(persistedState as DexesFilterState, currentState),
    },
  ),
);
