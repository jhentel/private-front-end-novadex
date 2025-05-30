// stores/token/use-pnl-modal-store.ts
import { create } from "zustand";
import { ChartTraderInfo, TokenInfo } from "@/types/ws-general";

type PnLModalState = {
  isOpen: boolean;
  traderId: string | null;
  traderData: ChartTraderInfo | null;
  tokenData: TokenInfo | null;
  finalPrice: number | null;
  remainingSol: number | null;
  remainingUsd: number | null;
  // Add this to mirror your component props
  profitAndLoss: number | null;
  profitAndLossUsd: number | null;
  profitAndLossPercentage: number | null;
  invested: number | null;
  investedD: number | null;
  sold: number | null;
  soldD: number | null;
  openModal: (
    traderId: string,
    traderData: ChartTraderInfo,
    tokenData: TokenInfo | null,
    finalPrice: number,
    remainingSol: number,
    remainingUsd: number,
    profitAndLoss: number,
    profitAndLossUsd: number,
    profitAndLossPercentage: number,
    invested: number,
    investedD: number,
    sold: number,
    soldD: number,
  ) => void;
  closeModal: () => void;
  cleanup: () => void;
};

export const usePnLModalStore = create<PnLModalState>((set) => ({
  isOpen: false,
  traderId: null,
  traderData: null,
  tokenData: null,
  finalPrice: null,
  remainingSol: null,
  remainingUsd: null,
  profitAndLoss: null,
  profitAndLossUsd: null,
  profitAndLossPercentage: null,
  invested: null,
  investedD: null,
  sold: null,
  soldD: null,
  openModal: (
    traderId,
    traderData,
    tokenData,
    finalPrice,
    remainingSol,
    remainingUsd,
    profitAndLoss,
    profitAndLossUsd,
    profitAndLossPercentage,
    invested,
    investedD,
    sold,
    soldD,
  ) =>
    set({
      isOpen: true,
      traderId,
      traderData,
      tokenData,
      finalPrice,
      remainingSol,
      remainingUsd,
      profitAndLoss,
      profitAndLossUsd,
      profitAndLossPercentage,
      invested,
      investedD,
      sold,
      soldD,
    }),
  closeModal: () =>
    set({
      isOpen: false,
    }),
  cleanup: () =>
    set({
      traderId: null,
      traderData: null,
      tokenData: null,
      finalPrice: null,
      remainingSol: null,
      remainingUsd: null,
      profitAndLoss: null,
      profitAndLossUsd: null,
      profitAndLossPercentage: null,
      invested: null,
      investedD: null,
      sold: null,
      soldD: null,
    }),
}));
