"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
// ######## Components 🧩 ########
import Image from "next/image";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
// ######## APIs 🛜 ########
import { getSimilarTokens } from "@/apis/rest/tokens";
import { getMarketCapColor } from "@/utils/getMarketCapColor";
import { formatRelativeTime, formatTime } from "@/utils/formatTime";
import { getProxyUrl } from "@/utils/getProxyUrl";

interface SimilarTokenUIProps {
  tokenSymbol: string;
}

export default function SimilarTokens({ tokenSymbol }: SimilarTokenUIProps) {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: similarTokens, isLoading } = useQuery({
    queryKey: ["similar-tokens", tokenSymbol],
    queryFn: () => getSimilarTokens(tokenSymbol),
    enabled: !!tokenSymbol,
  });

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  // Copy token name to clipboard
  const copyToClipboard = (text: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedToken(text);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => setCopiedToken(null), 2000);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <motion.div
      animate={isOpen ? "open" : "closed"}
      className="h-auto w-full rounded-[8px] border border-border"
    >
      <div
        onClick={handleToggle}
        className={cn(
          "group relative flex h-[56px] w-full cursor-pointer items-center justify-between rounded-t-[8px] border-b border-border bg-white/[4%] px-4",
          !isOpen && "rounded-b-[8px] border-transparent",
        )}
      >
        <span className="relative z-20 inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
          Similar Tokens
        </span>

        <div className="relative aspect-square h-6 w-6 flex-shrink-0 cursor-pointer">
          <Image
            src="/icons/pink-chevron-down.png"
            alt="Pink Accordion Icon"
            fill
            quality={100}
            className={`object-contain transition-transform duration-300 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col">
              {isLoading ? (
                <div className="flex h-[72px] w-full items-center justify-center px-4 py-3">
                  <span className="text-fontColorSecondary">
                    Loading similar tokens...
                  </span>
                </div>
              ) : similarTokens && similarTokens.length > 0 ? (
                similarTokens.map((token, index) => {
                  const generateTokenUrl = () => {
                    if (!token?.mint) return "#";

                    const params = new URLSearchParams({
                      symbol: token?.symbol || "",
                      name: token?.name || "",
                      image: token?.image || "",
                      twitter: "",
                      website: "",
                      telegram: "",
                      market_cap_usd: "",
                      liquidity_usd: "",
                      progress: "",
                      dex: token?.dex || "",
                      origin_dex: "",
                      liquidity_sol: "",
                    });

                    return `/token/${token.mint}?${params.toString()}`;
                  };

                  const imageSrc = getProxyUrl(
                    token.image as string,
                    token.symbol?.[0] || "",
                  );

                  return (
                    <Link key={token.mint} href={generateTokenUrl()}>
                      <div
                        className={cn(
                          "flex h-[72px] w-full cursor-pointer items-center justify-between px-4 py-3 hover:bg-white/[4%]",
                          index !== similarTokens.length - 1 &&
                            "border-b border-border/50",
                        )}
                      >
                        <div className="flex max-w-[70%] items-center gap-x-3">
                          <div className="flex w-full flex-col overflow-hidden">
                            <div className="flex items-center gap-x-2">
                              <div className="relative aspect-square h-[20px] w-[20px] flex-shrink-0 overflow-hidden rounded-full">
                                <Image
                                  src={imageSrc as string}
                                  alt={`${token.name} Token Icon`}
                                  fill
                                  quality={100}
                                  className="object-cover"
                                />
                              </div>
                              <span className="flex-shrink-0 font-geistSemiBold text-[14px] text-fontColorPrimary">
                                {token.symbol}
                              </span>
                              {token.name && (
                                <div className="flex min-w-0 items-center">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="max-w-[80px] truncate text-[14px] text-fontColorSecondary">
                                          {token.name}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>{token.name}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={(e) =>
                                            copyToClipboard(token.name, e)
                                          }
                                          className="ml-1 flex h-4 w-4 flex-shrink-0 items-center justify-center"
                                        >
                                          <svg
                                            width="12"
                                            height="12"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="text-fontColorSecondary hover:text-fontColorPrimary"
                                          >
                                            <path
                                              d="M16 12.9V17.1C16 20.6 14.6 22 11.1 22H6.9C3.4 22 2 20.6 2 17.1V12.9C2 9.4 3.4 8 6.9 8H11.1C14.6 8 16 9.4 16 12.9Z"
                                              stroke="currentColor"
                                              strokeWidth="1.5"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            />
                                            <path
                                              d="M22 6.9V11.1C22 14.6 20.6 16 17.1 16H16V12.9C16 9.4 14.6 8 11.1 8H8V6.9C8 3.4 9.4 2 12.9 2H17.1C20.6 2 22 3.4 22 6.9Z"
                                              stroke="currentColor"
                                              strokeWidth="1.5"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            />
                                          </svg>
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>
                                          {copiedToken === token.name
                                            ? "Copied!"
                                            : "Copy token name"}
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              )}
                            </div>
                            <span className="truncate text-[14px] text-fontColorSecondary">
                              Last TX:{" "}
                              {formatRelativeTime(token.lastTrade * 1000)}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end">
                          <span className="text-[14px] text-success">
                            {formatRelativeTime(token.createdAt * 1000)}
                          </span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span
                                  className={`max-w-[100px] truncate text-right font-geistSemiBold text-[14px] ${getMarketCapColor(token.marketCap)}`}
                                >
                                  {token.marketCap}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{token.marketCap}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="flex h-[72px] w-full items-center justify-center px-4 py-3">
                  <span className="text-fontColorSecondary">
                    No similar tokens found
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
