// ######## Libraries 📦 & Hooks 🪝 ########
import axios from "@/libraries/axios";
import { AxiosError } from "axios";
import Cookies from "js-cookie";
import { getTwitterAPIKey } from "./twitter-monitor";

// ######## Constants ########
const API_BASE_URL = "https://nova-wallet-portfolio-33f8aa732760.herokuapp.com";
const COOKIE_NAME = "_nova_license_key";
const COOKIE_EXPIRY_DAYS = 1; // 1 day expiry

// ######## Types 🗨️ ########.

/* Token Wallets Types */
// export enum Timeframe {
//   "1d" = "1d",
//   "1w" = "1w",
//   "30d" = "30d",
//   "1y" = "1y",
// }
export type Timeframe = (typeof availableTimeframe)[number];
export const availableTimeframe = ["1d", "1w", "30d", "1y"] as const;

type TokenData = {
  address: string;
  circulatingSupply: string;
  decimals: number;
  description: string;
  id: string;
  imageLargeUrl: string;
  isScam: boolean | null;
  name: string;
  symbol: string;
  totalSupply: string;
};

export type TransactionData = {
  amountBoughtUsd1d: string;
  amountBoughtUsd1w: string;
  amountBoughtUsd1y: string;
  amountBoughtUsd30d: string;
  amountSoldUsd1d: string;
  amountSoldUsd1w: string;
  amountSoldUsd1y: string;
  amountSoldUsd30d: string;
  amountSoldUsdAll1d: string;
  amountSoldUsdAll1w: string;
  amountSoldUsdAll1y: string;
  amountSoldUsdAll30d: string;
  buys1d: number;
  buys1w: number;
  buys1y: number;
  buys30d: number;
  firstTransactionAt: number | null;
  lastTransactionAt: number | null;
  purchasedTokenBalance: string;
  realizedProfitPercentage1d: number;
  realizedProfitPercentage1w: number;
  realizedProfitPercentage1y: number;
  realizedProfitPercentage30d: number;
  realizedProfitUsd1d: string;
  realizedProfitUsd1w: string;
  realizedProfitUsd1y: string;
  realizedProfitUsd30d: string;
  sells1d: number;
  sells1w: number;
  sells1y: number;
  sells30d: number;
  sellsAll1d: number;
  sellsAll1w: number;
  sellsAll1y: number;
  sellsAll30d: number;
  tokenAcquisitionCostUsd: string;
  tokenAmountBought1d: string;
  tokenAmountBought1w: string;
  tokenAmountBought1y: string;
  tokenAmountBought30d: string;
  tokenAmountSold1d: string;
  tokenAmountSold1w: string;
  tokenAmountSold1y: string;
  tokenAmountSold30d: string;
  tokenAmountSoldAll1d: string;
  tokenAmountSoldAll1w: string;
  tokenAmountSoldAll1y: string;
  tokenAmountSoldAll30d: string;
  tokenBalance: string;
  token_data: TokenData;
};

export type TokenWalletsResponse = {
  data: {
    networkId: number;
    results: TransactionData[];
    walletAddress: string;
  };
};

/* Wallet PnL Chart Types */
type Range = {
  start: number;
  end: number;
};

type DataItem = {
  realizedProfitUsd: number;
  resolution: string;
  swaps: number;
  timestamp: number;
  volumeUsd: number;
  volumeUsdAll: number;
  cumulativePnlUsd: number;
};

type WalletPnLChartResponse = {
  data: {
    walletAddress: string;
    resolution: string;
    range: Range;
    networkId: number;
    data: DataItem[];
    pnlPercentage: string;
    pnlUsd: number;
  };
};

/* Wallet Stats Types */
type StatsUsd = {
  averageProfitUsdPerTrade: string;
  averageSwapAmountUsd: string;
  heldTokenAcquisitionCostUsd: string;
  realizedProfitPercentage: number;
  realizedProfitUsd: string;
  soldTokenAcquisitionCostUsd: string;
  volumeUsd: string;
  volumeUsdAll: string;
};

