import { QuickPresetData } from "@/apis/rest/settings/settings";
import { create } from "zustand";
import { PresetId, PresetKey } from "@/types/preset";

export type QuickSellAmount = {
  order: number;
  amount: number;
};

type Presets = Record<PresetKey, QuickPresetData>;
type QuickSellState = {
  activePreset: PresetKey;
  presets: Presets;
  presetChangedCount: number;
  setPresets: (presets: Presets) => void;
  setActivePreset: (preset: PresetKey) => void;
  updatePreset: (preset: PresetKey, data: Partial<QuickPresetData>) => void;
};

export const useQuickSellSettingsStore = create<QuickSellState>((set) => ({
  activePreset: "preset1",
  presetChangedCount: 0,
  presets: {} as Presets,
  setPresets: (presets) => set({ presets }),
  setActivePreset: (preset) => set({ activePreset: preset }),
  updatePreset: (preset, data) =>
    set((state) => ({
      presets: {
        ...state.presets,
        [preset]: { ...state.presets[preset], ...data },
      },
      presetChangedCount:
        state.presetChangedCount < 10 ? state.presetChangedCount + 1 : 0,
    })),
}));
