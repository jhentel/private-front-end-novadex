"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
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
  SubscribeBarsCallback,
  Timezone,
} from "@/types/charting_library";
import {
  NovaChart,
  TradeFilter,
  Trade,
  ChartPrice,
  Order,
  SolanaPrice,
  TradeLetter,
  InitialChartTrades,
  NovaChartTrades,
  Ping,
  MessageStatus,
} from "@/types/nova_tv.types";
import { TokenDataMessageType } from "@/types/ws-general";
// ######## Utils & Helpers 🤝 ########
import throttle from "lodash/throttle";
import {
  formatAmountDollar,
  formatAmountWithoutLeadingZero,
} from "@/utils/formatAmount";
import {
  addAveragePriceLine,
  filterTrades,
  removeAveragePriceLine,
  updateTradeFilters,
  saveTradeFiltersToLocalStorage,
} from "@/utils/nova_tv.utils";
import truncateCA from "@/utils/truncateCA";
import { formatEpochToUTCDate } from "@/utils/formatDate";
import { getWSBaseURLBasedOnRegion } from "@/utils/getWSBaseURLBasedOnRegion";
// ######## Local Setup ⚒️ ########
export const PRICE_MAP = {
  "1S": "1s",
  "15S": "15s",
  "30S": "30s",
  1: "1m",
  5: "5m",
  15: "15m",
  30: "30m",
  60: "1h",
  240: "4h",
  "1D": "1d",
};
const defaultInterval = "1S" as ResolutionString;
const supportedResolutions = [
  "1S",
  "15S",
  "30S",
  "1",
  "5",
  "15",
  "30",
  "60",
  "240",
  "D",
] as ResolutionString[];

const SOCKET_TIMEOUT_BUFFER_MS = 500;

// --- Caching Enhancement ---
// Flag to track if the TradingView script has been successfully loaded once per session
let isTradingViewScriptLoaded = false;
// Store the promise to avoid race conditions if loadScript is called multiple times quickly
let tradingViewScriptLoadPromise: Promise<boolean> | null = null;
// --- End Caching Enhancement ---

// const loadScript = async (src: string) => {
//   return new Promise((resolve, reject) => {
//     if (document.querySelector(`script[src="${src}"]`)) {
//       resolve(true);
//       return;
//     }

//     const script = document.createElement("script");
//     script.src = src;
//     script.async = true;
//     script.fetchPriority = "high";
//     script.onload = resolve;
//     script.onerror = (error) => {
//       Sentry.captureMessage(
//         `Failed to load script 🔴 – (Trading View) |  Error: ${error?.toString()}`,
//         "error",
//       );
//       reject(error);
//     };
//     document.body.appendChild(script);
//   });
// };

const loadScript = async (src: string): Promise<boolean> => {
  // --- Caching Enhancement ---
  // If we know it's loaded, resolve immediately
  if (isTradingViewScriptLoaded) {
    return Promise.resolve(true);
  }
  // If a loading process is already underway, return its promise
  if (tradingViewScriptLoadPromise) {
    return tradingViewScriptLoadPromise;
  }
  // --- End Caching Enhancement ---

  // Check if the script tag already exists in the DOM (e.g., from a previous mount in the same session)
  if (document.querySelector(`script[src="${src}"]`)) {
    // Assume if the tag exists, the library is loaded or loading.
    // We might need to wait briefly for window.TradingView to be available in some edge cases,
    // but usually, if the tag is there, subsequent calls to new TradingView.widget work.
    // For simplicity, we'll mark it as loaded here. A more robust check might involve
    // periodically checking for `window.TradingView`.
    isTradingViewScriptLoaded = true; // Mark as loaded since the tag exists
    return Promise.resolve(true);
  }

  // --- Caching Enhancement ---
  // Create and store the promise *before* starting the load
  tradingViewScriptLoadPromise = new Promise((resolve, reject) => {
    // --- End Caching Enhancement ---
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.fetchPriority = "high"; // Keep high priority for the initial load
    script.onload = () => {
      // --- Caching Enhancement ---
      isTradingViewScriptLoaded = true; // Mark as loaded on success
      tradingViewScriptLoadPromise = null; // Clear the promise reference
      // --- End Caching Enhancement ---
      resolve(true);
    };
    script.onerror = (error) => {
      Sentry.captureMessage(
        `Failed to load script 🔴 – (Trading View) |  Error: ${error?.toString()}`,
        "error",
      );
      // --- Caching Enhancement ---
      tradingViewScriptLoadPromise = null; // Clear the promise reference on error
      // --- End Caching Enhancement ---
      reject(error);
    };
    document.body.appendChild(script);
  });

  // --- Caching Enhancement ---
  return tradingViewScriptLoadPromise;
  // --- End Caching Enhancement ---
};

