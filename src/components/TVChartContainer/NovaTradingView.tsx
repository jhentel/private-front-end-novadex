"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useEffect, useRef, useState } from "react";
import { useCurrentTokenChartPriceStore } from "@/stores/token/use-current-token-chart-price.store";
import { useTokenMessageStore } from "@/stores/token/use-token-messages.store";
import { useFilteredWalletTradesStore } from "@/stores/token/use-filtered-wallet-trades";
import { useMatchWalletTrackerTradesStore } from "@/stores/token/use-match-wallet-tracker-trades";
import { useCurrentTokenDeveloperTradesStore } from "@/stores/token/use-current-token-developer-trades";
import { useWalletTrackerMessageStore } from "@/stores/footer/use-wallet-tracker-message.store";
import { useTokenHoldingStore } from "@/stores/token/use-token-holding.store";
import cookies from "js-cookie";
import * as Sentry from "@sentry/nextjs";
// ######## Types 🗨️ ########
import {
  Bar,
  ChartingLibraryWidgetOptions,
  IChartingLibraryWidget,
  IDropdownApi,
  LanguageCode,
  LibrarySymbolInfo,
  Mark,
  MarkConstColors,
  MarkCustomColor,
  ResolutionString,
} from "@/types/charting_library";
import {
  TradeFilter,
  Trade,
  TradeLetter,
  NovaChartTrades,
  CurrencyChart,
  ChartType,
  NovaChart,
} from "@/types/nova_tv.types";
import {
  defaultTVChartProperties,
  defaultTVChartPropertiesMainSeriesProperties,
} from "@/constants/trading-view.constant";
// ######## Utils & Helpers 🤝 ########
import throttle from "lodash/throttle";
import {
  addAveragePriceLine,
  filterTrades,
  removeAveragePriceLine,
  updateTradeFilters,
  saveTradeFiltersToLocalStorage,
} from "@/utils/nova_tv.utils";
import {
  getBarStartTime,
  updateTitle,
  areTradesEqual,
  generateMarkText,
  getIntervalResolution,
  getTimeZone,
  getUniqueMarks,
  getUniqueTrades,
  getValueByType,
  formatChartPrice,
  adjustTimestamps,
  parseResolutionToMilliseconds,
} from "@/utils/trading-view/trading-view-utils";
import {
  fetchResolveSymbol,
  fetchHistoricalData,
  fetchInitTradesData,
} from "@/apis/rest/trading-view";
import { useWebSocket } from "@/hooks/useWebsocketNew";
import { queryClient } from "@/apis/rest/candles";
import { useQueryClient } from "@tanstack/react-query";
import { TokenDataMessageType, WSMessage } from "@/types/ws-general";
import { isRelevantMessage } from "@/utils/websocket/isRelevantMessage";
import { useServerTimeStore } from "@/stores/use-server-time.store";

const getHistoricalFromInterval = {
  "1s": 60 * 5,
  "5s": 60 * 25,
  "15s": 60 * 75,
  "30s": 60 * 150,
  "1m": 60 * 300,
  "5m": 60 * 1_500,
  "15m": 60 * 4_500,
  "30m": 60 * 9_000,
  "1h": 60 * 18_000,
  "4h": 60 * 76_000,
  "1d": 60 * 18_000 * 24,
};

// ######## Local Setup ⚒️ ########
export const PRICE_MAP = {
  "1S": "1s",
  "5S": "5s",
  "15S": "15s",
  "30S": "30s",
  "1": "1m",
  "5": "5m",
  "15": "15m",
  "30": "30m",
  "60": "1h",
  "240": "4h",
  "1440": "1d",
};
const supportedResolutions = [
  "1S",
  "5S",
  "15S",
  "30S",
  "1",
  "5",
  "15",
  "30",
  "60",
  "240",
  "1440",
] as ResolutionString[];

