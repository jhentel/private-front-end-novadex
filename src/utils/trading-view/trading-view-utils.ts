import { Mark, ResolutionString, Timezone } from "@/types/charting_library";
import {
  ChartType,
  CurrencyChart,
  Trade,
  TradeLetter,
} from "@/types/nova_tv.types";
import * as Sentry from "@sentry/nextjs";
import { formatAmountWithoutLeadingZero } from "../formatAmount";
import { formatEpochToUTCDate } from "../formatDate";
import truncateCA from "../truncateCA";
import cookies from "js-cookie";

export const loadScript = async (src: string) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.fetchPriority = "high";
    script.onload = resolve;
    script.onerror = (error) => {
      Sentry.captureMessage(
        `Failed to load script 🔴 – (Trading View) |  Error: ${error?.toString()}`,
        "error",
      );
      reject(error);
    };
    document.body.appendChild(script);
  });
};

export function getBarStartTime(timestamp: number, resolution: string): number {
  switch (resolution) {
    case "1S":
    case "5S":
    case "15S":
    case "30S": {
      const seconds = parseInt(resolution.replace("S", ""));
      const interval = seconds * 1000;
      return Math.floor(timestamp / interval) * interval;
    }
    default: {
      const minutes = parseInt(resolution);
      const interval = minutes * 60 * 1000;
      return Math.floor(timestamp / interval) * interval;
    }
  }
}

export function parseResolutionToMilliseconds(resolution: string) {
  switch (resolution) {
    case "1S":
    case "5S":
    case "15S":
    case "30S": {
      const seconds = parseInt(resolution.replace("S", ""));
      const interval = seconds * 1000;
      return interval;
    }
    default: {
      const minutes = parseInt(resolution);
      const interval = minutes * 60 * 1000;
      return interval;
    }
  }
}

export function getValueByType(value: number, initialTotalSupply: number) {
  const chartType: ChartType =
    (localStorage.getItem("chart_type") as ChartType) || "Price";

  if (chartType === "MCap") {
    const mktCapVal = initialTotalSupply * value;

    return mktCapVal;
  } else {
    return value;
  }
}

export function getTimeZone(): Timezone {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone as Timezone;
  } catch (e) {
    return "Etc/UTC";
  }
}

const defaultInterval = "1S" as ResolutionString;
export function getIntervalResolution(): ResolutionString {
  if (!localStorage.getItem("chart_interval_resolution")) {
    localStorage.setItem("chart_interval_resolution", defaultInterval);
    cookies.set("_chart_interval_resolution", defaultInterval);
    return defaultInterval as ResolutionString;
  } else {
    return localStorage.getItem(
      "chart_interval_resolution",
    ) as ResolutionString;
  }
}

export function generateMarkText(
  wallet: string,
  letter: TradeLetter,
  tokenAmount: string,
  priceSol: string,
  priceUsd: string,
  timestamp: number,
  supply: number,
  walletName?: string,
  colour?: string,
  imageUrl?: string,
): string {
  const currency: CurrencyChart =
    (localStorage.getItem("chart_currency") as CurrencyChart) || "SOL";
  const chartType: ChartType =
    (localStorage.getItem("chart_type") as ChartType) || "Price";

  const isMyTrade = letter.length === 1 && !imageUrl;
  const isSniperTrade = letter.length === 2 && letter[0] === "S";
  const isDevTrade = letter.length === 2 && letter[0] === "D";
  const isInsiderTrade = letter.length === 2 && letter[0] === "I";
  const isTrackedTrade = letter.length === 1 && imageUrl;

  let currencyPrice = currency === "SOL" ? priceSol : priceUsd;

  const amountValue = `$${formatAmountWithoutLeadingZero(
    Number(priceUsd) * Number(tokenAmount),
  )}`;
  const marketCapValue = `$${formatAmountWithoutLeadingZero(
    Number(currencyPrice) * supply,
  )}`;

  if (isMyTrade) {
    return `My Trade | ${truncateCA(wallet, 10)}: ${letter === "B" ? "bought" : "sold"
      } ${amountValue} at ${marketCapValue} Market Cap on ${formatEpochToUTCDate(
        timestamp,
      )}`;
  } else if (isSniperTrade) {
    return `Sniper Trade | ${truncateCA(wallet, 10)} ${letter === "SB" ? "bought" : "sold"
      } ${amountValue} at ${marketCapValue} Market Cap on ${formatEpochToUTCDate(
        timestamp,
      )}`;
  } else if (isDevTrade) {
    return `Dev Trade | ${truncateCA(wallet, 10)}: ${letter === "DB" ? "bought" : "sold"
      } ${amountValue} at ${marketCapValue} Market Cap on ${formatEpochToUTCDate(
        timestamp,
      )}`;
  } else if (isInsiderTrade) {
    return `Insider Trade | ${truncateCA(wallet, 10)}: ${letter === "IB" ? "bought" : "sold"
      } ${amountValue} at ${marketCapValue} Market Cap on ${formatEpochToUTCDate(
        timestamp,
      )}`;
  } else if (isTrackedTrade) {
    return `Tracked Trade | ${truncateCA(wallet, 10)}: ${letter === "B" ? "bought" : "sold"
      } ${amountValue} at ${marketCapValue} Market Cap on ${formatEpochToUTCDate(
        timestamp,
      )}`;
  } else {
    return `${walletName || ""
      } ${colour === "green" ? "bought" : "sold"} ${amountValue} at ${marketCapValue} Market Cap on ${formatEpochToUTCDate(
        timestamp,
      )}`;
  }
}

