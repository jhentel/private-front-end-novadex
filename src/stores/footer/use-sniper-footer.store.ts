import {
  MigrationTaskRequest,
  SniperTask,
  TokenMetadata,
} from "@/apis/rest/sniper";
import { create } from "zustand";

type UpdateSniper = {
  taskId: string;
  status: string;
  progress: string;
  progressColour: "purple" | "red" | "green";
  marketCap: number;
  solAmount: number;
  tokenAmount: number;
  isCompleted: boolean;
};

type SniperFooterState = {
  tokenInfoState: (TokenMetadata & { mint: string }) | null;
  setTokenInfoState: (
    newState: (TokenMetadata & { mint: string }) | null,
  ) => void;
  sniperState: SniperTask[];
  setSniperState: (newState: SniperTask[]) => void;
  updateSniperState: (newState: UpdateSniper) => void;
  isFetchedState: boolean;
  setIsFetchedState: (newState: boolean) => void;
};

export const useSniperFooterStore = create<SniperFooterState>()((set) => ({
  tokenInfoState: null,
  setTokenInfoState: (newState) => set(() => ({ tokenInfoState: newState })),
  sniperState: [],
  setSniperState: (newState) => set(() => ({ sniperState: newState })),
  updateSniperState: (newState) => {
    if (newState) {
      set((prev) => {
        const prevSniperState = prev.sniperState;
        const selectedSniperState = prevSniperState?.find(
          (sniper) => sniper.taskId === newState.taskId,
        );
        const updatedSelectedSniperState = {
          ...selectedSniperState,
          status: newState.status,
          progress: newState.progress,
          progressColour: newState.progressColour,
          marketCapUsd: newState.marketCap,
          amount: newState.solAmount,
          isCompleted: newState.isCompleted,
        };
        const updatedSniperState = prevSniperState.map((sniper) =>
          sniper.taskId === newState.taskId
            ? updatedSelectedSniperState
            : sniper,
        );
        return { prev, sniperState: updatedSniperState as SniperTask[] };
      });
    } else {
      set(() => ({ tokenInfoState: null }));
    }
  },
  isFetchedState: false,
  setIsFetchedState: (newState) => set(() => ({ isFetchedState: newState })),
}));
