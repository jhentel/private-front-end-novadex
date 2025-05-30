// ######## Libraries 📦 & Hooks 🪝 ########
import { usePnlSettings } from "@/stores/use-pnl-settings";
import { usePnlTrackerFooterData } from "@/hooks/use-pnl-tracker-footer-data";

// ######## Components 🧩 ########
import Image from "next/image";
import PnLTrackerSettingPopover, {
  PnLTrackerSettingTrigger,
} from "../PnLTrackerSettingsPopover";
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

export default function CardTheme5(props: CommonCardThemeProps) {
  const { selectedDisplayUSD, profilePicture, userName } = usePnlSettings();
  const {
    totalBalance,
    totalProfitAndLoss,
    totalProfitAndLossPercentage,
    solPrice,
    isLoading,
  } = usePnlTrackerFooterData();

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
          className={`relative flex w-full items-center justify-center ${size.width <= 300 ? "h-8 p-2" : "h-10 p-4"} pb-0`}
        >
          <div
            className={cn(
              "absolute right-4 flex gap-2 opacity-0 duration-100 group-hover:opacity-100",
            )}
          >
            <PnLTrackerSettingTrigger />
            <PnLTrackerModalClose onClose={onClose} />
          </div>
        </div>

        {/* Main Content */}
        <div className="absolute -z-10 h-full w-full bg-black/50">
          <div
            className={cn(
              "absolute inset-0 z-10 flex flex-col items-center justify-center overflow-hidden",
              size.width < 300 ? "gap-2" : size.width < 500 ? "gap-4" : "gap-6",
            )}
          >
            <div
              className="flex w-full justify-evenly"
              style={{
                paddingLeft: calculatePadding(size),
                paddingRight: calculatePadding(size),
              }}
            >
              {/* Right Section */}
              <div className="flex w-full flex-col">
                <div className="flex items-center gap-2">
                  <Image
                    src={
                      profilePicture
                        ? profilePicture
                        : "/icons/wallet-yellow.svg"
                    }
                    alt="Profile"
                    quality={100}
                    width={Math.min(size.width * 0.1, size.height * 0.05)}
                    height={Math.min(size.width * 0.1, size.height * 0.05)}
                    className={cn("pointer-events-none object-contain")}
                  />
                  <span
                    className="whitespace-nowrap text-white/80"
                    style={{
                      fontSize: `${fontSize}px`,
                    }}
                  >
                    {userName ? userName : "My"} Balance
                  </span>
                </div>
                {selectedDisplayUSD === "SOL" ||
                selectedDisplayUSD === "Both" ? (
                  <DisplayedAmount
                    size={size}
                    amount={
                      isLoading
                        ? "-"
                        : formatAmountWithoutLeadingZero(totalBalance, 2)
                    }
                    color="default"
                  />
                ) : (
                  <DisplayedAmount
                    size={size}
                    amount={
                      isLoading
                        ? "-"
                        : formatAmountDollar(totalBalance * solPrice, "prefix")
                    }
                    color="default"
                    prefix=""
                    display="usd"
                  />
                )}
                <div
                  className={cn(
                    "mt-1 font-semibold",
                    Number(totalProfitAndLossPercentage) >= 0
                      ? "text-[#0FF7AD]"
                      : "text-[#FF1212]",
                  )}
                  style={{
                    fontSize: `${calculateFooterFontSize(size)}px`,
                  }}
                >
                  {Number(totalProfitAndLossPercentage) >= 0 ? "↑ " : "↓ "}
                  {isLoading
                    ? "-"
                    : totalProfitAndLossPercentage.toFixed(2)}%{" "}
                  {selectedDisplayUSD === "USD" ||
                  selectedDisplayUSD === "Both" ? (
                    <span
                      className={cn("ml-2 font-normal text-white/60", {
                        hidden: selectedDisplayUSD === "USD",
                      })}
                    >
                      {isLoading
                        ? "-"
                        : formatAmountDollar(totalBalance * solPrice, "prefix")}
                    </span>
                  ) : null}
                </div>
              </div>

              <Image
                src="/icons/footer/3d-logo.svg"
                alt="Nova Icon"
                quality={100}
                width={Math.min(size.width * 0.08, size.height * 0.5)}
                height={Math.min(size.width * 0.08, size.height * 0.5)}
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform object-contain"
              />

              {/* Left Section */}
              <div className="flex w-full flex-col items-end">
                <div className="flex items-center gap-2">
                  <Image
                    src={"/icons/profit.svg"}
                    alt="Profile"
                    quality={100}
                    width={Math.min(size.width * 0.1, size.height * 0.05)}
                    height={Math.min(size.width * 0.1, size.height * 0.05)}
                    className={cn("pointer-events-none object-contain")}
                  />
                  <span
                    className="whitespace-nowrap text-white/80"
                    style={{
                      fontSize: `${fontSize}px`,
                    }}
                  >
                    Profit Today
                  </span>
                </div>
                {selectedDisplayUSD === "SOL" ||
                selectedDisplayUSD === "Both" ? (
                  <DisplayedAmount
                    size={size}
                    amount={
                      isLoading
                        ? "-"
                        : formatAmountWithoutLeadingZero(totalProfitAndLoss, 2)
                    }
                    color={totalProfitAndLoss >= 0 ? "profit" : "loss"}
                    prefix={totalProfitAndLoss >= 0 ? "+" : ""}
                  />
                ) : (
                  <DisplayedAmount
                    size={size}
                    amount={
                      isLoading
                        ? "-"
                        : formatAmountDollar(
                            totalProfitAndLoss * solPrice,
                            "prefix",
                          )
                    }
                    color={totalProfitAndLoss >= 0 ? "profit" : "loss"}
                    prefix={totalProfitAndLoss >= 0 ? "+" : ""}
                    display="usd"
                  />
                )}
                <div
                  className={cn(
                    "text-sm font-semibold",
                    Number(totalProfitAndLossPercentage) >= 0
                      ? "text-[#0FF7AD]"
                      : "text-[#FF1212]",
                  )}
                  style={{
                    fontSize: `${calculateFooterFontSize(size)}px`,
                  }}
                >
                  {Number(totalProfitAndLossPercentage) >= 0 ? "↑ " : "↓ "}
                  {isLoading
                    ? "-"
                    : totalProfitAndLossPercentage.toFixed(2)}%{" "}
                  {selectedDisplayUSD === "USD" ||
                  selectedDisplayUSD === "Both" ? (
                    <span
                      className={cn("ml-2 font-normal text-white/60", {
                        hidden: selectedDisplayUSD === "USD",
                      })}
                    >
                      {isLoading
                        ? "-"
                        : formatAmountDollar(
                            totalProfitAndLoss * solPrice,
                            "prefix",
                          )}
                    </span>
                  ) : null}{" "}
                </div>
              </div>
              <Image
                src={"/images/pnl-tracker/bg-theme-5.webp"}
                alt="PnL Background"
                fill
                priority
                quality={75}
                className="pointer-events-none -z-10 size-full border-[4px] border-black object-cover p-[1px]"
              />
            </div>
          </div>
        </div>
      </div>
    </PnLTrackerModalCard>
  );
}

