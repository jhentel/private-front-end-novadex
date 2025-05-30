// ######## Libraries 📦 & Hooks 🪝 ########
import { usePnlTrackerFooterData } from "@/hooks/use-pnl-tracker-footer-data";
import { usePnlSettings } from "@/stores/use-pnl-settings";

// ######## Components 🧩 ########
import Image from "next/image";
import PnLTrackerSettingPopover, {
  PnLTrackerSettingTrigger,
} from "../PnLTrackerSettingsPopover";
import PnLTrackerModalCard from "../PnLTrackerModalCard";

// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { imageList } from "../PnLImageSelector";
import {
  formatAmountDollar,
  formatAmountWithoutLeadingZero,
} from "@/utils/formatAmount";

// ######## Types 🗨️ ########
import { CommonCardThemeProps, Size } from "../types";
import { PnLTrackerModalClose } from "../PnLTrackerModal";

export default function CardTheme6(props: CommonCardThemeProps) {
  const { profilePicture, userName, selectedTheme, selectedDisplayUSD } =
    usePnlSettings();
  const { totalBalance, totalProfitAndLoss, solPrice, isLoading } =
    usePnlTrackerFooterData();

  const getLogoTranslateY = () => {
    const multiplierHeight = profilePicture ? 0.6 : 0.5;
    return Math.max(17, Math.min(35, size.height * multiplierHeight));
  };

  const getLogoSize = () => {
    const multiplierWidth = profilePicture ? 0.15 : 0.25;
    const multiplierHeight = profilePicture ? 0.35 : 0.45;
    const minSize = Math.min(
      size.width * multiplierWidth,
      size.height * multiplierHeight,
    );

    if (size.width <= 300) return Math.min(56, minSize);

    return minSize;
  };

  const calculateFontSizeCta = () => {
    if (size.width <= 300) return Math.min(10, size.height * 0.1);
    if (size.width <= 400) return Math.min(12, size.height * 0.1);
    if (size.width <= 500) return Math.min(14, size.height * 0.1);
    if (size.width <= 600) return Math.min(16, size.height * 0.1);
    return Math.min(18, size.height * 0.1);
  };

  const { size, onClose } = props;
  const theme = imageList.find((theme) => theme.themeId === selectedTheme);

  const calculateFontSize = () => {
    if (size.height <= 100) return Math.min(6, size.height * 0.8);
    if (size.height <= 200) return Math.min(8, size.height * 0.8);
    if (size.height <= 300) return Math.min(10, size.height * 0.8);
    return Math.min(10, size.height * 0.8);
  };

  const fontSize = calculateFontSize();
  const fontSizeCta = calculateFontSizeCta();
  return (
    <PnLTrackerModalCard
      minSize={theme?.size as Size}
      maxWidth={550}
      maxHeight={300}
      {...props}
    >
      <div className="relative z-10 flex h-full w-full flex-col">
        {/* header card */}
        <div
          className={`relative z-[1000] flex w-full items-center justify-between ${size.width <= 300 ? "h-8 p-2" : "h-10 p-4"} pb-0`}
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
        <div
          className={cn(
            "absolute flex h-full w-full flex-col items-center justify-center bg-black/50 px-11",
            size.width < 400 && "px-6",
            size.width < 300 && "px-4",
          )}
        >
          <div className="relative flex w-full justify-between">
            <div className="items-left relative z-20 flex w-full flex-grow-0 flex-col justify-center">
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
            </div>
            <div
              className="absolute flex w-1/3 flex-col items-center justify-end"
              style={{
                right: size.width < 500 ? "-2%" : "-4%",
              }}
            >
              <Image
                width={getLogoSize()}
                height={getLogoSize()}
                alt="Nova 3D Logo"
                src={
                  profilePicture ? profilePicture : "/icons/footer/3d-logo.svg"
                }
                className={cn(
                  "pointer-events-none absolute left-1/2 top-0 z-[999] -translate-x-1/2",
                  profilePicture && "-top-2 rounded-[8px] drop-shadow-4xl",
                )}
                style={{
                  transform: profilePicture
                    ? `rotate(6deg) translateX(-70%)`
                    : `translateX(-50%) translateY(-${getLogoTranslateY()}%)`,
                }}
              />
            </div>
          </div>
          <div className="z-20 flex w-full items-baseline justify-between">
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
                display="usd"
                amount={
                  isLoading
                    ? "-"
                    : formatAmountDollar(
                        totalProfitAndLoss * solPrice,
                        "suffix",
                      )
                }
                isProfit={totalProfitAndLoss >= 0}
              />
            )}
            <div className="z-10 flex h-fit justify-center rounded-full bg-white px-3">
              <span
                className="whitespace-nowrap font-geistBold"
                style={{
                  fontSize: `${fontSizeCta}px`,
                }}
              >
                !NOVA IN CHAT
              </span>
            </div>
          </div>

          <Image
            src={"/images/pnl-tracker/bg-theme-6.webp"}
            alt="PnL Background"
            priority
            fill
            quality={75}
            className="pointer-events-none size-full border-[4px] border-black object-cover p-[1px]"
          />
        </div>
      </div>
    </PnLTrackerModalCard>
  );
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
      return Math.min(size.height * 0.16, size.width * 5.5);
    if (size.height <= 300)
      return Math.min(size.height * 0.1, size.width * 5.5);
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
          size.height > 200 && "pb-3",
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
      return Math.min(size.height * 0.08, size.width * 5.5);
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
