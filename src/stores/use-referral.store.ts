import { create } from "zustand";
import { ReferralData } from "@/apis/rest/referral";

type ReferralState = {
  referralData: ReferralData | null;
  setReferralData: (data: ReferralData) => void;
  claimedTransactions: Record<string, string>;
  setClaimedTransaction: (id: string, transactionUrl: string) => void;
  isFetching: boolean;
  setIsFetching: (isFetching: boolean) => void;
  cleanup: () => void;
};

export const useReferralStore = create<ReferralState>()((set) => ({
  referralData: null,
  claimedTransactions: {},
  isFetching: true,
  setReferralData: (data) => set({ referralData: data }),
  setIsFetching: (isFetching: boolean) => set({ isFetching }),
  setClaimedTransaction: (id, transactionUrl) =>
    set((state) => ({
      claimedTransactions: {
        ...state.claimedTransactions,
        [id]: transactionUrl,
      },
    })),
  cleanup: () =>
    set(() => ({
      referralData: null,
      claimedTransactions: {},
      isFetching: true,
    })),
}));
