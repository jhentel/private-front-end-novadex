"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useCallback, useEffect, useMemo, useState } from "react";
import { useHoldingsFilterStore } from "@/stores/dex-setting/use-holdings-filter.store";
import { Virtuoso } from "react-virtuoso";
// ######## Components 🧩 ########
import HoldingsCard from "@/components/customs/cards/HoldingsCard";
import HeadCol from "@/components/customs/tables/HeadCol";
// ######## Types 🗨️ ########
import { HoldingsTransformedTokenData } from "@/types/ws-general";
import { HiArrowNarrowUp, HiArrowNarrowDown } from "react-icons/hi";
import { IoCalendarOutline } from "react-icons/io5";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { useUserInfoStore } from "@/stores/user/use-user-info.store";
import { useHoldingsMessageStore } from "@/stores/holdings/use-holdings-messages.store";
import BaseButton from "../buttons/BaseButton";
import { debounce } from "lodash";

const itemsPerPage = 10;

export default function HoldingsTable({
  list,
  trackedWalletsOfToken,
  handleSendMessage,
}: {
  list?: HoldingsTransformedTokenData[];
  trackedWalletsOfToken: Record<string, string[]>;
  handleSendMessage: (data: string[]) => void;
}) {
  const { sortType, sortRow, setSortRow, setSortType, filters } =
    useHoldingsFilterStore();

  const chartPriceMessage = useHoldingsMessageStore(
    (state) => state.chartPriceMessage,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const marqueeMints = useHoldingsMessageStore((state) => state.marqueeMint);

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
            // const price = item.token?.price?.price_sol || 0;
            const price =
              chartPriceMessage.find((m) => m.mint === item.token.token?.mint)
                ?.priceSol ||
              item.token.price?.price_sol ||
              0;
            return sum + balance * price;
          }, 0);
          const valueB = b.list.reduce((sum, item) => {
            const balance = item.token?.balance || 0;
            // const price = item.token?.price?.price_sol || 0;
            const price =
              chartPriceMessage.find((m) => m.mint === item.token.token?.mint)
                ?.priceSol ||
              item.token.price?.price_sol ||
              0;
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
              // const price = item.token?.price?.price_sol || 0;
              const price =
                chartPriceMessage.find((m) => m.mint === item.token.token?.mint)
                  ?.priceSol ||
                item.token.price?.price_sol ||
                0;
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
  }, [list, chartPriceMessage, sortRow, sortType]);

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

  const HeaderData = [
    {
      label: "Token",
      tooltipContent: "Token name",
      className: "min-w-[200px]",
      sortButton: (
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
      ),
    },
    {
      label: "Wallet",
      tooltipContent: "Wallet the token was bought under",
      className: "min-w-[50px]",
    },
    {
      label: "Invested",
      tooltipContent: "Amount invested in Solana & USD values",
      className: "min-w-[50px]",
      sortButton: (
        <button
          title="Sort by Invested"
          onClick={() => {
            setSortRow("INVESTED");
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
              sortRow === "INVESTED" && sortType === "ASC"
                ? "text-[#DF74FF]"
                : "text-fontColorSecondary",
            )}
          />
          <HiArrowNarrowDown
            className={cn(
              "text-sm duration-300",
              sortRow === "INVESTED" && sortType === "DESC"
                ? "text-[#DF74FF]"
                : "text-fontColorSecondary",
            )}
          />
        </button>
      ),
    },
    {
      label: "Remaining",
      tooltipContent:
        "Amount remaining which has been bought but has not been sold",
      className: "min-w-[50px]",
      sortButton: (
        <button
          title="Sort by Remaining"
          onClick={() => {
            setSortRow("REMAINING");
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
              sortRow === "REMAINING" && sortType === "ASC"
                ? "text-[#DF74FF]"
                : "text-fontColorSecondary",
            )}
          />
          <HiArrowNarrowDown
            className={cn(
              "text-sm duration-300",
              sortRow === "REMAINING" && sortType === "DESC"
                ? "text-[#DF74FF]"
                : "text-fontColorSecondary",
            )}
          />
        </button>
      ),
    },
    {
      label: "Sold",
      tooltipContent: "Amount sold from the invested amount",
      className: "min-w-[50px]",
      sortButton: (
        <button
          title="Sort by Sold"
          onClick={() => {
            setSortRow("SOLD");
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
              sortRow === "SOLD" && sortType === "ASC"
                ? "text-[#DF74FF]"
                : "text-fontColorSecondary",
            )}
          />
          <HiArrowNarrowDown
            className={cn(
              "text-sm duration-300",
              sortRow === "SOLD" && sortType === "DESC"
                ? "text-[#DF74FF]"
                : "text-fontColorSecondary",
            )}
          />
        </button>
      ),
    },
    {
      label: "P&L",
      tooltipContent:
        "Total profit/loss percentage. Green is profit and red is loss",
      className: "min-w-[50px]",
      sortButton: (
        <button
          title="Sort by P&L"
          onClick={() => {
            setSortRow("PNL");
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
              sortRow === "PNL" && sortType === "ASC"
                ? "text-[#DF74FF]"
                : "text-fontColorSecondary",
            )}
          />
          <HiArrowNarrowDown
            className={cn(
              "text-sm duration-300",
              sortRow === "PNL" && sortType === "DESC"
                ? "text-[#DF74FF]"
                : "text-fontColorSecondary",
            )}
          />
        </button>
      ),
    },
    {
      label: "Actions",
      tooltipContent:
        " Action buttons which include sell, share and hide the holding",
      className: "min-w-[50px] justify-end",
    },
  ];

  const isHoldingsTutorial = useUserInfoStore(
    (state) => state.isHoldingsTutorial,
  );

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
  }, [list?.length, currentPage, marqueeMints.join(",")]);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [filters?.preview?.withRemainingTokens]);

  return (
    <div className="relative flex w-full flex-grow flex-col overflow-hidden rounded-[8px] border border-border">
      <div className="absolute left-0 top-0 flex h-full w-full flex-grow flex-col">
        <div className="sticky top-0 flex h-10 min-w-max items-center border-b border-border bg-[#080811] px-4">
          {HeaderData.map((item, index) => (
            <HeadCol key={index} {...item} />
          ))}
        </div>

        <div className="nova-scroller relative flex w-full flex-grow flex-col">
          <div className="flex-grow">
            {Boolean(paginatedList?.length) && (
              <Virtuoso
                className="w-full"
                style={
                  isHoldingsTutorial
                    ? {
                        overflow: "hidden",
                      }
                    : {
                        overflowY: "scroll",
                      }
                }
                totalCount={paginatedList.length}
                itemContent={(index: number) =>
                  paginatedList[index] && (
                    <HoldingsCard
                      isFirst={index === 0}
                      index={index}
                      key={paginatedList[index].token.mint}
                      data={paginatedList[index]}
                      trackedWalletsOfToken={trackedWalletsOfToken}
                    />
                  )
                }
              />
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border bg-[#080811] px-4 py-3">
            <div className="flex items-center text-sm text-fontColorSecondary">
              <span>
                Showing{" "}
                {Math.min(
                  (currentPage - 1) * itemsPerPage + 1,
                  sortedList.length,
                )}{" "}
                to {Math.min(currentPage * itemsPerPage, sortedList.length)} of{" "}
                {sortedList.length} entries
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <BaseButton
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={cn(
                  "rounded px-3 py-1 text-sm",
                  currentPage === 1
                    ? "cursor-not-allowed opacity-50"
                    : "hover:bg-[#DF74FF] hover:text-white",
                )}
              >
                Previous
              </BaseButton>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <BaseButton
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={cn(
                      "rounded px-3 py-1 text-sm",
                      currentPage === page
                        ? "bg-[#DF74FF] text-white"
                        : "hover:bg-[#DF74FF] hover:text-white",
                    )}
                  >
                    {page}
                  </BaseButton>
                ),
              )}
              <BaseButton
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={cn(
                  "rounded px-3 py-1 text-sm",
                  currentPage === totalPages
                    ? "cursor-not-allowed opacity-50"
                    : "hover:bg-[#DF74FF] hover:text-white",
                )}
              >
                Next
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
