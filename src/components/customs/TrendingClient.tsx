"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState, useEffect, useRef, useMemo } from "react";
import { useActiveTrendingTimeStore } from "@/stores/dex-setting/use-active-trending-time-preset.store";
import { useUserInfoStore } from "@/stores/user/use-user-info.store";
import { useQuery } from "@tanstack/react-query";
import cookies from "js-cookie";
// ######## APIs 🛜 ########
import { getTrendingFetch } from "@/apis/rest/trending";
// ######## Components 🧩 ########
import NoScrollLayout from "@/components/layouts/NoScrollLayout";
import PageHeading from "@/components/customs/headings/PageHeading";
import DexBuySettings from "@/components/customs/DexBuySettings";
import TrendingTimeOption from "@/components/customs/TrendingTimeOption";
import TrendingListSection from "@/components/customs/sections/TrendingListSection";
// ######## Utils & Helpers 🤝 ########
import { getWSBaseURLBasedOnRegion } from "@/utils/getWSBaseURLBasedOnRegion";
// ######## Types 🗨️ ########
import { TrendingDataMessageType } from "@/types/ws-general";
import { MoreFilterState } from "@/stores/dex-setting/use-more-filter.store";
import { DexesFilterState } from "@/stores/dex-setting/use-dexes-filter.store";
import { useWebsocketMonitor } from "@/stores/use-websocket-monitor.store";
import { useWebsocket } from "@/hooks/use-websocket";
import { useWebSocket } from "@/hooks/useWebsocketNew";
const defautlInitTrendingMoreFilter = {
  showKeywords: "",
  checkBoxes: {
    mintAuth: false,
    freezeAuth: false,
    onlyLPBurned: false,
    hideBundled: false,
    top10Holders: false,
    withAtLeast1Social: false,
  },
  byCurrentLiquidity: {
    min: undefined,
    max: undefined,
  },
  byVolume: {
    min: undefined,
    max: undefined,
  },
  byAge: {
    min: undefined,
    max: undefined,
  },
  byMarketCap: {
    min: undefined,
    max: undefined,
  },
  byTXNS: {
    min: undefined,
    max: undefined,
  },
  byBuys: {
    min: undefined,
    max: undefined,
  },
  bySells: {
    min: undefined,
    max: undefined,
  },
};

const defaultDexesFilter = {
  checkBoxes: {
    pumpfun: true,
    moonshot: true,
    launchlab: true,
    raydium: true,
    meteora: true,
    pumpswap: true,
  },
};