// ######## Main Component ✨ ########
const NovaTradingView = ({
  mint,
  tokenData,
}: {
  mint?: string | null;
  tokenData: TokenDataMessageType | null;
}) => {
  // ######## Local Utils & Helpers 🤝 ########
  const transactionMessages = useTokenMessageStore(
    (state) => state.transactionMessages,
  );
  const lastBarRef = useRef<Record<string, Bar>>({});
  const tvWidgetRef = useRef<IChartingLibraryWidget | null>(null);
  const dropdownApiRef = useRef<IDropdownApi | null>(null);
  const buyAveragePriceShapeIdRef = useRef<string | null>(null);
  const buyAveragePriceTradeStartTimeRef = useRef<number | null>(null);
  const buyAveragePriceShapePriceRef = useRef<number | null>(null);
  const sellAveragePriceShapeIdRef = useRef<string | null>(null);
  const sellAveragePriceTradeStartTimeRef = useRef<number | null>(null);
  const sellAveragePriceShapePriceRef = useRef<number | null>(null);
  const isInitialPriceMessageRef = useRef<boolean>(true);
  const isInitialBarRef = useRef<boolean>(true);
  const noDataRef = useRef<boolean | null>(null);
  const transactionMessagesLengthRef = useRef<number>(0);
  const isInitialNoDataRef = useRef<boolean>(false);

  useEffect(() => {
    transactionMessagesLengthRef.current = transactionMessages.length;
  }, [transactionMessages.length]);

  const reconnectTimeoutInitSocketRef = useRef<NodeJS.Timeout | null>(null);
  const reinitChartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousPriceRef = useRef<number | null>(null);
  const isConnectionHealthyRef = useRef(true);
  const isInitCandlesSettedRef = useRef(false);
  const queryClientNormal = useQueryClient();

  // These can stay as component-level constants since they're initialized once
  const subscribersMap = useRef(new Map());
  const tradeMap = useRef(new Map<string, NovaChartTrades["trades"]>());
  const tradeFilters = useRef(
    new Set<TradeFilter>([
      "my_trades",
      "dev_trades",
      "sniper_trades",
      "insider_trades",
      "tracked_trades",
      "other_trades",
    ]),
  );

  useEffect(() => {
    const handleChartTypeStorage = () => {
      const chartTypeLocal = localStorage.getItem("chart_type");
      const validType = ["MCap", "Price"];

      if (!chartTypeLocal) {
        localStorage.setItem("chart_type", "MCap");
        cookies.set("_chart_type", "MCap");
        return;
      }

      if (!validType.includes(chartTypeLocal)) {
        localStorage.setItem("chart_type", "MCap");
        cookies.set("_chart_type", "MCap");
        return;
      }
    };

    const handleCurrencyStorage = () => {
      const currencyLocal = localStorage.getItem("chart_currency");
      const currencyCookies = cookies.get("_chart_currency");

      if (currencyLocal !== currencyCookies) {
        localStorage.setItem("chart_currency", "USD");
        cookies.set("_chart_currency", "USD");
        return;
      }
    };

    const handleIntervalStorage = () => {
      const fallback = "1S";
      const selectedResolution =
        localStorage.getItem("chart_interval_resolution") ||
        cookies.get("_chart_interval_resolution");

      const currentResolution = tvWidgetRef.current?.activeChart().resolution();

      if (
        currentResolution &&
        supportedResolutions.includes(currentResolution)
      ) {
        localStorage.setItem("chart_interval_resolution", currentResolution);
        cookies.set("_chart_interval_resolution", currentResolution);
        return;
      }

      if (
        selectedResolution &&
        supportedResolutions.includes(selectedResolution as ResolutionString)
      ) {
        localStorage.setItem("chart_interval_resolution", selectedResolution);
        cookies.set("_chart_interval_resolution", selectedResolution);
        return;
      }

      localStorage.setItem("chart_interval_resolution", fallback);
      cookies.set("_chart_interval_resolution", fallback);
    };

    // Optional: trigger once on mount
    const handleStorageChange = () => {
      handleCurrencyStorage();
      handleChartTypeStorage();
      handleIntervalStorage();
    };

    handleStorageChange();

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const cleanUp = () => {
    /* console.log("WS HOOK 📺 - chartToken | Running main cleanup...") */;

    // Clear global timeouts first
    if (reconnectTimeoutInitSocketRef.current)
      clearTimeout(reconnectTimeoutInitSocketRef.current);
    if (reinitChartTimeoutRef.current)
      clearTimeout(reinitChartTimeoutRef.current);
    if (intervalStudiesRef.current) clearInterval(intervalStudiesRef.current);

    // Iterate and close all subscriber sockets intentionally
    subscribersMap.current.clear(); // Clear the map
    reconnectDelays.current.clear(); // Clear delay states

    // Remove TradingView Widget
    if (tvWidgetRef.current) {
      try {
        /* console.log("TV Widget | Attempting removal during cleanup.") */;
        tvWidgetRef.current.remove();
        /* console.log("TV Widget | Removed successfully during cleanup.") */;
      } catch (error) {
        if (error instanceof DOMException && error.name === "NotFoundError") {
          console.warn(
            "TV Widget | Node already removed during cleanup (NotFoundError caught).",
          );
        } else {
          console.error(
            "TV Widget | Error removing widget during cleanup:",
            error,
          );
          Sentry.captureException(error);
        }
      } finally {
        tvWidgetRef.current = null;
      }
    }

    // Clear timeouts
    if (reconnectTimeoutInitSocketRef.current) {
      clearTimeout(reconnectTimeoutInitSocketRef.current);
      reconnectTimeoutInitSocketRef.current = null;
    }
    if (reinitChartTimeoutRef.current) {
      clearTimeout(reinitChartTimeoutRef.current);
      reinitChartTimeoutRef.current = null;
    }

    lastBarRef.current = {};
    dropdownApiRef.current = null;
    buyAveragePriceShapeIdRef.current = null;
    sellAveragePriceShapeIdRef.current = null;
    isInitialBarRef.current = true;
    noDataRef.current = null;
    previousPriceRef.current = null;
    isInitialPriceMessageRef.current = true;
    tokenSupplyRef.current = null;

    // Reset global stores if appropriate
    setCurrentTokenChartPrice("");
    setCurrentTokenChartPriceUsd("");
    setCurrentTokenChartSupply("1000000000");
    resetCurrentTokenDeveloperTradesState();

    // Stop websocket stream
    stopTokenMessage();
    stopChartTradesMessage();

    chartUpdateGlobalStateQueue.length = 0;
    /* console.log("WS HOOK 📺 - chartToken | Main cleanup finished.") */;
  };

  const currencyCookiesGlobal: CurrencyChart =
    (cookies.get("_chart_currency") as CurrencyChart) || "SOL";
  const currencyRef = useRef<CurrencyChart | null>(null);
  const tokenSupplyRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof localStorage.getItem("is_ref") === undefined) {
      localStorage.setItem("is_ref", "true");
    }
  }, []);

  const reconnectDelays = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (!currencyRef.current) {
      currencyRef.current = currencyCookiesGlobal;
    }
  }, [currencyRef.current, currencyCookiesGlobal]);

  // Store in Global State for PnL 📊
  const setCurrentTokenChartPrice = useCurrentTokenChartPriceStore(
    (state) => state.setCurrentTokenChartPrice,
  );
  const setCurrentTokenChartPriceUsd = useCurrentTokenChartPriceStore(
    (state) => state.setCurrentTokenChartPriceUsd,
  );
  const setCurrentTokenChartSupply = useCurrentTokenChartPriceStore(
    (state) => state.setCurrentTokenChartSupply,
  );
  const chartUpdateGlobalStateQueue: {
    price: string;
    price_usd: string;
    supply: string;
  }[] = [];

  let chartTrades: Trade[] = [];
  const isChartLoadedRef = useRef(false); // Assume initially not loaded

  const handleThrottledCurrentTokenChartUpdate = throttle(
    (data: { price: string; price_usd: string; supply: string }) => {
      setCurrentTokenChartPrice(data?.price);
      setCurrentTokenChartPriceUsd(data?.price_usd);
      setCurrentTokenChartSupply(data?.supply);
    },
    100,
  );

  const handleQueuedOrThrottledChartUpdate = (data: {
    price: string;
    price_usd: string;
    supply: string;
  }) => {
    if (!isChartLoadedRef.current || isQueueMessage.current) {
      chartUpdateGlobalStateQueue.push(data);
    } else {
      // Chart loaded: handle immediately
      handleThrottledCurrentTokenChartUpdate(data);
    }
  };

  const flushTradeQueue = () => {
    const selectedResolution = (
      localStorage.getItem("chart_interval_resolution") ||
      tvWidgetRef.current?.activeChart().resolution() ||
      cookies.get("_chart_interval_resolution") ||
      "1S"
    ).toUpperCase();

    const existingTrades = tradeMap.current.get(
      `${mint}-${selectedResolution}`,
    );

    const currency: CurrencyChart =
      (localStorage.getItem("chart_currency") as CurrencyChart) || "SOL";

    const chartType: ChartType =
      (localStorage.getItem("chart_type") as ChartType) || "Price";

    // console.log("TRADINGVIEW PROGRESS: FLUSH QUEUE Data", {
    //   selectedResolution,
    //   existingTrades,
    //   currency,
    //   chartType,
    //   chartTrades,
    // });

    if (!selectedResolution) return;

    if (chartTrades.length === 0) return;

    const convertedTrades = chartTrades.map((trade: any) => {
      return {
        ...trade,
        timestamp: trade.timestamp,
      };
    });

    if (existingTrades) {
      convertedTrades?.forEach((trade: any) => {
        if (!trade) return;
        existingTrades?.push(trade);
      });
    } else {
      tradeMap.current.set(`${mint}-${selectedResolution}`, convertedTrades);
    }

    if (tvWidgetRef.current && tvWidgetRef.current?.activeChart) {
      tvWidgetRef.current?.activeChart()?.refreshMarks();
    }

    // Avg Price Line
    const lastTrade = chartTrades[chartTrades.length - 1];

    // ### BUY
    if (lastTrade.letter === "B") {
      const tradeStartTime = getBarStartTime(
        new Date().getTime(),
        selectedResolution,
      );

      removeAveragePriceLine(
        "buy",
        tvWidgetRef.current,
        buyAveragePriceShapeIdRef.current,
      );
      const priceByCurrency = parseFloat(
        currency === "SOL"
          ? lastTrade?.average_price_sol
          : lastTrade?.average_price_usd,
      );

      buyAveragePriceTradeStartTimeRef.current = tradeStartTime;
      if (chartType === "MCap") {
        buyAveragePriceShapePriceRef.current =
          priceByCurrency * Number(lastTrade?.supply);
      } else {
        buyAveragePriceShapePriceRef.current = priceByCurrency;
      }

      // @ts-ignore
      buyAveragePriceShapeIdRef.current = addAveragePriceLine(
        "buy",
        tvWidgetRef.current,
        tradeStartTime,
        buyAveragePriceShapePriceRef.current,
      );

      if (localStorage.getItem("chart_hide_buy_avg_price_line") === "true") {
        removeAveragePriceLine(
          "buy",
          tvWidgetRef.current,
          buyAveragePriceShapeIdRef.current,
        );
      }
    }

    // ### SELL
    if (lastTrade.letter === "S") {
      const tradeStartTime = getBarStartTime(
        new Date().getTime(),
        selectedResolution,
      );
      removeAveragePriceLine(
        "sell",
        tvWidgetRef.current,
        sellAveragePriceShapeIdRef.current,
      );
      const priceByCurrency = parseFloat(
        currency === "SOL"
          ? lastTrade?.average_sell_price_sol
          : lastTrade?.average_sell_price_usd,
      );

      sellAveragePriceTradeStartTimeRef.current = tradeStartTime;
      if (chartType === "MCap") {
        sellAveragePriceShapePriceRef.current =
          priceByCurrency * Number(lastTrade?.supply);
      } else {
        sellAveragePriceShapePriceRef.current = priceByCurrency;
      }

      // @ts-ignore
      sellAveragePriceShapeIdRef.current = addAveragePriceLine(
        "sell",
        tvWidgetRef.current,
        tradeStartTime,
        sellAveragePriceShapePriceRef.current,
      );

      if (localStorage.getItem("chart_hide_sell_avg_price_line") === "true") {
        removeAveragePriceLine(
          "sell",
          tvWidgetRef.current,
          sellAveragePriceShapeIdRef.current,
        );
      }
    }

    chartTrades = [];
  };

  // Store in Global State for User Trades ✨
  const setUserTrades = useTokenHoldingStore((state) => state.setUserTrades);

  // Store in Global State for Developer Trades ✨
  const developerAddress = useTokenMessageStore(
    (state) => state.dataSecurityMessage.deployer,
  );
  const { resetCurrentTokenDeveloperTradesState, developerTrades } =
    useCurrentTokenDeveloperTradesStore();

  const chartContainerRef = useRef<HTMLDivElement>(
    null,
  ) as React.RefObject<HTMLInputElement>;
  const [isTVChartReady, setIsTvChartReady] = useState<boolean>(false);
  const [isLoadingMarks, setIsLoadingMarks] = useState<boolean>(true);
  const [tvWidgetReady, setTvWidgetReady] = useState<boolean>(false);
  const loadCount = useRef(0);
  const intervalStudiesRef = useRef<NodeJS.Timeout | null>(null);
  const isReseting = useRef<boolean>(false);

  const currentSymbolInfo = useRef<LibrarySymbolInfo | null>(null);

  const isQueueMessage = useRef<boolean>(true);

  const { getCurrentServerTime } = useServerTimeStore();

  const { sendMessage: sendTokenMessage, stopMessage: stopTokenMessage } =
    useWebSocket<WSMessage<TokenDataMessageType>>({
      channel: mint as string,
      initialMessage: {
        channel: mint,
        action: "join",
      },
      onMessage: (event) => {
        if (!subscribersMap.current) return;
        if (!mint) return;
        if (!isRelevantMessage(mint, event)) return;

        const message: TokenDataMessageType = event.data;
        if (!message) return;

        const chartPrice = message.price;
        subscribersMap.current.forEach((sub) => {
          // console.log(sub, "yeremia 2");

          const currency: CurrencyChart =
            (localStorage
              .getItem("chart_currency")
              ?.toUpperCase() as CurrencyChart) || "SOL";

          const chartType: ChartType =
            (localStorage.getItem("chart_type") as ChartType) || "Price";

          if (sub) sub.lastMessageTimestamp = getCurrentServerTime();

          const selectedResolution = (
            localStorage.getItem("chart_interval_resolution") ||
            tvWidgetRef.current?.activeChart().resolution() ||
            cookies.get("_chart_interval_resolution") ||
            "1S"
          ).toUpperCase();

          if (selectedResolution !== sub.resolution) return;

          if (chartPrice?.price_sol_str !== undefined) {
            if (
              isInitialNoDataRef.current &&
              transactionMessagesLengthRef.current > 0 &&
              tvWidgetRef.current
            ) {
              isInitialNoDataRef.current = false;
              sub.onResetCacheNeededCallback();
              tvWidgetRef.current?.activeChart().resetData();
            }
            handleQueuedOrThrottledChartUpdate({
              price: chartPrice?.price_sol_str,
              price_usd: chartPrice?.price_usd_str,
              supply: String(chartPrice?.supply),
            });

            const currentTime = getCurrentServerTime();
            const barStartTime = getBarStartTime(currentTime, sub.resolution);
            // console.log(barStartTime, "yeremia 4");

            const newSupply = chartPrice.supply;
            if (
              tokenSupplyRef.current === null ||
              parseFloat(tokenSupplyRef.current) !== newSupply
            ) {
              tokenSupplyRef.current = newSupply.toString();
            }

            let nextPrice = parseFloat(
              currency === "SOL"
                ? chartPrice?.price_sol_str
                : chartPrice?.price_usd_str,
            );
            const nextVolume = parseFloat(chartPrice?.volume_sol);

            if (chartType === "MCap") {
              const supply = newSupply;
              if (isNaN(supply) || supply <= 0) return;
              nextPrice = nextPrice * supply;
              if (nextPrice <= 0) return;
            }

            const lastBar = lastBarRef.current[selectedResolution];

            if (lastBar && lastBar.time === barStartTime) {
              // Update existing bar
              const updatedBar: Bar = {
                ...lastBar,
                high: Math.max(lastBar.open, nextPrice, lastBar.high),
                low: Math.min(lastBar.open, nextPrice, lastBar.low),
                close: nextPrice,
                volume: (lastBar.volume || 0) + (nextVolume || 0),
              };

              sub.callback(updatedBar);
              lastBarRef.current[selectedResolution!] = updatedBar;
            } else {
              if (
                lastBar &&
                barStartTime >
                  lastBar.time +
                    parseResolutionToMilliseconds(selectedResolution)
              ) {
                // Fill the gap with synthetic bar(s)
                const gapFillBar: Bar = {
                  time:
                    lastBar.time +
                    parseResolutionToMilliseconds(selectedResolution),
                  open: lastBar.close,
                  high: lastBar.close,
                  low: lastBar.close,
                  close: lastBar.close,
                  volume: 0,
                };
                sub.callback(gapFillBar);
                lastBarRef.current[selectedResolution] = gapFillBar;
              }

              // Create new bar
              const newBar: Bar = {
                time: barStartTime,
                open: lastBar?.close ?? nextPrice,
                high: Math.max(lastBar.close ?? nextPrice, nextPrice),
                low: Math.min(lastBar.close ?? nextPrice, nextPrice),
                close: nextPrice,
                volume: nextVolume || 0,
              };
              sub.callback(newBar);
              lastBarRef.current[selectedResolution] = newBar;
            }

            isInitialPriceMessageRef.current = false;
            const symbol = sub.symbolInfo.name;
            updateTitle(nextPrice, symbol, previousPriceRef);
          }
        });
      },
    });

  const { stopMessage: stopChartTradesMessage } = useWebSocket({
    channel: "chartTrades",
    initialMessage: {
      channel: "chartTrades",
      mint,
      action: "join",
    },
    onMessage: (event) => {
      if (event?.channel === "ping") return;

      if (event?.success === true) return;

      const data = event;

      const shouldAddToQueue = subscribersMap.current.size === 0;

      const isReadyToFlush = isChartLoadedRef.current;

      const flushTrade = chartTrades.length > 0 && isReadyToFlush;

      if (shouldAddToQueue) {
        if (event.channel === "chartTrades") {
          /* console.log("chart trades hahaha", event.data) */;
          chartTrades = event.data;
        }
      }

      if (flushTrade) {
        // console.log(
        //   "TRADINGVIEW PROGRESS: FLUSHING TRADE QUEUE...",
        //   chartTrades,
        // );
        flushTradeQueue();
      }

      subscribersMap.current?.forEach((sub) => {
        const currency: CurrencyChart =
          (localStorage.getItem("chart_currency") as CurrencyChart) || "SOL";

        const chartType: ChartType =
          (localStorage.getItem("chart_type") as ChartType) || "Price";

        if (sub) sub.lastMessageTimestamp = getCurrentServerTime();

        const selectedResolution = (
          localStorage.getItem("chart_interval_resolution") ||
          tvWidgetRef.current?.activeChart().resolution() ||
          cookies.get("_chart_interval_resolution") ||
          "1S"
        ).toUpperCase();

        if (selectedResolution !== sub.resolution) return;

        if (data?.letter) {
          // Marks
          const existingTrades = tradeMap.current.get(
            `${sub.mint}-${sub.resolution}`,
          );
          /* console.log("WS HOOK 📺 - chartToken | messages ", data) */;
          /* console.log("WS HOOK 📺 - chartToken | messages ", existingTrades) */;
          const convertedTrade: Trade = {
            ...(data as Trade),
            timestamp: (data as Trade)?.timestamp,
          };
          if (existingTrades) {
            existingTrades.push(convertedTrade);
          } else {
            tradeMap.current.set(`${sub.mint}-${sub.resolution}`, [
              convertedTrade,
            ]);
          }

          if (tvWidgetRef.current && tvWidgetRef.current?.activeChart) {
            tvWidgetRef.current?.activeChart()?.refreshMarks();
          }

          // Avg Price Line
          // ### BUY
          if (data.letter === "B") {
            const tradeStartTime = getBarStartTime(
              getCurrentServerTime(),
              sub.resolution,
            );
            removeAveragePriceLine(
              "buy",
              tvWidgetRef.current,
              buyAveragePriceShapeIdRef.current,
            );
            const priceByCurrency = parseFloat(
              currency === "SOL"
                ? (data as Trade).average_price_sol
                : (data as Trade).average_price_usd,
            );

            buyAveragePriceTradeStartTimeRef.current = tradeStartTime;
            if (chartType === "MCap") {
              buyAveragePriceShapePriceRef.current =
                priceByCurrency * Number((data as Trade).supply);
            } else {
              buyAveragePriceShapePriceRef.current = priceByCurrency;
            }

            // @ts-ignore
            buyAveragePriceShapeIdRef.current = addAveragePriceLine(
              "buy",
              tvWidgetRef.current,
              tradeStartTime,
              buyAveragePriceShapePriceRef.current,
            );
            if (
              localStorage.getItem("chart_hide_buy_avg_price_line") === "true"
            ) {
              removeAveragePriceLine(
                "buy",
                tvWidgetRef.current,
                buyAveragePriceShapeIdRef.current,
              );
            }
          }

          // ### SELL
          if (data.letter === "S") {
            const tradeStartTime = getBarStartTime(
              getCurrentServerTime(),
              sub.resolution,
            );
            removeAveragePriceLine(
              "sell",
              tvWidgetRef.current,
              sellAveragePriceShapeIdRef.current,
            );
            const priceByCurrency = parseFloat(
              currency === "SOL"
                ? (data as Trade).average_sell_price_sol
                : (data as Trade).average_sell_price_usd,
            );

            sellAveragePriceTradeStartTimeRef.current = tradeStartTime;
            if (chartType === "MCap") {
              sellAveragePriceShapePriceRef.current =
                priceByCurrency * Number((data as Trade).supply);
            } else {
              sellAveragePriceShapePriceRef.current = priceByCurrency;
            }

            // @ts-ignore
            sellAveragePriceShapeIdRef.current = addAveragePriceLine(
              "sell",
              tvWidgetRef.current,
              tradeStartTime,
              sellAveragePriceShapePriceRef.current,
            );
            if (
              localStorage.getItem("chart_hide_sell_avg_price_line") === "true"
            ) {
              removeAveragePriceLine(
                "sell",
                tvWidgetRef.current,
                sellAveragePriceShapeIdRef.current,
              );
            }
          }

          return;
        }

        if (data?.channel === "chartTrades") {
          if (data.length === 0 || data === undefined) return;

          // Marks
          const existingTrades = tradeMap.current.get(
            `${sub.mint}-${sub.resolution}`,
          );

          if (Array.isArray(data?.data)) {
            const convertedTrades = data?.data.map((trade: any) => {
              return {
                ...trade,
                timestamp: trade.timestamp,
              };
            });
            if (existingTrades) {
              convertedTrades?.forEach((trade: any) => {
                if (!trade) return;
                existingTrades?.push(trade);
              });
            } else {
              tradeMap.current.set(
                `${sub.mint}-${sub.resolution}`,
                convertedTrades,
              );
            }
          }

          if (tvWidgetRef.current && tvWidgetRef.current?.activeChart) {
            tvWidgetRef.current?.activeChart()?.refreshMarks();
          }

          // Avg Price Line
          const lastTrade = data[data.length - 1];
          if (!lastTrade) return;

          // ### BUY
          if (lastTrade.letter === "B") {
            const tradeStartTime = getBarStartTime(
              getCurrentServerTime(),
              sub.resolution,
            );
            removeAveragePriceLine(
              "buy",
              tvWidgetRef.current,
              buyAveragePriceShapeIdRef.current,
            );
            const priceByCurrency = parseFloat(
              currency === "SOL"
                ? lastTrade?.average_price_sol
                : lastTrade?.average_price_usd,
            );

            buyAveragePriceTradeStartTimeRef.current = tradeStartTime;
            if (chartType === "MCap") {
              buyAveragePriceShapePriceRef.current =
                priceByCurrency * Number(lastTrade?.supply);
            } else {
              buyAveragePriceShapePriceRef.current = priceByCurrency;
            }

            // @ts-ignore
            buyAveragePriceShapeIdRef.current = addAveragePriceLine(
              "buy",
              tvWidgetRef.current,
              tradeStartTime,
              buyAveragePriceShapePriceRef.current,
            );

            if (
              localStorage.getItem("chart_hide_buy_avg_price_line") === "true"
            ) {
              removeAveragePriceLine(
                "buy",
                tvWidgetRef.current,
                buyAveragePriceShapeIdRef.current,
              );
            }
          }

          // ### SELL
          if (lastTrade.letter === "S") {
            const tradeStartTime = getBarStartTime(
              getCurrentServerTime(),
              sub.resolution,
            );
            removeAveragePriceLine(
              "sell",
              tvWidgetRef.current,
              sellAveragePriceShapeIdRef.current,
            );
            const priceByCurrency = parseFloat(
              currency === "SOL"
                ? lastTrade?.average_sell_price_sol
                : lastTrade?.average_sell_price_usd,
            );

            sellAveragePriceTradeStartTimeRef.current = tradeStartTime;
            if (chartType === "MCap") {
              sellAveragePriceShapePriceRef.current =
                priceByCurrency * Number(lastTrade?.supply);
            } else {
              sellAveragePriceShapePriceRef.current = priceByCurrency;
            }

            // @ts-ignore
            sellAveragePriceShapeIdRef.current = addAveragePriceLine(
              "sell",
              tvWidgetRef.current,
              tradeStartTime,
              sellAveragePriceShapePriceRef.current,
            );
          }

          if (
            localStorage.getItem("chart_hide_sell_avg_price_line") === "true"
          ) {
            removeAveragePriceLine(
              "sell",
              tvWidgetRef.current,
              sellAveragePriceShapeIdRef.current,
            );
          }

          return;
        }
      });
    },
  });

  const candles = useRef<NovaChart | null>(null);
  const symbols = useRef<{
    name: string;
    symbol: string;
    image: string;
    dex: string;
  } | null>(null);
  const trade = useRef<NovaChartTrades | null>(null);

  useEffect(() => {
    if (!mint || !chartContainerRef?.current) return;

    let handleStorageChange: (e: StorageEvent) => void;

    const earlyFetch = async () => {
      /* console.log("TRADINGVIEW PROGRESS: earlyFetch") */;

      symbols.current = await queryClient.fetchQuery({
        queryKey: ["metadata", mint],
        queryFn: () => fetchResolveSymbol(mint),
        staleTime: 10000,
        gcTime: 10000,
      });

      const resolution = (
        localStorage.getItem("chart_interval_resolution") ||
        tvWidgetRef.current?.activeChart().resolution() ||
        cookies.get("_chart_interval_resolution") ||
        "1S"
      ).toUpperCase();

      /* console.log("early fetch: ", resolution) */;

      const currency: CurrencyChart =
        (localStorage.getItem("chart_currency") as CurrencyChart) || "SOL";

      // @ts-ignore
      const interval = PRICE_MAP[resolution];

      // @ts-ignore
      const from: number = getHistoricalFromInterval[interval];

      candles.current = await queryClient.fetchQuery({
        queryKey: [
          "candles",
          mint,
          currency.toLocaleLowerCase(),
          interval?.toLowerCase(),
        ],
        queryFn: () =>
          fetchHistoricalData({
            mint,
            interval,
            currency: currency.toLowerCase() as "sol" | "usd",
            from: getCurrentServerTime() - from,
            to: getCurrentServerTime() + 60,
            countBack: 10,
            initial: isInitialBarRef.current,
          }),
        staleTime: 10000,
        gcTime: 10000,
      });

      trade.current = await queryClientNormal.fetchQuery({
        queryKey: ["trades", mint],
        queryFn: () => fetchInitTradesData(mint),
        staleTime: 10000,
        gcTime: 10000,
        retry: 3,
      });

      if (trade.current) {
        if (trade.current.user_trades?.length === 0) {
          trade.current = await queryClientNormal.fetchQuery({
            queryKey: ["trades", mint],
            queryFn: () => fetchInitTradesData(mint),
            staleTime: 10000,
            gcTime: 10000,
            retry: false,
          });
        }
      }
    };

    earlyFetch();

    const loadChart = async () => {
      try {
        const initialWidgetOptions: ChartingLibraryWidgetOptions = {
          debug: false,
          symbol: mint,
          interval: getIntervalResolution(),
          time_frames: [
            { text: "3m", resolution: "60" as ResolutionString },
            { text: "1m", resolution: "30" as ResolutionString },
            { text: "5d", resolution: "5" as ResolutionString },
            { text: "1d", resolution: "1" as ResolutionString },
          ],
          container:
            chartContainerRef.current ||
            document.querySelector("#trading-view"),
          load_last_chart: true,
          fullscreen: false,
          autosize: true,
          library_path: "/static/charting_library/",
          locale: "en" as LanguageCode,
          timezone: getTimeZone(),
          enabled_features: [
            "timeframes_toolbar",
            "symbol_search_hot_key",
            "left_toolbar",
            "display_market_status",
            "seconds_resolution",
            "two_character_bar_marks_labels",
          ],
          disabled_features: [
            "study_templates",
            "header_symbol_search",
            "header_compare",
            "header_saveload",
            "header_quick_search",
            "symbol_search_hot_key",
            "symbol_info",
            "edit_buttons_in_legend",
            "create_volume_indicator_by_default",
          ],
          custom_font_family: "'Geist', sans-serif",
          custom_css_url: "../themed.css",
          overrides: {
            volumePaneSize: "large",
            "scalesProperties.fontSize": 11,
            "scalesProperties.textColor": "#FFFFFF",

            "paneProperties.legendProperties.showLegend": true,
            "paneProperties.legendProperties.showVolume": true,
            "paneProperties.legendProperties.showSeriesOHLC": true,
            "paneProperties.backgroundType": "solid",
            "paneProperties.background": "#080812",
            "paneProperties.vertGridProperties.color": "#1a1a2e",
            "paneProperties.horzGridProperties.color": "#1a1a2e",

            "mainSeriesProperties.candleStyle.upColor": "#8CD9B6",
            "mainSeriesProperties.candleStyle.downColor": "#F65B93",
            "mainSeriesProperties.candleStyle.borderUpColor": "#8CD9B6",
            "mainSeriesProperties.candleStyle.borderDownColor": "#F65B93",
            "mainSeriesProperties.candleStyle.wickUpColor": "#8CD9B6",
            "mainSeriesProperties.candleStyle.wickDownColor": "#F65B93",
          },
          studies_overrides: {
            "volume.volume.color.0": "#F65B93",
            "volume.volume.color.1": "#8CD9B6",
          },
          loading_screen: {
            backgroundColor: "#080812",
            foregroundColor: "#080812",
          },
          custom_formatters: {
            priceFormatterFactory: () => ({
              format: formatChartPrice,
            }),
            studyFormatterFactory: () => ({
              format: formatChartPrice,
            }),
          },
          theme: "dark",
          datafeed: {
            onReady: (callback) => {
              /* console.log("TRADINGVIEW PROGRESS: onReady") */;
              return callback({
                supported_resolutions: supportedResolutions,
                supports_marks: true,
                supports_time: true,
              });
            },
            searchSymbols: async (
              _userInput,
              _exchange,
              _symbolType,
              onResultReadyCallback,
            ) => {
              /* console.log("TRADINGVIEW PROGRESS: searchSymbols") */;
              onResultReadyCallback([]);
            },
            resolveSymbol: async (symbolName, onSymbolResolvedCallback) => {
              /* console.log("TRADINGVIEW PROGRESS: resolveSymbol") */;
              const url = new URL(window.location.href);
              const nameParam = url.searchParams.get("name") || symbolName;
              const symbolParam = url.searchParams.get("symbol") || "";
              const dexParam = url.searchParams.get("dex") || "";

              let name, symbol, dex;
              if (tokenData?.token) {
                name = tokenData?.token?.name;
                symbol = tokenData?.token?.symbol;
                dex = tokenData?.token?.dex;
              }

              if (symbols.current) {
                name = symbols.current.name;
                symbol = symbols.current.symbol;
                dex =
                  symbols.current.dex === "N/A"
                    ? dexParam
                    : symbols.current.dex;
              } else if (!nameParam || !symbolParam || !dexParam) {
                const res = await queryClient.fetchQuery({
                  queryKey: ["metadata", mint],
                  queryFn: () => fetchResolveSymbol(mint),
                  staleTime: 0,
                  gcTime: 0,
                  retry: 10,
                });
                name = res.name;
                symbol = res.symbol;
                dex = res.dex === "N/A" ? dexParam : res.dex;
              } else {
                name = nameParam;
                symbol = symbolParam;
                dex = dexParam;
              }

              // console.log("SP 💘 - TV TOKEN PARAMS ✨", {
              //   nameParam,
              //   symbolParam,
              //   dexParam,
              //   name,
              //   symbol,
              //   dex,
              // });

              const symbolInfo: LibrarySymbolInfo = {
                name: name,
                ticker: mint,
                description: `${
                  symbol
                }/${localStorage.getItem("chart_currency")} on ${dex} Nova`,
                type: "crypto",
                session: "24x7",
                timezone: getTimeZone(),
                exchange: "",
                listed_exchange: "",
                format: "price",
                minmov: 1,
                pricescale: 100_000_000_000,
                has_intraday: true,
                has_daily: true,
                has_weekly_and_monthly: false,
                has_seconds: true,
                seconds_multipliers: ["1", "5", "15", "30"],
                supported_resolutions: supportedResolutions,
                volume_precision: 8,
                data_status: "streaming",
              };

              onSymbolResolvedCallback(symbolInfo);
            },
            getBars: async (
              symbolInfo,
              resolution,
              periodParams,
              onHistoryCallback,
              onErrorCallback,
            ) => {
              /* console.log("TRADINGVIEW PROGRESS: getBars") */;
              console.warn(
                "TV DEBUG ✨ | GET BARS RUN 📊",
                getCurrentServerTime(),
              );
              currentSymbolInfo.current = symbolInfo;

              const { from, to, firstDataRequest, countBack } = periodParams;
              // console.log("WS HOOK 📺 - chartToken | getBars", {
              //   from,
              //   to,
              //   firstDataRequest,
              //   countBack,
              // });

              // console.log(
              //   "WS HOOK 📺 - chartToken | HEARTBEAT🛡️🛡️🎨🎨 getbars",
              //   {
              //     from: new Date(from * 1000).toLocaleTimeString(),
              //     to: new Date(to * 1000).toLocaleTimeString(),
              //     diffFromNow: getCurrentServerTime() / 1000 - from,
              //     diffToNow: to - getCurrentServerTime() / 1000,
              //     diffFromTo: to - from,
              //     countBack,
              //     ticker: symbolInfo.ticker,
              //     mint,
              //   },
              // );

              try {
                if (noDataRef.current) {
                  onHistoryCallback([], {
                    noData: true,
                  });
                  return;
                }

                const currency: CurrencyChart =
                  (localStorage.getItem("chart_currency") as CurrencyChart) ||
                  "SOL";
                const chartType: ChartType =
                  (localStorage.getItem("chart_type") as ChartType) || "Price";
                let bars;

                // @ts-ignore
                const interval = PRICE_MAP[resolution];

                const queryKey = [
                  "candles",
                  symbolInfo.ticker!,
                  currency?.toLowerCase(),
                  interval?.toLowerCase(),
                ];

                const cachedData: NovaChart | undefined =
                  queryClientNormal.getQueryData(queryKey);

                if (candles.current && isInitialBarRef.current) {
                  if (candles.current.supply) {
                    tokenSupplyRef.current = candles.current.supply;
                  }

                  // console.log("multi fetch - init exists", {
                  //   mint: symbolInfo.ticker!,
                  //   countBack,
                  //   initCandles: cachedData,
                  //   candles: candles.current,
                  // });

                  const sortedBars = candles.current.candles
                    .sort((a, b) => a.t - b.t)
                    .map((bar) => ({
                      time: getBarStartTime(bar.t, resolution),
                      open: getValueByType(
                        parseFloat(bar.o),
                        Number(tokenSupplyRef.current) || 1000000000,
                      ),
                      high: getValueByType(
                        parseFloat(bar.h),
                        Number(tokenSupplyRef.current) || 1000000000,
                      ),
                      low: getValueByType(
                        parseFloat(bar.l),
                        Number(tokenSupplyRef.current) || 1000000000,
                      ),
                      close: getValueByType(
                        parseFloat(bar.c),
                        Number(tokenSupplyRef.current) || 1000000000,
                      ),
                      volume: parseFloat(bar.v),
                    }));

                  bars = sortedBars;
                  isInitCandlesSettedRef.current = true;
                  if (isInitialBarRef.current) {
                    isInitialBarRef.current = false;
                  }
                  noDataRef.current = candles.current.no_data;
                  onHistoryCallback(bars, {
                    noData: candles.current.no_data,
                  });
                } else {
                  // @ts-ignore
                  const interval = PRICE_MAP[resolution] || "1s";

                  const fromMs = from * 1000;
                  const toMs = to * 1000;
                  // console.log("multi fetch - fetching historical data", {
                  //   from: new Date(fromMs).toLocaleTimeString(),
                  //   to: new Date(toMs).toLocaleTimeString(),
                  //   countBack,
                  // });

                  const res = await queryClient.fetchQuery({
                    queryKey: [
                      "candles",
                      mint,
                      currency.toLocaleLowerCase(),
                      interval?.toLowerCase(),
                    ],
                    queryFn: () =>
                      fetchHistoricalData({
                        mint: symbolInfo.ticker!,
                        interval,
                        currency: currency.toLowerCase() as "sol" | "usd",
                        from: fromMs,
                        to: toMs,
                        countBack,
                        initial: isInitialBarRef.current,
                      }),
                    staleTime: 0,
                    gcTime: 0,
                    retry: 10,
                  });

                  isInitCandlesSettedRef.current = true;
                  if (res.success === false) {
                    // console.log(
                    //   "BALALLALLLLAAA✨✨22",
                    //   isInitialNoDataRef.current,
                    // );
                    isInitialNoDataRef.current = true;
                    onHistoryCallback([], {
                      noData: true,
                    });
                    return;
                  }

                  if (res.supply) {
                    tokenSupplyRef.current = res.supply;
                  }

                  const { candles, no_data } = res;

                  if (isInitialBarRef.current) {
                    isInitialBarRef.current = false;
                  }

                  noDataRef.current = no_data;

                  const sortedBars = candles
                    .sort((a, b) => a.t - b.t)
                    .map((bar) => ({
                      time: getBarStartTime(bar.t, resolution),
                      raw: bar, // store raw values to use in second pass
                    }));

                  const adjustedBars: Bar[] = [];
                  let prevClose: number | null = null;
                  const supply =
                    Number(tokenSupplyRef.current) || 1_000_000_000;

                  for (const { time, raw } of sortedBars) {
                    const openRaw = parseFloat(raw.o);
                    const highRaw = parseFloat(raw.h);
                    const lowRaw = parseFloat(raw.l);
                    const closeRaw = parseFloat(raw.c);
                    const volume = parseFloat(raw.v);

                    let close = getValueByType(closeRaw, supply);
                    let open = prevClose ?? getValueByType(openRaw, supply);
                    let high = Math.max(
                      open,
                      close,
                      getValueByType(highRaw, supply),
                    );
                    let low = Math.min(
                      open,
                      close,
                      getValueByType(lowRaw, supply),
                    );

                    adjustedBars.push({
                      time,
                      open,
                      high,
                      low,
                      close,
                      volume,
                    });

                    prevClose = close;
                  }

                  bars = adjustedBars;
                  if (no_data && bars.length === 0) {
                    /* console.log("BALALLALLLLAAA✨✨222", no_data, bars.length) */;
                    isInitialNoDataRef.current = true;
                  }
                  onHistoryCallback(bars, { noData: no_data });
                }
                isQueueMessage.current = false;

                if (tvWidgetRef.current) {
                  tvWidgetRef.current.activeChart()?.refreshMarks();
                }

                if (firstDataRequest) {
                  lastBarRef.current[resolution] = bars[bars.length - 1];

                  updateTitle(
                    lastBarRef.current[resolution].high,
                    symbolInfo?.name as string,
                    previousPriceRef,
                  );

                  if (trade.current) {
                    const {
                      developer_trades,
                      insider_trades,
                      other_trades,
                      sniper_trades,
                      user_trades,
                    } = trade.current;
                    // console.log(
                    //   "TRADINGVIEW PROGRESS: use trade cache",
                    //   trade.current,
                    // );

                    const convertedTimestampUniqueUserTrades = getUniqueTrades(
                      user_trades,
                    ).map((trade) => {
                      if (String(trade.timestamp).length < 13) {
                        return {
                          ...trade,
                          timestamp: Math.floor(trade.timestamp * 1000),
                        };
                      }
                      return trade;
                    });

                    const tradeKey = `${symbolInfo.ticker}-${resolution}`;
                    tradeMap.current.set(
                      tradeKey,
                      [
                        ...developer_trades,
                        ...insider_trades,
                        ...other_trades,
                        ...sniper_trades,
                        ...convertedTimestampUniqueUserTrades,
                      ].filter((tx) => {
                        if (
                          tx.timestamp === 0 ||
                          isNaN(Number(tx.price)) ||
                          tx.price === "NaN"
                        ) {
                          return false;
                        }

                        return true;
                      }),
                    );

                    setUserTrades(user_trades);

                    if (tvWidgetRef.current) {
                      tvWidgetRef.current.activeChart()?.refreshMarks();
                    }

                    const tradeStartTime = getBarStartTime(
                      getCurrentServerTime(),
                      resolution,
                    );

                    if (user_trades.length === 0) return;

                    const lastUserTrade = user_trades[user_trades.length - 1];
                    removeAveragePriceLine(
                      "buy",
                      tvWidgetRef.current,
                      buyAveragePriceShapeIdRef.current,
                    );
                    removeAveragePriceLine(
                      "sell",
                      tvWidgetRef.current,
                      sellAveragePriceShapeIdRef.current,
                    );
                    const buyPriceByCurrency = parseFloat(
                      currency === "SOL"
                        ? lastUserTrade.average_price_sol
                        : lastUserTrade.average_price_usd,
                    );
                    const sellPriceByCurrency = parseFloat(
                      currency === "SOL"
                        ? lastUserTrade.average_sell_price_sol
                        : lastUserTrade.average_sell_price_usd,
                    );

                    buyAveragePriceTradeStartTimeRef.current = tradeStartTime;
                    sellAveragePriceTradeStartTimeRef.current = tradeStartTime;
                    if (chartType === "MCap") {
                      buyAveragePriceShapePriceRef.current =
                        buyPriceByCurrency * Number(lastUserTrade.supply);
                      sellAveragePriceShapePriceRef.current =
                        sellPriceByCurrency * Number(lastUserTrade.supply);
                    } else {
                      buyAveragePriceShapePriceRef.current = buyPriceByCurrency;
                      sellAveragePriceShapePriceRef.current =
                        sellPriceByCurrency;
                    }

                    if (
                      localStorage.getItem("chart_hide_buy_avg_price_line") ===
                      "false"
                    ) {
                      // @ts-ignore
                      buyAveragePriceShapeIdRef.current = addAveragePriceLine(
                        "buy",
                        tvWidgetRef.current,
                        tradeStartTime,
                        buyAveragePriceShapePriceRef.current,
                      );
                    }
                    if (
                      localStorage.getItem("chart_hide_sell_avg_price_line") ===
                      "false"
                    ) {
                      // @ts-ignore
                      sellAveragePriceShapeIdRef.current = addAveragePriceLine(
                        "sell",
                        tvWidgetRef.current,
                        tradeStartTime,
                        sellAveragePriceShapePriceRef.current,
                      );
                    }
                  } else {
                    let trade = await queryClientNormal.fetchQuery({
                      queryKey: ["trades", symbolInfo.ticker!],
                      queryFn: () => fetchInitTradesData(symbolInfo.ticker!),
                      staleTime: 0,
                      gcTime: 0,
                      retry: 10,
                    });

                    if (trade.user_trades.length === 0) {
                      trade = await queryClientNormal.fetchQuery({
                        queryKey: ["trades", mint],
                        queryFn: () => fetchInitTradesData(mint),
                        staleTime: 0,
                        gcTime: 0,
                        retry: false,
                      });
                    }

                    const {
                      developer_trades,
                      insider_trades,
                      other_trades,
                      sniper_trades,
                      user_trades,
                    } = trade;

                    /* console.log("TRADINGVIEW PROGRESS: fetching trades", trade) */;

                    const convertedTimestampUniqueUserTrades = getUniqueTrades(
                      user_trades,
                    ).map((trade) => {
                      if (String(trade.timestamp).length < 13) {
                        return {
                          ...trade,
                          timestamp: Math.floor(trade.timestamp * 1000),
                        };
                      }
                      return trade;
                    });

                    const tradeKey = `${symbolInfo.ticker}-${resolution}`;
                    tradeMap.current.set(
                      tradeKey,
                      [
                        ...developer_trades,
                        ...insider_trades,
                        ...other_trades,
                        ...sniper_trades,
                        ...convertedTimestampUniqueUserTrades,
                      ].filter((tx) => {
                        if (
                          tx.timestamp === 0 ||
                          isNaN(Number(tx.price)) ||
                          tx.price === "NaN"
                        ) {
                          return false;
                        }

                        return true;
                      }),
                    );

                    setUserTrades(user_trades);

                    if (tvWidgetRef.current) {
                      tvWidgetRef.current.activeChart()?.refreshMarks();
                    }

                    const tradeStartTime = getBarStartTime(
                      getCurrentServerTime(),
                      resolution,
                    );

                    if (user_trades.length === 0) return;

                    const lastUserTrade = user_trades[user_trades.length - 1];
                    removeAveragePriceLine(
                      "buy",
                      tvWidgetRef.current,
                      buyAveragePriceShapeIdRef.current,
                    );
                    removeAveragePriceLine(
                      "sell",
                      tvWidgetRef.current,
                      sellAveragePriceShapeIdRef.current,
                    );
                    const buyPriceByCurrency = parseFloat(
                      currency === "SOL"
                        ? lastUserTrade.average_price_sol
                        : lastUserTrade.average_price_usd,
                    );
                    const sellPriceByCurrency = parseFloat(
                      currency === "SOL"
                        ? lastUserTrade.average_sell_price_sol
                        : lastUserTrade.average_sell_price_usd,
                    );

                    buyAveragePriceTradeStartTimeRef.current = tradeStartTime;
                    sellAveragePriceTradeStartTimeRef.current = tradeStartTime;
                    if (chartType === "MCap") {
                      buyAveragePriceShapePriceRef.current =
                        buyPriceByCurrency * Number(lastUserTrade.supply);
                      sellAveragePriceShapePriceRef.current =
                        sellPriceByCurrency * Number(lastUserTrade.supply);
                    } else {
                      buyAveragePriceShapePriceRef.current = buyPriceByCurrency;
                      sellAveragePriceShapePriceRef.current =
                        sellPriceByCurrency;
                    }

                    if (
                      localStorage.getItem("chart_hide_buy_avg_price_line") ===
                      "false"
                    ) {
                      // @ts-ignore
                      buyAveragePriceShapeIdRef.current = addAveragePriceLine(
                        "buy",
                        tvWidgetRef.current,
                        tradeStartTime,
                        buyAveragePriceShapePriceRef.current,
                      );
                    }
                    if (
                      localStorage.getItem("chart_hide_sell_avg_price_line") ===
                      "false"
                    ) {
                      // @ts-ignore
                      sellAveragePriceShapeIdRef.current = addAveragePriceLine(
                        "sell",
                        tvWidgetRef.current,
                        tradeStartTime,
                        sellAveragePriceShapePriceRef.current,
                      );
                    }
                  }
                }
              } catch (error) {
                onErrorCallback(error as string);

                Sentry.captureMessage(
                  `Error getting bars 🔴 – (Trading View) | Error: ${error?.toString()}`,
                  "error",
                );
              }
            },
            getMarks: (symbolInfo, _from, _to, onDataCallback, resolution) => {
              /* console.log("TRADINGVIEW PROGRESS: getMarks") */;
              console.warn(
                "TV DEBUG ✨ | GET MARKS RUN 🔖",
                getCurrentServerTime(),
              );

              if (tvWidgetRef.current)
                tvWidgetRef.current.activeChart()?.clearMarks();

              const tradeKey = `${symbolInfo.ticker}-${resolution}`;
              const trades = tradeMap.current.get(tradeKey) || [];
              const processEmptySupplyAndLetterTrades = trades?.map((trade) => {
                const { letter, imageUrl } = trade;

                const isMyTrade = letter.length === 1 && !imageUrl;
                const isSniperTrade = letter.length === 2 && letter[0] === "S";
                const isDevTrade = letter.length === 2 && letter[0] === "D";
                const isInsiderTrade = letter.length === 2 && letter[0] === "I";
                const isTrackedTrade = letter.length === 1 && imageUrl;

                return {
                  ...trade,
                  name:
                    isMyTrade ||
                    isSniperTrade ||
                    isDevTrade ||
                    isInsiderTrade ||
                    isTrackedTrade
                      ? "NOT"
                      : trade.name,
                  supply: String(tokenSupplyRef.current) || "1000000000",
                };
              });

              if (!trades) {
                onDataCallback([]);
                return;
              }

              const uniqueTrades = getUniqueTrades(
                filterTrades(
                  processEmptySupplyAndLetterTrades,
                  tradeFilters.current,
                ),
              );
              const adjustedTimestampTrades = adjustTimestamps(uniqueTrades);

              const marks: Mark[] = uniqueTrades.map((trade) => {
                const handledEpochAndTimestampValue =
                  String(trade.timestamp).length > 10
                    ? Math.floor(trade.timestamp / 1000)
                    : trade.timestamp;

                const isMyTrade = trade.letter.length === 1 && !trade.imageUrl;
                const isSniperTrade =
                  trade.letter.length === 2 && trade.letter[0] === "S";
                const isDevTrade =
                  trade.letter.length === 2 && trade.letter[0] === "D";
                const isInsiderTrade =
                  trade.letter.length === 2 && trade.letter[0] === "I";
                const isTrackedTrade =
                  trade.letter.length === 1 && trade.imageUrl;
                const otherTradeAdditionalInfo =
                  trackedWalletsList.find((tw) => tw.address === trade.wallet)
                    ?.name || trade?.name;

                if (isTrackedTrade) {
                  type MarkColorBGIdentifier =
                    | "/icons/token/actions/fish.svg"
                    | "/icons/token/actions/whale.svg"
                    | "/icons/token/actions/dolphin.svg";
                  const markColorMap = {
                    "/icons/token/actions/fish.svg": {
                      border: trade?.letter === "B" ? "#24b39b" : "#f23545",
                      background: "#FFF",
                    },
                    "/icons/token/actions/whale.svg": {
                      border: trade?.letter === "B" ? "#24b39b" : "#f23545",
                      background: "#FFF",
                    },
                    "/icons/token/actions/dolphin.svg": {
                      border: trade?.letter === "B" ? "#24b39b" : "#f23545",
                      background: "#FFF",
                    },
                  };

                  return {
                    id: `${trade.timestamp.toString()}-${trade?.signature}-${trade?.letter}`,
                    time: handledEpochAndTimestampValue,
                    color: markColorMap[
                      trade.imageUrl as MarkColorBGIdentifier
                    ] as MarkCustomColor,
                    text: generateMarkText(
                      trade.wallet,
                      trade.letter as TradeLetter,
                      trade.token_amount,
                      trade.price,
                      trade.price_usd,
                      handledEpochAndTimestampValue,
                      Number(trade.supply),
                      undefined,
                      trade.colour,
                      trade.imageUrl,
                    ),
                    label: trade.letter ? trade.letter : "U",
                    labelFontColor:
                      trade?.letter === "B" ? "#24b39b" : "#f23545",
                    minSize: 25,
                  };
                } else if (
                  isMyTrade ||
                  isSniperTrade ||
                  isDevTrade ||
                  isInsiderTrade
                ) {
                  return {
                    id: `${trade.timestamp.toString()}-${trade?.signature}-${trade?.letter}`,
                    time: handledEpochAndTimestampValue,
                    color: trade.colour as MarkConstColors,
                    text: generateMarkText(
                      trade.wallet,
                      trade.letter as TradeLetter,
                      trade.token_amount,
                      trade.price,
                      trade.price_usd,
                      handledEpochAndTimestampValue,
                      Number(trade.supply),
                      undefined,
                      trade.colour,
                      undefined,
                    ),
                    label: trade.letter ? trade.letter : "U",
                    labelFontColor: "#ffffff",
                    minSize: 25,
                  };
                } else {
                  return {
                    id: `${trade.timestamp.toString()}-${trade?.signature}-${trade?.letter}`,
                    time: handledEpochAndTimestampValue,
                    color: trade.colour as MarkConstColors,
                    text: generateMarkText(
                      trade.wallet,
                      trade.letter as TradeLetter,
                      trade.token_amount,
                      trade.price,
                      trade.price_usd,
                      handledEpochAndTimestampValue,
                      Number(trade.supply),
                      otherTradeAdditionalInfo || undefined,
                      trade.colour,
                      undefined,
                    ),
                    label: trade.letter ? trade.letter : "U",
                    labelFontColor: "#ffffff",
                    minSize: 25,
                  };
                }
              });

              const uniqueMarks = getUniqueMarks(marks);

              console.warn("MARKS DEBUG ✨", {
                trades,
                uniqueTrades,
                adjustedTimestampTrades,
                result: adjustedTimestampTrades.filter(
                  (tx) => tx.adjusted === true,
                ),
                marks,
                uniqueMarks,
              });

              onDataCallback(uniqueMarks);

              setIsLoadingMarks(false);
              isQueueMessage.current = false;
            },
            subscribeBars: (
              symbolInfo,
              resolution,
              onRealtimeCallback,
              subscriberUID,
              onResetCacheNeededCallback,
            ) => {
              /* console.log("TRADINGVIEW PROGRESS: subscribeBars") */;
              // console.log(
              //   `👌 WS HOOK 📺 - chartToken | subscribeBars called for ${subscriberUID} (${resolution})`,
              // );
              subscribersMap.current.set(subscriberUID, {
                resolution,
                callback: onRealtimeCallback,
                mint: symbolInfo.ticker,
                lastMessageTimestamp: 0,
                symbolInfo,
                lastbarRef: lastBarRef.current,
                onResetCacheNeededCallback,
              });

              sendTokenMessage({
                channel: mint,
                action: "join",
                from: getCurrentServerTime(),
              });
              isQueueMessage.current = false;
            },
            unsubscribeBars: (subscriberUID) => {
              /* console.log("TRADINGVIEW PROGRESS: unsubscribeBars") */;
              // console.log(
              //   `👌 WS HOOK 📺 - chartToken | unsubscribeBars called for ${subscriberUID}`,
              // );
              const sub = subscribersMap.current.get(subscriberUID);
              if (sub) {
                subscribersMap.current.delete(subscriberUID);
                reconnectDelays.current.delete(subscriberUID);
                // console.log(
                //   `👌 WS HOOK 📺 - chartToken | Subscriber ${subscriberUID} removed.`,
                // );

                if (subscribersMap.current.size === 0) {
                  // console.log(
                  //   "👌 WS HOOK 📺 - chartToken | All subscribers removed, setting state to disconnected.",
                  // );
                }
              } else {
                console.warn(
                  `👌 WS HOOK 📺 - chartToken | Attempted to unsubscribe non-existent UID: ${subscriberUID}`,
                );
              }
            },
          },
        };

        const initChart = () => {
          loadCount.current = 0;
          dropdownApiRef.current = null;
          buyAveragePriceShapeIdRef.current = null;
          sellAveragePriceShapeIdRef.current = null;
          isInitialBarRef.current = true;
          noDataRef.current = null;

          if (reconnectTimeoutInitSocketRef.current) {
            clearTimeout(reconnectTimeoutInitSocketRef.current);
          }

          resetCurrentTokenDeveloperTradesState();

          if (!chartContainerRef.current) {
            console.error("Chart container ref is null");
            return;
          }

          const defaultFilters = JSON.stringify([
            "dev_trades",
            "sniper_trades",
            "insider_trades",
            "tracked_trades",
            "other_trades",
            "my_trades",
          ]);

          const savedFilters =
            localStorage.getItem("chart_trade_filters") || defaultFilters;
          if (savedFilters) {
            const parsedFilters = JSON.parse(savedFilters) as TradeFilter[];
            tradeFilters.current.clear();
            parsedFilters?.forEach((filter) =>
              filter ? tradeFilters.current.add(filter) : null,
            );
          }

          if (!window.TradingView?.widget) {
            reinitChartTimeoutRef.current = setTimeout(() => {
              initChart();
            }, 100);
          }

          if (window?.TradingView?.widget) {
            // @ts-ignore
            tvWidgetRef.current = new window.TradingView.widget(
              initialWidgetOptions,
            );
          }

          if (tvWidgetRef.current) {
            tvWidgetRef.current!.onChartReady(() => {
              /* console.log("TRADINGVIEW PROGRESS: onChartReady") */;

              isChartLoadedRef.current = true;

              tvWidgetRef.current!.setCSSCustomProperty(
                "--tv-spinner-color",
                "#ffffff",
              );
              tvWidgetRef.current!.setCSSCustomProperty(
                "--themed-color-ui-loading-indicator-bg",
                "#ffffff",
              );
              tvWidgetRef.current!.headerReady().then(() => {
                setIsTvChartReady(true);
                setTvWidgetReady(true);

                if (!intervalStudiesRef.current) {
                  intervalStudiesRef.current = setInterval(() => {
                    if (!tvWidgetRef.current) return;

                    const studies = tvWidgetRef?.current
                      ?.activeChart?.()
                      ?.getAllStudies?.();
                    if (!Array.isArray(studies) || isReseting.current) return;
                    localStorage.setItem(
                      "chart_studies",
                      JSON.stringify(studies),
                    );
                  }, 5000);
                }
                if (tvWidgetRef.current) {
                  const studies = JSON.parse(
                    localStorage.getItem("chart_studies") as string,
                  );
                  /* console.log("TV DEBUG ✨ | APPLY INDICATOR", studies) */;
                  if (Array.isArray(studies)) {
                    studies?.forEach(async (study) => {
                      const detailStudy = await tvWidgetRef.current
                        ?.activeChart?.()
                        ?.createStudy?.(study.name, false);
                      /* console.log("TV DEBUG ✨ | APPLY INDICATOR", detailStudy) */;
                    });
                  }
                }
                tvWidgetRef.current
                  ?.activeChart()
                  .onIntervalChanged()
                  .subscribe(null, async (interval) => {
                    isQueueMessage.current = true;
                    trade.current = null;
                    candles.current = null;

                    // console.log(
                    //   "TRADINGVIEW PROGRESS: INTERVAL CHANGED",
                    //   lastBarRef.current,
                    // );
                    isInitialBarRef.current = true;
                    noDataRef.current = null;
                    localStorage.setItem("chart_interval_resolution", interval);
                    cookies.set("_chart_interval_resolution", interval);
                    setIsLoadingMarks(true);
                  });

                const currency: CurrencyChart =
                  (localStorage.getItem("chart_currency") as CurrencyChart) ||
                  "SOL";
                const switchCurrencyButton =
                  tvWidgetRef.current!.createButton();
                switchCurrencyButton.setAttribute("title", "Switch Currency");
                switchCurrencyButton.classList.add("apply-common-tooltip");
                switchCurrencyButton.addEventListener("click", () => {
                  if (!tvWidgetRef.current) return;

                  if (currency === "SOL") {
                    localStorage.setItem("chart_currency", "USD");
                    currencyRef.current = "USD";
                    cookies.set("_chart_currency", "USD");
                  } else {
                    localStorage.setItem("chart_currency", "SOL");
                    currencyRef.current = "SOL";
                    cookies.set("_chart_currency", "SOL");
                  }
                  trade.current = null;
                  candles.current = null;
                  setTvWidgetReady(false);
                  setIsTvChartReady(false);
                  setIsLoadingMarks(true);
                  resetChart();
                });
                switchCurrencyButton.style.cursor = "pointer";
                switchCurrencyButton.innerHTML =
                  currency === "USD" ? "Switch to SOL" : "Switch to USD";

                const chartType: ChartType =
                  (localStorage.getItem("chart_type") as ChartType) || "Price";
                const switchChartTypeButton =
                  tvWidgetRef.current!.createButton();
                switchChartTypeButton.setAttribute(
                  "title",
                  "Switch Chart Type",
                );
                switchChartTypeButton.classList.add("apply-common-tooltip");
                switchChartTypeButton.addEventListener("click", () => {
                  if (!tvWidgetRef.current?.activeChart()) return;

                  if (chartType === "Price") {
                    localStorage.setItem("chart_type", "MCap");
                    isInitialPriceMessageRef.current = true;
                  } else {
                    localStorage.setItem("chart_type", "Price");
                    isInitialPriceMessageRef.current = true;
                  }

                  trade.current = null;
                  candles.current = null;
                  setTvWidgetReady(false);
                  setIsTvChartReady(false);
                  setIsLoadingMarks(true);
                  resetChart();
                });
                switchChartTypeButton.style.cursor = "pointer";
                switchChartTypeButton.innerHTML =
                  chartType === "Price"
                    ? "<span style='color: #e799ff; font-weight: 700;'>Price</span>/MC"
                    : "Price/<span style='color: #e799ff; font-weight: 700;'>MC</span>";

                if (!dropdownApiRef.current) {
                  updateTradeFilters(
                    tvWidgetRef.current,
                    tradeFilters.current,
                    dropdownApiRef.current,
                  ).then((newDropdownApi) => {
                    dropdownApiRef.current = newDropdownApi;
                  });
                }

                const hideBuyAveragePriceLineButton =
                  tvWidgetRef.current!.createButton();
                hideBuyAveragePriceLineButton.setAttribute(
                  "title",
                  "Hide Buy Average Price Line",
                );
                hideBuyAveragePriceLineButton.classList.add(
                  "apply-common-tooltip",
                );
                hideBuyAveragePriceLineButton.style.cursor = "pointer";

                const currentShowBuyAvgPriceLineState =
                  (localStorage.getItem("chart_hide_buy_avg_price_line") as
                    | "true"
                    | "false") || "false";
                hideBuyAveragePriceLineButton.innerHTML =
                  currentShowBuyAvgPriceLineState === "true"
                    ? "Show Buy Avg Price Line"
                    : "Hide Buy Avg Price Line";

                hideBuyAveragePriceLineButton.addEventListener("click", () => {
                  if (!tvWidgetRef.current?.activeChart()) return;

                  const hideAveragePriceLine =
                    (localStorage.getItem("chart_hide_buy_avg_price_line") as
                      | "true"
                      | "false") || "false";

                  const newState =
                    hideAveragePriceLine === "true" ? "false" : "true";
                  localStorage.setItem(
                    "chart_hide_buy_avg_price_line",
                    newState,
                  );

                  if (newState === "false") {
                    removeAveragePriceLine(
                      "buy",
                      tvWidgetRef.current,
                      buyAveragePriceShapeIdRef.current,
                    );

                    // @ts-ignore
                    buyAveragePriceShapeIdRef.current = addAveragePriceLine(
                      "buy",
                      tvWidgetRef.current,
                      buyAveragePriceTradeStartTimeRef.current!,
                      buyAveragePriceShapePriceRef.current!,
                    );
                  } else if (buyAveragePriceShapeIdRef.current) {
                    removeAveragePriceLine(
                      "buy",
                      tvWidgetRef.current,
                      buyAveragePriceShapeIdRef.current,
                    );
                    buyAveragePriceShapeIdRef.current = null;
                  }

                  hideBuyAveragePriceLineButton.innerHTML =
                    newState === "true"
                      ? "Show Buy Avg Price Line"
                      : "Hide Buy Avg Price Line";
                });

                const hideSellAveragePriceLineButton =
                  tvWidgetRef.current!.createButton();
                hideSellAveragePriceLineButton.setAttribute(
                  "title",
                  "Hide Sell Average Price Line",
                );
                hideSellAveragePriceLineButton.classList.add(
                  "apply-common-tooltip",
                );
                hideSellAveragePriceLineButton.style.cursor = "pointer";

                const currentShowSellAvgPriceLineState =
                  (localStorage.getItem("chart_hide_sell_avg_price_line") as
                    | "true"
                    | "false") || "false";
                hideSellAveragePriceLineButton.innerHTML =
                  currentShowSellAvgPriceLineState === "true"
                    ? "Show Sell Avg Price Line"
                    : "Hide Sell Avg Price Line";

                hideSellAveragePriceLineButton.addEventListener("click", () => {
                  if (!tvWidgetRef.current?.activeChart()) return;

                  const hideAveragePriceLine =
                    (localStorage.getItem("chart_hide_sell_avg_price_line") as
                      | "true"
                      | "false") || "false";

                  const newState =
                    hideAveragePriceLine === "true" ? "false" : "true";
                  localStorage.setItem(
                    "chart_hide_sell_avg_price_line",
                    newState,
                  );

                  if (newState === "false") {
                    removeAveragePriceLine(
                      "sell",
                      tvWidgetRef.current,
                      sellAveragePriceShapeIdRef.current,
                    );

                    // @ts-ignore
                    sellAveragePriceShapeIdRef.current = addAveragePriceLine(
                      "sell",
                      tvWidgetRef.current,
                      sellAveragePriceTradeStartTimeRef.current!,
                      sellAveragePriceShapePriceRef.current!,
                    );
                  } else if (sellAveragePriceShapeIdRef.current) {
                    removeAveragePriceLine(
                      "sell",
                      tvWidgetRef.current,
                      sellAveragePriceShapeIdRef.current,
                    );
                    sellAveragePriceShapeIdRef.current = null;
                  }

                  hideSellAveragePriceLineButton.innerHTML =
                    newState === "true"
                      ? "Show Sell Avg Price Line"
                      : "Hide Sell Avg Price Line";
                });

                const resetThemeButton = tvWidgetRef.current!.createButton();
                resetThemeButton.setAttribute("title", "Reset to Nova Theme");
                resetThemeButton.classList.add("apply-common-tooltip");
                resetThemeButton.addEventListener("click", () => {
                  if (!tvWidgetRef.current?.activeChart()) return;

                  localStorage.setItem(
                    "tradingview.chartproperties",
                    JSON.stringify(defaultTVChartProperties),
                  );

                  localStorage.setItem(
                    "tradingview.chartproperties.mainSeriesProperties",
                    JSON.stringify(
                      defaultTVChartPropertiesMainSeriesProperties,
                    ),
                  );

                  setTvWidgetReady(false);
                  setIsTvChartReady(false);
                  setIsLoadingMarks(true);
                  resetChart();
                });
                resetThemeButton.style.cursor = "pointer";
                resetThemeButton.innerHTML = "Reset Theme";

                const arrowRightButton = tvWidgetRef.current!.createButton();
                arrowRightButton.setAttribute("title", "Scroll to Latest Bar");
                arrowRightButton.classList.add("apply-common-tooltip");
                arrowRightButton.addEventListener("click", () => {
                  if (!tvWidgetRef.current?.activeChart()) return;
                  tvWidgetRef.current.activeChart().executeActionById("timeScaleReset");
                });
                arrowRightButton.style.cursor = "pointer";
                arrowRightButton.innerHTML = `
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                `;
              });
            });
          }
        };

        const resetChart = (
          newOptions: Partial<ChartingLibraryWidgetOptions> = {},
        ) => {
          isReseting.current = true;
          if (tvWidgetRef.current) {
            const studies = JSON.parse(
              localStorage.getItem("chart_studies") as string,
            );
            /* console.log("TV DEBUG ✨ | APPLY INDICATOR", studies) */;
            if (Array.isArray(studies)) {
              studies?.forEach(async (study) => {
                const detailStudy = await tvWidgetRef.current
                  ?.activeChart?.()
                  ?.createStudy?.(study.name, false);
                /* console.log("TV DEBUG ✨ | APPLY INDICATOR", detailStudy) */;
              });
            }
          }

          if (tvWidgetRef.current) {
            tvWidgetRef.current.remove();
            loadCount.current = 0;
            dropdownApiRef.current = null;
            buyAveragePriceShapeIdRef.current = null;
            sellAveragePriceShapeIdRef.current = null;
            isInitialBarRef.current = true;
            noDataRef.current = null;
            resetCurrentTokenDeveloperTradesState();
          }

          if (!chartContainerRef.current) {
            console.error("Chart container ref is null");
            return;
          }

          const savedFilters = localStorage.getItem("chart_trade_filters");
          if (savedFilters) {
            const parsedFilters = JSON.parse(savedFilters) as TradeFilter[];
            tradeFilters.current.clear();
            parsedFilters?.forEach((filter) =>
              filter ? tradeFilters.current.add(filter) : null,
            );
          }

          const currentInterval = getIntervalResolution();
          const updatedOptions: ChartingLibraryWidgetOptions = {
            ...initialWidgetOptions,
            interval: currentInterval,
            ...newOptions,
          };

          if (!window.TradingView?.widget) {
            reinitChartTimeoutRef.current = setTimeout(() => {
              initChart();
            }, 100);
          }
          // @ts-ignore
          tvWidgetRef.current = new window.TradingView.widget(updatedOptions);
          tvWidgetRef.current!.onChartReady(() => {
            isReseting.current = false;
            tvWidgetRef.current!.setCSSCustomProperty(
              "--tv-spinner-color",
              "#ffffff",
            );
            tvWidgetRef.current!.setCSSCustomProperty(
              "--themed-color-ui-loading-indicator-bg",
              "#ffffff",
            );
            tvWidgetRef.current!.headerReady().then(() => {
              setIsTvChartReady(true);
              setTvWidgetReady(true);

              if (tvWidgetRef.current) {
                const studies = JSON.parse(
                  localStorage.getItem("chart_studies") as string,
                );
                /* console.log("TV DEBUG ✨ | APPLY INDICATOR", studies) */;
                if (Array.isArray(studies)) {
                  studies?.forEach(async (study) => {
                    const detailStudy = await tvWidgetRef.current
                      ?.activeChart?.()
                      ?.createStudy?.(study.name, false);
                    /* console.log("TV DEBUG ✨ | APPLY INDICATOR", detailStudy) */;
                  });
                }
              }

              tvWidgetRef.current
                ?.activeChart()
                .onIntervalChanged()
                .subscribe(null, async (interval) => {
                  trade.current = null;
                  candles.current = null;
                  isQueueMessage.current = true;
                  isInitialBarRef.current = true;
                  noDataRef.current = null;
                  localStorage.setItem("chart_interval_resolution", interval);
                  cookies.set("_chart_interval_resolution", interval);
                  setIsLoadingMarks(true);
                });

              const currency: CurrencyChart =
                (localStorage.getItem("chart_currency") as CurrencyChart) ||
                "SOL";
              const switchCurrencyButton = tvWidgetRef.current!.createButton();
              switchCurrencyButton.setAttribute("title", "Switch Currency");
              switchCurrencyButton.classList.add("apply-common-tooltip");
              switchCurrencyButton.addEventListener("click", () => {
                if (!tvWidgetRef.current) return;

                const newCurrency = currency === "SOL" ? "USD" : "SOL";

                // Persist the new currency
                localStorage.setItem("chart_currency", newCurrency);
                currencyRef.current = newCurrency;
                cookies.set("_chart_currency", newCurrency);

                trade.current = null;
                candles.current = null;
                setTvWidgetReady(false);
                setIsTvChartReady(false);
                setIsLoadingMarks(true);
                resetChart();
              });
              switchCurrencyButton.style.cursor = "pointer";
              switchCurrencyButton.innerHTML =
                currency === "USD" ? "Switch to SOL" : "Switch to USD";

              const chartType: ChartType =
                (localStorage.getItem("chart_type") as ChartType) || "Price";
              const switchChartTypeButton = tvWidgetRef.current!.createButton();
              switchChartTypeButton.setAttribute("title", "Switch Chart Type");
              switchChartTypeButton.classList.add("apply-common-tooltip");
              switchChartTypeButton.addEventListener("click", () => {
                if (!tvWidgetRef.current) return;

                if (chartType === "Price") {
                  localStorage.setItem("chart_type", "MCap");
                  isInitialPriceMessageRef.current = true;
                } else {
                  localStorage.setItem("chart_type", "Price");
                  isInitialPriceMessageRef.current = true;
                }

                trade.current = null;
                candles.current = null;
                setTvWidgetReady(false);
                setIsTvChartReady(false);
                setIsLoadingMarks(true);
                resetChart();
              });
              switchChartTypeButton.style.cursor = "pointer";
              switchChartTypeButton.innerHTML =
                chartType === "Price"
                  ? "<span style='color: #e799ff; font-weight: 700;'>Price</span>/MC"
                  : "Price/<span style='color: #e799ff; font-weight: 700;'>MC</span>";

              if (!dropdownApiRef.current) {
                updateTradeFilters(
                  tvWidgetRef.current,
                  tradeFilters.current,
                  dropdownApiRef.current,
                ).then((newDropdownApi) => {
                  dropdownApiRef.current = newDropdownApi;
                });
              }

              const hideBuyAveragePriceLineButton =
                tvWidgetRef.current!.createButton();
              hideBuyAveragePriceLineButton.setAttribute(
                "title",
                "Hide Buy Average Price Line",
              );
              hideBuyAveragePriceLineButton.classList.add(
                "apply-common-tooltip",
              );
              hideBuyAveragePriceLineButton.style.cursor = "pointer";

              const currentShowBuyAvgPriceLineState =
                (localStorage.getItem("chart_hide_buy_avg_price_line") as
                  | "true"
                  | "false") || "false";
              hideBuyAveragePriceLineButton.innerHTML =
                currentShowBuyAvgPriceLineState === "true"
                  ? "Show Buy Avg Price Line"
                  : "Hide Buy Avg Price Line";

              hideBuyAveragePriceLineButton.addEventListener("click", () => {
                const hideAveragePriceLine =
                  (localStorage.getItem("chart_hide_buy_avg_price_line") as
                    | "true"
                    | "false") || "false";

                const newState =
                  hideAveragePriceLine === "true" ? "false" : "true";
                localStorage.setItem("chart_hide_buy_avg_price_line", newState);

                if (newState === "false") {
                  removeAveragePriceLine(
                    "buy",
                    tvWidgetRef.current,
                    buyAveragePriceShapeIdRef.current,
                  );
                  // @ts-ignore
                  buyAveragePriceShapeIdRef.current = addAveragePriceLine(
                    "buy",
                    tvWidgetRef.current,
                    buyAveragePriceTradeStartTimeRef.current!,
                    buyAveragePriceShapePriceRef.current!,
                  );
                } else if (buyAveragePriceShapeIdRef.current) {
                  removeAveragePriceLine(
                    "buy",
                    tvWidgetRef.current,
                    buyAveragePriceShapeIdRef.current,
                  );
                  buyAveragePriceShapeIdRef.current = null;
                }

                hideBuyAveragePriceLineButton.innerHTML =
                  newState === "true"
                    ? "Show Buy Avg Price Line"
                    : "Hide Buy Avg Price Line";
              });

              const hideSellAveragePriceLineButton =
                tvWidgetRef.current!.createButton();
              hideSellAveragePriceLineButton.setAttribute(
                "title",
                "Hide Sell Average Price Line",
              );
              hideSellAveragePriceLineButton.classList.add(
                "apply-common-tooltip",
              );
              hideSellAveragePriceLineButton.style.cursor = "pointer";

              const currentShowSellAvgPriceLineState =
                (localStorage.getItem("chart_hide_sell_avg_price_line") as
                  | "true"
                  | "false") || "false";
              hideSellAveragePriceLineButton.innerHTML =
                currentShowSellAvgPriceLineState === "true"
                  ? "Show Sell Avg Price Line"
                  : "Hide Sell Avg Price Line";

              hideSellAveragePriceLineButton.addEventListener("click", () => {
                const hideAveragePriceLine =
                  (localStorage.getItem("chart_hide_sell_avg_price_line") as
                    | "true"
                    | "false") || "false";

                const newState =
                  hideAveragePriceLine === "true" ? "false" : "true";
                localStorage.setItem(
                  "chart_hide_sell_avg_price_line",
                  newState,
                );

                if (newState === "false") {
                  removeAveragePriceLine(
                    "sell",
                    tvWidgetRef.current,
                    sellAveragePriceShapeIdRef.current,
                  );

                  // @ts-ignore
                  sellAveragePriceShapeIdRef.current = addAveragePriceLine(
                    "sell",
                    tvWidgetRef.current,
                    sellAveragePriceTradeStartTimeRef.current!,
                    sellAveragePriceShapePriceRef.current!,
                  );
                } else if (sellAveragePriceShapeIdRef.current) {
                  removeAveragePriceLine(
                    "sell",
                    tvWidgetRef.current,
                    sellAveragePriceShapeIdRef.current,
                  );
                  sellAveragePriceShapeIdRef.current = null;
                }

                hideSellAveragePriceLineButton.innerHTML =
                  newState === "true"
                    ? "Show Sell Avg Price Line"
                    : "Hide Sell Avg Price Line";
              });

              const resetThemeButton = tvWidgetRef.current!.createButton();
              resetThemeButton.setAttribute("title", "Reset to Nova Theme");
              resetThemeButton.classList.add("apply-common-tooltip");
              resetThemeButton.addEventListener("click", () => {
                localStorage.setItem(
                  "tradingview.chartproperties",
                  JSON.stringify(defaultTVChartProperties),
                );

                localStorage.setItem(
                  "tradingview.chartproperties.mainSeriesProperties",
                  JSON.stringify(defaultTVChartPropertiesMainSeriesProperties),
                );

                setTvWidgetReady(false);
                setIsTvChartReady(false);
                setIsLoadingMarks(true);
                resetChart();
              });
              resetThemeButton.style.cursor = "pointer";
              resetThemeButton.innerHTML = "Reset Theme";

              const arrowRightButton = tvWidgetRef.current!.createButton();
              arrowRightButton.setAttribute("title", "Scroll to Latest Bar");
              arrowRightButton.classList.add("apply-common-tooltip");
              arrowRightButton.addEventListener("click", () => {
                if (!tvWidgetRef.current?.activeChart()) return;
                tvWidgetRef.current.activeChart().executeActionById("timeScaleReset");
              });
              arrowRightButton.style.cursor = "pointer";
              arrowRightButton.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              `;
            });
          });
        };

        initChart();

        handleStorageChange = (e: StorageEvent) => {
          if (e.key === "chart_currency") {
            resetChart();
          }
          if (e.key === "chart_type") {
            resetChart();
          }
        };

        window.addEventListener("storage", handleStorageChange);
      } catch (error) {
        console.error("Failed to load charting library", error);
        window.removeEventListener("storage", handleStorageChange);
        Sentry.captureMessage(
          `Failed to load charting library 🔴 – (Trading View) | Error: ${error?.toString()}`,
          "error",
        );
      }
    };
    loadChart();

    return () => {
      cleanUp();
      // const script = document.querySelector(
      //   'script[src="/static/charting_library/charting_library.standalone.js"]',
      // );
      // if (script) {
      //   script.remove();
      // }
    };
  }, []);

  const detectOnline = () => {
    /* console.log("NETWORK - ONLINE") */;
    if (typeof window !== "undefined" && window.navigator.onLine === true) {
      /* console.log("WS HOOK 📺 - chartToken | HEARTBEAT🛡️🛡️🎨🎨 - ONLINE") */;
      isConnectionHealthyRef.current = true;

      subscribersMap.current.forEach((sub) => {
        sendTokenMessage({
          channel: mint,
          action: "join",
          from: sub.lastMessageTimestamp,
        });
      });
    }
  };

  const detectOffline = () => {
    /* console.log("NETWORK - OFFLINE") */;
    if (typeof window !== "undefined" && window.navigator.onLine === false) {
      /* console.log("WS HOOK 📺 - chartToken | HEARTBEAT🛡️🛡️🎨🎨 - OFFLINE") */;
      isConnectionHealthyRef.current = false;
    }
  };

  // detect network status
  useEffect(() => {
    window.addEventListener("online", detectOnline);
    window.addEventListener("offline", detectOffline);

    return () => {
      window.removeEventListener("online", detectOnline);
      window.removeEventListener("offline", detectOffline);
    };
  }, []);

  // ### A. From Filter Trade => Mark
  const trackedWalletsList = useWalletTrackerMessageStore(
    (state) => state.trackedWallets,
  );
  const addTradeMarksBasedOnFilteredWallet = (trades: Trade[]) => {
    if (!tvWidgetReady || !tvWidgetRef.current) {
      return;
    }

    const currentResolution = (
      localStorage.getItem("chart_interval_resolution") ||
      tvWidgetRef.current?.activeChart().resolution() ||
      cookies.get("_chart_interval_resolution") ||
      "1S"
    ).toUpperCase();

    const key = `${mint}-${currentResolution}`;
    const existingTrades = tradeMap.current.get(key);

    let shouldRefresh = false;

    if (existingTrades) {
      trades?.forEach((newTrade) => {
        if (!newTrade) return;
        const isDuplicate = existingTrades.some((existingTrade) =>
          areTradesEqual(existingTrade, newTrade),
        );

        if (!isDuplicate) {
          existingTrades.push(newTrade);
          shouldRefresh = true;
        }
      });
    } else {
      tradeMap.current.set(key, trades);
      shouldRefresh = true;
    }

    tradeFilters.current.delete("my_trades");
    saveTradeFiltersToLocalStorage(tradeFilters.current);
    updateTradeFilters(
      tvWidgetRef.current,
      tradeFilters.current,
      dropdownApiRef.current,
    );

    if (shouldRefresh) {
      tvWidgetRef.current?.activeChart().refreshMarks();
    }
  };
  const removeTradeMarksBasedOnFilteredWallet = () => {
    if (!tvWidgetReady || !tvWidgetRef.current) {
      return;
    }

    const currentResolution = (
      localStorage.getItem("chart_interval_resolution") ||
      tvWidgetRef.current?.activeChart().resolution() ||
      cookies.get("_chart_interval_resolution") ||
      "1S"
    ).toUpperCase();
    const tradeKey = `${mint}-${currentResolution}`;
    const trades = tradeMap.current.get(tradeKey);

    if (trades) {
      const filteredTrades = trades.filter(
        (trade) => trade.imageUrl === undefined,
      );

      tradeMap.current.set(tradeKey, filteredTrades);

      tradeFilters.current.add("my_trades");
      saveTradeFiltersToLocalStorage(tradeFilters.current);
      updateTradeFilters(
        tvWidgetRef.current,
        tradeFilters.current,
        dropdownApiRef.current,
      );

      tvWidgetRef.current?.activeChart().refreshMarks();
    }
  };
  const { wallet, trades } = useFilteredWalletTradesStore();
  const prevWalletRef = useRef(wallet);
  useEffect(() => {
    if (
      isTVChartReady &&
      tvWidgetRef.current &&
      tvWidgetReady &&
      !isLoadingMarks
    ) {
      if (wallet !== "" && trades.length > 0) {
        addTradeMarksBasedOnFilteredWallet(trades);
      } else {
        if (prevWalletRef.current !== "" && wallet === "") {
          removeTradeMarksBasedOnFilteredWallet();
        } else if (loadCount.current === 0) {
          loadCount.current++;
        }
      }
    }

    prevWalletRef.current = wallet;
  }, [
    wallet,
    trades,
    isLoadingMarks,
    tvWidgetRef.current,
    isTVChartReady,
    tvWidgetReady,
  ]);

  // ### B. From Wallet Tracker Trade => Mark
  const addTradeMarksBasedOnWalletTracker = (trades: Trade[]) => {
    if (!tvWidgetReady || !tvWidgetRef.current) {
      return;
    }

    const currentResolution = (
      localStorage.getItem("chart_interval_resolution") ||
      tvWidgetRef.current?.activeChart().resolution() ||
      cookies.get("_chart_interval_resolution") ||
      "1S"
    ).toUpperCase();
    const key = `${mint}-${currentResolution}`;
    const existingTrades = tradeMap.current.get(key);

    const filteredTrades = trades.filter((trade) => trade.mint === mint);
    let shouldRefresh = false;

    if (existingTrades) {
      filteredTrades?.forEach((newTrade) => {
        if (!newTrade) return;
        const isDuplicate = existingTrades.some((existingTrade) =>
          areTradesEqual(existingTrade, newTrade),
        );

        if (!isDuplicate) {
          existingTrades.push(newTrade);
          shouldRefresh = true;
        }
      });
    } else {
      tradeMap.current.set(key, filteredTrades);
      shouldRefresh = true;
    }

    updateTradeFilters(
      tvWidgetRef.current,
      tradeFilters.current,
      dropdownApiRef.current,
    );

    if (shouldRefresh) {
      tvWidgetRef.current?.activeChart().refreshMarks();
    }
  };
  const { trades: walletTrackerTrades } = useMatchWalletTrackerTradesStore();
  useEffect(() => {
    if (
      walletTrackerTrades.length > 0 &&
      isTVChartReady &&
      tvWidgetRef.current &&
      tvWidgetReady &&
      !isLoadingMarks
    ) {
      addTradeMarksBasedOnWalletTracker(walletTrackerTrades);
    }
  }, [
    walletTrackerTrades,
    isLoadingMarks,
    tvWidgetRef.current,
    isTVChartReady,
    tvWidgetReady,
  ]);

  // ### C. From Developer Trade => Mark
  const addDeveloperTradeMarks = (trades: Trade[]) => {
    if (!tvWidgetReady || !tvWidgetRef.current) {
      return;
    }

    const currentResolution = (
      localStorage.getItem("chart_interval_resolution") ||
      tvWidgetRef.current?.activeChart().resolution() ||
      cookies.get("_chart_interval_resolution") ||
      "1S"
    ).toUpperCase();
    const key = `${mint}-${currentResolution}`;
    const existingTrades = tradeMap.current.get(key);

    let shouldRefresh = false;

    if (existingTrades) {
      trades?.forEach((trade) => {
        if (!trade) return;
        const exists = existingTrades.some(
          (t) => t.signature === trade.signature,
        );
        if (!exists) {
          existingTrades.push(trade);
          shouldRefresh = true;
        }
      });
    } else {
      tradeMap.current.set(key, trades);
      shouldRefresh = true;
    }

    if (shouldRefresh) {
      tvWidgetRef.current?.activeChart().refreshMarks();
    }
  };
  useEffect(() => {
    if (
      developerAddress &&
      developerTrades.length > 0 &&
      isTVChartReady &&
      tvWidgetRef.current &&
      tvWidgetReady &&
      !isLoadingMarks
    ) {
      const filteredDeveloperTrades = developerTrades.filter(
        (trade) => trade.wallet === developerAddress,
      );

      addDeveloperTradeMarks(filteredDeveloperTrades);
    }
  }, [
    developerAddress,
    developerTrades,
    isLoadingMarks,
    tvWidgetRef.current,
    isTVChartReady,
    tvWidgetReady,
  ]);

  return (
    <div className="h-full">
      <div ref={chartContainerRef} id="trading-view" className="h-full" />
    </div>
  );
};

export default React.memo(NovaTradingView);
