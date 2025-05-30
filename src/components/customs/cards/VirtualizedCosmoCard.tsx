import { areEqual } from "react-window";
import CosmoCard from "./CosmoCard";
import { memo, useMemo } from "react";
import { CosmoDataMessageType } from "@/types/ws-general";
import CosmoCardLoading from "../loadings/CosmoCardLoading";
import useSocialFeedMonitor from "@/hooks/use-social-feed-monitor";

interface RowProps {
  data: {
    items: CosmoDataMessageType[];
    column: number;
    amount?: number;
  };
  index: number;
  style: React.CSSProperties;
}

// Memoized row component to prevent re-renders
const CosmoCardRow = memo(({ data, index, style }: RowProps) => {
  const { discordMessages } = useSocialFeedMonitor();

  const transformedItem = useMemo(() => {
    return data.items.map((token) => {
      const isMonitored = discordMessages.some(
        (msg) => msg.address === token.mint,
      );

      return {
        ...token,
        is_discord_monitored: isMonitored,
        discord_details: discordMessages.find(
          (msg) => msg.address === token.mint,
        ),
      };
    });
  }, [data.items, discordMessages]);

  const item = transformedItem[index];

  if (!item) return <CosmoCardLoading />;

  return (
    <div style={style} key={item?.mint}>
      <CosmoCard
        amount={data?.amount}
        isFirst={index === 0}
        data={item}
        column={data.column as 1 | 2 | 3}
      />
    </div>
  );
}, areEqual); // Using react-window's areEqual for deep comparison

CosmoCardRow.displayName = "CosmoCardRow";
export default CosmoCardRow;