type DayStats = {
  losses: number;
  swaps: number;
  uniqueTokens: number;
  wins: number;
};
type Stats = {
  day1Stats: DayStats;
  day30Stats: DayStats;
  week1Stats: DayStats;
  year1Stats: DayStats;
  end: number;
  lastTransactionAt: number;
  networkId: number;
  start: number;
  statsUsd: StatsUsd;
  walletAddress: string;
};

type WalletStatsResponse = {
  data: {
    lastTransactionAt: number;
    scammerScore: number;
    statsDay1: Stats;
    statsDay30: Stats;
    statsWeek1: Stats;
    statsYear1: Stats;
    walletAddress: string;
  };
};

/* Wallet Holdings Types */
interface Exchange {
  address: string;
  name: string;
}

export interface HoldingData {
  address: string;
  amount: number;
  change24: string;
  exchanges: Exchange[];
  image: string | null;
  invested: number;
  liquidity: string;
  pnl: number;
  pnlPercentage: string;
  marketCap: string;
  name: string;
  price: number;
  symbol: string;
  value: number;
  remaining: number;
  sold: number;
  launchpad:string
  origin_dex:string
}

export interface WalletHoldingsResponse {
  data: HoldingData[];
}

/* Deployed Tokens Types */
type DeployedToken = {
  address: string;
  createdAt: number;
  decimals: number;
  image: string | null;
  liquidity: string;
  name: string;
  networkId: number;
  priceUSD: string;
  symbol: string;
  progressPct: number;
  dex: string;
  exchanges: Array<{
    name: string;
    address: string;
  }>;
  holders: number;
  marketCap: string;
  launchpad: string;
  origin_dex: string;
  pnlSol: number | null;
  supply: string;
};

type DeployedTokensResponse = {
  data: {
    count: number;
    page: number;
    results: DeployedToken[];
    walletAddress: string;
  };
};
// {
//   'walletAddress': '679pL3P3nqq5wr4zAyfCYPmyRXhfYC8LH65P7XrRwx3q',
//   'results': [
//     {
//       'pairAddress': '3bG5vhHw1qgv5ckzz6NJbQpYGKAuWQDJvFHf4WSZEeRf',
//       'eventType': 'Swap',
//       'direction': 'buy',
//       'timestamp': 1748388049,
//       'usd': 483.56,
//       'amount': '298K',
//       'pairSymbol': 'greg-SOL',
//       'pairName': 'greg/Wrapped SOL',
//       'pairImage': 'https://crypto-token-logos-production.s3.us-west-2.amazonaws.com/1399811149_k6Uxr9oeVDm5qKy8EmPP1e9zaAj4nSRDHSHRCD1pump:1399811149_small.png',
//       'dex': 'Pump.Swap',
//       'origin_dex': 'Pump',
//       'launchpad': ''
//     },
/* Wallet Trade History Types */
export type TradeHistoryItem = {
  pairAddress: string;
  eventType: string;
  direction: "buy" | "sell";
  timestamp: number;
  usd: number;
  amount: string;
  pairSymbol: string;
  pairName: string;
  pairImage: string;
  exchanges: Array<{
    name: string;
    address: string;
  }>;
  dex: string;
  origin_dex: string;
  launchpad: string;
};

type WalletTradeHistoryResponse = {
  data: {
    walletAddress: string;
    results: TradeHistoryItem[];
  };
};

/* Most Profitable Tokens Types */
export type ProfitableToken = {
  address: string;
  symbol: string;
  name: string;
  image: string | null;
  boughtUsd: number;
  soldUsd: number;
  pnlUsd: number;
  invested: number;
  remaining: number;
  pnlPercentage: string;
  dex: string;
  exchanges: Array<{
    address: string;
    name: string;
  }>;
  launchpad: string;
  origin_dex: string;
};

type MostProfitableTokensResponse = {
  data: ProfitableToken[];
};

