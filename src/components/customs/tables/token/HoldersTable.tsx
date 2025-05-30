"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useTokenMessageStore } from "@/stores/token/use-token-messages.store";
import { useTokenCardsFilter } from "@/stores/token/use-token-cards-filter.store";
import { useQuery } from "@tanstack/react-query";
// ######## APIs 🛜 ########
import { getHolders } from "@/apis/rest/holders";
// ######## Components 🧩 ########
import Image from "next/image";
import HoldersCard from "@/components/customs/cards/token/HoldersCard";
import HeadCol from "@/components/customs/tables/HeadCol";
import SortButton, { SortCoinButton } from "@/components/customs/SortButton";
import {
  TokenHeaderLoading,
  TokenCardLoading,
} from "@/components/customs/loadings/TokenCardLoading";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { formatAmount } from "@/utils/formatAmount";
import { FixedSizeList } from "react-window";
import { usePopupStore } from "@/stores/use-popup-state";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function HoldersTable() {
  const params = useParams();
  const tokenData = useTokenMessageStore((state) => state.tokenInfoMessage);

  // List height measurement
  const listRef = useRef<HTMLDivElement>(null);
  const [listHeight, setListHeight] = useState(0);

  const isOldToken =
    useTokenMessageStore((state) => state.tokenInfoMessage?.isOld) || false;

  const {
    holdersBought,
    setHoldersBought,
    holdersSold,
    setHoldersSold,
    holdersRemaining,
    setHoldersRemaining,
  } = useTokenCardsFilter();
  const [selectedHoldersFilter, setSelectedHoldersFilter] = useState<
    | "Amount Of Holders"
    | "Insider Holding"
    | "Sniper Holding"
    | "Top 10 Holders"
  >("Amount Of Holders");

  const securityMessages = useTokenMessageStore(
    (state) => state.dataSecurityMessage,
  );
  const totalHolder = useTokenMessageStore(
    (state) => state.totalHolderMessages,
  );
  const amountOfHolders = useTokenMessageStore(
    (state) => state.chartHolderMessages,
  );

  const filterMap = {
    "Amount Of Holders": "holders",
    "Insider Holding": "insiders",
    "Sniper Holding": "snipers",
    "Top 10 Holders": "top10",
  };

  const { data: filteredHolders, isLoading } = useQuery({
    queryKey: ["chart_holders", selectedHoldersFilter],
    queryFn: () =>
      getHolders({
        mint: (params?.["mint-address"] || params?.["pool-address"]) as string,
        filter: filterMap[selectedHoldersFilter] as
          | "holders"
          | "top10"
          | "insiders"
          | "snipers",
      }),
  });

  const HeaderData = [
    {
      label: "Rank",
      tooltipContent: "The rank taking in account the amount of holdings",
      className: "w-[72px] flex-shrink-0 min-w-[72px] justify-center",
    },
    {
      label: "Wallet",
      tooltipContent: "The wallet of the holder",
      className: "min-w-[140px] min-[1500px]:min-w-[200px]",
    },

    {
      label: "Bought",
      sortButton: (
        <SortButton
          type="usdc-or-sol"
          value={holdersBought}
          setValue={setHoldersBought}
        />
      ),
      tooltipContent: "The value (SOL/USD) and amount of tokens bought",
      className: "min-w-[140px] min-[1500px]:min-w-[200px]",
    },
    {
      label: "Sold",
      tooltipContent: "The value (SOL/USD) and amount of tokens sold",
      className: "min-w-[140px] min-[1500px]:min-w-[200px]",
      sortButton: (
        <SortButton
          type="usdc-or-sol"
          value={holdersSold}
          setValue={setHoldersSold}
        />
      ),
    },
    {
      label: "% Owned",
      tooltipContent: "Percentage of the supply held",
      className: "min-w-[140px] min-[1500px]:min-w-[200px]",
    },
    {
      label: "Remaining",
      tooltipContent:
        "The amount of supply remaining, taking into account the purchase amount",
      className: "min-w-[150px]",
      sortButton: (
        <SortCoinButton
          value={holdersRemaining}
          setValue={setHoldersRemaining}
          tokenImage={tokenData?.image as string}
        />
      ),
    },
  ];

  // Effect to update list height
  useEffect(() => {
    const updateHeight = () => {
      if (listRef.current) {
        setListHeight(
          window.innerWidth > 768
            ? listRef.current.clientHeight - 108
            : window.innerHeight - 180,
        );
      }
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const Row = useCallback(({ index, style, data }: any) => {
    const { items } = data;
    const trader = items[index];
    if (!trader) return null;

    return (
      <div style={style} key={trader.maker}>
        <HoldersCard
          key={trader.maker}
          rank={index + 1}
          holder={trader}
          tokenData={tokenData}
        />
      </div>
    );
  }, []);

  const { remainingScreenWidth } = usePopupStore();

  return (
    <div className="flex w-full flex-grow flex-col items-start">
      {/* Filters */}
      <TooltipProvider>
        <div
          className={cn(
            "grid w-full flex-wrap items-center gap-2 border-border px-4 py-3 md:flex xl:border-b",
            // isOldToken ? "xl:grid-cols-2" : "xl:grid-cols-5",
            // remainingScreenWidth > 1280 && "xl:grid-cols-2",
          )}
        >
          <Tooltip>
            <TooltipTrigger className="flex-1">
              <div
                onClick={() => setSelectedHoldersFilter("Amount Of Holders")}
                className={cn(
                  "col-span-1 flex w-full cursor-pointer items-center justify-between gap-x-2 overflow-hidden rounded-[8px] border border-border bg-transparent px-3 py-2 duration-300",
                  selectedHoldersFilter === "Amount Of Holders" &&
                    "border-[#DF74FF] bg-white/[4%]",
                )}
              >
                <div className="flex w-full items-center gap-x-2">
                  <div className="relative aspect-square size-6 flex-shrink-0">
                    <Image
                      src="/images/badges/amount-of-holders-badge.png"
                      alt="Amount of Holders Badge"
                      fill
                      quality={100}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex w-full flex-wrap items-center justify-between">
                    <span className="inline-block text-nowrap font-geistBold text-sm text-fontColorPrimary">
                      {totalHolder?.toLocaleString()}
                    </span>
                    <span className="inline-block text-nowrap text-xs leading-4 text-fontColorSecondary">
                      Amount of Holders
                    </span>
                  </div>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <span className="inline-block text-nowrap text-center text-xs leading-4 text-white">
                Amount of Holders
              </span>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger className="flex-1">
              <div
                onClick={() => setSelectedHoldersFilter("Top 10 Holders")}
                className={cn(
                  "col-span-1 flex w-full cursor-pointer items-center justify-between gap-x-2 overflow-hidden rounded-[8px] border border-border bg-transparent px-3 py-2 duration-300",
                  selectedHoldersFilter === "Top 10 Holders" &&
                    "border-[#DF74FF] bg-[#10101E]",
                )}
              >
                <div className="flex w-full items-center gap-x-2">
                  <div className="relative aspect-square size-6 flex-shrink-0">
                    <Image
                      src="/images/badges/top-10-holders-badge.png"
                      alt="Top 10 Holders Badge"
                      fill
                      quality={100}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex w-full flex-wrap items-center justify-between">
                    <span className="inline-block text-nowrap font-geistBold text-sm text-fontColorPrimary">
                      {formatAmount(securityMessages?.top10_holding)}%
                    </span>
                    <span className="inline-block text-nowrap text-xs leading-4 text-fontColorSecondary">
                      Top 10 Holders
                    </span>
                  </div>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <span className="inline-block text-nowrap text-center text-xs leading-4 text-white">
                Top 10 Holders
              </span>
            </TooltipContent>
          </Tooltip>

          {!isOldToken && (
            <>
              <Tooltip>
                <TooltipTrigger className="flex-1">
                  <div
                    onClick={() => setSelectedHoldersFilter("Sniper Holding")}
                    className={cn(
                      "col-span-1 flex w-full cursor-pointer items-center justify-between gap-x-2 overflow-hidden rounded-[8px] border border-border bg-transparent px-3 py-2 duration-300",
                      selectedHoldersFilter === "Sniper Holding" &&
                        "border-[#DF74FF] bg-[#10101E]",
                    )}
                  >
                    <div className="flex w-full items-center gap-x-2">
                      <div className="relative aspect-square size-6 flex-shrink-0">
                        <Image
                          src="/images/badges/sniper-holding-badge.png"
                          alt="Sniper Holding Badge"
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </div>
                      <div className="flex w-full flex-wrap items-center justify-between">
                        <span className="inline-block text-nowrap font-geistBold text-sm text-fontColorPrimary">
                          {formatAmount(securityMessages?.sniper_holding)}%
                        </span>
                        <span className="inline-block text-nowrap text-xs leading-4 text-fontColorSecondary">
                          Sniper Holding
                        </span>
                      </div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <span className="inline-block text-nowrap text-center text-xs leading-4 text-white">
                    Sniper Holding
                  </span>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger className="flex-1">
                  <div
                    onClick={() => setSelectedHoldersFilter("Insider Holding")}
                    className={cn(
                      "col-span-1 flex w-full cursor-pointer items-center justify-between gap-x-2 overflow-hidden rounded-[8px] border border-border bg-transparent px-3 py-2 duration-300",
                      selectedHoldersFilter === "Insider Holding" &&
                        "border-[#DF74FF] bg-[#10101E]",
                    )}
                  >
                    <div className="flex w-full items-center gap-x-2">
                      <div className="relative aspect-square size-6 flex-shrink-0">
                        <Image
                          src="/images/badges/insider-holding-badge.png"
                          alt="Insider Holding Badge"
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </div>
                      <div className="flex w-full items-center justify-between">
                        <span className="inline-block text-nowrap font-geistBold text-sm text-fontColorPrimary">
                          {formatAmount(securityMessages?.insider_holding)}%
                        </span>
                        <span className="inline-block text-nowrap text-xs leading-4 text-fontColorSecondary">
                          Insider Holding
                        </span>
                      </div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <span className="inline-block text-nowrap text-center text-xs leading-4 text-white">
                    Insider Holding
                  </span>
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      </TooltipProvider>

      {/* List */}
      <div className="relative w-full flex-grow">
        <div
          ref={listRef}
          className="absolute left-0 top-0 flex w-full flex-grow flex-col"
        >
          <div
            className={cn(
              "sticky top-0 z-[9] hidden h-[40px] min-w-max flex-shrink-0 items-center border-b border-border bg-[#080811] xl:flex",
              isLoading ? "pr-0" : "pr-10",
              remainingScreenWidth < 1280 && "xl:hidden",
            )}
          >
            {isLoading && selectedHoldersFilter !== "Amount Of Holders" ? (
              <TokenHeaderLoading />
            ) : (
              HeaderData.map((item, index) => (
                <HeadCol isWithBorder={false} key={index} {...item} />
              ))
            )}
          </div>

          <div
            className={cn(
              // "flex h-fit w-full flex-grow flex-col max-md:p-3 md:h-[72rem]",
              "flex h-[calc(100dvh_-_320px)] w-full flex-grow flex-col max-md:p-3 sm:h-fit md:h-[72rem]",
              remainingScreenWidth <= 768 && "max-md:p-0 md:h-fit",
              "pb-[75px]",
            )}
          >
            {selectedHoldersFilter === "Amount Of Holders" ? (
              <>
                <FixedSizeList
                  className="nova-scroller darker"
                  height={listHeight}
                  width="100%"
                  itemCount={amountOfHolders?.length}
                  itemSize={remainingScreenWidth >= 1280 ? 72 : 164}
                  itemData={{
                    items: amountOfHolders,
                  }}
                >
                  {Row}
                </FixedSizeList>
              </>
            ) : isLoading ? (
              Array.from({ length: 30 }).map((_, index) => (
                <TokenCardLoading key={index} />
              ))
            ) : !filteredHolders || filteredHolders.length === 0 ? (
              <div className="flex w-full items-center justify-center gap-x-2 p-10 px-3">
                {selectedHoldersFilter === "Top 10 Holders" && (
                  <span className="text-sm text-fontColorPrimary">
                    There are no Top 10 Holding this token.
                  </span>
                )}
                {selectedHoldersFilter === "Sniper Holding" && (
                  <span className="text-sm text-fontColorPrimary">
                    There are no Snipers Holding this token.
                  </span>
                )}
                {selectedHoldersFilter === "Insider Holding" && (
                  <span className="text-sm text-fontColorPrimary">
                    There are no Insider Holding this token.
                  </span>
                )}
              </div>
            ) : (
              <>
                <FixedSizeList
                  className="nova-scroller darker"
                  height={listHeight}
                  width="100%"
                  itemCount={filteredHolders.length}
                  itemSize={remainingScreenWidth >= 1280 ? 72 : 164}
                  itemData={{
                    items: filteredHolders,
                  }}
                >
                  {Row}
                </FixedSizeList>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(HoldersTable);
