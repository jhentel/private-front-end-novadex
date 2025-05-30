import { create } from "zustand";
import { LimitOrderPresetData } from "@/apis/rest/settings/settings";
import { PresetId, PresetKey } from "@/types/preset";

type LimitOrderState = {
  activePreset: PresetKey;
  presets: Record<PresetKey, LimitOrderPresetData>;
  setPresets: (presets: Record<PresetKey, LimitOrderPresetData>) => void;
  setActivePreset: (preset: PresetKey) => void;
};

export const useLimitOrderSettingsStore = create<LimitOrderState>((set) => ({
  activePreset: "preset1",
  presets: {} as Record<PresetKey, LimitOrderPresetData>,
  setPresets: (presets) => set({ presets }),
  setActivePreset: (preset) => set({ activePreset: preset }),
}));
