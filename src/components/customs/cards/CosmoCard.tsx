"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, {
  useCallback,
  useMemo,
  useRef,
  memo,
  useEffect,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePopupStore } from "@/stores/use-popup-state";
import { useHiddenTokensStore } from "@/stores/cosmo/use-hidden-tokens.store";
import { useCustomizeSettingsStore } from "@/stores/setting/use-customize-settings.store";
import { useWindowSizeStore } from "@/stores/use-window-size.store";
import toast from "react-hot-toast";
// ######## APIs 🛜 ########
import { prefetchChart } from "@/apis/rest/charts";
import { hideCosmoToken } from "@/apis/rest/cosmo";
// ######## Components 🧩 ########
import Image from "next/image";
import Separator from "@/components/customs/Separator";
import { CachedImage } from "@/components/customs/CachedImage";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import GradientProgressBar from "@/components/customs/GradientProgressBar";
import CosmoQuickBuyButton from "@/components/customs/buttons/CosmoQuickBuyButton";
import TimeDifference from "@/components/customs/cards/TimeDifference";
import StatBadges from "@/components/customs/cards/partials/StatBadges";
import StatTexts from "@/components/customs/cards/partials/StatTexts";
import SocialLinks from "@/components/customs/cards/partials/SocialLinks";
import SnipeButton from "@/components/customs/buttons/SnipeButton";

// Also import type separately to avoid bundling the component
import type { BadgeType } from "@/components/customs/AvatarWithBadges";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
// ######## Types 🗨️ ########
import { CosmoDataMessageType } from "@/types/ws-general";
import { useRouter } from "nextjs-toploader/app";
import Link from "next/link";
import { handleGoogleLensSearch } from "@/utils/handleGoogleLensSearch";

const CustomToast = React.lazy(() => import("../toasts/CustomToast"));
import AvatarWithBadges from "@/components/customs/AvatarWithBadges";
import { TokenName } from "./partials/TokenName";
import { useCustomCardView } from "@/stores/setting/use-custom-card-view.store";
import {
  useWalletHighlightStore,
  type WalletWithColor,
} from "@/stores/wallets/use-wallet-highlight-colors.store";
import { AvatarHighlightWrapper } from "@/components/customs/AvatarHighlightWrapper";
import { useTrackedWalletsOfToken } from "@/hooks/use-tracked-wallets-of-token";
import { TokenText } from "./partials/TokenText";
import { AnimatedGradient } from "@/components/customs/cards/footer/DiscordMonitorCard";
import Copy from "../Copy";

type CosmoCardProps = {
  data: CosmoDataMessageType;
  amount?: number;
  column: 1 | 2 | 3;
  isFirst?: boolean;
};

const avatarSizeMap = {
  normal: "!size-[48px]",
  large: "!size-[56px]",
  extralarge: "!size-[64px]",
  doubleextralarge: "!size-[72px]",
};

const getAvatarSizeNumber = (preset: keyof typeof avatarSizeMap): number => {
  // Extract number from string like "!size-[48px]"
  const sizeString = avatarSizeMap[preset];
  const match = sizeString.match(/\[(\d+)px\]/);
  return match ? parseInt(match[1], 10) : 48; // Default to 48 if no match
};

const progressWidthMap = {
  normal: "!w-[48px]",
  large: "!w-[56px]",
  extralarge: "!w-[64px]",
  doubleextralarge: "!w-[72px]",
};
const progressGap = {
  normal: "!gap-y-1",
  large: "!gap-y-1.5",
  extralarge: "!gap-y-2.5",
  doubleextralarge: "!gap-y-4",
};
const largePresets = [
  "large",
  "extralarge",
  "doubleextralarge",
  "tripleextralarge",
  "quadripleextralarge",
];
const extraLargePresets = [
  "doubleextralarge",
  "tripleextralarge",
  "quadripleextralarge",
];

const twitterStatusPopoverAlignment = {
  1: "start",
  2: "center",
  3: "end",
};

const imageDecorationSize = {
  normal: 150,
  large: 150,
  extralarge: 175,
  doubleextralarge: 200,
};

