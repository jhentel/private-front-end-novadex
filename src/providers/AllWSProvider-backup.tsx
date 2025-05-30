"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useEffect, useRef } from "react";
import { usePathname, useParams } from "next/navigation";
import { useTwitterMonitorMessageStore } from "@/stores/footer/use-twitter-monitor-message.store";
import { useWalletTrackerMessageStore } from "@/stores/footer/use-wallet-tracker-message.store";
import { useSolPriceMessageStore } from "@/stores/use-solprice-message.store";
import { useWalletsMessageStore } from "@/stores/wallets/use-wallets-message.store";
import { useHoldingsMessageStore } from "@/stores/holdings/use-holdings-messages.store";
import { useAlertMessageStore } from "@/stores/footer/use-alert-message.store";
import { useMatchWalletTrackerTradesStore } from "@/stores/token/use-match-wallet-tracker-trades";
import { useFooterStore } from "@/stores/footer/use-footer.store";
import { getWalletBalances } from "@/apis/rest/wallet-manager";
import { useUserWalletStore } from "@/stores/wallet/use-user-wallet.store";
import { useSniperFooterStore } from "@/stores/footer/use-sniper-footer.store";
import { useWalletTrackerStore } from "@/stores/footer/use-wallet-tracker";
import { useTabVisibility } from "@/hooks/use-tab-visibility";
import { useCurrentTokenDeveloperTradesStore } from "@/stores/token/use-current-token-developer-trades";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLatestTransactionMessageStore } from "@/stores/use-latest-transactions.store";
import axios from "@/libraries/axios";
import toast from "react-hot-toast";
import cookies from "js-cookie";
import * as Sentry from "@sentry/nextjs";
// ######## APIs 🛜 ########
import {
  getTwitterAPIKey,
  getTwitterMonitorAccounts,
} from "@/apis/rest/twitter-monitor";
import {
  getWalletTracker,
  getTrackedWallets,
  TrackedWallet,
} from "@/apis/rest/wallet-tracker";
import { getAlerts } from "@/apis/rest/alerts";
import { getSniperTasks } from "@/apis/rest/sniper";
import { getHoldings } from "@/apis/rest/holdings";
// ######## Components 🧩 ########
import Image from "next/image";
import CustomToast from "@/components/customs/toasts/CustomToast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
// ######## Types 🗨️ ########
import {
  HoldingsConvertedMessageType,
  TwitterMonitorMessageType,
} from "@/types/ws-general";
import { Trade } from "@/types/nova_tv.types";
import { AxiosError } from "axios";
// ######## Utils & Helpers 🤝 ########.
import { convertHoldingsResponse } from "@/helpers/convertResponses";
import { formatAmountWithoutLeadingZero } from "@/utils/formatAmount";
import { useVolumeStore } from "@/stores/use-volume.store";
import { getBaseURLBasedOnRegion } from "../utils/getBaseURLBasedOnRegion";
import { getWSBaseURLBasedOnRegion } from "@/utils/getWSBaseURLBasedOnRegion";
import SoundManager from "@/utils/SoundManager";
// ######## Constants ☑️ ########
import {
  defaultTVChartProperties,
  defaultTVChartPropertiesMainSeriesProperties,
} from "@/constants/trading-view.constant";

