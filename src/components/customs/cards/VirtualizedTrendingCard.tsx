import { TrendingDataMessageType } from "@/types/ws-general";
import TrendingCard from "./TrendingCard";
import React from "react";
import { areEqual } from "react-window";

interface RowProps {
  data: {
    items: TrendingDataMessageType[];
    trackedWalletsOfToken: Record<string, string[]>;
    column: number;
  };
  index: number;
  style: React.CSSProperties;
}

// Memoized row component to prevent re-renders
const TrendingCardRow = React.memo(({ data, index, style }: RowProps) => {
  const item = data.items[index];

  return (
    <div style={style}>
      <TrendingCard
        isFirst={index === 0}
        tokenData={item}
        index={index}
        trackedWalletsOfToken={data.trackedWalletsOfToken}
      />
    </div>
  );
}, areEqual); // Using react-window's areEqual for deep comparison

TrendingCardRow.displayName = "TrendingCardRow";
export default TrendingCardRow;
