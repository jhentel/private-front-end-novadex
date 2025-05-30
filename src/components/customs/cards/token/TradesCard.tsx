// ######## Libraries 📦 & Hooks 🪝 ########
import React, {
  memo,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useTokenCardsFilter } from "@/stores/token/use-token-cards-filter.store";
import { useTradesWalletModalStore } from "@/stores/token/use-trades-wallet-modal.store";
import { useWalletTrackerMessageStore } from "@/stores/footer/use-wallet-tracker-message.store";
import { useCurrentTokenFreshWalletsStore } from "@/stores/token/use-current-token-fresh-wallets.store";
// ######## Components 🧩 ########
import TradesButtons from "@/components/customs/buttons/token/TradesButtons";
import AddressWithEmojis from "@/components/customs/AddressWithEmojis";
import CircleCount from "@/components/customs/CircleCount";
import WalletTrackerPopover from "@/components/customs/tables/token/Trades/WalletTrackerPopover";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { truncateString } from "@/utils/truncateString";
import { truncateAddress } from "@/utils/truncateAddress";
import {
  formatAmountDollar,
  formatAmountWithoutLeadingZero,
} from "@/utils/formatAmount";
// ####### Types 🗨️ ########
import { TransactionInfo } from "@/types/ws-general";
import { Badge } from "@/components/ui/badge";
import { useTokenCardsFilterStorePersist } from "@/stores/token/use-token-cards-filter-persist.store";
import { useOpenCustomTable } from "@/stores/token/use-open-custom-table";
import { CachedImage } from "../../CachedImage";
import { usePopupStore } from "@/stores/use-popup-state";
import { useWindowSizeStore } from "@/stores/use-window-size.store";
import { useTokenMarketCapToggleState } from "@/stores/token/use-token-market-cap-toggle.store";
import { useTradesTableSettingStore } from "@/stores/table/token/use-trades-table-setting.store";
import { useTokenPersist } from "@/stores/token/use-token-persist.store";

interface TradesCardProps {
  index?: number;
  transaction?: TransactionInfo;
  setWalletFilter?: (value: string) => void;
  walletFilter?: string;
  isLoading?: boolean;
}

interface DesktopViewProps {
  transactionData: {
    type?: string;
    firstTrade: boolean;
    timestamp: number;
    value: number;
    valueUsd: number;
    tokenAmount: number;
    solAmount: number;
    solAmountUsd: number;
    maker: string;
    signature: string;
    buys: number;
    sells: number;
    animal: string;
    isDeveloper: boolean;
    isInsider: boolean;
    isSniper: boolean;
  } | null;
  timeDifference: string;
  tradesDateType: string;
  tradesValue: string;
  tradesTokenSol: string;
  transactionClass: string;
  setWalletFilter: (value: string) => void;
  walletFilter: string;
  transaction?: TransactionInfo;
  isTradeMatchWithExistingTrackedWallet:
    | {
        address: string;
        name?: string;
        emoji?: string;
      }
    | undefined;
  freshWalletFundedInfo:
    | {
        wallet: string;
        fundedAmount: string;
        fundedBy: string;
        timestamp: number;
      }
    | undefined;
  isBlue: boolean;
  selectedTableColumns: string[];
}

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

