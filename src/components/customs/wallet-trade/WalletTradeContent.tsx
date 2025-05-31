"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/libraries/utils";
import { useWindowSizeStore } from "@/stores/use-window-size.store";
import { memo, useState } from "react";
import { CachedImage } from "../CachedImage";
import AllRealizedPLChart from "../charts/AllRealizedPLChart";
import DeployedTokensTable from "../tables/wallet-trade/DeployedTokensTable";
import HoldingTable from "../tables/wallet-trade/HoldingTable";
import MostProfitableTable from "../tables/wallet-trade/MostProfitableTable";
import TradeHistoryTable, {
  CommonTableProps,
} from "../tables/wallet-trade/TradeHistoryTable";
import WalletTradesInfo from "../WalletTradesInfo";

type TabLabel =
  | "Trade History"
  | "Most Profitable"
  | "Holding"
  | "Deployed Tokens";

type Tab = {
  label: TabLabel;
  tooltipDescription: string;
  table: React.ComponentType<CommonTableProps>;
};

const tabList: Tab[] = [
  {
    label: "Trade History",
    tooltipDescription: "Trade History Information",
    table: TradeHistoryTable,
  },
  {
    label: "Most Profitable",
    tooltipDescription: "Most Profitable Information",
    table: MostProfitableTable,
  },
  {
    label: "Holding",
    tooltipDescription: "Holding Information",
    table: HoldingTable,
  },
  {
    label: "Deployed Tokens",
    tooltipDescription: "Deployed Tokens Information",
    table: DeployedTokensTable,
  },
];

// 🧠 Memoized TabButton
const TabButton = memo(
  ({
    label,
    isActive,
    onClick,
    tooltipDescription,
  }: {
    label: string;
    isActive: boolean;
    onClick: () => void;
    tooltipDescription: string;
  }) => {
    return (
      <button
        onClick={onClick}
        className="relative flex h-[49px] items-center justify-center gap-x-2.5 px-4"
      >
        <span
          className={cn(
            "text-nowrap font-geistMedium text-sm",
            isActive
              ? "font-geistSemiBold text-[#DF74FF]"
              : "text-fontColorSecondary",
          )}
        >
          {label}
        </span>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative aspect-square h-[17.5px] w-[17.5px] flex-shrink-0">
                <CachedImage
                  src="/icons/info-tooltip.png"
                  alt="Info Tooltip Icon"
                  fill
                  quality={50}
                  unoptimized
                  className="object-contain"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent className="z-[320]">
              <p>{tooltipDescription}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {isActive && (
          <div className="absolute bottom-1 left-0 h-[3px] w-full rounded-t-[100px] bg-primary"></div>
        )}
      </button>
    );
  },
);
TabButton.displayName = "TabButton";

// 🧠 Memoized TabContent
const TabContent = memo(
  ({ tab, isActive }: { tab: Tab; isActive: boolean }) => {
    const TableComponent = tab.table;
    if (!isActive) return null;
    return <TableComponent isModalContent={false} />;
  },
);
TabContent.displayName = "TabContent";

// Main Component
function WalletTradeContentComponent() {
  const [amountOrRecent, setAmountOrRecent] = useState<"Amount" | "Recent">(
    "Amount",
  );
  const width = useWindowSizeStore((state) => state.width);
  const [activeTab, setActiveTab] = useState<TabLabel>("Trade History");

  return (
    <div className="relative flex size-full max-h-screen flex-col overflow-hidden md:p-4 lg:p-0">
      <div className="flex w-full flex-col gap-4 max-md:p-4 max-md:pb-0 lg:pt-2">
        {/* Header */}
        <WalletTradesInfo isModalContent={false} />

        {/* Graph */}
        <div className="flex w-full flex-col items-center justify-center rounded-t-[8px] border border-border max-md:border-b-transparent md:mb-4 md:h-[223px] md:flex-row md:rounded-[8px]">
          <AllRealizedPLChart isModalContent={false} />
        </div>
      </div>

      {/* Table Tabs */}
      <div className="flex h-full max-h-[calc(90dvh_-_300px)] w-full flex-grow flex-col xl:pb-[40px]">
        <div className="nova-scroller hide relative flex h-[49px] w-full flex-shrink-0 items-center gap-x-4 overflow-y-hidden border-b border-border bg-black/[4%]">
          {tabList.map((tab) => (
            <TabButton
              key={tab.label}
              label={tab.label}
              isActive={activeTab === tab.label}
              tooltipDescription={tab.tooltipDescription}
              onClick={() => setActiveTab(tab.label)}
            />
          ))}

          {activeTab === "Holding" && (
            <div className="ml-auto mr-4 hidden md:flex">
              <div className="flex h-[32px] items-center rounded-full border border-border p-[3px]">
                <div className="flex h-full w-full items-center overflow-hidden rounded-full bg-white/[6%]">
                  <button
                    onClick={() => setAmountOrRecent("Amount")}
                    className={cn(
                      "flex h-full w-full items-center justify-center gap-x-2 rounded-r-sm px-2 duration-300",
                      amountOrRecent === "Amount" && "bg-white/[6%]",
                    )}
                  >
                    <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                      Amount
                    </span>
                  </button>
                  <button
                    onClick={() => setAmountOrRecent("Recent")}
                    className={cn(
                      "flex h-full w-full items-center justify-center gap-x-2 rounded-l-sm bg-transparent px-2 duration-300",
                      amountOrRecent === "Recent" && "bg-white/[6%]",
                    )}
                  >
                    <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                      Recent
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Table Content */}
        <div className="relative grid bg-card">
          {tabList.map((tab) => (
            <TabContent
              key={tab.label}
              tab={tab}
              isActive={activeTab === tab.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// 🔥 Export memoized main component
const WalletTradeContent = memo(WalletTradeContentComponent);
export default WalletTradeContent;
