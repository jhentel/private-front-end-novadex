import { create } from "zustand";
import { CopyTradePresetData } from "@/apis/rest/settings/settings";
import { PresetId, PresetKey } from "@/types/preset";

type CopyTradeState = {
  activePreset: PresetKey;
  presets: Record<PresetKey, CopyTradePresetData>;
  setPresets: (presets: Record<PresetKey, CopyTradePresetData>) => void;
  setActivePreset: (preset: PresetKey) => void;
};

export const useCopyTradeSettingsStore = create<CopyTradeState>((set) => ({
  activePreset: "preset1",
  presets: {} as Record<PresetKey, CopyTradePresetData>,
  setPresets: (presets) => set({ presets }),
  setActivePreset: (preset) => set({ activePreset: preset }),
}));
