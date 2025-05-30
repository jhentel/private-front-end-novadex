import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "nextjs-toploader/app";

import { cn } from "@/libraries/utils";
import { FinalDiscordMessage } from "@/types/monitor";
import truncateCA from "@/utils/truncateCA";
import { handleGoogleLensSearch } from "@/utils/handleGoogleLensSearch";

import AvatarWithBadges, {
  BadgeType,
} from "@/components/customs/AvatarWithBadges";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Copy from "@/components/customs/Copy";
import SocialLinks from "@/components/customs/cards/partials/SocialLinks";
import GradientProgressBar from "@/components/customs/GradientProgressBar";
import StatTexts from "@/components/customs/cards/partials/StatTexts";
import QuickBuyButton from "@/components/customs/buttons/QuickBuyButton";
import { useWindowSizeStore } from "@/stores/use-window-size.store";
import { usePopupByName, usePopupStore } from "@/stores/use-popup-state";
import { DEX } from "@/types/ws-general";

interface DiscordMonitorCardProps {
  data: FinalDiscordMessage;
  variant: "small" | "large";
}

const formatTimeAgo = (timestamp: number, now: Date = new Date()): string => {
  const seconds = Math.floor((now.getTime() - timestamp) / 1000);

  if (seconds < 1) return "Just now";
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const gradientMap = {
  none: {
    icon: "",
    card: "",
    decoration: "",
    border: "border-none",
    animation: "",
  },
  gold: {
    icon: "/icons/coin-gold.svg",
    card: "bg-gradient-to-b from-[#4C2D00] to-[#4C2D00]/20",
    decoration: "bg-[#17171F] bg-gradient-to-b from-[#080811] to-[#B56C00]",
    border: "from-[#B56C00]/30 to-[#B56C00]",
    animation:
      "linear-gradient(95.58deg, rgba(181, 108, 0, 0) 26.88%, rgba(181, 108, 0, 0.05) 32.49%, rgba(181, 108, 0, 0.12) 38.1%, rgba(181, 108, 0, 0.15) 45.57%, rgba(181, 108, 0, 0.122212) 53.05%, rgba(181, 108, 0, 0.05) 58.66%, rgba(181, 108, 0, 0) 64.27%)",
  },
  silver: {
    icon: "/icons/coin-silver.svg",
    card: "bg-gradient-to-b from-[#303030] to-[#303030]/20",
    decoration: "bg-[#17171F] bg-gradient-to-b from-[#080811] to-[#646464]",
    border: "from-[#646464]/30 to-[#646464]",
    animation:
      "linear-gradient(95.58deg, rgba(100, 100, 100, 0) 26.88%, rgba(100, 100, 100, 0.05) 32.49%, rgba(100, 100, 100, 0.12) 38.1%, rgba(100, 100, 100, 0.15) 45.57%, rgba(100, 100, 100, 0.122212) 53.05%, rgba(100, 100, 100, 0.05) 58.66%, rgba(100, 100, 100, 0) 64.27%)",
  },
  bronze: {
    icon: "/icons/coin-bronze.svg",
    card: "bg-gradient-to-b from-[#3E1400] to-[#3E1400]/20",
    decoration: "bg-[#17171F] bg-gradient-to-b from-[#080811] to-[#642000]",
    border: "from-[#642000]/30 to-[#642000]",
    animation:
      "linear-gradient(95.58deg, rgba(100, 32, 0, 0) 26.88%, rgba(100, 32, 0, 0.05) 32.49%, rgba(100, 32, 0, 0.12) 38.1%, rgba(100, 32, 0, 0.15) 45.57%, rgba(100, 32, 0, 0.122212) 53.05%, rgba(100, 32, 0, 0.05) 58.66%, rgba(100, 32, 0, 0) 64.27%)",
  },
};

const groupGradientMap = {
  Potion: {
    container: "bg-gradient-to-r from-[#5412D5]/[30%] to-[#9D12F1]/[12%]",
    text: "text-[#DCC4FD]",
  },
  Vanquish: {
    container: "bg-gradient-to-r from-[#5412D5]/[30%] to-[#9D12F1]/[12%]",
    text: "text-[#DCC4FD]",
  },
  Minted: {
    container: "bg-gradient-to-r from-[#0fdb9a]/[30%] to-[#0fdb9a]/[12%]",
    text: "text-[#0fdb9a]",
  },
  "Champs Only": {
    container: "bg-gradient-to-r from-[#5412D5]/[30%] to-[#9D12F1]/[12%]",
    text: "text-[#DCC4FD]",
  },
  "Shocked Trading": {
    container: "bg-gradient-to-r from-[#FDDF000F]/[30%] to-[#FDDF000F]/[12%]",
    text: "text-[#FDD200]",
  },
  "Technical Alpha Group": {
    container: "bg-gradient-to-r from-[#1f97ae]/[30%] to-[#1f97ae]/[12%]",
    text: "text-[#1f97ae]",
  },
};

export const AnimatedGradient: React.FC<{ color: string }> = ({ color }) => {
  return (
    <motion.div className="pointer-events-none absolute left-0 top-0 z-[30] !hidden h-full w-full overflow-hidden group-hover:!block">
      <motion.div
        className="absolute h-[150%] w-[120%] rotate-[-45deg]"
        style={{
          background: color,
        }}
        animate={{ x: ["-70%", "70%"] }}
        transition={{
          duration: 3,
          ease: "linear",
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
    </motion.div>
  );
};

const DiscordMonitorCard: React.FC<DiscordMonitorCardProps> = ({
  data,
  variant,
}) => {
  const router = useRouter();
  const [now, setNow] = useState<Date>(new Date());
  const width = useWindowSizeStore((state) => state.width);
  const { remainingScreenWidth, popups } = usePopupStore();
  const { isOpen: isOpenPopUp } = usePopupByName("twitter");
  const isSnapOpen = popups.some((p) => p.isOpen && p.snappedSide !== "none");

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60_000); // update every minute

    return () => clearInterval(interval);
  }, []);

  let gradient: "gold" | "silver" | "bronze" | "none" = "none";
  if (data.total_count >= 8) {
    gradient = "gold";
  } else if (data.total_count >= 3) {
    gradient = "silver";
  } else if (data.total_count > 0) {
    gradient = "bronze";
  }
  const { border, animation } = gradientMap[gradient];
  const nol = true;

  const firstPingedGroup = data.group_counts.find(
    (group) => group.pinged_first,
  );

  const handleCardContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(`/token/${data.address}`, "_blank");
  }, []);

  return (
    <div
      onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(`/token/${data.address}`);
      }}
      onMouseDown={(e) => {
        if (e.button === 1) {
          e.preventDefault();
          handleCardContextMenu(e);
        }
      }}
      onContextMenu={handleCardContextMenu}
      className={cn(
        "group cursor-pointer rounded-lg bg-gradient-to-t from-[#1A1A23] to-[#080811] p-[1px]",
        border,
      )}
    >
      <div
        className={cn(
          "relative flex w-full flex-col overflow-hidden rounded-[8px] border border-border bg-[#080811] bg-gradient-to-b from-[#1A1A23] to-[#080811]",
          nol && "!border-none",
        )}
      >
        <AnimatedGradient color={animation} />
        {/* Header */}
        <div
          className={cn(
            "relative flex w-full items-center rounded-t-[8px]",
            variant === "small" ? "h-7 px-3" : "h-9 px-4",
          )}
        >
          <div
            className={cn(
              "absolute left-0 top-0 z-0 h-full w-full bg-[#17171F]",
            )}
          />

          <div
            className={cn(
              "absolute left-0 top-0 z-0 aspect-[780/144] w-[277px] flex-shrink-0 mix-blend-overlay",
              variant === "small" ? "h-7" : "h-9",
            )}
          >
            <Image
              src="/images/decorations/twitter-monitor-card-decoration.png"
              alt="Card Decoration"
              fill
              quality={100}
              className="object-contain"
            />
          </div>

          <div className="relative z-10 flex w-full min-w-0 items-center gap-x-1.5">
            <div className="relative h-5 w-5 flex-shrink-0 overflow-hidden rounded-full">
              <Image
                src={gradientMap[gradient].icon}
                alt="Token Medal"
                fill
                className="object-contain"
              />
            </div>
            <span className="z-10 text-nowrap font-geistSemiBold text-base text-fontColorPrimary">
              {data?.token_data?.token_symbol}
            </span>

            <div className="z-[20] flex items-center gap-x-1">
              <span className="text-sm text-white/50">
                {truncateCA(data.address || "", 8)}
              </span>
              <Copy
                value={data?.address}
                sizeConstant={16}
                withAnimation={false}
              />
            </div>
          </div>

          {/* Social Links */}
          <div
            className="flex items-center gap-x-2"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <SocialLinks
              dex={data.token_data?.token_dex as DEX}
              isFirst={false}
              twitter={data.token_data?.token_twitter}
              mint={data.token_data?.token_mint}
              telegram={data.token_data?.token_telegram}
              website={data.token_data?.token_website}
              instagram={data.token_data?.token_instagram}
              tiktok={data.token_data?.token_tiktok}
              youtube={data.token_data?.token_youtube}
            />
          </div>
        </div>

        {/* Main Content */}
        <TooltipProvider>
          <div
            className={cn(
              "flex w-full flex-col",
              variant === "small" && "pb-1.5",
            )}
          >
            <div className="flex w-full items-center gap-x-5 px-4 py-3">
              {/* Left Side */}
              <div className="relative flex flex-col items-center gap-y-2 text-center">
                <AvatarWithBadges
                  classNameParent={`border-1 relative flex aspect-square h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-[#DF74FF]/30 bg-border/0 backdrop-blur-lg lg:size-[48px] z-[10] !size-[48px]`}
                  symbol={data?.token_data?.token_symbol}
                  src={data?.token_data?.token_image}
                  alt="Token Image"
                  rightType={
                    data?.token_data?.token_dex
                      ?.replace(/\./g, "")
                      ?.replace(/ /g, "_")
                      ?.toLowerCase() as BadgeType
                  }
                  handleGoogleLensSearch={
                    data?.token_data?.token_image
                      ? (e) =>
                          handleGoogleLensSearch(
                            e,
                            data.token_data.token_image!,
                          )
                      : undefined
                  }
                  badgeSizeConstant={16}
                  sizeConstant={48}
                  rightClassName="size-[16px]"
                  leftClassName="size-[16px]"
                  size="sm"
                />

                <div className="flex w-[48px] flex-col gap-y-1">
                  <GradientProgressBar
                    bondingCurveProgress={Math.round(Number(100))}
                    variant="linear"
                  />

                  <span className="whitespace-nowrap font-geistBold text-xs text-white/70">
                    {formatTimeAgo(new Date(data.timestamp).getTime(), now)}
                  </span>
                </div>
              </div>
              {/* Detailed Info Section */}
              <div className="flex w-full flex-col justify-between gap-y-1 py-1">
                {data.group_counts.length > 0 ? (
                  <div
                    className={cn(
                      "flex flex-col gap-1 md:flex-row",
                      variant === "small" || remainingScreenWidth < 1300
                        ? "!flex-col"
                        : "flex-col md:flex-row",
                      width && width < 1024 && width > 425 && "!flex-row",
                    )}
                  >
                    {/* First Appeared */}
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <div className="flex w-min flex-shrink-0 items-center gap-x-2 whitespace-nowrap rounded-[4px] border border-white border-opacity-[0.03] bg-white/[8%] p-[2px] pl-[6px]">
                          <div className="whitespace-nowrap text-[12px] text-[#9191A4]">
                            First Appeared
                          </div>
                          <div
                            className={cn(
                              "flex flex-shrink-0 items-center gap-x-1 whitespace-nowrap rounded-full py-0.5 pl-1 pr-2 text-xs text-primary",
                              groupGradientMap[
                                firstPingedGroup?.name as keyof typeof groupGradientMap
                              ]?.container,
                            )}
                          >
                            <div className="relative h-4 w-4 flex-shrink-0 overflow-hidden rounded-full">
                              <Image
                                src={firstPingedGroup?.image || "/logo.png"}
                                alt="Appeared Icon"
                                layout="fill"
                                objectFit="contain"
                              />
                            </div>
                            <span
                              className={cn(
                                "whitespace-nowrap font-geistBold text-xs",
                                groupGradientMap[
                                  firstPingedGroup?.name as keyof typeof groupGradientMap
                                ]?.text,
                              )}
                            >
                              {formatTimeAgo(
                                new Date(
                                  firstPingedGroup?.pinged_timestamp ||
                                    Date.now(),
                                ).getTime(),
                                now,
                              )}
                            </span>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        The token was posted in the {firstPingedGroup?.name}{" "}
                        group{" "}
                        {formatTimeAgo(new Date(data.timestamp).getTime(), now)}
                      </TooltipContent>
                    </Tooltip>

                    {/* Amount */}
                    <div
                      className={cn(
                        "flex items-center rounded-[4px] border border-white border-opacity-[0.03] bg-white/[8%] p-[2px] pl-[6px]",
                        variant === "small" && "items-start",
                        variant === "small" &&
                          data.group_counts.length < 3 &&
                          "!w-min",
                        remainingScreenWidth < 1300 && "!w-min",
                        isOpenPopUp && isSnapOpen && "!w-min",
                      )}
                    >
                      <span className="mr-2 font-geistLight text-[12px] text-[#9191A4]">
                        Amount
                      </span>
                      <div
                        className={cn(
                          "flex flex-nowrap items-center gap-1",
                          variant === "small" &&
                            data.group_counts.length > 3 &&
                            !isSnapOpen
                            ? "w-full flex-wrap gap-y-1 sm:flex-nowrap"
                            : "!w-min !flex-nowrap",
                        )}
                      >
                        {data.group_counts
                          .slice(
                            0,
                            variant === "small" ? 3 : data.group_counts.length,
                          )
                          .map((group, index) => (
                            <Tooltip key={group.name} delayDuration={0}>
                              <TooltipTrigger asChild>
                                <div
                                  className={cn(
                                    "flex shrink-0 items-center gap-x-1 rounded-full py-0.5 pl-1 pr-2 text-xs text-primary",
                                    groupGradientMap[
                                      group.name as keyof typeof groupGradientMap
                                    ]?.container,
                                    index !== data.group_counts.length - 1 &&
                                      "flex-grow",
                                  )}
                                >
                                  <div className="relative h-4 w-4 overflow-hidden rounded-full">
                                    <Image
                                      src={group.image}
                                      alt={group.name}
                                      layout="fill"
                                      objectFit="contain"
                                    />
                                  </div>
                                  <span
                                    className={cn(
                                      "font-geistBold text-xs",
                                      groupGradientMap[
                                        group.name as keyof typeof groupGradientMap
                                      ]?.text,
                                    )}
                                  >
                                    x{group.count}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                The token was posted in {group.name} group{" "}
                                {group.count}{" "}
                                {group.count > 1 ? "times" : "time"}
                              </TooltipContent>
                            </Tooltip>
                          ))}
                      </div>
                    </div>

                    {variant === "small" && data.group_counts.length > 3 && (
                      <div className="flex w-min items-center gap-1 rounded-[4px] border border-white border-opacity-[0.03] bg-white/[8%] p-[2px] pl-[6px]">
                        {data.group_counts.slice(3).map((group) => (
                          <Tooltip key={group.name} delayDuration={0}>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  "flex shrink-0 items-center gap-x-1 rounded-full py-0.5 pl-1 pr-2 text-xs text-primary",
                                  groupGradientMap[
                                    group.name as keyof typeof groupGradientMap
                                  ]?.container,
                                )}
                              >
                                <div className="relative h-4 w-4 overflow-hidden rounded-full">
                                  <Image
                                    src={group.image}
                                    alt={group.name}
                                    layout="fill"
                                    objectFit="contain"
                                  />
                                </div>
                                <span
                                  className={cn(
                                    "font-geistBold text-xs",
                                    groupGradientMap[
                                      group.name as keyof typeof groupGradientMap
                                    ]?.text,
                                  )}
                                >
                                  x{group.count}
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              The token was posted in {group.name} group{" "}
                              {group.count} {group.count > 1 ? "times" : "time"}
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}

                <div className="mt-2">
                  <StatTexts
                    isSnapOpen={isSnapOpen}
                    mint={data?.address}
                    marketCapUSD={data?.token_data.marketCap}
                    volumeUSD={
                      data?.token_data.volume
                        ? Number(data?.token_data.volume)
                        : 0
                    }
                    type={variant === "small" ? "monitor-small" : "monitor"}
                  />
                </div>
              </div>
              {/* Right Side */}
              <div className="w-full">
                <QuickBuyButton
                  variant="discord"
                  mintAddress={data?.address}
                  className={cn(
                    "absolute",
                    variant !== "small" &&
                      data.group_counts.length < 5 &&
                      !isSnapOpen &&
                      "right-[12px] top-1/2 z-[10] flex h-10 w-auto flex-shrink-0 translate-y-[15%] items-center justify-center xl:top-2/3 xl:-translate-y-1/2",
                    variant !== "small" &&
                      data.group_counts.length > 4 &&
                      "!bottom-2 !right-2 !h-10",
                    variant !== "small" &&
                      isSnapOpen &&
                      "!bottom-2 !right-2 h-10",
                    variant === "small" && "bottom-3 right-2 h-8",
                  )}
                />
              </div>
            </div>
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default DiscordMonitorCard;
