"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import {
  getMostProfitableTokens,
  type ProfitableToken,
} from "@/apis/rest/wallet-trade";
import { useParams } from "next/navigation";
// ######## Components 🧩 ########
import MostProfitableCard from "@/components/customs/cards/wallet-trade/MostProfitableCard";
import HeadCol from "@/components/customs/tables/HeadCol";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/libraries/utils";
import { useTradesWalletModalStore } from "@/stores/token/use-trades-wallet-modal.store";
import { usePopupStore } from "@/stores/use-popup-state";
import { useEffect, useMemo, useRef, useState } from "react";
import { CommonTableProps } from "./TradeHistoryTable";

export default function MostProfitableTable({
  isModalContent = true,
}: CommonTableProps) {
  const { remainingScreenWidth } = usePopupStore();
  const { wallet: walletAddressState, selectedTimeframe } =
    useTradesWalletModalStore();
  const params = useParams();
  const containerRef = useRef<HTMLDivElement>(null);

  // State for data fetching and windowing
  const [isLoading, setIsLoading] = useState(true);
  const [profitableTokens, setProfitableTokens] = useState<ProfitableToken[]>(
    [],
  );
  const [error, setError] = useState<string | null>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });

  // Get wallet address from path params
  const walletAddress = useMemo(() => {
    if (!params) return null;
    if (isModalContent) return walletAddressState;
    return params["wallet-address"] as string;
  }, [params, isModalContent, walletAddressState]);

  // Fetch profitable tokens data
  useEffect(() => {
    let isMounted = true;
    let abortController = new AbortController();

    const fetchProfitableTokens = async () => {
      if (!walletAddress) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await getMostProfitableTokens(
          walletAddress,
          selectedTimeframe,
        );
        if (isMounted && response.data) {
          setProfitableTokens(response.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to fetch profitable tokens",
          );
          setProfitableTokens([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProfitableTokens();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [walletAddress, selectedTimeframe]);

  // Handle scroll for windowing
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const scrollTop = container.scrollTop;
      const itemHeight = 56; // Height of each item in pixels
      const containerHeight = container.clientHeight;

      const start = Math.floor(scrollTop / itemHeight);
      const visibleItems = Math.ceil(containerHeight / itemHeight);
      const end = start + visibleItems + 2; // Add buffer

      setVisibleRange({ start, end });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      handleScroll(); // Initial calculation
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  // Get visible items with memoization
  const visibleItems = useMemo(() => {
    if (!profitableTokens?.length) return [];
    return profitableTokens.slice(visibleRange.start, visibleRange.end);
  }, [profitableTokens, visibleRange]);

  const headerData = [
    {
      label: "Token",
      tooltipContent: "Token Information",
      className: "ml-4 min-w-[220px]",
    },
    {
      label: "Bought",
      tooltipContent: "Invested Information",
      className: "min-w-[80px]",
    },
    {
      label: "Sold",
      tooltipContent: "Sold Information",
      className: "min-w-[80px]",
    },
    {
      label: "P&L",
      tooltipContent: "P&L Information",
      className: "min-w-[120px]",
    },
    {
      label: "P&L %",
      tooltipContent: "P&L % Information",
      className: "min-w-[90px]",
    },
    {
      label: "Share",
      tooltipContent: "Share Information",
      className: "min-w-[140px]",
    },
  ];

  const LoadingSkeleton = () => (
    <div className="flex h-[56px] w-full items-center gap-4 px-4">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
      <div className="ml-auto flex gap-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="flex h-full w-full flex-grow items-center justify-center py-5">
      <p className="text-center font-geistRegular text-sm text-fontColorSecondary">
        No profitable tokens found for this wallet address.
      </p>
    </div>
  );

  return (
    <div className="flex w-full flex-grow flex-col">
      {/* Table headers */}
      <div
        className={cn(
          "z-[9] hidden h-[40px] flex-shrink-0 items-center bg-card md:flex",
          remainingScreenWidth < 700 && !isModalContent && "md:hidden",
        )}
      >
        {headerData.map((item, index) => (
          <HeadCol isWithBorder={false} key={index} {...item} />
        ))}
      </div>
      <div
        ref={containerRef}
        className={cn(
          "relative flex h-full w-full flex-grow flex-col border-t border-border max-md:p-3",
          remainingScreenWidth < 700 && !isModalContent && "md:p-3",
        )}
      >
        {isLoading ? (
          <div
            className={cn(
              "flex h-full w-full flex-col gap-y-2",
              isModalContent && "h-[266px] overflow-y-auto",
            )}
          >
            {Array.from({ length: 10 }).map((_, index) => (
              <LoadingSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="flex h-full w-full items-center justify-center">
            <p className="text-center font-geistRegular text-sm text-destructive">
              {error}
            </p>
          </div>
        ) : !profitableTokens?.length ? (
          <EmptyState />
        ) : (
          <div
            style={{
              position: "relative",
              width: "100%",
              overflowX: "hidden",
              overflowY: "auto",
              scrollbarWidth: "thin",
              scrollbarColor: "#4a4b50 rgba(26, 27, 30, 0.4)",
              // borderRadius: '10px'
            }}
            className={cn(
              "scrollbar scrollbar-w-[5px] scrollbar-track-[#1a1b1e]/40 scrollbar-thumb-[#4a4b50] hover:scrollbar-thumb-[#5a5b60] active:scrollbar-thumb-[#6a6b70]",
              isModalContent
                ? "h-[266px]"
                : "h-[calc(100vh_-_540px)] xl:h-[calc(100vh_-_560px)]",
            )}
          >
            {visibleItems.map((item, index) => {
              const actualIndex = visibleRange.start + index;

              return (
                <div
                  key={`profitable-token-${actualIndex}`}
                  className={cn(
                    "w-full bg-card max-md:mb-2",
                    actualIndex % 2 === 0 ? "bg-white/[4%]" : "",
                  )}
                  style={{ top: `${actualIndex * 56}px` }}
                >
                  <MostProfitableCard
                    isModalContent={isModalContent}
                    data={item}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
