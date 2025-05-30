import { create } from "zustand";
import { TSMonitorMessageType } from "@/types/ws-general";
import { TSAccount } from "@/apis/rest/ts-monitor";

type TSMonitorState = {
  isLoading: boolean;
  isRenewing: boolean;
  messages: TSMonitorMessageType[];
  accounts: TSAccount[];
  websocketRef: WebSocket | null;
  setIsLoading: (state: boolean) => void;
  setIsRenewing: (state: boolean) => void;
  setMessages: (newMessages: TSMonitorMessageType) => void;
  setAccounts: (newAccounts: TSAccount[]) => void;
  setWebsocketRef: (ws: WebSocket | null) => void;
};

export const useTSMonitorMessageStore = create<TSMonitorState>()(
  (set) => ({
    isLoading: true,
    isRenewing: false,
    messages: [],
    accounts: [],
    websocketRef: null,
    setIsLoading: (newState) => set(() => ({ isLoading: newState })),
    setIsRenewing: (newState) => set(() => ({ isRenewing: newState })),
    setMessages: (newMessage) =>
      set((state) => {
        return state.messages.some(
          (msg) => msg.id === newMessage.id,
        )
          ? { messages: state.messages }
          : { messages: [...state.messages, newMessage] };
      }),
    setAccounts: (newAccounts) => set(() => ({ accounts: newAccounts })),
    setWebsocketRef: (ws) =>
      set(() => {
        if (ws === null) {
          set((state) => {
            if (state.websocketRef) {
              state.websocketRef.onclose = null;
              state.websocketRef.onerror = null;
              state.websocketRef.onmessage = null;
              state.websocketRef.onopen = null;
              state.websocketRef.close();
            }
            return {};
          });
        }
        return ws === null
          ? {
              websocketRef: null,
            }
          : { websocketRef: ws };
      }),
  }),
);
