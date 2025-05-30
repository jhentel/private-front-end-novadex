"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useMemo, useCallback } from "react";
import { useRouter } from "nextjs-toploader/app";
import { useSolPriceMessageStore } from "@/stores/use-solprice-message.store";
// ######## Components 🧩 ########
import Image from "next/image";
import Separator from "@/components/customs/Separator";
import QuickBuyButton from "@/components/customs/buttons/QuickBuyButton";
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
import SocialLinkButton from "@/components/customs/buttons/SocialLinkButton";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import {
  formatAmount,
  formatAmountDollar,
  formatCommaWithDecimal,
} from "@/utils/formatAmount";
import { truncateString } from "@/utils/truncateString";
// ######## Types 🗨️ ########
import { TrendingDataMessageType } from "@/types/ws-general";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchTokenData } from "@/utils/prefetch";
import { prefetchChart } from "@/apis/rest/charts";
import {
  useWalletHighlightStore,
  type WalletWithColor,
} from "@/stores/wallets/use-wallet-highlight-colors.store";
import { AvatarHighlightWrapper } from "@/components/customs/AvatarHighlightWrapper";

interface TrendingCardMobileProps {
  isFirst: boolean;
  tokenData: TrendingDataMessageType;
  trackedWalletsOfToken: Record<string, string[]>;
}

