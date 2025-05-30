import { SellSniperPresetData } from "@/apis/rest/settings/settings";
import { create } from "zustand";
import { PresetId, PresetKey } from "@/types/preset";
import { createJSONStorage, persist } from "zustand/middleware";

export type SnipeSellAmount = {
  order: number;
  amount: number;
};

type SellSniperState = {
  activePreset: PresetKey;
  presets: Record<PresetKey, SellSniperPresetData>;
  setPresets: (presets: Record<PresetKey, SellSniperPresetData>) => void;
  setActivePreset: (preset: PresetKey) => void;
  updatePreset: (
    preset: PresetKey,
    data: Partial<SellSniperPresetData>,
  ) => void;
};

export const useSellSniperSettingsStore = create<SellSniperState>()(
  persist(
    (set) => ({
      activePreset: "preset1",
      presets: {} as Record<PresetKey, SellSniperPresetData>,
      setPresets: (presets) => set({ presets }),
      setActivePreset: (preset) => set({ activePreset: preset }),
      updatePreset: (preset, data) =>
        set((state) => ({
          presets: {
            ...state.presets,
            [preset]: { ...state.presets[preset], ...data },
          },
        })),
    }),
    {
      name: "sell-sniper-settings",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
