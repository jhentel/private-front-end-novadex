"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useEffect, useCallback, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useTokenMessageStore } from "@/stores/token/use-token-messages.store";
import { useWatchlistTokenStore } from "@/stores/use-watchlist-token.store";
import { useCustomizeSettingsStore } from "@/stores/setting/use-customize-settings.store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useHiddenTokensStore } from "@/stores/cosmo/use-hidden-tokens.store";
import { useWindowSize } from "@/hooks/use-window-size";
import toast from "react-hot-toast";
// ######## APIs 🛜 ########
import {
  fetchAdditionalTokenData,
  TokenSecurityData,
} from "@/apis/rest/tokens";
import { TokenInformationSetting } from "@/apis/rest/settings/settings";
import { addToWatchlist, removeFromWatchlist } from "@/apis/rest/watchlist";
import { getHiddenTokens } from "@/apis/rest/cosmo";
import { hideCosmoToken } from "@/apis/rest/cosmo";
// ######## Components 🧩 ########
import Image from "next/image";
import Link from "next/link";
import Separator from "@/components/customs/Separator";
import Copy from "@/components/customs/Copy";
import AvatarWithBadges from "@/components/customs/AvatarWithBadges";
import GradientProgressBar from "@/components/customs/GradientProgressBar";
import SocialLinkButton from "@/components/customs/buttons/SocialLinkButton";
import { CachedImage } from "@/components/customs/CachedImage";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import TokenImageHover from "@/components/customs/TokenImageHover";
import CustomToast from "@/components/customs/toasts/CustomToast";
import SocialLinks from "@/components/customs/cards/partials/SocialLinks";
import TokenDexPaidImageHover from "@/components/customs/TokenDexPaidImageHover";
// ######## Types 🗨️ ########
import { BadgeType } from "@/components/customs/AvatarWithBadges";
import { PriceInfo, TokenInfo } from "@/types/ws-general";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import {
  formatAmountDollar,
  formatAmountWithoutLeadingZero,
} from "@/utils/formatAmount";
import truncateCA from "@/utils/truncateCA";
import { handleGoogleLensSearch } from "@/utils/handleGoogleLensSearch";
import useSocialFeedMonitor from "@/hooks/use-social-feed-monitor";
import { AnimatedGradient } from "@/components/customs/cards/footer/DiscordMonitorCard";