export function getUniqueMarks(marks: Mark[]): Mark[] {
  const seen = new Set<string>();

  return marks.filter((mark) => {
    const { id, ...markFilterCondition } = mark;
    const serializedMark = JSON.stringify(markFilterCondition);

    if (seen.has(serializedMark)) return false;

    if (String(mark.id).length < 13 || String(mark.id) === "NaN") return false;

    seen.add(serializedMark);
    return true;
  });
}

export function getUniqueTrades(trades: Trade[]): Trade[] {
  const seen = new Set<string>();

  return trades.filter((trade) => {
    const {
      price_usd,
      average_price_usd,
      average_sell_price_usd,
      price,
      signature,
      letter,
      wallet,
      name,
      token_amount,
      ...tradeFilterCondition
    } = trade;
    const serializedTrade = JSON.stringify({
      signature,
      name,
      letter,
      wallet,
      price,
      token_amount,
    });

    if (seen.has(serializedTrade)) return false;

    seen.add(serializedTrade);
    return true;
  });
}

export function adjustTimestamps(data: Trade[]) {
  const result = structuredClone(data);

  result.sort((a, b) => a.timestamp - b.timestamp);

  const seenSignatures = new Map();

  for (let i = 0; i < result.length; i++) {
    const tx = result[i];
    const lastSeen = seenSignatures.get(tx.signature);

    if (lastSeen !== undefined && tx.timestamp === lastSeen) {
      tx.timestamp = lastSeen + 50;
    }

    seenSignatures.set(tx.signature, tx.timestamp);
  }

  return result;
}

export function areTradesEqual(trade1: Trade, trade2: Trade): boolean {
  return (
    trade1.timestamp === trade2.timestamp &&
    trade1.wallet === trade2.wallet &&
    trade1.letter === trade2.letter &&
    trade1.price === trade2.price &&
    trade1.price_usd === trade2.price_usd &&
    trade1.supply === trade2.supply &&
    trade1.colour === trade2.colour &&
    trade1.imageUrl === trade2.imageUrl
  );
}

export function updateTitle(
  nextPrice: number,
  currentSymbolArg: string,
  previousPriceRef: React.MutableRefObject<number | null>,
) {
  const currentSymbol = currentSymbolArg || "";
  const currency: CurrencyChart =
    (localStorage.getItem("chart_currency") as CurrencyChart) || "SOL";
  const chartType: ChartType =
    (localStorage.getItem("chart_type") as ChartType) || "Price";
  const pre = currency === "USD" ? "$" : "";
  let arrow = "";

  if (previousPriceRef.current !== null && nextPrice !== undefined) {
    if (nextPrice > previousPriceRef.current) {
      arrow = "▲";
    } else if (nextPrice < previousPriceRef.current) {
      arrow = "▼";
    }
  }

  let title = `${currentSymbol} ${arrow} | -`;

  if (nextPrice !== undefined) {
    title = `${currentSymbol} ${arrow} | ${pre}${formatAmountWithoutLeadingZero(
      nextPrice,
      3,
      2,
    )}`;
  }
  document.title = title;
}

export function formatChartPrice(price: number) {
  return formatAmountWithoutLeadingZero(price, 3, 2);
}
