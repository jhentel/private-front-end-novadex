"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useEffect, useState } from "react";
import {
  customizeableCols,
  initColumnValues,
} from "@/stores/token/use-open-custom-table";

// ######## Components 🧩 ########
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { Checkbox } from "@/components/ui/checkbox";

// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { useWindowSizeStore } from "@/stores/use-window-size.store";

export default React.memo(function CustomTableSection({
  value,
  setValue,
}: {
  value: string[];
  setValue: (value: string[]) => void;
}) {
    const width = useWindowSizeStore((state) => state.width);

  const [openPopover, setOpenPopover] = useState(false);

  const toggleSelectColumn = (selectedValue: string) => {
    const isSelected = value.includes(selectedValue);

    if (isSelected) {
      if (value.length === 1) {
        return;
      }
      setValue(value.filter((val) => val !== selectedValue));
    } else {
      setValue([...value, selectedValue]);
    }
  };

  useEffect(() => {
    if (value.length === 0) {
      setValue(initColumnValues);
    }
  }, [initColumnValues]);

  useEffect(() => {
    if (width! > 920 && width! < 1024 && openPopover) {
      setOpenPopover(false);
    }
  }, [width]);

  return (
    <OverlayScrollbarsComponent
      defer
      element="div"
      className="popover__overlayscrollbar flex h-[254px] w-full"
    >
      <div className="flex w-full flex-col gap-2 p-4">
        {customizeableCols?.map((col, index) => {
          const isActive = value.find((v) => v === col.value);
          return (
            <button
              type="button"
              key={index + col.value}
              onClick={() => toggleSelectColumn(col.value)}
              className={cn(
                "flex flex-shrink-0 items-center justify-between rounded-[8px] border border-border bg-white/[4%] p-1 pl-2 duration-300 hover:bg-white/[8%]",
                isActive ? "border-primary bg-primary/[8%]" : "",
              )}
            >
              <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                {col.title}
              </span>
              <div className="flex items-center gap-x-2">
                <div className="relative mb-1 aspect-square size-[18.5px]">
                  <Checkbox
                    checked={!!isActive}
                    onChange={() => toggleSelectColumn(col.value)}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </OverlayScrollbarsComponent>
  );
});
