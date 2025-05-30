// ######## Types 🗨️ ########
import { CosmoDataMessageType } from "@/types/ws-general";
import { TransactionInfo } from "@/types/ws-general";
import { WalletTracker } from "@/apis/rest/wallet-tracker";
import { Trade } from "@/types/nova_tv.types";

export const deduplicateAndPrioritizeLatestData_CosmoData = (
  list: CosmoDataMessageType[],
) => {
  const map = new Map<string, CosmoDataMessageType>();

  for (const item of list) {
    const existing = map.get(item.mint);
    if (!existing || item.last_update! > existing.last_update!) {
      map.set(item.mint, item);
    }
  }

  return Array.from(map.values());
};

export const deduplicateAndPrioritizeLatestData_TransactionWS = (
  list: TransactionInfo[],
) => {
  const uniqueList = list.reduce((acc, current) => {
    const existing = acc.find(
      (item) =>
        item?.maker === current?.maker &&
        item.signature === current.signature &&
        item.timestamp === current.timestamp,
    );
    if (!existing || current.timestamp! > existing.timestamp!) {
      if (existing) {
        acc.splice(acc.indexOf(existing), 1);
      }
      acc.push(current);
    }
    return acc;
  }, [] as TransactionInfo[]);

  return uniqueList;
};

export const deduplicateAndPrioritizeLatestData_WalletTracker = (
  list: WalletTracker[],
) => {
  const uniqueList = list.reduce((acc, current) => {
    const existing = acc.find(
      (item) =>
        item?.mint === current?.mint &&
        item?.type === current?.type &&
        item?.price === current?.price &&
        item?.signature === current?.signature &&
        item?.walletAddress === current?.walletAddress,
    );
    if (!existing || current.timestamp! > existing.timestamp!) {
      if (existing) {
        acc.splice(acc.indexOf(existing), 1);
      }
      acc.push(current);
    }
    return acc;
  }, [] as WalletTracker[]);

  return uniqueList;
};

export const deduplicateCurrentTokenDeveloperTrades = (trades: Trade[]) => {
  const map = new Map<string, Trade>();

  for (const item of trades) {
    const existing = map.get(item.signature!);
    if (!existing || item.signature) {
      map.set(item.signature!, item);
    }
  }

  return Array.from(map.values());
};
