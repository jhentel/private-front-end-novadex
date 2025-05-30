"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
// ######## APIs 🛜 ########
import { getTraderOverview } from "@/apis/rest/trades";
// ######## Components 🧩 ########
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";

const getFormattedTimeDiff = (timestamp: number, threshold = 0.5) => {
  const now = Math.floor(Date.now() / 1000);
  const normalizedTimestamp =
    String(timestamp).length > 10
      ? Math.floor(timestamp / 1000)
      : Math.floor(timestamp);

  const difference = now - normalizedTimestamp;

  if (difference < 0 || difference < threshold) return "Just Now";
  if (difference < 60) return `${difference.toFixed(0)} Seconds ago`;
  if (difference < 3600) return `${Math.floor(difference / 60)} Minutes ago`;
  if (difference < 86400) {
    const hours = Math.floor(difference / 3600);
    const minutes = Math.floor((difference % 3600) / 60);
    return `${hours} Hours ${minutes} Minutes ago`;
  }
  const days = Math.floor(difference / 86400);
  const hours = Math.floor((difference % 86400) / 3600);
  return `${days} Days ${hours} Hours ago`;
};

const getFundedBy = (address: string) => {
  const exchangeWallets: Record<string, string> = {
    "7FfB2zQRYUQwpPzkRxAeg2mCBGeCRKp4PCEeULJA9xTo": "deBridge",
    H8sMJSCQxfKiFTCfDR3DUMLPwcRbM61LGFJ8N4dK3WjS: "Coinbase",
    GJRs4FwHtemZ5ZE9x3FNvJ8TMwitKTh21yxdRPqn7npE: "Coinbase",
    F37Wb3pqcaYSBGXP7W699XZBqiEwkqVQpkreU9v6Ntkk: "Alex Fund",
    "5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBwuoFbhUvuAi9": "Binance",
    FWznbcNXWQuHTawe9RxvQ2LdCENssh12dsznf4RiouN5: "Kraken",
    AC5RDfQFmDS1deWZos921JfqscXdByf8BKHs5ACWjtW2: "Bybit",
    A77HErqtfN1hLLpvZ9pCtu66FEtM8BveoaKbbMoZ4RiR: "Bitget",
    AeBwztwXScyNNuQCEdhS54wttRQrw3Nj1UtqddzB4C7b: "Robinhood",
    "5VCwKtCXgCJ6kit5FybXjvriW3xELsFDhYrPSqtJNmcD": "OKX",
    G2YxRa6wt1qePMwfJzdXZG62ej4qaTC7YURzuh2Lwd3t: "ChangeNow",
    BmFdpraQhkiDQE6SnfG5omcA1VwzqfXrwtNYBwWTymy6: "Kucoin",
  };

  const match = exchangeWallets[address];

  if (match) {
    return match;
  } else {
    return "Coinbase";
  }
};

