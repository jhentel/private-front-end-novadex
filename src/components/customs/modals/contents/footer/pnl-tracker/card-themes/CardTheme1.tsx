// ######## Libraries 📦 & Hooks 🪝 ########

// ######## Components 🧩 ########
import Image from "next/image";
import { PnLTrackerSettingTrigger } from "../PnLTrackerSettingsPopover";
import PnLTrackerCardContentDefault from "../PnLTrackerCardContentDefault";
import PnLTrackerModalCard from "../PnLTrackerModalCard";

// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { imageList } from "../PnLImageSelector";

// ######## Types 🗨️ ########
import { CommonCardThemeProps, Size } from "../types";
import { usePnlSettings } from "@/stores/use-pnl-settings";
import { PnLTrackerModalClose } from "../PnLTrackerModal";

export default function CardTheme1(props: CommonCardThemeProps) {
  const { selectedTheme } = usePnlSettings();
  const { size, onClose, isDragging } = props;
  const theme = imageList.find((theme) => theme.themeId === selectedTheme);

  return (
    <PnLTrackerModalCard
      minSize={theme?.size as Size}
      maxWidth={550}
      maxHeight={350}
      {...props}
    >
      <div className="relative z-10 flex h-full w-full flex-col">
        {/* Background Image */}
        <div className="absolute inset-[1px] -z-0 bg-black opacity-50" />
        <div className="absolute -z-10 h-full w-full bg-black/50">
          <Image
            src={"/images/pnl-tracker/bg-theme-1.webp"}
            alt="PnL Background"
            quality={75}
            priority
            fill
            className="h-full w-full object-cover p-[1px]"
          />
        </div>

        {/* Header */}
        <div
          className={`absolute z-[1000] flex w-full items-center justify-center p-4 pb-0`}
        >
          {size.width < 260 ? null : (
            <div
              className={cn(
                "relative h-[24px] flex-shrink-0",
                size.height <= 200 ? "-mt-2.5 w-[56px]" : "-mt-0 w-[86.25px]",
              )}
            >
              <Image
                src="/images/pnl-tracker/logo-with-text.png"
                alt="Logo with text"
                fill
                quality={100}
                className="pointer-events-none object-contain"
              />
            </div>
          )}
          <div
            className={cn(
              "absolute right-2 flex gap-2 opacity-0 duration-100 group-hover:opacity-100",
            )}
          >
            <PnLTrackerSettingTrigger />
            <PnLTrackerModalClose onClose={onClose} />
          </div>
        </div>

        {/* Main content */}
        <PnLTrackerCardContentDefault size={size} isDragging={isDragging} />
      </div>
    </PnLTrackerModalCard>
  );
}
