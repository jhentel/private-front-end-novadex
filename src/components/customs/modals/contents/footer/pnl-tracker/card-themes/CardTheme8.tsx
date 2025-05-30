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

// ######## Constants ☑️ ########
// TODO : Change this with actual profit data
import { dummyPnlMonthly } from "@/constants/dummy-pnl-monthly";

// ######## Types 🗨️ ########
import { CommonCardThemeProps, Size } from "../types";
import { imageList } from "../PnLImageSelector";
import {
  formatAmountDollar,
  formatAmountWithoutLeadingZero,
} from "@/utils/formatAmount";
import { PnLTrackerModalClose } from "../PnLTrackerModal";

export default function CardTheme8(props: CommonCardThemeProps) {
  const { selectedDisplayUSD, selectedTheme } = usePnlSettings();
  const {
    totalBalance,
    isLoading,
    solPrice,
    totalProfitAndLoss,
    totalProfitAndLossPercentage,
  } = usePnlTrackerFooterData();

  const { size, onClose } = props;
  const theme = imageList.find((theme) => theme.themeId === selectedTheme);

  return (
    <PnLTrackerModalCard minSize={theme?.size as Size} {...props}>
      <div className="relative z-10 flex h-full w-full flex-col">
        <div
          className={cn(
            "pointer-events-none absolute -right-[3.9rem] top-1/2 z-[1000] size-[120px] -translate-y-1/2 drop-shadow-4xl",
          )}
        >
          <Image
            src="/images/pnl-tracker-eight-nova-logo.png"
            alt="Nova Logo"
            fill
            className="object-contain"
          />
        </div>

        {/* Header Card */}
        <div
          className={`relative z-[1000] flex w-full items-center justify-start ${size.width <= 300 ? "h-8 p-2" : "h-10 p-4"} pb-0`}
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
        <div className="absolute -z-10 h-full w-full bg-black/50">
          <div
            className={cn(
              "absolute inset-0 z-10 flex items-center justify-center overflow-hidden",
              size.width < 300
                ? "gap-4"
                : size.width < 500
                  ? "gap-8"
                  : "gap-10",
            )}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Image
                  src="/icons/wallet-yellow.svg"
                  alt="Sol Icon"
                  quality={100}
                  width={16}
                  height={16}
                  className="pointer-events-none size-4 object-contain"
                />
                <span className="text-sm text-white/80">My Balance</span>
              </div>
              {selectedDisplayUSD === "SOL" || selectedDisplayUSD === "Both" ? (
                <SolanaWithIcon
                  size={size}
                  amount={
                    isLoading
                      ? "-"
                      : formatAmountWithoutLeadingZero(totalBalance, 2)
                  }
                />
              ) : null}
              <div
                className={cn(
                  "mt-1 text-sm font-semibold",
                  Number(totalProfitAndLossPercentage) > 0
                    ? "text-[#0FF7AD]"
                    : "text-[#FF1212]",
                )}
              >
                {Number(totalProfitAndLossPercentage) > 0 ? "↑ " : "↓ "}
                {isLoading
                  ? "-"
                  : totalProfitAndLossPercentage.toFixed(2)}%{" "}
                {selectedDisplayUSD === "USD" ||
                selectedDisplayUSD === "Both" ? (
                  <span
                    className={cn("ml-2 font-normal text-white/60", {
                      "text-2xl font-bold text-white":
                        selectedDisplayUSD === "USD",
                    })}
                  >
                    {isLoading
                      ? "-"
                      : formatAmountDollar(totalBalance * solPrice, "suffix")}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Image
                  src="/icons/profit.svg"
                  alt="Profit Icon"
                  quality={100}
                  width={16}
                  height={16}
                  className="pointer-events-none size-4 object-contain"
                />
                <span className="text-sm text-white/80">Profit Today</span>
              </div>
              {selectedDisplayUSD === "SOL" || selectedDisplayUSD === "Both" ? (
                <SolanaWithIcon
                  size={size}
                  amount={
                    isLoading
                      ? "-"
                      : formatAmountWithoutLeadingZero(totalProfitAndLoss, 2)
                  }
                  prefix={totalProfitAndLoss > 0 ? "+" : ""}
                />
              ) : null}
              <div
                className={cn(
                  "mt-1 text-sm font-semibold",
                  Number(totalProfitAndLossPercentage) > 0
                    ? "text-[#0FF7AD]"
                    : "text-[#FF1212]",
                )}
              >
                {Number(totalProfitAndLossPercentage) > 0 ? "↑ " : "↓ "}
                {isLoading
                  ? "-"
                  : totalProfitAndLossPercentage.toFixed(2)}%{" "}
                {selectedDisplayUSD === "USD" ||
                selectedDisplayUSD === "Both" ? (
                  <span
                    className={cn("ml-2 font-normal text-white/60", {
                      "text-2xl font-bold text-white":
                        selectedDisplayUSD === "USD",
                    })}
                  >
                    {isLoading
                      ? "-"
                      : formatAmountDollar(
                          totalProfitAndLoss * solPrice,
                          "suffix",
                        )}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="w-[45%]">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-geistMonoSemiBold text-sm text-white">
                  Win/Loss This Month
                </h3>
                <p className="font-geistMonoSemiBold text-sm text-white">
                  +782.29 Solana
                </p>
              </div>

              {/* Grid of dots */}
              <div className="flex flex-wrap gap-2">
                {dummyPnlMonthly.map((value) => {
                  let color = "bg-gray-800";

                  if (value.type === "profit") {
                    if (value.percentage < 1) {
                      color = "bg-[#07513A]";
                    } else {
                      color =
                        "bg-[#12FFAB] shadow-[0px_0px_40px_1px_rgba(18,255,171,1)]";
                    }
                  }
                  if (value.type === "loss")
                    color =
                      value.percentage < 0.5 ? "bg-[#510707]" : "bg-[#FF1212]";
                  return (
                    <div
                      key={value.date}
                      className={`${color} size-2.5 rounded-full`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          <Image
            src={"/images/pnl-tracker/bg-theme-8.webp"}
            alt="PnL Background"
            priority
            fill
            quality={75}
            className="h-full w-full object-cover p-[1px]"
          />
        </div>
      </div>
    </PnLTrackerModalCard>
  );
}

function SolanaWithIcon({
  amount,
  size,
  prefix = "",
}: {
  size: { width: number; height: number };
  amount: string;
  prefix?: string;
}) {
  const calculateFontSize = () => {
    const baseSize = Math.min(size.width * 0.4, size.height * 0.42);
    const fontSize = baseSize * 0.7;
    return Math.min(Math.max(fontSize, 28), 84);
  };

  const fontSize = calculateFontSize();
  return (
    <div className={cn("z-50 flex items-center justify-start gap-2")}>
      <h3
        className={cn(
          "bg-white from-[#D179F3] to-[#EDD8F8] bg-clip-text py-3 font-outfitBold text-transparent drop-shadow-4xl",
        )}
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: `${fontSize}px`,
        }}
      >
        {prefix}
        {amount}
      </h3>
      <Image
        src="/images/Solana-white.png"
        alt="Solana Icon"
        quality={100}
        width={32}
        height={32}
        className={cn("pointer-events-none object-contain")}
        style={{
          width: `${fontSize * 0.8}px`,
          height: `${fontSize * 0.8}px`,
        }}
      />
    </div>
  );
}
