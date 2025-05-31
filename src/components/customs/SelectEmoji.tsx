"use client";

import React, { forwardRef, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";
import { cn } from "@/libraries/utils";
import { useWindowSizeStore } from "@/stores/use-window-size.store";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import Picker, { EmojiClickData, EmojiStyle } from "emoji-picker-react";
import { hiddenEmoji } from "@/constants/hidden-emoji";

// const normalizeEmoji = (emoji: string) => {
//   // @ts-ignore
//   return [...emoji]
//     .map((char) => String.fromCodePoint(char.codePointAt(0)!))
//     .join("");
// };
export interface TriggerProps {
  value?: string | null;
  isOpen?: boolean;
  className?: string;
}

const Trigger = forwardRef<HTMLButtonElement, TriggerProps>(
  ({ value, isOpen = false, className, ...props }, ref) => {
    return (
      <button
        type="button"
        ref={ref}
        className={cn(
          "flex h-8 items-center justify-center rounded-[8px] border border-border pl-2 pr-1",
          className,
        )}
        {...props}
      >
        {value ? (
          <span className="text-lg">{value}</span>
        ) : (
          <div className="relative mx-0.5 aspect-square h-4 w-4 flex-shrink-0">
            <Image
              src="/logo.png"
              alt="Nova Logo"
              fill
              quality={100}
              className="object-contain"
            />
          </div>
        )}
        <div className="relative aspect-square h-6 w-6 flex-shrink-0 duration-200">
          <Image
            src="/icons/pink-chevron-down.png"
            alt="Pink Chevron Down Icon"
            fill
            quality={100}
            className={cn(
              "object-contain transition-transform",
              isOpen ? "rotate-180" : "rotate-0",
            )}
          />
        </div>
      </button>
    );
  },
);

Trigger.displayName = "Trigger";

const SelectEmoji = ({
  alreadySelectedList,
  value,
  onChange,
  triggerClassName,
}: {
  alreadySelectedList?: string[];
  value?: string;
  onChange?: (value: string) => void;
  triggerClassName?: string;
}) => {
  const { width } = useWindowSizeStore();
  const [isOpen, setIsOpen] = useState(false);
  const handleEmojiSelect = (data: EmojiClickData) => {
    onChange?.(data.emoji);
    setIsOpen(false);
  };

  const emojiPicker = (
    <Picker
      onEmojiClick={handleEmojiSelect}
      emojiStyle={"google" as EmojiStyle}
      style={{ width: "100%" }}
      hiddenEmojis={hiddenEmoji.map((item) => item.toLowerCase())}
      lazyLoadEmojis

    />
    //   <EmojiPicker
    //     className="max-md:h-[80dvh]"
    //     onEmojiSelect={handleEmojiSelect}
    //     autoFocus
    //   />
  );

  return width! > 768 ? (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Trigger isOpen={isOpen} value={value} className={triggerClassName} />
      </PopoverTrigger>
      <PopoverContent
        className="gb__white__popover z-[9000] flex w-full gap-3 p-0"
        align="start"
      >
        {/* <Picker onEmojiSelect={handleEmojiSelectOld} /> */}
        {emojiPicker}
      </PopoverContent>
    </Popover>
  ) : (
    <Drawer fixed onOpenChange={setIsOpen} open={isOpen}>
      <DrawerTrigger asChild>
        <Trigger isOpen={isOpen} value={value} className={triggerClassName} />
      </DrawerTrigger>
      <DrawerContent className="fixed inset-x-0 bottom-0 z-[1000] h-fit max-h-[85vh] rounded-t-xl bg-background outline-none">
        <DrawerHeader className="flex flex-row items-center justify-between space-y-0 border-b border-[#242436] px-4 py-2.5">
          <DrawerTitle className="text-fontColorPrimary">
            Select Emoji
          </DrawerTitle>
          <DrawerClose asChild>
            <button className="flex h-6 w-6 cursor-pointer items-center justify-center bg-transparent text-transparent">
              <div
                className="relative aspect-square h-6 w-6 flex-shrink-0"
                aria-label="Close"
                title="Close"
              >
                <Image
                  src="/icons/close.png"
                  alt="Close Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </div>
            </button>
          </DrawerClose>
        </DrawerHeader>
        <DrawerDescription className="sr-only">
          Select an emoji
        </DrawerDescription>
        {emojiPicker}
      </DrawerContent>
    </Drawer>
  );
};
export default SelectEmoji;
