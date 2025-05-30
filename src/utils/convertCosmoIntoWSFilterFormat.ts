import { NewlyCreatedFilterState } from "@/stores/cosmo/use-newly-created-filter.store";
import { AboutToGraduateFilterState } from "@/stores/cosmo/use-about-to-graduate-filter.store";
import { GraduatedFilterState } from "@/stores/cosmo/use-graduated-filter.store";

const convertCosmoIntoWSFilterFormat = (
  latestState:
    | NewlyCreatedFilterState["filters"]["genuine"]
    | AboutToGraduateFilterState["filters"]["genuine"]
    | GraduatedFilterState["filters"]["genuine"],
  blacklistDevelopers: string[] | null,
  hiddenTokens: string,
  column: "created" | "aboutToGraduate" | "graduated",
) => {
  let dexes = Object.entries(latestState?.checkBoxes)
    .filter(
      ([key, value]) => value === true && key !== "showHide" && key !== "boop",
    )
    .map(([key]) => {
      if (key === "pumpfun") {
        return "Pump.Fun";
      }
      if (key === "pumpswap") {
        return "Pump.Swap";
      }
      if (key === "launch_a_coin") {
        return "Launch a Coin";
      }
      if (key === "launchlab") {
        return "LaunchLab";
      }
      if (key === "dynamic_bonding_curve") {
        return "Dynamic Bonding Curve";
      }
      if (key === "meteora_amm_v2") {
        return "Meteora AMM V2";
      }
      if (key === "meteora_amm") {
        return "Meteora AMM";
      }
      return key
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("");
    })
    .join(",");

  if (column === "graduated") {
    if (dexes.includes("Pump.Fun")) {
      dexes = dexes + ",Pump.Swap";
    }
    if (
      dexes.includes("Dynamic Bonding Curve") &&
      !dexes.includes("Launch a Coin")
    ) {
      dexes = dexes + ",Launch a Coin";
    }
    if (dexes.includes("LaunchLab") && !dexes.includes("Bonk")) {
      dexes = dexes + ",Bonk";
    }
  }

  return {
    show_keywords: latestState?.showKeywords,
    hide_keywords: latestState?.doNotShowKeywords,
    dexes: dexes,
    blacklist_developers: blacklistDevelopers
      ? String(blacklistDevelopers)
      : "",
    hidden_tokens: hiddenTokens,
    show_hidden: String(latestState?.checkBoxes?.showHide || ""),
    min_holders: latestState?.byHoldersCount?.min
      ? String(latestState.byHoldersCount?.min)
      : "",
    max_holders: latestState?.byHoldersCount?.max
      ? String(latestState.byHoldersCount?.max)
      : "",
    min_top10_holders: latestState?.byTop10Holders?.min
      ? String(latestState.byTop10Holders?.min)
      : "",
    max_top10_holders: latestState?.byTop10Holders?.max
      ? String(latestState.byTop10Holders?.max)
      : "",
    min_dev_holdings: latestState?.byDevHoldingPercentage?.min
      ? String(latestState.byDevHoldingPercentage?.min)
      : "",
    max_dev_holdings: latestState?.byDevHoldingPercentage?.max
      ? String(latestState.byDevHoldingPercentage?.max)
      : "",
    min_dev_migrated: latestState?.byDevMigrated?.min
      ? String(latestState.byDevMigrated?.min)
      : "",
    max_dev_migrated: latestState?.byDevMigrated?.max
      ? String(latestState.byDevMigrated?.max)
      : "",
    min_snipers: latestState?.bySnipers?.min
      ? String(latestState.bySnipers?.min)
      : "",
    max_snipers: latestState?.bySnipers?.max
      ? String(latestState.bySnipers?.max)
      : "",
    min_insider_holding: latestState?.byInsiderHoldingPercentage?.min
      ? String(latestState.byInsiderHoldingPercentage?.min)
      : "",
    max_insider_holding: latestState?.byInsiderHoldingPercentage?.max
      ? String(latestState.byInsiderHoldingPercentage?.max)
      : "",
    min_bot_holders: latestState?.byBotHolders?.min
      ? String(latestState.byBotHolders?.min)
      : "",
    max_bot_holders: latestState?.byBotHolders?.max
      ? String(latestState.byBotHolders?.max)
      : "",
    min_age: latestState?.byAge?.min ? String(latestState.byAge?.min) : "",
    max_age: latestState?.byAge?.max ? String(latestState.byAge?.max) : "",
    min_liquidity: latestState?.byCurrentLiquidity?.min
      ? String(latestState.byCurrentLiquidity?.min)
      : "",
    max_liquidity: latestState?.byCurrentLiquidity?.max
      ? String(latestState.byCurrentLiquidity?.max)
      : "",
    min_market_cap: latestState?.byMarketCap?.min
      ? String(latestState.byMarketCap?.min)
      : "",
    max_market_cap: latestState?.byMarketCap?.max
      ? String(latestState.byMarketCap?.max)
      : "",
    min_volume: latestState?.byVolume?.min
      ? String(latestState.byVolume?.min)
      : "",
    max_volume: latestState?.byVolume?.max
      ? String(latestState.byVolume?.max)
      : "",
    min_transactions: latestState?.byTXNS?.min
      ? String(latestState.byTXNS?.min)
      : "",
    max_transactions: latestState?.byTXNS?.max
      ? String(latestState.byTXNS?.max)
      : "",
    min_buys: latestState?.byBuys?.min ? String(latestState.byBuys?.min) : "",
    max_buys: latestState?.byBuys?.max ? String(latestState.byBuys?.max) : "",
    min_sells: latestState?.bySells?.min
      ? String(latestState.bySells?.min)
      : "",
    max_sells: latestState?.bySells?.max
      ? String(latestState.bySells?.max)
      : "",
  };
};

export default convertCosmoIntoWSFilterFormat;
