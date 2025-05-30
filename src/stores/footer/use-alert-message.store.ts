import { Alert } from "@/types/alerts";
import { create } from "zustand";

type AlertMessageState = {
  messages: Alert[];
  setMessages: (newMessages: Alert[]) => void;
  isInitialFetched: boolean;
  setIsInitialFetched: (isFetched: boolean) => void;
};

export const useAlertMessageStore = create<AlertMessageState>()((set) => ({
  messages: [],
  setMessages: (newMessages) =>
    set((state) => ({ messages: [...newMessages, ...state.messages] })),
  isInitialFetched: false,
  setIsInitialFetched: (isFetched) => set({ isInitialFetched: isFetched }),
}));
