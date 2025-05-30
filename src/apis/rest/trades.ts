import axios from "@/libraries/axios";
import { SniperTask } from "./sniper";
import { AxiosError } from "axios";
import { TransactionInfo } from "@/types/ws-general";
import { getBaseURLBasedOnRegion } from "../../utils/getBaseURLBasedOnRegion";

export type TransactionType = "buy" | "sell" | "add" | "remove";
type TransactionMisc = "sniper" | "insider" | "developer";

const API_ONCHAIN_BASE_URL = process.env.NEXT_PUBLIC_REST_ONCHAIN_URL || "";

interface GetTradesParams {
  maker?: string;
  limit?: number;
  offset?: number;
  order?: "asc" | "desc";
  mint?: string;
  type?: TransactionType[];
  misc?: TransactionMisc;
  min_sol?: number;
  max_sol?: number;
}

export interface TraderOverviewResponse {
  wallet: string;
  invested_sol: number;
  invested_usd: number;
  buys: number;
  sells: number;
  sold_sol: number;
  sold_usd: number;
  profit_sol: number;
  profit_usd: number;
  remaining_sol: number;
  remaining_usd: number;
  percentage: number;
  holder_since: number;
  animal: string;
}

export interface GetFreshFundedResponse {
  cached: boolean;
  results: {
    wallet: string;
    fundedAmount: string;
    fundedBy: string;
    timestamp: number;
  }[];
}

export const getTradesTasks = async ({
  maker,
  limit,
  offset,
  order,
  mint,
  type,
  misc,
  min_sol,
  max_sol,
}: GetTradesParams): Promise<
  | TransactionInfo[]
  | {
      success: boolean;
      message: string;
    }
> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/transactions");

  try {
    const { data } = await axios.get<
      | TransactionInfo[]
      | {
          success: boolean;
          message: string;
        }
    >(API_BASE_URL, {
      withCredentials: false,
      params: {
        maker,
        limit,
        offset,
        order,
        mint,
        type: type?.join(","),
        misc,
        min_sol,
        max_sol,
      },
    });

    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch sniper tasks",
      );
    }
    throw new Error("Failed to fetch sniper tasks");
  }
};

export const getTraderOverview = async (
  wallet: string,
  mint: string,
): Promise<TraderOverviewResponse> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/charts/trader");

  try {
    const { data } = await axios.get<TraderOverviewResponse>(API_BASE_URL, {
      params: { wallet, mint },
      withCredentials: false,
    });
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch trader overview",
      );
    }
    throw new Error("Failed to fetch trader overview");
  }
};

export const getFreshFundedInfo = async (
  wallets: string[],
): Promise<GetFreshFundedResponse> => {
  try {
    const { data: response } = await axios.post<GetFreshFundedResponse>(
      `${API_ONCHAIN_BASE_URL}/fresh-funded`,
      {
        wallets: wallets,
      },
      {
        withCredentials: false,
      },
    );
    return response;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to retrieve fresh funded info",
      );
    }
    throw new Error("Failed to retrieve fresh funded info");
  }
};
