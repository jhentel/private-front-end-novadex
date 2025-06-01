"use client";

// ######## Components 🧩 ########
import HeadCol from "@/components/customs/tables/HeadCol";
import DeployedTokensCard from "@/components/customs/cards/wallet-trade/DeployedTokensCard";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

export default function DeployedTokensTable() {
  const HeaderData = [
    {
      label: "Token",
      tooltipContent: "Token Information",
      className: "min-w-[180px]",
    },
    {
      label: "Market Cap",
      tooltipContent: "Market Cap Information",
      className: "min-w-[175px]",
    },
    {
      label: "Amount USD",
      tooltipContent: "Amount USD Information",
      className: "min-w-[175px]",
    },
    {
      label: "Liquidity",
      tooltipContent: "Liquidity Information",
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

          <div className="flex h-auto w-full flex-col gap-y-2 p-4 md:gap-y-0 md:p-0">
            {Array.from({ length: 32 }).map((_, index) => (
              <DeployedTokensCard key={index} />
            ))}
          </div>
        </div>
      </OverlayScrollbarsComponent>
    </div>
  );
}
