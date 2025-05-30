"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState } from "react";
import { useHoldingTableSettingStore } from "@/stores/table/wallet-trade/use-holding-table-setting.store";
// ######## Components 🧩 ########
import HeadCol from "@/components/customs/tables/HeadCol";
import HoldingCard from "@/components/customs/cards/wallet-trade/HoldingCard";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";

export default function HoldingTable() {
  const {
    investedOrder,
    soldOrder,
    remainingOrder,
    PLOrder,
    setInvestedOrder,
    setSoldOrder,
    setRemainingOrder,
    setPLOrder,
  } = useHoldingTableSettingStore();
  const [amountOrRecent, setAmountOrRecent] = useState<"Amount" | "Recent">(
    "Amount",
  );

  // Handlers
  const handleInvestedOrderChange = () => {
    if (investedOrder === "ASC") {
      setInvestedOrder("DESC");
    } else {
      setInvestedOrder("ASC");
    }
  };
  const handleSoldOrderChange = () => {
    if (soldOrder === "ASC") {
      setSoldOrder("DESC");
    } else {
      setSoldOrder("ASC");
    }
  };
  const handleRemainingOrderChange = () => {
    if (remainingOrder === "ASC") {
      setRemainingOrder("DESC");
    } else {
      setRemainingOrder("ASC");
    }
  };
  const handlePLOrderChange = () => {
    if (PLOrder === "ASC") {
      setPLOrder("DESC");
    } else {
      setPLOrder("ASC");
    }
  };

  const HeaderData = [
    {
      label: "Token",
      tooltipContent: "Token Information",
      className: "min-w-[180px]",
    },
    {
      label: "Invested",
      tooltipContent: "Invested Information",
      className: "min-w-[175px]",
    },
    {
      label: "Sold",
      tooltipContent: "Sold Information",
      className: "min-w-[175px]",
    },
    {
      label: "Remaining",
      tooltipContent: "Remaining Information",
      className: "min-w-[175px]",
    },
    {
      label: "P&L",
      tooltipContent: "P&L Information",
      className: "min-w-[175px]",
    },
  ];

  return (
    <div className="flex w-full flex-grow flex-col">
      <OverlayScrollbarsComponent
        defer
        element="div"
        className="table__modal__overlayscrollbar relative w-full flex-grow overflow-y-scroll"
        options={{
          overflow: {
            x: "hidden",
            y: "scroll",
          },
        }}
      >
        <div className="absolute left-0 top-0 flex w-full flex-grow flex-col">
          <div className="header__table__container">
            {HeaderData.map((item, index) => (
              <HeadCol isWithBorder={false} key={index} {...item} />
            ))}
          </div>

          <div className="p-4 md:hidden">
            <div className="flex h-10 items-center rounded-[8px] border border-border p-[3px]">
              <div className="flex h-full w-full items-center rounded-[6px] bg-white/[6%]">
                <button
                  onClick={() => setAmountOrRecent("Amount")}
                  className={cn(
                    "flex h-[32px] w-full items-center justify-center gap-x-2 rounded-[6px] duration-300",
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
                    "flex h-[32px] w-full items-center justify-center gap-x-2 rounded-[6px] bg-transparent duration-300",
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

          <div className="flex h-auto w-full flex-col gap-y-4 p-4 pt-0 md:gap-y-0 md:p-0">
            {Array.from({ length: 32 }).map((_, index) => (
              <HoldingCard key={index} />
            ))}
          </div>
        </div>
      </OverlayScrollbarsComponent>
    </div>
  );
}
