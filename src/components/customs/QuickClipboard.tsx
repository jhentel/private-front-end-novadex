"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useCopyAddress } from "@/stores/use-copy-address";
// ######## Components 🧩 #########
import Link from "next/link";
import Image from "next/image";
import Separator from "@/components/customs/Separator";
import QuickBuyButton from "@/components/customs/buttons/QuickBuyButton";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { useEffect, useState } from "react";
import { getProxyUrl, getRandomProxyUrl } from "@/utils/getProxyUrl";

export default function QuickClipboard({
  parentClassName,
  wrapperClassName,
  withSeparator = false,
}: {
  parentClassName?: string;
  wrapperClassName?: string;
  withSeparator?: boolean;
}) {
  const detailCopied = useCopyAddress((state) => state.detailCopied);
  const imageSrc = getProxyUrl(detailCopied?.image as string, detailCopied?.symbol?.[0] || "");

  return (
    detailCopied && (
      <div
        className={cn(
          "absolute right-3 top-1/2 flex -translate-y-1/2 transform items-center justify-center gap-x-2",
          parentClassName,
        )}
      >
        {withSeparator && (
          <div>
            <Separator
              color="#2E2E47"
              orientation="vertical"
              unit="fixed"
              fixedHeight={12}
              className="hidden min-[1409px]:block"
            />
          </div>
        )}
        <div
          className={cn(
            "flex h-[30px] rounded-[32px] bg-[#17171F] py-1 pl-2 pr-[3px] text-right text-xs text-white",
            wrapperClassName,
          )}
        >
          <div className="flex flex-shrink-0 items-center justify-center gap-x-1">
            <div className="relative aspect-square h-4 w-4 flex-shrink-0 overflow-hidden rounded-full md:mr-[2px]">
              <Image
                src="/icons/paste.svg"
                alt="Paste Icon"
                fill
                quality={100}
                className={"object-contain"}
              />
            </div>
            <Link
              href={`/token/${detailCopied?.mint}`}
              prefetch
              className="relative aspect-square h-4 w-4 flex-shrink-0 cursor-pointer overflow-hidden rounded-full"
            >
              <Image
                src={imageSrc as string}
                alt="Token Image"
                fill
                quality={100}
                className="object-contain"
              />
            </Link>
            <Link
              href={`/token/${detailCopied?.mint}`}
              prefetch
              className="block cursor-pointer truncate font-geistMonoLight text-xs text-fontColorPrimary max-md:max-w-[40px] max-[375px]:hidden"
            >
              <span className="truncate">{detailCopied?.symbol}</span>
            </Link>
            <div className="ml-1">
              <QuickBuyButton
                variant="marquee"
                mintAddress={detailCopied?.mint}
                className="max-w-[95px]"
              />
            </div>
          </div>
        </div>
      </div>
    )
  );
}
