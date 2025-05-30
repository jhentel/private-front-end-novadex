import { create } from "zustand";

interface TokenActiveTabStore {
  activeTab:
    | "Trades"
    | "Holders"
    | "Top Traders"
    | "Dev Tokens"
    | "My Position";
  setActiveTab: (
    value: "Trades" | "Holders" | "Top Traders" | "Dev Tokens" | "My Position",
  ) => void;
}

export const useTokenActiveTabStore = create<TokenActiveTabStore>()((set) => ({
  activeTab: "Trades",
  setActiveTab: (value) =>
    set(() => ({
      activeTab: value,
    })),
}));
