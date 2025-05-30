import {
  DropdownParams,
  IDropdownApi,
  EntityId,
  IChartingLibraryWidget,
} from "@/types/charting_library";
import { TradeFilter, Trade } from "@/types/nova_tv.types";

export function addAveragePriceLine(
  type: "buy" | "sell",
  tvWidget: IChartingLibraryWidget | null,
  time: number,
  price: number | undefined,
) {
  if (!tvWidget || !price) {
    // console.log("AVG - ❌", {
    //   tvWidget,
    //   price,
    // });
    return;
  } else {
    // console.log("AVG - ✅", {
    //   tvWidget,
    //   price,
    // });
  }

  return tvWidget.activeChart().createShape(
    { time, price },
    {
      shape: "horizontal_line",
      lock: true,
      disableSelection: true,
      overrides: {
        linecolor: type === "buy" ? "#2196F3" : "#F0A664",
        linestyle: 2,
        linewidth: 2,
        showPrice: true,
        showLabel: true,
        text: type === "buy" ? "Buy Avg Price" : "Sell Avg Price",
        textcolor: "#FFFFFF",
        horzLabelsAlign: "right",
      },
    },
  );
}

export function removeAveragePriceLine(
  type: "buy" | "sell",
  tvWidget: IChartingLibraryWidget | null,
  averagePriceShapeId: string | null,
) {
  if (!tvWidget || !averagePriceShapeId) return;
  tvWidget.activeChart().removeEntity(averagePriceShapeId as EntityId);
}
// export function addAveragePriceLine(
//   tvWidget: IChartingLibraryWidget | null,
//   time: number,
//   price: number | undefined,
// ) {
//   if (!tvWidget || !price) {
//     console.log("AVG - ❌", {
//       tvWidget,
//       price,
//     });
//     return;
//   } else {
//     console.log("AVG - ✅", {
//       tvWidget,
//       price,
//     });
//   }

//   return tvWidget.activeChart().createShape(
//     { time, price },
//     {
//       shape: "horizontal_line",
//       lock: true,
//       disableSelection: true,
//       overrides: {
//         linecolor: "#2196F3",
//         linestyle: 2, // 2 = dotted
//         linewidth: 2,
//         showPrice: true,
//         showLabel: true,
//         text: "Avg Price",
//         textcolor: "#FFFFFF",
//         horzLabelsAlign: "right",
//       },
//     },
//   );
// }

// export function removeAveragePriceLine(
//   tvWidget: IChartingLibraryWidget | null,
//   averagePriceShapeId: string | null,
// ) {
//   if (!tvWidget || !averagePriceShapeId) return;
//   tvWidget.activeChart().removeEntity(averagePriceShapeId as EntityId);
// }

