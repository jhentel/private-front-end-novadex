import { memo } from "react";

import GlobalSearchResultList from "../../lists/GlobalSearchResultList";

export const SearchResults = memo(
  ({
    results,
    focusedItemIndex,
    resultCardsRef,
    onResultClick,
  }: {
    results: any[];
    focusedItemIndex: number;
    resultCardsRef: any;
    onResultClick: () => void;
  }) => (
    <GlobalSearchResultList
      data={results}
      focusedItemIndex={focusedItemIndex}
      resultCardsRef={resultCardsRef}
      setOpenDialog={onResultClick}
    />
  ),
);

SearchResults.displayName = "SearchResults";
