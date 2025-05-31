import { getTokenWallets, TransactionData } from "@/apis/rest/wallet-trade";
import { create } from "zustand";

interface MostProfitableTableStore {
  data: TransactionData[];
  isLoading: boolean;
  error: string | null;
  fetchData: (timeframe: string) => Promise<void>;
}

export const useMostProfitableTableStore = create<MostProfitableTableStore>(
  (set) => ({
    data: [],
    isLoading: false,
    error: null,
    fetchData: async (timeframe: string) => {
      const walletAddress = "GiwAGiwBiWZvi8Lrd7HmsfjYA6YgjJgXWR26z6ffTykJ";
      if (!walletAddress) return;

      set({ isLoading: true, error: null });
      try {
        const response = await getTokenWallets(walletAddress, timeframe as any);
        set({ data: response.data.results, isLoading: false });
      } catch (error) {
        set({ error: (error as Error).message, isLoading: false });
      }
    },
  }),
);
