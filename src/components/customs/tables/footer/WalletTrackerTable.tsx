"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useWalletTrackerMessageStore } from "@/stores/footer/use-wallet-tracker-message.store";
import { useSelectedWalletTrackerTradeAddressesFilterStore } from "@/stores/footer/use-selected-wallet-tracker-trade-filter.store";
import { useTrackedWalletsOfToken } from "@/hooks/use-tracked-wallets-of-token";
import { useQuery } from "@tanstack/react-query";
import { usePopupStore, WindowName } from "@/stores/use-popup-state";
import { useQuickAmountStore } from "@/stores/dex-setting/use-quick-amount.store";
import { useWalletTrackerPaused } from "@/stores/footer/use-wallet-tracker-paused";
import { useWalletTrackerFilterStore } from "@/stores/dex-setting/use-wallet-tracker-filter.store";
import { useWindowSize } from "@/hooks/use-window-size";
import { FixedSizeList } from "react-window";
// ######## APIs 🛜 ########
import {
  getSelectedWalletTrackerTransactions,
  WalletTracker,
} from "@/apis/rest/wallet-tracker";
// ######## Components 🧩 ########
import HeadCol from "@/components/customs/tables/HeadCol";
import EmptyState from "@/components/customs/EmptyState";
import { HiArrowNarrowDown, HiArrowNarrowUp } from "react-icons/hi";
import WallerTrackerCardRow from "@/components/customs/cards/footer/VirtualizedWalletTrackerCard";
import SortButton, { SortCoinButton } from "@/components/customs/SortButton";
import { LoadingState } from "@/components/customs/tables/footer/LoadingState";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
// ######## Constants ☑️ ########
import WalletTrackerTotalFilter from "../wallet-tracker/WalletTrackerTotalFilter";
import {
  formatAmountWithoutLeadingZero,
  parseFormattedNumber,
} from "@/utils/formatAmount";

export type IVariant = "normal" | "pop-out";
type ISortType = "DESC" | "ASC" | "NONE";
type ISortRow = "" | "TXNS";

type TableBodyProps = {
  filteredFinalData: WalletTracker[];
  isSnapOpen: boolean;
  variant: IVariant;
  onMouseEnter: VoidFunction;
  onMouseLeave: VoidFunction;
};

