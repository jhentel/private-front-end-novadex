import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Define the card config item type
export type CardViewConfigItem = {
  key: string;
  label: string;
  status: "active" | "inactive";
};

// Define the store type
type CustomViewCard = {
  cardViewConfig: CardViewConfigItem[];
  setCardViewConfig: (newConfig: CardViewConfigItem[]) => void;
};

// Create the store with persistence
export const useCustomCardView = create<CustomViewCard>()(
  persist(
    (set) => ({
      cardViewConfig: [
        {
          key: "star",
          label: "Star",
          status: "active",
        },
        {
          key: "snipers",
          label: "Snipers",
          status: "active",
        },
        {
          key: "insiders",
          label: "Insiders",
          status: "active",
        },
        {
          key: "top-10-holders",
          label: "Top 10 Holders",
          status: "active",
        },
        {
          key: "dev-holdings",
          label: "Dev Holdings",
          status: "active",
        },
        {
          key: "bundled",
          label: "Bundled",
          status: "active",
        },
        {
          key: "market-cap",
          label: "Market Cap",
          status: "active",
        },
        {
          key: "volume",
          label: "Volume",
          status: "active",
        },
        {
          key: "total-trader",
          label: "Total Trader",
          status: "active",
        },
        {
          key: "holders",
          label: "Holders",
          status: "active",
        },
      ],
      setCardViewConfig: (newConfig) =>
        set({
          cardViewConfig: newConfig,
        }),
    }),
    {
      name: "custom-card-view",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
