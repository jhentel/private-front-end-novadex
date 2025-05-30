import { create } from "zustand";
import { TwitterMonitorMessageType } from "@/types/ws-general";
import { TwitterAccount } from "@/apis/rest/twitter-monitor";

type TwitterMonitorState = {
  isLoading: boolean;
  isRenewing: boolean;
  messages: TwitterMonitorMessageType[];
  accounts: TwitterAccount[];
  websocketRef: WebSocket | null;
  setIsLoading: (state: boolean) => void;
  setIsRenewing: (state: boolean) => void;
  setMessages: (newMessages: TwitterMonitorMessageType) => void;
  setAccounts: (newAccounts: TwitterAccount[]) => void;
  setWebsocketRef: (ws: WebSocket | null) => void;
};

export const useTwitterMonitorMessageStore = create<TwitterMonitorState>()(
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
        const newMessages = state.messages.some(
          (msg) => msg.id === newMessage.id,
        )
          ? { messages: state.messages }
          : { messages: [...state.messages, newMessage] };
        // console.log("TW - MESSAGES ✨", newMessages?.messages);

        return newMessages;
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
