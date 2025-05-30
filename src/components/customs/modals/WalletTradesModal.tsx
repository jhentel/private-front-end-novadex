"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useEffect, useState } from "react"; // Add this hook
// ######## Components 🧩 ########
import Image from "next/image";
import Separator from "@/components/customs/Separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AllRealizedPLChart from "../charts/AllRealizedPLChart";
import TradeHistoryTable from "../tables/wallet-trade/TradeHistoryTable";
import MostProfitableTable from "../tables/wallet-trade/MostProfitableTable";
import HoldingTable from "../tables/wallet-trade/HoldingTable";
import DeployedTokensTable from "../tables/wallet-trade/DeployedTokensTable";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import WalletTradesInfo from "../WalletTradesInfo";
import ComingSoon from "../ComingSoon";
import { useTradesWalletModalStore } from "@/stores/token/use-trades-wallet-modal.store";
import { CachedImage } from "../CachedImage";
import { useWindowSizeStore } from "@/stores/use-window-size.store";

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

export default function WalletTradesModal() {
  const [open, setOpen] = useState(false);
  const walletAddress = useTradesWalletModalStore((state) => state.wallet);
  const [amountOrRecent, setAmountOrRecent] = useState<"Amount" | "Recent">(
    "Amount",
  );
  const width = useWindowSizeStore((state) => state.width);

  const handleEdit = () => {
    /* console.log("Edit wallet") */;
  };
  // console.log("Wallet Address🎯🎯🎯: ", walletAddress);

  const [activeTab, setActiveTab] = useState<TabLabel>("Trade History");

  useEffect(() => {
    if (walletAddress.length > 0) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [walletAddress]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      useTradesWalletModalStore.setState({ wallet: "" });
    }
  };

  const WalletTradesContent = () => (
    <div className="flex w-full flex-col">
      <div className="flex w-full flex-col p-4 md:p-0">
        {/* Header */}
        <WalletTradesInfo />

        {/* Graph */}
        <div className="mt-4 flex w-full flex-col items-center justify-center rounded-[8px] border border-border p-2 md:mt-0 md:h-[177px] md:flex-row md:rounded-none md:border-0">
          <AllRealizedPLChart />
        </div>
      </div>

      {/* Table Tabs */}
      <div className="flex h-[370px] w-full flex-col">
        <ScrollArea className="md:w-full">
          <ScrollBar orientation="horizontal" className="hidden" />
          <div className="flex h-[49px] w-full items-center gap-x-4 border-b border-border bg-white/[4%]">
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
                      "text-nowrap text-base",
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
                    <div className="absolute bottom-0 left-0 h-[3px] w-full rounded-t-[100px] bg-primary"></div>
                  )}
                </button>
              );
            })}
            {activeTab == "Holding" ? (
              <div className="ml-auto hidden md:flex">
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
        </ScrollArea>

        <div className="relative grid w-full flex-grow grid-cols-1 bg-card">
          {tabList.map((tab) => {
            const isActive = activeTab === tab.label;
            const TableComponent = tab.table;

            return isActive ? <TableComponent key={tab.label} /> : null;
          })}
        </div>
      </div>
    </div>
  );

  if (width && width > 768) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="flex min-h-[390px] w-full max-w-[900px] flex-col gap-y-0 space-y-0">
          <DialogHeader className="flex h-fit min-h-0 flex-row items-center p-4">
            <DialogTitle>Wallet Trades</DialogTitle>
          </DialogHeader>
          {true ? (
            <div className="flex size-full flex-1 items-center justify-center">
              <ComingSoon />
            </div>
          ) : (
            <WalletTradesContent />
          )}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="flex h-[95vh] flex-col">
        <DrawerHeader className="flex h-[58px] flex-row items-center border-b border-border p-4">
          <DrawerTitle>Wallet Trades</DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-auto">
          {true ? <ComingSoon /> : <WalletTradesContent />}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
