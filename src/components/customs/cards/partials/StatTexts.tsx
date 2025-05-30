"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useMemo } from "react";
import { useCustomizeSettingsStore } from "@/stores/setting/use-customize-settings.store";
import { useCustomCardView } from "@/stores/setting/use-custom-card-view.store";

// ######## Components 🧩 ########
import StatText from "@/components/customs/cards/partials/StatText";
import TokenTrackers from "@/components/customs/cards/partials/TokenTrackers";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { formatAmountDollar } from "@/utils/formatAmount";
import { usePopupStore } from "@/stores/use-popup-state";
import { useWalletTrackerMessageStore } from "@/stores/footer/use-wallet-tracker-message.store";

// mapping text size class
const fontSizeMap = {
  normal: "text-xs",
  large: "text-sm",
  extralarge: "text-base",
  doubleextralarge: "text-lg",
};

const iconSizeMap = {
  normal: "size-4",
  large: "size-5",
  extralarge: "size-6",
  doubleextralarge: "size-7",
};

// mapping value color class
const valueColorMap = {
  normal: "text-white",
  blue: "text-[#4A89FF]",
  purple: "text-[#DF74FF]",
  fluorescentblue: "text-[#1BF6FD]",
  neutral: "text-warning",
  lemon: "text-[#C0FD30]",
};

