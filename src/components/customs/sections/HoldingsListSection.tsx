"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useEffect, useMemo, useRef, useCallback, useState } from "react";
import {
  BatchPriceMessage,
  useHoldingsMessageStore,
} from "@/stores/holdings/use-holdings-messages.store";
import { useHoldingsFilterStore } from "@/stores/dex-setting/use-holdings-filter.store";
import { useUserWalletStore } from "@/stores/wallet/use-user-wallet.store";
import { useHoldingsHideStore } from "@/stores/holdings/use-holdings-hide.store";
import { useHoldingsSearchStore } from "@/stores/holdings/use-holdings-search.store";
import { useUserInfoStore } from "@/stores/user/use-user-info.store";
import { useQuery } from "@tanstack/react-query";
import { usePopupStore } from "@/stores/use-popup-state";
import cookies from "js-cookie";
// ######## APIs 🛜 ########
import { getHoldings } from "@/apis/rest/holdings";
// ######## Components 🧩 ########
import HoldingsTable from "@/components/customs/tables/HoldingsTable";
import HoldingsListMobile from "@/components/customs/lists/mobile/HoldingsListMobile";
import EmptyState from "@/components/customs/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import HoldingsCardLoading from "@/components/customs/loadings/HoldingsCardLoading";
import HoldingsCardMobileLoading from "@/components/customs/loadings/HoldingsCardMobileLoading";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useTrackedWalletsOfToken } from "@/hooks/use-tracked-wallets-of-token";

// ######## Types 🗨️ ########
import { getWallets, Wallet } from "@/apis/rest/wallet-manager";
import {
  HoldingsTransformedTokenData,
  HoldingsConvertedMessageType,
  HoldingsTokenData,
} from "@/types/ws-general";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
// ######## Constants ☑️ ########
import {
  HOLDINGS_BATCH_PROCESSING_INTERVAL_MS,
  HOLDINGS_CHART_PRICE_BATCH_PROCESSING_INTERVAL_MS,
} from "@/constants/duration";
import { dummyfilteredTokenBasedOnSelectedWalletData } from "@/constants/dummy-data";
import { useWindowSizeStore } from "@/stores/use-window-size.store";
import { useWebSocket } from "@/hooks/useWebsocketNew";

