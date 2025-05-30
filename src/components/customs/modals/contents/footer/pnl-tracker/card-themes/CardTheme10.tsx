// ######## Libraries 📦 & Hooks 🪝 ########
import { usePnlSettings } from "@/stores/use-pnl-settings";

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
import { PnLTrackerModalClose } from "../PnLTrackerModal";

export default function CardTheme10(props: CommonCardThemeProps) {
  const { selectedTheme } = usePnlSettings();
  const { size, onClose, isDragging } = props;
  const theme = imageList.find((theme) => theme.themeId === selectedTheme);

  const calculateIconSize = () => {
    if (size.width <= 300) return Math.min(18, size.height * 0.15);
    if (size.width <= 400) return Math.min(24, size.height * 0.15);
    if (size.width <= 500) return Math.min(28, size.height * 0.19);
    if (size.width <= 600) return Math.min(32, size.height * 0.19);
    return Math.min(32, size.height * 0.19);
  };
  const iconSize = calculateIconSize();
  return (
    <PnLTrackerModalCard
      minSize={theme?.size as Size}
      maxWidth={550}
      maxHeight={350}
      {...props}
    >
      <div className="relative z-10 flex h-full w-full flex-col overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-[1px] -z-0 bg-black opacity-20" />
        <div className="absolute -z-10 h-full w-full bg-black/50">
          <Image
            src="/images/pnl-tracker/bg-theme-10.webp"
            alt="PnL Background"
            fill
            quality={75}
            className="object-cover"
            priority
          />
        </div>

        {/* Header */}
        <div
          className={`absolute z-[1000] flex w-full items-center justify-center p-4 pb-0`}
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
        <PnLTrackerCardContentDefault size={size} isDragging={isDragging} />

        <div className="absolute -bottom-2 flex w-full items-start justify-center">
          <Image
            src="/icons/footer/3d-logo-straight.svg"
            alt="3D Logo"
            width={iconSize}
            height={iconSize}
            className="pointer-events-none mb-4"
          />
        </div>
      </div>
    </PnLTrackerModalCard>
  );
}
