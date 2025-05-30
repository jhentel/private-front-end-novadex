import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type APIEndpointBasedOnRegionState = {
  selectedRegion: "US" | "EU" | "ASIA";
  setRegion: (region: "US" | "EU" | "ASIA") => void;
};

export const useAPIEndpointBasedOnRegionStore =
  create<APIEndpointBasedOnRegionState>()(
    persist(
      (set) => ({
        selectedRegion: "US",
        setRegion: (newRegion) => set({ selectedRegion: newRegion }),
      }),
      {
        name: "api-endpoint-based-on-region",
        storage: createJSONStorage(() => localStorage),
      },
    ),
  );