export default function WalletTrackerTable({
  variant = "normal",
}: {
  variant?: IVariant;
}) {
  const pathname = usePathname();
  const messages = useWalletTrackerMessageStore((state) => state.messages);
  const messagesPaused = useWalletTrackerMessageStore(
    (state) => state.messagesPaused,
  );
  const isLoadingWalletTracker = useWalletTrackerPaused(
    (state) => state.isLoadingWalletTracker,
  );
  const setMessages = useWalletTrackerMessageStore(
    (state) => state.setMessages,
  );
  const setMessagesPaused = useWalletTrackerMessageStore(
    (state) => state.setMessagesPaused,
  );
  const [sortRow, setSortRow] = useState<ISortRow>("");
  const [sortType, setSortType] = useState<ISortType>("NONE");

  const { minSol, excludeSells, excludeBuys, totalFilter } =
    useWalletTrackerFilterStore();

  // const isWalletTrackerTutorial = useUserInfoStore(
  //   (state) => state.isWalletTrackerTutorial,
  // );

  const trackedWalletsList = useWalletTrackerMessageStore(
    (state) => state.trackedWallets,
  );

  const currentSelectedAddresses =
    useSelectedWalletTrackerTradeAddressesFilterStore(
      (state) => state.selectedWalletAddresses,
    );
  // const currentSingleSelectedAddress = useWalletTrackerMessageStore(
  //   (state) => state.currentSingleSelectedAddress,
  // );

  const { data, isLoading: isSelectedTrackedWalletTransactionDataLoading } =
    useQuery({
      queryKey: [`single-wallet-tracker`, currentSelectedAddresses],
      queryFn: async () => {
        const res = await getSelectedWalletTrackerTransactions(
          currentSelectedAddresses.join(","),
        );

        if (currentSelectedAddresses.length === 0) {
          setMessages(res, "add");
        } else {
          setMessages(
            res.filter((item) =>
              currentSelectedAddresses.includes(item.walletAddress),
            ),
            "replace",
          );
        }

        return res;
      },
      gcTime: 0,
      staleTime: 0,
      enabled:
        pathname === "/wallet-tracker" &&
        variant === "normal" &&
        !!currentSelectedAddresses,
    });

  const filteredFinalData = useMemo(() => {
    // First filter by addresses
    let filteredMessages =
      currentSelectedAddresses.length > 0
        ? messages?.filter((item) =>
            pathname !== "/wallet-tracker"
              ? true
              : currentSelectedAddresses.includes(item?.walletAddress),
          )
        : messages;

    // Apply the wallet tracker filters
    if (filteredMessages) {
      // Filter by minimum SOL amount
      if (minSol > 0) {
        filteredMessages = filteredMessages.filter(
          (item) => parseFloat(item.solAmount) >= minSol,
        );
      }

      // Filter by transaction type
      if (excludeSells) {
        filteredMessages = filteredMessages.filter(
          (item) => item.type.toLowerCase() !== "sell",
        );
      }

      if (excludeBuys) {
        filteredMessages = filteredMessages.filter(
          (item) => item.type.toLowerCase() !== "buy",
        );
      }

      // Filter by total amount range
      if (totalFilter.min > 0 || totalFilter.max > 0) {
        filteredMessages = filteredMessages.filter((item) => {
          const formattedTotal = formatAmountWithoutLeadingZero(
            Number(item.solAmount),
            2,
            2,
          );
          const total = parseFormattedNumber(formattedTotal);
          if (totalFilter.min && !totalFilter.max) {
            return total >= totalFilter.min;
          }
          return total >= totalFilter.min && total <= totalFilter.max;
        });
      }
    }

    // Apply sorting logic
    if (sortType === "NONE" || !filteredMessages) {
      return filteredMessages.sort((a, b) => {
        return b.timestamp - a.timestamp;
      }); // Return unsorted data
    }

    const sortedMessages = filteredMessages.sort((a, b) => {
      if (sortRow === "TXNS") {
        return sortType === "ASC"
          ? a.buys + a.sells - (b.buys + b.sells)
          : b.buys + b.sells - (a.buys + a.sells);
      } else {
        return 0;
      }
    });

    // Remove duplicates by `mint`, keeping the last one
    const deduped = Array.from(
      new Map(sortedMessages.map((item) => [item.mint, item])).values(),
    );

    return deduped;
  }, [
    messages,
    // listBasedOnSelectedAddresses,
    currentSelectedAddresses,
    sortType,
    sortRow,
    pathname,
    minSol,
    excludeSells,
    excludeBuys,
    totalFilter,
  ]);

  const quickBuyAmount = useQuickAmountStore(
    (state) => state.cosmoQuickBuyAmount,
  );
  const { amountType, setAmountType, remainingType, setRemainingType } =
    useWalletTrackerFilterStore();
  const HeaderDataNormal = useMemo(
    () => [
      {
        label: "Token",
        tooltipContent: "Token Name",
        className: "min-w-[180px] w-[18%]",
      },
      {
        label: "Type",
        tooltipContent: "Type of transaction",
        className: "min-w-[55px] w-[6%]",
      },
      {
        label: "Amount",
        tooltipContent:
          "Amount of SOL put in by the tracked wallet and the amount of tokens bought",
        className: "min-w-[120px] w-[10%]",
        sortButton: (
          <>
            <WalletTrackerTotalFilter />
            <SortButton
              type="usdc-or-sol"
              value={amountType}
              setValue={setAmountType}
            />
          </>
        ),
      },
      {
        label: "Market Cap",
        tooltipContent: "Indicates token value",
        className: "min-w-[100px] w-[11%]",
      },
      {
        label: "TXNS",
        tooltipContent: "The total number of coins traded in a specific period",
        className: "min-w-[80px] w-[9%]",
        sortButton: (
          <button
            onClick={() => {
              setSortRow("TXNS");
              setSortType(
                sortType === "ASC"
                  ? "DESC"
                  : sortType === "DESC"
                    ? "NONE"
                    : "ASC",
              );
            }}
            className="flex cursor-pointer items-center -space-x-[7.5px]"
            title="Sort by Transactions"
          >
            <HiArrowNarrowUp
              className={cn(
                "text-sm duration-300",
                sortRow === "TXNS" && sortType === "ASC"
                  ? "text-[#DF74FF]"
                  : "text-fontColorSecondary",
              )}
            />
            <HiArrowNarrowDown
              className={cn(
                "text-sm duration-300",
                sortRow === "TXNS" && sortType === "DESC"
                  ? "text-[#DF74FF]"
                  : "text-fontColorSecondary",
              )}
            />
          </button>
        ),
      },
      {
        label: "Wallet Name",
        tooltipContent: "The name provided for the wallet",
        className: "min-w-[110px] w-[12%]",
      },
      {
        label: "Remaining",
        tooltipContent: "The amount of tokens left in the tracked wallet",
        className: "min-w-[185px] w-[21%]",
        sortButton: (
          <SortCoinButton value={remainingType} setValue={setRemainingType} />
        ),
      },
      {
        label: "Actions",
        tooltipContent: "Action button which includes quick buy",
        className: "min-w-[90px] w-[9%]",
      },
    ],
    [amountType, setAmountType, remainingType, setRemainingType],
  );

  const HeaderDataPopup = useMemo(
    () => [
      {
        label: "Token",
        tooltipContent: "Token Name",
        className: "min-w-[250px]",
      },
      {
        label: "Wallet Name",
        tooltipContent: "The name provided for the wallet",
        className: "min-w-[100px]",
      },
      {
        label: "Amount",
        tooltipContent:
          "Amount of SOL put in by the tracked wallet and the amount of tokens bought",
        className: "w-full min-w-[135px]",
        sortButton: (
          <>
            <WalletTrackerTotalFilter />
            <SortButton
              type="usdc-or-sol"
              value={amountType}
              setValue={setAmountType}
            />
          </>
        ),
      },
      {
        label: "Market Cap",
        tooltipContent: "Indicates token value",
        className: "min-w-[95px]",
      },
      {
        label: "Actions",
        tooltipContent: "Action button which includes quick buy",
        className: `w-full ${
          quickBuyAmount.toString().length > 1
            ? `min-w-[${120 + quickBuyAmount.toString().length * 10}ch] max-w-[${
                120 + quickBuyAmount.toString().length * 10
              }ch]`
            : ""
        }`,
      },
    ],
    [amountType, setAmountType],
  );

  const [headerType, setHeaderType] = useState<
    "normal" | "popup" | "small-popup"
  >("normal");

  // const { twitterMonitorModalMode } = useTwitterMonitorLockedStore()
  // const { walletTrackerModalMode, walletTrackerSize } = useWalletTrackerLockedStore()

  // const popUpResponsive = walletTrackerSize.width < 770 && walletTrackerModalMode === "locked"
  const { popups } = usePopupStore();
  const windowName: WindowName = "wallet_tracker";
  const walletTracker = popups.find((value) => value.name === windowName)!;
  const { size, mode } = walletTracker;
  const popUpResponsive = size.width < 770 && mode !== "footer";
  const quickBuyLength = quickBuyAmount.toString().length;
  const dynamicWidth = 120 + quickBuyLength * 5;
  const smallerPopupResponsive = size.width < 600 && mode !== "footer";
  const isSnapOpen = popups.some((p) => p.isOpen && p.snappedSide !== "none");

  const { width } = useWindowSize();

  useEffect(() => {
    switch (variant) {
      case "normal":
        setHeaderType("normal");
        break;
      case "pop-out":
        if (smallerPopupResponsive) {
          setHeaderType("small-popup");
          break;
        }
        setHeaderType("popup");
        break;
      default:
        setHeaderType("normal");
        break;
    }
  }, [variant, smallerPopupResponsive]);

  const setIsWalletTrackerHovered = useWalletTrackerPaused(
    (state) => state.setIsWalletTrackerHovered,
  );

  const handleOnMouseLeaveTracker = useCallback(() => {
    setIsWalletTrackerHovered(false);
    if (messagesPaused?.length) {
      setMessages(messagesPaused);
      setMessagesPaused([]);
    }
  }, [messagesPaused]);

  // Tutorial mode rendering
  // if (isWalletTrackerTutorial) {
  //   return (
  //     <div className="relative flex h-full w-full flex-grow flex-col">
  //       <div className="absolute left-0 top-0 flex h-full w-full flex-grow flex-col">
  //         {dummyWalletTrackerData && dummyWalletTrackerData.length ? (
  //           <div className="sticky top-0 z-[9] hidden h-[40px] w-full flex-shrink-0 border-b border-border bg-[#080811] pl-4 xl:block">
  //             <div className="flex items-center">
  //               {HeaderDataNormal.map((item, index) => (
  //                 <HeadCol key={index} {...item} />
  //               ))}
  //             </div>
  //           </div>
  //         ) : null}

  //         <div className="nova-scroller relative flex w-full flex-grow max-xl:p-3">
  //           {!!dummyWalletTrackerData && dummyWalletTrackerData.length > 0 && (
  //             <Virtuoso
  //               style={{
  //                 overflow: "hidden",
  //               }}
  //               className="w-full"
  //               totalCount={dummyWalletTrackerData.length}
  //               itemContent={(index: number) =>
  //                 dummyWalletTrackerData[index] && (
  //                   <WalletTrackerCard
  //                     index={index}
  //                     isFirst={index === 0}
  //                     key={`${dummyWalletTrackerData[index].timestamp}-${dummyWalletTrackerData[index].maker}-${dummyWalletTrackerData[index].signature}`}
  //                     tracker={dummyWalletTrackerData[index]}
  //                     wallets={[]}
  //                     type={
  //                       dummyWalletTrackerData[index].type.toLowerCase() as
  //                         | "buy"
  //                         | "sell"
  //                     }
  //                     responsiveBreakpoint={1280}
  //                   />
  //                 )
  //               }
  //             />
  //           )}
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="relative flex h-full w-full flex-grow flex-col">
      {/* <div className="fixed right-3 top-3 z-[200000] flex flex-col border border-white/30 bg-black/80 p-2 text-white backdrop-blur-md">
        <h3 className="font-geistSemiBold text-sm">Wallet Tracker Debug 🖖</h3>

        <div className="flex flex-col text-xs text-white">
          <span>LE: {messages.length}</span>
          <span>Load WT: {isLoadingWalletTracker ? "🟢" : "🔴"}</span>
          <span>
            Load Fetch More:{" "}
            {isSelectedTrackedWalletTransactionDataLoading ? "🟢" : "🔴"}
          </span>
        </div>

        <div className="h-[1px] w-full bg-white"></div>

        <div className="nova-scroller flex h-[350px] flex-col text-xs text-white">
          {currentSelectedAddresses.map((item) => (
            <div key={item}>
              • {item.slice(0, 10)}
              {" | "}
              <span
                className={cn(
                  "font-geistSemiBold",
                  messages.filter((wt) => wt?.walletAddress === item).length > 0
                    ? "text-success"
                    : "text-destructive",
                )}
              >
                {messages.filter((wt) => wt?.walletAddress === item).length}
              </span>
            </div>
          ))}
        </div>
      </div> */}
      <div className="absolute left-0 top-0 flex h-full w-full flex-grow flex-col">
        {/* Normal view with grid layout */}
        {filteredFinalData && variant === "normal" && !isSnapOpen ? (
          <div
            className={cn(
              "sticky top-0 z-[9] hidden h-[40px] w-full flex-shrink-0 border-b border-border bg-[#080811] pl-4 xl:block",
              filteredFinalData.length * 88 <
                (width! > 1630
                  ? window.innerHeight! - 195
                  : window.innerHeight - 238)
                ? "pr-2"
                : "pr-6",
            )}
          >
            <div className="relative flex h-full items-center">
              {(headerType === "normal"
                ? HeaderDataNormal
                : headerType === "small-popup"
                  ? HeaderDataPopup.filter((item) => item.label !== "Action")
                  : HeaderDataPopup
              ).map((item, index) => (
                <HeadCol key={index} {...item} />
              ))}
            </div>
          </div>
        ) : null}
        {/* Pop-out view with regular layout */}
        {variant === "pop-out" && (
          <div className="sticky top-0 z-[9] ml-4 mr-[10px] hidden h-[40px] flex-shrink-0 items-center overflow-x-hidden border-b border-border bg-[#080811] xl:flex">
            {(headerType === "normal"
              ? HeaderDataNormal
              : headerType === "small-popup"
                ? HeaderDataPopup.filter((item) => item.label !== "Action")
                : HeaderDataPopup
            )?.length > 0 &&
              (headerType === "normal"
                ? HeaderDataNormal
                : headerType === "small-popup"
                  ? HeaderDataPopup.filter((item) => item.label !== "Action")
                  : HeaderDataPopup
              ).map((item, index) => {
                if (item.label === "Token") {
                  if (popUpResponsive) {
                    return (
                      <HeadCol
                        key={index}
                        {...item}
                        className={cn(
                          "w-full min-w-[130px]",
                          size.width < 500 && "min-w-[120px]",
                        )}
                        style={{
                          minWidth:
                            size.width < 500
                              ? `size ${size.width / 3 + 5}px`
                              : "",
                        }}
                        isWithBorder={true}
                      />
                    );
                  } else {
                    return (
                      <HeadCol
                        key={index}
                        {...item}
                        className={cn(
                          "w-full min-w-[250px]",
                          size.width > 800 && "min-w-[340px]",
                        )}
                        style={{
                          minWidth:
                            size.width < 500
                              ? `size ${size.width / 3 + 10}px`
                              : "",
                        }}
                        isWithBorder={true}
                      />
                    );
                  }
                }
                if (item.label === "Wallet Name" && smallerPopupResponsive) {
                  return (
                    <HeadCol
                      key={index}
                      {...item}
                      label="Wallet"
                      className="w-full min-w-[80px]"
                      isWithBorder={true}
                    />
                  );
                }
                if (item.label === "Market Cap" && popUpResponsive) {
                  return (
                    <HeadCol
                      key={index}
                      {...item}
                      className="w-full min-w-[65px]"
                      label="MC"
                      isWithBorder={true}
                    />
                  );
                }
                if (item.label === "Actions" && popUpResponsive) {
                  return (
                    <HeadCol
                      key={index}
                      {...item}
                      className={cn(
                        "flex h-full w-full items-center justify-start",
                        quickBuyLength > 1 &&
                          `min-w-[${dynamicWidth}ch] max-w-[${dynamicWidth}ch]`,
                        smallerPopupResponsive && "hidden",
                      )}
                    />
                  );
                }
                return <HeadCol key={index} {...item} />;
              })}
          </div>
        )}
        {isLoadingWalletTracker ||
        isSelectedTrackedWalletTransactionDataLoading ? (
          <LoadingState
            isFetchingBasedOnFilter={
              isSelectedTrackedWalletTransactionDataLoading &&
              pathname === "/wallet-tracker"
            }
          />
        ) : trackedWalletsList.length === 0 ? (
          <div className="absolute left-0 top-0 flex h-full w-full flex-grow items-center justify-center">
            <EmptyState
              windowSize={size}
              state="Wallet"
              className="-mt-5 xl:mt-0"
            />
          </div>
        ) : filteredFinalData?.length === 0 ? (
          <div className="absolute left-0 top-0 flex h-full w-full flex-grow items-center justify-center">
            <EmptyState
              windowSize={size}
              state="No Result"
              className="-mt-5 xl:mt-0"
            />
          </div>
        ) : (
          <TableBody
            filteredFinalData={filteredFinalData}
            isSnapOpen={isSnapOpen}
            variant={variant}
            onMouseEnter={() => setIsWalletTrackerHovered(true)}
            onMouseLeave={handleOnMouseLeaveTracker}
          />
        )}
      </div>
    </div>
  );
}