const WalletTooltipContent = ({
  children,
  address,
  isWithOverview,
  isOpen,
}: {
  children: React.ReactNode;
  address: string;
  isWithOverview?: boolean;
  isOpen?: boolean;
}) => {
  const params = useParams();
  const { data: traderData, isLoading } = useQuery({
    queryKey: ["trader-overview", address],
    queryFn: () =>
      getTraderOverview(
        address,
        (params?.["mint-address"] || params?.["pool-address"]) as string,
      ),
    enabled: isWithOverview && isOpen,
    retry: 0,
  });

  if (!isWithOverview) {
    return children;
  }

  return (
    <>
      {children}
      <TooltipContent
        align="end"
        side="bottom"
        className="gb__white__popover z-[500] w-[240px] rounded-[8px] border border-border bg-card p-0 text-fontColorSecondary"
      >
        {isLoading ? (
          <div className="flex h-[200px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : traderData ? (
          <div className="flex flex-col text-xs">
            <div className="flex w-full justify-between border-b border-border px-3 py-2">
              <span>Invested</span>
              <span className="text-primary">
                ${traderData.invested_usd.toFixed(2)}
              </span>
            </div>
            <div className="flex w-full justify-between border-b border-border px-3 py-2">
              <span>Sold</span>
              <span className="text-success">
                ${traderData.sold_usd.toFixed(2)}
              </span>
            </div>
            <div className="flex w-full justify-between border-b border-border px-3 py-2">
              <span>Remaining</span>
              <span className="text-fontColorPrimary">
                ${traderData.remaining_usd.toFixed(2)}
              </span>
            </div>
            <div className="flex w-full justify-between border-b border-border px-3 py-2">
              <span>PnL</span>
              <span
                className={
                  traderData.profit_usd >= 0
                    ? "text-success"
                    : "text-destructive"
                }
              >
                ${traderData.profit_usd.toFixed(2)} (
                {traderData.percentage.toFixed(2)}%)
              </span>
            </div>
            <div className="flex w-full justify-between border-b border-border px-3 py-2">
              <span>Type</span>
              <span className="capitalize text-primary">
                {traderData.animal}
              </span>
            </div>
            <div className="flex w-full justify-between border-b border-border px-3 py-2">
              <span>Trades</span>
              <span className="text-fontColorPrimary">
                {traderData.buys} buys, {traderData.sells} sells
              </span>
            </div>
            <div className="flex w-full justify-between px-3 py-2">
              <span>Holder Since</span>
              <span className="text-fontColorPrimary">
                {new Date(traderData.holder_since).toLocaleDateString()}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-3 text-center text-xs text-destructive">
            Failed to load trader data
          </div>
        )}
      </TooltipContent>
    </>
  );
};

const WalletAddress = ({
  href,
  className,
  classNameSpan,
  address,
}: {
  href?: string;
  className: string;
  classNameSpan: string;
  address: string;
}) => {
  return (
    <>
      {href ? (
        <Link
          href={href}
          target="_blank"
          className={className}
          onClick={(e) => e.stopPropagation()}
        >
          <span>{address}</span>
          <span className={classNameSpan} />
        </Link>
      ) : (
        <div className={className}>
          <span>{address}</span>
          <span className={classNameSpan} />
        </div>
      )}
    </>
  );
};


const AddressWithoutEmojis = ({
  address,
  fullAddress,
  // href,
  emojis,
  color = "primary",
  isFirst = false,
  buy,
  walletDefault,
  isWithOverview = false,
  trackedWalletIcon,
  freshWalletFundedInfo,
  className,
  onOpenChange,
  isWithLink,
  stripClassname,
  isUserWallet = false,
}: {
  address: string;
  fullAddress?: string;
  // href: string;
  buy?: boolean;
  isFirst?: boolean;
  walletDefault?: boolean;
  emojis?: string[];
  color?: "primary" | "success" | "destructive";
  isWithOverview?: boolean;
  trackedWalletIcon?: string;
  freshWalletFundedInfo?: {
    wallet: string;
    fundedAmount: string;
    fundedBy: string;
    timestamp: number;
  };
  className?: string;
  onOpenChange?: (isOpen: boolean) => void;
  isWithLink?: boolean;
  stripClassname?: string;
  isUserWallet?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(isOpen);
    }
  }, [isOpen]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        setContainerWidth(entry.contentRect.width);
      });
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="flex w-fit items-center gap-x-1">
      <WalletAddress
        address={address}
        href={
          isWithLink ? `https://solscan.io/account/${fullAddress}` : undefined
        }
        className={cn(
          "relative flex w-fit items-center justify-center text-nowrap font-geistSemiBold",
          containerWidth > 170 && "text-[15px]",
          containerWidth < 170 && "text-[13px]",
          isFirst || isUserWallet
            ? "text-[#66B0FF]"
            : buy
              ? "text-success"
              : walletDefault
                ? "text-primary"
                : "text-destructive",
          trackedWalletIcon && "text-warning",
          className,
        )}
        classNameSpan={cn(
          "absolute bottom-[-2px] w-full border-b border-dashed",
          stripClassname,
          isFirst || isUserWallet
            ? "border-[#66B0FF]"
            : buy
              ? "border-success"
              : walletDefault
                ? "border-primary"
                : "border-destructive",
          trackedWalletIcon && "border-warning",
        )}
      />
    </div>
  );
};

export default React.memo(AddressWithoutEmojis);