// ######## Main Component ✨ ########
const NovaTradingViewWithCache = ({
  initChartData,
}: {
  initChartData: TokenDataMessageType | null;
}) => {
  // Move global state into component using refs
  const socketRef = useRef<WebSocket | null>(null);
  const lastMintSocketRef = useRef<string>("");
  const lastBarRef = useRef<Bar | null>(null);
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
  const allWSPingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reinitChartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousPriceRef = useRef<number | null>(null);

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

  const params = useParams();
  const currencyCookiesGlobal: "SOL" | "USD" =
    (cookies.get("_chart_currency") as "SOL" | "USD") || "SOL";
  const currencyRef = useRef<"SOL" | "USD" | null>(null);
  const tokenSupplyRef = useRef<string | null>(null);
  const shouldReconnectRef = useRef<boolean>(true);
  const mintRef = useRef<string>((params?.["mint-address"] as string) || "");

  const reconnectAttemptsRef = useRef<number>(0);
  const allWSLastPingTimestamp = useRef<number>(0);
  const allWSConnectedStatus = useRef<boolean>(false);
  const allWSIsConnecting = useRef<boolean>(false);

  useEffect(() => {
    if (typeof localStorage.getItem("is_ref") === undefined) {
      localStorage.setItem("is_ref", "true");
    }
  }, []);

  function initSocket(
    symbolInfo: LibrarySymbolInfo,
    onRealtimeCallback: SubscribeBarsCallback,
    handleThrottledCurrentTokenChartUpdate: (data: {
      price: string;
      price_usd: string;
      supply: string;
    }) => void,
    resolution: ResolutionString,
    symbol: string,
    subscriberUID: string,
  ) {
    lastConnectionParams = {
      symbolInfo,
      onRealtimeCallback,
      handleThrottledUpdate: handleThrottledCurrentTokenChartUpdate,
      resolution,
      symbol,
    };

    shouldReconnectRef.current = true;
    if (allWSIsConnecting.current || allWSConnectedStatus.current) {
      return socketRef.current;
    }
    allWSIsConnecting.current = true;

    const currency: "SOL" | "USD" =
      (localStorage.getItem("chart_currency") as "SOL" | "USD") || "SOL";
    const chartType: "Price" | "MCap" =
      (localStorage.getItem("chart_type") as "Price" | "MCap") || "Price";
    const token = cookies.get("_nova_session");
    if (!token || token === "") return;

    // ### Disconnect
    shouldReconnectRef.current = false;

    // Clear ping interval
    if (allWSPingTimeoutRef.current) {
      clearInterval(allWSPingTimeoutRef.current);
      allWSPingTimeoutRef.current = null;
    }

    // Reset connection status
    allWSConnectedStatus.current = false;
    allWSIsConnecting.current = false;
    allWSLastPingTimestamp.current = 0;
    reconnectAttemptsRef.current = 0;

    try {
      socketRef.current = new WebSocket(String(getWSBaseURLBasedOnRegion()));
      lastMintSocketRef.current = symbolInfo.ticker as string;

      if (!socketRef.current) return;

      socketRef.current.onopen = () => {
        reconnectAttemptsRef.current = 0;

        allWSIsConnecting.current = false;
        allWSConnectedStatus.current = true;
        allWSLastPingTimestamp.current = Date.now();

        // Clear existing ping interval if any
        if (allWSPingTimeoutRef.current) {
          clearInterval(allWSPingTimeoutRef.current);
        }

        // Set up keep-alive ping interval
        allWSPingTimeoutRef.current = setInterval(() => {
          if (socketRef.current?.readyState === 1) {
            socketRef.current.send(JSON.stringify({ type: "ping" }));
          }
        }, 5000); // Send ping every 5 seconds

        startIntervalRef.current = true;

        socketRef.current?.send(
          JSON.stringify([
            {
              channel: "chartTrades",
              mint: symbolInfo.ticker,
              token: token,
            },
            {
              channel: "chartPrice",
              mint: symbolInfo.ticker,
              token: token,
            },
          ]),
        );
      };

      socketRef.current.onmessage = (event) => {
        let data:
          | MessageStatus
          | ChartPrice
          | Trade
          | Order
          | SolanaPrice
          | InitialChartTrades
          | Ping;

        try {
          data = JSON.parse(event.data);
        } catch (error) {
          console.warn("TV WS 📺 | Failed to parse message data", error);
          return;
        }

        if ((data as Ping).channel === "ping") {
          allWSLastPingTimestamp.current = Date.now();
          return;
        }

        if ((data as MessageStatus)?.success === true) {
          return;
        }

        // Initial trade event handling ✨
        if ((data as InitialChartTrades).channel === "chartTrades") {
          if (
            (data as InitialChartTrades)?.data?.length === 0 ||
            (data as InitialChartTrades)?.data === undefined
          )
            return;

          // Marks
          const existingTrades = tradeMap.current.get(
            `${symbolInfo.ticker}-${resolution}`,
          );
          const convertedTrades: Trade[] = (
            data as InitialChartTrades
          )?.data?.map((trade) => {
            return {
              ...trade,
              timestamp: trade.timestamp,
            };
          });

          if (existingTrades) {
            convertedTrades.forEach((trade) => {
              existingTrades.push(trade);
            });
          } else {
            tradeMap.current.set(
              `${symbolInfo.ticker}-${resolution}`,
              convertedTrades,
            );
          }

          if (tvWidgetRef.current && tvWidgetRef.current.activeChart) {
            tvWidgetRef.current?.activeChart()?.refreshMarks();
          }

          // Avg Price Line
          const lastTrade = (data as InitialChartTrades).data[
            (data as InitialChartTrades).data.length - 1
          ];

          // ### BUY
          if (
            localStorage.getItem("chart_hide_buy_avg_price_line") === "false"
          ) {
            const tradeStartTime = getBarStartTime(
              new Date().getTime(),
              resolution,
            );
            removeAveragePriceLine(
              "buy",
              tvWidgetRef.current,
              buyAveragePriceShapeIdRef.current,
            );
            const priceByCurrency = parseFloat(
              currency === "SOL"
                ? lastTrade.average_price_sol
                : lastTrade.average_price_usd,
            );

            buyAveragePriceTradeStartTimeRef.current = tradeStartTime;
            if (chartType === "MCap") {
              buyAveragePriceShapePriceRef.current =
                priceByCurrency * Number(lastTrade.supply);
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
          }

          // ### SELL
          if (
            localStorage.getItem("chart_hide_sell_avg_price_line") === "false"
          ) {
            const tradeStartTime = getBarStartTime(
              new Date().getTime(),
              resolution,
            );
            removeAveragePriceLine(
              "sell",
              tvWidgetRef.current,
              sellAveragePriceShapeIdRef.current,
            );
            const priceByCurrency = parseFloat(
              currency === "SOL"
                ? lastTrade.average_sell_price_sol
                : lastTrade.average_sell_price_usd,
            );

            sellAveragePriceTradeStartTimeRef.current = tradeStartTime;
            if (chartType === "MCap") {
              sellAveragePriceShapePriceRef.current =
                priceByCurrency * Number(lastTrade.supply);
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

          return;
        }

        // Trade event handling ✨
        if ((data as Trade).letter) {
          // Marks
          const existingTrades = tradeMap.current.get(
            `${symbolInfo.ticker}-${resolution}`,
          );
          const convertedTrade: Trade = {
            ...(data as Trade),
            timestamp: (data as Trade)?.timestamp,
          };
          if (existingTrades) {
            existingTrades.push(convertedTrade);
          } else {
            tradeMap.current.set(`${symbolInfo.ticker}-${resolution}`, [
              convertedTrade,
            ]);
          }

          if (tvWidgetRef.current && tvWidgetRef.current.activeChart) {
            tvWidgetRef.current?.activeChart()?.refreshMarks();
          }

          // Avg Price Line
          // ### BUY
          if (
            localStorage.getItem("chart_hide_buy_avg_price_line") === "false"
          ) {
            const tradeStartTime = getBarStartTime(
              new Date().getTime(),
              resolution,
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
          }

          // ### SELL
          if (
            localStorage.getItem("chart_hide_sell_avg_price_line") === "false"
          ) {
            const tradeStartTime = getBarStartTime(
              new Date().getTime(),
              resolution,
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
          }

          return;
        }

        // Chart Price event handling ✨
        handleThrottledCurrentTokenChartUpdate({
          price: (data as ChartPrice).price,
          price_usd: (data as ChartPrice).price_usd,
          supply: (data as ChartPrice).supply,
        });

        const currentTime = new Date().getTime();
        const barStartTime = getBarStartTime(currentTime, resolution);

        const storedSupply = parseFloat(tokenSupplyRef.current || "1000000000");
        const newSupply = parseFloat((data as ChartPrice).supply);
        if (storedSupply !== newSupply) {
          tokenSupplyRef.current = newSupply.toString();
        }

        let nextPrice = parseFloat(
          currency === "SOL"
            ? (data as ChartPrice).price
            : (data as ChartPrice).price_usd,
        );

        // console.log("Latest Candles ✨", {
        //   ...nextBarInfo,
        //   supply: {
        //     storedSupply,
        //     newSupply,
        //   },
        // });

        if (chartType === "MCap") {
          const supply = parseFloat((data as ChartPrice).supply);
          if (isNaN(supply) || supply <= 0) {
            return;
          }

          nextPrice = nextPrice * supply;
          if (nextPrice <= 0) {
            return;
          }
        }

        if (lastBarRef.current && lastBarRef.current.time === barStartTime) {
          const updatedBar = {
            time: lastBarRef.current.time,
            open: lastBarRef.current.open,
            high: Math.max(lastBarRef.current.high, nextPrice),
            low: Math.min(lastBarRef.current.low, nextPrice),
            close: nextPrice,
          };
          onRealtimeCallback(updatedBar);
          lastBarRef.current = updatedBar;

          if (isInitialPriceMessageRef.current) {
            isInitialPriceMessageRef.current = false;
          }
          // console.log("CANDLES DEBUG 📊 - Updated Bar 🟡", updatedBar);
        } else {
          if (lastBarRef.current && isInitialPriceMessageRef.current) {
            const initialBar = {
              time: lastBarRef.current.time,
              open: lastBarRef.current.open,
              high: Math.max(lastBarRef.current.high, nextPrice),
              low: Math.min(lastBarRef.current.low, nextPrice),
              close: nextPrice,
            };
            onRealtimeCallback(initialBar);
            lastBarRef.current = initialBar;

            isInitialPriceMessageRef.current = false;
            // console.log("CANDLES DEBUG 📊 - Initial Bar 🟢", initialBar);
          } else {
            const newBar = {
              time: barStartTime,
              open: lastBarRef.current ? lastBarRef.current.close : nextPrice,
              high: nextPrice,
              low: nextPrice,
              close: nextPrice,
            };
            onRealtimeCallback(newBar);
            lastBarRef.current = newBar;

            // console.log("CANDLES DEBUG 📊 - New Bar 🔴", newBar);
          }
        }

        // Reset initial message flag after first processing
        if (isInitialPriceMessageRef.current) {
          isInitialPriceMessageRef.current = false;
        }

        updateTitle(nextPrice, symbol, previousPriceRef);
      };

      socketRef.current.onerror = (errorEvent) => {
        console.warn("[Socket] Error:", errorEvent);

        const errorDetails = {
          type: errorEvent.type,
          timestamp: errorEvent.timeStamp,
        };

        console.warn("[Socket] Error:", errorDetails, errorEvent);

        Sentry.withScope((scope) => {
          scope.setExtras(errorDetails);
          Sentry.captureException(
            new Error(`Error 🔴 - (Chart WS): ${errorEvent.type}`),
          );
        });
      };

      socketRef.current.onclose = () => {
        allWSIsConnecting.current = false;
        allWSConnectedStatus.current = false;
        allWSLastPingTimestamp.current = 0;

        reconnectTimeoutRef.current = setTimeout(() => {
          if (lastConnectionParams && shouldReconnectRef.current) {
            return initSocket(
              lastConnectionParams.symbolInfo,
              lastConnectionParams.onRealtimeCallback,
              lastConnectionParams.handleThrottledUpdate,
              lastConnectionParams.resolution,
              lastConnectionParams.symbol,
              subscriberUID,
            );
          }
        }, 2000);
      };
    } catch (error) {
      console.warn("WebSocket initialization error:", error);
      allWSIsConnecting.current = false;
      return null;
    }

    return socketRef.current;
  }

  useEffect(() => {
    if (!tokenSupplyRef.current && initChartData?.price?.supply) {
      tokenSupplyRef.current = initChartData?.price?.supply?.toString();
    }
  }, [initChartData?.price?.supply]);

  useEffect(() => {
    if (!currencyRef.current) {
      currencyRef.current = currencyCookiesGlobal;
    }
  }, [currencyRef.current, currencyCookiesGlobal]);

  const isUsingInitialPrefetchData = useRef<boolean>(false);
  const initChartDataRef = useRef<TokenDataMessageType | null>(undefined);

  useEffect(() => {
    if (initChartData) {
      initChartDataRef.current = initChartData;
    }
  }, [initChartData?.price?.supply]);

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
  const handleThrottledCurrentTokenChartUpdate = throttle(
    (data: { price: string; price_usd: string; supply: string }) => {
      setCurrentTokenChartPrice(data?.price);
      setCurrentTokenChartPriceUsd(data?.price_usd);
      setCurrentTokenChartSupply(data?.supply);
    },
    100,
  );

  // Store in Global State for User Trades ✨
  const setUserTrades = useTokenHoldingStore((state) => state.setUserTrades);

  // Store in Global State for Developer Trades ✨
  const developerAddress = useTokenMessageStore(
    (state) => state.dataSecurityMessage.deployer,
  );
  const { resetCurrentTokenDeveloperTradesState, developerTrades } =
    useCurrentTokenDeveloperTradesStore();

  const chartContainerRef = useRef<HTMLDivElement>(
    undefined,
  ) as React.MutableRefObject<HTMLInputElement>;
  const mint =
    ((params?.["mint-address"] || params?.["pool-address"]) as string) ?? "";
  const [isTVChartReady, setIsTvChartReady] = useState<boolean>(false);
  const [isLoadingMarks, setIsLoadingMarks] = useState<boolean>(true);
  const [tvWidgetReady, setTvWidgetReady] = useState<boolean>(false);
  const disableServer = useRef(false);
  const loadCount = useRef(0);

  useEffect(() => {
    if (!mint || !chartContainerRef?.current) return;

    const loadChart = async () => {
      try {
        await loadScript(
          "/static/charting_library/charting_library.standalone.js",
        );

        if (isTradingViewScriptLoaded) {
          console.warn("TV 📺 | CACHED 🟢", {
            isTradingViewScriptLoaded,
          });
        } else {
          console.warn("TV 📺 | NOT CACHED 🔴", {
            isTradingViewScriptLoaded,
          });
        }

        // Check if TradingView is available on window after script load
        if (!window.TradingView?.widget) {
          console.warn(
            "TradingView library loaded, but window.TradingView.widget not found immediately. Retrying init might be needed in edge cases.",
          );
        }

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
          ],
          settings_adapter: {
            initialSettings: {
              defaultInterval: getIntervalResolution(),
              custom_font_family: "'Geist', sans-serif",
            },
            setValue: function (key, value) {},
            removeValue: function (key) {},
          },
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
              setTimeout(
                () =>
                  callback({
                    supported_resolutions: supportedResolutions,
                    supports_marks: true,
                    supports_time: true,
                  }),
                0,
              );
            },
            searchSymbols: async (
              userInput,
              exchange,
              symbolType,
              onResultReadyCallback,
            ) => {
              onResultReadyCallback([]);
            },
            resolveSymbol: async (
              symbolName,
              onSymbolResolvedCallback,
              onResolveErrorCallback,
            ) => {
              const nameParam = params?.["name"] as string;
              const symbolParam = params?.["symbol"] as string;
              const dexParam = params?.["dex"] as string;
              let name, symbol, dex;
              if (!nameParam || !symbolParam || !dexParam) {
                const res = await fetchResolveSymbol(mint);
                name = res.name;
                symbol = res.symbol;
                dex = res.dex;
              } else {
                name = nameParam;
                symbol = symbolParam;
                dex = dexParam;
              }

              const symbolInfo: LibrarySymbolInfo = {
                name: initChartDataRef?.current?.token?.name || name,
                ticker: mint,
                description: `${
                  initChartDataRef?.current?.token?.symbol || symbol
                }/${localStorage.getItem("chart_currency")} on ${
                  initChartDataRef?.current?.token?.dex || dex
                } Nova`,
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
                seconds_multipliers: ["1", "15", "30"],
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
              console.warn("TV DEBUG ✨ | GET BARS RUN 📊", Date.now());

              const { from, to, firstDataRequest, countBack } = periodParams;

              if (noDataRef.current) {
                onHistoryCallback([], {
                  noData: true,
                });
                return;
              }

              try {
                const currency: "SOL" | "USD" =
                  (localStorage.getItem("chart_currency") as "SOL" | "USD") ||
                  "SOL";
                const chartType: "Price" | "MCap" =
                  (localStorage.getItem("chart_type") as "Price" | "MCap") ||
                  "Price";

                // @ts-ignore
                const interval = PRICE_MAP[resolution];

                const fromMs = from * 1000;
                const toMs = to * 1000;

                const res = await fetchHistoricalData(
                  symbolInfo.ticker!,
                  interval,
                  currency.toLowerCase() as "sol" | "usd",
                  fromMs,
                  toMs,
                  countBack,
                  isInitialBarRef.current,
                );
                if (res.success === false) {
                  onHistoryCallback([], {
                    noData: true,
                  });
                  return;
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

                const bars = sortedBars;
                const filteredBarsBasedOnTime = sortedBars.filter(
                  (bar) => bar.time >= from * 1000 && bar.time <= to * 1000,
                );

                onHistoryCallback(bars, { noData: no_data });

                if (tvWidgetRef.current && tvWidgetRef.current.activeChart) {
                  tvWidgetRef.current?.activeChart()?.refreshMarks();
                }

                if (firstDataRequest) {
                  lastBarRef.current = bars[bars.length - 1];

                  updateTitle(
                    lastBarRef.current.high,
                    initChartDataRef?.current?.token?.symbol as string,
                    previousPriceRef,
                  );

                  const {
                    developer_trades,
                    insider_trades,
                    other_trades,
                    sniper_trades,
                    user_trades,
                  } = await fetchInitTradesData(symbolInfo.ticker!);

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
                  tradeMap.current.set(tradeKey, [
                    ...developer_trades,
                    ...insider_trades,
                    ...other_trades,
                    ...sniper_trades,
                    ...convertedTimestampUniqueUserTrades,
                  ]);

                  setUserTrades(user_trades);

                  if (tvWidgetRef.current && tvWidgetRef.current.activeChart) {
                    tvWidgetRef.current?.activeChart()?.refreshMarks();
                  }

                  const tradeStartTime = getBarStartTime(
                    new Date().getTime(),
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
                    sellAveragePriceShapePriceRef.current = sellPriceByCurrency;
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
              } catch (error) {
                onErrorCallback(error as string);

                Sentry.captureMessage(
                  `Error getting bars 🔴 – (Trading View) | Error: ${error?.toString()}`,
                  "error",
                );
              }
            },
            getMarks: (symbolInfo, from, to, onDataCallback, resolution) => {
              console.warn("TV DEBUG ✨ | GET MARKS RUN 🔖", Date.now());

              tvWidgetRef.current?.activeChart()?.clearMarks();

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

              const marks: Mark[] = uniqueTrades.map((trade, index) => {
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
                  trade?.name ||
                  trackedWalletsList.find((tw) => tw.address === trade.wallet)
                    ?.name;

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
                    id: `${trade.timestamp.toString()}-${trade?.signature}`,
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
                    label: trade.letter,
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
                    id: `${trade.timestamp.toString()}-${trade?.signature}`,
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
                    label: trade.letter,
                    labelFontColor: "#ffffff",
                    minSize: 25,
                  };
                } else {
                  return {
                    id: `${trade.timestamp.toString()}-${trade?.signature}`,
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
                    label: trade.letter,
                    labelFontColor: "#ffffff",
                    minSize: 25,
                  };
                }
              });

              const uniqueMarks = getUniqueMarks(marks);

              onDataCallback(uniqueMarks);

              setIsLoadingMarks(false);
            },
            subscribeBars: (
              symbolInfo,
              resolution,
              onRealtimeCallback,
              subscriberUID,
            ) => {
              if (!subscribersMap.current.has(subscriberUID)) {
                subscribersMap.current.set(subscriberUID, {
                  resolution,
                  callback: onRealtimeCallback,
                  socket: initSocket(
                    symbolInfo,
                    onRealtimeCallback,
                    (args) => handleThrottledCurrentTokenChartUpdate(args),
                    resolution,
                    initChartDataRef?.current?.token?.symbol || symbolInfo.name,
                    subscriberUID,
                  ),
                  mint: symbolInfo.ticker,
                });
              }
            },
            unsubscribeBars: (subscribeUID) => {
              const sub = subscribersMap.current.get(subscribeUID);
              if (sub) {
                sub.socket.close();
                subscribersMap.current.delete(subscribeUID);
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
          if (reconnectTimeoutRef.current)
            clearTimeout(reconnectTimeoutRef.current);
          resetCurrentTokenDeveloperTradesState();

          if (!chartContainerRef.current) {
            console.warn("Chart container ref is null");
            return;
          }

          const savedFilters = localStorage.getItem("chart_trade_filters");
          if (savedFilters) {
            const parsedFilters = JSON.parse(savedFilters) as TradeFilter[];
            tradeFilters.current.clear();
            parsedFilters.forEach((filter) => tradeFilters.current.add(filter));
          }

          if (!window.TradingView?.widget) {
            reinitChartTimeoutRef.current = setTimeout(() => {
              initChart();
            }, 100);
          }
          // @ts-ignore
          tvWidgetRef.current = new window.TradingView.widget(
            initialWidgetOptions,
          );

          tvWidgetRef.current!.onChartReady(() => {
            tvWidgetRef.current!.headerReady().then(() => {
              setIsTvChartReady(true);
              setTvWidgetReady(true);

              tvWidgetRef
                .current!.activeChart()
                .onIntervalChanged()
                .subscribe(null, async (interval, timeframeObj) => {
                  isInitialBarRef.current = true;
                  noDataRef.current = null;
                  localStorage.setItem("chart_interval_resolution", interval);
                  cookies.set("_chart_interval_resolution", interval);
                  setIsLoadingMarks(true);
                });

              const currency: "SOL" | "USD" =
                (localStorage.getItem("chart_currency") as "SOL" | "USD") ||
                "SOL";
              const switchCurrencyButton = tvWidgetRef.current!.createButton();
              switchCurrencyButton.setAttribute("title", "Switch Currency");
              switchCurrencyButton.classList.add("apply-common-tooltip");
              switchCurrencyButton.addEventListener("click", () => {
                if (currency === "SOL") {
                  localStorage.setItem("chart_currency", "USD");
                  currencyRef.current = "USD";
                  cookies.set("_chart_currency", "USD");
                } else {
                  localStorage.setItem("chart_currency", "SOL");
                  currencyRef.current = "SOL";
                  cookies.set("_chart_currency", "SOL");
                }

                setTvWidgetReady(false);
                setIsTvChartReady(false);
                setIsLoadingMarks(true);
                resetChart();
              });
              switchCurrencyButton.style.cursor = "pointer";
              switchCurrencyButton.innerHTML =
                currency === "USD" ? "Switch to SOL" : "Switch to USD";

              const chartType: "Price" | "MCap" =
                (localStorage.getItem("chart_type") as "Price" | "MCap") ||
                "Price";
              const switchChartTypeButton = tvWidgetRef.current!.createButton();
              switchChartTypeButton.setAttribute("title", "Switch Chart Type");
              switchChartTypeButton.classList.add("apply-common-tooltip");
              switchChartTypeButton.addEventListener("click", () => {
                if (chartType === "Price") {
                  localStorage.setItem("chart_type", "MCap");
                  isInitialPriceMessageRef.current = true;
                } else {
                  localStorage.setItem("chart_type", "Price");
                  isInitialPriceMessageRef.current = true;
                }

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
            });
          });
        };

        const resetChart = (
          newOptions: Partial<ChartingLibraryWidgetOptions> = {},
        ) => {
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
            console.warn("Chart container ref is null");
            return;
          }

          const savedFilters = localStorage.getItem("chart_trade_filters");
          if (savedFilters) {
            const parsedFilters = JSON.parse(savedFilters) as TradeFilter[];
            tradeFilters.current.clear();
            parsedFilters.forEach((filter) => tradeFilters.current.add(filter));
          }

          const updatedOptions: ChartingLibraryWidgetOptions = {
            ...initialWidgetOptions,
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
            tvWidgetRef.current!.headerReady().then(() => {
              setIsTvChartReady(true);
              setTvWidgetReady(true);

              tvWidgetRef
                .current!.activeChart()
                .onIntervalChanged()
                .subscribe(null, async (interval, timeframeObj) => {
                  isInitialBarRef.current = true;
                  noDataRef.current = null;
                  localStorage.setItem("chart_interval_resolution", interval);
                  cookies.set("_chart_interval_resolution", interval);
                  setIsLoadingMarks(true);
                });

              const currency: "SOL" | "USD" =
                (localStorage.getItem("chart_currency") as "SOL" | "USD") ||
                "SOL";
              const switchCurrencyButton = tvWidgetRef.current!.createButton();
              switchCurrencyButton.setAttribute("title", "Switch Currency");
              switchCurrencyButton.classList.add("apply-common-tooltip");
              switchCurrencyButton.addEventListener("click", () => {
                if (currency === "SOL") {
                  localStorage.setItem("chart_currency", "USD");
                  currencyRef.current = "USD";
                  cookies.set("_chart_currency", "USD");
                } else {
                  localStorage.setItem("chart_currency", "SOL");
                  currencyRef.current = "SOL";
                  cookies.set("_chart_currency", "SOL");
                }

                setTvWidgetReady(false);
                setIsTvChartReady(false);
                setIsLoadingMarks(true);
                resetChart();
              });
              switchCurrencyButton.style.cursor = "pointer";
              switchCurrencyButton.innerHTML =
                currency === "USD" ? "Switch to SOL" : "Switch to USD";

              const chartType: "Price" | "MCap" =
                (localStorage.getItem("chart_type") as "Price" | "MCap") ||
                "Price";
              const switchChartTypeButton = tvWidgetRef.current!.createButton();
              switchChartTypeButton.setAttribute("title", "Switch Chart Type");
              switchChartTypeButton.classList.add("apply-common-tooltip");
              switchChartTypeButton.addEventListener("click", () => {
                if (chartType === "Price") {
                  localStorage.setItem("chart_type", "MCap");
                  isInitialPriceMessageRef.current = true;
                } else {
                  localStorage.setItem("chart_type", "Price");
                  isInitialPriceMessageRef.current = true;
                }

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
            });
          });
        };

        initChart();

        const handleStorageChange = (e: StorageEvent) => {
          if (e.key === "chart_currency") {
            resetChart();
          }
          if (e.key === "chart_type") {
            resetChart();
          }
        };

        window.addEventListener("storage", handleStorageChange);

        return () => {
          window.removeEventListener("storage", handleStorageChange);

          if (tvWidgetRef.current) {
            try {
              tvWidgetRef.current.remove();
            } catch (error) {
              console.warn("Error removing TradingView widget:", error);
              Sentry.captureException(error);
            }
            tvWidgetRef.current = null;
          }
        };
      } catch (error) {
        console.warn("Failed to load charting library", error);

        Sentry.captureMessage(
          `Failed to load charting library 🔴 – (Trading View) | Error: ${error?.toString()}`,
          "error",
        );
      }
    };
    loadChart();

    return () => {
      socketRef.current = null;
      lastMintSocketRef.current = "";
      lastBarRef.current = null;
      tvWidgetRef.current = null;
      dropdownApiRef.current = null;
      buyAveragePriceShapeIdRef.current = null;
      buyAveragePriceTradeStartTimeRef.current = null;
      buyAveragePriceShapePriceRef.current = null;
      sellAveragePriceShapeIdRef.current = null;
      sellAveragePriceTradeStartTimeRef.current = null;
      sellAveragePriceShapePriceRef.current = null;
      previousPriceRef.current = null;
      isInitialPriceMessageRef.current = true;
      noDataRef.current = null;
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
      setCurrentTokenChartPrice("");
      setCurrentTokenChartPriceUsd("");
      setCurrentTokenChartSupply("1000000000");
      resetCurrentTokenDeveloperTradesState();
      reconnectAttemptsRef.current = 0;
      allWSLastPingTimestamp.current = 0;
      allWSConnectedStatus.current = false;
      allWSIsConnecting.current = false;
      allWSPingTimeoutRef.current = null;
      if (reinitChartTimeoutRef.current)
        clearInterval(reinitChartTimeoutRef.current);
      shouldReconnectRef.current = false;
      // document
      //   .querySelector(
      //     `script[src="/static/charting_library/charting_library.standalone.js"]`,
      //   )
      //   ?.remove();
    };
  }, [mint, chartContainerRef?.current]);

  const startIntervalRef = useRef<boolean>(false);
  useEffect(() => {
    const testInterval = setInterval(() => {
      if (allWSConnectedStatus.current) {
        const now = Date.now();

        if (
          now - allWSLastPingTimestamp.current! >
            6000 + SOCKET_TIMEOUT_BUFFER_MS &&
          socketRef.current?.readyState === 1
        ) {
          allWSConnectedStatus.current = false;
          allWSIsConnecting.current = false;
          shouldReconnectRef.current = true;
          socketRef.current?.close();
        }
      }
    }, 4000);

    return () => {
      if (testInterval) {
        clearInterval(testInterval);
        shouldReconnectRef.current = false;
      }
    };
  }, [startIntervalRef?.current]);

  useEffect(() => {
    const cleanup = () => {
      // Stop reconnection attempts
      shouldReconnectRef.current = false;

      // Clear all intervals and timeouts
      if (allWSPingTimeoutRef.current) {
        clearInterval(allWSPingTimeoutRef.current);
        allWSPingTimeoutRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (reinitChartTimeoutRef.current) {
        clearTimeout(reinitChartTimeoutRef.current);
        reinitChartTimeoutRef.current = null;
      }

      // Cleanup WebSocket
      if (socketRef.current) {
        socketRef.current.onopen = null;
        socketRef.current.onmessage = null;
        socketRef.current.onerror = null;
        socketRef.current.onclose = null;
        socketRef.current.close();
        socketRef.current = null;
      }

      // Reset all refs and state
      lastMintSocketRef.current = "";
      lastConnectionParams = null;
      reconnectAttemptsRef.current = 0;
      allWSLastPingTimestamp.current = 0;
      allWSConnectedStatus.current = false;
      allWSIsConnecting.current = false;
      mintRef.current = "";

      // Clear subscribers
      subscribersMap.current.forEach((sub) => {
        if (sub.socket && sub.socket.readyState === 1) {
          sub.socket.close();
          sub.socket.onclose = null;
          sub.socket.onerror = null;
          sub.socket.onmessage = null;
          sub.socket.onopen = null;
        }
      });
      subscribersMap.current.clear();

      // Reset trading view widget
      if (tvWidgetRef.current) {
        tvWidgetRef.current.remove();
        tvWidgetRef.current = null;
      }
    };

    // Listen for navigation/route changes
    const handleRouteChange = () => {
      cleanup();
    };

    // Listen for window unload/close
    const handleUnload = () => {
      cleanup();
    };

    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("popstate", handleRouteChange);

    // Add cleanup for component unmount
    return () => {
      cleanup();
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  const trackedWalletsList = useWalletTrackerMessageStore(
    (state) => state.trackedWallets,
  );

  const addTradeMarksBasedOnFilteredWallet = (trades: Trade[]) => {
    if (!tvWidgetReady || !tvWidgetRef.current) {
      return;
    }

    const currentResolution = localStorage.getItem("chart_interval_resolution");
    const key = `${mint}-${currentResolution}`;
    const existingTrades = tradeMap.current.get(key);

    let shouldRefresh = false;

    if (existingTrades) {
      trades.forEach((newTrade) => {
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
      tvWidgetRef.current.activeChart().refreshMarks();
    }
  };

  const removeTradeMarksBasedOnFilteredWallet = () => {
    if (!tvWidgetReady || !tvWidgetRef.current) {
      return;
    }

    const currentResolution = localStorage.getItem("chart_interval_resolution");
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

      tvWidgetRef.current.activeChart().refreshMarks();
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

  const addTradeMarksBasedOnWalletTracker = (trades: Trade[]) => {
    if (!tvWidgetReady || !tvWidgetRef.current) {
      return;
    }

    const currentResolution = localStorage.getItem("chart_interval_resolution");
    const key = `${mint}-${currentResolution}`;
    const existingTrades = tradeMap.current.get(key);

    const filteredTrades = trades.filter((trade) => trade.mint === mint);
    let shouldRefresh = false;

    if (existingTrades) {
      filteredTrades.forEach((newTrade) => {
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
      tvWidgetRef.current.activeChart().refreshMarks();
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

  const addDeveloperTradeMarks = (trades: Trade[]) => {
    if (!tvWidgetReady || !tvWidgetRef.current) {
      return;
    }

    const currentResolution = localStorage.getItem("chart_interval_resolution");
    const key = `${mint}-${currentResolution}`;
    const existingTrades = tradeMap.current.get(key);

    let shouldRefresh = false;

    if (existingTrades) {
      trades.forEach((trade) => {
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
      tvWidgetRef.current.activeChart().refreshMarks();
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
    <div className="relative h-full">
      <div className="fixed left-0 top-0 z-[10000] bg-white">
        CACHED VERSION ✨
      </div>
      <div ref={chartContainerRef} id="trading-view" className="h-full" />;
    </div>
  );
};
export default React.memo(NovaTradingViewWithCache);

// ######## Local Utils & Helpers 🤝 ########
function formatChartPrice(price: number) {
  return formatAmountWithoutLeadingZero(price, 3, 2);
}

async function fetchHistoricalData(
  mint: string,
  interval: string,
  currency: "sol" | "usd",
  from: number,
  to: number,
  countBack: number,
  initial: boolean,
): Promise<NovaChart> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_REST_MAIN_URL}/charts/candles?mint=${mint}&interval=${interval}&currency=${currency}&from=${from}&to=${to}&countback=${countBack}&initial=${initial}`,
    {
      headers: {
        "X-Nova-Session": cookies.get("_nova_session") || "",
      },
    },
  );
  return await response.json();
}
async function fetchInitTradesData(mint: string): Promise<NovaChartTrades> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_REST_MAIN_URL}/charts/trades?mint=${mint}`,
    {
      headers: {
        "X-Nova-Session": cookies.get("_nova_session") || "",
      },
    },
  );
  return await response.json();
}
async function fetchResolveSymbol(mint: string): Promise<{
  name: string;
  symbol: string;
  image: string;
  dex: string;
}> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_REST_MAIN_URL}/metadata?mint=${mint}`,
    {
      headers: {
        "X-Nova-Session": cookies.get("_nova_session") || "",
      },
    },
  );
  return await response.json();
}

function getUTCTime(timestamp: number) {
  const utcDate = new Date(timestamp);
  const hours = utcDate.getUTCHours();
  const minutes = utcDate.getUTCMinutes();
  const seconds = utcDate.getUTCSeconds();

  return `UTC: ${hours}:${String(minutes).padStart(2, "0")}:${String(
    seconds,
  ).padStart(2, "0")}`;
}

let lastConnectionParams: {
  symbolInfo: LibrarySymbolInfo;
  onRealtimeCallback: SubscribeBarsCallback;
  handleThrottledUpdate: (data: {
    price: string;
    price_usd: string;
    supply: string;
  }) => void;
  resolution: ResolutionString;
  symbol: string;
} | null = null;

function getBarStartTime(
  timestamp: number,
  resolution: ResolutionString,
): number {
  let interval: number;

  switch (resolution) {
    case "1S":
      interval = 1 * 1000;
      break;
    case "15S":
      interval = 15 * 1000;
      break;
    case "30S":
      interval = 30 * 1000;
      break;
    case "1D":
      interval = 24 * 60 * 60 * 1000;
      break;
    default:
      interval = parseInt(resolution) * 60 * 1000;
      break;
  }

  return Math.floor(timestamp / interval) * interval;
}

function getValueByType(value: number, initialTotalSupply: number) {
  const chartType: "Price" | "MCap" =
    (localStorage.getItem("chart_type") as "Price" | "MCap") || "Price";

  if (chartType === "MCap") {
    const mktCapVal = initialTotalSupply * value;

    return mktCapVal;
  } else {
    return value;
  }
}

function getTimeZone(): Timezone {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone as Timezone;
  } catch (e) {
    return "Etc/UTC";
  }
}

function getIntervalResolution(): ResolutionString {
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

function generateMarkText(
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
  const currency: "SOL" | "USD" =
    (localStorage.getItem("chart_currency") as "SOL" | "USD") || "SOL";
  const chartType: "Price" | "MCap" =
    (localStorage.getItem("chart_type") as "Price" | "MCap") || "Price";

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
    return `My Trade | ${truncateCA(wallet, 10)}: ${
      letter === "B" ? "bought" : "sold"
    } ${amountValue} at ${marketCapValue} Market Cap on ${formatEpochToUTCDate(
      timestamp,
    )}`;
  } else if (isSniperTrade) {
    return `Sniper Trade | ${truncateCA(wallet, 10)} ${
      letter === "SB" ? "bought" : "sold"
    } ${amountValue} at ${marketCapValue} Market Cap on ${formatEpochToUTCDate(
      timestamp,
    )}`;
  } else if (isDevTrade) {
    return `Dev Trade | ${truncateCA(wallet, 10)}: ${
      letter === "DB" ? "bought" : "sold"
    } ${amountValue} at ${marketCapValue} Market Cap on ${formatEpochToUTCDate(
      timestamp,
    )}`;
  } else if (isInsiderTrade) {
    return `Insider Trade | ${truncateCA(wallet, 10)}: ${
      letter === "IB" ? "bought" : "sold"
    } ${amountValue} at ${marketCapValue} Market Cap on ${formatEpochToUTCDate(
      timestamp,
    )}`;
  } else if (isTrackedTrade) {
    return `Tracked Trade | ${truncateCA(wallet, 10)}: ${
      letter === "B" ? "bought" : "sold"
    } ${amountValue} at ${marketCapValue} Market Cap on ${formatEpochToUTCDate(
      timestamp,
    )}`;
  } else {
    return `${
      walletName || ""
    } ${colour === "green" ? "bought" : "sold"} ${amountValue} at ${marketCapValue} Market Cap on ${formatEpochToUTCDate(
      timestamp,
    )}`;
  }
}

function getUniqueMarks(marks: Mark[]): Mark[] {
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

function getUniqueTrades(trades: Trade[]): Trade[] {
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
      ...tradeFilterCondition
    } = trade;
    const serializedTrade = JSON.stringify({
      signature,
      name,
      letter,
    });

    if (seen.has(serializedTrade)) return false;

    seen.add(serializedTrade);
    return true;
  });
}

function areTradesEqual(trade1: Trade, trade2: Trade): boolean {
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

function updateTitle(
  nextPrice: number,
  currentSymbolArg: string,
  previousPriceRef: React.MutableRefObject<number | null>,
) {
  const currentSymbol = currentSymbolArg || "";
  const currency: "SOL" | "USD" =
    (localStorage.getItem("chart_currency") as "SOL" | "USD") || "SOL";
  const chartType: "Price" | "MCap" =
    (localStorage.getItem("chart_type") as "Price" | "MCap") || "Price";
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
