import { TrackedWallet, WalletTracker } from "@/apis/rest/wallet-tracker";
import { create } from "zustand";
import { deduplicateAndPrioritizeLatestData_WalletTracker } from "@/helpers/deduplicateAndPrioritizeLatestData";

type WalletTrackerMessageState = {
  messages: WalletTracker[];
  messagesPaused: WalletTracker[];
  currentSingleSelectedAddress: string;
  setMessages: (
    newMessages: WalletTracker[] | WalletTracker,
    type?: "add" | "replace",
  ) => void;
  setMessagesPaused: (newMessages: WalletTracker[] | WalletTracker) => void;
  setInitMessages: (newMessages: WalletTracker[] | WalletTracker) => void;
  setCurrentSingleSelectedAddress: (address: string) => void;
  trackedWallets: TrackedWallet[];
  setTrackedWallets: (newTrackedWallets: TrackedWallet[]) => void;
  isExistingTx: (mint: string) => boolean;
};

export const useWalletTrackerMessageStore = create<WalletTrackerMessageState>()(
  (set, get) => ({
    messages: [],
    messagesPaused: [],
    currentSingleSelectedAddress: "",
    setMessagesPaused: (newMessages) =>
      set((state) => ({
        messagesPaused: [
          ...deduplicateAndPrioritizeLatestData_WalletTracker([
            ...(Array.isArray(newMessages) ? newMessages : [newMessages]),
            ...state.messagesPaused,
          ]),
        ],
      })),
    setMessages: (newMessages, type = "add") =>
      set((state) => {
        if (type === "add") {
          return {
            messages: [
              ...deduplicateAndPrioritizeLatestData_WalletTracker([
                ...(Array.isArray(newMessages) ? newMessages : [newMessages]),
                ...state.messages,
              ]),
            ].slice(0, 100),
          };
        } else {
          return {
            messages: deduplicateAndPrioritizeLatestData_WalletTracker(
              Array.isArray(newMessages) ? newMessages : [newMessages],
            ),
          };
        }
      }),
    setInitMessages: (newMessages) =>
      set({
        messages: Array.isArray(newMessages) ? newMessages : [newMessages],
      }),
    setCurrentSingleSelectedAddress: (address) =>
      set({
        currentSingleSelectedAddress: address,
      }),
    trackedWallets: [],
    setTrackedWallets: (newTrackedWallets) =>
      set((state) => ({
        ...state,
        trackedWallets: newTrackedWallets,
      })),
    isExistingTx: (mint: string) => {
      return get().messages.some((tx: WalletTracker) => tx.mint === mint);
    },
  }),
);
