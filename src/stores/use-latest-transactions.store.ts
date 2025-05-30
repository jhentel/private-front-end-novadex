import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type LatestTransaction = {
  mint: string;
  wallet: string;
  balance: number;
  balanceStr: string;
  timestamp: number;
};

type LatestTransactionMessageState = {
  messages: LatestTransaction[];
  setMessage: (newMessage: LatestTransaction) => void;
  resetMessages: () => void;
};

export const useLatestTransactionMessageStore =
  create<LatestTransactionMessageState>()(
    persist(
      (set) => ({
        messages: [],
        setMessage: (newMessage) =>
          set((state) => {
            const filtered = state.messages.filter(
              (msg) => msg.mint !== newMessage.mint,
            );
            const updatedMessages = [...filtered, newMessage];
            const latestTen = updatedMessages.slice(-10);
            return { messages: latestTen };
          }),
        resetMessages: () =>
          set((state) => {
            console.warn("BALANCE ✨ - RESET 🔴", state.messages);
            return { messages: [] };
          }),
      }),
      {
        name: "latest-transactions",
        storage: createJSONStorage(() => localStorage),
      },
    ),
  );
