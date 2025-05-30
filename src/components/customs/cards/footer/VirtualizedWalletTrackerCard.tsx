import { areEqual } from "react-window";
import WalletTrackerCard from "./WalletTrackerCard";
import WalletTrackerCardPopOut from "./WalletTrackerCardPopOut";
import { WalletTracker } from "@/apis/rest/wallet-tracker";
import { IVariant } from "@/components/customs/tables/footer/WalletTrackerTable";
import React from "react";

interface RowProps {
  data: {
    items: WalletTracker[];
    walletsOfToken: Record<string, string[]>;
    isSnapOpen: boolean;
    variant: IVariant;
  };
  index: number;
  style: React.CSSProperties;
}

// Memoized row component to prevent re-renders
const WallerTrackerCardRow = React.memo(({ data, index, style }: RowProps) => {
  const { variant, walletsOfToken, isSnapOpen, items } = data;
  const item = items[index];

  return (
    // overflow-hidden, to disable scroll on the row
    <div className="overflow-hidden" style={style}>
      {variant === "normal" ? (
        <WalletTrackerCard
          index={index}
          isFirst={index === 0}
          key={`${item.timestamp}-${item.maker}-${item.signature}`}
          tracker={item}
          wallets={walletsOfToken[item.mint]}
          type={item.type.toLowerCase() as "buy" | "sell"}
          responsiveBreakpoint={1280}
          isSnapOpen={isSnapOpen}
        />
      ) : (
        <WalletTrackerCardPopOut
          index={index}
          isFirst={index === 0}
          key={`${item.timestamp}-${item.maker}-${item.signature}`}
          tracker={item}
          wallets={walletsOfToken[item.mint]}
          type={item.type.toLowerCase() as "buy" | "sell"}
          responsiveBreakpoint={1280}
        />
      )}
    </div>
  );
}, areEqual); // Using react-window's areEqual for deep comparison

WallerTrackerCardRow.displayName = "WallerTrackerCardRow";
export default WallerTrackerCardRow;
