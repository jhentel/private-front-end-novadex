"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
// ######## Components 🧩 ########
import DeployedTokensCard from "@/components/customs/cards/wallet-trade/DeployedTokensCard";
import HeadCol from "@/components/customs/tables/HeadCol";
import { Skeleton } from "@/components/ui/skeleton";
// ######## Utils & Helpers 🤝 ########
import { getDeployedTokens } from "@/apis/rest/wallet-trade";
import { cn } from "@/libraries/utils";
import { useTradesWalletModalStore } from "@/stores/token/use-trades-wallet-modal.store";
import { usePopupStore } from "@/stores/use-popup-state";
import { CommonTableProps } from "./TradeHistoryTable";

interface Exchange {
  name: string;
  address: string;
}

interface DeployedToken {
  address: string;
  createdAt: number;
  dex: string;
  decimals: number;
  image: string | null;
  liquidity: string;
  name: string;
  networkId: number;
  launchpad: string;
  holders: number;
  priceUSD: string;
  symbol: string;
  progressPct: number;
  supply: string;
  pnlSol: number | null;
  origin_dex: string;
  marketCap: string;
  exchanges: Exchange[];
}

interface DeployedTokensResponse {
  data: {
    walletAddress: string;
    count: number;
    page: number;
    results: DeployedToken[];
  };
}

export interface TransformedDeployedTokenData {
  token: {
    symbol: string;
    name: string;
    image: string | null;
    mint: string;
  };
  createdAt: number;
  marketCap: string;
  holders: number;
  pnlSol: number | null;
  priceUSD: string;
  liquidity: string;
  progressPct: number;
}

// Transform API data to match DeployedTokensCard requirements
const transformDeployedTokenData = (data: DeployedToken) => ({
  token: {
    symbol: data.symbol,
    name: data.name,
    image: data.image,
    mint: data.address,
  },
  createdAt: data.createdAt,
  marketCap: data.marketCap,
  holders: data.holders,
  pnlSol: data.pnlSol,
  priceUSD: data.priceUSD,
  liquidity: data.liquidity,
  progressPct: data.progressPct,
});

const LoadingSkeleton = () => (
  <div className="flex h-[56px] w-full items-center gap-x-4 px-4">
    <div className="flex items-center gap-x-2">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex flex-col gap-y-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
    <Skeleton className="h-4 w-20" />
    <Skeleton className="h-4 w-20" />
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-4 w-20" />
  </div>
);

const EmptyState = () => (
  <div className="flex h-full w-full flex-grow items-center justify-center py-5">
    <p className="text-center font-geistRegular text-sm text-fontColorSecondary">
      No deployed tokens found for this wallet address.
    </p>
  </div>
);

const HeaderData = [
  {
    label: "Created",
    tooltipContent: "Token Information",
    className: "min-w-[80px]",
  },
  {
    label: "Market Cap",
    tooltipContent: "Market Cap Information",
    className: "min-w-[125px]",
  },
  {
    label: "Holders",
    tooltipContent: "Holders Information",
    className: "min-w-[125px]",
  },
  {
    label: "P&L",
    tooltipContent: "P&L Information",
    className: "min-w-[150px]",
  },
  {
    label: "Bonding curve progress",
    tooltipContent: "Bonding curve progress Information",
    className: "min-w-[245px]",
  },
];

export default function DeployedTokensTable({
  isModalContent = true,
}: CommonTableProps) {
  const { remainingScreenWidth } = usePopupStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const { wallet: walletAddressState } = useTradesWalletModalStore();

  // State for data fetching
  const [isLoading, setIsLoading] = useState(true);
  const [deployedTokensData, setDeployedTokensData] = useState<DeployedToken[]>(
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

  // Fetch deployed tokens data
  useEffect(() => {
    let isMounted = true;

    const fetchDeployedTokens = async () => {
      if (!walletAddress) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await getDeployedTokens(walletAddress);
        if (isMounted && response.data.results) {
          setDeployedTokensData(response.data.results);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to fetch deployed tokens",
          );
          setDeployedTokensData([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDeployedTokens();

    return () => {
      isMounted = false;
    };
  }, [walletAddress]);

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

  // Get visible items
  const visibleItems = useMemo(() => {
    if (!deployedTokensData?.length) return [];
    return deployedTokensData.slice(visibleRange.start, visibleRange.end);
  }, [deployedTokensData, visibleRange]);

  return (
    <div className="flex w-full flex-grow flex-col">
      {/* Table headers */}
      <div
        className={cn(
          "z-[9] hidden h-[40px] flex-shrink-0 items-center bg-card px-4 md:flex",
          remainingScreenWidth < 700 && !isModalContent && "md:hidden",
        )}
      >
        {HeaderData.map((item, index) => (
          <HeadCol isWithBorder={false} key={index} {...item} />
        ))}
      </div>
      <div
        ref={containerRef}
        className={cn(
          "relative flex h-full w-full flex-grow flex-col overflow-auto max-md:p-3",
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
              <div
                key={`loading-skeleton-${index}`}
                className={cn(
                  "bg-card max-md:mb-2",
                  index % 2 === 0 ? "bg-white/[4%]" : "",
                )}
              >
                <LoadingSkeleton />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex h-full w-full items-center justify-center">
            <p className="text-center font-geistRegular text-sm text-destructive">
              {error}
            </p>
          </div>
        ) : !deployedTokensData?.length ? (
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
              //            borderRadius: '10px'
            }}
            className={cn(
              "scrollbar scrollbar-w-[5px] scrollbar-track-[#1a1b1e]/40 scrollbar-thumb-[#4a4b50] hover:scrollbar-thumb-[#5a5b60] active:scrollbar-thumb-[#6a6b70]",
              isModalContent
                ? "h-[266px]"
                : "h-[calc(100vh_-_540px)] xl:h-[calc(100vh_-_560px)]",
            )}
          >
            {visibleItems.map((token, index) => {
              const actualIndex = visibleRange.start + index;
              const transformedData = transformDeployedTokenData(token);

              return (
                <div
                  key={`deployed-token-${actualIndex}`}
                  className={cn(
                    "w-full bg-card max-md:mb-2",
                    actualIndex % 2 === 0 ? "bg-white/[4%]" : "",
                  )}
                  style={{ top: `${actualIndex * 56}px` }}
                >
                  <DeployedTokensCard
                    isModalContent={isModalContent}
                    data={transformedData}
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