// Memoized TimeDifference component to prevent unnecessary re-renders
const MemoizedTimeDifference = memo(({ timestamp }: { timestamp: number }) => {
  const [timeDiff, setTimeDiff] = useState("-");
  const timestampRef = useRef(timestamp);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const updateDifference = useCallback(() => {
    if (!timestampRef.current) return;

    const time =
      String(timestampRef.current).length > 10
        ? timestampRef.current / 1000
        : timestampRef.current;

    const now = Math.floor(Date.now() / 1000);
    const difference = Math.abs(now - time);

    if (difference < 60) {
      setTimeDiff(`${difference.toFixed(0)}s`);
    } else if (difference < 3600) {
      setTimeDiff(`${Math.floor(difference / 60)}m`);
    } else if (difference < 86400) {
      const hours = Math.floor(difference / 3600);
      const minutes = Math.floor((difference % 3600) / 60);
      setTimeDiff(`${hours}h ${minutes}m`);
    } else {
      const days = Math.floor(difference / 86400);
      const hours = Math.floor((difference % 86400) / 3600);
      setTimeDiff(`${days}d ${hours}h`);
    }
  }, []);

  useEffect(() => {
    if (timestamp !== timestampRef.current) {
      timestampRef.current = timestamp;
      updateDifference();
    }
  }, [timestamp, updateDifference]);

  useEffect(() => {
    // Initial update
    updateDifference();

    // Set up interval
    intervalRef.current = setInterval(updateDifference, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [updateDifference]);

  return (
    <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
      {timeDiff}
    </span>
  );
});

MemoizedTimeDifference.displayName = "MemoizedTimeDifference";

// Memoized columns to prevent re-renders
const DateColumn = memo(
  ({
    timestamp,
    tradesDateType,
    transactionClass,
  }: {
    timestamp: number;
    tradesDateType: string;
    transactionClass: string;
  }) => {
    const { remainingScreenWidth } = usePopupStore();
    if (!timestamp) return null;

    return (
      <div
        className={cn(
          "flex h-full w-full min-w-[140px] items-center",
          remainingScreenWidth < 1300 && "min-w-[135px]",
        )}
      >
        <span
          className={cn(
            "inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary",
            transactionClass,
          )}
        >
          {tradesDateType === "DATE" ? (
            formatDate(timestamp)
          ) : (
            <MemoizedTimeDifference timestamp={timestamp} />
          )}
        </span>
      </div>
    );
  },
);

DateColumn.displayName = "DateColumn";

const DesktopView = memo(
  ({
    transactionData,
    tradesDateType,
    tradesValue,
    tradesTokenSol,
    transactionClass,
    setWalletFilter,
    walletFilter,
    transaction,
    isTradeMatchWithExistingTrackedWallet,
    freshWalletFundedInfo,
    isBlue,
    selectedTableColumns,
  }: DesktopViewProps) => {
    const tokenMarketCap = useTokenMarketCapToggleState(
      (state) => state.column,
    );
    const setIsSorting = useTradesTableSettingStore(
      (state) => state.setIsSorting,
    );

    const setIsPaused = useTradesTableSettingStore(
      (state) => state.setIsPaused,
    );
    const { remainingScreenWidth } = usePopupStore();
    if (!transactionData || !setWalletFilter) return null;

    return (
      <div className="flex h-[56px] w-full">
        {/* Date column */}
        {selectedTableColumns.find((col) => col === "date-age") && (
          <DateColumn
            timestamp={transactionData.timestamp}
            tradesDateType={tradesDateType}
            transactionClass={transactionClass}
          />
        )}

        {/* Type column */}
        {selectedTableColumns.find((col) => col === "type") && (
          <div
            className={cn(
              "flex h-full w-full min-w-[110px] items-center max-[1300px]:max-w-[90px]",
              remainingScreenWidth < 1500 && "min-w-[80px]",
            )}
          >
            <span
              className={cn(
                "inline-block text-nowrap font-geistSemiBold text-sm",
                transactionClass,
              )}
            >
              {transactionData.type
                ? `${transactionData.type.charAt(0).toUpperCase()}${transactionData.type.slice(1)}`
                : ""}
            </span>
          </div>
        )}

        {/* Rest of your desktop view */}

        {selectedTableColumns.find((col) => col === "value") && (
          <div
            className={cn(
              "flex h-full w-full min-w-[120px] items-center gap-x-1 min-[1520px]:min-w-[143px]",
              remainingScreenWidth < 1500 && "min-[1520px]:min-w-[120px]",
              //   "ml-3 min-w-[80px] max-w-[120px] min-[1520px]:min-w-[100px]",
            )}
          >
            {tradesValue == "SOL" ? (
              <div className="relative aspect-auto h-[16px] w-[16px] flex-shrink-0">
                <CachedImage
                  src="/icons/solana-sq.svg"
                  alt="Solana SQ Icon"
                  fill
                  quality={50}
                  className="object-contain"
                />
              </div>
            ) : (
              ""
            )}
            <span
              className={cn(
                "line-clamp-1 inline-block text-nowrap font-geistSemiBold text-sm",
                transactionClass,
              )}
            >
              {tradesValue == "SOL"
                ? formatAmountWithoutLeadingZero(transactionData.value, 3, 2)
                : `$${formatAmountWithoutLeadingZero(transactionData.valueUsd, 3, 2)}`}
            </span>
          </div>
        )}

        {/* Token Amount column */}
        {selectedTableColumns.find((col) => col === "amount-of-tokens") && (
          <div
            className={cn(
              "flex h-full w-full min-w-[145px] items-center min-[1520px]:min-w-[90px]",
              remainingScreenWidth < 1500 && "min-[1520px]:min-w-[90px]",
              // remainingScreenWidth < 1300 &&
              //   "ml-3 min-w-fit max-w-[55px] min-[1520px]:min-w-fit",
            )}
          >
            <span
              className={cn(
                "inline-block text-nowrap font-geistSemiBold text-sm",
                transactionClass,
              )}
            >
              {tokenMarketCap === "token"
                ? formatAmountWithoutLeadingZero(
                    transactionData.tokenAmount,
                    3,
                    2,
                  )
                : formatAmountDollar(transaction?.market_cap_usd || 0)}
            </span>
          </div>
        )}

        {/* SOL Amount column */}
        {/* {selectedTableColumns.find((col) => col === "total") && (
          <div className={cn("flex h-full w-full min-w-[115px] items-center")}>
            <div className="flex items-center gap-x-1">
              {tradesTokenSol == "SOL" ? (
                <div className="relative aspect-auto h-[16px] w-[16px] flex-shrink-0">
                  <CachedImage
                    src="/icons/solana-sq.svg"
                    alt="Solana SQ Icon"
                    fill
                    quality={50}
                    className="object-contain"
                  />
                </div>
              ) : (
                ""
              )}
              <span
                className={cn(
                  "inline-block text-nowrap font-geistSemiBold text-sm",
                  transactionClass,
                )}
              >
                {tradesTokenSol == "SOL"
                  ? formatAmountWithoutLeadingZero(
                      transactionData.solAmount,
                      3,
                      2,
                    )
                  : `$${formatAmountWithoutLeadingZero(transactionData.solAmountUsd, 3, 2)}`}
              </span>
            </div>
          </div>
        )} */}

        {/* Maker column */}
        {isTradeMatchWithExistingTrackedWallet ? (
          <>
            {selectedTableColumns.find((col) => col === "maker") && (
              <div
                className={cn(
                  "flex h-full w-full min-w-[165px] items-center justify-end min-[1520px]:min-w-[175px]",
                  {
                    "mr-1.5": !selectedTableColumns.find(
                      (col) => col === "actions",
                    ),
                    "ml-3 min-w-[60px] min-[1520px]:min-w-[80px]":
                      remainingScreenWidth < 1300,
                  },
                )}
              >
                <div className="flex items-center gap-x-1">
                  <AddressWithEmojis
                    isWithOverview
                    onOpenChange={setIsSorting}
                    isFirst={isBlue}
                    address={truncateString(
                      isTradeMatchWithExistingTrackedWallet?.name || "",
                      14,
                    )}
                    fullAddress={isTradeMatchWithExistingTrackedWallet?.address}
                    className="!font-geistRegular text-sm"
                    emojis={
                      isTradeMatchWithExistingTrackedWallet.emoji
                        ? [isTradeMatchWithExistingTrackedWallet.emoji]
                        : []
                    }
                    trackedWalletIcon={
                      isTradeMatchWithExistingTrackedWallet?.emoji
                    }
                    freshWalletFundedInfo={freshWalletFundedInfo}
                    buy={transactionData.type === "buy" ? true : false}
                    stripClassname="!-bottom-0.5"
                    isWithLink
                  />
                  <CircleCount
                    value={transactionData?.buys + transactionData?.sells}
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {selectedTableColumns.find((col) => col === "maker") && (
              <div
                className={cn(
                  "flex h-full w-full min-w-[165px] items-center justify-end min-[1520px]:min-w-[175px]",
                  {
                    "mr-1.5": !selectedTableColumns.find(
                      (col) => col === "actions",
                    ),
                    "ml-3 min-w-[60px] min-[1520px]:min-w-[80px]":
                      remainingScreenWidth < 1300,
                  },
                )}
              >
                {transaction && (
                  <WalletTrackerPopover
                    onOpenChange={setIsSorting}
                    isFirst={
                      transaction?.type?.toLowerCase() === "add" ||
                      transaction?.first_trade
                    }
                    makerAddress={transaction.maker}
                    isBuy={transaction?.type?.toLowerCase() === "buy"}
                    emojis={[
                      ...(transaction?.animal?.length > 0
                        ? [transaction?.animal + ".svg"]
                        : []),
                      ...(transaction.is_developer
                        ? [transaction.type === "buy" ? "db.svg" : "ds.svg"]
                        : []),
                      ...(transaction.is_insider
                        ? ["white-anonymous.svg"]
                        : []),
                      ...(transaction.is_sniper ? ["sniper.svg"] : []),
                    ]}
                    circleCount={transaction?.buys + transaction?.sells}
                    isDeveloper={transaction.is_developer}
                    freshWalletFundedInfo={freshWalletFundedInfo}
                  />
                )}
              </div>
            )}
          </>
        )}

        {/* Actions column */}
        {selectedTableColumns.find((col) => col === "actions") && (
          <div className="mr-auto flex h-full w-full min-w-[80px] items-center justify-end gap-x-2 pr-3">
            <TradesButtons
              hash={transactionData.signature}
              walletFilter={walletFilter as string}
              setWalletFilter={setWalletFilter}
              wallet={transactionData.maker}
            />
          </div>
        )}
      </div>
    );
  },
  // Improved prop comparison
  (prevProps, nextProps) => {
    if (
      prevProps.transactionData?.timestamp !==
      nextProps.transactionData?.timestamp
    )
      return false;
    if (prevProps.tradesDateType !== nextProps.tradesDateType) return false;
    if (prevProps.tradesValue !== nextProps.tradesValue) return false;
    if (prevProps.tradesTokenSol !== nextProps.tradesTokenSol) return false;
    if (prevProps.walletFilter !== nextProps.walletFilter) return false;
    if (prevProps.isBlue !== nextProps.isBlue) return false;

    // Deep compare only if values exist
    if (
      prevProps.selectedTableColumns?.length !==
      nextProps.selectedTableColumns?.length
    )
      return false;
    if (
      prevProps.selectedTableColumns?.some(
        (col, i) => col !== nextProps.selectedTableColumns?.[i],
      )
    )
      return false;

    // Minimal transaction data comparison
    if (prevProps.transactionData?.maker !== nextProps.transactionData?.maker)
      return false;
    if (
      prevProps.transactionData?.signature !==
      nextProps.transactionData?.signature
    )
      return false;

    if (
      prevProps.freshWalletFundedInfo?.wallet !==
      nextProps.freshWalletFundedInfo?.wallet
    )
      return false;

    // Compare wallet match only if exists
    const prevWallet = prevProps.isTradeMatchWithExistingTrackedWallet;
    const nextWallet = nextProps.isTradeMatchWithExistingTrackedWallet;
    if (prevWallet?.address !== nextWallet?.address) return false;

    return true;
  },
);

DesktopView.displayName = "DesktopView";

interface MobileViewProps {
  transactionData: {
    type?: string;
    firstTrade: boolean;
    timestamp: number;
    value: number;
    valueUsd: number;
    tokenAmount: number;
    solAmount: number;
    solAmountUsd: number;
    maker: string;
    signature: string;
    buys: number;
    sells: number;
    animal: string;
    isDeveloper: boolean;
    isInsider: boolean;
    isSniper: boolean;
  } | null;
  timeDifference: string;
  tradesDateType: string;
  transactionClass: string;
  walletFilter: string;
  setWalletFilter: (value: string) => void;
  isTradeMatchWithExistingTrackedWallet:
    | {
        address: string;
        name?: string;
        emoji?: string;
      }
    | undefined;
  freshWalletFundedInfo:
    | {
        wallet: string;
        fundedAmount: string;
        fundedBy: string;
        timestamp: number;
      }
    | undefined;
  isBlue: boolean;
  transaction?: TransactionInfo;
}

const MobileView = React.memo(
  ({
    transactionData,
    transactionClass,
    walletFilter,
    setWalletFilter,
    isTradeMatchWithExistingTrackedWallet,
    freshWalletFundedInfo,
    isBlue,
    transaction,
  }: MobileViewProps) => {
    const setWalletAddress = useTradesWalletModalStore(
      (state) => state.setWallet,
    );

    if (!transactionData || !setWalletFilter) return null;

    return (
      <div className="flex w-full flex-col">
        {/* Header */}
        <div className="relative flex h-8 w-full items-center justify-between bg-white/[4%] px-3 py-3">
          <span
            className={cn(
              "text-nowrap font-geistSemiBold text-sm",
              transactionClass,
            )}
          >
            {transactionData.type
              ? `${transactionData.type.charAt(0).toUpperCase()}${transactionData.type.slice(1)}`
              : ""}
          </span>
          <span
            className={cn(
              "text-nowrap font-geistRegular text-xs text-fontColorSecondary",
              transactionClass,
            )}
            suppressHydrationWarning
          >
            <MemoizedTimeDifference timestamp={transactionData.timestamp} />
          </span>
        </div>

        {/* Content */}
        <div className="flex w-full flex-col gap-y-3 pt-3">
          <div className="flex justify-between gap-x-2 px-3">
            <div className="flex flex-col gap-y-1">
              <span className="text-nowrap text-xs text-fontColorSecondary">
                Market Cap
              </span>
              <span
                className={cn("font-geistSemiBold text-sm", transactionClass)}
              >
                {formatAmountWithoutLeadingZero(
                  transaction?.market_cap_usd || 0,
                  3,
                  2,
                )}
              </span>
            </div>
            {/* <div className="flex flex-col gap-y-1">
              <span className="text-nowrap text-xs text-fontColorSecondary">
                Value
              </span>
              <span
                className={cn("font-geistSemiBold text-sm", transactionClass)}
              >
                {formatAmountWithoutLeadingZero(transactionData.value, 3, 2)}
              </span>
            </div> */}

            <div className="flex flex-col gap-y-1">
              <span className="text-nowrap text-xs text-fontColorSecondary">
                SOL
              </span>
              <div className="flex items-center gap-x-1">
                <div className="relative aspect-auto h-[16px] w-[16px] flex-none">
                  <CachedImage
                    src="/icons/solana-sq.svg"
                    alt="Solana SQ Icon"
                    fill
                    quality={50}
                    className="flex-none object-contain"
                  />
                </div>
                <span
                  className={cn("font-geistSemiBold text-sm", transactionClass)}
                >
                  {formatAmountWithoutLeadingZero(
                    transactionData.solAmount,
                    3,
                    2,
                  )}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-y-1">
              <span className="text-nowrap text-xs text-fontColorSecondary">
                Tokens
              </span>
              <span
                className={cn("font-geistSemiBold text-sm", transactionClass)}
              >
                {formatAmountWithoutLeadingZero(
                  transactionData.tokenAmount,
                  3,
                  2,
                )}
              </span>
            </div>
            <div className="flex flex-col gap-y-1">
              <span className="text-nowrap text-xs text-fontColorSecondary">
                USDC
              </span>
              <span
                className={cn("font-geistSemiBold text-sm", transactionClass)}
              >
                {formatAmountWithoutLeadingZero(
                  transactionData.solAmountUsd,
                  3,
                  2,
                )}
              </span>
            </div>
          </div>

          <div className="flex h-[48px] items-center justify-between border-t border-border px-3">
            <div className="mr-auto flex items-center gap-x-1 xl:mr-0">
              {isTradeMatchWithExistingTrackedWallet ? (
                <>
                  <AddressWithEmojis
                    isWithOverview
                    isFirst={isBlue}
                    address={truncateString(
                      isTradeMatchWithExistingTrackedWallet?.name || "",
                      14,
                    )}
                    fullAddress={isTradeMatchWithExistingTrackedWallet?.address}
                    className="!font-geistRegular text-sm"
                    emojis={[]}
                    trackedWalletIcon={
                      isTradeMatchWithExistingTrackedWallet?.emoji
                    }
                    freshWalletFundedInfo={freshWalletFundedInfo}
                    buy={transactionData.type === "buy" ? true : false}
                    stripClassname="!-bottom-0.5"
                    isWithLink
                  />
                  <CircleCount
                    value={transactionData?.buys + transactionData?.sells}
                  />
                </>
              ) : (
                transaction && (
                  <WalletTrackerPopover
                    isFirst={
                      transaction?.type?.toLowerCase() === "add" ||
                      transaction?.first_trade
                    }
                    makerAddress={transaction.maker}
                    isBuy={transaction?.type?.toLowerCase() === "buy"}
                    emojis={[
                      ...(transaction?.animal?.length > 0
                        ? [transaction?.animal + ".svg"]
                        : []),
                      ...(transaction.is_developer
                        ? [transaction.type === "buy" ? "db.svg" : "ds.svg"]
                        : []),
                      ...(transaction.is_insider
                        ? ["white-anonymous.svg"]
                        : []),
                      ...(transaction.is_sniper ? ["sniper.svg"] : []),
                    ]}
                    circleCount={transaction?.buys + transaction?.sells}
                    isDeveloper={transaction.is_developer}
                    freshWalletFundedInfo={freshWalletFundedInfo}
                  />
                )
              )}
              {transaction?.is_developer && (
                <Badge className="bg-white/[12%] py-1 leading-3 text-warning">
                  DEV
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <TradesButtons
                hash={transactionData.signature}
                walletFilter={walletFilter as string}
                setWalletFilter={setWalletFilter}
                wallet={transactionData.maker}
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.timeDifference === nextProps.timeDifference &&
      prevProps.tradesDateType === nextProps.tradesDateType &&
      prevProps.walletFilter === nextProps.walletFilter &&
      prevProps.freshWalletFundedInfo === nextProps.freshWalletFundedInfo &&
      JSON.stringify(prevProps.transactionData) ===
        JSON.stringify(nextProps.transactionData) &&
      JSON.stringify(prevProps.isTradeMatchWithExistingTrackedWallet) ===
        JSON.stringify(nextProps.isTradeMatchWithExistingTrackedWallet) &&
      JSON.stringify(prevProps.freshWalletFundedInfo) ===
        JSON.stringify(nextProps.freshWalletFundedInfo)
    );
  },
);

MobileView.displayName = "MobileView";

const TradesCard = memo(
  ({
    index = 2,
    transaction,
    setWalletFilter,
    walletFilter,
    isLoading,
  }: TradesCardProps) => {
    const { remainingScreenWidth } = usePopupStore();

    const width = useWindowSizeStore((state) => state.width);
    const isXlDown = width ? width < 1280 : false;

    // Memoize transaction data
    const transactionData = useMemo(() => {
      if (!transaction) return null;
      return {
        type: transaction.type,
        firstTrade: transaction.first_trade,
        timestamp: transaction.timestamp,
        value: transaction.value,
        valueUsd: transaction.value_usd,
        tokenAmount: transaction.token_amount,
        solAmount: transaction.sol_amount,
        solAmountUsd: transaction.sol_amount_usd,
        maker: transaction.maker,
        signature: transaction.signature,
        buys: transaction.buys,
        sells: transaction.sells,
        animal: transaction.animal,
        isDeveloper: transaction.is_developer,
        isInsider: transaction.is_insider,
        isSniper: transaction.is_sniper,
      };
    }, [transaction]);

    // Memoize transaction class computation
    const transactionClass = useMemo(() => {
      if (!transactionData) return "";
      const isBlue =
        transactionData.type?.toLowerCase() === "add" ||
        transactionData.firstTrade;
      const isBuy = transactionData.type?.toLowerCase() === "buy";
      return isBlue
        ? "text-[#66B0FF]"
        : isBuy
          ? "text-success"
          : "text-destructive";
    }, [transactionData?.type, transactionData?.firstTrade]);

    // Memoize selectors to prevent unnecessary re-renders
    const selectedTableColumns = useOpenCustomTable(
      (state) => state.selectedTableColumns,
    );
    const tradesDateType = useTokenCardsFilterStorePersist(
      (state) => state.tradesDateType,
    );

    const { tradesValue, tradesTokenSol } = useTokenPersist();

    // Memoize expensive computations
    const trackedWallets = useWalletTrackerMessageStore(
      (state) => state.trackedWallets,
    );
    const isTradeMatchWithExistingTrackedWallet = useMemo(
      () => trackedWallets.find((w) => w.address === transaction?.maker),
      [trackedWallets, transaction?.maker],
    );

    const freshWallets = useCurrentTokenFreshWalletsStore(
      (state) => state.freshWallets,
    );
    const isTradeFunded = useMemo(() => {
      const match = freshWallets?.find((w) => w?.wallet === transaction?.maker);

      // if (match) {
      //   console.log("FRESH WALLET 🟢", {
      //     transactionAddress: transaction?.maker,
      //     match,
      //     freshWallets,
      //     transaction,
      //   });
      // } else {
      //   console.log("FRESH WALLET 🔴", {
      //     transactionAddress: transaction?.maker,
      //     match,
      //     freshWallets,
      //     transaction,
      //   });
      // }

      return match;
    }, [freshWallets, transaction?.maker]);

    if (isLoading) {
      return <div className="h-full w-full bg-shadeTable"></div>;
    }

    const ViewComponent =
      isXlDown || remainingScreenWidth < 1200 ? MobileView : DesktopView;

    return (
      <div
        id="wrapper-trades-card"
        className={cn(
          "w-full flex-shrink-0 items-center overflow-hidden",
          "rounded-[8px] border border-border bg-card xl:rounded-[0px] xl:border-transparent xl:bg-transparent",
          "h-[145px] transition-colors duration-200 ease-out xl:flex xl:h-[56px] xl:min-w-max xl:pl-3 xl:pr-0 xl:hover:bg-shadeTableHover",
          isLoading
            ? "w-full flex-grow animate-pulse duration-500 xl:bg-shadeTable"
            : "",
          index % 2 === 0 ? "" : "xl:bg-shadeTable",
          remainingScreenWidth < 1200 &&
            "xl:h-full xl:min-w-full xl:rounded-[8px] xl:border xl:border-border xl:bg-card xl:pl-0 xl:hover:bg-card",
        )}
      >
        <ViewComponent
          transactionData={transactionData}
          timeDifference={"-"}
          tradesDateType={tradesDateType}
          tradesValue={tradesValue}
          tradesTokenSol={tradesTokenSol}
          transactionClass={transactionClass}
          setWalletFilter={setWalletFilter as (v: string) => void}
          walletFilter={walletFilter as string}
          transaction={transaction}
          isTradeMatchWithExistingTrackedWallet={
            isTradeMatchWithExistingTrackedWallet
          }
          freshWalletFundedInfo={isTradeFunded}
          isBlue={!!transactionClass.includes("text-[#66B0FF]")}
          selectedTableColumns={selectedTableColumns}
        />
      </div>
    );
  },
  // Optimized comparison function
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.walletFilter !== nextProps.walletFilter) return false;
    if (!prevProps.transaction || !nextProps.transaction)
      return prevProps.transaction === nextProps.transaction;

    return (
      prevProps.transaction.timestamp === nextProps.transaction.timestamp &&
      prevProps.transaction.signature === nextProps.transaction.signature &&
      prevProps.transaction.maker === nextProps.transaction.maker
    );
  },
);

TradesCard.displayName = "TradesCard";

export default TradesCard;