export async function updateTradeFilters(
  tvWidget: IChartingLibraryWidget | null,
  tradeFilters: Set<TradeFilter>,
  dropdownApi: IDropdownApi | null,
): Promise<IDropdownApi | null> {
  if (!tvWidget) {
    // console.log("TV WIDGET NOT EXIST ❌");
    return null;
  } else {
    // console.log("TV WIDGET EXIST ✅", {
    //   updated: tradeFilters,
    // });
  }

  const inactiveIcon = `○`;
  const activeIcon = `●`;

  const isMyTradesActive = tradeFilters.has("my_trades");
  const isSniperTradesActive = tradeFilters.has("sniper_trades");
  const isDevTradesActive = tradeFilters.has("dev_trades");
  const isInsiderTradesActive = tradeFilters.has("insider_trades");
  const isTrackedTradesActive = tradeFilters.has("tracked_trades");
  const isOtherTradesActive = tradeFilters.has("other_trades");

  // Marks filter dropdown
  const dropdownParams: DropdownParams = {
    title: "Trades Filter",
    tooltip: "My/Sniper/Dev/Insider/Tracked/Other Trades",
    items: [
      {
        title: `${isMyTradesActive ? activeIcon : inactiveIcon} My trades`,
        onSelect: () => {
          if (isMyTradesActive) {
            tradeFilters.delete("my_trades");
          } else {
            tradeFilters.add("my_trades");
          }
          saveTradeFiltersToLocalStorage(tradeFilters);
          updateTradeFilters(tvWidget, tradeFilters, dropdownApi);
          tvWidget.activeChart().refreshMarks();
        },
      },
      {
        title: `${isSniperTradesActive ? activeIcon : inactiveIcon} Sniper trades`,
        onSelect: () => {
          if (isSniperTradesActive) {
            tradeFilters.delete("sniper_trades");
          } else {
            tradeFilters.add("sniper_trades");
          }
          saveTradeFiltersToLocalStorage(tradeFilters);
          updateTradeFilters(tvWidget, tradeFilters, dropdownApi);
          tvWidget.activeChart().refreshMarks();
        },
      },
      {
        title: `${isDevTradesActive ? activeIcon : inactiveIcon} Dev trades`,
        onSelect: () => {
          if (isDevTradesActive) {
            tradeFilters.delete("dev_trades");
          } else {
            tradeFilters.add("dev_trades");
          }
          saveTradeFiltersToLocalStorage(tradeFilters);
          updateTradeFilters(tvWidget, tradeFilters, dropdownApi);
          tvWidget.activeChart().refreshMarks();
        },
      },
      {
        title: `${isInsiderTradesActive ? activeIcon : inactiveIcon} Insider trades`,
        onSelect: () => {
          if (isInsiderTradesActive) {
            tradeFilters.delete("insider_trades");
          } else {
            tradeFilters.add("insider_trades");
          }
          saveTradeFiltersToLocalStorage(tradeFilters);
          updateTradeFilters(tvWidget, tradeFilters, dropdownApi);
          tvWidget.activeChart().refreshMarks();
        },
      },
      {
        title: `${isTrackedTradesActive ? activeIcon : inactiveIcon} Tracked trades`,
        onSelect: () => {
          if (isTrackedTradesActive) {
            tradeFilters.delete("tracked_trades");
          } else {
            tradeFilters.add("tracked_trades");
          }
          saveTradeFiltersToLocalStorage(tradeFilters);
          updateTradeFilters(tvWidget, tradeFilters, dropdownApi);
          tvWidget.activeChart().refreshMarks();
        },
      },
      {
        title: `${isOtherTradesActive ? activeIcon : inactiveIcon} Other trades`,
        onSelect: () => {
          if (isOtherTradesActive) {
            tradeFilters.delete("other_trades");
          } else {
            tradeFilters.add("other_trades");
          }
          saveTradeFiltersToLocalStorage(tradeFilters);
          updateTradeFilters(tvWidget, tradeFilters, dropdownApi);
          tvWidget.activeChart().refreshMarks();
        },
      },
    ],
  };

  if (dropdownApi) {
    dropdownApi.applyOptions(dropdownParams);
    return dropdownApi;
  } else {
    dropdownApi = await tvWidget.createDropdown(dropdownParams);
    return dropdownApi;
  }
}

export function saveTradeFiltersToLocalStorage(tradeFilters: Set<TradeFilter>) {
  const filtersArray = Array.from(tradeFilters);
  localStorage.setItem("chart_trade_filters", JSON.stringify(filtersArray));
}

export function filterTrades(trades: Trade[], tradeFilters: Set<TradeFilter>) {
  if (tradeFilters.size === 0) return trades;

  return trades.filter((trade) => {
    const { letter, imageUrl } = trade;
    const isMyTrade = letter.length === 1 && !imageUrl;
    const isSniperTrade = letter.length === 2 && letter[0] === "S";
    const isDevTrade = letter.length === 2 && letter[0] === "D";
    const isInsiderTrade = letter.length === 2 && letter[0] === "I";
    const isTrackedTrade = letter.length === 1 && imageUrl;

    if (isMyTrade) {
      return tradeFilters.has("my_trades");
    } else if (isSniperTrade) {
      return tradeFilters.has("sniper_trades");
    } else if (isDevTrade) {
      return tradeFilters.has("dev_trades");
    } else if (isInsiderTrade) {
      return tradeFilters.has("insider_trades");
    } else if (isTrackedTrade) {
      return tradeFilters.has("tracked_trades");
    } else {
      return tradeFilters.has("other_trades");
    }
  });
}
