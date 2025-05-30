import { HoldingsConvertedMessageType } from "@/types/ws-general";
import { create } from "zustand";
import { Trade } from "@/types/nova_tv.types";

type TokenHoldingState = {
  messages: HoldingsConvertedMessageType[];
  setMessage: (m: HoldingsConvertedMessageType) => void;
  setMessages: (m: HoldingsConvertedMessageType[]) => void;
  messageCount: number;
  userTrades: Trade[];
  setUserTrades: (trades: Trade[]) => void;
  lastTimestamp: number;
  setLastTimestamp: (timestamp: number) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  cleanup: () => void;
};

export const useTokenHoldingStore = create<TokenHoldingState>()((set) => ({
  messages: [] as HoldingsConvertedMessageType[],
  messageCount: 0,
  setMessage: (m) => {
    return set((state) => {
      return {
        ...state,
        messages: state.messages.some((msg) => msg.wallet === m.wallet)
          ? state.messages.map((msg) => (msg.wallet === m.wallet ? m : msg))
          : [...state.messages, m],
        messageCount: state.messageCount < 10 ? state.messageCount + 1 : 0,
      };
    });
  },
  setMessages: (m) => {
    return set((state) => {
      if (Array.isArray(m)) {
        return {
          ...state,
          messages: m,
        };
      }
      return state;
    });
  },
  userTrades: [],
  setUserTrades: (trades) => set({ userTrades: trades }),
  lastTimestamp: 0,
  setLastTimestamp: (timestamp) => set({ lastTimestamp: timestamp }),
  isLoading: true,
  setIsLoading: (loading) => set({ isLoading: loading }),
  cleanup: () =>
    set(() => ({
      messages: [],
      messageCount: 0,
      userTrades: [],
      lastTimestamp: 0,
      isLoading: false,
    })),
}));
