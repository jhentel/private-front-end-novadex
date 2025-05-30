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
} from "@/types/charting_library";
import {
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
  CurrencyChart,
  ChartType,
} from "@/types/nova_tv.types";
import { TokenDataMessageType } from "@/types/ws-general";
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
  loadScript,
  updateTitle,
  areTradesEqual,
  generateMarkText,
  getIntervalResolution,
  getTimeZone,
  getUniqueMarks,
  getUniqueTrades,
  getValueByType,
  formatChartPrice,
} from "@/utils/trading-view/trading-view-utils";
import {
  fetchResolveSymbol,
  fetchHistoricalData,
  fetchInitTradesData,
} from "@/apis/rest/trading-view";
import { getWSBaseURLBasedOnRegion } from "@/utils/getWSBaseURLBasedOnRegion";

// ######## Local Setup ⚒️ ########
const PRICE_MAP = {
  "1S": "1s",
  "15S": "15s",
  "30S": "30s",
  1: "1m",
  5: "5m",
  15: "15m",
  30: "30m",
  60: "1h",
  240: "4h",
  360: "6h",
  720: "12h",
  1440: "24h",
};
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
  "360",
  "720",
  "1440",
] as ResolutionString[];

const SOCKET_TIMEOUT_BUFFER_MS = 500;

type LastConnectionParams = {
  symbolInfo: LibrarySymbolInfo;
  onRealtimeCallback: SubscribeBarsCallback;
  handleThrottledUpdate: (data: {
    price: string;
    price_usd: string;
    supply: string;
  }) => void;
  resolution: ResolutionString;
  symbol: string;
} | null;

