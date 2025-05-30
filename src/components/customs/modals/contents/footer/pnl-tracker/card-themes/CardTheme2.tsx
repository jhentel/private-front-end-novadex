// ######## Libraries 📦 & Hooks 🪝 ########
import { usePnlSettings } from "@/stores/use-pnl-settings";
import { usePnlTrackerFooterData } from "@/hooks/use-pnl-tracker-footer-data";

// ######## Components 🧩 ########
import Image from "next/image";
import { PnLTrackerSettingTrigger } from "../PnLTrackerSettingsPopover";
import PnLTrackerModalCard from "../PnLTrackerModalCard";

// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { imageList } from "../PnLImageSelector";

// ######## Types 🗨️ ########
import { CommonCardThemeProps, Size } from "../types";
import {
  formatAmountDollar,
  formatAmountWithoutLeadingZero,
} from "@/utils/formatAmount";
import { PnLTrackerModalClose } from "../PnLTrackerModal";

export default function CardTheme2(props: CommonCardThemeProps) {
  const { userName, profilePicture, selectedDisplayUSD } = usePnlSettings();
  const { solPrice, totalProfitAndLoss, totalBalance, isLoading } =
    usePnlTrackerFooterData();

  const { size, onClose } = props;
  const { selectedTheme } = usePnlSettings();
  const theme = imageList.find((theme) => theme.themeId === selectedTheme);

  const calculateFontSize = () => {
    if (size.height <= 100) return Math.min(6, size.height * 0.8);
    if (size.height <= 200) return Math.min(8, size.height * 0.8);
    if (size.height <= 300) return Math.min(10, size.height * 0.8);
    return Math.min(10, size.height * 0.8);
  };

  const fontSize = calculateFontSize();
  return (
    <PnLTrackerModalCard
      minSize={theme?.size as Size}
      maxWidth={550}
      maxHeight={300}
      {...props}
    >
      <div className="relative z-10 flex h-full w-full flex-col">
        <div
          className={cn(
            "pointer-events-none absolute -right-3 -top-4 z-[1000] aspect-square rotate-[4deg] drop-shadow-4xl",
            //   size.width <= 400
            //     ? "-right-6 -top-4"
            //     : size.width <= 500
            //       ? "-right-7 -top-5"
            //       : "-right-3 -top-4",
          )}
        >
          <Image
            src="/images/pnl-tracker/nova-badge.png"
            alt="Nova Badge"
            width={calculateBadgeSize(size)}
            height={calculateBadgeSize(size)}
            className="pointer-events-none object-cover"
          />
        </div>
        {/* Header Card */}
        <div
          className={`relative z-[1000] flex w-full items-center justify-start ${
            size.width <= 300 ? "h-8 p-2" : "h-10 p-4"
          } pb-0`}
        >
          <div
            className={cn(
              "flex gap-2 opacity-0 duration-100 group-hover:opacity-100",
            )}
          >
            <PnLTrackerSettingTrigger />
            <PnLTrackerModalClose onClose={onClose} />
          </div>
        </div>

        {/* Main Content */}
        <div className={cn("relative inset-[1px] -z-0 bg-black opacity-20")} />
        <div className="absolute -z-10 h-full w-full bg-black/50">
          <div
            className={cn(
              "absolute inset-0 z-10 flex items-center justify-center overflow-hidden",
              size.width < 300
                ? "gap-4"
                : size.width < 400
                  ? "gap-6"
                  : size.width < 500
                    ? "gap-8"
                    : "gap-10",
            )}
          >
            <div
              className={cn(
                "-ml-4 flex overflow-hidden rounded-xl drop-shadow-4xl",
              )}
              style={{
                height: `${Math.min(size.width * 0.1, size.height * 0.4)}px`,
                transform: "rotate(-6deg)",
                aspectRatio: "1/1",
              }}
            >
              <Image
                src={
                  profilePicture
                    ? profilePicture
                    : "/images/pnl-tracker/nova-logo-pfp-default.png"
                }
                alt="Profile picture"
                fill
                className="pointer-events-none inset-0 size-full object-cover"
              />
            </div>
            <div className="max-w-[75%]">
              <h3
                className={cn(
                  "-mb-1 text-left font-geistBold leading-none tracking-[0%] text-white",
                  size.height < 200 ? "text-[9px]" : "text-xs",
                )}
                style={{
                  fontSize: `${fontSize}px`,
                  filter: "drop-shadow(0px 8px 5px rgba(0,0,0,0.8))",
                }}
              >
                {userName ? userName : "My current"} balance :
              </h3>
              {selectedDisplayUSD === "SOL" || selectedDisplayUSD === "Both" ? (
                <DisplayedAmount
                  size={size}
                  amount={
                    isLoading
                      ? "-"
                      : formatAmountWithoutLeadingZero(totalBalance, 2)
                  }
                />
              ) : (
                <DisplayedAmount
                  size={size}
                  display="usd"
                  amount={
                    isLoading
                      ? "-"
                      : formatAmountDollar(totalBalance * solPrice, "prefix")
                  }
                />
              )}
              {selectedDisplayUSD === "SOL" || selectedDisplayUSD === "Both" ? (
                <DisplayedAmountWithText
                  size={size}
                  amount={
                    isLoading
                      ? "-"
                      : formatAmountWithoutLeadingZero(totalProfitAndLoss, 2)
                  }
                  isProfit={totalProfitAndLoss >= 0}
                />
              ) : (
                <DisplayedAmountWithText
                  size={size}
                  amount={
                    isLoading
                      ? "-"
                      : formatAmountDollar(
                          totalProfitAndLoss * solPrice,
                          "suffix",
                        )
                  }
                  isProfit={totalProfitAndLoss >= 0}
                  display="usd"
                />
              )}
            </div>
          </div>

          <Image
            src={"/images/pnl-tracker/bg-theme-2.webp"}
            alt="PnL Background"
            priority
            fill
            quality={75}
            className="pointer-events-none h-full w-full border-[4px] border-black object-cover p-[1px]"
          />
        </div>
      </div>
    </PnLTrackerModalCard>
  );
}

