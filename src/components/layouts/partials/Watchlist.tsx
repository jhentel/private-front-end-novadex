"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useState, useMemo, useEffect } from "react";
import { useWatchlistTokenStore } from "@/stores/use-watchlist-token.store";
import toast from "react-hot-toast";
// ######## Components 🧩 #########
import Link from "next/link";
import Image from "next/image";
import CustomToast from "@/components/customs/toasts/CustomToast";
// ######## Types 🗨️ ########
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { truncateString } from "@/utils/truncateString";
import { formatAmountDollar } from "@/utils/formatAmount";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchWatchlist,
  removeFromWatchlist,
  WatchlistToken,
} from "@/apis/rest/watchlist";

export const IMAGE_PROXY_URL =
  process.env.NEXT_PUBLIC_IMAGE_PROXY_URL ||
  "https://nova-image-proxy.vercel.app";
const MAX_RETRIES = 10;

const WatchlistItem = React.memo(
  ({ image, symbol, marketCap, pnl, mint }: WatchlistToken) => {
    const queryClient = useQueryClient();
    const removeFromWatchlistMutation = useMutation({
      mutationFn: removeFromWatchlist,
      onSuccess: () => {
        toast.custom((t: any) => (
          <CustomToast
            tVisibleState={t.visible}
            message="Removed from Watchlist"
            state="SUCCESS"
          />
        ));
        queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      },
      onError: (error: Error) => {
        toast.custom((t: any) => (
          <CustomToast
            tVisibleState={t.visible}
            message={error.message}
            state="ERROR"
          />
        ));
      },
    });

    const handleRemove = (mint: string) => {
      removeFromWatchlistMutation.mutate(mint);
    };

    const [retryCount, setRetryCount] = useState(0);

    const imageSrc = useMemo(() => {
      if (!image) return null;

      if (retryCount >= MAX_RETRIES || image?.toLowerCase()?.includes("base64"))
        return image;

      return `${IMAGE_PROXY_URL}/proxy?url=${encodeURIComponent(image)}`;
    }, [image]);

    useEffect(() => {
      return () => {
        if (image) {
          const img = document.createElement("img");
          img.src = "";
          URL.revokeObjectURL(image);
        }
      };
    }, [image]);

    return (
      <div className="group flex w-auto flex-shrink-0 items-center justify-center gap-x-1 rounded-[4px] bg-[#17171F] py-0.5 pl-0.5 pr-1 transition-all duration-200 ease-in-out">
        <Link href={`/token/${mint}`} prefetch className="flex gap-x-1">
          <div className="relative aspect-square h-4 w-4 flex-shrink-0 overflow-hidden rounded-full">
            <Image
              key={`${imageSrc}-${retryCount >= MAX_RETRIES ? "proxy" : "direct"}-${retryCount}`}
              src={imageSrc as string}
              alt="Token Watchlist Image"
              fill
              quality={50}
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              className="object-contain"
              onError={() =>
                retryCount < MAX_RETRIES && setRetryCount((prev) => prev + 1)
              }
            />
          </div>
          <span className="font-geistMonoLight text-xs text-fontColorPrimary">
            ${truncateString(symbol, 5)}
          </span>
        </Link>
        <span className="font-geistMonoLight text-xs text-fontColorSecondary">
          {formatAmountDollar(Number(marketCap))}
        </span>
        <span
          className={cn(
            "font-geistMonoLight text-xs",
            pnl > 0 ? "text-success" : "text-destructive",
          )}
        >
          {pnl > 0 ? "+" : "-"}
          {pnl.toFixed(2)}%
        </span>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="w-0 scale-0 cursor-pointer opacity-0 transition-all duration-200 ease-in-out group-hover:w-4 group-hover:scale-100 group-hover:opacity-100"
          onClick={() => handleRemove(mint)}
        >
          <path
            d="M8.86266 2.00066C9.61657 2.00077 10.2279 2.61196 10.2279 3.36589V3.94109H12.8861C13.0448 3.94109 13.1742 4.06946 13.1742 4.2282V4.80339C13.174 4.96198 13.0447 5.0905 12.8861 5.0905H12.2924L11.809 11.7809C11.7886 12.0635 11.7713 12.3089 11.7406 12.5104C11.7081 12.7239 11.6548 12.9347 11.5394 13.1354C11.3664 13.4365 11.106 13.6779 10.7933 13.8288C10.5848 13.9294 10.3709 13.968 10.1556 13.985C9.95243 14.0011 9.70652 14.0007 9.42321 14.0007H6.57653C6.2931 14.0007 6.04736 14.0011 5.84411 13.985C5.62882 13.968 5.41493 13.9294 5.20641 13.8288C4.89384 13.6779 4.63429 13.4363 4.4613 13.1354C4.34589 12.9347 4.29264 12.724 4.26012 12.5104C4.22944 12.3089 4.21119 12.0636 4.19079 11.7809L3.70837 5.0905H3.11364C2.95516 5.09033 2.82671 4.96187 2.82653 4.80339V4.2282C2.82653 4.06957 2.95505 3.94126 3.11364 3.94109H5.77282V3.36589C5.77284 2.61189 6.38405 2.00066 7.13805 2.00066H8.86266ZM6.77868 6.81511C6.61994 6.81511 6.49157 6.94348 6.49157 7.10222V10.5514C6.49166 10.7101 6.62 10.8386 6.77868 10.8386H7.20934C7.36803 10.8386 7.49734 10.7101 7.49743 10.5514V7.10222C7.49743 6.94348 7.36808 6.81511 7.20934 6.81511H6.77868ZM8.7904 6.81511C8.63175 6.81522 8.50329 6.94355 8.50329 7.10222V10.5514C8.50338 10.71 8.63181 10.8384 8.7904 10.8386H9.22204C9.38058 10.8384 9.50906 10.71 9.50915 10.5514V7.10222C9.50915 6.94358 9.38064 6.81528 9.22204 6.81511H8.7904ZM7.13805 3.00652C6.93964 3.00652 6.7787 3.16748 6.77868 3.36589V3.94109H9.22204V3.36589C9.22202 3.16755 9.06098 3.00663 8.86266 3.00652H7.13805Z"
            fill="#FCFCFD"
          />
        </svg>
      </div>
    );
  },
);
WatchlistItem.displayName = "WatchlistItem";

