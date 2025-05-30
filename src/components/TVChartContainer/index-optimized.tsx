"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { RefObject, useEffect, useRef, useState } from "react";
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
  CurrencyChart,
  ChartType,
} from "@/types/nova_tv.types";
import { TokenDataMessageType } from "@/types/ws-general";
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
import { createWidgetOptions } from "./config";
import { createDatafeed } from "./datafeed";
import { initSocket } from "@/apis/ws/trading-view";

// ######## Local Setup ⚒️ ########
declare global {
  interface Window {
    __TRADINGVIEW_READY?: Promise<boolean>;
    __TRADINGVIEW_RESOLVE?: (value: boolean) => void;
  }
}

const SOCKET_TIMEOUT_BUFFER_MS = 500;

// ######## Main Component ✨ ########
const NovaTradingViewOptimized = ({
  initChartData,
  containerRef,
}: {
  initChartData: TokenDataMessageType;
  containerRef: React.MutableRefObject<HTMLInputElement>;
}) => {
  // Move global state into component using refs
  const socketRef = useRef<WebSocket | null>(null);
  const lastMintSocketRef = useRef<string>("");
  const lastBarRef = useRef<Bar | null>(null);
  const chartInstance = useRef<IChartingLibraryWidget | null>(null);
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
  const lastConnectionRef = useRef<{
    symbolInfo: LibrarySymbolInfo;
    onRealtimeCallback: SubscribeBarsCallback;
    handleThrottledUpdate: (data: {
      price: string;
      price_usd: string;
      supply: string;
    }) => void;
    resolution: ResolutionString;
    symbol: string;
  } | null>(null);

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
  const shouldReconnectRef = useRef<boolean>(true);
  const mintRef = useRef<string>((params?.["mint-address"] as string) || "");

  const reconnectAttemptsRef = useRef<number>(0);
  const allWSLastPingTimestamp = useRef<number>(0);
  const allWSConnectedStatus = useRef<boolean>(false);
  const allWSIsConnecting = useRef<boolean>(false);
  const allWSPingInterval = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (typeof localStorage.getItem("is_ref") === undefined) {
      localStorage.setItem("is_ref", "true");
    }
  }, []);

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

  const mint =
    ((params?.["mint-address"] || params?.["pool-address"]) as string) ?? "";
  const [isTVChartReady, setIsTvChartReady] = useState<boolean>(false);
  const [isLoadingMarks, setIsLoadingMarks] = useState<boolean>(true);
  const [tvWidgetReady, setTvWidgetReady] = useState<boolean>(false);
  const disableServer = useRef(false);
  const loadCount = useRef(0);

  useEffect(() => {
    if (!mint || !containerRef?.current) return;

    const loadChart = async () => {
      try {
        await loadScript(
          "/static/charting_library/charting_library.standalone.js",
        );

        const datafeed = createDatafeed({
          mint,
          subscribeCallback: (
            symbolInfo: LibrarySymbolInfo,
            resolution: ResolutionString,
            onRealtimeCallback: SubscribeBarsCallback,
            subscriberUID: string,
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
                  {
                    tvWidgetRef: chartInstance,
                    tokenSupplyRef,
                    tradeMap,
                    lastBarRef,
                    buyAveragePriceShapeIdRef,
                    sellAveragePriceShapeIdRef,
                    buyAveragePriceTradeStartTimeRef,
                    sellAveragePriceTradeStartTimeRef,
                    buyAveragePriceShapePriceRef,
                    sellAveragePriceShapePriceRef,
                    allWSIsConnecting,
                    allWSConnectedStatus,
                    allWSLastPingTimestamp,
                    allWSPingInterval,
                    reconnectTimeoutInitSocketRef,
                    isInitialPriceMessageRef,
                    previousPriceRef,
                    lastMintSocketRef,
                    shouldReconnectRef,
                    reconnectAttemptsRef,
                    lastConnectionRef,
                    startIntervalRef,
                    socketRef,
                  },
                ),
                mint: symbolInfo.ticker,
              });
            }
          },
          unsubscribeCallback: (subscribeUID: string) => {
            const sub = subscribersMap.current.get(subscribeUID);
            if (sub) {
              sub.socket.close();
              subscribersMap.current.delete(subscribeUID);
            }
          },
          ref: {
            initChartDataRef,
            buyAveragePriceShapeIdRef,
            buyAveragePriceShapePriceRef,
            buyAveragePriceTradeStartTimeRef,
            isInitialBarRef,
            lastBarRef,
            noDataRef,
            previousPriceRef,
            sellAveragePriceShapeIdRef,
            sellAveragePriceShapePriceRef,
            sellAveragePriceTradeStartTimeRef,
            setUserTrades,
            tokenSupplyRef,
            tradeMap,
            tvWidgetRef: chartInstance,
          },
          defaultMetadata: {
            name: params?.["name"] as string,
            symbol: params?.["symbol"] as string,
            dex: params?.["dex"] as string,
          },
        });

        const initialWidgetOptions: ChartingLibraryWidgetOptions =
          createWidgetOptions(containerRef.current, mint, datafeed);

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

          if (!containerRef.current) {
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
          chartInstance.current = new window.TradingView.widget(
            initialWidgetOptions,
          );

          chartInstance.current!.onChartReady(() => {
            chartInstance.current!.headerReady().then(() => {
              setIsTvChartReady(true);
              setTvWidgetReady(true);

              chartInstance
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
              const switchCurrencyButton =
                chartInstance.current!.createButton();
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
              const switchChartTypeButton =
                chartInstance.current!.createButton();
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
                  chartInstance.current,
                  tradeFilters.current,
                  dropdownApiRef.current,
                ).then((newDropdownApi) => {
                  dropdownApiRef.current = newDropdownApi;
                });
              }

              const hideBuyAveragePriceLineButton =
                chartInstance.current!.createButton();
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
                    chartInstance.current,
                    buyAveragePriceShapeIdRef.current,
                  );

                  // @ts-ignore
                  buyAveragePriceShapeIdRef.current = addAveragePriceLine(
                    "buy",
                    chartInstance.current,
                    buyAveragePriceTradeStartTimeRef.current!,
                    buyAveragePriceShapePriceRef.current!,
                  );
                } else if (buyAveragePriceShapeIdRef.current) {
                  removeAveragePriceLine(
                    "buy",
                    chartInstance.current,
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
                chartInstance.current!.createButton();
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
                    chartInstance.current,
                    sellAveragePriceShapeIdRef.current,
                  );

                  // @ts-ignore
                  sellAveragePriceShapeIdRef.current = addAveragePriceLine(
                    "sell",
                    chartInstance.current,
                    sellAveragePriceTradeStartTimeRef.current!,
                    sellAveragePriceShapePriceRef.current!,
                  );
                } else if (sellAveragePriceShapeIdRef.current) {
                  removeAveragePriceLine(
                    "sell",
                    chartInstance.current,
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
          if (chartInstance.current) {
            chartInstance.current.remove();
            loadCount.current = 0;
            dropdownApiRef.current = null;
            buyAveragePriceShapeIdRef.current = null;
            sellAveragePriceShapeIdRef.current = null;
            isInitialBarRef.current = true;
            noDataRef.current = null;
            resetCurrentTokenDeveloperTradesState();
          }

          if (!containerRef.current) {
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
          chartInstance.current = new window.TradingView.widget(updatedOptions);

          chartInstance.current!.onChartReady(() => {
            chartInstance.current!.headerReady().then(() => {
              setIsTvChartReady(true);
              setTvWidgetReady(true);

              chartInstance
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
              const switchCurrencyButton =
                chartInstance.current!.createButton();
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
              const switchChartTypeButton =
                chartInstance.current!.createButton();
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
                  chartInstance.current,
                  tradeFilters.current,
                  dropdownApiRef.current,
                ).then((newDropdownApi) => {
                  dropdownApiRef.current = newDropdownApi;
                });
              }

              const hideBuyAveragePriceLineButton =
                chartInstance.current!.createButton();
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
                    chartInstance.current,
                    buyAveragePriceShapeIdRef.current,
                  );
                  // @ts-ignore
                  buyAveragePriceShapeIdRef.current = addAveragePriceLine(
                    "buy",
                    chartInstance.current,
                    buyAveragePriceTradeStartTimeRef.current!,
                    buyAveragePriceShapePriceRef.current!,
                  );
                } else if (buyAveragePriceShapeIdRef.current) {
                  removeAveragePriceLine(
                    "buy",
                    chartInstance.current,
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
                chartInstance.current!.createButton();
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
                    chartInstance.current,
                    sellAveragePriceShapeIdRef.current,
                  );

                  // @ts-ignore
                  sellAveragePriceShapeIdRef.current = addAveragePriceLine(
                    "sell",
                    chartInstance.current,
                    sellAveragePriceTradeStartTimeRef.current!,
                    sellAveragePriceShapePriceRef.current!,
                  );
                } else if (sellAveragePriceShapeIdRef.current) {
                  removeAveragePriceLine(
                    "sell",
                    chartInstance.current,
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
      chartInstance.current = null;
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
      allWSConnectedStatus.current = false;
      allWSIsConnecting.current = false;
      // allWSPingTimeoutRef.current = null;
      if (reinitChartTimeoutRef.current)
        clearInterval(reinitChartTimeoutRef.current);
      shouldReconnectRef.current = false;
      document
        .querySelector(
          `script[src="/static/charting_library/charting_library.standalone.js"]`,
        )
        ?.remove();
      subscribersMap.current.clear();
      if (socketRef.current) {
        (socketRef.current as WebSocket).close();
        socketRef.current = null;
      }
      if (chartInstance.current) {
        (chartInstance.current as IChartingLibraryWidget).remove();
        chartInstance.current = null;
      }
    };
  }, [mint, containerRef?.current]);

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
      lastConnectionRef.current = null;
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
      if (chartInstance.current) {
        chartInstance.current.remove();
        chartInstance.current = null;
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
    if (!tvWidgetReady || !chartInstance.current) {
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
      chartInstance.current,
      tradeFilters.current,
      dropdownApiRef.current,
    );

    if (shouldRefresh) {
      chartInstance.current.activeChart().refreshMarks();
    }
  };

  const removeTradeMarksBasedOnFilteredWallet = () => {
    if (!tvWidgetReady || !chartInstance.current) {
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
        chartInstance.current,
        tradeFilters.current,
        dropdownApiRef.current,
      );

      chartInstance.current.activeChart().refreshMarks();
    }
  };
  const { wallet, trades } = useFilteredWalletTradesStore();
  const prevWalletRef = useRef(wallet);
  useEffect(() => {
    if (
      isTVChartReady &&
      chartInstance.current &&
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
    chartInstance.current,
    isTVChartReady,
    tvWidgetReady,
  ]);

  const addTradeMarksBasedOnWalletTracker = (trades: Trade[]) => {
    if (!tvWidgetReady || !chartInstance.current) {
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
      chartInstance.current,
      tradeFilters.current,
      dropdownApiRef.current,
    );

    if (shouldRefresh) {
      chartInstance.current.activeChart().refreshMarks();
    }
  };

  const { trades: walletTrackerTrades } = useMatchWalletTrackerTradesStore();
  useEffect(() => {
    if (
      walletTrackerTrades.length > 0 &&
      isTVChartReady &&
      chartInstance.current &&
      tvWidgetReady &&
      !isLoadingMarks
    ) {
      addTradeMarksBasedOnWalletTracker(walletTrackerTrades);
    }
  }, [
    walletTrackerTrades,
    isLoadingMarks,
    chartInstance.current,
    isTVChartReady,
    tvWidgetReady,
  ]);

  const addDeveloperTradeMarks = (trades: Trade[]) => {
    if (!tvWidgetReady || !chartInstance.current) {
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
      chartInstance.current.activeChart().refreshMarks();
    }
  };

  useEffect(() => {
    if (
      developerAddress &&
      developerTrades.length > 0 &&
      isTVChartReady &&
      chartInstance.current &&
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
    chartInstance.current,
    isTVChartReady,
    tvWidgetReady,
  ]);

  return null;
};
export default React.memo(NovaTradingViewOptimized);