function calculateBadgeSize(size: { width: number; height: number }) {
  if (size.width <= 300) return Math.min(size.width * 0.14, size.height * 0.33);
  return Math.min(size.width * 0.18, size.height * 0.38);
}

function DisplayedAmount({
  amount,
  size,
  display = "sol",
}: {
  size: { width: number; height: number };
  amount: string;
  display?: "sol" | "usd";
}) {
  // const calculateFontSize = () => {
  //   if (size.width <= 300) return Math.min(32, size.height * 0.15);
  //   if (size.width <= 400) return Math.min(42, size.height * 0.16);
  //   if (size.width <= 500) return Math.min(48, size.height * 0.17);
  //   if (size.width <= 600) return Math.min(56, size.height * 0.18);
  //   return Math.min(64, size.height * 0.19);
  // };

  const calculateFontSize = () => {
    if (size.height <= 200)
      return Math.min(size.height * 0.12, size.width * 5.5);
    if (size.height <= 300)
      return Math.min(size.height * 0.12, size.width * 5.5);
    return Math.min(22, size.width * 1.9);
  };

  const calculateLineHeight = () => {
    if (size.height <= 300) return fontSize + 14;
    if (size.height <= 400) return fontSize + 16;
    if (size.height <= 500) return fontSize + 18;
    return fontSize + 24;
  };

  const fontSize = calculateFontSize();
  const lineHeight = calculateLineHeight();
  const iconSize = fontSize * 0.8;

  return (
    <div
      className={cn(
        "z-50 flex items-center justify-start",
        size.width <= 300 ? "gap-1" : size.width <= 400 ? "gap-1.5" : "gap-2",
      )}
    >
      <h3
        className={cn(
          "bg-gradient-to-t from-[#D179F3] via-[#DFA8F5] to-[#EDD8F8] bg-clip-text font-outfitBlack text-transparent drop-shadow-4xl",
          size.height > 400 && "pb-2",
        )}
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: `${lineHeight}px`,
          maxWidth: `${size.width * 0.8}px`,
        }}
      >
        {amount}
      </h3>
      {display === "sol" && (
        <Image
          src="/images/pnl-tracker/sol-theme-2.png"
          alt="Solana Icon"
          quality={100}
          width={32}
          height={32}
          className={cn("pointer-events-none flex-shrink-0 object-contain")}
          style={{
            width: `${iconSize}px`,
            height: `${iconSize}px`,
            marginBottom: `${fontSize * 0.1}px`,
          }}
        />
      )}
    </div>
  );
}

function DisplayedAmountWithText({
  amount,
  size,
  isProfit = true,
  display = "sol",
}: {
  size: { width: number; height: number };
  amount: string;
  isProfit?: boolean;
  display?: "sol" | "usd";
}) {
  const calculateFontSize = () => {
    if (size.height <= 200)
      return Math.min(size.height * 0.12, size.width * 5.5);
    if (size.height <= 300)
      return Math.min(size.height * 0.12, size.width * 5.5);
    return Math.min(22, size.width * 1.9);
  };

  const fontSize = calculateFontSize();

  return (
    <h3
      className={cn(
        "pb-1.5 font-outfitBold drop-shadow-4xl",
        isProfit
          ? "bg-gradient-to-t from-[#B0F379] to-[#D5F2D3] bg-clip-text text-transparent"
          : "bg-gradient-to-t from-[#FD2525] to-[#FFA7A9] bg-clip-text text-transparent",
      )}
      style={{
        fontSize: `${fontSize}px`,
        lineHeight: `${fontSize * 1.4}px`,
        filter: "drop-shadow(0px 4px 3px rgba(0,0,0,0.8))",
        maxWidth: `${size.width * 0.65}px`,
      }}
    >
      {isProfit ? "+" : ""}
      {amount} {display === "sol" && "Sol"} Today
    </h3>
  );
}
