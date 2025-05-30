import { create } from "zustand";
import { persist } from "zustand/middleware";

const SOUNDS = ["none", "Ping", "Ding", "Blink"] as const;
export type SoundType = (typeof SOUNDS)[number];

interface CosmoSoundState {
  newlyCreatedSound: SoundType;
  aboutToGraduateSound: SoundType;
  graduatedSound: SoundType;
  setNewlyCreatedSound: (sound: SoundType) => void;
  setAboutToGraduateSound: (sound: SoundType) => void;
  setGraduatedSound: (sound: SoundType) => void;
}

export const useCosmoSoundStore = create<CosmoSoundState>()(
  persist(
    (set) => ({
      newlyCreatedSound: "none",
      aboutToGraduateSound: "none",
      graduatedSound: "none",
      setNewlyCreatedSound: (sound) => set({ newlyCreatedSound: sound }),
      setAboutToGraduateSound: (sound) => set({ aboutToGraduateSound: sound }),
      setGraduatedSound: (sound) => set({ graduatedSound: sound }),
    }),
    {
      name: "cosmo-sound-storage",
    },
  ),
);
