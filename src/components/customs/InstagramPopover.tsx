"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TwitterUserStatusData } from "@/apis/rest/twitter";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { truncateString } from "@/utils/truncateString";
import { cn } from "@/libraries/utils";
import { fetchInstagramStatus } from "@/apis/rest/instagram";
import Link from "next/link";
import { Eye, Heart, MessageCircle } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
};
export const renderTextWithInstagramLinks = (text: string) => {
  const urlRegex =
    /(https?:\/\/(?:www\.)?(?:instagram\.com|instagr\.am)\/[^\s]+|https?:\/\/[^\s]+|www\.[^\s]+|trib\.al\/[^\s]+|bit\.ly\/[^\s]+|tinyurl\.com\/[^\s]+)/g;
  const mentionRegex = /@([a-zA-Z0-9_.]+)/g;

  const parts = text.split(/(\s+)/);

  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      const href = part.startsWith("http") ? part : `https://${part}`;
      return (
        <Link
          key={index}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#E1306C] no-underline hover:underline"
        >
          {part}
        </Link>
      );
    }

    if (mentionRegex.test(part)) {
      let hasColon = false;
      let username = part.replace("@", "");

      if (username.includes(":")) {
        hasColon = true;
        username = username.slice(0, username.length - 1);
      }

      return (
        <React.Fragment key={index}>
          <Link
            href={`https://www.instagram.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#405DE6] no-underline hover:underline"
          >
            @{username}
          </Link>
          {hasColon && <span>:</span>}
        </React.Fragment>
      );
    }

    return <span key={index}>{part}</span>;
  });
};

const InstagramPopoverContent = React.memo(
  ({
    href,
    setIsFetched,
  }: {
    href?: string;
    data?: TwitterUserStatusData | undefined;
    setIsFetched?: React.Dispatch<React.SetStateAction<boolean>>;
    isFetched?: boolean;
  }) => {
    const {
      data: fetchData,
      isLoading,
      error,
    } = useQuery({
      queryKey: ["instagram-status", href],
      queryFn: async () => {
        const res = await fetchInstagramStatus(href as string);
        setIsFetched?.(true);
        return res;
      },
      retry: 0,
    });

    return (
      <>
        {isLoading && !error && (
          <div className="flex h-24 items-center justify-center z-[1000]">
            <div className="relative size-6 animate-spin">
              <Image
                src="/icons/search-loading.png"
                alt="Loading"
                fill
                className="object-contain"
              />
            </div>
          </div>
        )}

        {(error || !fetchData?.posting_account?.username) && !isLoading && (
          <div className="z-50 flex w-full flex-col items-center justify-center p-3 max-xl:h-[350px] max-xl:gap-8 z-[1000]">
            <div className="relative aspect-square size-[160px] xl:size-[64px]">
              <Image
                src="/icons/social/instagram-empty.png"
                alt="Instagram Empty"
                className="mb-2 object-contain max-xl:hidden"
                fill
              />
              <Image
                src="/icons/social/instagram-empty-large.png"
                alt="Instagram Empty"
                className="mb-2 object-contain xl:hidden"
                fill
              />
            </div>
            <div className="gap-2 text-center max-xl:px-8">
              <h1 className="mb-1 font-geistSemiBold text-[#FCFCFD] max-xl:text-2xl">
                No Instagram Found
              </h1>
              <p className="text-center font-geistRegular text-xs font-normal text-[#9191A4]">
                Oops! It looks like there are no instagram available at the
                moment. Check back later!
              </p>
            </div>
          </div>
        )}

        {!isLoading && fetchData?.posting_account?.username && (
          <>
            {fetchData?.posting_account?.username ? (
              <div className="flex flex-col gap-y-4 p-4 z-[1000]">
                <div className="flex items-center gap-x-2">
                  <div className="relative aspect-square size-[42px] rounded-full">
                    <Image
                      src={`/api/proxyImage?url=${encodeURIComponent(fetchData?.posting_account?.profile_pic_url || "")}`}
                      alt="Profile"
                      fill
                      quality={100}
                      className="rounded-full object-contain"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-y-0">
                    <div className="flex items-center gap-x-1">
                      <p className="font-geistSemiBold text-base font-semibold text-white">
                        {truncateString(
                          fetchData?.posting_account?.username || "",
                          16,
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="relative aspect-square size-6">
                    <Image
                      src="/icons/social/instagram.svg"
                      alt="X"
                      fill
                      quality={100}
                      className="object-contain"
                    />
                  </div>
                </div>

                {Boolean(fetchData?.text_content) && (
                  <div className="overflow-hidden truncate text-sm text-fontColorPrimary">
                    {fetchData?.text_content?.split("\n").map((line, index) => (
                      <React.Fragment key={`content-${index}`}>
                        {renderTextWithInstagramLinks(line)}
                        <br />
                      </React.Fragment>
                    ))}
                  </div>
                )}

                {(Boolean(fetchData?.views) ||
                  Boolean(fetchData?.likes) ||
                  Boolean(fetchData?.comments)) && (
                  <div className="flex items-center gap-x-4 text-sm text-[#9191A4]">
                    {typeof fetchData?.views === "number" && (
                      <div className="flex items-center gap-x-1">
                        <Eye className="size-4" />
                        <span>{formatNumber(fetchData.views)}</span>
                      </div>
                    )}
                    {typeof fetchData?.likes === "number" && (
                      <div className="flex items-center gap-x-1">
                        <Heart className="size-4" />
                        <span>{formatNumber(fetchData.likes)}</span>
                      </div>
                    )}
                    {typeof fetchData?.comments === "number" && (
                      <div className="flex items-center gap-x-1">
                        <MessageCircle className="size-4" />
                        <span>{formatNumber(fetchData.comments)}</span>
                      </div>
                    )}
                  </div>
                )}

                {Boolean(fetchData?.content_url) && (
                  <div className="relative w-full rounded-[16px]">
                    <video
                      width="100%"
                      height="auto"
                      controls
                      autoPlay
                      muted
                      playsInline
                      className="rounded-[16px]"
                    >
                      <source src={fetchData.content_url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}

                {Boolean(fetchData?.thumbnail?.length) &&
                  !fetchData?.content_url && (
                    <div className="relative aspect-square w-full rounded-[16px] xl:size-[252px]">
                      <Image
                        src={`/api/proxyImage?url=${encodeURIComponent(fetchData?.thumbnail || "")}`}
                        alt="Instagram content image"
                        fill
                        quality={100}
                        className="rounded-[16px] object-contain"
                      />
                    </div>
                  )}
              </div>
            ) : null}
          </>
        )}
      </>
    );
  },
);

InstagramPopoverContent.displayName = "InstagramPopoverContent";

const InstagramPopover = React.memo(
  ({
    href,
    align = "center",
    variant = "primary",
    data,
    containerSize,
    iconSize,
  }: {
    href?: string;
    align?: "center" | "end" | "start";
    variant?: "primary" | "secondary";
    data?: TwitterUserStatusData;
    containerSize?: string;
    iconSize?: string;
  }) => {
    const [isFetched, setIsFetched] = useState(false);
    const [isOpenDrawer, setIsOpenDrawer] = useState<boolean>(false);

    const triggerIcon = (
      <div
        className={cn(
          "relative aspect-square size-[16px] flex-shrink-0",
          iconSize,
        )}
      >
        <Image
          src="/icons/social/instagram-eye.svg"
          alt="Instagram Social Icon"
          fill
          quality={100}
          loading="lazy"
          className="object-contain"
        />
      </div>
    );
    return (
      <>
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Link
                href={href as string}
                target="_blank"
                className={cn(
                  "gb__white__btn_xs relative hidden h-[20px] flex-shrink-0 items-center justify-center rounded-[4px] duration-300 hover:bg-white/[12%] xl:flex",
                  variant === "primary" ? "bg-white/[6%]" : "bg-[#272734]",
                  !isFetched
                    ? "aspect-square size-[20px]"
                    : "w-auto gap-0.5 p-1.5",
                  containerSize,
                )}
              >
                {triggerIcon}
              </Link>
            </TooltipTrigger>

            <TooltipContent
              isWithAnimation={false}
              align={align}
              side="bottom"
              className="nova-scroller darker gb__white__popover z-[1000] max-h-[450px] w-[284px] overflow-y-scroll rounded-[6px] border border-border bg-[#17171F] p-0 !transition-none"
            >
              <iframe className="absolute left-0 top-0 size-full" />
              <InstagramPopoverContent
                setIsFetched={setIsFetched}
                isFetched={isFetched}
                href={href as string}
              />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Drawer open={isOpenDrawer} onOpenChange={setIsOpenDrawer}>
          <DrawerTrigger
            asChild
            onClick={(e) => {
              e.stopPropagation();
              setIsOpenDrawer(!isOpenDrawer);
            }}
          >
            <div
              className={cn(
                "gb__white__btn_xs relative flex h-[20px] flex-shrink-0 items-center justify-center rounded-[4px] duration-300 hover:bg-white/[12%] xl:hidden",
                variant === "primary" ? "bg-white/[6%]" : "bg-[#272734]",
                containerSize,
              )}
            >
              {triggerIcon}
            </div>
          </DrawerTrigger>
          <DrawerContent className="bottom-0 border-0 bg-[#080811] p-0">
            <DrawerHeader className="flex flex-row items-center justify-between space-y-0 border-b border-[#242436] px-4 py-2.5">
              <DrawerTitle className="text-fontColorPrimary">
                Instagram Preview
              </DrawerTitle>
              <div
                className="flex h-6 w-6 cursor-pointer items-center justify-center bg-transparent text-transparent"
                onClick={() => setIsOpenDrawer(false)}
              >
                <div
                  className="relative aspect-square h-6 w-6 flex-shrink-0"
                  aria-label="Close"
                  title="Close"
                >
                  <Image
                    src="/icons/close.png"
                    alt="Close Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
              </div>
            </DrawerHeader>

            <div
              className="nova-scroller tooltip-content-tweet z-[1000] max-h-[90dvh] w-full overflow-y-scroll bg-transparent"
              data-theme="dark"
            >
              <InstagramPopoverContent
                setIsFetched={setIsFetched}
                isFetched={isFetched}
                href={href as string}
              />
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  },
);

InstagramPopover.displayName = "InstagramPopover";

export default InstagramPopover;