// ######## Main Component ✨ ########
const NovaTradingView = ({
  initChartData,
}: {
  initChartData: TokenDataMessageType | null;
}) => {
  const { pathname } = useParams();
  const lastConnectionParams = useRef<LastConnectionParams>(null);

  // ######## Local Utils & Helpers 🤝 ########
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
  // const allWSPingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutInitSocketRef = useRef<NodeJS.Timeout | null>(null);
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
  const currencyCookiesGlobal: CurrencyChart =
    (cookies.get("_chart_currency") as CurrencyChart) || "SOL";
  const currencyRef = useRef<CurrencyChart | null>(null);
  const tokenSupplyRef = useRef<string | null>(null);
  // const shouldReconnectRef = useRef<boolean>(true);
  const mintRef = useRef<string>((params?.["mint-address"] as string) || "");

  const reconnectAttemptsRef = useRef<number>(0);
  const allWSLastPingTimestamp = useRef<number>(0);
  // const allWSPingInterval = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (typeof localStorage.getItem("is_ref") === undefined) {
      localStorage.setItem("is_ref", "true");
    }
  }, []);

  const initSocket = (
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
  ) => {
    lastConnectionParams.current = {
      symbolInfo,
      onRealtimeCallback,
      handleThrottledUpdate: handleThrottledCurrentTokenChartUpdate,
      resolution,
      symbol,
    };
    /* console.log("TV WS 📺 | INTERVAL🛡️🛡️🎨🎨 - 1", { resolution }) */;

    // shouldReconnectRef.current = true;
    // const currentSocket = subscribersMap.current.get(subscriberUID);
    // if (currentSocket.allWSIsConnecting || currentSocket.allWSConnectedStatus) {
    //   return socketRef.current;
    // }
    /* console.log("TV WS 📺 | INTERVAL🛡️🛡️🎨🎨 - 2", { resolution }) */;
    // currentSocket.allWSIsConnecting = true;

    const currency: CurrencyChart =
      (localStorage.getItem("chart_currency") as CurrencyChart) || "SOL";

    const chartType: ChartType =
      (localStorage.getItem("chart_type") as ChartType) || "Price";

    /* console.log("TV WS 📺 | INTERVAL🛡️🛡️🎨🎨 - 3", { resolution }) */;
    const token = cookies.get("_nova_session");
    if (!token || token === "") return;

    // ### Disconnect
    // shouldReconnectRef.current = false;

    // Reset connection status
    // currentSocket.allWSConnectedStatus = false;
    // currentSocket.allWSIsConnecting = false;
    allWSLastPingTimestamp.current = 0;
    reconnectAttemptsRef.current = 0;

    /* console.log("TV WS 📺 | INTERVAL🛡️🛡️🎨🎨 - 4", { resolution }) */;
    try {
      socketRef.current = new WebSocket(String(getWSBaseURLBasedOnRegion()));

      lastMintSocketRef.current = symbolInfo.ticker as string;

      if (!socketRef.current) return;

      socketRef.current.onopen = () => {
        reconnectAttemptsRef.current = 0;

        // currentSocket.allWSIsConnecting = false;
        // currentSocket.allWSConnectedStatus = true;
        allWSLastPingTimestamp.current = Date.now();

        // startIntervalRef.current = true;

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

        // if (allWSPingInterval.current) {
        //   clearInterval(allWSPingInterval.current);
        // }

        // allWSPingInterval.current = setInterval(() => {
        //   if (currentSocket.allWSConnectedStatus) {
        //     const now = Date.now();

        //     console.log("TCS ✨ | Chart Holdings DEBUG - INFO ℹ️", {
        //       now,
        //       lastPing: allWSLastPingTimestamp.current,
        //       shouldReconnect: now - allWSLastPingTimestamp.current! > 8000,
        //       diff: now - allWSLastPingTimestamp.current!,
        //     });

        //     if (now - allWSLastPingTimestamp.current! > 8000) {
        //       currentSocket.allWSConnectedStatus = false;
        //       currentSocket.allWSIsConnecting = false;
        //       socketRef.current?.close();
        //     }
        //   }
        // }, 4000);
      };

      socketRef.current.onmessage = (event) => {
        const selectedResolution = localStorage.getItem(
          "chart_interval_resolution",
        );
        if (selectedResolution !== resolution) return;
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
        /* console.log("TV WS 📺 | INTERVAL🛡️🛡️", { data, resolution }) */;

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
          console.warn("CANDLES DEBUG 📊 - Updated Bar 🟡", {
            barStartTime,
            updatedBar: updatedBar.time,
            lastBar: lastBarRef.current.time,
          });
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
            console.warn("CANDLES DEBUG 📊 - Initial Bar 🟢", {
              barStartTime,
              initialBar,
            });
            isInitialPriceMessageRef.current = false;
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
            console.warn("CANDLES DEBUG 📊 - New Bar 🔴", {
              barStartTime,
              newBar: newBar.time,
              lastBar: lastBarRef.current.time,
            });
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
        allWSLastPingTimestamp.current = 0;

        reconnectTimeoutInitSocketRef.current = setTimeout(() => {
          if (
            lastConnectionParams?.current &&
            // shouldReconnectRef.current
            pathname?.includes("/token")
          ) {
            return initSocket(
              lastConnectionParams.current.symbolInfo,
              lastConnectionParams.current.onRealtimeCallback,
              lastConnectionParams.current.handleThrottledUpdate,
              lastConnectionParams.current.resolution,
              lastConnectionParams.current.symbol,
              subscriberUID,
            );
          }
        }, 1000);
      };
    } catch (error) {
      console.warn("WebSocket initialization error:", error);
      // currentSocket.allWSIsConnecting = false;
      return null;
    }

    return socketRef.current;
  };

  useEffect(() => {
    if (!currencyRef.current) {
      currencyRef.current = currencyCookiesGlobal;
    }
  }, [currencyRef.current, currencyCookiesGlobal]);

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
  const loadCount = useRef(0);
  const intervalStudiesRef = useRef<NodeJS.Timeout | null>(null);
  const isReseting = useRef<boolean>(false);

  useEffect(() => {
    if (!mint || !chartContainerRef?.current) return;

    let handleStorageChange: (e: StorageEvent) => void;

    const loadChart = async () => {
      try {
        await loadScript(
          "/static/charting_library/charting_library.standalone.js",
        );

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
          // studies_access: {
          //   tools: [
          //     ...JSON.parse(localStorage.getItem("chart_studies") as any),
          //     //   .map((s: any) => ({
          //     //   ...s,
          //     //   grayed: false,
          //     // }))
          //   ],
          //   type: "black",
          // },
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
              return callback({
                supported_resolutions: supportedResolutions,
                supports_marks: true,
                supports_time: true,
              });
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
                const currency: CurrencyChart =
                  (localStorage.getItem("chart_currency") as CurrencyChart) ||
                  "SOL";
                const chartType: ChartType =
                  (localStorage.getItem("chart_type") as ChartType) || "Price";

                // @ts-ignore
                const interval = PRICE_MAP[resolution];

                const fromMs = from * 1000;
                const toMs = to * 1000;

                const res = await fetchHistoricalData({
                  mint: symbolInfo.ticker!,
                  interval,
                  currency: currency.toLowerCase() as "sol" | "usd",
                  from: fromMs,
                  to: toMs,
                  countBack,
                  initial: isInitialBarRef.current,
                });
                if (res.supply) {
                  tokenSupplyRef.current = res.supply;
                }
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
                  console.warn("CANDLES DEBUG 📊 - Initial GET Bar 🟢");

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

          if (reconnectTimeoutInitSocketRef.current) {
            clearTimeout(reconnectTimeoutInitSocketRef.current);
          }

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
                }, 2000);
              }
              if (tvWidgetRef.current) {
                const studies = JSON.parse(
                  localStorage.getItem("chart_studies") as string,
                );
                /* console.log("TV DEBUG ✨ | APPLY INDICATOR", studies) */;
                if (Array.isArray(studies)) {
                  studies.forEach(async (study) => {
                    const detailStudy = await tvWidgetRef.current
                      ?.activeChart?.()
                      ?.createStudy?.(study.name, false);
                    /* console.log("TV DEBUG ✨ | APPLY INDICATOR", detailStudy) */;
                  });
                }
              }
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

              const currency: CurrencyChart =
                (localStorage.getItem("chart_currency") as CurrencyChart) ||
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

              const chartType: ChartType =
                (localStorage.getItem("chart_type") as ChartType) || "Price";
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
            });
          });
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
              studies.forEach(async (study) => {
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
            console.warn("Chart container ref is null");
            return;
          }

          const savedFilters = localStorage.getItem("chart_trade_filters");
          if (savedFilters) {
            const parsedFilters = JSON.parse(savedFilters) as TradeFilter[];
            tradeFilters.current.clear();
            parsedFilters.forEach((filter) => tradeFilters.current.add(filter));
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
            tvWidgetRef.current!.headerReady().then(() => {
              setIsTvChartReady(true);
              setTvWidgetReady(true);

              if (tvWidgetRef.current) {
                const studies = JSON.parse(
                  localStorage.getItem("chart_studies") as string,
                );
                /* console.log("TV DEBUG ✨ | APPLY INDICATOR", studies) */;
                if (Array.isArray(studies)) {
                  studies.forEach(async (study) => {
                    const detailStudy = await tvWidgetRef.current
                      ?.activeChart?.()
                      ?.createStudy?.(study.name, false);
                    /* console.log("TV DEBUG ✨ | APPLY INDICATOR", detailStudy) */;
                  });
                }
              }

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

              const currency: CurrencyChart =
                (localStorage.getItem("chart_currency") as CurrencyChart) ||
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

              const chartType: ChartType =
                (localStorage.getItem("chart_type") as ChartType) || "Price";
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
            });
          });
        };

        initChart();

        handleStorageChange = (e: StorageEvent) => {
          const keysTrigger = ["chart_currency", "chart_type", "chart_studies"];
          if (keysTrigger.includes(e.key as string)) {
            resetChart();
          }
        };

        window.addEventListener("storage", handleStorageChange);
      } catch (error) {
        console.warn("Failed to load charting library", error);
        window.removeEventListener("storage", handleStorageChange);
        Sentry.captureMessage(
          `Failed to load charting library 🔴 – (Trading View) | Error: ${error?.toString()}`,
          "error",
        );
      }
    };
    loadChart();

    return () => {
      intervalStudiesRef.current = null;
      socketRef.current = null;
      lastMintSocketRef.current = "";
      lastBarRef.current = null;
      tvWidgetRef.current?.remove();
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
      if (reconnectTimeoutInitSocketRef.current) {
        clearTimeout(reconnectTimeoutInitSocketRef.current);
      }
      setCurrentTokenChartPrice("");
      setCurrentTokenChartPriceUsd("");
      setCurrentTokenChartSupply("1000000000");
      resetCurrentTokenDeveloperTradesState();
      reconnectAttemptsRef.current = 0;
      allWSLastPingTimestamp.current = 0;
      // allWSPingTimeoutRef.current = null;
      if (reinitChartTimeoutRef.current)
        clearInterval(reinitChartTimeoutRef.current);
      // shouldReconnectRef.current = false;
      document
        .querySelector(
          `script[src="/static/charting_library/charting_library.standalone.js"]`,
        )
        ?.remove();
      subscribersMap.current.clear();
      if (socketRef.current) {
        (socketRef.current as WebSocket).close();
        (socketRef.current as WebSocket).onopen = null;
        (socketRef.current as WebSocket).onmessage = null;
        (socketRef.current as WebSocket).onerror = null;
        socketRef.current = null;
      }
    };
  }, [mint, chartContainerRef?.current]);

  // const startIntervalRef = useRef<boolean>(false);

  useEffect(() => {
    const pingInterval = setInterval(() => {
      subscribersMap.current.forEach((sub) => {
        if (sub.socket && sub.socket.readyState === 1) {
          sub.socket.send(
            JSON.stringify({
              channel: "ping",
            }),
          );
        }
      });
    }, 4000);

    return () => {
      if (pingInterval) {
        clearInterval(pingInterval);
      }
    };
  }, []);
  // useEffect(() => {
  //   const testInterval = setInterval(() => {
  //     if (allWSConnectedStatus.current) {
  //       const now = Date.now();

  //       if (
  //         now - allWSLastPingTimestamp.current! >
  //           6000 + SOCKET_TIMEOUT_BUFFER_MS &&
  //         socketRef.current?.readyState === 1
  //       ) {
  //         allWSConnectedStatus.current = false;
  //         allWSIsConnecting.current = false;
  //         shouldReconnectRef.current = true;
  //         socketRef.current?.close();
  //       }
  //     }

  //   }, 4000);

  //   return () => {
  //     if (testInterval) {
  //       clearInterval(testInterval);
  //       shouldReconnectRef.current = false;
  //     }
  //   };
  // }, [startIntervalRef?.current]);

  useEffect(() => {
    const cleanup = () => {
      // Stop reconnection attempts
      // shouldReconnectRef.current = false;

      // Clear all intervals and timeouts
      if (reconnectTimeoutInitSocketRef.current) {
        clearTimeout(reconnectTimeoutInitSocketRef.current);
        reconnectTimeoutInitSocketRef.current = null;
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
      lastConnectionParams.current = null;
      reconnectAttemptsRef.current = 0;
      allWSLastPingTimestamp.current = 0;
      // allWSConnectedStatus.current = false;
      // allWSIsConnecting.current = false;
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
      <div ref={chartContainerRef} id="trading-view" className="h-full" />;
    </div>
  );
};

export default React.memo(NovaTradingView);