const StatTexts = ({
  isSnapOpen,
  mint,
  bundled,
  bundled_percentage,
  marketCapUSD,
  volumeUSD,
  holders,
  type = "default",
}: {
  isSnapOpen: boolean;
  mint: string;
  bundled?: boolean;
  bundled_percentage?: number;
  marketCapUSD: number;
  volumeUSD?: number;
  holders?: number;
  type?: "default" | "monitor" | "monitor-small";
}) => {
  const cardViewConfig = useCustomCardView((state) => state.cardViewConfig);

  const customizedSettingPresets = useCustomizeSettingsStore(
    (state) => state.presets,
  );
  const customizedSettingActivePreset = useCustomizeSettingsStore(
    (state) => state.activePreset,
  );

  const currentPresets = useMemo(
    () => ({
      fontSetting:
        customizedSettingPresets[customizedSettingActivePreset].fontSetting ||
        "normal",
      avatarSetting:
        customizedSettingPresets[customizedSettingActivePreset].avatarSetting ||
        "normal",
      colorSetting:
        customizedSettingPresets[customizedSettingActivePreset].colorSetting ||
        "normal",
    }),
    [customizedSettingPresets, customizedSettingActivePreset],
  );

  // Function to check if a specific card view is active
  const isCardViewActive = (key: string): boolean => {
    const configItem = cardViewConfig.find((item) => item.key === key);
    return configItem?.status === "active";
  };

  const formattedStats = useMemo(
    () => ({
      marketCap: marketCapUSD ? formatAmountDollar(marketCapUSD) : "0",
      volume: volumeUSD ? formatAmountDollar(volumeUSD) : "0",
    }),
    [marketCapUSD, volumeUSD],
  );

  const marketCapValueColor = useMemo(() => {
    if (!marketCapUSD) return "text-destructive";

    if (marketCapUSD > 100000) return "text-success";
    if (marketCapUSD > 30000) return "text-warning";
    if (marketCapUSD > 15000) return "text-[#6ac0ed]";
    return "text-destructive";
  }, [marketCapUSD]);

  const remainingScreenWidth = usePopupStore(
    (state) => state.remainingScreenWidth,
  );
  const isExistTracker = useWalletTrackerMessageStore((state) =>
    state.isExistingTx(mint),
  );
  return (
    <div
      className={cn(
        "flex items-center gap-x-2",
        ["extralarge", "doubleextralarge"].includes(
          currentPresets.fontSetting,
        ) ||
          ["extralarge", "doubleextralarge"].includes(
            currentPresets.avatarSetting,
          )
          ? "max-w-min flex-col items-start xl:max-w-[240px] xl:flex-row"
          : "flex-row",
        isSnapOpen && "flex-wrap",
        // remainingScreenWidth < 1440 && "flex-row items-start w-[240px]",
        // remainingScreenWidth < 1300 && "flex-row items-start w-[180px]",
        // remainingScreenWidth < 1100 && "w-full",
        remainingScreenWidth < 1440 &&
          ["large", "extralarge", "doubleextralarge"].includes(
            currentPresets.fontSetting,
          ) &&
          "w-[240px] flex-row items-start gap-y-1",
        remainingScreenWidth < 1300 &&
          ["large", "extralarge", "doubleextralarge"].includes(
            currentPresets.fontSetting,
          ) &&
          "w-[180px] flex-row items-start gap-y-1",
        type === "monitor-small" && "!max-w-[140px] !flex-wrap",
        type === "monitor-small" && isSnapOpen && "!max-w-[150px]",
      )}
    >
      {/* Bundled stat */}
      {isSnapOpen && isCardViewActive("bundled") && bundled !== undefined ? (
        <StatText
          value={bundled ? "Yes" : "No"}
          // value={
          //   (bundled_percentage ?? 0) > 0
          //     ? bundled_percentage?.toFixed(1) + "%"
          //     : "0%"
          // }
          label="BD"
          tooltipLabel="Bundled"
          valueColor={bundled ? "text-destructive" : "text-success"}
          customClassName={
            type !== "default"
              ? fontSizeMap["normal"]
              : fontSizeMap[currentPresets.fontSetting]
          }
          customClassIcon={
            type !== "default"
              ? iconSizeMap["normal"]
              : iconSizeMap[currentPresets.fontSetting]
          }
        />
      ) : null}

      {/* Market Cap stat */}
      {isCardViewActive("market-cap") && formattedStats?.marketCap ? (
        <StatText
          value={formattedStats?.marketCap}
          label="MC"
          tooltipLabel="Market Cap"
          valueColor={marketCapValueColor}
          customClassName={
            type !== "default"
              ? fontSizeMap["normal"]
              : fontSizeMap[currentPresets.fontSetting]
          }
          customClassIcon={
            type !== "default"
              ? iconSizeMap["normal"]
              : iconSizeMap[currentPresets.fontSetting]
          }
        />
      ) : null}

      {/* Volume stat */}
      {isCardViewActive("volume") && volumeUSD ? (
        <StatText
          value={formattedStats.volume}
          label="V"
          tooltipLabel="Volume"
          valueColor={
            type !== "default"
              ? valueColorMap["normal"]
              : valueColorMap[currentPresets.colorSetting]
          }
          customClassName={
            type !== "default"
              ? fontSizeMap["normal"]
              : fontSizeMap[currentPresets.fontSetting]
          }
          customClassIcon={
            type !== "default"
              ? iconSizeMap["normal"]
              : iconSizeMap[currentPresets.fontSetting]
          }
        />
      ) : null}

      {/* Holders stat */}
      {isCardViewActive("holders") && holders ? (
        <StatText
          icon="holders"
          value={String(holders) || "0"}
          label="Holders"
          tooltipLabel="Holders"
          valueColor={
            type !== "default"
              ? valueColorMap["normal"]
              : valueColorMap[currentPresets.colorSetting]
          }
          customClassName={
            type !== "default"
              ? fontSizeMap["normal"]
              : fontSizeMap[currentPresets.fontSetting]
          }
          customClassIcon={
            type !== "default"
              ? iconSizeMap["normal"]
              : iconSizeMap[currentPresets.fontSetting]
          }
        />
      ) : null}

      {isExistTracker ? (
        <TokenTrackers
          mint={mint}
          valueColor={
            type !== "default"
              ? valueColorMap["normal"]
              : valueColorMap[currentPresets.colorSetting]
          }
          customClassName={
            type !== "default"
              ? fontSizeMap["normal"]
              : fontSizeMap[currentPresets.fontSetting]
          }
          customClassIcon={
            type !== "default"
              ? iconSizeMap["normal"]
              : iconSizeMap[currentPresets.fontSetting]
          }
        />
      ) : null}
    </div>
  );
};
StatTexts.displayName = "StatTexts";
export default StatTexts;
