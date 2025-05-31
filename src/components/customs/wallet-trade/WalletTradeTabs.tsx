import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/libraries/utils";
import { memo, useState } from "react";
import { CachedImage } from "../CachedImage";
import DeployedTokensTable from "../tables/wallet-trade/DeployedTokensTable";
import HoldingTable from "../tables/wallet-trade/HoldingTable";
import MostProfitableTable from "../tables/wallet-trade/MostProfitableTable";
import TradeHistoryTable from "../tables/wallet-trade/TradeHistoryTable";

type TabLabel =
  | "Trade History"
  | "Most Profitable"
  | "Holding"
  | "Deployed Tokens";

type Tab = {
  label: TabLabel;
  tooltipDescription: string;
  table: React.ComponentType;
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
export default memo(function WalletTradeTabs() {
  const [amountOrRecent, setAmountOrRecent] = useState<"Amount" | "Recent">(
    "Amount",
  );
  const [activeTab, setActiveTab] = useState<TabLabel>("Trade History");
  return (
    <div className="flex h-[370px] w-full flex-col">
      <div className="nova-scroller hide relative flex h-[49px] w-full flex-shrink-0 items-center gap-x-4 overflow-hidden border-b border-border bg-white/[4%]">
        {tabList.map((tab) => {
          const isActive = activeTab === tab.label;

          return (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
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
                {tab.label}
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
                    <p>{tab.tooltipDescription}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {isActive && (
                <div className="absolute bottom-1 left-0 h-[3px] w-full rounded-t-[100px] bg-primary"></div>
              )}
            </button>
          );
        })}
        {activeTab == "Holding" ? (
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
        ) : (
          ""
        )}
      </div>

      <div className="relative grid size-full bg-card">
        {tabList.map((tab) => {
          const isActive = activeTab === tab.label;
          const TableComponent = tab.table;

          return isActive ? <TableComponent key={tab.label} /> : null;
        })}
      </div>
    </div>
  );
});
