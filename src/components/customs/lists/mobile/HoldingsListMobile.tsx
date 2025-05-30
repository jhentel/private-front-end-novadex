"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useCallback, useEffect, useMemo, useState } from "react";
import { useUserInfoStore } from "@/stores/user/use-user-info.store";
import { Virtuoso } from "react-virtuoso";
// ######## Components 🧩 ########
import HoldingsCardMobile from "@/components/customs/cards/mobile/HoldingsCardMobile";
// ######## Types 🗨️ ########
import { HoldingsTransformedTokenData } from "@/types/ws-general";
import { useHoldingsMessageStore } from "@/stores/holdings/use-holdings-messages.store";
import { debounce } from "lodash";
import { cn } from "@/libraries/utils";
import BaseButton from "../../buttons/BaseButton";
import { useHoldingsFilterStore } from "@/stores/dex-setting/use-holdings-filter.store";
import { IoCalendarOutline } from "react-icons/io5";
import { HiArrowNarrowUp, HiArrowNarrowDown } from "react-icons/hi";

export default function HoldingsListMobile({
  list,
  trackedWalletsOfToken,
  handleSendMessage,
}: {
  list?: HoldingsTransformedTokenData[];
  trackedWalletsOfToken: Record<string, string[]>;
  handleSendMessage: (mint: string[]) => void;
}) {
  const isHoldingsTutorial = useUserInfoStore(
    (state) => state.isHoldingsTutorial,
  );

  const { sortType, sortRow, setSortRow, setSortType } =
    useHoldingsFilterStore();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const sortedList = useMemo(() => {
    if (!list) return [];

    if (sortType === "NONE") return list;

    const sortedItems = [...list];
    const multiplier = sortType === "ASC" ? -1 : 1;

    switch (sortRow) {
      case "TOKEN":
        sortedItems.sort((a, b) => {
          const lastBoughtA = Math.max(
            ...a.list.map((item) => item.token.lastBought || 0),
          );
          const lastBoughtB = Math.max(
            ...b.list.map((item) => item.token.lastBought || 0),
          );

          return multiplier * (lastBoughtA - lastBoughtB);
        });
        break;

      case "INVESTED":
        sortedItems.sort((a, b) => {
          const valueA = a.list.reduce(
            (sum, item) => sum + (item.token?.investedSol || 0),
            0,
          );
          const valueB = b.list.reduce(
            (sum, item) => sum + (item.token?.investedSol || 0),
            0,
          );
          return multiplier * (valueA - valueB);
        });
        break;

      case "REMAINING":
        sortedItems.sort((a, b) => {
          const valueA = a.list.reduce((sum, item) => {
            const balance = item.token?.balance || 0;
            const price = item.token?.price?.price_sol || 0;
            return sum + balance * price;
          }, 0);
          const valueB = b.list.reduce((sum, item) => {
            const balance = item.token?.balance || 0;
            const price = item.token?.price?.price_sol || 0;
            return sum + balance * price;
          }, 0);
          return multiplier * (valueA - valueB);
        });
        break;

      case "SOLD":
        sortedItems.sort((a, b) => {
          const valueA = a.list.reduce(
            (sum, item) => sum + (item.token?.soldSol || 0),
            0,
          );
          const valueB = b.list.reduce(
            (sum, item) => sum + (item.token?.soldSol || 0),
            0,
          );
          return multiplier * (valueA - valueB);
        });
        break;

      case "PNL":
        sortedItems.sort((a, b) => {
          const calcPnLPercentage = (data: HoldingsTransformedTokenData) => {
            let totalInvested = 0;
            let totalSold = 0;
            let currentValue = 0;

            data.list.forEach((item) => {
              totalInvested += item.token?.investedSol || 0;
              totalSold += item.token?.soldSol || 0;
              const balance = item.token?.balance || 0;
              const price = item.token?.price?.price_sol || 0;
              currentValue += balance * price;
            });

            const totalValue = totalSold + currentValue;
            const pnlSol = totalValue - totalInvested;

            if (totalInvested === 0) return 0;

            return (pnlSol / totalInvested) * 100;
          };

          const pnlPercentageA = calcPnLPercentage(a);
          const pnlPercentageB = calcPnLPercentage(b);

          return multiplier * (pnlPercentageA - pnlPercentageB);
        });
        break;
    }

    return sortedItems;
  }, [list, sortRow, sortType]);

  const paginatedList = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedList.slice(startIndex, endIndex);
  }, [sortedList, currentPage]);

  const totalPages = Math.ceil((sortedList?.length || 0) / itemsPerPage);
  const listSubscribedMints = useHoldingsMessageStore(
    (state) => state.listSubscribedMints,
  );
  const setListSubscribedMints = useHoldingsMessageStore(
    (state) => state.setListSubscribedMints,
  );
  const marqueeMints = useHoldingsMessageStore((state) => state.marqueeMint);

  const sendMessage = debounce(() => {
    const mintsToSubscribe = [
      ...paginatedList?.map((item) => item.token.mint),
      ...marqueeMints,
    ];
    if (mintsToSubscribe.length === 0) return;
    handleSendMessage(mintsToSubscribe);
    setListSubscribedMints(mintsToSubscribe);
  }, 100);

  useEffect(() => {
    sendMessage();
  }, [sortedList?.length, currentPage, marqueeMints.join(",")]);

  const handlePrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, [listSubscribedMints]);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [listSubscribedMints, totalPages]);

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
    },
    [listSubscribedMints, setCurrentPage],
  );
  const filters = useHoldingsFilterStore((state) => state.filters);
  useEffect(() => {
    setCurrentPage(1);
  }, [filters?.preview?.withRemainingTokens]);

  return (
    <div className="flex w-full flex-grow flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="text-sm font-medium text-fontColorPrimary">
          My Holdings
        </div>
        <div className="ml-2 flex items-center">
          <div className="mr-0.5 flex cursor-default items-center">
            <IoCalendarOutline
              className={cn(
                "text-sm duration-300",
                sortRow === "TOKEN" && sortType !== "NONE"
                  ? "text-[#DF74FF]"
                  : "text-fontColorSecondary",
              )}
            />
          </div>
          <button
            title="Sort by Token"
            onClick={() => {
              setSortRow("TOKEN");
              setSortType(
                sortType === "ASC"
                  ? "DESC"
                  : sortType === "DESC"
                    ? "NONE"
                    : "ASC",
              );
            }}
            className="flex cursor-pointer items-center -space-x-[7.5px]"
          >
            <HiArrowNarrowUp
              className={cn(
                "text-sm duration-300",
                sortRow === "TOKEN" && sortType === "ASC"
                  ? "text-[#DF74FF]"
                  : "text-fontColorSecondary",
              )}
            />
            <HiArrowNarrowDown
              className={cn(
                "text-sm duration-300",
                sortRow === "TOKEN" && sortType === "DESC"
                  ? "text-[#DF74FF]"
                  : "text-fontColorSecondary",
              )}
            />
          </button>
        </div>
      </div>
      <div className="relative flex h-[calc(100dvh_-_400px)] w-full flex-grow flex-col overflow-hidden">
        <div className="absolute left-0 top-0 flex h-full w-full flex-grow">
          <div className="nova-scroller relative flex w-full flex-grow px-4 lg:px-0">
            <Virtuoso
              style={
                isHoldingsTutorial
                  ? {
                      overflow: "hidden",
                    }
                  : {
                      overflowY: "scroll",
                    }
              }
              className="w-full"
              totalCount={paginatedList?.length}
              itemContent={(index: number) =>
                paginatedList?.[index] && (
                  <HoldingsCardMobile
                    key={paginatedList?.[index].token.mint}
                    data={paginatedList?.[index]}
                    isFirst={index === 0}
                    trackedWalletsOfToken={trackedWalletsOfToken}
                  />
                )
              }
            />
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-col space-y-2 border-t border-border bg-[#080811] px-4 pb-6 pt-3">
        <div className="flex items-center justify-center text-sm text-fontColorSecondary">
          <span>
            Showing{" "}
            {Math.min((currentPage - 1) * itemsPerPage + 1, list?.length || 0)}{" "}
            to {Math.min(currentPage * itemsPerPage, list?.length || 0)} of{" "}
            {list?.length || 0} entries
          </span>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <BaseButton
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={cn(
              "flex h-8 w-20 items-center justify-center text-sm",
              currentPage === 1
                ? "cursor-not-allowed bg-[#1A1A24] text-fontColorSecondary opacity-50"
                : "bg-[#1A1A24] text-fontColorSecondary hover:bg-[#DF74FF] hover:text-white",
            )}
          >
            Previous
          </BaseButton>
          <div className="flex items-center space-x-1 overflow-x-auto">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <BaseButton
                key={page}
                onClick={() => handlePageChange(page)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center text-sm",
                  currentPage === page
                    ? "bg-[#DF74FF] text-white"
                    : "bg-[#1A1A24] text-fontColorSecondary hover:bg-[#DF74FF] hover:text-white",
                )}
              >
                {page}
              </BaseButton>
            ))}
          </div>
          <BaseButton
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={cn(
              "flex h-8 w-20 items-center justify-center text-sm",
              currentPage === totalPages
                ? "cursor-not-allowed bg-[#1A1A24] text-fontColorSecondary opacity-50"
                : "bg-[#1A1A24] text-fontColorSecondary hover:bg-[#DF74FF] hover:text-white",
            )}
          >
            Next
          </BaseButton>
        </div>
      </div>
    </div>
  );
}
