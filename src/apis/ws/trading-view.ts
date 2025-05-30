import {
  Bar,
  LibrarySymbolInfo,
  ResolutionString,
  SubscribeBarsCallback,
} from "@/types/charting_library";
import {
  ChartPrice,
  ChartType,
  CurrencyChart,
  InitialChartTrades,
  MessageStatus,
  Order,
  Ping,
  SolanaPrice,
  Trade,
} from "@/types/nova_tv.types";
import { removeAveragePriceLine } from "@/utils/nova_tv.utils";
import {
  getBarStartTime,
  updateTitle,
} from "@/utils/trading-view/trading-view-utils";
import cookies from "js-cookie";
import * as Sentry from "@sentry/nextjs";
import { getWSBaseURLBasedOnRegion } from "@/utils/getWSBaseURLBasedOnRegion";

export const initSocket = (
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
  ref: {
    tvWidgetRef: React.MutableRefObject<any>;
    tokenSupplyRef: React.MutableRefObject<string | null>;
    tradeMap: React.MutableRefObject<Map<string, Trade[]>>;
    lastBarRef: React.MutableRefObject<Bar | null>;
    buyAveragePriceShapeIdRef: React.MutableRefObject<string | null>;
    sellAveragePriceShapeIdRef: React.MutableRefObject<string | null>;
    buyAveragePriceTradeStartTimeRef: React.MutableRefObject<number | null>;
    sellAveragePriceTradeStartTimeRef: React.MutableRefObject<number | null>;
    buyAveragePriceShapePriceRef: React.MutableRefObject<number | null>;
    sellAveragePriceShapePriceRef: React.MutableRefObject<number | null>;
    allWSIsConnecting: React.MutableRefObject<boolean>;
    allWSConnectedStatus: React.MutableRefObject<boolean>;
    allWSLastPingTimestamp: React.MutableRefObject<number>;
    allWSPingInterval: React.MutableRefObject<NodeJS.Timeout | null>;
    reconnectTimeoutInitSocketRef: React.MutableRefObject<NodeJS.Timeout | null>;
    isInitialPriceMessageRef: React.MutableRefObject<boolean>;
    previousPriceRef: React.MutableRefObject<number | null>;
    lastMintSocketRef: React.MutableRefObject<string | null>;
    shouldReconnectRef: React.MutableRefObject<boolean>;
    reconnectAttemptsRef: React.MutableRefObject<number>;
    lastConnectionRef: React.MutableRefObject<{
      symbolInfo: LibrarySymbolInfo;
      onRealtimeCallback: SubscribeBarsCallback;
      handleThrottledUpdate: (data: {
        price: string;
        price_usd: string;
        supply: string;
      }) => void;
      resolution: ResolutionString;
      symbol: string;
    } | null>;
    startIntervalRef: React.MutableRefObject<boolean>;
    socketRef: React.MutableRefObject<WebSocket | null>;
  },
) => {
  const {
    tvWidgetRef,
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
  } = ref;

  lastConnectionRef.current = {
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

  const currency: CurrencyChart =
    (localStorage.getItem("chart_currency") as CurrencyChart) || "SOL";

  const chartType: ChartType =
    (localStorage.getItem("chart_type") as ChartType) || "Price";

  const token = cookies.get("_nova_session");
  if (!token || token === "") return;

  // ### Disconnect
  shouldReconnectRef.current = false;

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

      if (allWSPingInterval.current) {
        clearInterval(allWSPingInterval.current);
      }

      allWSPingInterval.current = setInterval(() => {
        if (allWSConnectedStatus.current) {
          const now = Date.now();

          // console.log("TCS ✨ | Chart Holdings DEBUG - INFO ℹ️", {
          //   now,
          //   lastPing: allWSLastPingTimestamp.current,
          //   shouldReconnect: now - allWSLastPingTimestamp.current! > 8000,
          //   diff: now - allWSLastPingTimestamp.current!,
          // });

          if (now - allWSLastPingTimestamp.current! > 8000) {
            allWSConnectedStatus.current = false;
            allWSIsConnecting.current = false;
            socketRef.current?.close();
          }
        }
      }, 4000);
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
        if (localStorage.getItem("chart_hide_buy_avg_price_line") === "false") {
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
        if (localStorage.getItem("chart_hide_buy_avg_price_line") === "false") {
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

      reconnectTimeoutInitSocketRef.current = setTimeout(() => {
        if (lastConnectionRef.current && shouldReconnectRef.current) {
          return initSocket(
            lastConnectionRef.current.symbolInfo,
            lastConnectionRef.current.onRealtimeCallback,
            lastConnectionRef.current.handleThrottledUpdate,
            lastConnectionRef.current.resolution,
            lastConnectionRef.current.symbol,
            subscriberUID,
            ref,
          );
        }
      }, 1000);
    };
  } catch (error) {
    console.warn("WebSocket initialization error:", error);
    allWSIsConnecting.current = false;
    return null;
  }

  return socketRef.current;
};