// ######## Utils ########
const getLicenseKey = async (): Promise<string> => {
  //
  const existingKey = Cookies.get(COOKIE_NAME);
  if (existingKey) {
    return existingKey;
  }

  try {
    const response = await getTwitterAPIKey();
    if (response.success && response.message) {
      Cookies.set(COOKIE_NAME, response.message, {
        expires: COOKIE_EXPIRY_DAYS,
      });
      return response.message;
    }
    throw new Error("Failed to get valid license key");
  } catch (error) {
    throw new Error("Failed to get license key");
  }
};

export const getTokenWallets = async (
  wallet: string,
  timeframe: Timeframe,
): Promise<TokenWalletsResponse> => {
  try {
    const licenseKey = await getLicenseKey();
    const { data } = await axios.get<TokenWalletsResponse>(
      `${API_BASE_URL}/api-v1/nova-wallet/token-wallets`,
      {
        params: { wallet, timeframe },
        headers: {
          licenseKey,
        },
      },
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch token wallets",
      );
    }
    throw new Error("Failed to fetch token wallets");
  }
};

export const getWalletPnLChart = async (
  wallet: string,
  timeframe: Timeframe,
): Promise<WalletPnLChartResponse> => {
  try {
    const licenseKey = await getLicenseKey();
    const { data } = await axios.get<WalletPnLChartResponse>(
      `${API_BASE_URL}/api-v1/nova-wallet/wallet-pnl-chart`,
      {
        params: { wallet, timeframe },
        headers: {
          licenseKey,
        },
      },
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch wallets PnL Chart data",
      );
    }
    throw new Error("Failed to fetch wallets PnL Chart data");
  }
};

export const getWalletStats = async (
  wallet: string,
): Promise<WalletStatsResponse> => {
  try {
    const licenseKey = await getLicenseKey();
    const { data } = await axios.get<WalletStatsResponse>(
      `${API_BASE_URL}/api-v1/nova-wallet/wallet-stats`,
      {
        params: { wallet },
        headers: {
          licenseKey,
        },
      },
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch wallet stats",
      );
    }
    throw new Error("Failed to fetch wallet stats");
  }
};

export const getWalletHoldings = async (
  wallet: string,
): Promise<WalletHoldingsResponse> => {
  try {
    const licenseKey = await getLicenseKey();
    const { data } = await axios.get<WalletHoldingsResponse>(
      `${API_BASE_URL}/api-v1/nova-wallet/wallet-holdings`,
      {
        params: { wallet },
        headers: {
          licenseKey,
        },
      },
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch wallet holdings",
      );
    }
    throw new Error("Failed to fetch wallet holdings");
  }
};

export const getDeployedTokens = async (
  wallet: string,
): Promise<DeployedTokensResponse> => {
  try {
    const licenseKey = await getLicenseKey();
    const { data } = await axios.get<DeployedTokensResponse>(
      `${API_BASE_URL}/api-v1/nova-wallet/deployed-tokens`,
      {
        params: { wallet },
        headers: {
          licenseKey,
        },
      },
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch deployed tokens",
      );
    }
    throw new Error("Failed to fetch deployed tokens");
  }
};

export const getWalletTradeHistory = async (
  wallet: string,
): Promise<WalletTradeHistoryResponse> => {
  try {
    const licenseKey = await getLicenseKey();
    const { data } = await axios.get<WalletTradeHistoryResponse>(
      `${API_BASE_URL}/api-v1/nova-wallet/wallet-trade-history`,
      {
        params: { wallet },
        headers: {
          licenseKey,
        },
      },
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch wallet trade history",
      );
    }
    throw new Error("Failed to fetch wallet trade history");
  }
};

export const getMostProfitableTokens = async (
  wallet: string,
  timeframe: Timeframe = "1y",
): Promise<MostProfitableTokensResponse> => {
  try {
    const licenseKey = await getLicenseKey();
    const { data } = await axios.get<MostProfitableTokensResponse>(
      `${API_BASE_URL}/api-v1/nova-wallet/most-profitable-tokens`,
      {
        params: {
          wallet,
          timeframe,
        },
        headers: {
          licenseKey,
        },
      },
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch most profitable tokens",
      );
    }
    throw new Error("Failed to fetch most profitable tokens");
  }
};
