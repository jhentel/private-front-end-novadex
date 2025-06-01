"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useMostProfitableTableSettingStore } from "@/stores/table/wallet-trade/use-most-profitable-table-setting.store";
// ######## Components 🧩 ########
import HeadCol from "@/components/customs/tables/HeadCol";
import MostProfitableCard from "@/components/customs/cards/wallet-trade/MostProfitableCard";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

export default function MostProfitableTable() {
  const { investedOrder, soldOrder, setInvestedOrder, setSoldOrder } =
    useMostProfitableTableSettingStore();

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

  const HeaderData = [
    {
      label: "Token",
      tooltipContent: "Token Information",
      className: "min-w-[160px]",
    },
    {
      label: "Invested",
      tooltipContent: "Invested Information",
      className: "min-w-[160px]",
    },
    {
      label: "Sold",
      tooltipContent: "Sold Information",
      className: "min-w-[160px]",
    },
    {
      label: "P&L",
      tooltipContent: "P&L Information",
      className: "min-w-[160px]",
    },
    {
      label: "P&L %",
      tooltipContent: "P&L % Information",
      className: "min-w-[150px]",
    },
    {
      label: "Share",
      tooltipContent: "Share Information",
      className: "min-w-[75px]",
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

          <div className="flex h-auto w-full flex-col gap-y-2 p-4 md:gap-y-0 md:p-0">
            {Array.from({ length: 32 }).map((_, index) => (
              <MostProfitableCard key={index} />
            ))}
          </div>
        </div>
      </OverlayScrollbarsComponent>
    </div>
  );
}