const TrendingClient = ({
  initTrendingTime,
  moreFilterCookie,
  dexesFilterCookie,
}: {
  initTrendingTime: "1m" | "5m" | "30m" | "1h";
  moreFilterCookie: string;
  dexesFilterCookie: string;
}) => {
  const initMoreFilter = useMemo(() => {
    if (moreFilterCookie) {
      return JSON.parse(atob(moreFilterCookie));
    }
    return defautlInitTrendingMoreFilter;
  }, [moreFilterCookie]);

  const initDexesFilter = useMemo(() => {
    if (dexesFilterCookie) {
      return JSON.parse(atob(dexesFilterCookie));
    }

    return defaultDexesFilter;
  }, [dexesFilterCookie]);

  const isTrendingTutorial = useUserInfoStore(
    (state) => state.isTrendingTutorial,
  );
  const isTrendingTutorialRef = useRef(isTrendingTutorial);
  useEffect(() => {
    isTrendingTutorialRef.current = isTrendingTutorial;
  }, [isTrendingTutorial]);

  const isClient = useRef<boolean>(false);
  useEffect(() => {
    isClient.current = true;
  }, [isClient]);

  // ### Initial Fetch 🛜
  const activeTrendingTime = useActiveTrendingTimeStore(
    (state) => state.activeTrendingTime,
  );
  const activeTrendingTimeRef = useRef(activeTrendingTime);
  useEffect(() => {
    activeTrendingTimeRef.current = activeTrendingTime;
  }, [activeTrendingTime]);

  const {
    data: trendingInitialData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["trending-initial-fetch"],
    queryFn: async () => {
      const res = await getTrendingFetch({
        dexes: Object.entries(initDexesFilter?.checkBoxes)
          .filter(([_, value]) => value === true)
          .map(([key]) => {
            if (key === "pumpfun") {
              return "Pump.Fun";
            }
            if (key === "pumpswap") {
              return "Pump.Swap";
            }
            if (key === "launchlab") {
              return "LaunchLab";
            }
            if (key === "dynamic_bonding_curve") {
              return "Dynamic Bonding Curve";
            }
            if (key === "meteora_amm_v2") {
              return "Meteora AMM V2";
            }
            if (key === "meteora_amm") {
              return "Meteora AMM";
            }
            return key
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join("");
          })
          .join(","),
        show_keywords: initMoreFilter?.showKeywords,
        mint_disabled: initMoreFilter?.checkBoxes.mintAuth,
        freeze_disabled: initMoreFilter?.checkBoxes.freezeAuth,
        lp_burned: initMoreFilter?.checkBoxes.onlyLPBurned,
        hide_bundled: initMoreFilter?.checkBoxes.hideBundled,
        one_social: initMoreFilter?.checkBoxes.withAtLeast1Social,
        min_age: initMoreFilter?.byAge?.min,
        max_age: initMoreFilter?.byAge?.max,
        min_liquidity: initMoreFilter?.byCurrentLiquidity?.min,
        max_liquidity: initMoreFilter?.byCurrentLiquidity?.max,
        min_market_cap: initMoreFilter?.byMarketCap?.min,
        max_market_cap: initMoreFilter?.byMarketCap?.max,
        min_volume: initMoreFilter?.byVolume?.min,
        max_volume: initMoreFilter?.byVolume?.max,
        min_transactions: initMoreFilter?.byTXNS?.min,
        max_transactions: initMoreFilter?.byTXNS?.max,
        min_buys: initMoreFilter?.byBuys?.min,
        max_buys: initMoreFilter?.byBuys?.max,
        min_sells: initMoreFilter?.bySells?.min,
        max_sells: initMoreFilter?.bySells?.max,
        interval: currentInterval.current,
      });

      return res;
    },
  });
  // const [trendingMessage, setTrendingMessage] = useState<
  //   TrendingDataMessageType[]
  // >([]);

  useEffect(() => {
    if (!isLoading && trendingInitialData) {
      setTrendingList(trendingInitialData);
    }
  }, [isLoading, trendingInitialData, activeTrendingTime]);

  // ### WS Stream 🛜
  const [isLoadingStream, setIsLoadingStream] = useState<boolean>(false);
  const isInitialFetch = useRef(true);
  // const WSRef = useRef<WebSocket | null>(null);
  // const isWSMounted = useRef(true);

  const { sendMessage } = useWebSocket({
    channel: "trending",
    onInit: () => {
      const waitUntilClientInterval = setInterval(() => {
        if (isClient.current) {
          handleSendMessage();
          clearInterval(waitUntilClientInterval);
        }
      }, 1000);
    },
    onMessage: (event) => {
      try {
        if (event.channel !== "trending" || event.success === true) return;
        const message: {
          channel: any;
          data: TrendingDataMessageType[];
        } = event;
        if (isInitialFetch.current) {
          isInitialFetch.current = false;
        }

        if (isTrendingTutorialRef.current) {
          return;
        }

        if (
          message.data &&
          message.data[0] &&
          message.data[0].category === currentInterval.current
        ) {
          setTrendingList(message.data);
          setIsLoadingStream(false);
        } else {
          // console.log(
          //   "Ignoring message from different interval",
          //   message.data?.[0]?.category,
          // );
        }
      } catch (error) {
        console.warn("Error parsing message:", error);
        // addError("trending", {
        //   message: (error as any).message || "Error parsing message",
        //   timestamp: new Date(),
        // });
      }
    },
  });

  // const { addError } = useWebsocketMonitor();
  // const { send, disconnect } = useWebsocket({
  //   id: "trending",
  //   url: String(getWSBaseURLBasedOnRegion()),
  //   onopen: () => {
  //     const waitUntilClientInterval = setInterval(() => {
  //       if (isClient.current) {
  //         handleSendMessage();
  //         clearInterval(waitUntilClientInterval);
  //       }
  //     }, 1000);
  //   },
  //   onmessage: (event) => {
  //     try {
  //       if (event.data.includes("success") || event.data.includes("Ping"))
  //         return;
  //       const message: {
  //         channel: any;
  //         data: TrendingDataMessageType[];
  //       } = JSON.parse(event.data);
  //       if (isInitialFetch.current) {
  //         isInitialFetch.current = false;
  //       }
  //
  //       if (isTrendingTutorialRef.current) {
  //         return;
  //       }
  //
  //       setTrendingList(message.data);
  //       setIsLoadingStream(false);
  //     } catch (error) {
  //       console.warn("Error parsing message:", error);
  //       addError("trending", {
  //         message: (error as any).message || "Error parsing message",
  //         timestamp: new Date(),
  //       });
  //     }
  //   },
  // });
  //
  // useEffect(() => {
  //   return () => {
  //     disconnect();
  //   };
  // }, []);

  // useEffect(() => {
  //   const connectTrendingWebSocket = () => {
  //     const token = cookies.get("_nova_session");
  //     if (!token || token === "") return;
  //
  //     try {
  //       setWebsocketState("trending", {
  //         status: "connecting",
  //       });
  //       const ws = new WebSocket(String(getWSBaseURLBasedOnRegion()));
  //       WSRef.current = ws;
  //
  //       ws.onopen = () => {
  //         if (!isWSMounted.current) return;
  //         setWebsocketState("trending", {
  //           status: "connected",
  //           connectedTimestamp: new Date(),
  //           retryCount: 0,
  //         });
  //
  //         const waitUntilClientInterval = setInterval(() => {
  //           if (isClient.current) {
  //             handleSendMessage();
  //             clearInterval(waitUntilClientInterval);
  //           }
  //         }, 1000);
  //       };
  //
  //       ws.onmessage = (event) => {
  //         if (!isWSMounted.current) return;
  //         updateLastMessageTimestamp("trending", new Date());
  //         try {
  //           if (event.data.includes("success") || event.data.includes("Ping"))
  //             return;
  //           const message: {
  //             channel: any;
  //             data: TrendingDataMessageType[];
  //           } = JSON.parse(event.data);
  //           if (isInitialFetch.current) {
  //             isInitialFetch.current = false;
  //           }
  //
  //           if (isTrendingTutorialRef.current) {
  //             return;
  //           }
  //
  //           setTrendingList(message.data);
  //           setIsLoadingStream(false);
  //         } catch (error) {
  //           console.warn("Error parsing message:", error);
  //           addError("trending", {
  //             message: (error as any).message || "Error parsing message",
  //             timestamp: new Date(),
  //           })
  //         }
  //       };
  //
  //       ws.onerror = (event) => {
  //         if (!isWSMounted.current) return;
  //         console.warn("TRENDING - ERROR ⛔:", event);
  //         addError("trending", {
  //           message: (event as any).type || "Unknown WebSocket error",
  //           timestamp: new Date(),
  //         })
  //       };
  //
  //       ws.onclose = () => {
  //         if (!isWSMounted.current) return;
  //         if (ws.readyState === WebSocket.CLOSING) {
  //           setWebsocketState("trending", {
  //             status: "closing",
  //           });
  //         }
  //         if (ws.readyState === WebSocket.CLOSED) {
  //           setWebsocketState("trending", {
  //             status: "disconnected",
  //           });
  //         }
  //
  //         setTimeout(() => {
  //           connectTrendingWebSocket()
  //           setWebsocketState("trending", {
  //             status: "reconnecting",
  //             retryCount: trending.retryCount + 1,
  //           });
  //         }, 5000);
  //       };
  //     } catch (error) {
  //       if (!isWSMounted.current) return;
  //       setWebsocketState("trending", {
  //         status: "unknown",
  //       });
  //       addError("trending", {
  //         message: (error as any).message || "Failed to connect WebSocket",
  //         timestamp: new Date(),
  //       })
  //
  //       console.warn("Error connecting to WebSocket:", error);
  //     }
  //   };
  //
  //   connectTrendingWebSocket();
  //
  //   return () => {
  //     setWebsocketState("trending", {
  //       status: "disconnected",
  //       retryCount: 0,
  //     });
  //     isWSMounted.current = false;
  //     if (WSRef.current) {
  //       WSRef.current.close();
  //       WSRef.current = null;
  //     }
  //   };
  // }, []);

  const currentInterval = useRef<"1m" | "5m" | "30m" | "1h">(initTrendingTime);

  const handleSendMessage = async (interval?: "1m" | "5m" | "30m" | "1h") => {
    try {
      // First, send a "leave" message for the current subscription
      const leaveMessage = {
        channel: "trending",
        interval: currentInterval.current,
        action: "leave",
      };

      sendMessage(leaveMessage);
      // console.log(
      //   `Leaving trending subscription for interval: ${currentInterval.current}`,
      // );

      // Update current interval reference
      if (interval) {
        currentInterval.current = interval;
      } else {
        currentInterval.current =
          activeTrendingTimeRef.current.toLowerCase() as
            | "1m"
            | "5m"
            | "30m"
            | "1h";
      }

      // Clear current data when changing intervals
      setTrendingList([]);
      // setIsLoadingStream(true);

      refetch();

      // Then send a "join" message for the new subscription
      const joinMessage = {
        channel: "trending",
        interval: currentInterval.current,
        action: "join",
      };

      sendMessage(joinMessage);
      // console.log(
      //   `Joining trending subscription for interval: ${currentInterval.current}`,
      // );
    } catch (error) {
      console.warn("Error sending message:", error);
    }
  };

  // State ✨
  const [trendingList, setTrendingList] = useState<TrendingDataMessageType[]>(
    trendingInitialData || [],
  );

  const finalDataList = useMemo(() => {
    return Array.isArray(trendingList) && trendingList.length > 0
      ? trendingList
      : (trendingInitialData ?? []);
  }, [trendingList, trendingInitialData]);

  return (
    <>
      <NoScrollLayout>
        <div className="flex w-full flex-col flex-wrap justify-between gap-4 gap-y-2 px-4 pb-3 pt-4 lg:px-0 xl:flex-row xl:items-center xl:pb-1.5 xl:pt-3">
          <div className="flex flex-col items-start gap-x-2 gap-y-1 xl:flex-row xl:items-center">
            <PageHeading
              title="Trending"
              description="Top token pairs by transaction."
              line={1}
              showDescriptionOnMobile
            />
            <TrendingTimeOption
              handleSendTrendingMessage={handleSendMessage}
              initTrendingTime={initTrendingTime}
            />
          </div>
          <DexBuySettings variant="Trending" />
        </div>

        {/* <div className="grid w-full flex-grow grid-cols-2 gap-x-2"> */}
        <TrendingListSection
          list={finalDataList}
          isLoading={isLoading || isLoadingStream}
        />
      </NoScrollLayout>
      {/* <TrendingInteractiveTutorials /> */}
    </>
  );
};

export default TrendingClient;
