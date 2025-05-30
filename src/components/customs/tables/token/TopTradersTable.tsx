"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useTokenMessageStore } from "@/stores/token/use-token-messages.store";
// ######## Components 🧩 ########
import TopTradersCard from "@/components/customs/cards/token/TopTradersCard";
import HeadCol from "@/components/customs/tables/HeadCol";
import SortButton, { SortCoinButton } from "@/components/customs/SortButton";
import EmptyState from "@/components/customs/EmptyState";
import { useTokenCardsFilter } from "@/stores/token/use-token-cards-filter.store";
import { TokenDataMessageType, TokenInfo } from "@/types/ws-general";
import DialogPnLWrapper from "../../modals/DialogPnLWrapper";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { FixedSizeList } from "react-window";
import { usePopupStore } from "@/stores/use-popup-state";
import { cn } from "@/libraries/utils";
import { useQuery } from "@tanstack/react-query";
import { fetchResolveSymbol } from "@/apis/rest/candles";
import { useParams } from "next/navigation";

function TopTradersTable({
  initData,
}: {
  initData?: TokenDataMessageType | null;
}) {
  // List height measurement
  const listRef = useRef<HTMLDivElement>(null);
  const [listHeight, setListHeight] = useState(0);
  const {
    topTradersBought,
    topTradersSold,
    topTradersRemaining,
    setTopTradersBought,
    setTopTradersSold,
    setTopTradersRemaining,
  } = useTokenCardsFilter();
  const topTradersMessages = useTokenMessageStore(
    (state) => state.chartTraderMessages,
  );
  const params = useParams();
  const tokenMint = (params?.["mint-address"] as string) || "";

  const HeaderData = [
    {
      label: "Rank",
      tooltipContent: "The rank taking in account the amount of holdings",
      className: "w-[72px] flex-shrink-0 min-w-[72px] justify-center",
    },
    {
      label: "Wallet",
      tooltipContent: "The wallet of the holder",
      className: "min-w-[150px]",
    },
    {
      label: "Bought",
      sortButton: (
        <SortButton
          type="usdc-or-sol"
          value={topTradersBought}
          setValue={setTopTradersBought}
        />
      ),
      tooltipContent:
        "The value (SOL/USD) and amount of tokens bought and transactions made",
      className: "min-w-[140px] min-[1500px]:min-w-[155px]",
    },
    {
      label: "Sold",
      tooltipContent:
        "The value (SOL/USD) and amount of tokens sold and transactions made",
      className: "min-w-[140px]",
      sortButton: (
        <SortButton
          type="usdc-or-sol"
          value={topTradersSold}
          setValue={setTopTradersSold}
        />
      ),
    },
    {
      label: "PnL",
      tooltipContent: "The profit/loss percentage as well as the SOL/USD value",
      className: "min-w-[200px]",
    },
    {
      label: "% Owned",
      tooltipContent: "Percentage of the supply held",
      className: "min-w-[120px] min-[1500px]:min-w-[120px]",
    },
    {
      label: "Remaining",
      tooltipContent:
        "The amount of supply remaining, taking into account the purchase amount",
      className: "min-w-[140px] min-[1500px]:min-w-[175px]",
      sortButton: (
        <SortCoinButton
          value={topTradersRemaining}
          setValue={setTopTradersRemaining}
          tokenImage={initData?.token.image as string}
        />
      ),
    },
    {
      label: "Actions",
      tooltipContent: "Action buttons which include sharing the PNL image.",
      className: "min-w-[80px] ml-4 justify-start",
    },
  ];

  // if no initData?.token then fetch metadata
  const resolve = useQuery({
    queryKey: ["resolve", initData?.token?.mint ?? tokenMint],
    queryFn: async () =>
      await fetchResolveSymbol((initData?.token?.mint as string) ?? tokenMint),
    enabled: !initData?.token?.symbol,
  });

  const { remainingScreenWidth } = usePopupStore();

  // Effect to update list height
  useEffect(() => {
    const updateHeight = () => {
      if (listRef.current) {
        setListHeight(
          window.innerWidth > 768
            ? listRef.current.clientHeight
            : window.innerHeight - 180,
        );
      }
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const Row = useCallback(
    ({ index, style, data }: any) => {
      const { items } = data;
      const trader = items[index];
      if (!trader) return null;

      return (
        <div style={style} key={trader.maker}>
          <TopTradersCard
            rank={index + 1}
            trader={trader}
            tokenData={initData?.token || (resolve.data as TokenInfo)}
          />
        </div>
      );
    },
    [initData, resolve.data],
  );

  if (topTradersMessages?.length === 0) {
    return (
      <div className="mt-10 flex h-auto w-full justify-center">
        <EmptyState state="No Result" />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-grow flex-col">
      <DialogPnLWrapper />
      <div className="relative w-full flex-grow">
        <div className="absolute left-0 top-0 flex w-full flex-grow flex-col">
          <div
            className={cn(
              "header__table__container !hidden !pl-0 !pr-7 xl:!flex",
              remainingScreenWidth < 1280 && "xl:!hidden",
            )}
          >
            {HeaderData.map((item, index) => (
              <HeadCol isWithBorder={false} key={index} {...item} />
            ))}
          </div>

          <div
            ref={listRef}
            className={cn(
              "flex h-fit w-full flex-grow flex-col max-md:p-3 md:h-[72rem]",
              remainingScreenWidth < 768 && "max-md:p-0 md:h-fit",
            )}
          >
            {listHeight > 0 && (
              <FixedSizeList
                className="nova-scroller darker"
                height={listHeight}
                width="100%"
                itemCount={topTradersMessages.length}
                itemSize={remainingScreenWidth >= 1280 ? 72 : 190}
                itemData={{
                  items: topTradersMessages,
                }}
              >
                {Row}
              </FixedSizeList>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(TopTradersTable);
