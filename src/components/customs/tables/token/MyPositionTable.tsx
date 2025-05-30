"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { memo, useMemo } from "react";
import { useParams } from "next/navigation";
import { useTokenHoldingStore } from "@/stores/token/use-token-holding.store";
import { useHoldingsMessageStore } from "@/stores/holdings/use-holdings-messages.store";
import { useMyPositionTableSettingStore } from "@/stores/table/token/use-my-position-table-setting.store";
// ######## Components 🧩 ########
import MyPositionCard from "@/components/customs/cards/token/MyPositionCard";
import HeadCol from "@/components/customs/tables/HeadCol";
import EmptyState from "@/components/customs/EmptyState";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { usePopupStore } from "@/stores/use-popup-state";
import { cn } from "@/libraries/utils";

function MyPositionTable() {
  const params = useParams();
  const mint = (params?.["mint-address"] || params?.["pool-address"]) as string;
  const myHoldingsMessages = useTokenHoldingStore((state) => state.messages);
  const messageCount = useTokenHoldingStore((state) => state.messageCount);
  const { remainingScreenWidth } = usePopupStore();

  const HeaderData = [
    {
      label: "Token",
      tooltipContent: "The token name, ticker and address.",
      className: "min-w-[220px]",
    },
    {
      label: "Wallet name",
      tooltipContent:
        "The wallet which the position is under, including the wallet address.",
      className: "min-w-[145px]",
    },
    {
      label: "Invested",
      tooltipContent: "The amount of SOL/USD invested into the token.",
      className: "min-w-[170px]",
    },
    {
      label: "Remaining",
      tooltipContent: "The amount of SOL/USD remaining in the token.",
      className: "min-w-[145px]",
    },
    {
      label: "Sold",
      tooltipContent: "The amount of SOL/USD sold from the invested amount.",
      className: "min-w-[145px]",
    },
    {
      label: "P&L",
      tooltipContent: "The profit/loss percentage as well as the SOL value.",
      className: "min-w-[145px]",
    },
    {
      label: "Actions",
      tooltipContent: "Action buttons which include sharing the PNL image.",
      className: "min-w-[145px]",
    },
  ];

  const filteredHoldings = useMemo(() => {
    return myHoldingsMessages.flatMap((holding) =>
      holding.tokens
        .filter((t: any) => t.token.mint === mint)
        .map((token) => ({
          wallet: holding.wallet,
          token,
        })),
    );
  }, [messageCount, mint]);

  if (filteredHoldings.length === 0) {
    return (
      <div className="mt-10 flex h-auto w-full justify-center">
        <EmptyState state="No Result" />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-grow flex-col">
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
              remainingScreenWidth < 768 && "md:gap-y-2 md:p-4",
            )}
          >
            {filteredHoldings.map(({ wallet, token }) => (
              <MyPositionCard
                key={`${wallet}-${token.token.mint}`}
                wallet={wallet}
                tokenData={token}
              />
            ))}
          </div>
        </div>
      </OverlayScrollbarsComponent>
    </div>
  );
}

export default memo(MyPositionTable);
