"use client";
import React, { useState, useEffect } from "react";
import BaseButton from "./buttons/BaseButton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";
import { Checkbox } from "../ui/checkbox";
import { cn } from "@/libraries/utils";
import {
  CardViewConfigItem,
  useCustomCardView,
} from "@/stores/setting/use-custom-card-view.store";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

const CustomCardView = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { cardViewConfig, setCardViewConfig } = useCustomCardView();
  const [localConfig, setLocalConfig] = useState([...cardViewConfig]);

  // Reset local config when popover opens or when cardViewConfig changes
  useEffect(() => {
    setLocalConfig([...cardViewConfig]);
  }, [isOpen, cardViewConfig]);

  // Handle checkbox change
  const handleCheckboxChange = (
    index: number,
    localConfig: CardViewConfigItem[],
  ) => {
    const newConfig = [...localConfig];
    newConfig[index] = {
      ...newConfig[index],
      status: newConfig[index].status === "active" ? "inactive" : "active",
    };
    setLocalConfig(newConfig);
  };

  // Handle reset
  const handleReset = (cardViewConfig: CardViewConfigItem[]) => {
    const resetConfig = cardViewConfig.map((item) => ({
      ...item,
      status: "active" as "active" | "inactive",
    }));
    setLocalConfig(resetConfig);
  };

  // Handle save
  const handleSave = (localConfig: CardViewConfigItem[]) => {
    setCardViewConfig(localConfig);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <BaseButton
                variant="gray"
                className="relative hidden size-8 lg:flex"
                size="short"
                onClick={() => setIsOpen((prev) => !prev)}
              >
                <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                  <Image
                    src="/icons/card-view-config.svg"
                    alt="Card View Config Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
              </BaseButton>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>Custom Card View</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="gb__white__popover relative z-[1000] hidden min-h-[525px] w-[357px] flex-col border border-border bg-[rgb(8,8,17)] p-0 shadow-[0_10px_20px_0_rgba(0,0,0,1)] lg:flex"
      >
        <div className="flex h-[52px] flex-row items-center justify-between border-b border-border p-4">
          <h4 className="font-geistSemiBold text-[18px] text-fontColorPrimary">
            Custom Card View
          </h4>
          <button
            title="Close"
            onClick={() => setIsOpen(false)}
            className="relative aspect-square h-6 w-6 flex-shrink-0"
          >
            <Image
              src="/icons/close.png"
              alt="Close Icon"
              fill
              quality={100}
              className="object-contain"
            />
          </button>
        </div>
        <OverlayScrollbarsComponent
          defer
          element="div"
          className="popover__overlayscrollbar h-[410px] w-full"
        >
          <div className="nova-scroller hide relative w-full flex-grow space-y-2 p-4">
            {localConfig.map((item, index) => (
              <button
                type="button"
                key={item.key}
                onClick={() => handleCheckboxChange(index, localConfig)}
                className={cn(
                  "flex w-full flex-shrink-0 items-center justify-between rounded-[6px] border border-border bg-white/[4%] px-2 py-1 duration-300 hover:bg-white/[8%]",
                  item.status === "active"
                    ? "border-primary bg-primary/[8%]"
                    : "",
                )}
              >
                <div className="flex w-full items-center justify-between gap-x-2">
                  <div className="flex items-center gap-x-1">
                    <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                      {item.label}
                    </span>
                  </div>
                  <Checkbox
                    checked={item.status === "active"}
                    onCheckedChange={() =>
                      handleCheckboxChange(index, localConfig)
                    }
                    className="size-[18px]"
                  />
                </div>
              </button>
            ))}
          </div>
        </OverlayScrollbarsComponent>

        <div className="absolute bottom-[0px] left-0 flex w-full items-center justify-between gap-x-3 rounded-b-[8px] border-t border-border bg-[#080811] p-4">
          <button
            onClick={() => handleReset(cardViewConfig)}
            className="font-geistSemiBold text-sm text-primary duration-300 hover:text-[#be7ad2]"
          >
            Reset
          </button>
          <BaseButton
            type="button"
            onClick={() => handleSave(localConfig)}
            variant="primary"
            className="px-3 py-2"
          >
            <span className="text-sm">Save</span>
          </BaseButton>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CustomCardView;
