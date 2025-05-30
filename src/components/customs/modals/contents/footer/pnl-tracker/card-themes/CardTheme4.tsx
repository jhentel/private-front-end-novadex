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

export default function CardTheme4(props: CommonCardThemeProps) {
  const { userName, selectedDisplayUSD, selectedTheme, profilePicture } =
    usePnlSettings();
  const { solPrice, totalBalance, totalProfitAndLoss, isLoading } =
    usePnlTrackerFooterData();

  const { size, onClose } = props;
  const theme = imageList.find((theme) => theme.themeId === selectedTheme);
  return (
    <PnLTrackerModalCard
      minSize={theme?.size as Size}
      maxWidth={650}
      maxHeight={300}
      {...props}
    >
      <div className="relative z-10 flex h-full w-full flex-col">
        {/* header card */}
        <div
          className={`absolute z-[1000] flex w-full items-center justify-end p-4 pb-0`}
        >
          <div
            className={cn(
              "absolute right-2 flex gap-2 opacity-0 duration-100 group-hover:opacity-100",
            )}
          >
            <PnLTrackerSettingTrigger />
            <PnLTrackerModalClose onClose={onClose} />
          </div>
        </div>

        {/* Main Content */}
        <div className="absolute flex h-full w-full items-center justify-evenly bg-black/50 px-4">
          <div className="relative z-20 flex flex-col items-center justify-center">
            <h3
              className="text-center align-middle font-outfitSemiBold font-semibold leading-none tracking-[0%] text-[#FFF]"
              style={{
                fontSize: `${calculateHeadingFontSize(size)}px`,
                filter: "drop-shadow(0px 4px 3px rgba(0,0,0,0.8))",
              }}
            >
              {userName} Balance
            </h3>
            {selectedDisplayUSD === "Both" || selectedDisplayUSD === "SOL" ? (
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
                    : formatAmountDollar(totalBalance * solPrice, "suffix")
                }
              />
            )}
          </div>

          <div
            className={cn(
              "pointer-events-none z-20 -rotate-[4deg] gap-8 overflow-hidden rounded-xl drop-shadow-4xl",
            )}
            style={{
              width: calculateBadgeSize(size),
              aspectRatio: "1/1",
            }}
          >
            <Image
              src={
                profilePicture
                  ? profilePicture
                  : "/images/pnl-tracker/nova-badge.png"
              }
              alt="Profile picture"
              fill
              className="pointer-events-none inset-0 size-full object-cover"
            />
          </div>

          <div className="relative z-20 flex flex-col items-center justify-center">
            <h3
              className="text-center align-middle font-outfitSemiBold font-semibold leading-none tracking-[0%] text-[#FFF]"
              style={{
                fontSize: `${calculateHeadingFontSize(size)}px`,
                filter: "drop-shadow(0px 4px 3px rgba(0,0,0,0.8))",
              }}
            >
              Profit Today
            </h3>
            {selectedDisplayUSD === "Both" || selectedDisplayUSD === "SOL" ? (
              <DisplayedAmount
                size={size}
                amount={
                  isLoading
                    ? "-"
                    : formatAmountWithoutLeadingZero(totalProfitAndLoss, 2)
                }
                color={totalProfitAndLoss >= 0 ? "profit" : "loss"}
              />
            ) : (
              <DisplayedAmount
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
                color={totalProfitAndLoss >= 0 ? "profit" : "loss"}
              />
            )}
          </div>

          <Image
            src={"/images/pnl-tracker/bg-theme-4.webp"}
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

// Helper function to calculate heading font size based on container dimensions
function calculateHeadingFontSize(size: { width: number; height: number }) {
  if (size.width <= 300) return Math.min(6, size.width * 0.05);
  if (size.width <= 400) return Math.min(8, size.width * 0.05);
  if (size.width <= 600) return Math.min(10, size.width * 0.05);
  if (size.width <= 700) return Math.min(12, size.width * 0.05);
  return Math.min(14, size.width * 0.06);
}

function calculateBadgeSize(size: { width: number; height: number }) {
  if (size.width <= 300) return Math.min(size.width * 0.14, size.height * 0.33);
  return Math.min(size.width * 0.18, size.height * 0.38);
}

function DisplayedAmount({
  amount,
  size,
  color = "default",
  display = "sol",
}: {
  size: { width: number; height: number };
  amount: string;
  color?: "default" | "profit" | "loss";
  display?: "sol" | "usd";
}) {
  const calculateFontSize = () => {
    // if (size.width <= 300) return Math.min(18, size.height * 0.18);
    // if (size.width <= 400) return Math.min(24, size.height * 0.18);
    // if (size.width <= 500) return Math.min(28, size.height * 0.2);
    // if (size.width <= 600) return Math.min(32, size.height * 0.2);
    return Math.min(size.width * 0.08, size.height * 0.2);
  };

  const fontSize = calculateFontSize();
  const iconSize = fontSize * 0.85;

  return (
    <div
      className={cn(
        "z-50 flex items-center justify-center",
        size.width <= 300 ? "gap-1" : size.width <= 400 ? "gap-1.5" : "gap-2",
      )}
    >
      <h3
        className={cn(
          "bg-gradient-to-t bg-clip-text pb-2.5 pt-1 font-outfitBlack text-transparent",
          {
            "from-[#D179F3] via-[#DFA8F5] to-[#EDD8F8]": color === "default",
            "from-[#B0F379] to-[#D5F2D3]": color === "profit",
            "from-[#FD2525] to-[#FFA7A9]": color === "loss",
          },
        )}
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: `${fontSize + 4}px`,
          filter: "drop-shadow(0px 4px 3px rgba(0,0,0,0.8))",
          maxWidth: `${size.width * 0.7}px`,
        }}
      >
        {color === "profit" && "+"}
        {amount}
      </h3>
      {display === "sol" ? (
        <Image
          src={
            color === "default"
              ? "/images/pnl-tracker/sol-theme-2.png"
              : color === "profit"
                ? "/images/pnl-tracker/sol-theme-2-profit.png"
                : "/images/pnl-tracker/sol-theme-2-loss.png"
          }
          alt="Solana Icon"
          quality={100}
          width={32}
          height={32}
          className={cn("pointer-events-none flex-shrink-0 object-contain")}
          style={{
            width: `${iconSize}px`,
            height: `${iconSize}px`,
            filter: "drop-shadow(0px 4px 3px rgba(0,0,0,0.8))",
          }}
        />
      ) : null}
    </div>
  );
}
