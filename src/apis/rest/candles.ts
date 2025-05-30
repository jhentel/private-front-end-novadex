import { QueryClient } from "@tanstack/react-query";
import { NovaChart, NovaChartTrades } from "@/types/nova_tv.types";
import cookies from "js-cookie";
import { getBaseURLBasedOnRegion } from "../../utils/getBaseURLBasedOnRegion";

export interface HistoricalDataParams {
  mint: string;
  interval: string;
  currency: "sol" | "usd";
  from?: number;
  to?: number;
  countBack?: number;
  initial?: boolean;
  enabled?: boolean;
}

// #################### API🔥 ####################
export async function fetchHistoricalData(
  params: HistoricalDataParams,
): Promise<NovaChart> {
  const API_BASE_URL = params?.initial
    ? getBaseURLBasedOnRegion(
        `/charts/candles?mint=${params?.mint}&interval=${params?.interval?.toLowerCase() || "1s"}&currency=${params?.currency}&initial=${params?.initial}`,
      )
    : getBaseURLBasedOnRegion(
        `/charts/candles?mint=${params?.mint}&interval=${params?.interval?.toLowerCase() || "1s"}&currency=${params?.currency}&from=${params?.from}&to=${params?.to}&countback=${params?.countBack}&initial=${params?.initial}`,
      );

  const response = await fetch(API_BASE_URL, {
    headers: {
      "X-Nova-Session": cookies.get("_nova_session") || "",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch historical data");
  }

  return response.json();
}

export async function fetchInitTradesData(
  mint: string,
): Promise<NovaChartTrades> {
  const API_BASE_URL = getBaseURLBasedOnRegion(`/charts/trades?mint=${mint}`);

  const response = await fetch(API_BASE_URL, {
    headers: {
      "X-Nova-Session": cookies.get("_nova_session") || "",
    },
  });
  return await response.json();
}

export async function fetchResolveSymbol(mint: string): Promise<{
  name: string;
  symbol: string;
  image: string;
  dex: string;
}> {
  const API_BASE_URL = getBaseURLBasedOnRegion(`/metadata?mint=${mint}`);

  const response = await fetch(API_BASE_URL, {
    headers: {
      "X-Nova-Session": cookies.get("_nova_session") || "",
    },
  });
  return await response.json();
}

export const queryClient = new QueryClient({
  defaultOptions: {},
});
