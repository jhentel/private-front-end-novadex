"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useMemo } from "react";
import { FixedSizeList } from "react-window";
import { useAnnouncementStore } from "@/stores/use-announcement.store";
// ######## Components 🧩 ########
import HeadCol from "@/components/customs/tables/HeadCol";
import TrendingCardRow from "@/components/customs/cards/VirtualizedTrendingCard";
// ######## Types 🗨️ ########
import { TrendingDataMessageType } from "@/types/ws-general";
import { useWindowSize } from "@/hooks/use-window-size";
import { useTrendingSortStore } from "@/stores/table/trending/trending-sort";
import { IoCalendarOutline } from "react-icons/io5";
import SortButton from "../buttons/SortButton";

export default function TrendingTable({
  list,
  trackedWalletsOfToken,
}: {
  list: TrendingDataMessageType[];
  trackedWalletsOfToken: Record<string, string[]>;
}) {
  const isAnnouncementExist = useAnnouncementStore(
    (state) => state.isAnnouncementExist,
  );

  const { currentSortedRow, sortOrder } = useTrendingSortStore();

  const sortedList = useMemo(() => {
    if (!list || sortOrder === "NONE" || !currentSortedRow) return list;

    const sortedItems = [...list];

    switch (currentSortedRow) {
      case "CREATED":
        sortedItems.sort((a, b) => {
          const aCreated = a.created ?? 0;
          const bCreated = b.created ?? 0;
          return sortOrder === "ASC"
            ? aCreated - bCreated
            : bCreated - aCreated;
        });
        break;

      case "LIQUIDITY":
        sortedItems.sort((a, b) => {
          const aLiquidity = a.liquidity_usd ?? 0;
          const bLiquidity = b.liquidity_usd ?? 0;
          return sortOrder === "ASC"
            ? bLiquidity - aLiquidity
            : aLiquidity - bLiquidity;
        });
        break;

      case "MKTCAP":
        sortedItems.sort((a, b) => {
          const aMktCap = a.market_cap_usd ?? 0;
          const bMktCap = b.market_cap_usd ?? 0;
          return sortOrder === "ASC" ? bMktCap - aMktCap : aMktCap - bMktCap;
        });
        break;

      case "VOLUME":
        sortedItems.sort((a, b) => {
          const aVolume = a.volume_usd ?? 0;
          const bVolume = b.volume_usd ?? 0;
          return sortOrder === "ASC" ? bVolume - aVolume : aVolume - bVolume;
        });
        break;

      case "TXNS":
        sortedItems.sort((a, b) => {
          const aTxns = a.buys + a.sells;
          const bTxns = b.buys + b.sells;
          return sortOrder === "ASC" ? bTxns - aTxns : aTxns - bTxns;
        });
        break;

      case "VOLUME1M":
        sortedItems.sort((a, b) => {
          const aVolume = a?.["1m"] ?? 0;
          const bVolume = b?.["1m"] ?? 0;
          return sortOrder === "ASC" ? bVolume - aVolume : aVolume - bVolume;
        });
        break;

      case "VOLUME5M":
        sortedItems.sort((a, b) => {
          const aVolume = a?.["5m"] ?? 0;
          const bVolume = b?.["5m"] ?? 0;
          return sortOrder === "ASC" ? bVolume - aVolume : aVolume - bVolume;
        });
        break;

      case "VOLUME30M":
        sortedItems.sort((a, b) => {
          const aVolume = a?.["30m"] ?? 0;
          const bVolume = b?.["30m"] ?? 0;
          return sortOrder === "ASC" ? bVolume - aVolume : aVolume - bVolume;
        });
        break;

      case "VOLUME1H":
        sortedItems.sort((a, b) => {
          const aVolume = a?.["1h"] ?? 0;
          const bVolume1M = b?.["1h"] ?? 0;
          return sortOrder === "ASC"
            ? bVolume1M - aVolume
            : aVolume - bVolume1M;
        });
        break;
    }

    return sortedItems;
  }, [list, currentSortedRow, sortOrder]);

  // const isTrendingTutorial = useUserInfoStore(
  //   (state) => state.isTrendingTutorial,
  // );

  const { width } = useWindowSize();
  const HeaderData = [
    {
      label: "Token",
      tooltipContent: "Token name",
      className: "min-w-[196px]",
    },
    {
      label: width! > 1480 ? "Created" : "Crtd",
      tooltipContent: "Time passed since creation",
      className: width! > 1480 ? "min-w-[140px]" : "min-w-[90px]",
      sortButton: (
        <SortButton
          rowName="CREATED"
          LeftIcon={width! > 1380 ? IoCalendarOutline : undefined}
        />
      ),
    },
    {
      label: width! > 1480 ? "Liquidity" : "Liq",
      tooltipContent: "Liquidity in the token",
      className: "min-w-[80px]",
      sortButton: <SortButton rowName="LIQUIDITY" />,
    },
    {
      label: width! > 1480 ? "Mkt cap" : "MCap",
      tooltipContent: "Includes dilated value and token price in USD",
      className: "min-w-[80px]",
      sortButton: <SortButton rowName="MKTCAP" />,
    },
    {
      label: width! > 1480 ? "Volume" : "Vol",
      tooltipContent: "The total number of coins traded in a specific period",
      className: "min-w-[72px]",
      sortButton: <SortButton rowName="VOLUME" />,
    },
    {
      label: "TXNS",
      tooltipContent: "The total number of coins traded in a specific period",
      className: "min-w-[75px]",
      sortButton: <SortButton rowName="TXNS" />,
    },
    // {
    //   label: "Holders",
    //   tooltipContent: "Total wallets holding supply of this token",
    //   className: "min-w-[80px]",
    // },
    {
      label: "1M",
      tooltipContent:
        "Percentage increase/decrease in the token market cap in 1 minute",
      className: "min-w-[70px]",
      sortButton: <SortButton rowName="VOLUME1M" />,
    },
    {
      label: "5M",
      tooltipContent:
        "Percentage increase/decrease in the token market cap in 5 minutes",
      className: "min-w-[70px]",
      sortButton: <SortButton rowName="VOLUME5M" />,
    },
    {
      label: "30M",
      tooltipContent:
        "Percentage increase/decrease in the token market cap in 30 minutes",
      className: "min-w-[70px]",
      sortButton: <SortButton rowName="VOLUME30M" />,
    },
    {
      label: "1H",
      tooltipContent:
        "Percentage increase/decrease in the token market cap in 1 hour",
      className: "min-w-[70px]",
      sortButton: <SortButton rowName="VOLUME1H" />,
    },
    {
      label: "Audit Results",
      tooltipContent: "Various indicators which show a tokens risk",
      className: "min-w-[170px]",
    },
    {
      label: "Actions",
      tooltipContent: "Purchase the token",
      className: "min-w-[90px] justify-end",
    },
  ];

  // Memoize the items data to prevent unnecessary re-renders
  const itemData = useMemo(
    () => ({
      items: sortedList,
      trackedWalletsOfToken: trackedWalletsOfToken,
      column: 1,
    }),
    [sortedList],
  );

  // Memoize the getItemKey function
  const getItemKey = (index: number) => {
    return itemData.items[index]?.mint || index;
  };

  return (
    <div className="relative flex w-full flex-grow flex-col overflow-hidden rounded-[8px] border border-border">
      <div className="absolute left-0 top-0 flex h-full w-full flex-grow flex-col">
        <div className="sticky top-0 flex h-10 min-w-max items-center border-b border-border bg-[#080811] pl-4 pr-4">
          {HeaderData.map((item, index) => (
            <HeadCol key={index} {...item} />
          ))}
        </div>

        <div className="nova-scroller relative flex w-full flex-grow overflow-hidden">
          <FixedSizeList
            height={
              width! > 1630
                ? window.innerHeight! - (isAnnouncementExist ? 275 : 235)
                : window.innerHeight! - 278
            }
            width="100%"
            itemCount={list.length}
            itemSize={95}
            overscanCount={3}
            itemKey={getItemKey}
            itemData={itemData}
          >
            {TrendingCardRow}
          </FixedSizeList>
        </div>
      </div>
    </div>
  );
}
