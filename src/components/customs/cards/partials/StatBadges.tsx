"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useCallback } from "react";
import StatBadge from "@/components/customs/cards/partials/StatBadge";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
// ######## Zustand Store ########
import { useCustomCardView } from "@/stores/setting/use-custom-card-view.store";
import { usePopupStore } from "@/stores/use-popup-state";

const StatBadges = ({
  isMigrating,
  stars,
  snipers,
  insiderPercentage,
  top10Percentage,
  devHoldingPercentage,
  isSnapOpen,
  isLargePreset,
  isXLPreset,
}: {
  isMigrating: boolean;
  stars: number;
  snipers: number;
  insiderPercentage: number;
  top10Percentage: number;
  devHoldingPercentage: number;
  isSnapOpen: boolean;
  isLargePreset: boolean;
  isXLPreset: boolean;
}) => {
  // Get card view configuration from Zustand store
  const cardViewConfig = useCustomCardView((state) => state.cardViewConfig);

  // Function to check if a specific card view is active
  const isCardViewActive = useCallback(
    (key: string): boolean => {
      const configItem = cardViewConfig.find((item) => item.key === key);
      return configItem?.status === "active";
    },
    [cardViewConfig],
  );
  const remainingScreenWidth = usePopupStore(
    (state) => state.remainingScreenWidth,
  );

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-1",
        isSnapOpen && "w-[180px]",
        remainingScreenWidth < 1440 &&
          (isXLPreset || isLargePreset) &&
          "w-[240px] gap-y-1",
        remainingScreenWidth < 1100 && "w-full",
      )}
    >
      {/* Star badge */}
      {isCardViewActive("star") && (
        <StatBadge
          isMigrating={isMigrating}
          icon="star"
          value={stars || 0}
          label="Star"
          tooltipLabel="Dev Tokens Migrated"
          valueColor="text-fontColorPrimary"
        />
      )}

      {/* Snipers badge */}
      {isCardViewActive("snipers") && (
        <StatBadge
          isMigrating={isMigrating}
          icon="snipe-gray"
          value={snipers || 0}
          label="Snipe"
          tooltipLabel="Snipers"
          valueColor={
            snipers >= 1 ? "text-destructive" : "text-fontColorPrimary"
          }
        />
      )}

      {/* Insiders badge */}
      {isCardViewActive("insiders") && (
        <StatBadge
          isMigrating={isMigrating}
          icon="insiders"
          value={insiderPercentage.toFixed(0) || 0}
          label="Insiders"
          tooltipLabel="Insiders"
          valueColor={
            insiderPercentage <= 5 ? "text-success" : "text-destructive"
          }
          suffix="%"
        />
      )}

      {/* Top 10 Holders badge */}
      {isCardViewActive("top-10-holders") && (
        <StatBadge
          isMigrating={isMigrating}
          value={top10Percentage.toFixed(0) || 0}
          label="T10"
          tooltipLabel="Top 10 Holders"
          valueColor={
            top10Percentage < 10
              ? "text-success"
              : top10Percentage > 10 && top10Percentage <= 15
                ? "text-warning"
                : "text-destructive"
          }
          suffix="%"
        />
      )}

      {/* Dev Holdings badge */}
      {isCardViewActive("dev-holdings") && (
        <StatBadge
          isMigrating={isMigrating}
          value={devHoldingPercentage.toFixed(0) || 0}
          label="DH"
          tooltipLabel="Dev Holdings"
          valueColor={
            devHoldingPercentage === 0
              ? "text-fontColorSecondary"
              : devHoldingPercentage < 75
                ? "text-success"
                : "text-destructive"
          }
          suffix="%"
        />
      )}
    </div>
  );
};
StatBadges.displayName = "StatBadges";
export default StatBadges;
