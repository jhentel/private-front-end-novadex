import React, { useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import SocialLinkButton from "./buttons/SocialLinkButton";

import { fetchTruthSocialPosts, TSPost } from "@/apis/rest/social-feed";

import { truncateString } from "@/utils/truncateString";
import sanitizeHtml from "@/utils/sanitizeHtml";
import { getTimeInfo } from "@/utils/formatTime";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { cn } from "@/libraries/utils";
import Link from "next/link";

const TruthSocialContent = ({ url }: { url: string }) => {
  const { data, isLoading, error } = useQuery<TSPost>({
    queryKey: ["truthsocial", url],
    queryFn: () => fetchTruthSocialPosts(url),
    enabled: !!url,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="mt-4 flex h-24 items-center justify-center z-[1000]">
        <div className="relative size-6 animate-spin">
          <Image
            src="/icons/search-loading.png"
            alt="Loading"
            fill
            className="object-contain"
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 flex h-24 items-center justify-center z-[1000]">
        <p className="font-geistRegular text-sm font-normal text-[#9191A4]">
          Error loading posts. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-4 p-4">
      <div className="flex flex-col gap-y-4">
        <div className="flex items-center gap-x-2">
          <div className="relative aspect-square size-[42px] rounded-full">
            <Image
              src={
                data?.account.avatar ? data?.account?.avatar : ""
                // ? `${IMAGE_PROXY_URL}/proxy?url=${encodeURIComponent(data?.account.avatar)}`
                // : ""
              }
              alt="Profile"
              fill
              quality={100}
              className="rounded-full object-contain"
            />
          </div>
          <div className="flex flex-1 flex-col gap-y-0">
            <div className="flex items-center gap-x-1">
              <p className="font-geistSemiBold text-base font-semibold text-white">
                {truncateString(data?.account.display_name || "", 16)}
              </p>
              {data?.account.verified && (
                <div className="relative aspect-square size-5">
                  <Image
                    src="/icons/badge-verified.svg"
                    alt="Verified"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
              )}
            </div>
            <div className="flex items-center gap-x-1.5">
              <p className="font-geistRegular text-sm font-normal text-[#9191A4]">
                @{truncateString(data?.account.username || "", 13)}
              </p>
              <span className="block size-0.5 rounded-full bg-[#9191A4]"></span>
              <span className="font-geistRegular text-sm font-normal text-[#9191A4]">
                {getTimeInfo(data?.created_at || "").formattedTime}
              </span>
            </div>
          </div>
          <Link
            href={url}
            target="_blank"
            className="relative aspect-square size-6"
          >
            <Image
              src="/icons/social/truthsocial.svg"
              alt="Truth Social"
              fill
              quality={100}
              className="object-contain"
            />
          </Link>
        </div>
        <div className="text-sm text-fontColorPrimary">
          <div
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(data?.content || ""),
            }}
          />
        </div>
        {Boolean(data?.media_attachments?.length) && (
          <div className="relative size-[252px] rounded-[16px]">
            <Image
              src={
                data?.media_attachments[0]?.url
                  ? data?.media_attachments[0].url
                  : ""
                //     ? `${IMAGE_PROXY_URL}/proxy?url=${encodeURIComponent(data.media_attachments[0].url)}`
                //     : ""
              }
              alt="post content image"
              fill
              quality={100}
              className="rounded-[16px] object-contain"
            />
          </div>
        )}
      </div>
    </div>
  );
};

const TruthSocialHoverPopover = React.memo(
  ({
    url,
    containerSize,
    iconSize,
  }: {
    url: string;
    containerSize?: string;
    iconSize?: string;
  }) => {
    const [isOpen, setIsOpen] = useState(false);

    const triggerIcon = (
      <div
        className={cn(
          "relative aspect-square size-[16px] flex-shrink-0",
          iconSize,
        )}
      >
        <Image
          src="/icons/social/truthsocial-eye.svg"
          alt="Truth Social Icon"
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
            <TooltipTrigger className="max-xl:hidden">
              <SocialLinkButton
                variant={"primary"}
                size="sm"
                href={url}
                icon="truthsocial-eye"
                label="Truth Social"
                typeImage="svg"
                containerSize={containerSize}
                iconSize={iconSize}
              />
            </TooltipTrigger>
            <TooltipContent
              isWithAnimation={false}
              align="center"
              side="bottom"
              className="gb__white__popover nova-scroller z-[1000] max-h-[50dvh] w-[284px] rounded-[6px] border border-border bg-[#17171F] p-0 !transition-none"
            >
              <iframe className="absolute left-0 top-0 size-full" />
              <TruthSocialContent url={url} />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerTrigger
            asChild
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen((prev) => !prev);
            }}
          >
            <div
              className={cn(
                "gb__white__btn_xs relative flex h-[20px] flex-shrink-0 items-center justify-center rounded-[4px] duration-300 hover:bg-white/[12%] xl:hidden",
                containerSize,
              )}
            >
              {triggerIcon}
            </div>
          </DrawerTrigger>
          <DrawerContent className="bottom-0 border-0 bg-[#080811] p-0">
            <DrawerHeader className="flex flex-row items-center justify-between space-y-0 border-b border-[#242436] px-4 py-2.5">
              <DrawerTitle className="text-fontColorPrimary">
                Truth Social Preview
              </DrawerTitle>
              <DrawerClose asChild>
                <button
                  className="flex h-6 w-6 cursor-pointer items-center justify-center bg-transparent text-transparent"
                  onClick={() => setIsOpen(false)}
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
                </button>
              </DrawerClose>
            </DrawerHeader>

            <div
              className="nova-scroller tooltip-content-tweet z-[1000] max-h-[90dvh] w-full overflow-y-scroll bg-transparent"
              data-theme="dark"
            >
              {isOpen && (
                <React.Suspense>
                  <TruthSocialContent url={url} />
                </React.Suspense>
              )}
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  },
);

TruthSocialHoverPopover.displayName = "TruthSocialHoverPopover";

export default TruthSocialHoverPopover;