const gradientMap = {
  none: {
    border: "",
    animation: "",
  },
  gold: {
    border: "bg-gradient-to-t from-[#B56C00]/30 to-[#B56C00]",
    animation:
      "linear-gradient(95.58deg, rgba(181, 108, 0, 0) 26.88%, rgba(181, 108, 0, 0.05) 32.49%, rgba(181, 108, 0, 0.12) 38.1%, rgba(181, 108, 0, 0.15) 45.57%, rgba(181, 108, 0, 0.122212) 53.05%, rgba(181, 108, 0, 0.05) 58.66%, rgba(181, 108, 0, 0) 64.27%)",
  },
  silver: {
    border: "bg-gradient-to-t from-[#646464]/30 to-[#646464]",
    animation:
      "linear-gradient(95.58deg, rgba(100, 100, 100, 0) 26.88%, rgba(100, 100, 100, 0.05) 32.49%, rgba(100, 100, 100, 0.12) 38.1%, rgba(100, 100, 100, 0.15) 45.57%, rgba(100, 100, 100, 0.122212) 53.05%, rgba(100, 100, 100, 0.05) 58.66%, rgba(100, 100, 100, 0) 64.27%)",
  },
  bronze: {
    border: "bg-gradient-to-t from-[#642000]/30 to-[#642000]",
    animation:
      "linear-gradient(95.58deg, rgba(100, 32, 0, 0) 26.88%, rgba(100, 32, 0, 0.05) 32.49%, rgba(100, 32, 0, 0.12) 38.1%, rgba(100, 32, 0, 0.15) 45.57%, rgba(100, 32, 0, 0.122212) 53.05%, rgba(100, 32, 0, 0.05) 58.66%, rgba(100, 32, 0, 0) 64.27%)",
  },
};

