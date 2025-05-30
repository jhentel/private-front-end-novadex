import { create } from "zustand";

type TwitterMonitorModalFullscreenState = {
  twitterMonitorModalFullscreen: boolean;
  modalDimensions: {
    width: number;
    height: number;
  };
  setTwitterMonitorModalFullscreen: (newState: boolean) => void;
  setModalDimensions: (dimensions: { width: number; height: number }) => void;
};

export const useTwitterMonitorModalFullscreenStore =
  create<TwitterMonitorModalFullscreenState>()((set) => ({
    twitterMonitorModalFullscreen: false,
    modalDimensions: {
      width: 375,
      height: 500,
    },
    setTwitterMonitorModalFullscreen: (newState) =>
      set(() => ({ twitterMonitorModalFullscreen: newState })),
    setModalDimensions: (dimensions) =>
      set(() => ({ modalDimensions: dimensions })),
  }));
