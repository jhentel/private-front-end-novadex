"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useTradeHistoryTableSettingStore } from "@/stores/table/wallet-trade/use-trade-history-table-setting.store";
// ######## Components 🧩 ########
import HeadCol from "@/components/customs/tables/HeadCol";
import TradeHistoryCard from "@/components/customs/cards/wallet-trade/TradeHistoryCard";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";

export default function TradeHistoryTable() {
  const {
    ageOrder,
    type,
    mcOrPrice,
    totalSOL,
    setAgeOrder,
    setType,
    setMCOrPrice,
    setTotalSOLCurrency,
  } = useTradeHistoryTableSettingStore();

  // Handlers
  const handleAgeOrderChange = () => {
    if (ageOrder === "ASC") {
      setAgeOrder("DESC");
    } else {
      setAgeOrder("ASC");
    }
  };

  const HeaderData = [
    {
      label: "Age",
      tooltipContent:
        "The date the transaction was made or the time passed since token creation.",
      className: "min-w-[72px]",
    },
    {
      label: "Type",
      sortButton: (
        <div className="flex h-[20px] w-auto items-center justify-center rounded-[10px] bg-secondary p-1">
          <button
            onClick={() => setType("BUY")}
            className={cn(
              "inline-block cursor-pointer rounded-[12px] px-1.5 font-geistSemiBold text-xs leading-[14px] text-success duration-300",
              type === "BUY" && "bg-white/10",
            )}
          >
            B
          </button>
          <button
            onClick={() => setType("SELL")}
            className={cn(
              "inline-block cursor-pointer rounded-[12px] px-1.5 font-geistSemiBold text-xs leading-[14px] text-destructive duration-300",
              type === "SELL" && "bg-white/10",
            )}
          >
            S
          </button>
        </div>
      ),
      tooltipContent: "The type of transaction made.",
      className: "min-w-[144px]",
    },
    {
      label: "Value",
      sortButton: (
        <div className="flex h-[20px] w-auto items-center justify-center rounded-[10px] bg-secondary p-1">
          <button
            onClick={() => setMCOrPrice("MC")}
            className={cn(
              "inline-block cursor-pointer rounded-[12px] px-1.5 font-geistSemiBold text-xs leading-[14px] text-fontColorSecondary duration-300",
              mcOrPrice === "MC" && "bg-white/10 text-fontColorPrimary",
            )}
          >
            MC
          </button>
          <button
            onClick={() => setMCOrPrice("PRICE")}
            className={cn(
              "inline-block cursor-pointer rounded-[12px] px-1.5 font-geistSemiBold text-xs leading-[14px] text-fontColorSecondary duration-300",
              mcOrPrice === "PRICE" && "bg-white/10 text-fontColorPrimary",
            )}
          >
            Price
          </button>
        </div>
      ),
      tooltipContent: "The total value of the transaction made in SOL/USD.",
      className: "min-w-[152px]",
    },
    {
      label: "Amount of tokens",
      tooltipContent: "The amount of tokens bought/sold.",
      className: "min-w-[155px]",
    },
    {
      label: "Total SOL",
      sortButton: (
        <div className="flex h-[20px] w-auto items-center justify-center rounded-[10px] bg-secondary p-1">
          <button
            onClick={() => setTotalSOLCurrency("USDC")}
            className={cn(
              "inline-block cursor-pointer rounded-[12px] px-1.5 font-geistSemiBold text-xs leading-[14px] text-fontColorSecondary duration-300",
              totalSOL === "USDC" && "bg-white/10 text-fontColorPrimary",
            )}
          >
            USDC
          </button>
          <button
            onClick={() => setTotalSOLCurrency("SOL")}
            className={cn(
              "inline-block cursor-pointer rounded-[12px] px-1.5 font-geistSemiBold text-xs leading-[14px] text-fontColorSecondary duration-300",
              totalSOL === "SOL" && "bg-white/10 text-fontColorPrimary",
            )}
          >
            SOL
          </button>
        </div>
      ),
      tooltipContent: "The total value of the transaction made in SOL/USD.",
      className: "min-w-[185px]",
    },
    {
      label: "Maker",
      tooltipContent: "The wallet information of the individual transaction.",
      className: "min-w-[155px] justify-end",
    },
  ];

  return (
    <div className="flex w-full flex-grow flex-col">
      <OverlayScrollbarsComponent
        defer
        element="div"
        className="table__modal__overlayscrollbar relative w-full flex-grow overflow-y-scroll"
      >
        <div className="absolute left-0 top-0 flex w-full flex-grow flex-col">
          <div className="header__table__container">
            {HeaderData.map((item, index) => (
              <HeadCol isWithBorder={false} key={index} {...item} />
            ))}
          </div>

          <div className="flex h-auto w-full flex-col gap-y-2 p-4 md:gap-y-0 md:p-0">
            {Array.from({ length: 32 }).map((_, index) => (
              <TradeHistoryCard key={index} />
            ))}
          </div>
        </div>
      </OverlayScrollbarsComponent>
    </div>
  );
}
