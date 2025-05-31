"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { memo, useEffect, useRef, useState } from "react";
import { useTradesTableSettingStore } from "@/stores/table/token/use-trades-table-setting.store";
import { useOpenInstantTrade } from "@/stores/token/use-open-instant-trade.store";
import { useTokenActiveTabStore } from "@/stores/use-token-active-tab.store";
import { useWalletFilterStore } from "@/stores/use-wallet-filter.store";
import { useTradesPanelStore } from "@/stores/token/use-trades-panel.store";
import { AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
// ######## Components 🧩 ########
import BaseButton from "@/components/customs/buttons/BaseButton";
import PanelPopUp from "@/components/customs/popups/token/PanelPopup/PanelPopup";
import DevTokensTable from "@/components/customs/tables/token/DevTokensTable";
import HoldersTable from "@/components/customs/tables/token/HoldersTable";
import MyPositionTable from "@/components/customs/tables/token/MyPositionTable";
import TopTradersTable from "@/components/customs/tables/token/TopTradersTable";
import TradesTable from "@/components/customs/tables/token/Trades/TradesTable";
import TokenBuyAndSell from "@/components/customs/token/TokenBuyAndSell";
import {
  Drawer,
  DrawerClose,
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
import Image from "next/image";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
// ######## Types 🗨️ ########
import { TokenDataMessageType } from "@/types/ws-general";

// ######## APIs 🛜 ########
import { getSimilarTokens } from "@/apis/rest/tokens";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useTokenMessageStore } from "@/stores/token/use-token-messages.store";
import Link from "next/link";
import { CachedImage } from "../CachedImage";
import WalletTradesModal from "../modals/WalletTradesModal";
import CustomTablePopover from "../popovers/custom-table/CustomTablePopover";
import { TokenDataAndSecurityContent } from "./TokenDataAndSecurity";
import { useWindowSizeStore } from "@/stores/use-window-size.store";
import { usePopupStore } from "@/stores/use-popup-state";
import { getMarketCapColor } from "@/utils/getMarketCapColor";
import { formatRelativeTime } from "@/utils/formatTime";
import { useOpenAdvanceSettingsFormStore } from "@/stores/use-open-advance-settings-form.store";

type TabLabel =
  | "Trades"
  | "Holders"
  | "Top Traders"
  | "Dev Tokens"
  | "My Position";

type Tab = {
  label: TabLabel;
  icons: {
    active: string;
    inactive: string;
  };
  tooltipContent?: string;
  table: React.ComponentType<any>;
};

const tabList: Tab[] = [
  {
    label: "Trades",
    icons: {
      active: "/icons/token/tabs/active-trades.png",
      inactive: "/icons/token/tabs/inactive-trades.png",
    },
    tooltipContent: "Latest Trades on this Token",
    table: TradesTable,
  },
  {
    label: "Holders",
    icons: {
      active: "/icons/token/tabs/active-holders.png",
      inactive: "/icons/token/tabs/inactive-holders.png",
    },
    tooltipContent: "Information on Holders of this Token",
    table: HoldersTable,
  },
  {
    label: "Top Traders",
    icons: {
      active: "/icons/token/tabs/active-top-traders.png",
      inactive: "/icons/token/tabs/inactive-top-traders.png",
    },
    tooltipContent: "Top Traders on this Token",
    table: TopTradersTable,
  },
  {
    label: "Dev Tokens",
    icons: {
      active: "/icons/token/tabs/active-dev-tokens.png",
      inactive: "/icons/token/tabs/inactive-dev-tokens.png",
    },
    tooltipContent: "Past Tokens from the Developer",
    table: DevTokensTable,
  },
  {
    label: "My Position",
    icons: {
      active: "/icons/token/tabs/active-my-position.png",
      inactive: "/icons/token/tabs/inactive-my-position.png",
    },
    tooltipContent: "Your Positions",
    table: MyPositionTable,
  },
];

export default memo(function TokenTabs({
  initChartData,
}: {
  initChartData: TokenDataMessageType | null;
}) {
  // const [activeTab, setActiveTab] = useState<TabLabel>("Trades");
  const activeTab = useTokenActiveTabStore((state) => state.activeTab);
  const setActiveTab = useTokenActiveTabStore((state) => state.setActiveTab);
  const previousActiveTab = useRef<TabLabel>(activeTab);
  const isPaused = useTradesTableSettingStore((state) => state.isPaused);
  const setIsPaused = useTradesTableSettingStore((state) => state.setIsPaused);
  const [isOpenSimilarTokensDrawer, setIsOpenSimilarTokensDrawer] =
    useState<boolean>(false);
  const [isOpenSecurityDrawer, setIsOpenSecurityDrawer] =
    useState<boolean>(false);
  const [isOpenBuySellDrawer, setIsOpenBuySellDrawer] =
    useState<boolean>(false);
  const openAdvanceSettings = useOpenAdvanceSettingsFormStore(
    (state) => state.openAdvanceSettings,
  );
  const isOpenPanel = useOpenInstantTrade((state) => state.isOpen);
  const setIsOpenPanel = useOpenInstantTrade((state) => state.setIsOpen);

  const setWalletFilter = useWalletFilterStore(
    (state) => state.setWalletFilter,
  );

  const [openAdvanceSettingsFinal, setOpenAdvanceSettingsFinal] =
    useState(false);

  // Get current token symbol for similar tokens lookup
  const tokenSymbolMessage = useTokenMessageStore(
    (state) => state.tokenInfoMessage.symbol,
  );
  const tokenHoldersCount = useTokenMessageStore(
    (state) => state.totalHolderMessages,
  );
  const tokenSymbol = tokenSymbolMessage || initChartData?.token?.symbol || "";

  // Fetch similar tokens
  const { data: similarTokens, isLoading: isSimilarTokensLoading } = useQuery({
    queryKey: ["similar-tokens", tokenSymbol],
    queryFn: () => getSimilarTokens(tokenSymbol),
    enabled: !!tokenSymbol && isOpenSimilarTokensDrawer,
  });

  useEffect(() => {
    const settingsOpenTimeout = setTimeout(
      () => {
        setOpenAdvanceSettingsFinal(openAdvanceSettings);
      },
      !openAdvanceSettings ? 300 : 0,
    );

    return () => {
      clearTimeout(settingsOpenTimeout);
    };
  }, [openAdvanceSettings]);

  const width = useWindowSizeStore((state) => state.width);
  const { remainingScreenWidth, popups } = usePopupStore();
  const walletTrackerSnap = popups.find(
    (item) => item.name === "wallet_tracker",
  );
  const twitterSnap = popups.find((item) => item.name === "twitter");

  const isTradesPanelOpen = useTradesPanelStore((state) => state.isOpen);
  const setIsTradesPanelOpen = useTradesPanelStore((state) => state.setIsOpen);

  // Set initial active tab based on trades panel state
  useEffect(() => {
    if (isTradesPanelOpen) {
      if (previousActiveTab.current === "Trades") {
        setActiveTab("Holders");
      }
    }
  }, []);

  // Add this near your other useEffect hooks
  useEffect(() => {
    // Check localStorage on component mount
    const savedTradesPanelState = localStorage.getItem("trades-panel-state");
    if (savedTradesPanelState === "open") {
      setIsTradesPanelOpen(true);
      setActiveTab("Holders");
    }
  }, []);

  // Add effect to handle mobile view changes
  useEffect(() => {
    if (width && width < 768 && isTradesPanelOpen) {
      setIsTradesPanelOpen(false);
      localStorage.setItem("trades-panel-state", "closed");
      setActiveTab("Trades");
    }
  }, [width, isTradesPanelOpen]);

  // Add event listener for trades panel state changes
  useEffect(() => {
    const handleTradesPanelChange = (event: CustomEvent) => {
      if (event.detail.isOpen) {
        setActiveTab("Holders");
      }
    };

    window.addEventListener(
      "tradesPanelStateChange",
      handleTradesPanelChange as EventListener,
    );

    return () => {
      window.removeEventListener(
        "tradesPanelStateChange",
        handleTradesPanelChange as EventListener,
      );
    };
  }, []);

  return (
    <div className="rounded-t-0 relative mb-[-1.5rem] flex h-[95dvh] w-dvw flex-col overflow-hidden md:mb-0 md:h-[1237px] md:w-full md:rounded-[8px] md:border md:border-border">
      <ScrollArea className="md:w-full">
        <ScrollBar orientation="horizontal" className="hidden" />
        <div className="flex h-12 w-full items-center border-b border-border px-4 md:h-10 md:bg-white/[4%] md:px-0">
          <div id="tab-list" className={cn("flex h-full items-center")}>
            {tabList.map((tab) => {
              const isActive = activeTab === tab.label;
              if (tab.label === "Trades" && isTradesPanelOpen) {
                return null;
              }

              return (
                <React.Fragment key={tab.label}>
                  <button
                    onClick={() => {
                      if (tab.label === "Trades") {
                        setWalletFilter("");
                      }
                      setActiveTab(tab.label);
                      setIsPaused(false);
                      previousActiveTab.current = tab.label;
                    }}
                    className={cn(
                      "relative flex h-12 items-center justify-center gap-x-2 px-4 py-2 md:h-10 md:py-0",
                    )}
                  >
                    <div className="relative aspect-square h-5 w-5 flex-shrink-0">
                      <Image
                        src={isActive ? tab.icons.active : tab.icons.inactive}
                        alt={`${tab.label} Icon`}
                        fill
                        quality={50}
                        className="object-contain"
                      />
                    </div>
                    <span
                      className={cn(
                        "whitespace-nowrap text-nowrap font-geistSemiBold text-sm",
                        isActive
                          ? "text-fontColorAction"
                          : "text-fontColorSecondary",
                      )}
                    >
                      {tab.label}{" "}
                      {tab.label === "Holders" && `(${tokenHoldersCount})`}
                    </span>

                    {isActive && (
                      <div className="absolute bottom-0 left-0 h-[3px] w-full rounded-t-[100px] bg-primary"></div>
                    )}
                    {remainingScreenWidth && remainingScreenWidth > 1280 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                              <CachedImage
                                src="/icons/info-tooltip.png"
                                alt="Info Icon"
                                fill
                                quality={50}
                                className="object-contain"
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{tab.tooltipContent}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </button>
                </React.Fragment>
              );
            })}
          </div>

          <div
            className={cn(
              "relative ml-auto flex min-w-[140px] items-center justify-end gap-x-2 xl:min-w-[300px]",
            )}
          >
            <div
              className={cn(
                "flex h-[24px] items-center gap-x-0.5 rounded-[4px] bg-success/20 px-1.5",
                activeTab === "Trades" && !isTradesPanelOpen && isPaused
                  ? "flex"
                  : "hidden",
              )}
            >
              <div className="relative aspect-square h-5 w-5 flex-shrink-0">
                <Image
                  src="/icons/paused.png"
                  alt="Pause Icon"
                  fill
                  quality={50}
                  className="object-contain"
                />
              </div>
              <span
                className={cn(
                  "font-geistSemiBold text-sm text-success",
                  remainingScreenWidth &&
                    remainingScreenWidth <= 1960 &&
                    "hidden",
                )}
              >
                Paused
              </span>
            </div>
            <button
              onClick={() => {
                const newState = !isTradesPanelOpen;
                setIsTradesPanelOpen(newState);
                localStorage.setItem(
                  "trades-panel-state",
                  newState ? "open" : "closed",
                );
                if (newState) {
                  if (previousActiveTab.current === "Trades") {
                    setActiveTab("Holders");
                  }
                } else {
                  if (previousActiveTab.current === "Trades") {
                    setActiveTab("Trades");
                  }
                }
              }}
              className={cn(
                "hidden h-8 items-center justify-center gap-x-2 px-4 xl:flex",
                "rounded-[20px] border",
                isTradesPanelOpen
                  ? "border-[hsl(286_90%_73%/1)] bg-[hsl(286_90%_73%/0.1)] text-[hsl(286_90%_73%/1)]"
                  : "border-white/10 bg-black/20 text-white hover:border-white/20",
                isTradesPanelOpen && "shadow-[0_0_10px_rgba(137,87,255,0.3)]",
              )}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2C12.5101 1.99997 13.001 2.19488 13.3722 2.54486C13.7433 2.89483 13.9667 3.3734 13.9967 3.88267L14 4V12C14 12.5101 13.8051 13.001 13.4551 13.3722C13.1052 13.7433 12.6266 13.9667 12.1173 13.9967L12 14H4C3.48986 14 2.99899 13.8051 2.62783 13.4551C2.25666 13.1052 2.03326 12.6266 2.00333 12.1173L2 12V4C1.99997 3.48986 2.19488 2.99899 2.54486 2.62783C2.89483 2.25666 3.3734 2.03326 3.88267 2.00333L4 2H12ZM10 3.33333H4C3.83671 3.33335 3.67911 3.3933 3.55709 3.50181C3.43506 3.61032 3.3571 3.75983 3.338 3.922L3.33333 4V12C3.33335 12.1633 3.3933 12.3209 3.50181 12.4429C3.61032 12.5649 3.75983 12.6429 3.922 12.662L4 12.6667H10V3.33333ZM6.40867 6.14L6.47133 6.19533L7.80467 7.52867C7.91945 7.64346 7.98841 7.7962 7.99859 7.95821C8.00878 8.12023 7.9595 8.2804 7.86 8.40867L7.80467 8.47133L6.47133 9.80467C6.35136 9.92423 6.19038 9.99365 6.02108 9.99882C5.85178 10.004 5.68686 9.94452 5.55981 9.8325C5.43277 9.72048 5.35313 9.5643 5.33707 9.39568C5.321 9.22707 5.36973 9.05866 5.47333 8.92467L5.52867 8.862L6.39 8L5.52867 7.138C5.41388 7.0232 5.34493 6.87047 5.33474 6.70845C5.32455 6.54644 5.37383 6.38627 5.47333 6.258L5.52867 6.19533C5.64346 6.08055 5.7962 6.0116 5.95821 6.00141C6.12023 5.99122 6.2804 6.0405 6.40867 6.14Z"
                  fill={isTradesPanelOpen ? "#DF74FF" : "white"}
                />
              </svg>
              <span className="whitespace-nowrap text-nowrap font-geistMedium text-sm">
                Trades Panel
              </span>
            </button>
            {/* Add separator */}
            <div className="mx-2 hidden h-5 w-[1px] bg-border/50 md:block" />
            {activeTab === "Trades" && (
              <CustomTablePopover remainingScreenWidth={remainingScreenWidth} />
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <BaseButton
                    id="panel"
                    onClick={() => setIsOpenPanel(!isOpenPanel)}
                    className={cn(
                      "h-[26px] rounded-[4px] bg-transparent font-geistSemiBold text-sm text-primary before:absolute before:!rounded-[4px]",
                      {
                        "bg-white/[16%]": isOpenPanel,
                      },
                      remainingScreenWidth &&
                        remainingScreenWidth < 1500 &&
                        "px-1.5",
                    )}
                  >
                    {remainingScreenWidth && remainingScreenWidth > 1960 ? (
                      "Instant Trade"
                    ) : (
                      <div className="relative aspect-square size-5 flex-shrink-0">
                        <Image
                          src="/icons/token/icon-instant-trade.svg"
                          alt="Instant Trade Icon"
                          fill
                          quality={50}
                          className="object-contain"
                        />
                      </div>
                    )}
                  </BaseButton>
                </TooltipTrigger>
                <TooltipContent
                  className={
                    remainingScreenWidth && remainingScreenWidth < 1960
                      ? "block"
                      : "hidden"
                  }
                >
                  <p>Instant Trade</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </ScrollArea>

      <div className="relative grid w-full flex-grow grid-cols-1">
        {tabList.map((tab) => {
          const isActive = activeTab === tab.label;
          const TableComponent = tab.table;

          if (tab.label === "Trades" && isTradesPanelOpen) {
            return null;
          }

          return isActive ? (
            <TableComponent key={tab.label} initData={initChartData} />
          ) : null;
        })}
      </div>

      {width && width! < 1280 && (
        <div
          className={cn(
            "fixed inset-x-0 bottom-[40px] z-40 flex w-full gap-x-4 border-t border-border bg-card p-4 md:hidden md:items-center md:justify-between",
            remainingScreenWidth <= 768 &&
              "inset-x-auto md:flex md:items-stretch md:justify-stretch",
            !walletTrackerSnap?.isOpen && !twitterSnap?.isOpen && "bottom-0",
          )}
          style={{
            width:
              width! < 768
                ? "100%"
                : remainingScreenWidth && remainingScreenWidth <= 1280
                  ? `${remainingScreenWidth - 40}px`
                  : undefined,
          }}
        >
          <Drawer
            open={isOpenSecurityDrawer}
            onOpenChange={setIsOpenSecurityDrawer}
          >
            <DrawerTrigger asChild>
              <BaseButton variant="gray" size="short">
                {/* Guard */}
                <div className="relative aspect-square size-5 flex-shrink-0">
                  <Image
                    src="/icons/shield.png"
                    alt="Shield Icon"
                    fill
                    quality={50}
                    className="object-contain"
                  />
                </div>
              </BaseButton>
            </DrawerTrigger>
            <DrawerContent>
              {isOpenSecurityDrawer && (
                <>
                  <DrawerHeader className="flex h-[62px] flex-row items-center justify-between rounded-t-[8px] border-b border-border p-4">
                    <DrawerTitle className="flex w-fit items-center justify-center gap-x-2 font-semibold">
                      Data & Security
                      <div className="flex h-[20px] w-fit items-center gap-x-0.5 rounded-[4px] bg-destructive/10 pl-1 pr-1.5">
                        <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                          <Image
                            src="/icons/issues.png"
                            alt="Issues Icon"
                            fill
                            quality={50}
                            className="object-contain"
                          />
                        </div>
                        <span className="inline-block font-geistSemiBold text-xs text-destructive">
                          1 Issues
                        </span>
                      </div>
                    </DrawerTitle>

                    <DrawerClose className="relative aspect-square h-6 w-6 flex-shrink-0">
                      <Image
                        src="/icons/close.png"
                        alt="Close Icon"
                        fill
                        quality={50}
                        className="object-contain"
                      />
                    </DrawerClose>
                  </DrawerHeader>
                  <TokenDataAndSecurityContent
                    closeDrawer={() => setIsOpenSecurityDrawer(false)}
                    tokenSecurityData={initChartData?.data_security || null}
                  />
                </>
              )}
            </DrawerContent>
          </Drawer>

          <Drawer
            open={isOpenSimilarTokensDrawer}
            onOpenChange={setIsOpenSimilarTokensDrawer}
          >
            <DrawerTrigger asChild>
              <BaseButton variant="gray" size="short">
                {/* Similar Token */}
                <div className="relative aspect-square size-5 flex-shrink-0">
                  <Image
                    src="/icons/token-similar.png"
                    alt="Similar Token Icon"
                    fill
                    quality={50}
                    className="object-contain"
                  />
                </div>
              </BaseButton>
            </DrawerTrigger>
            <DrawerContent
              className={cn(
                "h-[70vh] w-dvw max-w-none border-none bg-background p-0 md:hidden",
                remainingScreenWidth <= 1280 && "md:block",
              )}
            >
              <div className="flex h-full flex-col">
                <div className="flex flex-none items-center justify-between border-b border-border/50 p-4">
                  <span className="font-geistSemiBold text-xl text-fontColorPrimary">
                    Similar Token
                  </span>
                  <DrawerClose className="relative aspect-square h-6 w-6 flex-shrink-0">
                    <Image
                      src="/icons/close.png"
                      alt="Close Icon"
                      fill
                      quality={50}
                      className="object-contain"
                    />
                  </DrawerClose>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto">
                  {isSimilarTokensLoading ? (
                    <div className="flex h-[72px] w-full items-center justify-center p-4">
                      <span className="text-fontColorSecondary">
                        Loading similar tokens...
                      </span>
                    </div>
                  ) : similarTokens && similarTokens.length > 0 ? (
                    similarTokens.map((token) => (
                      <Link key={token.mint} href={`/token/${token.mint}`}>
                        <div
                          key={token.mint}
                          className="flex items-center justify-between border-b border-border/50 p-4"
                        >
                          <div className="flex max-w-[60%] items-center gap-x-3">
                            <div className="relative aspect-square h-8 w-8 flex-shrink-0 overflow-hidden rounded-full">
                              <Image
                                src={token.image || "/logo.png"}
                                alt={`${token.name} Token Icon`}
                                fill
                                quality={100}
                                className="object-cover"
                              />
                            </div>
                            <div className="flex w-full flex-col overflow-hidden">
                              <div className="flex items-center gap-x-2">
                                <span className="max-w-[120px] truncate font-geistSemiBold text-base text-fontColorPrimary">
                                  {token.symbol}
                                </span>
                                {token.name && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="max-w-[100px] truncate text-sm text-fontColorSecondary">
                                          {token.name}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>{token.name}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                              <span className="truncate text-sm text-fontColorSecondary">
                                Last TX:{" "}
                                {formatRelativeTime(token.lastTrade * 1000)}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end">
                            <span className="text-sm text-success">
                              {formatRelativeTime(token.createdAt * 1000)}
                            </span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span
                                    className={`max-w-[100px] truncate text-right font-geistSemiBold text-base ${getMarketCapColor(token.marketCap)}`}
                                  >
                                    {token.marketCap}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{token.marketCap}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="flex h-[72px] w-full items-center justify-center p-4">
                      <span className="text-fontColorSecondary">
                        No similar tokens found
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-none border-t border-border p-4">
                  <DrawerClose className="w-full">
                    <BaseButton
                      variant="gray"
                      className="w-full font-geistSemiBold text-base"
                    >
                      Close
                    </BaseButton>
                  </DrawerClose>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
          <Drawer
            open={isOpenBuySellDrawer}
            onOpenChange={setIsOpenBuySellDrawer}
          >
            <DrawerTrigger asChild>
              <BaseButton variant="primary" className="flex-grow">
                {initChartData?.price?.migrating && (
                  <div className="relative aspect-square h-[18px] w-[18px]">
                    <Image
                      src="/icons/black-snipe.png"
                      alt="Black Snipe Icon"
                      fill
                      quality={50}
                      className="object-contain"
                    />
                  </div>
                )}
                <span className="font-geistSemiBold text-base text-card">
                  {initChartData?.price?.migrating ? "Snipe" : "Buy/Sell"}
                </span>
              </BaseButton>
            </DrawerTrigger>
            <DrawerContent className={cn("h-fit transition-all duration-300")}>
              {isOpenBuySellDrawer && (
                <>
                  <DrawerHeader className="flex h-[62px] flex-row items-center justify-between rounded-t-[8px] border-b border-border p-4">
                    <DrawerTitle className="flex w-fit items-center justify-center gap-x-2">
                      {initChartData?.price?.migrating ? "Snipe" : "Buy/Sell"}
                    </DrawerTitle>

                    <DrawerClose className="relative aspect-square h-6 w-6 flex-shrink-0">
                      <Image
                        src="/icons/close.png"
                        alt="Close Icon"
                        fill
                        quality={50}
                        className="object-contain"
                      />
                    </DrawerClose>
                  </DrawerHeader>
                  <TokenBuyAndSell isMobile />
                </>
              )}
            </DrawerContent>
          </Drawer>
        </div>
      )}

      <AnimatePresence>{isOpenPanel && <PanelPopUp />}</AnimatePresence>
    </div>
  );
});
