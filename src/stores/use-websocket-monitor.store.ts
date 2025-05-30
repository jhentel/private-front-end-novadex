import { create } from "zustand";

type WebsocketError = {
  message: string;
  code?: number;
  timestamp: Date;
};

type WebsocketState = {
  lastMessageTimestamp: Date | null;
  lastMessage: string[];
  lastPingTimestamp: Date | null;
  connectedTimestamp: Date | null;
  status:
    | "connecting"
    | "connected"
    | "closing"
    | "disconnected"
    | "reconnecting"
    | "unknown";
  retryCount: number;
  reconnectCount: number;
  error: WebsocketError[];
};

export type WebsocketName =
  | "alerts"
  | "solanaPrice"
  | "holdings"
  | "footer"
  | "sniper"
  | "walletBalances"
  | "notifications"
  | "tracker"
  | "transactions"
  | "cosmo2"
  | "trending"
  | "chartHoldings"
  | "chartPrice"
  | "mint"
  | "watchlist"
;

export const websocketNames: WebsocketName[] = [
  "alerts",
  "solanaPrice",
  "holdings",
  "footer",
  "sniper",
  "walletBalances",
  "notifications",
  "watchlist",
  "tracker",
  "transactions",
  "cosmo2",
  "trending",
  "chartHoldings",
  "chartPrice",
  "mint",
];

const defaultWebsocketState: WebsocketState = {
  lastPingTimestamp: null,
  lastMessage: [],
  lastMessageTimestamp: null,
  connectedTimestamp: null,
  status: "unknown",
  retryCount: 0,
  reconnectCount: 0,
  error: [],
};

type WebsocketStore = {
  [key in WebsocketName]: WebsocketState;
} & {
  setWebsocketState: (
    name: WebsocketName,
    state: Partial<WebsocketState>,
  ) => void;
  setAllWebsocketState: (state: Partial<WebsocketState>) => void;
  resetWebsocketState: (name: WebsocketName) => void;
  resetAllWebsocketStates: () => void;
  addError: (name: WebsocketName, error: WebsocketError) => void;
  clearErrors: (name: WebsocketName) => void;
  clearAllErrors: () => void;
  updateLastMessageTimestamp: (name: WebsocketName, timestamp: Date) => void;
  updateConnectedTimestamp: (name: WebsocketName, timestamp: Date) => void;
  addLastMessage: (
    name: WebsocketName,
    message: string,
    timestamp: Date,
  ) => void;
  updatePingTimestamp: (name: WebsocketName, timestamp: Date) => void;
};

export const useWebsocketMonitor = create<WebsocketStore>((set) => {
  // Initialize all websocket states with default
  const initialState = Object.fromEntries(
    websocketNames.map((name) => [name, { ...defaultWebsocketState }]),
  ) as Pick<WebsocketStore, WebsocketName>;

  return {
    ...initialState,

    setWebsocketState: (name, state) =>
      set((prev) => ({
        [name]: {
          ...prev[name],
          ...state,
        },
      })),

    setAllWebsocketState: (state) =>
      set((prev) => {
        const updatedStates = Object.fromEntries(
          (Object.keys(prev) as WebsocketName[]).map((name) => [
            name,
            {
              ...prev[name],
              ...state,
            },
          ]),
        );
        return updatedStates;
      }),

    addLastMessage: (name: WebsocketName, message: string, timestamp: Date) =>
      set((prev) => {
        const messages = [
          ...(Array.isArray(prev[name].lastMessage)
            ? prev[name].lastMessage
            : []),
          message,
        ].slice(-3);

        return {
          [name]: {
            ...prev[name],
            lastMessage: messages,
            lastMessageTimestamp: timestamp,
          },
        };
      }),

    resetWebsocketState: (name) =>
      set(() => ({
        [name]: { ...defaultWebsocketState },
      })),

    resetAllWebsocketStates: () =>
      set(() => {
        const resetStates = Object.fromEntries(
          (Object.keys(initialState) as WebsocketName[]).map((name) => [
            name,
            { ...defaultWebsocketState },
          ]),
        );
        return resetStates;
      }),

    addError: (name, error) =>
      set((prev) => {
        const prevState = prev[name] ?? { ...defaultWebsocketState };
        const prevErrors = Array.isArray(prevState.error)
          ? prevState.error
          : [];
        const errors = [...prevErrors, error].slice(-3);

        return {
          [name]: {
            ...prevState,
            error: errors,
          },
        };
      }),

    clearErrors: (name) =>
      set((prev) => ({
        [name]: {
          ...prev[name],
          error: [],
        },
      })),

    clearAllErrors: () =>
      set((prev) => {
        const cleared = Object.fromEntries(
          (Object.keys(initialState) as WebsocketName[]).map((name) => [
            name,
            { ...prev[name], error: [] },
          ]),
        );
        return cleared;
      }),

    updateLastMessageTimestamp: (name, timestamp) =>
      set((prev) => ({
        [name]: {
          ...prev[name],
          lastMessageTimestamp: timestamp,
        },
      })),

    updatePingTimestamp: (name, timestamp) =>
      set((prev) => ({
        [name]: {
          ...prev[name],
          lastPingTimestamp: timestamp,
        },
      })),

    updateConnectedTimestamp: (name, timestamp) =>
      set((prev) => ({
        [name]: {
          ...prev[name],
          connectedTimestamp: timestamp,
        },
      })),
  };
});
