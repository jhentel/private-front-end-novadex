import { create } from "zustand";

type AFKStatusState = {
  raydiumStatus: boolean;
  pumpFunStatus: boolean;
  moonshotStatus: boolean;
  meteoraStatus: boolean;
  setRaydiumStatus: (newStatus: boolean) => void;
  setPumpFunStatus: (newStatus: boolean) => void;
  setMoonshotStatus: (newStatus: boolean) => void;
  setMeteoraStatus: (newStatus: boolean) => void;
};

export const useAFKStatusStore = create<AFKStatusState>()((set) => ({
  raydiumStatus: false,
  pumpFunStatus: false,
  moonshotStatus: false,
  meteoraStatus: false,
  setRaydiumStatus: (newStatus) => set(() => ({ raydiumStatus: newStatus })),
  setPumpFunStatus: (newStatus) => set(() => ({ pumpFunStatus: newStatus })),
  setMoonshotStatus: (newStatus) => set(() => ({ moonshotStatus: newStatus })),
  setMeteoraStatus: (newStatus) => set(() => ({ meteoraStatus: newStatus })),
}));
