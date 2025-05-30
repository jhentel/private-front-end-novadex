import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Wallet } from "@/apis/rest/wallet-manager";

type QuickAmountState = {
  cosmoQuickBuyAmount: number;
  cosmoQuickBuyAmountDisplay: string;
  holdingQuickSellAmount: number;
  holdingQuickType: "%" | "SOL";
  cosmoWallets: Wallet[];
  setCosmoWallets: (walletList: Wallet[]) => void;
  setCosmoQuickBuyAmount: (newQuickBuyAmount: number) => void;
  setCosmoQuickBuyAmountDisplay: (newQuickBuyAmount: string) => void;
  setHoldingQuickSellAmount: (newQuickSellPercentage: number) => void;
  setHoldingQuickType: (newQuickSellType: "%" | "SOL") => void;
};

export const useQuickAmountStore = create<QuickAmountState>()(
  persist(
    (set, get) => ({
      cosmoQuickBuyAmount: 0.0001,
      cosmoQuickBuyAmountDisplay: "0.0001",
      holdingQuickSellAmount: 10,
      holdingQuickType: "%",
      cosmoWallets: [] as Wallet[],
      twitterWallets: [] as Wallet[],
      setCosmoWallets: (walletList: Wallet[]) => {
        set(() => ({
          cosmoWallets: [...walletList],
        }));
      },
      setCosmoQuickBuyAmount: (newQuickBuyAmount) =>
        set(() => ({ cosmoQuickBuyAmount: newQuickBuyAmount })),
      setCosmoQuickBuyAmountDisplay: (newQuickBuyAmount) =>
        set(() => ({ cosmoQuickBuyAmountDisplay: newQuickBuyAmount })),
      setHoldingQuickSellAmount: (newQuickSellPercentage) =>
        set(() => ({ holdingQuickSellAmount: newQuickSellPercentage })),
      setHoldingQuickType: (newQuickSellType) =>
        set(() => ({ holdingQuickType: newQuickSellType })),
    }),
    {
      name: "quick-buy-amount",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
