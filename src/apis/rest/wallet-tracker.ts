import { BadgeType } from "@/components/customs/AvatarWithBadges";
import axios from "@/libraries/axios";
import { AxiosError } from "axios";
import { getBaseURLBasedOnRegion } from "../../utils/getBaseURLBasedOnRegion";
import { DEX, LAUNCHPAD } from "@/types/ws-general";

interface TokenInfo {
  name: string;
  symbol: string;
  dex: BadgeType;
  mint: string;
  supply: number;
  image: string;
  twitter: string;
  telegram: string;
  website: string;
}

export interface WalletTracker {
  timestamp: number;
  type: "buy" | "sell";
  name: string;
  symbol: string;
  image: string;
  dex: DEX;
  launchpad: LAUNCHPAD;
  mint: string;
  solAmount: string;
  tokenAmount: string;
  marketCap: string;
  price: string;
  priceUsd: string;
  walletAddress: string;
  signature: string;
  animal: "fish" | "whale" | "dolphin";
  is_sniper: boolean;
  is_developer: boolean;
  is_insider: boolean;
  transactions: number;
  twitter: string;
  telegram: string;
  website: string;
  tokenBalance: string;
  balanceNow: string;
  balanceTotal: string;
  balancePercentage: string;
  buys: number;
  sells: number;
  maker: string;
}

export interface TrackedWallet {
  emoji: string;
  name: string;
  address: string;
}

export interface WalletTrackerAlert {
  timestamp: number;
  type: string;
  name: string;
  symbol: string;
  image: string;
  dex: string;
  mint: string;
  solAmount: string;
  tokenAmount: string;
  marketCap: string;
  price: string;
  walletAddress: string;
  signature: string;
}

interface BaseResponse {
  success: boolean;
  message: string;
}

export const updateTrackedWallets = async (
  wallets: TrackedWallet[],
): Promise<BaseResponse> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/wallet-tracker/update");

  try {
    const { data } = await axios.post<BaseResponse>(API_BASE_URL, wallets, {
      withCredentials: false,
    });
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to update tracked wallets",
      );
    }
    throw new Error("Failed to update tracked wallets");
  }
};

export const getTrackedWallets = async (
  token?: string,
): Promise<TrackedWallet[]> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/wallet-tracker/wallets");

  try {
    const { data } = await axios.get<TrackedWallet[]>(API_BASE_URL, {
      withCredentials: false,
      ...(token && {
        headers: {
          "X-Nova-Session": `${token}`,
        },
      }),
    });
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch tracked wallets",
      );
    }
    throw new Error("Failed to fetch tracked wallets");
  }
};

export const getWalletTracker = async (
  token?: string,
): Promise<WalletTracker[]> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/wallet-tracker");

  try {
    const { data } = await axios.get<WalletTracker[]>(API_BASE_URL, {
      withCredentials: false,
      ...(token && {
        headers: {
          "X-Nova-Session": `${token}`,
        },
      }),
    });
    return data;
  } catch (error) {
    console.warn(error);
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch wallet tracker",
      );
    }
    throw new Error("Failed to fetch wallet tracker");
  }
};

export const getSelectedWalletTrackerTransactions = async (
  walletAddresses: string,
  token?: string,
): Promise<WalletTracker[]> => {
  const API_BASE_URL = getBaseURLBasedOnRegion(
    `/wallet-tracker?wallet=${walletAddresses}`,
  );

  try {
    const { data } = await axios.get<WalletTracker[]>(API_BASE_URL, {
      withCredentials: false,
      ...(token && {
        headers: {
          "X-Nova-Session": `${token}`,
        },
      }),
    });
    return data;
  } catch (error) {
    console.warn(error);
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch selected wallet tracker transactions",
      );
    }
    throw new Error("Failed to fetch selected wallet tracker transactions");
  }
};
