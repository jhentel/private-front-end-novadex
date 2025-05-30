import React from "react";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useTokenMessageStore } from "@/stores/token/use-token-messages.store";
import { useTokenHoldingStore } from "@/stores/token/use-token-holding.store";
import { useTradesTableSettingStore } from "@/stores/table/token/use-trades-table-setting.store";
import { useHoldingsMessageStore } from "@/stores/holdings/use-holdings-messages.store";
import { useSolPriceMessageStore } from "@/stores/use-solprice-message.store";
import { useWalletsMessageStore } from "@/stores/wallets/use-wallets-message.store";
import { useCurrentTokenFreshWalletsStore } from "@/stores/token/use-current-token-fresh-wallets.store";
import { useQuery, useMutation } from "@tanstack/react-query";
import useVisibilityRefresh from "@/hooks/use-visibility-refresh";
import axios from "@/libraries/axios";
import cookies from "js-cookie";
import toast from "react-hot-toast";
// ######## APIs 🛜 ########
import { getServerTime } from "@/apis/rest/settings/server-time";
import { getFreshFundedInfo } from "@/apis/rest/trades";
// ######## Components 🧩 ########
import Link from "next/link";
import CustomToast from "@/components/customs/toasts/CustomToast";
// ######## Types 🗨️ ########
import {
  HoldingsConvertedMessageType,
  TokenDataMessageType,
  TransactionInfo,
  ChartTraderInfo,
  ChartHoldersInfo,
  WSMessage,
  ChartHoldingMessageType,
} from "@/types/ws-general";
// ######## Utils & Helpers 🤝 ########
import { deduplicateAndPrioritizeLatestData_TransactionWS } from "@/helpers/deduplicateAndPrioritizeLatestData";
import { getBaseURLBasedOnRegion } from "../../../utils/getBaseURLBasedOnRegion";
// ######## Constants ☑️ ########
import { TRANSACTION_BATCH_PROCESSING_INTERVAL_MS } from "@/constants/duration";
import {
  defaultTVChartProperties,
  defaultTVChartPropertiesMainSeriesProperties,
} from "@/constants/trading-view.constant";
import { useFilteredWalletTradesStore } from "@/stores/token/use-filtered-wallet-trades";
import { useCurrentTokenDeveloperTradesStore } from "@/stores/token/use-current-token-developer-trades";
import { useMatchWalletTrackerTradesStore } from "@/stores/token/use-match-wallet-tracker-trades";
import { useWebSocket } from "@/hooks/useWebsocketNew";
import { isRelevantMessage } from "@/utils/websocket/isRelevantMessage";
import { useLatestTransactionMessageStore } from "@/stores/use-latest-transactions.store";
import { useCurrentTokenChartPriceStore } from "@/stores/token/use-current-token-chart-price.store";
import { useServerTimeStore } from "@/stores/use-server-time.store";

type TokenDataQueuedMessage = {
  transaction: TransactionInfo;
  chart_holder: ChartHoldersInfo;
  chart_traders: ChartTraderInfo[];
};

