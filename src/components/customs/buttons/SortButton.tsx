import { cn } from "@/libraries/utils";
import {
  SortRow,
  useTrendingSortStore,
} from "@/stores/table/trending/trending-sort";
import React from "react";
import {
  HiArrowNarrowUp,
  HiArrowNarrowDown,
} from "react-icons/hi";
import { IconType } from "react-icons/lib";

interface SortButtonProps {
  rowName?: SortRow;
  LeftIcon?: IconType;
  title?: string;
}

const SortButton = ({
  rowName,
  LeftIcon,
  title,
}: SortButtonProps) => {
  const toggleSort = useTrendingSortStore((state) => state.toggleSort);
  const currentSortedRow = useTrendingSortStore((state) => state.currentSortedRow);
  const sortOrder = useTrendingSortStore((state) => state.sortOrder);

  const isActive = currentSortedRow === rowName;

  return (
    <div className="ml-2 flex items-center">
      {LeftIcon && (
        <div className="mr-0.5 flex cursor-default items-center">
          <LeftIcon
            className={cn(
              "text-sm duration-300",
              isActive && sortOrder !== "NONE"
                ? "text-[#DF74FF]"
                : "text-fontColorSecondary"
            )}
          />
        </div>
      )}
      <button
        title={title ?? `Sort by ${rowName}`}
        onClick={() => toggleSort(rowName)}
        className="flex cursor-pointer items-center -space-x-[7.5px]"
      >
        <HiArrowNarrowUp
          className={cn(
            "text-sm duration-300",
            isActive && sortOrder === "ASC"
              ? "text-[#DF74FF]"
              : "text-fontColorSecondary"
          )}
        />
        <HiArrowNarrowDown
          className={cn(
            "text-sm duration-300",
            isActive && sortOrder === "DESC"
              ? "text-[#DF74FF]"
              : "text-fontColorSecondary"
          )}
        />
      </button>
    </div>
  );
};

SortButton.displayName = "SortButton";

export default React.memo(SortButton);