export default function Watchlist() {
  const watchlistToken = useWatchlistTokenStore(
    (state) => state.watchlistToken,
  );
  const setWatchlistToken = useWatchlistTokenStore(
    (state) => state.setWatchlistToken,
  );
  const setOldestTokenMint = useWatchlistTokenStore(
    (state) => state.setOldestTokenMint,
  );

  useQuery({
    queryKey: ["watchlist"],
    queryFn: async () => {
      const res = await fetchWatchlist();
      setOldestTokenMint(res[0].mint);

      const crossed = res.find((token) => Math.abs(token.pnl) >= 50);

      if (crossed) {
        toast.custom((t: any) => (
          <CustomToast
            tVisibleState={t.visible}
            message={`${crossed.symbol} has ${crossed.pnl > 0 ? "surged" : "dropped"} ${crossed.pnl}%`}
            state="ERROR"
          />
        ));
      }

      let sorted = [...res].sort((a, b) => b.pnl - a.pnl);

      if (crossed) {
        sorted = [
          crossed,
          ...sorted.filter((token) => token.mint !== crossed.mint),
        ];
      }

      setWatchlistToken(sorted);
      return sorted;
    },
    refetchInterval: 10000,
  });
  return (
    <div className="relative flex h-8 w-full items-center justify-center border-b border-border pl-4">
      <div className="relative flex h-full w-full items-center justify-start space-x-1 overflow-hidden pr-4">
        {watchlistToken && watchlistToken?.length > 0 ? (
          watchlistToken?.map((item) => (
            <WatchlistItem key={item?.mint} {...item} />
          ))
        ) : (
          <span className="text-sm">No watch list at the moment... </span>
        )}
      </div>
      <span className="absolute right-0 top-0 block h-full w-[10%] bg-gradient-to-r from-black/0 to-black"></span>
    </div>
  );
}