const TokenSSRConfig = ({
  initChartData,
  isFetched,
}: {
  initChartData: TokenDataMessageType;
  isFetched: boolean;
}) => {
  const mint = useParams()?.["mint-address"] as string;
  const tokenDataMessageQueueRef = useRef<TokenDataQueuedMessage[]>([]);
  const tokenDataProcessingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // const tradesType = useTokenCardsFilter((state) => state.tradesType);

  // Process queued messages
  const processTokenDataMessageQueue = () => {
    const currentQueue = [...tokenDataMessageQueueRef.current];
    tokenDataMessageQueueRef.current = [];

    currentQueue.forEach(
      ({
        // token,
        transaction,
        // price,
        // volume,
        // data_security,
        chart_holder,
        chart_traders,
        // timestamp,
      }) => {
        if (isTradesTableScrollMoreThanZeroRef.current) {
          // if (tradesType[transaction.type as keyof typeof tradesType]) {
          setPausedTransactionMessages(transaction);
          // }
        } else {
          // if (tradesType[transaction.type as keyof typeof tradesType]) {
          setTransactionMessages(transaction);
          // }
        }
        setChartHolderMessages(chart_holder?.chart_holders);
        setTotalHolderMessages(chart_holder?.total_holders);
        setChartTraderMessages(chart_traders);
      },
    );
  };

  // Auto Refresh upon visibility change 👁️
  useVisibilityRefresh({
    ms: 60_000 * 10,
  });

  // State Configuration ✨
  const {
    // setWSMintRef,
    // setWSHoldingRef,
    dataSecurityMessage,
    // timestamp,
    setTokenInfoMessage,
    setInitTransactionMessages,
    setTransactionMessages,
    setPriceMessage,
    setVolumeMessage,
    setDataSecurityMessage,
    setChartHolderMessages,
    setTotalHolderMessages,
    setChartTraderMessages,
    setTimestamp,
    setDeveloperTokens,
    cleanup: cleanupToken,
  } = useTokenMessageStore();

  const setTokenHolding = useTokenHoldingStore((state) => state.setMessage);
  const setIsLoadingHolding = useTokenHoldingStore(
    (state) => state.setIsLoading,
  );
  const setLastHoldingTimestamp = useTokenHoldingStore(
    (state) => state.setLastTimestamp,
  );
  const setSolPrice = useSolPriceMessageStore((state) => state.setMessages);
  const setHoldingsMessages = useHoldingsMessageStore(
    (state) => state.updateMessage,
  );

  const setWalletHoldingMessages = useWalletsMessageStore(
    (state) => state.setMessages,
  );

  useQuery({
    queryKey: ["solanaPrice"],
    queryFn: async () => {
      const { data } = await axios.get<{ price: number }>(
        getBaseURLBasedOnRegion("/prices/solana"),
      );
      if (data.price)
        localStorage.setItem("current_solana_price", String(data.price));
      setSolPrice(data);
      return data.price;
    },
  });

  const setFreshWallets = useCurrentTokenFreshWalletsStore(
    (state) => state.setCurrentTokenFreshwallets,
  );
  const getFreshWallets = useMutation({
    mutationFn: getFreshFundedInfo,
    onSuccess: (data) => {
      // console.log("Fresh Wallets Info 🟢", {
      //   data: data.results,
      // });
      setFreshWallets(data?.results);
    },
    onError: () => {
      // console.warn("Fresh Wallets Error 🔴", error);
    },
  });

  // ### Hover Transaction Paused Configuration
  const [pausedTransactionList, setPausedTransactionList] = useState<
    TransactionInfo[]
  >([]);
  const setPausedTransactionMessages = (
    newMessages: TransactionInfo | TransactionInfo[],
  ) => {
    setPausedTransactionList((prev) => {
      const updatedList = deduplicateAndPrioritizeLatestData_TransactionWS([
        ...(Array.isArray(newMessages) ? newMessages : [newMessages]),
        ...prev,
      ]);

      return updatedList;
    });
  };
  const isPaused = useTradesTableSettingStore((state) => state.isPaused);
  const isTradesTableScrollMoreThanZeroRef = useRef(isPaused);
  useEffect(() => {
    isTradesTableScrollMoreThanZeroRef.current = isPaused;
  }, [isPaused]);
  useEffect(() => {
    if (!isPaused && pausedTransactionList.length > 0) {
      setTransactionMessages(pausedTransactionList);
      setPausedTransactionList([]);
    }
  }, [isPaused]);

  useQuery({
    queryKey: ["developer-tokens", dataSecurityMessage?.deployer],
    queryFn: async () => {
      if (!dataSecurityMessage?.deployer) return null;

      const { data } = await axios.get(
        getBaseURLBasedOnRegion("/developer-tokens"),
        {
          params: {
            developer: dataSecurityMessage.deployer,
          },
        },
      );
      setDeveloperTokens(data);
      return data;
    },
    enabled: !!dataSecurityMessage?.deployer,
  });

  /*
   * Websockets Configuration:
   * websocket to set token tables and side
   */
  const { stopMessage: stopTokenMessage } = useWebSocket<
    WSMessage<TokenDataMessageType>
  >({
    channel: mint,
    initialMessage: {
      channel: mint,
      action: "join",
    },
    onInit: () => {
      tokenDataProcessingTimerRef.current = setInterval(
        processTokenDataMessageQueue,
        TRANSACTION_BATCH_PROCESSING_INTERVAL_MS,
      );
    },
    onMessage: (event) => {
      if (!isRelevantMessage(mint, event)) return;

      const message: TokenDataMessageType = event.data;
      if (!message) return;

      const {
        token,
        price,
        volume,
        data_security,
        transaction,
        timestamp,
        chart_holders,
        chart_traders,
      } = message;

      if (token) setTokenInfoMessage(token);
      if (price) setPriceMessage(price);
      if (volume) setVolumeMessage(volume);
      if (data_security) setDataSecurityMessage(data_security);
      if (timestamp) setTimestamp(timestamp);
      if (transaction && chart_holders && chart_traders) {
        tokenDataMessageQueueRef.current.push({
          transaction,
          chart_holder: chart_holders,
          chart_traders: chart_traders,
        });
      }
    },
  });

  /*
   * Websockets Configuration:
   * websocket to set token page our holding token:
   * invested, remaining, sold, pnl, my position
   */
  const { stopMessage: stopChartHoldingsMessage } = useWebSocket<
    WSMessage<ChartHoldingMessageType>
  >({
    channel: "chartHoldings",
    initialMessage: {
      channel: "chartHoldings",
      action: "join",
      mint,
    },
    onMessage: (event) => {
      if (!isRelevantMessage("chartHoldings", event)) return;

      const message = event.data;
      if (!message.wallet) return;

      setIsLoadingHolding(false);

      if (
        (message.holding.investedSol <= 0 && message.holding.balance <= 0) ||
        message.holding.token.mint !== mint
      )
        return;

      const holdingData = {
        wallet: message.wallet,
        tokens: [message.holding],
      };

      if (!firstChartHoldingMessage) {
        setFirstChartHoldingMessage(holdingData);
      }

      setLastHoldingTimestamp(Date.now());
      setTokenHolding(holdingData);
      setWalletHoldingMessages([holdingData]);
      setHoldingsMessages(holdingData);
    },
  });

  const cleanupHolding = useTokenHoldingStore((state) => state.cleanup);
  const resetFilteredWalletTradesState = useFilteredWalletTradesStore(
    (state) => state.resetFilteredWalletTradesState,
  );
  const resetCurrentTokenDeveloperTradesState =
    useCurrentTokenDeveloperTradesStore(
      (state) => state.resetCurrentTokenDeveloperTradesState,
    );
  const resetMatchWalletTrackerTrades = useMatchWalletTrackerTradesStore(
    (state) => state.resetMatchWalletTrackerTrades,
  );
  const resetLatestTransactionMessages = useLatestTransactionMessageStore(
    (state) => state.resetMessages,
  );

  useEffect(() => {
    return () => {
      resetMatchWalletTrackerTrades();
      resetLatestTransactionMessages();
      stopChartHoldingsMessage();
      stopTokenMessage();
      cleanupToken();
      cleanupHolding();
      resetFilteredWalletTradesState();
      resetCurrentTokenDeveloperTradesState();
      setIsLoadingHolding(true);
    };
  }, []);

  const [firstChartHoldingMessage, setFirstChartHoldingMessage] =
    useState<HoldingsConvertedMessageType | null>(null);

  const setBaseTVState = () => {
    console.warn("TV BASE STATE DEBUG ✨");

    if (
      !localStorage.getItem("tradingview.chartproperties") ||
      localStorage
        .getItem("tradingview.chartproperties.mainSeriesProperties")
        ?.includes(`"candleStyle":{"upColor":"#089981","downColor":"#F23645"`)
    ) {
      localStorage.setItem(
        "tradingview.chartproperties",
        JSON.stringify(defaultTVChartProperties),
      );
    }
    if (
      !localStorage.getItem(
        "tradingview.chartproperties.mainSeriesProperties",
      ) ||
      localStorage
        .getItem("tradingview.chartproperties.mainSeriesProperties")
        ?.includes(`"candleStyle":{"upColor":"#089981","downColor":"#F23645"`)
    ) {
      localStorage.setItem(
        "tradingview.chartproperties.mainSeriesProperties",
        JSON.stringify(defaultTVChartPropertiesMainSeriesProperties),
      );
    }
  };

  useEffect(() => {
    if (
      !cookies.get("_chart_interval_resolution") ||
      cookies.get("_chart_interval_resolution") === "USD" ||
      cookies.get("_chart_interval_resolution") === "SOL"
    ) {
      cookies.set("_chart_interval_resolution", "1S");
    }
    if (!localStorage.getItem("chart_currency")) {
      localStorage.setItem("chart_currency", "USD");
      cookies.set("_chart_currency", "USD");
    }
    if (!localStorage.getItem("chart_type")) {
      localStorage.setItem("chart_type", "MCap");
    }
    if (!localStorage.getItem("chart_hide_buy_avg_price_line")) {
      localStorage.setItem("chart_hide_buy_avg_price_line", "false");
    }
    if (!localStorage.getItem("chart_hide_sell_avg_price_line")) {
      localStorage.setItem("chart_hide_sell_avg_price_line", "false");
    }

    setBaseTVState();

    let themeSetCount = 0;
    const themeSetInterval = setInterval(() => {
      if (themeSetCount < 10) {
        themeSetCount++;
        setBaseTVState();
      } else {
        clearInterval(themeSetInterval);
      }
    }, 500);

    return () => {
      if (themeSetInterval) {
        clearInterval(themeSetInterval);
      }
    };
  }, []);

  // set initial data to global state
  const initialFetch = useRef(true);
  const setCurrentTokenChartPrice = useCurrentTokenChartPriceStore(
    (state) => state.setCurrentTokenChartPrice,
  );
  const setCurrentTokenChartPriceUsd = useCurrentTokenChartPriceStore(
    (state) => state.setCurrentTokenChartPriceUsd,
  );
  const setCurrentTokenChartSupply = useCurrentTokenChartPriceStore(
    (state) => state.setCurrentTokenChartSupply,
  );
  useEffect(() => {
    if (
      initChartData &&
      initChartData.success !== false &&
      initialFetch.current === true
    ) {
      // console.log("INIT CHART DATA after if 🟢", {
      //   init: initChartData,
      //   isFetched,
      //   initialFetch: initialFetch.current,
      // });
      initialFetch.current = false;

      setBaseTVState();

      const chartHolders = initChartData?.chart_holders.chart_holders?.map(
        (holder) => holder?.maker,
      );
      getFreshWallets.mutate(chartHolders);
      const freshWalletInterval = setInterval(() => {
        getFreshWallets.mutate(chartHolders);
      }, 10000);

      // console.log("INIT RECEIVED 🟢", {
      //   initChartData,
      // });

      setTokenInfoMessage(initChartData.token);
      setInitTransactionMessages(initChartData?.transactions?.reverse() ?? []);
      setPriceMessage(initChartData.price);
      setCurrentTokenChartPrice(initChartData.price.price_sol.toString());
      setCurrentTokenChartPriceUsd(initChartData.price.price_usd.toString());
      setCurrentTokenChartSupply(initChartData.price.supply.toString());
      setVolumeMessage(initChartData.volume);
      setDataSecurityMessage(initChartData.data_security);
      setChartHolderMessages(initChartData?.chart_holders?.chart_holders ?? []);
      setTotalHolderMessages(initChartData?.chart_holders?.total_holders);
      setChartTraderMessages(initChartData?.chart_traders ?? []);
      setTimestamp(Date.now() / 1000);

      return () => {
        if (freshWalletInterval) {
          clearInterval(freshWalletInterval);
        }
        initialFetch.current = true;
        cleanupToken();
        cleanupHolding();
        setFreshWallets([]);
        if (tokenDataProcessingTimerRef.current) {
          clearInterval(tokenDataProcessingTimerRef.current);
        }
      };
    }
  }, [isFetched]);

  const timeSyncToastId = useRef<null | any>(null);
  const { setServerTime, setTimeOffset } = useServerTimeStore();

  const checkSystemTimeSync = async () => {
    const serverTime = await getServerTime();
    const userTime = new Date().getTime();

    // Calculate time offset between server and client
    const offset = serverTime - userTime;
    setServerTime(serverTime);
    setTimeOffset(offset);

    const diffInSeconds = Math.abs(offset / 1000);
    const threshold = 60 * 3;

    if (diffInSeconds > threshold) {
      timeSyncToastId.current = toast.custom(
        (t: any) => (
          <CustomToast
            tVisibleState={t.visible}
            customMessage={
              <div className="flex items-center gap-x-1.5 text-sm leading-[20px] text-fontColorPrimary">
                <span>Sync Error!</span>
                <span>
                  Time to{" "}
                  <Link
                    href="https://support.repzio.com/hc/en-us/articles/360042151612-How-to-Automatically-Synchronize-the-Date-Time-in-Windows-10-or-Mac-OS"
                    target="_blank"
                    className="text-destructive underline"
                  >
                    sync
                  </Link>{" "}
                  your device
                </span>
              </div>
            }
            state="ERROR"
          />
        ),
        {
          duration: Infinity,
          id: "time-sync",
        },
      );
    } else {
      toast.dismiss(timeSyncToastId.current);
    }
  };

  useEffect(() => {
    let oldTime: number = new Date().getTime();

    const checkSystemTimePeriodically = () => {
      const d = new Date().getTime();
      const diff = Math.abs(d - oldTime);

      if (diff > 60_000 * 3) {
        timeSyncToastId.current = toast.custom(
          (t: any) => (
            <CustomToast
              tVisibleState={t.visible}
              customMessage={
                <div className="flex items-center gap-x-1.5 text-sm leading-[20px] text-fontColorPrimary">
                  <span>Sync Error!</span>
                  <span>
                    Time to{" "}
                    <Link
                      href="https://support.repzio.com/hc/en-us/articles/360042151612-How-to-Automatically-Synchronize-the-Date-Time-in-Windows-10-or-Mac-OS"
                      target="_blank"
                      className="text-destructive underline"
                    >
                      sync
                    </Link>{" "}
                    your device
                  </span>
                </div>
              }
              state="ERROR"
            />
          ),
          {
            duration: Infinity,
            id: "time-sync",
          },
        );
      } else {
        toast.dismiss(timeSyncToastId.current);
      }

      oldTime = d;
    };

    const checkSystemTimeInSyncInterval = setInterval(
      checkSystemTimePeriodically,
      10_000,
    );
    const checkSystemTimeInSyncWithFetchInterval = setInterval(
      checkSystemTimeSync,
      60_000,
    );

    checkSystemTimePeriodically();
    checkSystemTimeSync();

    return () => {
      clearInterval(checkSystemTimeInSyncInterval);
      clearInterval(checkSystemTimeInSyncWithFetchInterval);
    };
  }, []);

  return null;
};

export default TokenSSRConfig;
