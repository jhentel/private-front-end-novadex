import { PresetId, PresetKey } from "@/types/preset";

export const convertPresetKeyToId = (key: string) =>
  `N${key.replace("preset", "")}` as PresetId;
export const convertPresetIdToKey = (id: string) =>
  `preset${id.replace("N", "")}` as PresetKey;
export const convertPresetKeyToNumber = (key: string) =>
  parseInt(key.replace("preset", ""));
export const convertNumberToPresetId = (number: number) =>
  `N${number}` as PresetId;
export const convertNumberToPresetKey = (number: number) =>
  `preset${number}` as PresetKey;
export const convertPresetIdToNumber = (id: string) =>
  parseInt(id.replace("N", ""));
