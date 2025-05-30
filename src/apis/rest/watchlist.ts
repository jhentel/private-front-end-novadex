import axios from "@/libraries/axios";
import { getBaseURLBasedOnRegion } from "@/utils/getBaseURLBasedOnRegion";
import { AxiosError } from "axios";

export interface WatchlistResponse {
  success: boolean;
  data?: WatchlistToken[];
  message?: string;
}

export interface WatchlistToken {
  mint: string;
  symbol: string;
  marketCap: number;
  image: string;
  pnl: number;
}

const API_BASE_URL = getBaseURLBasedOnRegion("/watchlist");
export async function fetchWatchlist(): Promise<WatchlistToken[]> {
  try {
    const response = await axios.get<WatchlistResponse>(API_BASE_URL);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error("Failed to fetch watchlist");
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch all Watchlist",
      );
    }
    throw new Error("Failed to fetch Watchlist");
  }
}

export async function addToWatchlist(mint: string): Promise<WatchlistResponse> {
  try {
    const response = await axios.post<WatchlistResponse>(API_BASE_URL, {
      mint,
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to add token Watchlist",
      );
    }
    throw new Error("Failed to add token Watchlist");
  }
}

export async function removeFromWatchlist(
  mint: string,
): Promise<WatchlistResponse> {
  try {
    const API_BASE_URL_WITH_MINT = getBaseURLBasedOnRegion(
      `/watchlist/${mint}`,
    );
    const response = await axios.delete<WatchlistResponse>(
      API_BASE_URL_WITH_MINT,
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to remove token from Watchlist",
      );
    }
    throw new Error("Failed to remove token Watchlist");
  }
}
