"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState } from "react";
import {
  initColumnValues,
  useOpenCustomTable,
} from "@/stores/token/use-open-custom-table";
// ######## Components 🧩 ########
import Image from "next/image";
import CustomTableSection from "./CustomTableSection";
import BaseButton from "@/components/customs/buttons/BaseButton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PopoverClose } from "@radix-ui/react-popover";

export default function CustomTablePopover({
  remainingScreenWidth,
}: {
  remainingScreenWidth: number;
}) {
  const { selectedTableColumns, setSelectedTableColumns } =
    useOpenCustomTable();
  const [selectedTableColumnsLocal, setSelectedTableColumnsLocal] =
    useState(selectedTableColumns);

  const handleSave = () => {
    if (selectedTableColumns.length > 0) {
      setSelectedTableColumns(selectedTableColumnsLocal);
    }
  };
  const handleReset = () => {
    setSelectedTableColumns(initColumnValues);
    setSelectedTableColumnsLocal(initColumnValues);
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <div className="h-[26px]">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <BaseButton
                    id="custom-table"
                    className={cn(
                      "h-[26px] rounded-[4px] bg-transparent font-geistSemiBold text-sm text-primary before:absolute before:!rounded-[4px] focus:bg-transparent",
                      remainingScreenWidth < 1960 && "px-1.5",
                    )}
                  >
                    {remainingScreenWidth > 1960 ? (
                      "Custom Table"
                    ) : (
                      <div className="relative aspect-square size-5 flex-shrink-0">
                        <Image
                          src="/icons/token/icon-custom-table.svg"
                          alt="Table Config Icon"
                          fill
                          quality={50}
                          className="object-contain"
                        />
                      </div>
                    )}
                  </BaseButton>
                </TooltipTrigger>
                <TooltipContent
                  className={remainingScreenWidth < 1960 ? "block" : "hidden"}
                >
                  <p>Custom Table</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={8}
          className="gb__white__popover relative z-[999] w-[357px] cursor-default rounded-[8px] border border-border bg-card p-0 shadow-[0_0_20px_0_#000000]"
        >
          <div className="flex w-full items-center justify-between border-b border-border px-4 py-3.5">
            <h4 className="text-nowrap font-geistSemiBold text-[18px] text-fontColorPrimary">
              Custom Table
            </h4>
            <PopoverClose asChild>
              <button className="relative z-[10] ml-auto aspect-square h-6 w-6 flex-shrink-0 duration-300 hover:opacity-70">
                <Image
                  src="/icons/close.png"
                  alt="Close Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </button>
            </PopoverClose>
          </div>
          <CustomTableSection
            value={selectedTableColumnsLocal}
            setValue={(values) => {
              setSelectedTableColumnsLocal(values);
            }}
          />
          <div className="flex h-[64px] w-full items-center justify-between border-t border-border p-4">
            <button
              onClick={handleReset}
              className="text-nowrap font-geistBold text-[14px] text-fontColorAction"
            >
              Reset
            </button>
            <BaseButton
              variant="primary"
              onClick={handleSave}
              className="px-[12px] py-[8px] font-geistBold text-sm"
            >
              Save
            </BaseButton>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
