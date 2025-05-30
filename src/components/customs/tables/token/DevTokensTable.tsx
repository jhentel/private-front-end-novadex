"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useTokenMessageStore } from "@/stores/token/use-token-messages.store";
// ######## Components 🧩 ########
import DevTokensCard from "@/components/customs/cards/token/DevTokensCard";
import HeadCol from "@/components/customs/tables/HeadCol";
import EmptyState from "@/components/customs/EmptyState";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { usePopupStore } from "@/stores/use-popup-state";
import { cn } from "@/libraries/utils";
import { memo } from "react";

function DevTokensTable() {
  const devTokens = useTokenMessageStore((state) => state.developerTokens);
  const { remainingScreenWidth } = usePopupStore();

  const HeaderData = [
    {
      label: "Token",
      tooltipContent: "The token name, ticker and address",
      className: "min-w-[180px] min-[1500px]:min-w-[205px]",
    },
    {
      label: "Created",
      tooltipContent: "Time passed since the token was created",
      className: "min-w-[95px] min-[1500px]:min-w-[115px]",
    },
    {
      label: "Migrated",
      tooltipContent: "Whether the token reached migration or not",
      className: "min-w-[95px] min-[1500px]:min-w-[115px]",
    },
    {
      label: "Liquidity",
      tooltipContent: "Amount of liquidity in the token",
      className: "min-w-[95px] min-[1500px]:min-w-[115px]",
    },
    {
      label: "Market cap",
      tooltipContent: "The market cap of the token",
      className: "min-w-[95px] min-[1500px]:min-w-[115px]",
    },
  ];

  if (devTokens?.length === 0) {
    return (
      <div className="mt-10 flex h-auto w-full justify-center">
        <EmptyState state="No Result" />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-grow flex-col max-md:pb-[70px]">
      <OverlayScrollbarsComponent
        defer
        element="div"
        className="table__overlayscrollbar relative w-full flex-grow overflow-y-scroll"
      >
        <div className="absolute left-0 top-0 flex w-full flex-grow flex-col">
          <div
            className={cn(
              "header__table__container !hidden xl:!flex",
              remainingScreenWidth <= 1280 && "xl:!hidden",
            )}
          >
            {HeaderData.map((item, index) => (
              <HeadCol isWithBorder={false} key={index} {...item} />
            ))}
          </div>

          <div
            className={cn(
              "flex h-auto w-full flex-col gap-y-2 p-4 md:gap-y-0 md:p-0",
              remainingScreenWidth <= 768 && "md:gap-y-2 md:p-4",
            )}
          >
            {devTokens.map((tokenData) => (
              <DevTokensCard key={tokenData.mint} tokenData={tokenData} />
            ))}
          </div>
        </div>
      </OverlayScrollbarsComponent>
    </div>
  );
}

export default memo(DevTokensTable);
