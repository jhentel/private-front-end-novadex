import { WatchlistToken } from "@/apis/rest/watchlist";
import { create } from "zustand";

type WatchlistTokenState = {
  watchlistToken: WatchlistToken[];
  oldestTokenMint: string;
  setOldestTokenMint: (mint: string) => void;
  setWatchlistToken: (watchlistToken: WatchlistToken[]) => void;
  addToWatchlistToken: (watchlistTokenData: WatchlistToken) => void;
  removeFromWatchlistToken: (tokenMint: string) => void;
};

export const useWatchlistTokenStore = create<WatchlistTokenState>()((set) => ({
  watchlistToken: [],
  oldestTokenMint: "",
  setOldestTokenMint: (mint: string) => set({ oldestTokenMint: mint }),
  setWatchlistToken: (watchlistToken) => set({ watchlistToken }),
  addToWatchlistToken: (watchlistTokenData) =>
    set((state) => ({
      watchlistToken: [
        ...[watchlistTokenData, ...state.watchlistToken].slice(0, 10),
      ],
    })),
  removeFromWatchlistToken: (tokenMint) =>
    set((state) => {
      const updatedList = state.watchlistToken.filter(
        (item) => item.mint !== tokenMint,
      );

      return { watchlistToken: updatedList };
    }),
}));
