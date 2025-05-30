import React from "react";
import Image from "next/image";
import { cn } from "@/libraries/utils";
import { TradeActionType } from "@/types/global";

type Tab = {
  label: TradeActionType | "Buy Order" | "Sell Order";
  icons?: {
    active: string;
    inactive: string;
  };
  content:
    | React.ComponentType
    | React.ComponentType<{ toggleModal: () => void }>;
};

const BuySellTabSelector = ({
  activeTab,
  setActiveTab,
  tabList,
  dragging,
  isWithBackground = true,
  className,
  isInverted,
}: {
  activeTab: TradeActionType | "Buy Order" | "Sell Order";
  setActiveTab:
    | ((tab: TradeActionType) => void)
    | ((tab: "Buy Order" | "Sell Order") => void);
  tabList: Tab[];
  dragging?: boolean;
  isWithBackground?: boolean;
  className?: string;
  isInverted?: boolean;
}) => {
  return (
    <>
      <div
        className={cn(
          "group relative grid h-[40px] w-full grid-cols-2 items-center rounded-t-[8px] border-b border-border bg-white/[4%]",
          className,
        )}
      >
        {tabList.map((tab, index) => {
          const isActive = tab.label === activeTab;

          return (
            <button
              key={index + tab.label}
              onClick={() => {
                if (!dragging) {
                  if (
                    typeof setActiveTab === "function" &&
                    setActiveTab.length === 1
                  ) {
                    (setActiveTab as (tab: TradeActionType) => void)(
                      tab.label as TradeActionType,
                    );
                  } else {
                    (setActiveTab as (tab: "Buy Order" | "Sell Order") => void)(
                      tab.label as "Buy Order" | "Sell Order",
                    );
                  }
                }
              }}
              className="relative z-20 col-span-1 flex h-full cursor-pointer items-center justify-center gap-x-3"
            >
              {tab.icons ? (
                <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                  <Image
                    src={isActive ? tab.icons.active : tab.icons.inactive}
                    alt="Info Tooltip Icon"
                    fill
                    quality={50}
                    className="object-contain"
                  />
                </div>
              ) : (
                ""
              )}

              <span
                className={cn(
                  "inline-block text-nowrap font-geistSemiBold text-sm text-fontColorSecondary",
                  isActive && "text-fontColorAction",
                )}
              >
                {tab.label}
              </span>

              {isActive && (
                <div className="absolute bottom-0 left-0 h-[3px] w-full rounded-t-[100px] bg-primary"></div>
              )}
            </button>
          );
        })}

        {/* Buy Decoration */}
        {isWithBackground &&
        ((!isInverted && activeTab === "Buy") ||
          activeTab == "Buy Order" ||
          (isInverted && activeTab === "Sell") ||
          activeTab == "Sell Order") ? (
          <div className="absolute left-0 top-0 z-10 aspect-[800/224] h-[46px] flex-shrink-0 mix-blend-overlay"></div>
        ) : (
          ""
        )}
        {/* Sell Decoration */}
        {isWithBackground &&
        ((!isInverted && activeTab === "Sell") ||
          activeTab == "Sell Order" ||
          (isInverted && activeTab === "Buy") ||
          activeTab == "Buy Order") ? (
          <div className="absolute right-0 top-0 z-10 aspect-[800/224] h-[46px] flex-shrink-0 mix-blend-overlay"></div>
        ) : (
          ""
        )}
      </div>
    </>
  );
};

export default BuySellTabSelector;
