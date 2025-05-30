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
import AddressWithoutEmojis from "@/components/customs/AddressWithoutEmojis";
import CircleCount from "@/components/customs/CircleCount";
import MarkerPanelComponent from "@/components/customs/tables/token/Trades/MarkerPanelComponent";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { truncateString } from "@/utils/truncateString";
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
import { useTradesPanelStore } from "@/stores/token/use-trades-panel.store";

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
  const date = new Date(timestamp);
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${month} ${day}\n${hours}:${minutes}:${seconds}`;
};

// Memoized TimeDifference component to prevent unnecessary re-renders
const MemoizedTimeDifference = memo(({ timestamp }: { timestamp: number }) => {
  const [timeDiff, setTimeDiff] = useState("-");
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLSpanElement>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Effect for width observer
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setContainerWidth(entry.contentRect.width);
        }, 150); // 150ms debounce
      });
    });

    if (containerRef.current) {
      // Set initial width
      setContainerWidth(containerRef.current.offsetWidth);
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, []);

  // Effect for time updates
  useEffect(() => {
    const updateDifference = () => {
      if (!timestamp) return;
      const time = String(timestamp).length > 10 ? timestamp / 1000 : timestamp;
      const now = Math.floor(Date.now() / 1000);
      const difference = Math.abs(now - time);

      if (difference < 60) {
        setTimeDiff(`${difference.toFixed(0)}s`);
      } else if (difference < 3600) {
        setTimeDiff(`${Math.floor(difference / 60)}m`);
      } else if (difference < 86400) {
        setTimeDiff(`${Math.floor(difference / 3600)}h`);
      } else {
        setTimeDiff(`${Math.floor(difference / 86400)}d`);
      }
    };

    updateDifference();
    const interval = setInterval(updateDifference, 1000);

    return () => clearInterval(interval);
  }, [timestamp]);

  return (
    <span 
      ref={containerRef}
      className={cn(
        "inline-block text-nowrap font-geistSemiBold text-fontColorPrimary",
        containerWidth > 50 ? "text-[15px]" : "text-[14px]"
      )}
    >
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
    const [width, setWidth] = useState(0);
    const divRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!divRef.current) return;

      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setWidth(entry.contentRect.width);
        }
      });

      resizeObserver.observe(divRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }, []);

    if (!timestamp) return null;

    return (
      <div
        ref={divRef}
        className={cn(
          "flex h-full w-full min-w-[60px] items-center justify-start",
          remainingScreenWidth < 1300 && "min-w-[60px]",
        )}
      >
        <span
          className={cn(
            "inline-block whitespace-pre font-geistSemiBold text-sm text-fontColorPrimary",
            transactionClass,
            width > 100 && "text-[13px]",
            width < 100 && "text-[12px]"
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
    transactionClass,
    setWalletFilter,
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

    const { remainingScreenWidth } = usePopupStore();

    // Add refs for each column
    const valueColumnRef = useRef<HTMLDivElement>(null);
    const tokenAmountColumnRef = useRef<HTMLDivElement>(null);
    const makerColumnRef = useRef<HTMLDivElement>(null);

    // Add width states for columns
    const [valueColumnWidth, setValueColumnWidth] = useState(0);
    const [tokenColumnWidth, setTokenColumnWidth] = useState(0);
    const [makerColumnWidth, setMakerColumnWidth] = useState(0);

    // Add effect to handle resize observations
    useEffect(() => {
      const refs = [valueColumnRef, tokenAmountColumnRef, makerColumnRef];
      const resizeObserver = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          const width = entry.contentRect.width;
          if (entry.target === valueColumnRef.current) setValueColumnWidth(width);
          if (entry.target === tokenAmountColumnRef.current) setTokenColumnWidth(width);
          if (entry.target === makerColumnRef.current) setMakerColumnWidth(width);
        });
      });

      refs.forEach((ref) => {
        if (ref.current) {
          resizeObserver.observe(ref.current);
        }
      });

      return () => {
        resizeObserver.disconnect();
      };
    }, []);

    if (!transactionData || !setWalletFilter) return null;

    return (
      <div
        className={cn(
          "flex h-[30px] w-full max-w-full items-center",
          remainingScreenWidth < 1200 && "h-auto",
        )}
      >
        {/* Date column */}
        {selectedTableColumns.find((col) => col === "date-age") && (
          <div className="flex h-full w-[25%] min-w-0 items-center">
            <DateColumn
              timestamp={transactionData.timestamp}
              tradesDateType={tradesDateType}
              transactionClass={cn(transactionClass, "text-[12px]")}
            />
          </div>
        )}

        {/* Value column with ref */}
        {selectedTableColumns.find((col) => col === "value") && (
          <div ref={valueColumnRef} className="flex h-full w-[25%] min-w-0 items-center">
            {tradesValue == "SOL" && (
              <div className="relative aspect-auto h-[14px] w-[14px] flex-shrink-0">
                <CachedImage
                  src="/icons/solana-sq.svg"
                  alt="Solana SQ Icon"
                  fill
                  quality={50}
                  className="object-contain"
                />
              </div>
            )}
            <span
              className={cn(
                "line-clamp-1 inline-block text-nowrap px-1 font-geistSemiBold",
                valueColumnWidth > 100 && "text-[15px]",
                valueColumnWidth < 100 && "text-[13px]",
                transactionClass,
              )}
            >
              {tradesValue == "SOL"
                ? formatAmountWithoutLeadingZero(transactionData.value, 3, 2)
                : `$${formatAmountWithoutLeadingZero(transactionData.valueUsd, 3, 2)}`}
            </span>
          </div>
        )}

        {/* Token Amount column with ref */}
        {selectedTableColumns.find((col) => col === "amount-of-tokens") && (
          <div ref={tokenAmountColumnRef} className="flex h-full w-[25%] min-w-0 items-center">
            
            <span
              className={cn(
                "line-clamp-1 inline-block text-nowrap px-1 font-geistSemiBold text-[12px]",
                tokenColumnWidth > 100 && "text-[15px]",
                tokenColumnWidth < 100 && "text-[14px]",
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

        {/* Maker column with ref */}
        {selectedTableColumns.find((col) => col === "maker") && (
          <div ref={makerColumnRef} className="flex h-full w-[25%] min-w-0 items-center truncate">
            {isTradeMatchWithExistingTrackedWallet ? (
              <div className="flex min-w-0 items-center gap-x-1 truncate">
                <AddressWithoutEmojis
                  isWithOverview
                  onOpenChange={setIsSorting}
                  isFirst={isBlue}
                  address={truncateString(
                    isTradeMatchWithExistingTrackedWallet?.name || "",
                    14,
                  )}
                  fullAddress={isTradeMatchWithExistingTrackedWallet?.address}
                  className={cn(
                    "truncate !font-geistRegular",
                    makerColumnWidth > 100 && "text-[15px]",
                    makerColumnWidth < 100 && "text-[13px]",
                  )}
                  emojis={
                    isTradeMatchWithExistingTrackedWallet.emoji
                      ? [isTradeMatchWithExistingTrackedWallet.emoji]
                      : []
                  }
                  trackedWalletIcon={
                    isTradeMatchWithExistingTrackedWallet?.emoji
                  }
                  freshWalletFundedInfo={freshWalletFundedInfo}
                  buy={transactionData.type === "buy"}
                  stripClassname="!-bottom-0.5"
                  isWithLink
                />
              </div>
            ) : (
              transaction && (
                <MarkerPanelComponent
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
                    ...(transaction.is_insider ? ["white-anonymous.svg"] : []),
                    ...(transaction.is_sniper ? ["sniper.svg"] : []),
                  ]}
                  circleCount={transaction?.buys + transaction?.sells}
                  isDeveloper={transaction.is_developer}
                  freshWalletFundedInfo={freshWalletFundedInfo}
                />
              )
            )}
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

const TradesCard = memo(
  ({
    index = 2,
    transaction,
    setWalletFilter,
    walletFilter,
    isLoading,
  }: TradesCardProps) => {
    const { remainingScreenWidth } = usePopupStore();
    const isTradesPanelOpen = useTradesPanelStore((state) => state.isOpen);

    const windowWidth = useWindowSizeStore((state) => state.width);
    const isXlDown = windowWidth ? windowWidth < 1280 : false;

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

      return match;
    }, [freshWallets, transaction?.maker]);

    if (isLoading) {
      return <div className="h-full w-full bg-shadeTable"></div>;
    }

    const ViewComponent = DesktopView;
    // isXlDown || remainingScreenWidth < 1200 ? DesktopView : DesktopView;

    return (
      <div
        id="wrapper-trades-card"
        className={cn(
          "w-full flex-shrink-0 items-center overflow-x-clip overscroll-none",
          "flex h-full min-w-max pl-3 pr-0",
          "rounded-[0px] border border-transparent bg-transparent",
          isLoading
            ? "w-full flex-grow animate-pulse bg-shadeTable duration-500"
            : "",
          index % 2 === 0 ? "" : "bg-shadeTable",
          // remainingScreenWidth < 1200 &&
          //   "xl:h-full xl:min-w-full xl:rounded-[8px] xl:border xl:border-border xl:bg-card xl:pl-0",
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
