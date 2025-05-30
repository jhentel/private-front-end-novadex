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
import { imageList } from "../PnLImageSelector";
const topTokens = [
  {
    rank: 1,
    name: "Gooner/Sol",
    amount: "76.12",
    type: "profit",
    image: "/images/pnl-tracker-token-1.png",
  },
  {
    rank: 2,
    name: "ALCH/Sol",
    amount: "23.64",
    type: "profit",
    image: "/images/pnl-tracker-token-2.png",
  },
  {
    rank: 3,
    name: "FEETCOIN/Sol",
    amount: "17.98",
    type: "profit",
    image: "/images/pnl-tracker-token-3.png",
  },
];

// ######## Types 🗨️ ########
import { CommonCardThemeProps, Size } from "../types";
import { formatAmountWithoutLeadingZero } from "@/utils/formatAmount";
import { PnLTrackerModalClose } from "../PnLTrackerModal";

export default function CardTheme3(props: CommonCardThemeProps) {
  const { profilePicture, userName, selectedTheme } = usePnlSettings();
  const {
    totalBalance,
    totalProfitAndLoss,
    totalProfitAndLossPercentage,
    isLoading,
  } = usePnlTrackerFooterData();

  const { size, onClose } = props;
  const theme = imageList.find((theme) => theme.themeId === selectedTheme);
  return (
    <PnLTrackerModalCard
      minSize={theme?.size as Size}
      maxWidth={650}
      maxHeight={300}
      {...props}
    >
      <div className="z-10 flex h-full w-full flex-col">
        {/* Header Card */}
        <div
          className={`relative z-[1000] flex w-full items-center justify-end ${size.width <= 300 ? "h-8 p-2" : "h-10 p-4"} pb-0`}
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
        <div className="absolute -z-10 h-full w-full pt-5">
          <div className="relative z-20 flex items-center justify-center gap-2">
            <h1 className="font-outfitBold text-2xl text-white">Stats</h1>
            <div
              className={cn(
                "pointer-events-none z-10 aspect-square size-[40px] -rotate-[4deg] drop-shadow-4xl",
              )}
            >
              <Image
                src="/images/nova-badge.png"
                alt="Nova Badge"
                fill
                className="object-cover"
              />
            </div>
            <h2 className="font-outfitBold text-2xl text-white">Tracker</h2>
          </div>

          <div
            className={cn(
              "relative inset-0 z-10 m-8 flex flex-col items-start justify-center overflow-hidden rounded-[20px] border-2 border-white/30 bg-gradient-to-b from-white/10 to-white/0 p-7 backdrop-blur-xl",
              size.width < 300 ? "gap-2" : size.width < 500 ? "gap-4" : "gap-6",
            )}
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "flex gap-8 overflow-hidden rounded-lg bg-[#F8895C] drop-shadow-4xl",
                )}
                style={{
                  width: `55px`,
                  transform: "rotate(-6deg)",
                  aspectRatio: "1/1",
                }}
              >
                <Image
                  src={
                    profilePicture
                      ? profilePicture
                      : "/images/profile-picture-default.png"
                  }
                  alt="Profile picture"
                  fill
                  className="pointer-events-none inset-0 size-full object-cover"
                />
              </div>
              <span className="font-geistMonoRegular text-white/80">
                {userName ? userName : "Your"}&apos;s Stats
              </span>
            </div>
            {/* Total Balance */}
            <div className="space-y-2">
              <p className="font-geistMonoRegular text-base text-white/80">
                &gt; TOTAL BALANCE
              </p>
              <div className="flex items-end gap-2">
                <SolanaWithIcon
                  variant="default"
                  size={size}
                  amount={
                    isLoading
                      ? "-"
                      : formatAmountWithoutLeadingZero(totalBalance, 2)
                  }
                />
                <span
                  className={cn(
                    "text-sm font-semibold",
                    Number(totalProfitAndLossPercentage) > 0
                      ? "text-[#0FF7AD]"
                      : "text-[#FF1212]",
                  )}
                >
                  {Number(totalProfitAndLossPercentage) > 0 ? "↑ " : "↓ "}
                  {isLoading ? "-" : totalProfitAndLossPercentage.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Today Profit */}
            <div className="space-y-2">
              <p className="font-geistMonoRegular text-base text-white/80">
                &gt; TODAY PROFIT
              </p>
              <div className="flex items-end gap-2">
                <SolanaWithIcon
                  variant={totalProfitAndLoss >= 0 ? "profit" : "loss"}
                  size={size}
                  amount={
                    isLoading
                      ? "-"
                      : formatAmountWithoutLeadingZero(totalProfitAndLoss, 2)
                  }
                />
              </div>
            </div>

            {/* Separator */}
            <div className="my-2 flex w-full items-center gap-4">
              <div className="h-[1px] w-full bg-gradient-to-l from-white/80 to-white/0" />
              <Image
                src={"/icons/crown.svg"}
                alt="Crown Separator"
                width={18}
                height={18}
                quality={100}
                className="pointer-events-none object-contain"
              />
              <div className="h-[1px] w-full bg-gradient-to-r from-white/80 to-white/0" />
            </div>

            {/* Top Tokens */}
            <div className="flex w-full flex-col gap-2">
              {topTokens.map((item) => (
                <StatItem
                  key={item.rank}
                  rank={item.rank}
                  image={item.image}
                  label={item.name}
                  value={item.amount}
                  type={item.type as "loss" | "profit"}
                />
              ))}
            </div>
          </div>

          <Image
            src={"/images/pnl-tracker-three-bg.webp"}
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

