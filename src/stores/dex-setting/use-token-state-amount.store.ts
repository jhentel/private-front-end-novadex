import { create } from "zustand";
import { persist } from "zustand/middleware";

type TokenState = "newlyCreated" | "aboutToGraduate" | "graduated";

interface TokenStateAmountState {
  amounts: Record<TokenState, number>;
  getAmount: (state: TokenState) => number;
  setAmount: (state: TokenState, amount: number) => void;
}

export const useTokenStateAmountStore = create<TokenStateAmountState>()(
  persist(
    (set, get) => ({
      amounts: {
        newlyCreated: 0.001,
        aboutToGraduate: 0.0001,
        graduated: 0.0001,
      },
      getAmount: (state: TokenState) => get().amounts[state],
      setAmount: (tokenState: TokenState, amount: number) =>
        set((state) => {
          // Only update if the value is different
          if (state.amounts[tokenState] === amount) {
            return state;
          }
          return {
            amounts: {
              ...state.amounts,
              [tokenState]: amount,
            },
          };
        }),
    }),
    {
      name: "token-state-amount-storage",
    },
  ),
);

// Add selectors for individual state values
export const useNewlyCreatedAmount = () =>
  useTokenStateAmountStore((state) => state.amounts.newlyCreated);

export const useAboutToGraduateAmount = () =>
  useTokenStateAmountStore((state) => state.amounts.aboutToGraduate);

export const useGraduatedAmount = () =>
  useTokenStateAmountStore((state) => state.amounts.graduated);
