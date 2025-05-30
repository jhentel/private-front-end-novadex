import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type LastInputAmountState = {
  type: "%" | "SOL";
  setType: (newMessages: "%" | "SOL") => void;
};

export const useLastInputAmountStore = create<LastInputAmountState>()(
  persist(
    (set) => ({
      type: "%",
      setType: (newMessages) =>
        set((state) => ({
          ...state,
          type: newMessages,
        })),
    }),
    {
      name: "last-input-amount",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