const CosmoCard = memo(
  ({ data, column, isFirst, amount }: CosmoCardProps) => {
    const router = useRouter();
    const queryClientNormal = useQueryClient();

    const cardRef = useRef<HTMLDivElement>(null);
    const [cardWidth, setCardWidth] = useState<number>(0);

    const customizedSettingPresets = useCustomizeSettingsStore(
      (state) => state.presets,
    );
    const customizedSettingActivePreset = useCustomizeSettingsStore(
      (state) => state.activePreset,
    );

    const currentAvatarPreset =
      customizedSettingPresets[customizedSettingActivePreset].avatarSetting ||
      "normal";
    const currentAvatarBorderRadiusPreset =
      customizedSettingPresets[customizedSettingActivePreset]
        .avatarBorderRadiusSetting || "rounded";
    const currentFontPreset =
      customizedSettingPresets[customizedSettingActivePreset].fontSetting ||
      "normal";
    const currentSocialPreset =
      customizedSettingPresets[customizedSettingActivePreset].socialSetting ||
      "normal";
    const currentButtonPreset =
      customizedSettingPresets[customizedSettingActivePreset].buttonSetting ||
      "normal";

    const cardViewConfig = useCustomCardView((state) => state.cardViewConfig);

    const isSnapOpen = usePopupStore((state) =>
      state.popups.some((p) => p.isOpen && p.snappedSide !== "none"),
    );

    const isXlDown = useWindowSizeStore(
      (state) => state.width! < 1280 || false,
    );

    const hideToken = useHiddenTokensStore((state) => state.hideToken);
    const unhideToken = useHiddenTokensStore((state) => state.unhideToken);
    const isTokenHidden = useHiddenTokensStore((state) =>
      state.isTokenHidden(data.mint),
    );
    const hiddenTokens = useHiddenTokensStore((state) => state.hiddenTokens);
    const tokenUrlRef = useRef<string>("#");

    const trackedWalletsOfToken = useTrackedWalletsOfToken().walletsOfToken;
    const walletColors = useWalletHighlightStore((state) => state.wallets);

    const walletHighlights = useMemo(() => {
      const trackedWallets = trackedWalletsOfToken?.[data?.mint];
      if (!trackedWallets?.length) return [];

      const highlights: WalletWithColor[] = [];
      const seenAddresses = new Set<string>();

      // Direct loop is more efficient than reduce for this case
      for (const address of trackedWallets) {
        const wallet = walletColors?.[address];
        if (wallet && !seenAddresses?.has(wallet?.address)) {
          seenAddresses?.add(wallet?.address);
          highlights?.push(wallet);
        }
      }

      return highlights;
    }, [data?.mint, trackedWalletsOfToken, walletColors]);

    useEffect(() => {
      if (data?.mint) {
        const params = new URLSearchParams({
          symbol: data?.symbol || "",
          name: data?.name || "",
          image: data?.image || "",
          market_cap_usd: String(data?.market_cap_usd || ""),
          liquidity_usd: String(data?.liquidity_usd || ""),
          dex: data?.dex || "",
        });
        tokenUrlRef.current = `/token/${data.mint}?${params.toString()}`;
      }

      return () => {
        tokenUrlRef.current = "#"; // Clear reference on unmount
      };
    }, [
      data?.mint,
      data?.symbol,
      data?.name,
      data?.image,
      data?.market_cap_usd,
      data?.liquidity_usd,
      data?.dex,
    ]);

    let gradient: "gold" | "silver" | "bronze" | "none" = "none";
    const totalCount = data.discord_details?.total_count ?? 0;
    if (totalCount < 1) {
      gradient = "none";
    } else if (totalCount >= 8) {
      gradient = "gold";
    } else if (totalCount >= 3) {
      gradient = "silver";
    } else if (totalCount >= 1) {
      gradient = "bronze";
    }

    const { border, animation } = gradientMap[gradient];

    const cardStyles = useMemo(
      () => ({
        wrapper: cn(
          "block group w-full flex-shrink-0 cursor-pointer overflow-hidden",
          data?.migrating
            ? "border border-transparent"
            : data?.is_discord_monitored &&
                `p-[0.5px] pr-[0.7px] pb-[0.7px] ${border}`,
        ),
        header: cn(
          "relative flex py-1 w-full items-center justify-between overflow-hidden px-3 overflow-hidden",
          currentSocialPreset === "extralarge" && "py-1.5",
          currentSocialPreset === "doubleextralarge" && "py-2",
          data?.is_discord_monitored
            ? "bg-[#1b1b24]"
            : data?.migrating && !data?.is_discord_monitored
              ? "bg-transparent"
              : !data?.is_discord_monitored && "bg-white/[6%]",
        ),
        content: cn(
          "w-full h-full gap-y-3 grid px-3",
          data?.is_discord_monitored
            ? "bg-gradient-to-b from-[#1A1A23] to-[#080811]"
            : data?.migrating && !data?.is_discord_monitored
              ? "bg-gradient-to-b from-[#26112C] to-[70%] to-transparent"
              : !data?.is_discord_monitored &&
                "bg-gradient-to-b from-[#1A1A23] to-transparent",
        ),
      }),
      [data?.migrating, data.is_discord_monitored, currentSocialPreset],
    );

    const remainingScreenWidth = usePopupStore(
      (state) => state.remainingScreenWidth,
    );
    const { width } = useWindowSizeStore();
    const isSmallScreen =
      largePresets.includes(currentAvatarPreset) ||
      largePresets.includes(currentFontPreset)
        ? extraLargePresets.includes(currentButtonPreset)
          ? remainingScreenWidth < 1800
          : remainingScreenWidth < 1400
        : extraLargePresets.includes(currentButtonPreset)
          ? remainingScreenWidth < 1700
          : remainingScreenWidth < 1000;

    const handleCardClick = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!data?.mint) return;

        // console.time("Navigate from Cosmo:");

        prefetchChart(queryClientNormal, data.mint);
        // prefetchCandles(queryClientNormal, {
        //   mint: data.mint,
        //   interval: PRICE_MAP[interval as keyof typeof PRICE_MAP],
        //   currency: (
        //     (localStorage.getItem("chart_currency") as string) || "SOL"
        //   ).toLowerCase() as "sol" | "usd",
        //   initial: true,
        // });

        // Prefetch the page route
        router.prefetch(tokenUrlRef.current);
        router.push(tokenUrlRef.current);
      },
      [router, queryClientNormal, data?.mint],
    );

    const handleCardContextMenu = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      window.open(tokenUrlRef.current, "_blank");
    }, []);

    const isCardViewActive = (key: string): boolean => {
      const configItem = cardViewConfig.find((item) => item.key === key);
      return configItem?.status === "active";
    };

    useEffect(() => {
      const updateCardWidth = () => {
        if (cardRef.current) {
          setCardWidth(cardRef.current.offsetWidth);
        }
      };

      updateCardWidth(); // Initial measurement

      window.addEventListener("resize", updateCardWidth); // Recalculate on window resize

      return () => {
        window.removeEventListener("resize", updateCardWidth);
      };
    }, []);

    return (
      <div
        ref={cardRef}
        className={cn(
          cardStyles.wrapper,
          "group relative flex h-full flex-col items-center transition-[height] duration-300 ease-in-out",
        )}
        onClick={handleCardClick}
        onMouseDown={(e) => {
          if (e.button === 1) {
            e.preventDefault();
            handleCardContextMenu(e);
          }
        }}
        onContextMenu={handleCardContextMenu}
      >
        {data?.is_discord_monitored && <AnimatedGradient color={animation} />}

        {/* Header */}
        <div className={cn(cardStyles.header)}>
          {data?.migrating ? (
            <div className="absolute bottom-0 left-0 top-0 w-full bg-[#080811]">
              <div className="h-full w-full bg-gradient-to-b from-[#150619] to-[#42254B]"></div>
            </div>
          ) : (
            <div className="absolute left-0 top-0 h-full w-full bg-[#080811]">
              <div className="h-full w-full bg-secondary"></div>
            </div>
          )}

          <Image
            src="/images/decorations/card-decoration.svg"
            alt="Card Decoration"
            height={130}
            width={imageDecorationSize[currentSocialPreset]}
            className="absolute right-0 top-0 mix-blend-overlay"
            style={{ isolation: "isolate" }}
          />

          <div className="relative flex w-[75%] items-center gap-x-1.5">
            {data?.migrating && (
              <div className="flex w-fit items-center justify-center gap-x-1 font-geistSemiBold text-sm text-primary">
                <Image
                  src="/icons/migrating-loading.svg"
                  alt="Migrating Loading Icon"
                  height={16}
                  width={16}
                  quality={80}
                  className={cn(
                    "relative aspect-square size-[16px] flex-shrink-0 animate-spin",
                  )}
                />
                Migrating...
              </div>
            )}
            <div className="flex w-full min-w-0 items-center gap-x-1.5">
              <button
                title="Hide Token"
                className="relative z-[10] hidden aspect-square size-4 flex-shrink-0 group-hover:block"
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    if (isTokenHidden) {
                      unhideToken(data.mint); // Store update
                      toast.custom((t: any) => (
                        <CustomToast
                          tVisibleState={t.visible}
                          message="Successfully unhidden token"
                          state="SUCCESS"
                        />
                      ));
                      await hideCosmoToken(
                        hiddenTokens.filter(
                          (hiddenToken) => hiddenToken !== data.mint,
                        ),
                      ).then(() => {}); // API call (should be updated to unhide)
                    } else {
                      hideToken(data.mint); // Store update
                      toast.custom((t: any) => (
                        <CustomToast
                          tVisibleState={t.visible}
                          message="Successfully hidden token"
                          state="SUCCESS"
                        />
                      ));
                      await hideCosmoToken([...hiddenTokens, data.mint]).then(
                        () => {},
                      ); // API call
                    }
                  } catch (error) {
                    console.warn("Error toggling token visibility:", error);
                  }
                }}
              >
                <CachedImage
                  src={
                    isTokenHidden
                      ? "/icons/eye-show.svg"
                      : "/icons/eye-hide.svg"
                  }
                  alt={isTokenHidden ? "Show Token Icon" : "Hide Token Icon"}
                  height={16}
                  width={16}
                  quality={100}
                  className="object-contain"
                />
              </button>

              {/* <h4 className="text-nowrap font-geistSemiBold text-sm leading-none text-fontColorPrimary">
                {isSnapOpen
                  ? isXlDown
                    ? truncateCA(data?.symbol || "", 5)
                    : data?.symbol || ""
                  : data?.symbol || ""}
              </h4> */}
              <TokenText
                text={data?.symbol}
                shouldTruncate={isSnapOpen && isXlDown}
                className="text-nowrap font-geistSemiBold text-fontColorPrimary"
                isSymbol
                cardWidth={cardWidth}
              />

              <div className="min-w-0 flex-shrink overflow-hidden">
                <TokenName
                  // isSnapOpen={isSnapOpen}
                  migrating={data.migrating}
                  name={data.name}
                  mint={data.mint}
                  cardWidth={cardWidth}
                />
              </div>
              <div className="z-[10] flex items-center gap-x-1">
                <Copy value={data.mint} />
                <Link
                  href={`https://x.com/search?q=${data?.mint}`}
                  target="_blank"
                  title="Search Token"
                  className="relative aspect-square h-4 w-4 flex-shrink-0 duration-300 hover:brightness-200"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <CachedImage
                    src="/icons/search.svg"
                    alt="Search Icon"
                    height={16}
                    width={16}
                    quality={80}
                    className="object-contain"
                  />
                </Link>
                <Separator
                  color="#202037"
                  orientation="vertical"
                  unit="fixed"
                  fixedHeight={14}
                  className="block flex-shrink-0 lg:hidden"
                />
              </div>
            </div>
          </div>

          <div onClick={(e) => e.stopPropagation()}>
            <SocialLinks
              dex={data?.dex}
              twitterStatusPopoverAlignment={
                twitterStatusPopoverAlignment[column] as
                  | "start"
                  | "center"
                  | "end"
              }
              isFirst={isFirst!}
              twitter={data?.twitter}
              mint={data?.mint}
              telegram={data?.telegram}
              website={data?.website}
              instagram={data?.instagram}
              tiktok={data?.tiktok}
              youtube={data?.youtube}
            />
          </div>
        </div>

        {/* Content */}
        <div className={cn(cardStyles.content)}>
          <div
            // onClick={handleCardClick}
            // onMouseDown={(e) => {
            //   if (e.button === 1) {
            //     e.preventDefault();
            //     handleCardContextMenu(e);
            //   }
            // }}
            // onContextMenu={handleCardContextMenu}
            className="z-50 flex items-center justify-center"
          >
            <div
              className={cn(
                "relative flex w-full items-center",
                isSnapOpen &&
                  (["extralarge", "doubleextralarge"].includes(
                    currentAvatarPreset,
                  ) ||
                    ["extralarge", "doubleextralarge"].includes(
                      currentFontPreset,
                    ))
                  ? "items-start gap-x-1 lg:gap-x-3"
                  : "gap-x-4",
              )}
            >
              <div
                className={`${progressGap[currentAvatarPreset]} relative flex flex-col items-center`}
              >
                <AvatarHighlightWrapper
                  size={58}
                  walletHighlights={walletHighlights}
                >
                  <AvatarWithBadges
                    withImageHover
                    classNameParent={`border-1 relative z-[0] flex aspect-square h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-[#DF74FF]/30 bg-border/0 backdrop-blur-lg lg:size-[48px] ${avatarSizeMap[currentAvatarPreset]}`}
                    symbol={data?.symbol}
                    src={data?.image}
                    alt="Token Image"
                    leftType={
                      data?.dex === "Launch a Coin" ||
                      data?.dex === "Raydium" ||
                      data?.dex === "Meteora AMM V2" ||
                      data?.dex === "Meteora AMM" ||
                      data?.dex === "Pump.Swap"
                        ? data?.origin_dex === "LaunchLab" &&
                          data?.launchpad === "Bonk"
                          ? "bonk"
                          : data?.origin_dex === "Dynamic Bonding Curve" &&
                              data?.launchpad === "Launch a Coin"
                            ? "launch_a_coin"
                            : (data?.origin_dex
                                ?.replace(/\./g, "")
                                ?.replace(/ /g, "_")
                                ?.toLowerCase() as BadgeType)
                        : undefined
                    }
                    rightType={
                      data?.dex === "LaunchLab" && data?.launchpad === "Bonk"
                        ? "bonk"
                        : data?.dex === "Dynamic Bonding Curve" &&
                            data?.launchpad === "Launch a Coin"
                          ? "launch_a_coin"
                          : (data?.dex
                              ?.replace(/\./g, "")
                              ?.replace(/ /g, "_")
                              ?.toLowerCase() as BadgeType)
                    }
                    handleGoogleLensSearch={
                      data?.image
                        ? (e) => handleGoogleLensSearch(e, data.image!)
                        : undefined
                    }
                    badgeSizeConstant={16}
                    sizeConstant={getAvatarSizeNumber(
                      (currentAvatarPreset ||
                        "normal") as keyof typeof avatarSizeMap,
                    )}
                    rightClassName={`size-[16px] ${currentAvatarPreset === "normal" && currentAvatarBorderRadiusPreset === "rounded" && "-right-[3px] -bottom-[3px]"} ${currentAvatarBorderRadiusPreset === "squared" && "-right-[4.5px] -bottom-[4.5px]"}`}
                    leftClassName={`size-[16px] ${currentAvatarPreset === "normal" && currentAvatarBorderRadiusPreset === "rounded" && "-left-[3px] -bottom-[3px]"} ${currentAvatarBorderRadiusPreset === "squared" && "-left-[4.5px] -bottom-[4.5px]"}`}
                    size={
                      ["normal", "large"].includes(currentAvatarPreset)
                        ? "sm"
                        : "lg"
                    }
                    isCosmo
                    isSquared={currentAvatarBorderRadiusPreset === "squared"}
                  />
                </AvatarHighlightWrapper>

                <div
                  className={`flex ${progressWidthMap[currentAvatarPreset]} flex-col`}
                >
                  <GradientProgressBar
                    bondingCurveProgress={Math.round(Number(data?.progress))}
                    variant="linear"
                  />

                  <TimeDifference
                    created={data?.created}
                    migrated_time={data?.migrated_time}
                    dex={data?.dex}
                  />
                </div>
              </div>

              <div className="flex w-full flex-col gap-y-1">
                <StatBadges
                  isMigrating={data?.migrating}
                  stars={data?.stars}
                  snipers={data?.snipers}
                  insiderPercentage={data?.insider_percentage}
                  top10Percentage={data?.top10_percentage}
                  devHoldingPercentage={data?.dev_holding_percentage}
                  isSnapOpen={isSnapOpen}
                  isLargePreset={["large"].includes(currentAvatarPreset)}
                  isXLPreset={["extralarge", "doubleextralarge"].includes(
                    currentAvatarPreset,
                  )}
                />

                <div className="flex flex-col gap-y-[1px]">
                  <div className="flex items-center gap-x-1.5">
                    {!isSnapOpen && isCardViewActive("bundled") && (
                      <div className="mb-[2px] mt-[2px] flex items-center gap-x-0.5 font-geistSemiBold text-xs text-fontColorSecondary">
                        Bundled:
                        <span
                          className={cn(
                            "inline-block",
                            data?.bundled ? "text-destructive" : "text-success",
                          )}
                        >
                          {data?.bundled ? "Yes" : "No"}
                        </span>
                        {/* <span
                          className={cn(
                            "inline-block",
                            (data?.bundled_percentage ?? 0) > 0
                              ? "text-destructive"
                              : "text-success",
                          )}
                        >
                          {(data?.bundled_percentage ?? 0) > 0
                            ? data?.bundled_percentage?.toFixed(1) + "%"
                            : "0%"}
                        </span> */}
                      </div>
                    )}
                    {data?.is_discord_monitored &&
                      data?.discord_details?.group_counts &&
                      data?.discord_details?.group_counts?.length > 0 && (
                        <div className="mb-[2px] mt-[2px] flex items-center gap-x-0.5 font-geistSemiBold text-xs text-fontColorSecondary">
                          Groups:
                          <TooltipProvider>
                            <span className="ml-1 flex gap-x-0.5">
                              {data?.discord_details?.group_counts.map(
                                (group) => (
                                  <Tooltip key={group.name} delayDuration={0}>
                                    <TooltipTrigger asChild>
                                      <div className="relative h-4 w-4 overflow-hidden rounded-full">
                                        <Image
                                          src={group.image}
                                          alt={group.name}
                                          fill
                                          sizes="16px"
                                          objectFit="contain"
                                        />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {group.name}
                                    </TooltipContent>
                                  </Tooltip>
                                ),
                              )}
                            </span>
                          </TooltipProvider>
                        </div>
                      )}
                  </div>

                  <StatTexts
                    isSnapOpen={isSnapOpen}
                    mint={data?.mint}
                    bundled={data?.bundled}
                    bundled_percentage={data?.bundled_percentage}
                    marketCapUSD={data?.market_cap_usd}
                    volumeUSD={data?.volume_usd}
                    holders={data?.holders}
                  />
                </div>
              </div>
            </div>
          </div>

          {isSmallScreen ||
            (remainingScreenWidth < 1400 && (
              <div
                onClick={handleCardClick}
                className="invisible absolute right-0 top-0 z-[8] h-full w-[75%] bg-gradient-to-r from-[#1A1A2300] to-[#080811]/[85%] to-[90%] opacity-0 transition-all duration-300 ease-in-out group-hover:visible group-hover:opacity-100"
              ></div>
            ))}

          {data?.migrating ? (
            <SnipeButton
              data={data}
              className={cn(
                `absolute right-[12px] top-1/2 z-[10] flex w-auto flex-shrink-0 -translate-y-1/2 items-center justify-center ${
                  (currentButtonPreset === "tripleextralarge" &&
                    currentAvatarPreset !== "normal" &&
                    currentAvatarPreset !== "large") ||
                  (currentButtonPreset === "quadripleextralarge" &&
                    currentAvatarPreset !== "normal" &&
                    currentAvatarPreset !== "large")
                    ? "2xl:top-2/3"
                    : "2xl:top-[55%]"
                }`,
                isSnapOpen && "right-0 scale-[0.9]",
                isSmallScreen &&
                  "opacity-0 transition-all duration-300 ease-in-out group-hover:opacity-100",
              )}
            />
          ) : (
            <CosmoQuickBuyButton
              mintAddress={data?.mint}
              amount={amount}
              className={cn(
                `absolute right-[12px] top-1/2 z-[60] flex w-auto flex-shrink-0 -translate-y-1/2 items-center justify-center xl:top-2/3 ${
                  (currentButtonPreset === "tripleextralarge" &&
                    currentAvatarPreset !== "normal" &&
                    currentAvatarPreset !== "large") ||
                  (currentButtonPreset === "quadripleextralarge" &&
                    currentAvatarPreset !== "normal" &&
                    currentAvatarPreset !== "large")
                    ? "2xl:top-2/3"
                    : "2xl:top-[55%]"
                }`,
                isSnapOpen && "right-0 scale-[0.9]",
                isSmallScreen &&
                  `${currentButtonPreset === "tripleextralarge" || currentButtonPreset === "quadripleextralarge" ? "!top-[calc(100%_-_42px)]" : "!top-[calc(100%_-_32px)]"} ${remainingScreenWidth < 1350 || width! < 1380 ? "opacity-0" : "opacity-100"} transition-all duration-300 ease-in-out group-hover:opacity-100`,
              )}
            />
          )}
        </div>

        {/* <div className="absolute right-1 top-1 z-[1000] flex flex-col bg-black/80 text-xs text-white">
          <span>Remaining {remainingScreenWidth}</span>
          <span>
            Less Than 1400: {remainingScreenWidth < 1400 ? "🟢" : "🔴"}
          </span>
          <span>Is Small Screen: {isSmallScreen ? "🟢" : "🔴"}</span>
        </div> */}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Ultra-granular comparison for better memoization
    if (
      prevProps.column !== nextProps.column ||
      prevProps.isFirst !== nextProps.isFirst ||
      prevProps.amount !== nextProps.amount
    ) {
      return false;
    }

    const prevData = prevProps.data;
    const nextData = nextProps.data;

    // Only compare fields that affect rendering
    return (
      prevData.mint === nextData.mint &&
      prevData.last_update === nextData.last_update &&
      prevProps.amount === nextProps.amount
    );
  },
);
CosmoCard.displayName = "CosmoCard";
export default CosmoCard;