export type HoldingsDataQueuedMessage = {
  data: HoldingsConvertedMessageType | HoldingsConvertedMessageType[];
  timestamp: number;
};
export type HoldingsChartPriceDataQueuedMessage = {
  data: BatchPriceMessage;
  timestamp: number;
};
export default function HoldingsListSection() {
  const { walletsOfToken } = useTrackedWalletsOfToken();

  const isHoldingsTutorial = useUserInfoStore(
    (state) => state.isHoldingsTutorial,
  );

  // const holdingsMessagesTimestamp = useHoldingsMessageStore(
  //   (state) => state.timestamp,
  // );
  // const setWSChartHoldingRef = useHoldingsMessageStore(
  //   (state) => state.setWSChartHoldingRef,
  // );
  const listSubscribedMints = useHoldingsMessageStore(
    (state) => state.listSubscribedMints,
  );
  const updateHoldingsMessages = useHoldingsMessageStore(
    (state) => state.updateMessage,
  );
  const setHoldingsMessages = useHoldingsMessageStore(
    (state) => state.setMessages,
  );
  const setChartPriceMessage = useHoldingsMessageStore(
    (state) => state.setChartPriceMessage,
  );
  const chartPriceMessage = useHoldingsMessageStore(
    (state) => state.chartPriceMessage,
  );
  /* console.log(chartPriceMessage, "chartPriceMessage👀👀") */;

  // ### Batch Processing ✨
  const holdingsDataMessageQueueRef = useRef<HoldingsDataQueuedMessage[]>([]);
  const holdingsDataProcessingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const chartPriceHoldingsDataMessageQueueRef = useRef<
    HoldingsChartPriceDataQueuedMessage[]
  >([]);
  const chartPriceHoldingsDataProcessingTimerRef =
    useRef<NodeJS.Timeout | null>(null);

  const processHoldingsDataMessageQueue = () => {
    const currentQueue: HoldingsDataQueuedMessage[] = [
      ...holdingsDataMessageQueueRef.current,
    ];
    holdingsDataMessageQueueRef.current = [];

    currentQueue.forEach(({ data }) => {
      updateHoldingsMessages(data);
    });
  };
  const processChartPriceHoldingsDataMessageQueue = () => {
    const currentQueue = [...chartPriceHoldingsDataMessageQueueRef.current];
    chartPriceHoldingsDataMessageQueueRef.current = [];

    setChartPriceMessage(currentQueue.map((item) => item.data));
  };
  // console.log("chartPriceMessage❤️❤️", chartPriceMessage);
  const holdingsMessages = useHoldingsMessageStore((state) => state.messages);
  // console.log("HOLDINGS MESSAGES🧑‍🤝‍🧑", holdingsMessages);
  const isLoading = useHoldingsMessageStore((state) => state.isLoading);
  const { hiddenTokenList, isShowHiddenToken } = useHoldingsHideStore();
  const searchQuery = useHoldingsSearchStore((state) => state.searchQuery);
  const selectedMultipleActiveWalletHoldings = useUserWalletStore(
    (state) => state.selectedMultipleActiveWalletHoldings,
  );

  const withRemainingTokens = useHoldingsFilterStore(
    (state) => state.filters.genuine.withRemainingTokens,
  );

  const {
    data: initHoldings,
    isLoading: isLoadingFetch,
    isSuccess: isSuccessInit,
  } = useQuery({
    queryKey: ["init-holdings"],
    queryFn: async () => {
      const data = await getHoldings();
      if (data) {
        setHoldingsMessages(data);
      }
      return data;
    },
  });

  const finalHoldings = useMemo(() => {
    const holdings = (
      holdingsMessages.length > 0 &&
      holdingsMessages.length >= (initHoldings?.length as number)
        ? holdingsMessages
        : initHoldings
    ) as HoldingsConvertedMessageType[];

    return holdings;
  }, [
    holdingsMessages,
    initHoldings,
    isLoadingFetch,
    isSuccessInit,
    isHoldingsTutorial,
  ]);

  const tokenFilter = useCallback(
    (
      t: HoldingsTokenData,
      searchQuery: string,
      isShowHiddenToken: boolean,
      hiddenTokenList: string[],
      withRemainingTokens: boolean,
    ) => {
      const isHidden =
        !isShowHiddenToken && hiddenTokenList.includes(t.token.mint);

      if (searchQuery.trim()) {
        const keywords = searchQuery
          .toLowerCase()
          .split(",")
          .map((k) => k.trim());

        const tokenText = `${t.token.name} ${t.token.symbol}`.toLowerCase();
        const matchesKeyword = keywords.some(
          (keyword) =>
            tokenText?.includes(keyword) ||
            t?.token?.mint?.includes(searchQuery),
        );
        if (!matchesKeyword) {
          return false;
        }
      }

      const remaining = (t.balance / (t.balance + t.soldTokens)) * 100;
      if (withRemainingTokens) {
        return !isHidden && remaining > 0;
      }

      return !isHidden;
    },
    [isShowHiddenToken, hiddenTokenList, searchQuery, withRemainingTokens],
  );

  // Get wallets
  const {
    data: walletsFetch,
    isLoading: isLoadingWallet,
    isFetched,
    isSuccess,
  } = useQuery({
    queryKey: ["wallets"],
    queryFn: async () => {
      const res = await getWallets();
      return res;
    },
  });

  const finalWallets =
    selectedMultipleActiveWalletHoldings.length > 0
      ? selectedMultipleActiveWalletHoldings
      : (walletsFetch as Wallet[]);

  // ### With Memoized State ✨
  // Replace the useState/useEffect for dataList with this:
  const dataList = useMemo(() => {
    const dataMap = new Map<string, HoldingsTransformedTokenData>();

    finalWallets?.forEach((wallet) => {
      const walletHoldings = finalHoldings?.find(
        (holding) => holding.wallet === wallet.address,
      );

      if (walletHoldings) {
        walletHoldings.tokens
          ?.filter((token) => token.investedSol > 0 || token.balance > 0) // Keep this initial filter if desired
          .forEach((tokenHolding) => {
            const mint = tokenHolding.token.mint;
            if (dataMap.has(mint)) {
              const existingToken = dataMap.get(mint)!;
              const walletEntryIndex = existingToken.list.findIndex(
                (entry) => entry.wallet === wallet.address,
              );
              if (walletEntryIndex > -1) {
                // Update existing wallet entry immutably
                // @ts-ignore
                existingToken.list = [
                  ...existingToken.list.slice(0, walletEntryIndex),
                  { wallet: wallet.address, token: { ...tokenHolding } },
                  ...existingToken.list.slice(walletEntryIndex + 1),
                ];
              } else {
                existingToken.list.push({
                  wallet: wallet.address,
                  token: { ...tokenHolding },
                });
              }
            } else {
              dataMap.set(mint, {
                token: tokenHolding.token,
                list: [{ wallet: wallet.address, token: { ...tokenHolding } }],
              });
            }
          });
      }
    });

    return Array.from(dataMap.values());
  }, [
    finalWallets,
    finalHoldings,
    initHoldings,
    holdingsMessages,
    isShowHiddenToken,
    hiddenTokenList,
    isLoading,
    walletsFetch,
    isFetched,
    isSuccess,
  ]);

  const [isFirst, setIsFirst] = useState(true);
  const filteredTokenBasedOnSelectedWallet = useMemo(() => {
    const selectedWalletString =
      finalWallets?.map((wallet) => wallet.address) || [];

    const filtered = dataList
      .map((tokenData) => ({
        token: tokenData.token,
        list: tokenData.list.filter(
          (t) =>
            selectedWalletString.includes(t.wallet) && t.token.investedSol > 0,
        ),
      }))
      .map((tokenData) => ({
        token: tokenData.token,
        list: tokenData.list.filter((entry) => {
          const tokenDataForFilter: HoldingsTokenData = {
            token: tokenData.token,
            ...entry.token,
            balance_str: entry.token.balanceStr ?? "",
          };

          return tokenFilter(
            tokenDataForFilter,
            searchQuery,
            isShowHiddenToken,
            hiddenTokenList,
            withRemainingTokens,
          );
        }),
      }))
      .filter((tokenData) => tokenData.list.length > 0);

    if (isFirst) {
      filtered.sort((a, b) => {
        const lastBoughtA = Math.max(
          ...a.list.map((item) => item.token.lastBought || 0),
        );
        const lastBoughtB = Math.max(
          ...b.list.map((item) => item.token.lastBought || 0),
        );
        return lastBoughtB - lastBoughtA;
      });
    }

    return filtered as HoldingsTransformedTokenData[];
  }, [
    dataList,
    finalWallets,
    searchQuery,
    isShowHiddenToken,
    hiddenTokenList,
    withRemainingTokens,
    tokenFilter,
  ]);

  useEffect(() => {
    if (filteredTokenBasedOnSelectedWallet.length > 0) {
      setIsFirst(false);
    }
  }, [filteredTokenBasedOnSelectedWallet]);

  const finalLoading = isLoadingWallet || isLoading || isLoadingFetch;
  const width = useWindowSizeStore((state) => state.width);

  const handleSendMessage = (mints: string[]) => {
    try {
      const chartHoldingsSubscriptionLeaveMessage = {
        channel: "chartHoldings",
        token: cookies.get("_nova_session"),
        action: "leave",
      };
      const chartHoldingsSubscriptionJoinMessage = {
        channel: "chartHoldings",
        mints,
        token: cookies.get("_nova_session"),
        action: "join",
        method: "holdings",
      };
      const batchPriceSubscriptionLeaveMessage = {
        channel: "batchPrice",
        token: cookies.get("_nova_session"),
        action: "leave",
      };
      const batchPriceSubscriptionJoinMessage = {
        channel: "batchPrice",
        mints,
        token: cookies.get("_nova_session"),
        action: "join",
      };

      holdingSendMessage(chartHoldingsSubscriptionLeaveMessage);
      holdingSendMessage(chartHoldingsSubscriptionJoinMessage);
      holdingSendMessage(batchPriceSubscriptionLeaveMessage);
      holdingSendMessage(batchPriceSubscriptionJoinMessage);
    } catch (error) {
      console.warn("Error sending message:", error);
    }
  };

  const { sendMessage: holdingSendMessage } = useWebSocket({
    channel: "chartHoldings",
    onInit: () => {
      holdingsDataProcessingTimerRef.current = setInterval(
        processHoldingsDataMessageQueue,
        HOLDINGS_BATCH_PROCESSING_INTERVAL_MS,
      );
      chartPriceHoldingsDataProcessingTimerRef.current = setInterval(
        processChartPriceHoldingsDataMessageQueue,
        HOLDINGS_CHART_PRICE_BATCH_PROCESSING_INTERVAL_MS,
      );
    },
    onLeave: () => {
      if (holdingsDataProcessingTimerRef.current) {
        clearInterval(holdingsDataProcessingTimerRef.current);
        holdingsDataProcessingTimerRef.current = null;
      }
    },
    onMessage: (event) => {
      try {
        if (event?.channel === "ping" && event.success === true) {
          return;
        }

        const newMessage = event;
        if (newMessage.channel == "chartHoldings") {
          const prevHoldingWallet = holdingsDataMessageQueueRef.current.find(
            (item) =>
              (item.data as HoldingsConvertedMessageType).wallet ===
              newMessage?.data?.wallet,
          );
          const prevToken = (
            prevHoldingWallet?.data as HoldingsConvertedMessageType
          )?.tokens?.find(
            (item) => item.token.mint === newMessage?.data?.holding.token.mint,
          );
          if (
            newMessage?.data.holding.investedSol <= 0 && newMessage?.data.holding.balance <= 0 ||
            (prevToken?.balance === newMessage?.data?.holding.balance &&
              prevToken?.soldSol !== newMessage?.data?.holding.soldSol &&
              !(
                prevToken?.balance !== newMessage?.data?.holding.balance &&
                prevToken?.soldSol !== newMessage?.data?.holding.soldSol
              ))
          )
            return;
          holdingsDataMessageQueueRef.current.push({
            data: {
              wallet: newMessage?.data?.wallet,
              tokens: [newMessage?.data?.holding],
            },
            timestamp: Date.now(),
          });
          return;
        } else if (newMessage.channel == "batchPrice") {
          /* console.log("chartPriceMessage👀👀🌟🌟", newMessage) */;
          chartPriceHoldingsDataMessageQueueRef.current.push({
            data: newMessage,
            timestamp: Date.now(),
          });
        }
      } catch (e) {
        console.warn("Error parsing message:", e);
        // addError("holding", {
        //   message: (e as any).message || "Error parsing message",
        //   timestamp: new Date(),
        // });
      }
    },
  });

  const { remainingScreenWidth } = usePopupStore();
  const isSnapMobile = remainingScreenWidth < 1000;

  const adjustedDummyData = useMemo(() => {
    const newDummyData = dummyfilteredTokenBasedOnSelectedWalletData.map(
      (d) => {
        return {
          token: {
            name: d.token.name,
            symbol: d.token.symbol,
            dex: d.token.dex,
            mint: d.token.mint,
            pair: d.token.pair,
            supply: d.token.supply,
            image: d.token.image,
            twitter: d.token.telegram,
            website: d.token.website,
            origin_dex: d.token.origin_dex,
            buys: d.token.buys,
            sells: d.token.sells,
          },
          list: d.list.map((token) => {
            return {
              ...token,
              wallet: finalWallets ? finalWallets[0]?.address : "",
            };
          }),
        };
      },
    );

    return newDummyData;
  }, [isHoldingsTutorial, finalWallets]);

  return (
    <>
      {finalLoading ? (
        <HoldingsListSectionLoading />
      ) : (
        <>
          {width! >= 1280 && !isSnapMobile ? (
            <>
              {/* Desktop */}
              {filteredTokenBasedOnSelectedWallet.length === 0 &&
              !isHoldingsTutorial ? (
                <div className="mb-12 hidden w-full flex-grow flex-col items-center justify-center bg-[#080811] md:flex">
                  <EmptyState state="Holding" />
                </div>
              ) : (
                <div className="relative mb-12 hidden w-full flex-grow grid-cols-1 xl:grid">
                  <HoldingsTable
                    handleSendMessage={handleSendMessage}
                    list={
                      (isHoldingsTutorial
                        ? adjustedDummyData
                        : filteredTokenBasedOnSelectedWallet) as HoldingsTransformedTokenData[]
                    }
                    trackedWalletsOfToken={walletsOfToken}
                  />
                </div>
              )}
            </>
          ) : (
            <>
              {/* Mobile */}
              {filteredTokenBasedOnSelectedWallet.length === 0 &&
              !isHoldingsTutorial ? (
                <div
                  className={cn(
                    "mb-12 flex w-full flex-grow flex-col items-center justify-center md:hidden",
                    isSnapMobile && "md:flex",
                  )}
                >
                  <EmptyState state="Holding" />
                </div>
              ) : (
                <div
                  className={cn(
                    "relative mb-12 flex w-full flex-grow grid-cols-1 xl:hidden",
                    isSnapMobile && "xl:flex",
                  )}
                >
                  <HoldingsListMobile
                    handleSendMessage={handleSendMessage}
                    list={
                      (isHoldingsTutorial
                        ? adjustedDummyData
                        : filteredTokenBasedOnSelectedWallet) as HoldingsTransformedTokenData[]
                    }
                    trackedWalletsOfToken={walletsOfToken}
                  />
                </div>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}

const HoldingsListSectionLoading = () => {
  const width = useWindowSizeStore((state) => state.width);

  const variant = width! < 1280 ? "mobile" : "desktop";
  return variant === "desktop" ? (
    <div className="relative mb-12 hidden w-full flex-grow grid-cols-1 xl:grid">
      <div className="flex w-full flex-grow flex-col overflow-hidden rounded-[8px]">
        <OverlayScrollbarsComponent
          defer
          element="div"
          className="invisible__overlayscrollbar relative w-full flex-grow overflow-y-scroll"
        >
          <div className="absolute left-0 top-0 flex w-full flex-grow flex-col">
            <div className="flex h-10 min-w-max items-center rounded-t-[8px] border-b border-border pl-4 pr-4">
              <div className="flex w-full min-w-[14%] items-center p-3">
                <Skeleton className="h-4 w-full rounded-[4px] bg-gradient-to-r" />
              </div>
              <div className="flex w-full min-w-[14%] items-center p-3">
                <Skeleton className="h-4 w-full rounded-[4px] bg-gradient-to-r" />
              </div>
              <div className="flex w-full min-w-[14%] items-center p-3">
                <Skeleton className="h-4 w-full rounded-[4px] bg-gradient-to-r" />
              </div>
              <div className="flex w-full min-w-[14%] items-center p-3">
                <Skeleton className="h-4 w-full rounded-[4px] bg-gradient-to-r" />
              </div>
              <div className="flex w-full min-w-[14%] items-center p-3">
                <Skeleton className="h-4 w-full rounded-[4px] bg-gradient-to-r" />
              </div>
              <div className="flex w-full min-w-[14%] items-center p-3">
                <Skeleton className="h-4 w-full rounded-[4px] bg-gradient-to-r" />
              </div>
              <div className="flex w-full min-w-[14%] items-center p-3">
                <Skeleton className="h-4 w-full rounded-[4px] bg-gradient-to-r" />
              </div>
            </div>

            <div className="flex h-auto w-full flex-col">
              {Array.from({ length: 6 }).map((_, index) => (
                <HoldingsCardLoading key={index} index={index} />
              ))}
            </div>
          </div>
        </OverlayScrollbarsComponent>
      </div>
    </div>
  ) : (
    <div className="flex h-auto w-full flex-col gap-y-2 px-4 lg:px-0">
      {Array.from({ length: 30 }).map((_, index) => (
        <HoldingsCardMobileLoading key={index} />
      ))}
    </div>
  );
};
