import { create } from "zustand";
import { BuySniperPresetData } from "@/apis/rest/settings/settings";
import { PresetId, PresetKey } from "@/types/preset";
import { createJSONStorage, persist } from "zustand/middleware";

export type SnipeBuyAmount = {
  order: number;
  amount: number;
};

type BuySniperState = {
  activePreset: PresetKey;
  presets: Record<PresetKey, BuySniperPresetData>;
  setPresets: (presets: Record<PresetKey, BuySniperPresetData>) => void;
  setActivePreset: (preset: PresetKey) => void;
  updatePreset: (preset: PresetKey, data: Partial<BuySniperPresetData>) => void;
};

export const useBuySniperSettingsStore = create<BuySniperState>()(
  persist(
    (set) => ({
      activePreset: "preset1",
      presets: {} as Record<PresetKey, BuySniperPresetData>,
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
      name: "buy-sniper-settings",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
