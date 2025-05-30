import { NovaChart, NovaChartTrades } from "@/types/nova_tv.types";
import cookies from "js-cookie";
import { getBaseURLBasedOnRegion } from "../../utils/getBaseURLBasedOnRegion";

export async function fetchHistoricalData({
  currency,
  initial,
  interval,
  mint,
  countBack,
  from,
  to,
}: {
  mint: string;
  interval: string;
  currency: "sol" | "usd";
  from?: number;
  to?: number;
  countBack?: number;
  initial: boolean;
}): Promise<NovaChart> {
  const API_BASE_URL = getBaseURLBasedOnRegion(
    `/charts/candles?mint=${mint}&interval=${interval}&currency=${currency}&from=${from}&to=${to}&countback=${countBack}&initial=${initial}`,
  );

  const response = await fetch(API_BASE_URL, {
    headers: {
      "X-Nova-Session": cookies.get("_nova_session") || "",
    },
  });
  return await response.json();
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
