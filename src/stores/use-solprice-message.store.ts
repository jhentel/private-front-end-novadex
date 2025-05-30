import { create } from "zustand";

export type SolPrice = {
  price: number;
};

type SolPriceMessageState = {
  messages: SolPrice;
  setMessages: (newMessages: SolPrice) => void;
};

export const useSolPriceMessageStore = create<SolPriceMessageState>()(
  (set) => ({
    messages: { price: 0 },
    setMessages: (newMessages) =>
      set((state) => ({
        ...state,
        messages: newMessages,
      })),
  }),
);
