import { create } from "zustand";

interface ServerTimeState {
  serverTime: number;
  timeOffset: number;
  setServerTime: (time: number) => void;
  setTimeOffset: (offset: number) => void;
  getCurrentServerTime: () => number;
}

export const useServerTimeStore = create<ServerTimeState>((set, get) => ({
  serverTime: 0,
  timeOffset: 0,
  setServerTime: (time: number) => set({ serverTime: time }),
  setTimeOffset: (offset: number) => set({ timeOffset: offset }),
  getCurrentServerTime: () => {
    const { timeOffset } = get();
    return Date.now() + timeOffset;
  },
}));