function calculateHeadingFontSize(size: { width: number; height: number }) {
  if (size.width <= 300) return Math.min(10, size.width * 0.055);
  if (size.width <= 400) return Math.min(12, size.width * 0.055);
  return 14;
}

function calculateFooterFontSize(size: { width: number; height: number }) {
  if (size.width <= 300) return Math.min(8, size.width * 0.055);
  if (size.width <= 400) return Math.min(10, size.width * 0.055);
  return Math.min(12, size.width * 0.055);
}

function calculatePadding(size: { width: number; height: number }) {
  if (size.width <= 400) return Math.min(16, size.width * 0.055);
  return Math.min(40, size.width * 0.06);
}

function DisplayedAmount({
  amount,
  size,
  prefix = "",
  color,
  display = "sol",
}: {
  size: { width: number; height: number };
  amount: string;
  prefix?: string;
  color: "default" | "profit" | "loss";
  display?: "sol" | "usd";
}) {
  // const calculateFontSize = () => {
  //   const baseSize = Math.min(size.width * 0.2, size.height);
  //   const fontSize = baseSize * 0.2;
  //   const maxFontSize = Math.max(fontSize, 32);
  //
  //   if (size.width <= 300) return Math.min(maxFontSize, 16);
  //   if (size.width <= 400) return Math.min(maxFontSize, 18);
  //   if (size.width <= 500) return Math.min(maxFontSize, 24);
  //   return Math.min(maxFontSize, 28);
  // };

  const calculateFontSize = () => {
    if (size.width <= 300) return Math.min(18, size.height * 0.15);
    if (size.width <= 400) return Math.min(24, size.height * 0.15);
    if (size.width <= 500) return Math.min(28, size.height * 0.19);
    if (size.width <= 600) return Math.min(32, size.height * 0.19);
    return Math.min(32, size.height * 0.19);
  };

  const fontSize = calculateFontSize();
  return (
    <div className={cn("z-50 flex items-center justify-start gap-2")}>
      <h3
        className={cn(
          "bg-white bg-clip-text font-outfitBold text-transparent drop-shadow-4xl",
          color === "profit" && "text-[#0FF7AD]",
          color === "loss" && "text-[#FF1212]",
        )}
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: `${fontSize * 1.5}px`,
        }}
      >
        {prefix}
        {amount}
      </h3>
      <Image
        src={
          color === "default"
            ? "/images/pnl-tracker/solana-white.png"
            : color === "profit"
              ? "/images/pnl-tracker/solana-green.png"
              : "/images/pnl-tracker/solana-red.png"
        }
        alt="Solana Icon"
        quality={100}
        width={32}
        height={32}
        className={cn(
          "pointer-events-none object-contain",
          display === "usd" && "hidden",
        )}
        style={{
          width: `${fontSize * 0.8}px`,
          height: `${fontSize * 0.8}px`,
        }}
      />
    </div>
  );
}