export default function TrendingCardMobile({
  isFirst,
  tokenData,
  trackedWalletsOfToken,
}: TrendingCardMobileProps) {
  const router = useRouter();

  // const walletColors = useWalletHighlightStore((state) => state.wallets);
  const walletHighlights = useMemo(() => {
    const walletsWithColor: WalletWithColor[] = [];
    const walletColors = useWalletHighlightStore.getState().wallets;

    const trackedWallets = trackedWalletsOfToken[tokenData.mint] || [];
    for (const address of trackedWallets) {
      const wallet = walletColors[address];
      if (
        wallet &&
        walletsWithColor.findIndex((w) => w.address === wallet.address) === -1
      ) {
        walletsWithColor.push(wallet);
      }
    }

    return walletsWithColor;
  }, [tokenData.mint, trackedWalletsOfToken]);

  const formatTimeAgo = (timestamp: number) => {
    if (timestamp === 0) return "0d 0h";
    const now = Math.floor(Date.now() / 1000);
    const diff = now - Math.floor(timestamp / 1000);

    if (diff < 60) return `${diff}s`;
    const minutes = Math.floor(diff / 60);
    if (minutes < 60) return `${minutes}m`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ${minutes % 60}m`;

    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  };

  const handleGoogleLensSearch = useCallback(
    (event: React.MouseEvent, imageUrl: string) => {
      event.stopPropagation();
      window.open(
        `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(imageUrl)}`,
        "_blank",
      );
    },
    [],
  );

  const queryClient = useQueryClient();
  let hoverTimeout: NodeJS.Timeout;
  return (
    <div
      onClick={() => {
        router.push("/token/" + tokenData.mint);
        prefetchChart(queryClient, tokenData.mint);
        // setTimeout(() => {
        //   prefetchCandles(data.mint);
        // }, 10);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        window.open("/token/" + tokenData.mint, "_blank");
      }}
      className="group mb-2 w-full flex-shrink-0 cursor-pointer overflow-hidden rounded-[8px] border border-border bg-transparent duration-300 hover:border-border"
    >
      {/* Header */}
      <div className="relative flex h-[40px] w-full items-center justify-between overflow-hidden bg-[#12121a] px-2">
        <div className="relative z-20 flex items-center gap-x-1">
          <AvatarHighlightWrapper
            size={36.4}
            walletHighlights={walletHighlights}
          >
            <AvatarWithBadges
              classNameParent="border-1 relative !size-[26.4px] flex aspect-square flex-shrink-0 items-center justify-center rounded-full border border-[#DF74FF]/30 bg-border/0 backdrop-blur-lg"
              src={tokenData?.image}
              symbol={tokenData?.symbol}
              alt={`${tokenData?.name} Image`}
              rightType={
                tokenData?.dex === "LaunchLab" &&
                tokenData?.launchpad === "Bonk"
                  ? "bonk"
                  : tokenData?.dex === "Dynamic Bonding Curve" &&
                      tokenData?.launchpad === "Launch a Coin"
                    ? "launch_a_coin"
                    : (tokenData?.dex
                        ?.replace(/\./g, "")
                        ?.replace(/ /g, "_")
                        ?.toLowerCase() as BadgeType)
              }
              handleGoogleLensSearch={(e) =>
                handleGoogleLensSearch(e, tokenData.image)
              }
              rightClassName="!size-3.5 -right-0.5 -bottom-[1.5px]"
              size="xs"
            />
          </AvatarHighlightWrapper>

          <h4 className="text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
            {truncateString(tokenData.name, 8)}
          </h4>
          <span className="inline-block text-nowrap text-[10px] uppercase leading-3 text-fontColorSecondary">
            {truncateString(tokenData.symbol, 6)}
          </span>
          <Copy value={tokenData.mint} dataDetail={tokenData} />
        </div>

        {/* Created On & Links */}
        <div className="relative z-20 flex items-center gap-x-2">
          <span className="inline-block text-nowrap font-geistSemiBold text-xs text-fontColorSecondary">
            {formatTimeAgo(tokenData.created)}
          </span>
          {(tokenData.twitter || tokenData.telegram || tokenData.website) && (
            <Separator
              color="#202037"
              orientation="vertical"
              unit="fixed"
              fixedHeight={18}
            />
          )}

          {(tokenData.twitter || tokenData.telegram || tokenData.website) && (
            <div className="flex items-center gap-x-1">
              {tokenData.twitter && (
                <SocialLinkButton
                  href={tokenData.twitter}
                  icon="x"
                  label="Twitter"
                  typeImage="svg"
                />
              )}
              {tokenData.telegram && (
                <SocialLinkButton
                  href={tokenData.telegram}
                  icon="telegram"
                  label="Telegram"
                  typeImage="svg"
                />
              )}
              {tokenData.website && (
                <SocialLinkButton
                  href={tokenData.website}
                  icon="web"
                  label="Website"
                  typeImage="svg"
                />
              )}
              {tokenData?.youtube && (
                <SocialLinkButton
                  href={tokenData?.youtube ?? ""}
                  icon="youtube"
                  label="YouTube"
                  typeImage="svg"
                />
              )}
              {tokenData?.instagram && (
                <SocialLinkButton
                  href={tokenData?.instagram ?? ""}
                  icon="instagram"
                  label="Instagram"
                  typeImage="svg"
                />
              )}
              {tokenData?.tiktok && (
                <SocialLinkButton
                  href={tokenData?.tiktok ?? ""}
                  icon="tiktok"
                  label="TikTok"
                  typeImage="svg"
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="relative flex w-full flex-col">
        <div className="flex w-full flex-col gap-y-3 px-2 py-3">
          <div className="flex items-center gap-x-4 min-[430px]:gap-x-6">
            {[
              {
                label: "Liquidity",
                value: `$${formatAmount(tokenData.liquidity_usd, 2)}`,
              },
              {
                label: "Market cap",
                value: `$${formatAmount(tokenData.market_cap_usd, 2)}`,
              },

              {
                label: "TXNS",
                value: formatAmount(tokenData.buys + tokenData.sells, 2),
              },
              {
                label: "Volume",
                value: `$${formatAmount(tokenData.volume_usd, 2)}`,
                className: "text-success",
              },
            ].map((item) => (
              <div key={item.label} className="flex flex-col gap-y-0.5">
                <span className="line-clamp-1 text-xs text-fontColorSecondary">
                  {item.label}
                </span>
                <span
                  className={cn(
                    "line-clamp-1 font-geistSemiBold text-xs text-fontColorPrimary",
                    item.className,
                  )}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-x-1">
            {[
              { period: "1M", value: tokenData["1m"] },
              { period: "5M", value: tokenData["5m"] },
              { period: "30M", value: tokenData["30m"] },
              { period: "1H", value: tokenData["1h"] },
            ].map((item) => (
              <div
                key={item.period}
                className="flex h-5 items-center justify-center gap-x-1 rounded-[4px] bg-white/[8%] p-1"
              >
                <span className="font-geistSemiBold text-xs text-fontColorSecondary">
                  {item.period}
                </span>
                <span
                  className={cn(
                    "font-geistSemiBold text-xs",
                    item.value >= 0 ? "text-success" : "text-destructive",
                  )}
                >
                  {formatCommaWithDecimal(item.value)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <Separator color="#202037" />

        <div className="flex h-[42px] w-full items-center justify-between p-2">
          <div className="flex items-center gap-x-2">
            <AuditResult
              isChecked={tokenData.mint_disabled}
              auditMetric="MAD"
              tooltipMessage="Mint Auth Disabled"
            />
            <AuditResult
              isChecked={tokenData.freeze_disabled}
              auditMetric="FAD"
              tooltipMessage="Freeze Auth Disabled"
            />
            <AuditResult
              isChecked={tokenData.burned}
              auditMetric="LPB"
              tooltipMessage="LP Burned"
            />
            <AuditResult
              isChecked={tokenData.top10 <= 15 ? true : false}
              auditMetric="T10"
              tooltipMessage="Top 10 Holders"
            />
            <AuditResult
              isChecked={tokenData.bundled}
              auditMetric="BT"
              tooltipMessage="Bundled Token"
            />
          </div>

          <div id={isFirst ? "trending-quick-buy-button-first" : undefined}>
            <QuickBuyButton mintAddress={tokenData.mint} variant="trending" />
          </div>
        </div>
      </div>
    </div>
  );
}

const AuditResult = ({
  isChecked,
  auditMetric,
  tooltipMessage,
}: {
  isChecked: boolean;
  auditMetric: string;
  tooltipMessage: string;
}) => {
  const imageURL = isChecked
    ? "/icons/audit-checked.png"
    : "/icons/audit-unchecked.png";
  const textColor = isChecked ? "#8CD9B6" : "#F65B93";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-x-1">
            <div className="relative aspect-auto h-5 w-5 flex-shrink-0">
              <Image
                src={imageURL}
                alt="Audit Status Icon"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
            <span
              style={{ color: textColor }}
              className="-mb-0.5 inline-block text-wrap font-geistSemiBold text-[10px]"
            >
              {auditMetric}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="mb-1.5">
          <p className="text-xs text-fontColorSecondary">{tooltipMessage}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
