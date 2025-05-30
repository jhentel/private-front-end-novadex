"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState, useEffect, useRef } from "react";
import { useTokenMessageStore } from "@/stores/token/use-token-messages.store";
import { useTokenHoldingStore } from "@/stores/token/use-token-holding.store";
import { useTradesTableSettingStore } from "@/stores/table/token/use-trades-table-setting.store";
import { useHoldingsMessageStore } from "@/stores/holdings/use-holdings-messages.store";
import { useSolPriceMessageStore } from "@/stores/use-solprice-message.store";
import { useWalletsMessageStore } from "@/stores/wallets/use-wallets-message.store";
import { useQuery } from "@tanstack/react-query";
import axios from "@/libraries/axios";
import cookies from "js-cookie";
import toast from "react-hot-toast";
// ######## APIs 🛜 ########
import { getServerTime } from "@/apis/rest/settings/server-time";
// ######## Components 🧩 ########
import Link from "next/link";
import CustomToast from "@/components/customs/toasts/CustomToast";
// ######## Types 🗨️ ########
import {
  HoldingsConvertedMessageType,
  TokenDataMessageType,
  TransactionInfo,
} from "@/types/ws-general";
// ######## Utils & Helpers 🤝 ########
import throttle from "lodash/throttle";
import { deduplicateAndPrioritizeLatestData_TransactionWS } from "@/helpers/deduplicateAndPrioritizeLatestData";
import { getWSBaseURLBasedOnRegion } from "@/utils/getWSBaseURLBasedOnRegion";
import { getBaseURLBasedOnRegion } from "../../../utils/getBaseURLBasedOnRegion";
// ######## Constants ☑️ ########
import { THROTTLE_DURATION } from "@/constants/duration";

