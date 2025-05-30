"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, {
  useCallback,
  useEffect,
  useState,
  useMemo,
  useRef,
} from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useParams } from "next/navigation";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Virtuoso } from "react-virtuoso";
import { CachedImage } from "../../../CachedImage";

// ######## Stores 🏪 ########
import { useTradesTableSettingStore } from "@/stores/table/token/use-trades-table-setting.store";
import { useTokenCardsFilter } from "@/stores/token/use-token-cards-filter.store";
import { useTokenMessageStore } from "@/stores/token/use-token-messages.store";
import { useFilteredWalletTradesStore } from "@/stores/token/use-filtered-wallet-trades";
import { useCurrentTokenDeveloperTradesStore } from "@/stores/token/use-current-token-developer-trades";
import { useTokenCardsFilterStorePersist } from "@/stores/token/use-token-cards-filter-persist.store";
import { useOpenCustomTable } from "@/stores/token/use-open-custom-table";
import { usePopupStore } from "@/stores/use-popup-state";
import { useTokenMarketCapToggleState } from "@/stores/token/use-token-market-cap-toggle.store";
// ######## APIs 🛜 ########
import { getTradesTasks, TransactionType } from "@/apis/rest/trades";
// ######## Components 🧩 ########
import dynamic from "next/dynamic";
import Image from "next/image";
import SortButton from "@/components/customs/SortButton";
import HeadCol from "@/components/customs/tables/HeadCol";
import TradesCard from "@/components/customs/cards/token/TradesCardPanel";
import TradesMakerFilter from "@/components/customs/tables/token/Trades/TradesMakerFilter";
import TradesTypeFilter from "@/components/customs/tables/token/Trades/TradesTypeFilter";
import TradesTotalFilter from "@/components/customs/tables/token/Trades/TradesTotalFilter";
import TradesMarketCapTokenToggle from "@/components/customs/tables/token/Trades/TradesMarketCapTokenToggle";
import WalletTrackerModal from "@/components/customs/modals/WalletTrackerModal";
import { TokenCardLoading } from "@/components/customs/loadings/TokenCardLoading";
import { HiArrowNarrowUp, HiArrowNarrowDown } from "react-icons/hi";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { truncateAddress } from "@/utils/truncateAddress";
// ######## Types 🗨️ ########
import { TokenDataMessageType, TransactionInfo } from "@/types/ws-general";
import { Trade } from "@/types/nova_tv.types";
import { useTokenPersist } from "@/stores/token/use-token-persist.store";

// Constants
const TRADES_LIMIT = 50; // Default limit for non-realtime fetches
const REALTIME_FETCH_LIMIT = 100; // Limit for initial fetch in real-time mode
const MAX_DISPLAY_TRADES = 100; // Max combined trades (fetched + WS) to display in real-time mode

// Loading Component
const LoadingState = ({ text = "Loading..." }: { text?: string }) => {
  return (
    <div className="flex h-[60px] flex-grow items-center justify-center bg-shadeTable px-4 sm:h-[80px]">
      <div className="flex items-center gap-2 text-fontColorPrimary">
        <div className="relative aspect-square h-5 w-5 flex-shrink-0">
          <Image
            src="/icons/search-loading.png"
            alt="Loading Icon"
            fill
            quality={100}
            className="animate-spin object-contain"
          />
        </div>
        <span>{text}</span>
      </div>
    </div>
  );
};

const getTransactionKey = (tx: TransactionInfo): string =>
  `${tx.timestamp}-${tx.maker}-${tx.signature}`;