function SolanaWithIcon({
  amount,
  size,
  variant,
}: {
  size: { width: number; height: number };
  amount: string;
  variant: "default" | "profit" | "loss";
}) {
  const calculateFontSize = () => {
    const baseSize = Math.min(size.width * 0.5, size.height);
    const fontSize = baseSize * 0.2;
    return Math.min(Math.max(fontSize, 32), 84);
  };

  const fontSize = calculateFontSize();
  return (
    <div className={cn("z-50 flex items-end justify-start gap-2")}>
      <Image
        src={
          variant === "default"
            ? "/images/Solana-white.png"
            : variant === "profit"
              ? "/images/Solana-green.png"
              : "/images/Solana-red.png"
        }
        alt="Solana Icon"
        quality={100}
        width={32}
        height={32}
        className={cn("pointer-events-none object-contain")}
        style={{
          width: `${fontSize * 0.9}px`,
          height: `${fontSize * 0.9}px`,
        }}
      />
      <h3
        className={cn("font-geistMonoMedium", {
          "text-[#0FF7AD]": variant === "profit",
          "text-white": variant === "default",
          "text-[#FF1212]": variant === "loss",
        })}
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: `${fontSize}px`,
        }}
      >
        {variant === "profit" && "+"}
        {amount}
      </h3>
    </div>
  );
}

const StatItem = ({
  rank,
  image,
  label,
  value,
  type,
}: {
  rank: number;
  image: string;
  label: string;
  value: string;
  type: "profit" | "loss";
}) => (
  <div
    className={cn(
      "relative flex w-full items-center justify-between rounded-xl px-4 py-2 text-white/90",
      {
        "bg-[#390080]/80": rank === 1,
        "bg-[#8127D4]/90": rank === 2,
        "bg-purple-400/30": rank === 3,
      },
    )}
  >
    <div className="flex items-center gap-3">
      <Image
        src={image}
        alt={label}
        width={40}
        height={40}
        className="pointer-events-none h-10 w-10 rounded-md"
      />
      <div>
        <p className="font-geistMonoRegular text-xs">&gt; {label}</p>
        <p className="font-geistMonoMedium text-xl">
          {type === "profit" ? "+" : "-"}
          {value} Sol
        </p>
      </div>
    </div>
    <p className="absolute right-3 top-0 z-10 bg-gradient-to-l from-white/10 to-white/0 bg-clip-text font-geistMonoBold text-6xl text-transparent">
      #{rank}
    </p>
  </div>
);
