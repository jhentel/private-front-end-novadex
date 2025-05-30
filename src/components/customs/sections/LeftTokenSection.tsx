"use client";
// ######## Libraries 📦 & Hooks 🪝 ########
import React from "react";
// ######## Components 🧩 ########
import TokenTradingChart from "@/components/customs/token/TokenTradingChart";
// import TokenTabs from "@/components/customs/token/TokenTabs";
const TokenTabs = dynamic(
  () => import("@/components/customs/token/TokenTabs"),
  {
    ssr: false,
    loading: TokenTablesLoading,
  },
);
// ######## Types 🗨️ ########
import { TokenDataMessageType } from "@/types/ws-general";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { usePopupStore } from "@/stores/use-popup-state";
import dynamic from "next/dynamic";
import { TokenTablesLoading } from "../loadings/TokenPageLoading";
const LeftTokenSection = React.memo(
  ({
    initChartData,
    mint,
  }: {
    initChartData: TokenDataMessageType | null;
    mint?: string;
  }) => {
    const popups = usePopupStore((state) => state.popups);
    const remainingScreenWidth = usePopupStore(
      (state) => state.remainingScreenWidth,
    );
    const isSnapOpen = popups.some((p) => p.isOpen && p.snappedSide !== "none");

    return (
      <div
        className={cn(
          "flex h-full flex-grow flex-col flex-wrap items-start gap-4 md:w-[40%] md:gap-2 lg:w-[70%] xl:w-[80%]",
          isSnapOpen && "min-w-0 basis-0 xl:w-[50%]",
          remainingScreenWidth &&
            remainingScreenWidth <= 768 &&
            "md:gap-4 xl:w-[100%] xl:px-3",
        )}
      >
        <TokenTradingChart mint={mint} tokenData={initChartData} />

        <TokenTabs initChartData={initChartData} />
      </div>
    );
  },
);
LeftTokenSection.displayName = "LeftTokenSection";

export default LeftTokenSection;
