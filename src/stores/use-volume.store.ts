import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type VolumeStore = {
  volume: number;
  setVolume: (height: number) => void;
};

export const useVolumeStore = create<VolumeStore>()(
  persist(
    (set) => ({
      volume: 100,
      setVolume: (volume) =>
        set(() => ({
          volume,
        })),
    }),
    {
      name: "volume-store-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
