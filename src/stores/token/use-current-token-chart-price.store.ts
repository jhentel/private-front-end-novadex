import { create } from "zustand";

type CurrentTokenChartPriceState = {
  price: string;
  priceUsd: string;
  supply: string;
  setCurrentTokenChartPrice: (price: string) => void;
  setCurrentTokenChartPriceUsd: (priceUsd: string) => void;
  setCurrentTokenChartSupply: (supply: string) => void;
  cleanup: () => void;
};

export const useCurrentTokenChartPriceStore =
  create<CurrentTokenChartPriceState>()((set) => ({
    price: "",
    priceUsd: "",
    supply: "",
    setCurrentTokenChartPrice: (price) =>
      set(() => ({
        price: price,
      })),
    setCurrentTokenChartPriceUsd: (priceUsd) =>
      set(() => ({
        priceUsd: priceUsd,
      })),
    setCurrentTokenChartSupply: (supply) =>
      set(() => ({
        supply: supply,
      })),
    cleanup: () =>
      set(() => ({
        price: "",
        priceUsd: "",
        supply: "",
      })),
  }));
