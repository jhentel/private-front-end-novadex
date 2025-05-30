import { useRecentSearchTokensStore } from "@/stores/use-recent-search-tokens";
import GlobalRecentTokenCard from "../../cards/GlobalRecentTokenCard";

export const RecentSearchTokenGlobalSearch = ({
  setOpenDialog,
}: {
  setOpenDialog?: (value: boolean) => void;
}) => {
  const recentSearchTokens = useRecentSearchTokensStore(
    (state) => state.recentTokens,
  );
  return (
    <div className="flex w-full items-center gap-x-4 px-4 pt-2">
      <h4 className="text-xs text-fontColorSecondary">Recents:</h4>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {recentSearchTokens.slice(0, 5).map((token, index) => (
          <GlobalRecentTokenCard
            key={token.mint + index}
            {...token}
            setOpenDialog={setOpenDialog!}
          />
        ))}
      </div>
    </div>
  );
};