export default React.memo(function TradesTable({
  initData,
}: {
  initData: TokenDataMessageType | null;
}) {
  const params = useParams();
  const { remainingScreenWidth } = usePopupStore();

  // Component State
  const listRef = useRef<HTMLDivElement>(null);
  const [walletFilter, setWalletFilter] = useState("");
  const [walletFilterTemp, setWalletFilterTemp] = useState<string>(""); // Temp state for filter modal
  const [openWalletMakerFilter, setOpenWalletMakerFilter] = useState(false);

  // Zustand Stores
  const { tradesDate, setTradesDate, tradesType, tradesTotal, resetFilters } =
    useTokenCardsFilter();
  const { tradesValue, tradesTokenSol, setTradesValue, setTradesTokenSol } =
    useTokenPersist();
  const { setTradesDateType, tradesDateType } =
    useTokenCardsFilterStorePersist();
  const tokenMarketCap = useTokenMarketCapToggleState((state) => state.column);
  const setTokenMarketCap = useTokenMarketCapToggleState(
    (state) => state.setColumn,
  );

  const setScrollOffsetValue = useTradesTableSettingStore(
    (state) => state.setScrollOffsetValue,
  );
  const transactionMessages = useTokenMessageStore(
    (state) => state.transactionMessages,
  );
  const developerAddress = useTokenMessageStore(
    (state) => state.dataSecurityMessage.deployer,
  );
  const {
    setFilteredWallet,
    setFilteredWalletTrades,
    resetFilteredWalletTradesState,
  } = useFilteredWalletTradesStore();
  const {
    setCurrentTokenDeveloperTradesMint,
    setCurrentTokenDeveloperTrades,
    resetCurrentTokenDeveloperTradesState,
  } = useCurrentTokenDeveloperTradesStore();
  const { selectedTableColumns } = useOpenCustomTable();

  const [isInitState, setInitState] = useState(true);

  // Derived values
  const mintOrPoolAddress = (params?.["mint-address"] ||
    params?.["pool-address"]) as string;
  const activeTradeTypes = useMemo(
    () =>
      Object.entries(tradesType)
        .filter(([_, isActive]) => isActive)
        .map(([type]) => type) as TransactionType[],
    [tradesType],
  );
  const isRealTimeMode = useMemo(() => tradesDate === "DESC", [tradesDate]);

  // Reset filters on mount
  useEffect(() => {
    resetFilters();
    setScrollOffsetValue(0);
    if (mintOrPoolAddress) {
      setCurrentTokenDeveloperTradesMint(mintOrPoolAddress);
    }
    return () => {
      resetFilteredWalletTradesState();
      resetCurrentTokenDeveloperTradesState();
    };
  }, [mintOrPoolAddress]); // Re-run if address changes

  // --- Data Fetching with useQuery ---
  const queryKey = useMemo(
    () => [
      `trades-${mintOrPoolAddress}`, // Base key
      tradesDate,
      walletFilter,
      tradesTotal,
      activeTradeTypes,
      isRealTimeMode, // Include mode in key to differentiate fetch logic
    ],
    [
      mintOrPoolAddress,
      tradesDate,
      walletFilter,
      tradesTotal,
      activeTradeTypes,
      isRealTimeMode,
    ],
  );

  /* console.log("Query Key:", tradesTotal) */;

  const {
    data: fetchedTransactions, // Renamed data for clarity
    isLoading: isLoadingTrades, // Initial load or load after filter change
    isFetching: isRefetching, // Background refetching (e.g., window focus)
    isError,
    error,
  } = useQuery({
    // Changed to useQuery
    queryKey: queryKey,
    queryFn: async () => {
      // Determine limit based on mode
      const limit = isRealTimeMode ? REALTIME_FETCH_LIMIT : TRADES_LIMIT;
      const offset = 0; // Always fetch from the beginning

      // console.log(
      //   `Fetching trades (Mode: ${isRealTimeMode ? "Real-time" : "Filtered/Sorted"}) - Limit: ${limit}, Offset: ${offset}, Key:`,
      //   queryKey,
      // );

      const res = await getTradesTasks({
        order: tradesDate.toLowerCase() as "asc" | "desc",
        limit: limit,
        offset: offset,
        maker: walletFilter,
        mint: mintOrPoolAddress,
        min_sol: tradesTotal.min,
        max_sol: tradesTotal.max,
        type: activeTradeTypes,
      });

      // Handle potential API error structure
      if (
        typeof res === "object" &&
        res !== null &&
        "success" in res &&
        !(res as { success: boolean }).success &&
        !Array.isArray(res)
      ) {
        console.warn("API Error fetching trades:", res);
        throw new Error("Failed to fetch trades");
      }

      return res as TransactionInfo[];
    },
    // Use initialData only if filters match the initial state AND it's real-time mode
    initialData: () => {
      const isDefaultFilterState =
        !walletFilter &&
        tradesDate === "DESC" && // Only use for default real-time view
        !tradesTotal.min &&
        !tradesTotal.max &&
        activeTradeTypes.length === 0;

      // console.log(
      //   "BALALALAAA⭕⭕⭕",
      //   isDefaultFilterState && initData?.transactions,
      // );
      if (isDefaultFilterState && initData?.transactions) {
        // Return data directly, not the infinite query structure
        return initData.transactions;
      }
      return undefined;
    },
    enabled: !!mintOrPoolAddress, // Only fetch when address is available
    placeholderData: keepPreviousData, // Keep showing old data while refetching on filter change
    refetchOnWindowFocus: false, // Optional: disable window focus refetching
    // Removed: getNextPageParam, initialPageParam
  });

  // --- Combine Fetched Data with Real-time Messages ---
  const displayedTransactions = useMemo(() => {
    const currentFetched = fetchedTransactions?.reverse() ?? [];
    const dataExists =
      currentFetched.length > 0 ||
      transactionMessages.length > 0 ||
      (initData && initData?.transactions?.length > 0);
    if (!dataExists) return [];

    if (isInitState && transactionMessages.length > 0) {
      /* console.log("TRANSACTIONS 🔵 - Init") */;
      setInitState(false);
      const initState =
        (initData?.transactions?.length ? initData.transactions : null) ||
        (transactionMessages?.length ? transactionMessages : null) ||
        [];

      return initState;
    }

    if (isRealTimeMode) {
      /* console.log("TRANSACTIONS 🔵 - Realtime") */;
      const uniqueTransactions = new Map<string, TransactionInfo>();

      // Add fetched transactions (potentially older, will be overwritten by newer WS if key matches)
      currentFetched
        .filter((tx) => {
          if (!tradesType[tx.type as keyof typeof tradesType]) return false;

          if (walletFilter && tx.maker !== walletFilter) return false;

          if (tradesTotal.min > 0 || tradesTotal.max > 0) {
            return (
              tx.sol_amount >= tradesTotal.min &&
              (tradesTotal.max > 0 ? tx.sol_amount <= tradesTotal.max : true)
            );
          } else {
            return true;
          }
        })
        .forEach((tx) => {
          uniqueTransactions.set(getTransactionKey(tx), tx);
        });

      // Add real-time messages first (newest)
      transactionMessages
        .filter((tx) => {
          if (!tradesType[tx.type as keyof typeof tradesType]) return false;

          if (walletFilter && tx.maker !== walletFilter) return false;

          if (tradesTotal.min > 0 || tradesTotal.max > 0) {
            return (
              tx.sol_amount >= tradesTotal.min &&
              (tradesTotal.max > 0 ? tx.sol_amount <= tradesTotal.max : true)
            );
          } else {
            return true;
          }
        })
        .forEach((tx) => {
          uniqueTransactions.set(getTransactionKey(tx), tx);
        });

      let combined = Array.from(uniqueTransactions.values());

      // Sort DESC (newest first) - API should already do this, but good safeguard
      combined.sort((a, b) => {
        // Handle 'first_trade' priority
        // if (a.first_trade && !b.first_trade) return 1;
        // if (!a.first_trade && b.first_trade) return -1;
        // // Handle 'add' type priority within the same timestamp
        // const isSameTimestamp = a.timestamp === b.timestamp;
        // if (isSameTimestamp) {
        //   if (a.type === "add" && b.type !== "add") return 1; // 'add' comes first in DESC
        //   if (b.type === "add" && a.type !== "add") return -1;
        // }
        // Primary sort by timestamp DESC
        return b.timestamp - a.timestamp;
      });

      return combined.slice(0, MAX_DISPLAY_TRADES);
    } else {
      /* console.log("TRANSACTIONS 🔵 - Not realtime") */;

      // For ASC sort or wallet filter, use the fetched data directly.
      // The API call was already made with the correct 'order'.
      // If additional client-side sorting is strictly needed (e.g., complex rules), add it here.
      if (!currentFetched.length) return [];
      /* console.log("im here", currentFetched) */;
      const seenSignatures = new Set<string>();

      return [...currentFetched]
        .filter((tx) => {
          if (seenSignatures.has(tx.signature)) return false;
          seenSignatures.add(tx.signature);

          if (!tradesType[tx.type as keyof typeof tradesType]) return false;

          if (walletFilter && tx.maker !== walletFilter) return false;

          if (tradesTotal.min > 0 || tradesTotal.max > 0) {
            return (
              tx.sol_amount >= tradesTotal.min &&
              (tradesTotal.max > 0 ? tx.sol_amount <= tradesTotal.max : true)
            );
          } else {
            return true;
          }
        })
        .sort((a, b) => {
          // Handle 'first_trade' priority
          if (a.first_trade && !b.first_trade) return -1;
          if (!a.first_trade && b.first_trade) return 1;
          // Handle 'add' type priority within the same timestamp
          const isSameTimestamp = a.timestamp === b.timestamp;
          if (isSameTimestamp) {
            if (a.type === "add" && b.type !== "add") return -1; // 'add' comes first in DESC
            if (b.type === "add" && a.type !== "add") return 1;
          }
          // Primary sort by timestamp DESC
          return a.timestamp - b.timestamp;
        });
    }
  }, [
    isInitState,
    fetchedTransactions,
    transactionMessages,
    isRealTimeMode,
    tradesDate,
    tradesType,
  ]); // Added tradesDate dependency for sorting logic

  // ### A. From Filter Trade => Mark
  useEffect(() => {
    const currentFetched = fetchedTransactions ?? [];
    if (walletFilter && currentFetched.length > 0) {
      setFilteredWallet(walletFilter);
      const walletTrades: Trade[] = currentFetched // Use currentFetched
        .filter((tx) => tx.maker === walletFilter)
        .map((tx) => ({
          average_price_sol: "",
          average_price_usd: "",
          average_sell_price_sol: "",
          average_sell_price_usd: "",
          colour: tx?.type === "buy" ? "blue" : "red",
          letter: tx?.type === "buy" ? "B" : "S",
          price: String(tx?.price ?? 0),
          price_usd: String(tx?.price_usd ?? 0),
          supply: "1000000000",
          signature: tx?.signature,
          token_amount: String(tx?.token_amount ?? 0),
          timestamp: tx?.timestamp,
          wallet: tx?.maker,
          imageUrl: `/icons/token/actions/${tx?.animal}.svg`,
        }));
      setFilteredWalletTrades(walletTrades);
    } else if (!walletFilter) {
      // Reset only if filter is cleared
      resetFilteredWalletTradesState();
      setFilteredWallet("");
    }
  }, [
    walletFilter,
    fetchedTransactions, // Depend on fetchedTransactions
    setFilteredWallet,
    setFilteredWalletTrades,
    resetFilteredWalletTradesState,
  ]);

  // ### C. From Developer Trade => Mark
  useEffect(() => {
    if (developerAddress && displayedTransactions.length > 0) {
      const developerTrades: Trade[] = displayedTransactions
        .filter((tx) => tx.is_developer && tx.maker === developerAddress)
        .map((tx) => ({
          average_price_sol: "",
          average_price_usd: "",
          average_sell_price_sol: "",
          average_sell_price_usd: "",
          colour: tx?.type === "buy" ? "green" : "red",
          letter: tx?.type === "buy" ? "DB" : "DS",
          price: String(tx?.price ?? 0),
          price_usd: String(tx?.price_usd ?? 0),
          supply: "1000000000",
          signature: tx?.signature,
          token_amount: String(tx?.token_amount ?? 0),
          timestamp: tx?.timestamp,
          wallet: tx?.maker,
        }));
      if (developerTrades.length > 0) {
        // console.log("DTM | Processed Developer Trades 🟢", developerTrades);
        setCurrentTokenDeveloperTrades(developerTrades);
      } else {
        // console.log("DTM | Processed Developer Trades 🔴", developerTrades);
      }
    } else {
      resetCurrentTokenDeveloperTradesState();
    }
  }, [
    developerAddress,
    displayedTransactions,
    setCurrentTokenDeveloperTrades,
    resetCurrentTokenDeveloperTradesState,
  ]);

  // --- Event Handlers ---
  const handleSortOrderChange = useCallback(() => {
    setTradesDate(tradesDate === "ASC" ? "DESC" : "ASC");
    // Changing tradesDate updates queryKey, useQuery handles refetch
  }, [tradesDate, setTradesDate]);

  const handleWalletFilterChange = useCallback(
    (newWalletFilter: string) => {
      setWalletFilter(newWalletFilter);
      setScrollOffsetValue(0);
      // Changing walletFilter updates queryKey, useQuery handles refetch
    },
    [setScrollOffsetValue], // Removed queryClient/queryKey dependency as it's implicit
  );

  // --- Render Logic ---
  // Use isLoadingTrades for initial/filter loading, isRefetching for background updates
  const isLoading = isLoadingTrades || isRefetching;
  const setIsPaused = useTradesTableSettingStore((state) => state.setIsPaused);
  const isSorting = useTradesTableSettingStore((state) => state.isSorting);
  const scrollOffsetValue = useTradesTableSettingStore(
    (state) => state.scrollOffsetValue,
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!listRef.current) return;

      const rect = listRef.current.getBoundingClientRect();
      const isCursorInside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      if (!isCursorInside) {
        if (scrollOffsetValue > 0 || isSorting) return;
        setIsPaused(false);
      } else {
        setIsPaused(true);
      }
    },
    [scrollOffsetValue, isSorting, setIsPaused],
  );

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseMove]);

  const calendarSVG = useMemo(() => {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8Z"
          fill="white"
          fillOpacity="0.16"
        />
        <path
          d="M11.5315 7.96851H4.46875V11.5002L4.479 11.6042C4.49943 11.7063 4.54933 11.8013 4.62402 11.876C4.72359 11.9755 4.85895 12.0312 4.99976 12.0312H10.9998C11.1405 12.0312 11.2759 11.9755 11.3755 11.876C11.4751 11.7764 11.5314 11.6411 11.5315 11.5002V7.96851ZM7 9.03125C7.25888 9.03125 7.46875 9.24112 7.46875 9.5V10.4998C7.46875 10.7586 7.25888 10.9685 7 10.9685H6.00024C5.74136 10.9685 5.53149 10.7586 5.53149 10.4998V9.5C5.53149 9.24112 5.74136 9.03125 6.00024 9.03125H7ZM6.46899 10.031H6.53125V9.96875H6.46899V10.031ZM9.53125 5.50024V4.96851H6.46899V5.50024C6.46886 5.75893 6.25893 5.96886 6.00024 5.96899C5.74144 5.96899 5.53163 5.75902 5.53149 5.50024V4.96851H4.99976C4.85895 4.96857 4.72359 5.02494 4.62402 5.12451C4.52455 5.22412 4.46875 5.35946 4.46875 5.50024V7.03101H11.5315V5.50024C11.5315 5.35935 11.4751 5.22414 11.3755 5.12451C11.3007 5.04969 11.206 4.99912 11.1038 4.97876L10.9998 4.96851H10.4688V5.50024C10.4686 5.75902 10.2588 5.96899 10 5.96899C9.7412 5.96899 9.53138 5.75902 9.53125 5.50024ZM12.469 11.5002C12.4689 11.8897 12.3137 12.2634 12.0383 12.5388C11.7629 12.8141 11.3892 12.9688 10.9998 12.9688H4.99976C4.61031 12.9687 4.23657 12.8142 3.96118 12.5388C3.72019 12.2978 3.57198 11.9815 3.53857 11.6453L3.53125 11.5002V5.50024C3.53125 5.11082 3.68589 4.73709 3.96118 4.46167C4.23657 4.18628 4.61031 4.03107 4.99976 4.03101H5.53149V3.5C5.53149 3.24112 5.74136 3.03125 6.00024 3.03125C6.25902 3.03138 6.46899 3.2412 6.46899 3.5V4.03101H9.53125V3.5C9.53125 3.24112 9.74112 3.03125 10 3.03125C10.2589 3.03125 10.4688 3.24112 10.4688 3.5V4.03101H10.9998L11.1455 4.03833C11.4816 4.07178 11.7974 4.22073 12.0383 4.46167C12.3138 4.73711 12.469 5.11071 12.469 5.50024V11.5002Z"
          fill="#FCFCFD"
        />
      </svg>
    );
  }, []);

  const ageSVG = useMemo(() => {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_0_4331)">
          <path
            d="M7.81641 2.56861C7.95329 2.51033 8.11144 2.52006 8.24121 2.5979L10.741 4.0979C10.8822 4.18262 10.9688 4.33535 10.9688 4.5V6.98438L13.2415 8.34815C13.3825 8.43289 13.4685 8.58569 13.4685 8.75025V11.4998C13.4685 11.6643 13.3825 11.8171 13.2415 11.9019L10.741 13.4019C10.5926 13.4908 10.4074 13.4908 10.259 13.4019L7.99951 12.0461L5.74146 13.4019C5.59301 13.4909 5.40723 13.4909 5.25879 13.4019L2.75903 11.9019C2.61784 11.8171 2.53125 11.6644 2.53125 11.4998V8.75025C2.53125 8.58559 2.61784 8.43286 2.75903 8.34815L5.03101 6.98438V4.51465C5.03101 4.509 5.03227 4.50341 5.03247 4.49781C5.03337 4.3395 5.11312 4.18531 5.25879 4.0979L7.75854 2.5979L7.81641 2.56861ZM3.46875 9.01465V11.2346L5.49976 12.4534L7.53149 11.2346V9.01465L5.49976 7.7959L3.46875 9.01465ZM8.46899 9.01465V11.2346L10.5 12.4534L12.531 11.2346V9.01465L10.5 7.7959L8.46899 9.01465ZM5.96851 4.76514V6.98438L7.99951 8.20313L10.0312 6.98438V4.76514L7.99951 3.54639L5.96851 4.76514Z"
            fill="#9191A4"
          />
        </g>
      </svg>
    );
  }, []);

  const valueSVG = useMemo(() => {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 10H7.5C6.17392 10 4.90215 9.47322 3.96447 8.53554C3.02678 7.59785 2.5 6.32608 2.5 5V3.33334H5C6.32608 3.33334 7.59785 3.86012 8.53553 4.7978C9.47322 5.73548 10 7.00725 10 8.33334V16.6667M10 11.6667C10 10.3406 10.5268 9.06882 11.4645 8.13114C12.4021 7.19345 13.6739 6.66667 15 6.66667H17.5V7.5C17.5 8.82608 16.9732 10.0979 16.0355 11.0355C15.0979 11.9732 13.8261 12.5 12.5 12.5H10"
          stroke="#9191A4"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }, []);

  const amountSVG = useMemo(() => {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 4V16H16M16 4L12 5M11.4089 6.43335L13.2562 8.89668M12.6667 10.3333L9.33333 11.6667M6.66667 12C6.66667 12.3536 6.80714 12.6928 7.05719 12.9428C7.30724 13.1929 7.64638 13.3333 8 13.3333C8.35362 13.3333 8.69276 13.1929 8.94281 12.9428C9.19286 12.6928 9.33333 12.3536 9.33333 12C9.33333 11.6464 9.19286 11.3072 8.94281 11.0572C8.69276 10.8071 8.35362 10.6667 8 10.6667C7.64638 10.6667 7.30724 10.8071 7.05719 11.0572C6.80714 11.3072 6.66667 11.6464 6.66667 12ZM9.33333 5.33333C9.33333 5.68696 9.47381 6.02609 9.72386 6.27614C9.97391 6.52619 10.313 6.66667 10.6667 6.66667C11.0203 6.66667 11.3594 6.52619 11.6095 6.27614C11.8595 6.02609 12 5.68696 12 5.33333C12 4.97971 11.8595 4.64057 11.6095 4.39052C11.3594 4.14048 11.0203 4 10.6667 4C10.313 4 9.97391 4.14048 9.72386 4.39052C9.47381 4.64057 9.33333 4.97971 9.33333 5.33333ZM12.6667 10C12.6667 10.3536 12.8071 10.6928 13.0572 10.9428C13.3072 11.1929 13.6464 11.3333 14 11.3333C14.3536 11.3333 14.6928 11.1929 14.9428 10.9428C15.1929 10.6928 15.3333 10.3536 15.3333 10C15.3333 9.64638 15.1929 9.30724 14.9428 9.05719C14.6928 8.80714 14.3536 8.66667 14 8.66667C13.6464 8.66667 13.3072 8.80714 13.0572 9.05719C12.8071 9.30724 12.6667 9.64638 12.6667 10Z"
          stroke="#9191A4"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }, []);

  const makerSVG = useMemo(() => {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6.11111 16H13.8889M5.33333 5.29412L10 4.52941L14.6667 5.29412M5.33333 5.29412L7.66667 9.88235C7.66667 10.4908 7.42083 11.0743 6.98325 11.5045C6.54566 11.9348 5.95217 12.1765 5.33333 12.1765C4.71449 12.1765 4.121 11.9348 3.68342 11.5045C3.24583 11.0743 3 10.4908 3 9.88235L5.33333 5.29412ZM14.6667 5.29412L17 9.88235C17 10.4908 16.7542 11.0743 16.3166 11.5045C15.879 11.9348 15.2855 12.1765 14.6667 12.1765C14.0478 12.1765 13.4543 11.9348 13.0168 11.5045C12.5792 11.0743 12.3333 10.4908 12.3333 9.88235L14.6667 5.29412ZM10 3V16"
          stroke="#9191A4"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Add resize observer to track container width
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // --- Header Configuration ---
  const HeaderData = useMemo(
    () => [
      // Date/Age Column
      {
        label: "",
        valueIdentifier: "date-age",
        className: "min-w-[70px] text-xss",
        tooltipContent: "Switch between time and age display formats",
        sortButtonAfterTooltip: (
          <div className="flex h-[20px] items-center justify-center rounded-[10px] bg-secondary p-1">
            <button
              onClick={() => setTradesDateType("DATE")}
              className={cn(
                "inline-block cursor-pointer rounded-[12px] px-1.5 text-[10px] leading-[14px] text-fontColorPrimary duration-300",
                tradesDateType === "DATE" && "bg-white/10",
              )}
            >
              {containerWidth <= 400 ? calendarSVG : "Time"}
            </button>
            <button
              onClick={() => setTradesDateType("AGE")}
              className={cn(
                "inline-block cursor-pointer rounded-[12px] px-1.5 text-[10px] leading-[14px] text-fontColorPrimary duration-300",
                tradesDateType === "AGE" && "bg-white/10",
              )}
            >
              {containerWidth <= 400 ? ageSVG : "Age"}
            </button>
          </div>
        ),
      },
      // Value Column
      {
        label: "Value",
        valueIdentifier: "value",
        className: "min-w-[75px] text-xss",
        tooltipContent: "Trade value in SOL or USD",
        sortButton: (
          <SortButton
            type="usdc-or-sol"
            value={tradesValue}
            setValue={setTradesValue}
          />
        ),
        iconBefore: valueSVG,
      },
      // Amount Column
      {
        label: "Amount",
        valueIdentifier: "amount-of-tokens",
        className: "min-w-[70px] text-xss",
        tooltipContent: "Number of tokens traded",
        sortButton: (
          <TradesMarketCapTokenToggle
            value={tokenMarketCap}
            setValue={setTokenMarketCap}
          />
        ),
        iconBefore: amountSVG,
      },
      // Maker Column
      {
        label: "Maker",
        valueIdentifier: "maker",
        className: "min-w-[90px] text-xss",
        tooltipContent: "Wallet address that initiated the trade",
        iconBefore: makerSVG,
      },
    ],
    [
      containerWidth,
      tradesDateType,
      setTradesDateType,
      tradesValue,
      setTradesValue,
      tokenMarketCap,
      setTokenMarketCap,
      calendarSVG,
      ageSVG,
      valueSVG,
      amountSVG,
      makerSVG,
    ],
  );

  // --- Render Logic ---
  // Use isLoadingTrades for initial/filter loading, isRefetching for background updates
  const isEmpty =
    !isLoading && !isRefetching && displayedTransactions.length === 0;

  // console.log("FETCHED TRANSACTIONS", {
  //   initLength: initData?.transactions,
  //   fetchedLength: fetchedTransactions?.length,
  //   transactionLength: transactionMessages.length,
  //   displayedLength: displayedTransactions,
  //   isLoading,
  // });

  const isPaused = useTradesTableSettingStore((state) => state.isPaused);

  return (
    <>
      <div
        ref={containerRef}
        className="relative hidden h-full w-full flex-grow flex-col overflow-x-hidden overscroll-none md:flex md:pb-0"
      >
        {/* Filter controls */}
        <div className="flex w-full items-center gap-x-2 bg-secondary px-4 py-2">
          <div className="relative aspect-square h-5 w-5 flex-shrink-0">
            <Image
              src={`/icons/token/tabs/inactive-trades.png`}
              alt={`trades Icon`}
              fill
              quality={50}
              className="object-contain"
            />
          </div>
          <span className="whitespace-nowrap text-nowrap font-geistSemiBold text-sm text-fontColorSecondary">
            Trades
          </span>
          {containerWidth && containerWidth > 1024 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                    <CachedImage
                      src="/icons/info-tooltip.png"
                      alt="Info Icon"
                      fill
                      quality={50}
                      className="object-contain"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Latest Trades on this Token</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Add paused indicator */}
          <div className="relative ml-auto flex items-center gap-x-2">
            <div
              className={cn(
                "flex h-[20px] items-center gap-x-0.5 rounded-[4px] bg-success/20",
                isPaused ? "flex" : "hidden",
              )}
            >
              <div className="relative aspect-square h-5 w-5 flex-shrink-0">
                <Image
                  src="/icons/paused.png"
                  alt="Pause Icon"
                  fill
                  quality={50}
                  className="object-contain"
                />
              </div>
              <span
                className={cn(
                  "font-geistSemiBold text-sm text-success",
                  containerWidth && containerWidth <= 1960 && "hidden",
                )}
              >
                Paused
              </span>
            </div>
          </div>
        </div>

        {/* Wallet filter header */}
        {walletFilter && (
          <div className="flex w-full flex-shrink-0 items-center justify-center gap-x-2 bg-secondary p-3 text-fontColorPrimary">
            {/* Show loading only when actively loading this specific filter */}
            {isLoading ? (
              <>Loading trades for ${truncateAddress(walletFilter)}...</>
            ) : (
              <>
                {/* Display count from fetchedTransactions when filtered */}
                Showing {displayedTransactions?.length ?? 0} trades for{" "}
                {truncateAddress(walletFilter)}
                <button
                  onClick={() => handleWalletFilterChange("")} // Use handler to clear
                  className="text-primary hover:text-primary/80"
                  aria-label="Reset wallet filter"
                >
                  Reset
                </button>
              </>
            )}
          </div>
        )}

        {/* Main content */}
        <div className="relative h-full w-full flex-grow overflow-x-hidden overscroll-none">
          <div className="absolute inset-0 flex flex-col">
            {/* Table headers */}
            <div className="sticky top-0 z-[9] flex h-[30px] w-full flex-shrink-0 overscroll-none border-b border-border bg-[#080811]">
              <div className="flex w-full items-center px-2">
                {HeaderData.map((item, index) => {
                  const isActive = selectedTableColumns.find(
                    (col) => col === item.valueIdentifier,
                  );
                  if (!isActive) return null;

                  return (
                    <HeadCol
                      key={index}
                      label={
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-x-1">
                                {item.iconBefore}
                                {containerWidth > 470 && <span>{item.label}</span>}
                              </div>
                            </TooltipTrigger>
                            {item.tooltipContent && (
                              <TooltipContent>
                                <p>{item.tooltipContent}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      }
                      className={item.className}
                      sortButton={item.sortButton}
                      sortButtonAfterTooltip={item.sortButtonAfterTooltip}
                    />
                  );
                })}
              </div>
            </div>

            <div
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => {
                if (scrollOffsetValue > 0) return;
                setIsPaused(false);
              }}
              ref={listRef}
              className={cn(
                "flex-grow overflow-y-auto overflow-x-hidden overscroll-none pb-[5px]",
                // containerWidth <= 1024 ? "p-3" : "p-0"
              )}
            >
              {/* Virtuoso list - Adjust height settings */}
              {(() => {
                if (displayedTransactions.length > 0) {
                  return (
                    <Virtuoso
                      totalCount={100}
                      initialItemCount={10}
                      fixedItemHeight={36}
                      data={displayedTransactions}
                      style={{ height: "100%" }}
                      overscan={200}
                      itemContent={(index: number, transaction) => (
                        <div
                          key={`${transaction?.timestamp}-${transaction?.maker}-${transaction?.signature}-${index}`}
                          className={cn(
                            "group relative",
                            "h-9",
                            "hover:bg-white/5",
                            "transition-colors duration-200",
                            // containerWidth < 1024 && "mb-2 xl:mb-2",
                          )}
                        >
                          <div className="absolute inset-0">
                            <TradesCard
                              index={index}
                              transaction={transaction}
                              walletFilter={walletFilter}
                              setWalletFilter={handleWalletFilterChange}
                            />
                          </div>
                        </div>
                      )}
                      components={{
                        Footer: () => {
                          if (
                            !isRealTimeMode &&
                            !isLoading &&
                            !isRefetching &&
                            displayedTransactions.length > 0
                          ) {
                            return (
                              <div className="p-4 text-center text-fontColorSecondary">
                                Showing first {displayedTransactions.length}{" "}
                                trades.
                              </div>
                            );
                          }

                          return null;
                        },
                      }}
                    />
                  );
                }

                if (isError) {
                  const errorMessage =
                    error instanceof Error
                      ? error.message
                      : String(error) || "Unknown error";

                  return (
                    <div className="flex h-full items-center justify-center text-red-500">
                      Error loading trades: {errorMessage}
                    </div>
                  );
                }

                if (isEmpty) {
                  return (
                    <div className="flex h-full items-center justify-center text-fontColorSecondary">
                      No trades found matching your criteria.
                    </div>
                  );
                }
                return <LoadingState text="Loading trades..." />;
              })()}
            </div>
          </div>
        </div>
      </div>

      <WalletTrackerModal />
    </>
  );
});