const gradientMap = {
  none: {
    border: "",
    animation: "none",
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

export default React.memo(function TokenInformation({
  initTokenInfo,
  initPrice,
}: {
  initTokenInfo: TokenInfo | null;
  initPrice: PriceInfo | null;
}) {
  const searchParams = useSearchParams();
  const params = useParams();
  const { discordMessages } = useSocialFeedMonitor();

  const tokenMint = (params?.["mint-address"] as string) || "";
  const tokenSymbol = searchParams?.get("symbol") || "";
  const tokenName = searchParams?.get("name") || "";
  const tokenDex = searchParams?.get("dex") || "";
  const tokenImage = searchParams?.get("image") || "";
  const tokenTwitter = searchParams?.get("twitter") || "";
  const tokenTelegram = searchParams?.get("telegram") || "";
  const tokenWebsite = searchParams?.get("website") || "";
  const tokenInstagram = searchParams?.get("instagram") || "";
  const tokenYoutube = searchParams?.get("youtube") || "";
  const tokenTiktok = searchParams?.get("tiktok") || "";
  const tokenMcap = searchParams?.get("market_cap_usd") || "";
  const tokenLiquidity = searchParams?.get("liquidity_usd") || "";
  const tokenProgress = Number(searchParams?.get("progress")) || 0;

  const tokenData = useTokenMessageStore((state) => state.tokenInfoMessage);
  const priceMessage = useTokenMessageStore((state) => state.priceMessage);

  const discordData = discordMessages.filter(
    (msg) => msg.address === tokenMint,
  );

  const watchListToken = useWatchlistTokenStore(
    (state) => state.watchlistToken,
  );
  const oldestTokenMint = useWatchlistTokenStore(
    (state) => state.oldestTokenMint,
  );

  const isWatchListToken = watchListToken
    .map((wl) => wl.mint)
    ?.includes(tokenMint);

  const {
    presets: customizedSettingPresets,
    activePreset: customizedSettingActivePreset,
  } = useCustomizeSettingsStore();

  const currentTokenInformationPreset =
    customizedSettingPresets[customizedSettingActivePreset]
      .tokenInformationSetting || "normal";

  const setGlobalHiddenTokens = useHiddenTokensStore(
    (state) => state.setHiddenTokens,
  );
  const hiddenTokens = useHiddenTokensStore((state) => state.hiddenTokens);
  const hideToken = useHiddenTokensStore((state) => state.hideToken);
  const unhideToken = useHiddenTokensStore((state) => state.unhideToken);
  const isTokenHidden = useHiddenTokensStore((state) =>
    state.isTokenHidden(tokenMint),
  );
  const { data: hiddenTokensData, isLoading: isLoadingHiddenTokens } = useQuery(
    {
      queryKey: ["hidden-tokens"],
      queryFn: getHiddenTokens,
      retry: 3,
    },
  );
  useEffect(() => {
    if (hiddenTokensData && !isLoadingHiddenTokens) {
      setGlobalHiddenTokens(hiddenTokensData);
      /* console.log({ hiddenTokensData }) */;
    }
  }, [hiddenTokensData, isLoadingHiddenTokens, setGlobalHiddenTokens]);

  const queryClient = useQueryClient();
  const addToWatchlistMutation = useMutation({
    mutationFn: addToWatchlist,
    onSuccess: (data) => {
      /* console.log("WATCHLIST ADD SUCCESS ✅", data) */;

      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message="Added to Watchlist"
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
  const removeFromWatchlistMutation = useMutation({
    mutationFn: removeFromWatchlist,
    onSuccess: (data) => {
      /* console.log("WATCHLIST REMOVE SUCCESS ⭕", data) */;

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
  const finalTokenInfo = useMemo(
    () => (tokenData.name ? tokenData : initTokenInfo),
    [tokenData, initTokenInfo],
  );

  const finalPrice = useMemo(
    () => (priceMessage.market_cap_usd ? priceMessage : initPrice),
    [priceMessage, initPrice],
  );

  const handleWatchListToken = useCallback(() => {
    if (isWatchListToken) {
      removeFromWatchlistMutation.mutate(tokenData.mint ?? tokenMint);
    } else {
      addToWatchlistMutation.mutate(tokenData.mint ?? tokenMint);
      if (watchListToken.length >= 10) {
        removeFromWatchlistMutation.mutate(oldestTokenMint);
      }
    }
  }, [
    finalTokenInfo?.image,
    finalTokenInfo?.symbol,
    tokenData?.mint,
    tokenImage,
    tokenSymbol,
    tokenMint,
    isWatchListToken,
    addToWatchlistMutation,
    removeFromWatchlistMutation,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (finalTokenInfo?.mint && finalPrice?.market_cap_usd && tokenSymbol) {
      const paramsToRemove = [
        "symbol",
        "name",
        "image",
        "twitter",
        "telegram",
        "website",
        "market_cap_usd",
        "liquidity_usd",
        "progress",
      ];

      // console.log("SP 💘 - TOKEN INFO PARAMS ", {
      //   tokenMint,
      //   tokenSymbol,
      //   tokenDex,
      // });

      const url = new URL(window.location.href);
      paramsToRemove.forEach((param) => url.searchParams.delete(param));
      window.history.replaceState({}, "", url);
    }
  }, [finalTokenInfo?.mint, finalPrice?.market_cap_usd]);

  const { width } = useWindowSize();

  const { data: additionalTokenData, isLoading: isFetchingAdditionalData } =
    useQuery<TokenSecurityData>({
      queryKey: ["token-security", tokenMint],
      queryFn: () => fetchAdditionalTokenData(tokenMint, tokenData?.pair),
      enabled: Boolean(
        tokenMint &&
          tokenData?.pair &&
          (finalTokenInfo?.dex
            ? finalTokenInfo.dex !== "Pump.Fun"
            : tokenDex !== "Pump.Fun"),
      ),
    });

  /* console.log("finalTokenInfo", finalTokenInfo) */;

  let gradient: "gold" | "silver" | "bronze" | "none" = "none";

  if (discordData.length > 0) {
    if (discordData[0].total_count >= 1 && discordData[0].total_count < 3) {
      gradient = "bronze";
    } else if (
      discordData[0].total_count >= 3 &&
      discordData[0].total_count < 8
    ) {
      gradient = "silver";
    } else if (discordData[0].total_count >= 8) {
      gradient = "gold";
    }
  }

  const { border, animation } = gradientMap[gradient];

  return (
    <div className="w-full rounded-[8px] border border-border bg-[#080811]">
      <div className="flex w-full flex-col gap-y-3 px-[12px] py-[10px] md:p-4">
        <div className="flex h-auto w-full items-center justify-between">
          <div className="flex items-center gap-x-3">
            <HoverCard openDelay={0} closeDelay={0}>
              <HoverCardTrigger>
                <AvatarWithBadges
                  src={finalTokenInfo?.image || tokenImage}
                  symbol={finalTokenInfo?.symbol}
                  alt="Token Detail Image"
                  leftType={
                    finalTokenInfo?.dex === "Launch a Coin" ||
                    finalTokenInfo?.dex === "Raydium" ||
                    finalTokenInfo?.dex === "Meteora AMM V2" ||
                    finalTokenInfo?.dex === "Meteora AMM" ||
                    finalTokenInfo?.dex === "Pump.Swap"
                      ? finalTokenInfo?.origin_dex === "LaunchLab" &&
                        finalTokenInfo?.launchpad === "Bonk"
                        ? "bonk"
                        : finalTokenInfo?.origin_dex ===
                              "Dynamic Bonding Curve" &&
                            finalTokenInfo?.launchpad === "Launch a Coin"
                          ? "launch_a_coin"
                          : (finalTokenInfo?.origin_dex
                              ?.replace(/\./g, "")
                              ?.replace(/ /g, "_")
                              ?.toLowerCase() as BadgeType)
                      : undefined
                  }
                  rightType={
                    finalTokenInfo?.dex === "LaunchLab" &&
                    finalTokenInfo?.launchpad === "Bonk"
                      ? "bonk"
                      : finalTokenInfo?.dex === "Dynamic Bonding Curve" &&
                          finalTokenInfo?.launchpad === "Launch a Coin"
                        ? "launch_a_coin"
                        : (finalTokenInfo?.dex
                            ?.replace(/\./g, "")
                            ?.replace(/ /g, "_")
                            ?.toLowerCase() as BadgeType)
                  }
                  size="md"
                />
                <HoverCardContent
                  align="start"
                  // alignOffset={-120}
                  side="bottom"
                  sideOffset={-40}
                  className="relative h-40 w-40 overflow-hidden rounded-[8px] border-none"
                >
                  <TokenImageHover
                    src={finalTokenInfo?.image || tokenImage}
                    symbol={finalTokenInfo?.symbol || ""}
                    handleGoogleLensSearch={
                      finalTokenInfo?.image
                        ? (e) =>
                            handleGoogleLensSearch(e, finalTokenInfo.image!)
                        : undefined
                    }
                  />
                </HoverCardContent>
              </HoverCardTrigger>
            </HoverCard>
            <div className="flex flex-col">
              <div className="flex items-center gap-x-1.5">
                <h3 className="text-nowrap font-geistSemiBold text-base text-fontColorPrimary">
                  {finalTokenInfo?.symbol || tokenSymbol}
                </h3>
                <div className="-mt-0.5 flex items-center gap-x-0.5">
                  <Copy
                    value={finalTokenInfo?.mint || ""}
                    className="size-[18px]"
                    classNameChild="size-[18px]"
                    dataDetail={finalTokenInfo ?? undefined}
                  />

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {isWatchListToken ? (
                          <svg
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="aspect-square size-[18px] cursor-pointer duration-300"
                            onClick={handleWatchListToken}
                          >
                            <path
                              d="M8.39381 2L8.42649 2.00339C8.85088 2.04741 9.22622 2.30174 9.42266 2.68326L9.42693 2.69156L10.6793 5.2146L13.4758 5.62029C13.9485 5.68812 14.3436 6.01448 14.4999 6.46415L14.5038 6.47536C14.6543 6.93616 14.5243 7.4414 14.1719 7.77294L14.1708 7.774L12.0721 9.76044L12.5712 12.5227C12.6573 13.0012 12.4569 13.4852 12.0599 13.7633C11.67 14.0444 11.1559 14.0764 10.7348 13.8525L8.23285 12.5475L8.19586 12.5475L5.72621 13.8414C5.48428 13.963 5.20932 14.0063 4.93945 13.963L4.93072 13.9616L4.92202 13.96C4.24895 13.8326 3.8004 13.1917 3.91058 12.5159L3.91235 12.505L4.4129 9.73845L2.37882 7.7669C2.03225 7.43065 1.91014 6.92424 2.06816 6.46657C2.21994 6.02103 2.60578 5.69505 3.07228 5.62163L3.07984 5.62044L5.89924 5.21147L5.90785 5.21059L7.14364 2.67694L7.1474 2.66969C7.20598 2.55704 7.28405 2.4483 7.38331 2.35272L7.40747 2.32945L7.45162 2.29511C7.51184 2.23707 7.57727 2.18851 7.6456 2.14865L7.69411 2.12035L7.79678 2.08267L7.99756 2H8.39381Z"
                              fill="#FCBE78"
                            />
                          </svg>
                        ) : (
                          <svg
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="aspect-square size-[18px] cursor-pointer fill-[#9191A4] duration-300 hover:fill-[#FCFCFD]"
                            onClick={handleWatchListToken}
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M7.71533 2.00098H8.11158L8.14427 2.00437C8.56866 2.04839 8.94399 2.30272 9.14043 2.68424L9.1447 2.69254L10.3971 5.21558L13.1936 5.62127C13.1933 5.62123 13.1939 5.6213 13.1936 5.62127C13.6662 5.68909 14.0614 6.01545 14.2177 6.46512L14.2216 6.47634C14.3721 6.93714 14.2421 7.44238 13.8897 7.77391C13.8893 7.77427 13.8889 7.77462 13.8885 7.77498L11.7899 9.76142L12.289 12.5236C12.375 13.0022 12.1746 13.4862 11.7777 13.7643C11.3877 14.0453 10.8737 14.0774 10.4526 13.8535L7.95062 12.5485C7.95059 12.5485 7.95065 12.5485 7.95062 12.5485L7.91364 12.5485L5.44398 13.8424C5.20205 13.9639 4.92709 14.0073 4.65722 13.964L4.64849 13.9626L4.6398 13.961C3.96672 13.8336 3.51817 13.1927 3.62835 12.5169L3.63012 12.506L4.13068 9.73943L2.0966 7.76787C1.75003 7.43163 1.62791 6.92522 1.78593 6.46755C1.93771 6.02201 2.32356 5.69603 2.79006 5.62261L2.79761 5.62142L5.61701 5.21245L5.62562 5.21156L6.86141 2.67791L6.86518 2.67067C6.92376 2.55802 7.00183 2.44927 7.10108 2.35369L7.12524 2.33043L7.16939 2.29609C7.22961 2.23805 7.29504 2.18948 7.36337 2.14963L7.41188 2.12133L7.51455 2.08365L7.71533 2.00098ZM7.98548 3.27149L6.76037 5.78323C6.56973 6.16451 6.19941 6.42432 5.77572 6.47324L3.0016 6.87568L5.02346 8.83539C5.31685 9.12425 5.45151 9.53763 5.38474 9.94391L5.38308 9.95398L4.8862 12.7003L7.36147 11.4035C7.47608 11.3417 7.59791 11.303 7.71919 11.2849L7.76572 11.278H7.97487L7.98393 11.2782C8.17634 11.2837 8.3683 11.3321 8.54389 11.425L11.034 12.7238L10.5351 9.96227C10.4678 9.55648 10.6033 9.14193 10.8999 8.85448L10.9053 8.84927L12.9905 6.87561L10.2011 6.47096C9.79484 6.40871 9.44168 6.15209 9.25894 5.78018C9.25864 5.77956 9.25834 5.77894 9.25803 5.77832L8.01358 3.27149H7.98548Z"
                              fill="#9191A4"
                            />
                          </svg>
                        )}
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="z-[10000] w-full max-w-[260px] rounded-[4px] bg-[#202037] px-2 py-1"
                      >
                        <p className="inline-block text-xs">
                          Watch up to 10 tokens at a time. If you add more than
                          10 tokens, the newest watched token will replace the
                          oldest
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Link
                    href={`https://x.com/search?q=${finalTokenInfo?.mint}`}
                    target="_blank"
                    className="relative aspect-square h-[18px] w-[18px] flex-shrink-0 duration-300 hover:brightness-200"
                  >
                    <Image
                      src="/icons/search.svg"
                      alt="Search Icon"
                      fill
                      quality={50}
                      className="object-contain"
                    />
                  </Link>

                  <button
                    title="Hide Token"
                    className="relative z-[10] aspect-square size-[18px] flex-shrink-0"
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        if (isTokenHidden) {
                          unhideToken(tokenMint); // Store update
                          toast.custom((t: any) => (
                            <CustomToast
                              tVisibleState={t.visible}
                              message="Successfully unhidden token"
                              state="SUCCESS"
                            />
                          ));
                          await hideCosmoToken(
                            hiddenTokens.filter(
                              (hiddenToken) => hiddenToken !== tokenMint,
                            ),
                          ).then(() => {}); // API call (should be updated to unhide)
                        } else {
                          hideToken(tokenMint); // Store update
                          toast.custom((t: any) => (
                            <CustomToast
                              tVisibleState={t.visible}
                              message="Successfully hidden token"
                              state="SUCCESS"
                            />
                          ));
                          await hideCosmoToken([
                            ...hiddenTokens,
                            tokenMint,
                          ]).then(() => {}); // API call
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
                      alt={
                        isTokenHidden ? "Show Token Icon" : "Hide Token Icon"
                      }
                      height={18}
                      width={18}
                      quality={100}
                      className="object-contain grayscale-[0.1] saturate-0"
                    />
                  </button>

                  {/* <div className="flex h-[100px] w-[200px] flex-col bg-red-500">
                    {hiddenTokens.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div> */}
                </div>
              </div>
              <span className="inline-block text-nowrap text-xs text-[#9191A4]">
                {finalTokenInfo?.name || tokenName}
              </span>
            </div>
          </div>

          {/* <div className="flex flex-wrap items-center justify-end gap-2 p-2">
            {finalTokenInfo?.twitter && (
              <SocialLinkButton
                href={finalTokenInfo?.twitter || tokenTwitter}
                icon="x"
                label="Twitter"
                typeImage="svg"
              />
            )}
            {finalTokenInfo?.origin_dex === "Pump.Fun" ||
              (finalTokenInfo?.dex === "Pump.Swap" && (
                <SocialLinkButton
                  href={`https://pump.fun/${finalTokenInfo?.mint}`}
                  icon="pumpfun-gray"
                  label="Pumpfun"
                  typeImage="svg"
                />
              ))}
            {finalTokenInfo?.telegram && (
              <SocialLinkButton
                href={finalTokenInfo?.telegram || tokenTelegram}
                icon="telegram"
                label="Telegram"
                typeImage="svg"
              />
            )}
            {finalTokenInfo?.website && (
              <SocialLinkButton
                href={finalTokenInfo?.website || tokenWebsite}
                icon="web"
                label="Website"
                typeImage="svg"
              />
            )}
            {finalTokenInfo?.youtube && (
              <SocialLinkButton
                href={finalTokenInfo?.youtube || tokenYoutube}
                icon="youtube"
                label="YouTube"
                typeImage="svg"
              />
            )}
            {finalTokenInfo?.instagram && (
              <SocialLinkButton
                href={finalTokenInfo?.instagram || tokenInstagram}
                icon="instagram"
                label="Instagram"
                typeImage="svg"
              />
            )}
            {finalTokenInfo?.tiktok && (
              <SocialLinkButton
                href={finalTokenInfo?.tiktok || tokenTiktok}
                icon="tiktok"
                label="TikTok"
                typeImage="svg"
              />
            )}
          </div> */}
          <SocialLinks
            dex={finalTokenInfo?.dex || "Pump.Fun"}
            isFirst={false}
            twitter={finalTokenInfo?.twitter}
            mint={finalTokenInfo?.mint}
            telegram={finalTokenInfo?.telegram}
            website={finalTokenInfo?.website}
            instagram={finalTokenInfo?.instagram}
            tiktok={finalTokenInfo?.tiktok}
            youtube={finalTokenInfo?.youtube}
            isTokenPage
          />
        </div>

        <div className="flex items-center justify-between gap-x-2">
          <div className="flex items-center gap-x-3">
            <div className="flex items-center gap-x-1">
              <Link
                href={`https://solscan.io/token/${finalTokenInfo?.mint || tokenMint || ""}`}
                className="cursor-pointer text-xs text-primary duration-300 hover:text-fontColorPrimary"
              >
                Token ({truncateCA(finalTokenInfo?.mint || tokenMint || "", 8)})
              </Link>
              <Copy
                variant="white"
                value={finalTokenInfo?.mint || tokenMint || ""}
                dataDetail={{
                  mint: finalTokenInfo?.mint || tokenMint || "",
                  symbol: finalTokenInfo?.symbol || tokenSymbol,
                  name: finalTokenInfo?.name || tokenName,
                  image: finalTokenInfo?.image || tokenName,
                }}
              />
            </div>
            <Separator
              color="#202037"
              orientation="vertical"
              unit="fixed"
              fixedHeight={16}
            />
            <div className="flex items-center gap-x-1">
              <Link
                href={`https://solscan.io/account/${finalTokenInfo?.pair || ""}`}
                target="_blank"
                className="cursor-pointer text-xs text-primary duration-300 hover:text-fontColorPrimary"
              >
                Pair
              </Link>
              <Copy variant="white" value={finalTokenInfo?.pair || ""} />
            </div>
          </div>

          <div className="w-[100px]">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative z-20 flex w-full items-center gap-x-[10px]">
                    <GradientProgressBar
                      bondingCurveProgress={finalPrice?.progress || 0}
                    />
                    <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                      {finalPrice?.progress
                        ? Math.min(finalPrice?.progress, 100).toFixed(0)
                        : Math.min(tokenProgress, 100).toFixed(0)}
                      %
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="!-ml-[50px] rounded-[4px] bg-[#202037]"
                >
                  <span className="inline-block text-nowrap text-xs">
                    Bonding Curve Progress
                  </span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      <div
        className={cn(
          discordData?.length > 0
            ? `group z-[-10] rounded-[8px] p-[1.5px] ${border}`
            : "",
        )}
      >
        <div
          className={cn(
            "relative flex h-auto w-full flex-col gap-y-[10px] rounded-[8px] bg-gradient-to-b from-[#131320] via-[#0B0B14] to-[#131320] px-[16px] py-[10px]",
          )}
        >
          {discordData?.length > 0 && <AnimatedGradient color={animation} />}
          <div className="grid h-[40px] grid-cols-3 gap-x-2">
            <TokenInformationColumn
              variant={currentTokenInformationPreset}
              context="Market Cap"
            >
              <div className="flex items-center gap-x-1">
                <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                  {formatAmountDollar(
                    finalPrice?.market_cap_usd || tokenMcap || 0,
                  )}
                </span>
              </div>
            </TokenInformationColumn>
            <TokenInformationColumn
              variant={currentTokenInformationPreset}
              context="Price in"
            >
              <div className="flex items-center gap-x-0.5">
                {currentTokenInformationPreset === "normal" && (
                  <div className="relative -mt-0.5 aspect-auto h-[17px] w-[17px] flex-shrink-0">
                    <CachedImage
                      src="/icons/solana-sq.svg"
                      alt="Solana SQ Icon"
                      fill
                      quality={50}
                      className="object-contain"
                    />
                  </div>
                )}
                <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                  {Number(finalPrice?.price_sol) === 0 || !finalPrice?.price_sol
                    ? "N/A"
                    : formatAmountWithoutLeadingZero(
                        Number(finalPrice?.price_sol),
                        4,
                      )}
                </span>
              </div>
            </TokenInformationColumn>
            <TokenInformationColumn
              variant={currentTokenInformationPreset}
              context="Price in USD"
            >
              <div className="flex items-center gap-x-1">
                <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                  {Number(finalPrice?.price_usd_str) === 0 ||
                  !finalPrice?.price_usd_str
                    ? "N/A"
                    : formatAmountWithoutLeadingZero(
                        Number(finalPrice?.price_usd_str),
                        4,
                      )}
                </span>
              </div>
            </TokenInformationColumn>
          </div>

          <Separator />

          <div className="grid h-auto grid-cols-3 gap-x-2">
            <TokenInformationColumn
              variant={currentTokenInformationPreset}
              context="Liquidity"
              additionalTokenData={additionalTokenData}
              isFetching={isFetchingAdditionalData}
              isGraduated={
                !["Pump.Fun", "Moonshot", "LaunchLab"].includes(
                  finalTokenInfo?.dex || tokenDex,
                )
              }
            >
              <div className="flex items-center gap-x-1">
                <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                  {finalPrice?.liquidity_usd
                    ? formatAmountDollar(
                        finalPrice?.liquidity_usd || tokenLiquidity || 0,
                      )
                    : "N/A"}
                </span>
                {!isFetchingAdditionalData &&
                  currentTokenInformationPreset !== "simplify" &&
                  !["Pump.Fun", "Moonshot", "LaunchLab"].includes(
                    finalTokenInfo?.dex || tokenDex,
                  ) && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Image
                            src={
                              additionalTokenData?.liquidityLocked
                                ? "/icons/token/lock-blue-icon.svg"
                                : "/icons/token/unlock-red-icon.svg"
                            }
                            alt="Lock Icon"
                            height={12}
                            width={10}
                            className="ml-1"
                          />
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="rounded-[4px] bg-[#202037]"
                        >
                          <span className="inline-block text-nowrap text-xs">
                            {additionalTokenData?.liquidityLocked
                              ? "Locked"
                              : "Unlocked"}{" "}
                            Supply
                          </span>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
              </div>
            </TokenInformationColumn>
            <TokenInformationColumn
              variant={currentTokenInformationPreset}
              context="Supply"
            >
              <div className="flex items-center gap-x-1">
                <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                  {finalPrice?.supply
                    ? finalPrice?.supply > 999000000 &&
                      finalPrice?.supply <= 1000000001
                      ? "1B"
                      : formatAmountDollar(
                          Math.round(finalPrice?.supply),
                        )?.replace("$", "")
                    : 0}
                </span>
              </div>
            </TokenInformationColumn>
            <TokenInformationColumn
              variant={currentTokenInformationPreset}
              context="Dex Paid"
            >
              {isFetchingAdditionalData ? (
                <div className="flex h-[16px] w-full animate-pulse items-center justify-center bg-[#202037]"></div>
              ) : additionalTokenData?.dexPaid ? (
                <TooltipProvider>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <span className="inline-block w-fit font-geistSemiBold text-sm text-success">
                        Paid
                      </span>
                    </TooltipTrigger>

                    <TooltipContent
                      isWithAnimation={false}
                      align={width! > 640 ? "start" : "center"}
                      side="bottom"
                      tooltipArrowBgColor="#202037"
                      arrowWidth={17}
                      arrowHeight={9}
                      className={cn(
                        "z-[1000] bg-white/0 py-0 pl-0 drop-shadow-none backdrop-blur-none !transition-none",
                        width! > 640 ? "pr-6" : "pr-0",
                      )}
                    >
                      <div className="h-auto w-auto rounded-[4px] border border-border bg-[#202037] p-1">
                        <TokenDexPaidImageHover tokenMint={tokenMint} />
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <div className="flex items-center gap-x-1">
                  <span className="font-geistSemiBold text-sm text-destructive">
                    Unpaid
                  </span>
                </div>
              )}
            </TokenInformationColumn>
          </div>
          {discordData?.length > 0 && (
            <div className="flex items-center gap-x-1">
              <span className="inline-block text-wrap text-xs text-[#9191A4]">
                Groups{" "}
              </span>
              <TooltipProvider>
                <span className="ml-1 flex gap-x-0.5">
                  {discordData?.[0]?.group_counts.map((group) => (
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
                      <TooltipContent>{group.name}</TooltipContent>
                    </Tooltip>
                  ))}
                </span>
              </TooltipProvider>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

const TokenInformationColumn = ({
  context,
  children,
  variant,
  additionalTokenData,
  isFetching,
  isGraduated,
}: {
  context:
    | "Market Cap"
    | "Price in"
    | "Price in USD"
    | "Liquidity"
    | "Supply"
    | "Dex Paid";
  children: React.ReactNode;
  variant: TokenInformationSetting;
  additionalTokenData?: TokenSecurityData;
  isFetching?: boolean;
  isGraduated?: boolean;
}) => {
  const getSimplifyContext = () => {
    switch (context) {
      case "Market Cap":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Image
                  src="/icons/market-cap.svg"
                  alt="Market Cap Icon"
                  height={18}
                  width={18}
                  className="object-contain"
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="rounded-[4px] bg-[#202037]">
                <span className="inline-block text-nowrap text-xs">
                  {context}
                </span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case "Price in":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Image
                  src="/icons/price-in-sol.svg"
                  alt="Price In SOL Icon"
                  height={18}
                  width={18}
                  className="object-contain"
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="rounded-[4px] bg-[#202037]">
                <span className="inline-block text-nowrap text-xs">
                  {context} SOL
                </span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case "Price in USD":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Image
                  src="/icons/price-in-usd.svg"
                  alt="Price In USD Icon"
                  height={18}
                  width={18}
                  className="object-contain"
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="rounded-[4px] bg-[#202037]">
                <span className="inline-block text-nowrap text-xs">
                  {context}
                </span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case "Liquidity":
        return isGraduated
          ? !isFetching && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Image
                      src={
                        additionalTokenData?.liquidityLocked
                          ? "/icons/token/lock-blue-icon.svg"
                          : "/icons/token/unlock-red-icon.svg"
                      }
                      alt="Lock Icon"
                      height={14}
                      width={14}
                      className="object-contain"
                    />
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="rounded-[4px] bg-[#202037]"
                  >
                    <span className="inline-block text-nowrap text-xs">
                      {additionalTokenData?.liquidityLocked
                        ? "Locked"
                        : "Unlocked"}{" "}
                      Supply
                    </span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          : null;
      case "Supply":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Image
                  src="/icons/supply.svg"
                  alt="Supply Icon"
                  height={18}
                  width={18}
                  className="object-contain"
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="rounded-[4px] bg-[#202037]">
                <span className="inline-block text-nowrap text-xs">
                  {context}
                </span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case "Dex Paid":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Image
                  src="/icons/dex-paid.svg"
                  alt="Dex Paid Icon"
                  height={18}
                  width={18}
                  className="object-contain"
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="rounded-[4px] bg-[#202037]">
                <span className="inline-block text-nowrap text-xs">
                  {context}
                </span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
    }
  };
  return (
    <div
      className={cn(
        "col-span-1 flex h-full w-full flex-col justify-start gap-y-1",
        variant === "simplify" && "flex-row items-center gap-1",
      )}
    >
      <span className="inline-block text-wrap text-xs text-[#9191A4]">
        {variant === "simplify" ? getSimplifyContext() : context}
      </span>
      {children}
    </div>
  );
};