export default function AllWSProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const params = useParams();

  // State Configuration ✨
  const setBalance = useUserWalletStore((state) => state.setBalance);
  // ## Footer
  const setFooterMessage = useFooterStore((state) => state.setMessage);
  // ## Sniper
  const updateSniperState = useSniperFooterStore(
    (state) => state.updateSniperState,
  );
  const setTokenInfoState = useSniperFooterStore(
    (state) => state.setTokenInfoState,
  );
  // ## Transactions
  const setLatestTransactionMessage = useLatestTransactionMessageStore(
    (state) => state.setMessage,
  );

  // ## Developer Trades
  const resetCurrentTokenDeveloperTradesState =
    useCurrentTokenDeveloperTradesStore(
      (state) => state.resetCurrentTokenDeveloperTradesState,
    );
  // ## Twitter
  const setTwitterMonitorMessages = useTwitterMonitorMessageStore(
    (state) => state.setMessages,
  );
  const setTwitterMonitorIsLoading = useTwitterMonitorMessageStore(
    (state) => state.setIsLoading,
  );
  const monitoredAccountsRef = useRef<TwitterMonitorMessageType[]>([]);
  const monitoredAccounts = useTwitterMonitorMessageStore(
    (state) => state.messages,
  );
  useEffect(() => {
    monitoredAccountsRef.current = monitoredAccounts;
  }, [monitoredAccounts]);
  const setAccounts = useTwitterMonitorMessageStore(
    (state) => state.setAccounts,
  );
  const setWebsocketTwitterMonitorRef = useTwitterMonitorMessageStore(
    (state) => state.setWebsocketRef,
  );
  const userTrackedWallets = useWalletTrackerStore(
    (state) => state.trackedWallets,
  );
  const userTrackedWalletsRef = useRef<TrackedWallet[]>(userTrackedWallets);
  useEffect(() => {
    userTrackedWalletsRef.current = userTrackedWallets;
  }, [userTrackedWallets]);

  const trackedEnabledSound = useWalletTrackerStore(
    (state) => state.trackedEnabledSound,
  );
  const mutedTrackedEnabledSoundRef = useRef<string[]>(trackedEnabledSound);
  useEffect(() => {
    mutedTrackedEnabledSoundRef.current = trackedEnabledSound;
  }, [trackedEnabledSound]);

  // ## All
  const setSolPriceMessages = useSolPriceMessageStore(
    (state) => state.setMessages,
  );
  const walletTrackerMessages = useWalletTrackerMessageStore(
    (state) => state.messages,
  );
  const setInitWalletTrackerMessages = useWalletTrackerMessageStore(
    (state) => state.setInitMessages,
  );
  const setWalletTrackerMessages = useWalletTrackerMessageStore(
    (state) => state.setMessages,
  );
  const setHoldingsMessages = useHoldingsMessageStore(
    (state) => state.setMessages,
  );
  // const setMessagesWhenNotExists = useHoldingsMessageStore(
  //   (state) => state.setMessagesWhenNotExists,
  // );
  const setHoldingsTimestamp = useHoldingsMessageStore(
    (state) => state.setTimestamp,
  );
  const setWalletHoldingMessages = useWalletsMessageStore(
    (state) => state.setMessages,
  );
  const setMatchWalletTrackerTrades = useMatchWalletTrackerTradesStore(
    (state) => state.setMatchWalletTrackerTrades,
  );

  const isTabActive = useTabVisibility();
  const isTabActiveRef = useRef<boolean>(isTabActive);

  useEffect(() => {
    isTabActiveRef.current = isTabActive;
  }, [isTabActive]);

  // WS Configuration 🛜
  const twitterMonitorWSRef = useRef<WebSocket | null>(null);
  const allWSRef = useRef<WebSocket | null>(null);
  const notificationTrackerWSRef = useRef<WebSocket | null>(null);
  const setTrackedWalletsList = useWalletTrackerMessageStore(
    (state) => state.setTrackedWallets,
  );
  const setGlobalWalletTracker = useWalletTrackerStore(
    (state) => state.setTrackedWallets,
  );
  const setIsLoadingTracked = useWalletTrackerStore(
    (state) => state.setIsLoadingTrackedWallets,
  );
  const setIsInitialFetchedAlert = useAlertMessageStore(
    (state) => state.setIsInitialFetched,
  );
  const setAlertMessages = useAlertMessageStore((state) => state.setMessages);
  const setSniperState = useSniperFooterStore((state) => state.setSniperState);
  const setIsFetchedState = useSniperFooterStore(
    (state) => state.setIsFetchedState,
  );
  const volume = useVolumeStore((state) => state.volume);

  useQuery({
    queryKey: ["init-holdings"],
    queryFn: async () => {
      const res = await getHoldings();
      if (!res || res.length === 0) return [];
      setHoldingsMessages(res);
      setHoldingsTimestamp(new Date().getTime());
      return res;
    },
    enabled: pathname !== "/login",
  });
  const refetchHoldings = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["init-holdings"],
    });
  };

  // Wallet Balance Configuration
  useQuery({
    queryKey: ["wallets-balance"],
    queryFn: async () => {
      const res = await getWalletBalances();
      setBalance(res);
      return res;
    },
    enabled: pathname !== "/login",
  });

  const {
    data: trackedWallets,
    isLoading: isTrackedWalletsLoading,
    isFetched: isFetchedTracked,
  } = useQuery({
    queryKey: ["tracked-wallets"],
    queryFn: async () => getTrackedWallets(),
    enabled: pathname !== "/login",
  });

  useEffect(() => {
    if (trackedWallets) {
      setTrackedWalletsList(trackedWallets);
      setGlobalWalletTracker(trackedWallets);
    }
    if (isTrackedWalletsLoading && !isFetchedTracked) {
      setIsLoadingTracked(true);
    } else {
      setIsLoadingTracked(false);
    }
  }, [trackedWallets, isTrackedWalletsLoading, isFetchedTracked]);

  // Wallet Tracker Configuration
  const {
    refetch: refetchGetWalletTracker,
    data: walletTrackerData,
    isLoading: isLoadingWalletTrackerData,
  } = useQuery({
    queryKey: ["wallet-tracker"],
    queryFn: async () => {
      const res = await getWalletTracker();
      setInitWalletTrackerMessages(res);
      return res;
    },
    enabled: pathname !== "/login",
  });

  const {
    refetch: refetchGetTrackedWallets,
    data: trackedWalletData,
    isLoading: isLoadingTrackedWalletData,
  } = useQuery({
    queryKey: ["tracked-wallets"],
    queryFn: async () => {
      const res = await getTrackedWallets();
      return res;
    },
    enabled: pathname !== "/login",
  });

  useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const res = await getAlerts();
      setIsInitialFetchedAlert(true);
      setAlertMessages(res);
      return res;
    },
    enabled: pathname !== "/login",
  });

  useQuery({
    queryKey: ["sniper-tasks"],
    queryFn: async () => {
      const tasks = await getSniperTasks();
      setSniperState(tasks);
      setIsFetchedState(true);
      return tasks;
    },
    enabled: pathname !== "/login",
  });

  useEffect(() => {
    if (
      walletTrackerData &&
      trackedWalletData &&
      !isLoadingWalletTrackerData &&
      !isLoadingTrackedWalletData
    ) {
      const walletTrackerThatMatchWithTokenData = walletTrackerData.filter(
        (wt) =>
          wt.mint ===
          ((params?.["mint-address"] || params?.["pool-address"]) as string),
      );

      if (walletTrackerThatMatchWithTokenData.length > 0) {
        const convertedWalletTrackerIntoTradeData: Trade[] =
          walletTrackerThatMatchWithTokenData
            .map((wt) => {
              const trackedWalletAdditionalInfo = trackedWalletData.find(
                (tw) => tw.address === wt.walletAddress,
              );

              if (!trackedWalletAdditionalInfo) return null;

              return {
                average_price_sol: "",
                average_price_usd: "",
                colour: wt.type === "buy" ? "green" : "red",
                letter: trackedWalletAdditionalInfo.emoji || "",
                price: wt.price,
                price_usd: wt?.priceUsd,
                supply: "1000000000",
                timestamp: wt.timestamp,
                signature: wt.signature || "",
                token_amount: wt.tokenAmount || "0",
                wallet: trackedWalletAdditionalInfo.address || "",
                name: trackedWalletAdditionalInfo.name,
                mint: (params?.["mint-address"] ||
                  params?.["pool-address"]) as string,
              } as Trade;
            })
            .filter((trade): trade is Trade => trade !== null);

        if (convertedWalletTrackerIntoTradeData.length > 0) {
          setMatchWalletTrackerTrades(convertedWalletTrackerIntoTradeData);
        }
      } else {
      }
    }
  }, [
    walletTrackerData,
    trackedWalletData,
    isLoadingWalletTrackerData,
    isLoadingTrackedWalletData,
  ]);

  useEffect(() => {
    if (pathname?.includes("/token/")) {
      if (
        trackedWalletData &&
        trackedWalletData?.length > 0 &&
        !isLoadingTrackedWalletData
      ) {
        const walletTrackerThatMatchWithTokenData =
          walletTrackerMessages.filter(
            (wt) =>
              wt?.mint ===
              ((params?.["mint-address"] ||
                params?.["pool-address"]) as string),
          );

        if (walletTrackerThatMatchWithTokenData.length > 0) {
          const convertedWalletTrackerIntoTradeData: Trade[] =
            walletTrackerThatMatchWithTokenData
              .map((wt) => {
                const trackedWalletAdditionalInfo = trackedWalletData.find(
                  (tw) => tw.address === wt.walletAddress,
                );

                if (!trackedWalletAdditionalInfo) return null;

                return {
                  average_price_sol: "",
                  average_price_usd: "",
                  colour: wt.type === "buy" ? "green" : "red",
                  letter: trackedWalletAdditionalInfo.emoji || "",
                  price: wt.price,
                  price_usd: wt?.priceUsd,
                  supply: "1000000000",
                  timestamp: wt.timestamp,
                  signature: wt.signature || "",
                  token_amount: wt.tokenAmount || "0",
                  wallet: trackedWalletAdditionalInfo.address || "",
                  name: trackedWalletAdditionalInfo.name,
                  mint: (params?.["mint-address"] ||
                    params?.["pool-address"]) as string,
                } as Trade;
              })
              .filter((trade): trade is Trade => trade !== null);

          if (convertedWalletTrackerIntoTradeData.length > 0) {
            setMatchWalletTrackerTrades(convertedWalletTrackerIntoTradeData);
          }
        } else {
        }
      }
    }
  }, [
    walletTrackerMessages,
    trackedWalletData,
    isLoadingTrackedWalletData,
    pathname,
  ]);

  useEffect(() => {
    if (pathname !== "/") {
      setTokenInfoState(null);
    }
    if (pathname?.includes("/token/")) {
      refetchGetWalletTracker();
      refetchGetTrackedWallets();
    } else {
      resetCurrentTokenDeveloperTradesState();
      if (
        !localStorage.getItem(
          "tradingview.chartproperties.mainSeriesProperties",
        ) ||
        !localStorage.getItem("tradingview.chartproperties") ||
        localStorage
          .getItem("tradingview.chartproperties.mainSeriesProperties")
          ?.includes(`"candleStyle":{"upColor":"#089981","downColor":"#F23645"`)
      ) {
        localStorage.setItem(
          "tradingview.chartproperties",
          JSON.stringify(defaultTVChartProperties),
        );
        localStorage.setItem(
          "tradingview.chartproperties.mainSeriesProperties",
          JSON.stringify(defaultTVChartPropertiesMainSeriesProperties),
        );
      }
    }
  }, [pathname]);

  useEffect(() => {
    setTokenInfoState(null);
  }, []);

  useEffect(() => {
    if (pathname == "/login") return;
    const getInitialSolPrice = async () => {
      try {
        // Fetch data server-side
        const { data } = await axios.get<{ price: number }>(
          getBaseURLBasedOnRegion("/prices/solana"),
        );
        setSolPriceMessages(data);
      } catch (error: unknown) {
        // console.error("ERROR INITIAL FETCH SOLANA PRICE 🚫🚫🚫: ", error);
        const axiosError = error as AxiosError;

        const errorDetails = {
          type: "Fetch Error",
          timestamp: Date.now(),
          errorMessage: axiosError.message || "Unknown error occurred",
          stack: axiosError.stack || null,
          status: axiosError.response?.status || null,
          url: axiosError.config?.url || null,
        };

        Sentry.withScope((scope) => {
          scope.setExtras(errorDetails);
          Sentry.captureException(
            new Error(`Fetch Solana Price 🔴 - ${errorDetails.errorMessage}`),
          );
        });
      }
    };
    getInitialSolPrice();
  }, []);

  const twitterWSPingCloseTimeout = useRef<NodeJS.Timeout | null>(null);

  const allWSPingInterval = useRef<NodeJS.Timeout | null>(null);
  const allWSPingErrorTimeout = useRef<NodeJS.Timeout | null>(null);
  const allWSPingCloseTimeout = useRef<NodeJS.Timeout | null>(null);
  const allWSLastPingTimestamp = useRef<number>(undefined);
  const allWSConnectedStatus = useRef<boolean>(false);
  const allWSIsConnecting = useRef<boolean>(false);

  const notificationTrackerWSPingInterval = useRef<NodeJS.Timeout | null>(null);
  const notificationTrackerWSPingErrorTimeout = useRef<NodeJS.Timeout | null>(
    null,
  );
  const notificationTrackerWSPingCloseTimeout = useRef<NodeJS.Timeout | null>(
    null,
  );
  const notificationTrackerWSLastPingTimestamp = useRef<number>(undefined);
  const notificationTrackerWSConnectedStatus = useRef<boolean>(false);
  const notificationTrackerWSIsConnecting = useRef<boolean>(false);

  useEffect(() => {
    if (pathname == "/login") return;
    let reconnectAttempts = 0;

    const connectWebSocketAll = () => {
      const token = cookies.get("_nova_session");
      if (!token || token === "") return;

      if (allWSIsConnecting.current || allWSConnectedStatus.current) return;
      allWSIsConnecting.current = true;

      try {
        if (allWSRef.current) {
          allWSRef.current.close();
        }

        const ws = new WebSocket(String(getWSBaseURLBasedOnRegion()));
        allWSRef.current = ws;

        ws.onopen = () => {
          reconnectAttempts = 0;
          // console.log("ALL WS - CONNECTED ✅");
          handleSendMessage("others");

          allWSIsConnecting.current = false;
          allWSConnectedStatus.current = true;
          allWSLastPingTimestamp.current = Date.now();

          if (allWSPingInterval.current) {
            clearInterval(allWSPingInterval.current);
          }

          allWSPingInterval.current = setInterval(() => {
            if (allWSConnectedStatus.current) {
              const now = Date.now();

              if (now - allWSLastPingTimestamp.current! > 4000) {
                allWSConnectedStatus.current = false;
                allWSIsConnecting.current = false;
                ws.close();
              } else {
              }
            }
          }, 4000);
        };

        ws.onmessage = (event) => {
          try {
            if (
              event.data.includes(`"success":true,"channel"`) ||
              event.data.includes("Ping")
            )
              return;
            const message: {
              channel:
                | "alerts"
                | "solanaPrice"
                | "holdings"
                | "footer"
                | "sniper"
                | "walletBalances"
                | "ping";
              data: any;
            } = JSON.parse(event.data);
            // console.log(`ALL- ON MESSAGE 📨 ${message.channel}`, message);

            if (message.channel === "ping") {
              allWSLastPingTimestamp.current = Date.now();
              return;
            }

            switch (message.channel) {
              case "walletBalances":
                setBalance(message.data);
                break;
              case "sniper":
                updateSniperState(message.data);
                break;
              case "footer":
                setFooterMessage(message.data);
                break;
              case "alerts":
                setAlertMessages(
                  Array.isArray(message.data) ? message.data : [message.data],
                );
                break;
              case "solanaPrice":
                setSolPriceMessages(message.data);
                localStorage.setItem(
                  "current_solana_price",
                  String(message.data.price),
                );
                break;
              case "holdings":
                const type =
                  window.location.pathname.startsWith("/holdings") ||
                  window.location.pathname.startsWith("/token")
                    ? "holding"
                    : "wallet";

                const convertedMessage: HoldingsConvertedMessageType[] =
                  convertHoldingsResponse(message?.data);

                setWalletHoldingMessages(convertedMessage);
                // if (window.location.pathname.startsWith("/holdings")) {
                //   setMessagesWhenNotExists(convertedMessage);
                // } else {
                // }
                setHoldingsMessages(convertedMessage);
                let newHoldings: string[] = [];
                // convertedMessage.map((h) => {
                //   h.tokens.map((t: any) => {
                //     if (!listAllMints.includes(t.token.mint)) {
                //       newHoldings.push(t.token.mint);
                //     }
                //   });
                // });

                setHoldingsTimestamp(new Date().getTime());
                break;
              default:
                break;
            }
          } catch (e) {
            // console.error("Error parsing message:", e);
            Sentry.captureMessage(
              `Parse Error 📨 - (All WS): ${String(e)}`,
              "error",
            );
          }
        };

        ws.onerror = (event) => {
          // console.error("ALL WS - ERROR ⛔:", event);
          Sentry.captureMessage(
            `Error 🔴 - (All WS): ${String(event)}`,
            "error",
          );
        };

        ws.onclose = () => {
          // console.log("ALL WS - DISCONNECTED ❌");
          allWSIsConnecting.current = false;
          allWSConnectedStatus.current = false;

          if (window.location.pathname !== "/login") {
            allWSPingCloseTimeout.current = setTimeout(() => {
              reconnectAttempts++;
              allWSIsConnecting.current = false;
              allWSConnectedStatus.current = false;
              connectWebSocketAll();
            }, 1000);
          } else {
          }
        };
      } catch (error) {
        const message =
          error && typeof error === "object" && "message" in error
            ? (error as any).message
            : "Unknown error";

        // console.error("ALL- CONNECTION FAILED ❌:", error);
        Sentry.captureMessage(
          `Connection Failed ❌ - (All WS): ${String(message)}`,
          "error",
        );
      }
    };
    const connectWebSocketTwitter = async () => {
      const token = cookies.get("_nova_session");
      if (!token || token === "") return;

      if (!cookies.get("_twitter_api_key")) {
        const { success, message: twitterAPIKey } = await getTwitterAPIKey();
        if (!success) return;

        cookies.set("_twitter_api_key", twitterAPIKey);
      }

      try {
        const ws = new WebSocket(
          String(`${process.env.NEXT_PUBLIC_WS_TWITTER_MONITOR_URL}`),
        );
        twitterMonitorWSRef.current = ws;
        setWebsocketTwitterMonitorRef(ws);

        ws.onopen = () => {
          reconnectAttempts = 0;
          // console.log("TWITTER MONITOR - CONNECTED ✅");
          handleSendMessage("twitter-init");
        };

        ws.onmessage = (event) => {
          try {
            if (
              event.data.includes("success") ||
              event.data.includes("Ping") ||
              event.data.includes("UpdateType") ||
              event.data.includes("error")
            ) {
              setTwitterMonitorIsLoading(false);
              return;
            }
            const message: TwitterMonitorMessageType = JSON.parse(event.data);

            setTwitterMonitorMessages({
              ...message,
              id: `${message.tweet_id}_${message.type}_${message.mint}`,
            });
            setTwitterMonitorIsLoading(false);
          } catch (e) {
            Sentry.captureMessage(
              `Parse Error 📨 - (TW WS): ${String(e)}`,
              "error",
            );
          }
        };

        ws.onerror = (event) => {
          // console.error("TWITTER MONITOR - ERROR ⛔:", event);
          Sentry.captureMessage(
            `Error 🔴 - (TW WS): ${String(event)}`,
            "error",
          );
        };

        ws.onclose = () => {
          // console.log("TWITTER MONITOR - DISCONNECTED ❌");

          if (
            monitoredAccountsRef.current.length > 0 &&
            window.location.pathname !== "/login"
          ) {
            // console.log("TW - TRY RECONNECT ✅");
            twitterWSPingCloseTimeout.current = setTimeout(() => {
              reconnectAttempts++;
              connectWebSocketTwitter();
            }, 2000);
          } else {
            // console.log("TW - STOP RECONNECT ❌");
          }
        };
      } catch (error) {
        const message =
          error && typeof error === "object" && "message" in error
            ? (error as any).message
            : "Unknown error";

        // console.error("TWITTER MONITOR - CONNECTION FAILED ❌:", error);
        Sentry.captureMessage(
          `Connection Failed ❌ - (All WS): ${String(message)}`,
          "error",
        );
      }
    };
    const connectWebSocketNotificationTracker = () => {
      const token = cookies.get("_nova_session");
      if (!token || token === "") return;

      if (
        notificationTrackerWSIsConnecting.current ||
        notificationTrackerWSConnectedStatus.current
      )
        return;
      notificationTrackerWSIsConnecting.current = true;

      try {
        if (notificationTrackerWSRef.current) {
          notificationTrackerWSRef.current.close();
        }

        const ws = new WebSocket(String(getWSBaseURLBasedOnRegion()));
        notificationTrackerWSRef.current = ws;

        ws.onopen = () => {
          reconnectAttempts = 0;
          // console.log("NOTIFICATION TRACKER - CONNECTED ✅");
          handleSendMessage("notifications-tracker-transactions");

          notificationTrackerWSIsConnecting.current = false;
          notificationTrackerWSConnectedStatus.current = true;
          notificationTrackerWSLastPingTimestamp.current = Date.now();

          if (notificationTrackerWSPingInterval.current) {
            clearInterval(notificationTrackerWSPingInterval.current);
          }

          notificationTrackerWSPingInterval.current = setInterval(() => {
            if (notificationTrackerWSConnectedStatus.current) {
              const now = Date.now();

              if (
                now - notificationTrackerWSLastPingTimestamp.current! >
                4000
              ) {
                notificationTrackerWSConnectedStatus.current = false;
                notificationTrackerWSIsConnecting.current = false;
                ws.close();
              } else {
              }
            }
          }, 4000);
        };

        ws.onmessage = (event) => {
          try {
            if (
              event.data.includes(`"success":true,"channel"`) ||
              event.data.includes("Ping")
            )
              return;
            const message: {
              channel: "notifications" | "tracker" | "transactions" | "ping";
              data: any;
            } = JSON.parse(event.data);

            if (message.channel === "ping") {
              notificationTrackerWSLastPingTimestamp.current = Date.now();
              return;
            }

            switch (message.channel) {
              case "notifications":
                if (isTabActiveRef.current) {
                  if (message?.data?.status === "pending") {
                    toast.custom((t: any) => (
                      <CustomToast
                        tVisibleState={t.visible}
                        message={message?.data?.message}
                        state="LOADING"
                      />
                    ));
                  }

                  if (message?.data?.status === "success") {
                    if (window.location.pathname.startsWith("/token")) {
                      setTimeout(() => {
                        refetchHoldings();
                      }, 3000);
                    } else if (
                      window.location.pathname.startsWith("/holdings")
                    ) {
                      refetchHoldings();
                    }
                    toast.dismiss();
                    toast.custom((t: any) => (
                      <CustomToast
                        tVisibleState={t.visible}
                        message={message?.data?.message}
                        state="SUCCESS"
                      />
                    ));
                  }

                  if (message?.data?.status === "failed") {
                    toast.custom((t: any) => (
                      <CustomToast
                        tVisibleState={t.visible}
                        message={message?.data?.message}
                        state="ERROR"
                      />
                    ));
                  }

                  if (message?.data?.status === "error") {
                    if (message?.data?.message.includes("Our servers")) return;
                    toast.custom((t: any) => (
                      <CustomToast
                        tVisibleState={t.visible}
                        message={message?.data?.message}
                        state="ERROR"
                      />
                    ));
                  }
                } else {
                }
                break;
              case "tracker":
                if (message.data) {
                  if (
                    typeof mutedTrackedEnabledSoundRef.current !== "boolean" &&
                    !mutedTrackedEnabledSoundRef.current.includes(
                      message.data.walletAddress,
                    )
                  ) {
                    SoundManager.getInstance().play(volume || 100);

                    const walletAdditionalInfo =
                      userTrackedWalletsRef.current.find(
                        (tw) => tw.address === message.data.walletAddress,
                      );

                    toast.custom((t: any) => (
                      <CustomToast
                        tVisibleState={t.visible}
                        link={`/token/${message.data.mint}`}
                        customMessage={
                          <div className="flex items-center gap-x-1.5 text-sm leading-[20px] text-fontColorPrimary">
                            <span>{walletAdditionalInfo?.emoji}</span>
                            <span>{walletAdditionalInfo?.name}</span>
                            {message.data.type === "buy" ? (
                              <span className="text-success">just bought</span>
                            ) : (
                              <span className="text-destructive">sold</span>
                            )}
                            <span>
                              {formatAmountWithoutLeadingZero(
                                message.data.solAmount,
                              )}{" "}
                              SOL of
                            </span>
                            <Avatar className="size-[14px] overflow-hidden rounded-full">
                              <div className="size-full border border-[#DF74FF]/30 bg-border/0 backdrop-blur-lg">
                                <AvatarImage
                                  key={message.data.image}
                                  src={message.data.image}
                                  alt={`${message.data.symbol} Image`}
                                  loading="lazy"
                                  className="size-full rounded-full object-cover"
                                />
                                <AvatarFallback className="absolute left-1/2 top-1/2 flex size-3 -translate-x-1/2 -translate-y-1/2 rounded-full">
                                  <Image
                                    src="/logo.png"
                                    alt="Nova Logo"
                                    fill
                                    quality={100}
                                    loading="lazy"
                                    placeholder="blur"
                                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..."
                                    className="object-contain"
                                  />
                                </AvatarFallback>
                              </div>
                            </Avatar>{" "}
                            <span>{message.data.symbol}</span>
                          </div>
                        }
                        state="SUCCESS"
                      />
                    ));
                  }

                  setWalletTrackerMessages(
                    Array.isArray(message.data) ? message.data : [message.data],
                  );
                }
                break;
              case "transactions":
                if (message.data && !pathname?.includes("/token/")) {
                  if (message.data.balance === 0) {
                    console.warn("LATEST TRANSACTION ✨ - DEC 🔴", {
                      mint: message?.data?.mint,
                      balance: message?.data?.balance,
                      balanceStr: message?.data?.balanceStr,
                    });
                    return;
                  }
                  console.warn("LATEST TRANSACTION ✨ - ACC 🟢", {
                    mint: message?.data?.mint,
                    balance: message?.data?.balance,
                    balanceStr: message?.data?.balanceStr,
                  });
                  setLatestTransactionMessage({
                    mint: message?.data?.mint,
                    wallet: message?.data?.wallet,
                    balance: message?.data?.balance,
                    balanceStr: message?.data?.balanceStr,
                    timestamp: Math.floor(Date.now() / 1000),
                  });
                }
                break;
              default:
                break;
            }
          } catch (e) {
            Sentry.captureMessage(
              `Parse Error 📨 - (Notification Tracker WS): ${String(e)}`,
              "error",
            );
            // console.error("Error parsing message:", e);
          }
        };

        ws.onerror = (event) => {
          // console.error("NOTIFICATION TRACKER - ERROR ⛔:", event);
          Sentry.captureMessage(
            `Error 🔴 - (Notification Tracker WS): ${String(event)}`,
            "error",
          );
        };

        ws.onclose = () => {
          // console.log("NOTIFICATION TRACKER - DISCONNECTED ❌");
          notificationTrackerWSIsConnecting.current = false;
          notificationTrackerWSConnectedStatus.current = false;

          if (
            !notificationTrackerWSIsConnecting.current &&
            window.location.pathname !== "/login"
          ) {
            notificationTrackerWSPingCloseTimeout.current = setTimeout(() => {
              reconnectAttempts++;
              notificationTrackerWSIsConnecting.current = false;
              notificationTrackerWSConnectedStatus.current = false;
              connectWebSocketNotificationTracker();
            }, 1000);
          } else {
          }
        };
      } catch (error) {
        const message =
          error && typeof error === "object" && "message" in error
            ? (error as any).message
            : "Unknown error";

        // console.error("NOTIFICATION TRACKER - CONNECTION FAILED ❌:", error);
        Sentry.captureMessage(
          `Connection Failed ❌ - (Notification Tracker WS): ${String(message)}`,
          "error",
        );
      }
    };

    connectWebSocketAll();
    connectWebSocketTwitter();
    connectWebSocketNotificationTracker();

    return () => {
      if (twitterMonitorWSRef.current) {
        twitterMonitorWSRef.current.close();
        twitterMonitorWSRef.current = null;
        setWebsocketTwitterMonitorRef(null);
      }
      if (allWSRef.current) {
        allWSRef.current.close();
        allWSRef.current = null;
        allWSConnectedStatus.current = false;
      }
      if (notificationTrackerWSRef.current) {
        notificationTrackerWSRef.current.close();
        notificationTrackerWSRef.current = null;
        notificationTrackerWSConnectedStatus.current = false;
      }

      if (allWSPingInterval.current) {
        clearInterval(allWSPingInterval.current);
        allWSPingInterval.current = null;
      }
      if (notificationTrackerWSPingInterval.current) {
        clearInterval(notificationTrackerWSPingInterval.current);
        notificationTrackerWSPingInterval.current = null;
      }

      if (twitterWSPingCloseTimeout.current) {
        clearTimeout(twitterWSPingCloseTimeout.current);
        twitterWSPingCloseTimeout.current = null;
      }
      if (allWSPingErrorTimeout.current) {
        clearTimeout(allWSPingErrorTimeout.current);
        allWSPingErrorTimeout.current = null;
      }
      if (allWSPingCloseTimeout.current) {
        clearTimeout(allWSPingCloseTimeout.current);
        allWSPingCloseTimeout.current = null;
      }
      if (notificationTrackerWSPingErrorTimeout.current) {
        clearTimeout(notificationTrackerWSPingErrorTimeout.current);
        notificationTrackerWSPingErrorTimeout.current = null;
      }
      if (notificationTrackerWSPingCloseTimeout.current) {
        clearTimeout(notificationTrackerWSPingCloseTimeout.current);
        notificationTrackerWSPingCloseTimeout.current = null;
      }

      SoundManager.getInstance().cleanup();
    };
  }, []);

  const handleSendMessage = async (
    type: "twitter-init" | "others" | "notifications-tracker-transactions",
  ) => {
    const token = cookies.get("_nova_session");
    if (!token || token === "") return;
    const WSRef = type === "twitter-init" ? twitterMonitorWSRef : allWSRef;
    if (!WSRef.current || WSRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      if (type === "twitter-init") {
        const result = await getTwitterMonitorAccounts();

        setAccounts(result);

        if (result.length === 0) {
          setTwitterMonitorIsLoading(false);
          return;
        }

        const subscriptionMessage = {
          action: "subscribe",
          licenseKey: cookies.get("_twitter_api_key"),
          usernames: [...result.map((acc) => acc.username)],
        };

        WSRef.current.send(JSON.stringify(subscriptionMessage));
      } else if (type === "others") {
        const channel: string[] = [
          "alerts",
          "solanaPrice",
          "holdings",
          "footer",
          "sniper",
          "walletBalances",
        ];
        WSRef?.current?.send(
          JSON.stringify(
            channel.map((c) => {
              const message = [
                "alerts",
                "solanaPrice",
                "holdings",
                "footer",
                "sniper",
                "walletBalances",
              ].includes(c)
                ? {
                    channel: c,
                    token,
                  }
                : {
                    channel: c,
                  };

              return message;
            }),
          ),
        );
        // console.log("SUBSCRIBE TO ALL WS 📨");
      } else if (type === "notifications-tracker-transactions") {
        notificationTrackerWSRef?.current?.send(
          JSON.stringify([
            {
              channel: "transactions",
              token,
            },
            {
              channel: "notifications",
              token,
            },
            {
              channel: "tracker",
              token,
            },
          ]),
        );
        // console.log("SUBSCRIBE TO NOTICATION WS 🔔");
      }
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error
          ? (error as any).message
          : "Unknown error";

      // console.error("Error sending message:", error);
      Sentry.captureMessage(
        `Handle Send Message ❌ - (All WS Provider): ${String(message)}`,
        "error",
      );
    }
  };

  return <>{children}</>;
}