const TokenWSAndFetch = ({
  mint,
  initChartData,
}: {
  mint: string;
  initChartData: TokenDataMessageType | null;
}) => {
  // State Configuration ✨
  const {
    setWSMintRef,
    setWSHoldingRef,
    tokenInfoMessage,
    transactionMessages,
    priceMessage,
    volumeMessage,
    dataSecurityMessage,
    chartHolderMessages,
    chartTraderMessages,
    timestamp,
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
  } = useTokenMessageStore();
  // const [initChartData, setInitChartData], const setLastHoldingTimestamp = useTokenHo =
  // useState<TokenDataMessageType | null>(null);
  const setTokenHolding = useTokenHoldingStore((state) => state.setMessage);
  const setIsLoadingHolding = useTokenHoldingStore(
    (state) => state.setIsLoading,
  );
  const userTrades = useTokenHoldingStore((state) => state.userTrades);
  const setLastHoldingTimestamp = useTokenHoldingStore(
    (state) => state.setLastTimestamp,
  );
  const holdingToken = useTokenHoldingStore((state) => state.messages);
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

  // WS Configuration 🛜
  const WSMintRef = useRef<WebSocket | null>(null);
  const WSHoldingRef = useRef<WebSocket | null>(null);
  const isWSMounted = useRef(true);
  // Throttle Configuration 🏍️
  const [mergeThrottledList, setMergeThrottledList] = useState(false);
  const mergeThrottledListRef = useRef(mergeThrottledList);
  useEffect(() => {
    mergeThrottledListRef.current = mergeThrottledList;
  }, [mergeThrottledList]);

  const lastCallRef = useRef<number>(0);
  const [throttledTransactionList, setThrottledTransactionList] = useState<
    TransactionInfo[]
  >([]);

  const throttledSetTokenInfoMessage = useRef(
    throttle(setTokenInfoMessage, THROTTLE_DURATION),
  ).current;
  const throttledSetPriceMessage = useRef(
    throttle(setPriceMessage, THROTTLE_DURATION),
  ).current;
  const throttledSetVolumeMessage = useRef(
    throttle(setVolumeMessage, THROTTLE_DURATION),
  ).current;
  const throttledSetDataSecurityMessage = useRef(
    throttle(setDataSecurityMessage, THROTTLE_DURATION),
  ).current;
  const throttledSetChartHolderMessages = useRef(
    throttle(setChartHolderMessages, THROTTLE_DURATION),
  ).current;
  const throttledSetTotalHolderMessages = useRef(
    throttle(setTotalHolderMessages, THROTTLE_DURATION),
  ).current;
  const throttledSetChartTraderMessages = useRef(
    throttle(setChartTraderMessages, THROTTLE_DURATION),
  ).current;
  const throttledSetTimestamp = useRef(
    throttle(setTimestamp, THROTTLE_DURATION),
  ).current;

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

  const connectChartWebSocket = (
    type: "mint" | "chartHoldings" | "all" = "all",
  ) => {
    const token = cookies.get("_nova_session");
    if (!token || token === "") return;

    try {
      const ws = new WebSocket(String(getWSBaseURLBasedOnRegion()));
      if (type == "mint") {
        WSMintRef.current = ws;
        setWSMintRef(ws);
      } else {
        WSHoldingRef.current = ws;
        setWSHoldingRef(ws);
      }

      ws.onopen = () => {
        if (!isWSMounted.current) return;
        handleSendMessage(type);
      };

      ws.onmessage = (event) => {
        if (!isWSMounted.current) return;
        try {
          if (event.data.includes("success") || event.data.includes("Ping")) {
            return;
          }

          let message;
          if (Array.isArray(JSON.parse(event.data))) {
            message = JSON.parse(event.data);
            setTransactionMessages(message);
            return;
          } else {
            message = JSON.parse(event.data)?.data;
          }

          if (message?.wallet || type == "chartHoldings") {
            setIsLoadingHolding(false);

            if (message.holding.investedSol === 0) return;
            setLastHoldingTimestamp(Date.now());
            setTokenHolding({
              wallet: message.wallet,
              tokens: [message.holding],
            });

            setWalletHoldingMessages([
              {
                wallet: message.wallet,
                tokens: [message.holding],
              },
            ]);
            setHoldingsMessages({
              wallet: message.wallet,
              tokens: [message.holding],
            });
            return;
          }

          const now = Date.now();
          setTokenInfoMessage(message.token);
          if (isTradesTableScrollMoreThanZeroRef.current) {
            setPausedTransactionMessages(message.transaction);
          } else {
            if (now - lastCallRef.current >= THROTTLE_DURATION) {
              lastCallRef.current = now;
              setTransactionMessages(message.transaction);

              const txTimestamp = message.transaction?.timestamp;
              const timeAgo = Date.now() - txTimestamp;

              setTimeout(() => {
                setMergeThrottledList(true);
              }, THROTTLE_DURATION);
            } else {
              setThrottledTransactionList((prev) => [
                message.transaction,
                ...prev,
              ]);
            }
          }
          setPriceMessage(message.price);
          setVolumeMessage(message.volume);
          setDataSecurityMessage(message.data_security);
          throttledSetChartHolderMessages(message.chart_holders.chart_holders);
          throttledSetTotalHolderMessages(message.chart_holders.total_holders);
          throttledSetChartTraderMessages(message.chart_traders);
          throttledSetTimestamp(message.timestamp);
        } catch (e) {
          console.warn("Error parsing message:", e);
        }
      };

      ws.onerror = (event) => {
        if (!isWSMounted.current) return;
        console.warn("TOKEN | " + type?.toUpperCase() + " - ERROR ⛔:", event);
      };

      ws.onclose = () => {
        if (!isWSMounted.current) return;
        /* console.log("TOKEN | " + type?.toUpperCase() + " - DISCONNECTED ❌") */;
        setTimeout(connectChartWebSocket, 5000);
      };
    } catch (error) {
      if (!isWSMounted.current) return;
      console.warn(
        "TOKEN | " + type?.toUpperCase() + " - CONNECTION FAILED ❌:",
        error,
      );
    }
  };
  useEffect(() => {
    connectChartWebSocket("chartHoldings");
    connectChartWebSocket("mint");

    return () => {
      isWSMounted.current = false;
      if (WSMintRef.current) {
        WSMintRef.current.close();
        WSMintRef.current = null;
        setWSMintRef(null);
        setPausedTransactionList([]);
        setTransactionMessages([]);
        setMergeThrottledList(false);
        setThrottledTransactionList([]);
        setTokenInfoMessage({} as any);
        setTransactionMessages([]);
        setPriceMessage({} as any);
        setVolumeMessage({} as any);
        setDataSecurityMessage({} as any);
        setChartHolderMessages([] as any);
        setTotalHolderMessages([] as any);
        setChartTraderMessages([] as any);
        setTimestamp(0);
        setDeveloperTokens([] as any);
        setLastHoldingTimestamp(0);
        setIsLoadingHolding(true);
      }
      if (WSHoldingRef.current) {
        WSHoldingRef.current.close();
        WSHoldingRef.current = null;
        setWSHoldingRef(null);
      }
    };
  }, []);
  useEffect(() => {
    if (mergeThrottledList && throttledTransactionList.length > 0) {
      setTransactionMessages(throttledTransactionList);

      setThrottledTransactionList([]);
      setMergeThrottledList(false);
    }
  }, [mergeThrottledList]);

  const handleSendMessage = (
    type: "mint" | "chartHoldings" | "all" = "all",
  ) => {
    const token = cookies.get("_nova_session");
    if (!token || token === "") return;

    const WSRef = type === "mint" ? WSMintRef : WSHoldingRef;
    if (!WSRef.current || WSRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      const subscriptionMessage =
        type === "all"
          ? [
              {
                token: cookies.get("_nova_session"),
                channel: "chartHoldings",
                mint,
              },
              {
                token: cookies.get("_nova_session"),
                channel: mint,
              },
            ]
          : type === "mint"
            ? [
                {
                  token: cookies.get("_nova_session"),
                  channel: mint,
                },
              ]
            : [
                {
                  token: cookies.get("_nova_session"),
                  channel: "chartHoldings",
                  mint,
                },
              ];

      WSRef.current.send(JSON.stringify(subscriptionMessage));
    } catch (error) {
      console.warn("Error sending message:", error);
    }
  };

  const calculateTotalInvested = (
    holdings:
      | HoldingsConvertedMessageType[]
      | HoldingsConvertedMessageType
      | null,
  ): number => {
    if (!holdings) return 0;

    if (Array.isArray(holdings)) {
      return holdings.reduce((total, holding) => {
        return (
          total +
          holding.tokens.reduce((tokenTotal, token) => {
            return tokenTotal + (token.investedSol || 0);
          }, 0)
        );
      }, 0);
    }

    if (!holdings.tokens?.length) return 0;

    return holdings.tokens.reduce((total, token) => {
      return total + (token.investedSol || 0);
    }, 0);
  };

  useEffect(() => {
    if (
      userTrades.length > 0 &&
      WSHoldingRef.current &&
      calculateTotalInvested(holdingToken) === 0
    ) {
      WSHoldingRef.current.close();
      WSHoldingRef.current = null;
      setWSHoldingRef(null);
      connectChartWebSocket("chartHoldings");
    }
  }, [userTrades]);

  const initialFetch = useRef(true);
  useEffect(() => {
    if (
      initChartData &&
      initChartData.success !== false &&
      initialFetch.current === true
    ) {
      initialFetch.current = false;

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

      setTokenInfoMessage(initChartData?.token);
      setInitTransactionMessages(initChartData?.transactions?.reverse());
      setPriceMessage(initChartData?.price);
      setVolumeMessage(initChartData?.volume);
      setDataSecurityMessage(initChartData?.data_security);
      setChartHolderMessages(initChartData?.chart_holders.chart_holders);
      setTotalHolderMessages(initChartData?.chart_holders.total_holders);
      setChartTraderMessages(initChartData?.chart_traders);
      setTimestamp(Date.now() / 1000);
    }
  }, [initChartData]);

  const timeSyncToastId = useRef<null | any>(null);
  const checkSystemTimeSync = async () => {
    const serverTime = await getServerTime();
    const userTime = new Date();

    const diffInSeconds = Math.abs((Number(userTime) - serverTime) / 1000);
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
      // console.log("CSTS - TIME MISMATCH! 🔴", {
      //   serverTime,
      //   userTime: Number(userTime),
      //   diffInSeconds,
      // });
    } else {
      toast.dismiss(timeSyncToastId.current);
      // console.log("CSTS - TIME MATCH! 🟢", {
      //   serverTime,
      //   userTime: Number(userTime),
      //   diffInSeconds,
      // });
    }
  };

  useEffect(() => {
    let oldTime: number = new Date().getTime();

    const checkSystemTimePeriodically = () => {
      const d = new Date().getTime();

      const diff = Math.abs(d - oldTime);

      if (diff > 60_000 * 3) {
        // console.log("CSTS - You changed the time! 🔴", {
        //   diff,
        //   oldTime,
        // });
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
        // console.log("CSTS - You not change the time! 🟢", {
        //   diff,
        //   oldTime,
        // });
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
  return <></>;
};

export default TokenWSAndFetch;
