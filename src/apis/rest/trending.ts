import axios from "@/libraries/axios";
import { AxiosError } from "axios";
import { TrendingDataMessageType } from "@/types/ws-general";
import { getBaseURLBasedOnRegion } from "../../utils/getBaseURLBasedOnRegion";

interface TrendingFilterProps {
  dexes?: string;
  show_keywords?: string;
  mint_disabled?: boolean;
  freeze_disabled?: boolean;
  lp_burned?: boolean;
  hide_bundled?: boolean;
  one_social?: boolean;
  min_liquidity?: number;
  max_liquidity?: number;
  min_volume?: number;
  max_volume?: number;
  min_age?: number;
  max_age?: number;
  min_market_cap?: number;
  max_market_cap?: number;
  min_transactions?: number;
  max_transactions?: number;
  min_buys?: number;
  max_buys?: number;
  min_sells?: number;
  max_sells?: number;
  interval?: "1m" | "5m" | "30m" | "1h";
}

export const getTrendingFetch = async (
  props: TrendingFilterProps,
): Promise<TrendingDataMessageType[]> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/trending");

  try {
    const { data } = await axios.get<TrendingDataMessageType[]>(API_BASE_URL, {
      params: props,
    });
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch initial trending",
      );
    }
    throw new Error("Failed to fetch initial trending");
  }
};
