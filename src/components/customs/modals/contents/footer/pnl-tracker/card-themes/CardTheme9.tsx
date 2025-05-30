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

// ######## Types 🗨️ ########
import { CommonCardThemeProps, Size } from "../types";
import { imageList } from "../PnLImageSelector";
import {
  formatAmountDollar,
  formatAmountWithoutLeadingZero,
} from "@/utils/formatAmount";
import { PnLTrackerModalClose } from "../PnLTrackerModal";
import { SolanaView, USDView } from "../PnLTrackerCardContentDefault";

type Colors = "default" | "loss" | "profit";

export default function CardTheme9(props: CommonCardThemeProps) {
  const { selectedDisplayUSD, selectedTheme } = usePnlSettings();
  const { totalProfitAndLoss, solPrice, isLoading } = usePnlTrackerFooterData();

  const { size, onClose } = props;
  const theme = imageList.find((theme) => theme.themeId === selectedTheme);

  const calculateFontSize = () => {
    if (size.width <= 300) return Math.min(6, size.height * 0.15);
    if (size.width <= 400) return Math.min(8, size.height * 0.15);
    if (size.width <= 600) return Math.min(10, size.height * 0.15);
    return Math.min(10, size.height * 0.2);
  };

  const fontSize = calculateFontSize();

  return (
    <PnLTrackerModalCard
      minSize={theme?.size as Size}
      maxWidth={550}
      maxHeight={350}
      {...props}
    >
      <div className="relative z-10 flex h-full w-full flex-col">
        {/* Background Image */}
        <div className="absolute inset-[1px] -z-0 bg-black opacity-20" />
        <div className="absolute -z-10 h-full w-full bg-black/50">
          <Image
            src={"/images/pnl-tracker/bg-theme-9.webp"}
            alt="PnL Background"
            priority
            fill
            quality={75}
            className="object-cover p-[1px]"
          />
        </div>

        {/* Header */}
        <div
          className={`relative flex w-full items-center justify-start p-2 pb-0`}
        >
          <div
            className={cn(
              "relative h-[24px] flex-shrink-0",
              size.width <= 300 ? "w-[56px]" : "w-[86.25px]",
            )}
          >
            <h2
              className={cn(
                "font-geistRegular text-fontColorPrimary opacity-0 duration-100 group-hover:opacity-100",
                size.width < 260
                  ? "text-[8px]"
                  : size.width <= 300
                    ? "text-[10px]"
                    : "text-xs",
              )}
              // style={{
              //   fontSize: `${fontSize}px`,
              //   lineHeight: `${fontSize * 1.2}px`,
              // }}
            >
              P&L Tracker
            </h2>
          </div>
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
        <div className="flex h-full w-full flex-col items-center justify-start">
          <div
            className={cn(
              "flex h-full w-full flex-col items-center justify-center gap-2.5",
              size.height < 300 && "-mt-4 gap-1",
            )}
          >
            <h2
              className={cn(
                "font-geistRegular text-fontColorSecondary",
                // size.width < 260
                //   ? "text-[8px]"
                //   : size.width <= 300
                //     ? "text-[10px]"
                //     : "text-xs",
              )}
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: `${fontSize * 1.2}px`,
              }}
            >
              Profit & Loss
            </h2>
            {selectedDisplayUSD === "Both" ? (
              <>
                <SolanaView
                  size={size}
                  amount={
                    isLoading
                      ? "-"
                      : formatAmountWithoutLeadingZero(totalProfitAndLoss, 2)
                  }
                  color={totalProfitAndLoss >= 0 ? "profit" : "loss"}
                />
                <USDView
                  size={size}
                  amount={
                    isLoading
                      ? "-"
                      : formatAmountDollar(
                          totalProfitAndLoss * solPrice,
                          "prefix",
                        )
                  }
                  color="default"
                />
              </>
            ) : selectedDisplayUSD === "USD" ? (
              <USDView
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
                isDisplayed
              />
            ) : (
              <SolanaView
                size={size}
                amount={
                  isLoading
                    ? "-"
                    : formatAmountWithoutLeadingZero(totalProfitAndLoss, 2)
                }
                color={totalProfitAndLoss >= 0 ? "profit" : "loss"}
              />
            )}
          </div>
        </div>
      </div>
    </PnLTrackerModalCard>
  );
}
