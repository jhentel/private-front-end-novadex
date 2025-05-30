import { create } from "zustand";
import { deduplicateAndPrioritizeLatestData_TransactionWS } from "@/helpers/deduplicateAndPrioritizeLatestData";
import {
  TokenInfo,
  TransactionInfo,
  PriceInfo,
  VolumeInfo,
  DataSecurityInfo,
  ChartHolderInfo,
  ChartTraderInfo,
  DeveloperToken,
} from "@/types/ws-general";

const TRANSACTION_LIMIT = 100;
const CHART_HOLDERS_LIMIT = 50;
const CHART_TRADERS_LIMIT = 50;

type TokenMessageState = {
  WSMintRef: WebSocket | null;
  setWSMintRef: (ws: WebSocket | null) => void;
  WSHoldingRef: WebSocket | null;
  setWSHoldingRef: (ws: WebSocket | null) => void;
  tokenInfoMessage: TokenInfo;
  transactionMessages: TransactionInfo[];
  transectionMessagesChangedCount: number;
  priceMessage: PriceInfo;
  volumeMessage: VolumeInfo;
  dataSecurityMessage: DataSecurityInfo;
  chartHolderMessages: ChartHolderInfo[];
  totalHolderMessages: number;
  chartTraderMessages: ChartTraderInfo[];
  timestamp: number;
  developerTokens: DeveloperToken[];
  setTokenInfoMessage: (newMessage: TokenInfo) => void;
  setInitTransactionMessages: (init: TransactionInfo[]) => void;
  setTransactionMessages: (
    newMessage: TransactionInfo | TransactionInfo[],
  ) => void;
  setPriceMessage: (newMessage: PriceInfo) => void;
  setVolumeMessage: (newMessage: VolumeInfo) => void;
  setDataSecurityMessage: (newMessage: DataSecurityInfo) => void;
  setChartHolderMessages: (newMessages: ChartHolderInfo[]) => void;
  setTotalHolderMessages: (newMessages: number) => void;
  setChartTraderMessages: (newMessages: ChartTraderInfo[]) => void;
  setTimestamp: (newMessage: number) => void;
  setDeveloperTokens: (tokens: DeveloperToken[]) => void;
  cleanup: () => void;
};

export const useTokenMessageStore = create<TokenMessageState>()((set) => ({
  WSMintRef: null,
  setWSMintRef: (ws) => {
    if (ws === null) {
      set((state) => {
        if (state.WSMintRef) {
          state.WSMintRef.onclose = null;
          state.WSMintRef.onerror = null;
          state.WSMintRef.onmessage = null;
          state.WSMintRef.onopen = null;
          state.WSMintRef.close();
        }
        return { WSMintRef: null };
      });
    } else {
      set(() => ({ WSMintRef: ws }));
    }
  },
  WSHoldingRef: null,
  setWSHoldingRef: (ws) => {
    if (ws === null) {
      set((state) => {
        if (state.WSHoldingRef) {
          state.WSHoldingRef.onclose = null;
          state.WSHoldingRef.onerror = null;
          state.WSHoldingRef.onmessage = null;
          state.WSHoldingRef.onopen = null;
          state.WSHoldingRef.close();
        }
        return { WSHoldingRef: null };
      });
    } else {
      set(() => ({ WSHoldingRef: ws }));
    }
  },
  tokenInfoMessage: {} as TokenInfo,
  transactionMessages: [],
  transectionMessagesChangedCount: 0,
  priceMessage: {} as PriceInfo,
  volumeMessage: {} as VolumeInfo,
  dataSecurityMessage: {} as DataSecurityInfo,
  chartHolderMessages: [],
  totalHolderMessages: 0,
  chartTraderMessages: [],
  timestamp: 0,
  developerTokens: [],
  setTokenInfoMessage: (newMessage) =>
    set(() => ({ tokenInfoMessage: newMessage })),
  setInitTransactionMessages: (init) =>
    set(() => ({ transactionMessages: init.slice(0, TRANSACTION_LIMIT) })),
  setTransactionMessages: (newMessage) =>
    set((state) => {
      const messages = Array.isArray(newMessage) ? newMessage : [newMessage];
      const updatedMessages = deduplicateAndPrioritizeLatestData_TransactionWS([
        ...messages,
        ...state.transactionMessages,
      ]);
      return {
        transactionMessages: updatedMessages.slice(0, TRANSACTION_LIMIT),
        transectionMessagesChangedCount:
          state.transectionMessagesChangedCount + 1,
      };
    }),
  setPriceMessage: (newMessage) => set(() => ({ priceMessage: newMessage })),
  setVolumeMessage: (newMessage) => set(() => ({ volumeMessage: newMessage })),
  setDataSecurityMessage: (newMessage) =>
    set(() => ({ dataSecurityMessage: newMessage })),
  setChartHolderMessages: (newMessages) =>
    set(() => ({
      chartHolderMessages: newMessages.slice(-CHART_HOLDERS_LIMIT),
    })),
  setTotalHolderMessages: (newMessages) =>
    set(() => ({ totalHolderMessages: newMessages })),
  setChartTraderMessages: (newMessages) =>
    set(() => ({
      chartTraderMessages: newMessages.slice(-CHART_TRADERS_LIMIT),
    })),
  setTimestamp: (newMessage) => set(() => ({ timestamp: newMessage })),
  setDeveloperTokens: (tokens) => set(() => ({ developerTokens: tokens })),
  cleanup: () =>
    set(() => ({
      tokenInfoMessage: {} as TokenInfo,
      transactionMessages: [],
      transectionMessagesChangedCount: 0,
      priceMessage: {} as PriceInfo,
      volumeMessage: {} as VolumeInfo,
      dataSecurityMessage: {} as DataSecurityInfo,
      chartHolderMessages: [],
      totalHolderMessages: 0,
      chartTraderMessages: [],
      timestamp: 0,
      developerTokens: [],
      WSMintRef: null,
      WSHoldingRef: null,
    })),
}));