const TableBody = ({
  filteredFinalData,
  isSnapOpen,
  variant,
  onMouseEnter,
  onMouseLeave,
}: TableBodyProps) => {
  const { walletsOfToken } = useTrackedWalletsOfToken();

  // Memoize the items data to prevent unnecessary re-renders
  const itemData = useMemo(
    () => ({
      items: filteredFinalData,
      walletsOfToken,
      isSnapOpen,
      variant,
    }),
    [filteredFinalData, isSnapOpen],
  );

  // Memoize the getItemKey function
  const getItemKey = (index: number) => {
    return `${filteredFinalData[index]?.mint}-${index}` || index;
  };

  const { width } = useWindowSize();
  const itemSize = useMemo(() => {
    if (variant === "normal") {
      // if there is snap window and mobile
      return isSnapOpen || width! < 1280 ? 165 : 88;
    } else {
      return width! >= 1280 ? 40 : 180;
    }
  }, [width, isSnapOpen]);

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        "nova-scroller relative flex h-full w-full flex-grow flex-col max-xl:p-4",
        variant === "normal" && isSnapOpen && "p-2",
      )}
    >
      <FixedSizeList
        height={
          variant === "normal"
            ? width! > 1630
              ? window.innerHeight! - 195
              : window.innerHeight! - 238
            : width! >= 1280
              ? window.innerHeight! - 250
              : window.innerHeight! - 238
        }
        width="100%"
        itemCount={filteredFinalData.length}
        itemSize={itemSize}
        overscanCount={3}
        itemKey={getItemKey}
        itemData={itemData}
      >
        {WallerTrackerCardRow}
      </FixedSizeList>
    </div>
  );
};
