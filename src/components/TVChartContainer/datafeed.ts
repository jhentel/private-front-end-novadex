import {
  fetchHistoricalData,
  fetchInitTradesData,
  fetchResolveSymbol,
} from "@/apis/rest/trading-view";
import {
  Bar,
  LibrarySymbolInfo,
  ResolutionString,
  SubscribeBarsCallback,
} from "@/types/charting_library";
import { ChartType, CurrencyChart } from "@/types/nova_tv.types";
import { TokenDataMessageType } from "@/types/ws-general";
import { removeAveragePriceLine } from "@/utils/nova_tv.utils";
import {
  getBarStartTime,
  getTimeZone,
  getUniqueTrades,
  getValueByType,
  updateTitle,
} from "@/utils/trading-view/trading-view-utils";
import * as Sentry from "@sentry/nextjs";

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
  "1D": "1d",
};
const SUPPORTED_RESOLUTIONS = [
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

export const createDatafeed = ({
  mint,
  subscribeCallback,
  unsubscribeCallback,
  ref,
  defaultMetadata,
}: {
  mint: string;
  subscribeCallback: (
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    onRealtimeCallback: SubscribeBarsCallback,
    subscriberUID: string,
  ) => void;
  defaultMetadata: {
    name: string;
    symbol: string;
    dex: string;
  };
  unsubscribeCallback: (subscriberUID: string) => void;
  ref: {
    initChartDataRef: React.MutableRefObject<
      TokenDataMessageType | null | undefined
    >;
    noDataRef: React.MutableRefObject<boolean | null>;
    isInitialBarRef: React.MutableRefObject<boolean>;
    lastBarRef: React.MutableRefObject<Bar | null>;
    tokenSupplyRef: React.MutableRefObject<string | null>;
    previousPriceRef: React.MutableRefObject<number | null>;
    buyAveragePriceShapeIdRef: React.MutableRefObject<string | null>;
    sellAveragePriceShapeIdRef: React.MutableRefObject<string | null>;
    buyAveragePriceTradeStartTimeRef: React.MutableRefObject<number | null>;
    sellAveragePriceTradeStartTimeRef: React.MutableRefObject<number | null>;
    buyAveragePriceShapePriceRef: React.MutableRefObject<number | null>;
    sellAveragePriceShapePriceRef: React.MutableRefObject<number | null>;
    tradeMap: React.MutableRefObject<Map<string, any[]>>;
    tvWidgetRef: React.MutableRefObject<any>;
    setUserTrades: (userTrades: any[]) => void;
  };
}) => {
  const {
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
    tvWidgetRef,
  } = ref;
  return {
    onReady: (callback: any) => {
      setTimeout(
        () =>
          callback({
            supported_resolutions: SUPPORTED_RESOLUTIONS,
            supports_marks: true,
            supports_time: true,
            supports_timescale_marks: true,
          }),
        0,
      );
    },

    searchSymbols: async (
      userInput: any,
      exchange: any,
      symbolType: any,
      onResultReadyCallback: any,
    ) => {
      onResultReadyCallback([]);
    },

    resolveSymbol: async (
      symbolName: any,
      onSymbolResolvedCallback: any,
      onResolveErrorCallback: any,
    ) => {
      const nameParam = defaultMetadata?.["name"] as string;
      const symbolParam = defaultMetadata?.["symbol"] as string;
      const dexParam = defaultMetadata?.["dex"] as string;
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
        supported_resolutions: SUPPORTED_RESOLUTIONS,
        volume_precision: 8,
        data_status: "streaming",
      };

      onSymbolResolvedCallback(symbolInfo);
    },

    getBars: async (
      symbolInfo: any,
      resolution: any,
      periodParams: any,
      onHistoryCallback: any,
      onErrorCallback: any,
    ) => {
      const { from, to, firstDataRequest, countBack } = periodParams;

      if (noDataRef.current) {
        onHistoryCallback([], {
          noData: true,
        });
        return;
      }

      try {
        const currency: CurrencyChart =
          (localStorage.getItem("chart_currency") as CurrencyChart) || "SOL";
        const chartType: ChartType =
          (localStorage.getItem("chart_type") as ChartType) || "Price";

        // @ts-ignore
        const interval = PRICE_MAP[resolution];

        const fromMs = from * 1000;
        const toMs = to * 1000;

        console.warn(
          "TV DEBUG ✨ | GET BARS RUN 📊",
          Date.now(),
          noDataRef.current,
        );
        const res = await fetchHistoricalData({
          mint: symbolInfo.ticker!,
          interval,
          currency: currency.toLowerCase() as "sol" | "usd",
          from: fromMs,
          to: toMs,
          countBack,
          initial: isInitialBarRef.current,
        });
        if (tokenSupplyRef.current === null && res.supply) {
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
          lastBarRef.current = bars[bars.length - 1] as any;

          updateTitle(
            (lastBarRef.current as Bar).high,
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
            localStorage.getItem("chart_hide_buy_avg_price_line") === "false"
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
            localStorage.getItem("chart_hide_sell_avg_price_line") === "false"
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
        console.warn("TV DEBUG ✨ | GET BARS ERROR 🔴", error);
        Sentry.captureMessage(
          `Error getting bars 🔴 – (Trading View) | Error: ${error?.toString()}`,
          "error",
        );
      }
    },

    subscribeBars: (
      symbolInfo: LibrarySymbolInfo,
      resolution: ResolutionString,
      onRealtimeCallback: SubscribeBarsCallback,
      subscriberUID: string,
    ) => {
      subscribeCallback(
        symbolInfo,
        resolution,
        onRealtimeCallback,
        subscriberUID,
      );
    },

    unsubscribeBars: (subscriberUID: string) => {
      unsubscribeCallback(subscriberUID);
    },
  };
};
