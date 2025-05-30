import React, { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import debounce from "lodash/debounce";
import { Popover, PopoverAnchor, PopoverContent } from "../ui/popover";
import { Input } from "../ui/input";
import { cn } from "@/libraries/utils";
import Image from "next/image";
import { formatAmount } from "@/utils/formatAmount";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import {
  searchTwitterAccounts,
  TwitterAccount,
} from "@/apis/rest/twitter-monitor";
import type { TwitterUser } from "@/types/twitter";
import { truncateString } from "@/utils/truncateString";

type ComboboxTwitterProps = {
  onChange: (twitterAccount: TwitterAccount) => void;
  id: string;
  value: string;
  isAutoFocus?: boolean;
};

export function ComboboxTwitter({
  onChange,
  value,
  id,
  isAutoFocus = true,
}: ComboboxTwitterProps) {
  const [showData, setShowData] = useState<TwitterUser[]>([]);
  const [_, setIsInitial] = useState(true);
  const [open, setOpen] = useState(false);
  const [{ shadowInput, inputValue }, setInputValue] = useState<{
    shadowInput: string;
    inputValue: string;
  }>({ shadowInput: "", inputValue: "" });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedItems, setSelectedItems] = useState<TwitterUser>();
  const inputRef = useRef<HTMLInputElement>(null);

  const { isSuccess, data, isLoading } = useQuery({
    queryKey: ["twitter-search", inputValue],
    queryFn: async () => {
      if (!inputValue) return [];
      const response = await searchTwitterAccounts(
        value.length > 0 && !selectedItems
          ? value
          : inputValue.replace(/@/g, ""),
      );
      setIsInitial(false);
      if (value.length > 0 && !selectedItems) {
        setSelectedItems(response);
      }

      return response as TwitterUser;
    },
    enabled: inputValue.length > 0 || (value.length > 0 && !selectedItems),
  });

  useEffect(() => {
    if (value) {
      setInputValue({ shadowInput: value, inputValue: value });
    }
  }, []);

  useEffect(() => {
    if (data && isSuccess) {
      if (Array.isArray(data)) {
        setShowData(data);
      } else {
        setShowData([data]);
      }
    }
  }, [isSuccess, data]);

  // Add this effect to trigger search when value changes externally
  useEffect(() => {
    if (value && !selectedItems) {
      setInputValue({ shadowInput: value, inputValue: value });
    }
  }, [value]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceInputChange = useCallback(
    debounce((value: string) => {
      setInputValue({ shadowInput: value, inputValue: value });
    }, 300), // Adjust the debounce delay as needed
    [setInputValue],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue((prev) => ({
      shadowInput: newValue,
      inputValue: prev.inputValue,
    }));
    debounceInputChange(newValue);

    // Clear selection when input is emptied manually
    if (newValue === "" && selectedItems) {
      onChange({
        name: "",
        profilePicture: "",
        username: "",
        type: "regular",
      });
      setSelectedItems(undefined);
    }
  };

  useEffect(() => {
    if (isAutoFocus && open && inputRef.current) {
      const intervalId = setInterval(() => {
        if (isAutoFocus && open && inputRef.current) {
          inputRef.current.focus();
          setOpen(true);
        }
      }, 1);

      // Clear the interval after 3 attempts
      setTimeout(() => {
        clearInterval(intervalId);
      }, 1);

      return () => clearInterval(intervalId); // Cleanup on unmount
    }
  }, [open]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHoveredIndex((prev) =>
        prev === null ? 0 : Math.min(prev + 1, showData?.length - 1),
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHoveredIndex((prev) =>
        prev === null ? showData?.length - 1 : Math.max(prev - 1, 0),
      );
    } else if (e.key === "Enter" && hoveredIndex !== null) {
      e.preventDefault();
      onChange({
        name: showData[hoveredIndex].name,
        profilePicture: showData[hoveredIndex].profile_image_url_https,
        username: showData[hoveredIndex].screen_name,
        type: "regular",
      });
      setSelectedItems(showData[hoveredIndex]);
    }
  };

  const handleSelect = (item: TwitterUser) => {
    onChange({
      name: item.name,
      profilePicture: item.profile_image_url_https,
      username: item.screen_name,
      type: "regular",
    });
    setSelectedItems(item);
    setOpen(false);
  };

  return (
    <div className="h-fit w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild className={cn("relative z-[10] w-full")}>
          <div className="relative flex w-full items-center justify-center">
            <Input
              ref={inputRef}
              className={cn(
                "z-[0] w-full text-white",
                selectedItems && !open ? "text-white/0" : "text-white",
              )}
              parentClassName="w-full z-[0]"
              suffixEl={
                <button
                  title="Clear"
                  className={cn(
                    "absolute right-2 z-[1000] inline-block size-4",
                    value.length === 0 && "hidden",
                  )}
                  onClick={() => {
                    setInputValue({ shadowInput: "", inputValue: "" });
                    onChange({
                      name: "",
                      profilePicture: "",
                      username: "",
                      type: "regular",
                    });
                    setSelectedItems(undefined);
                    setOpen(false);
                  }}
                >
                  <Image
                    src="/icons/red-cross.svg"
                    alt="X Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </button>
              }
              prefixEl={
                <div className="absolute left-3 inline-block size-4">
                  <Image
                    src="/icons/search.svg"
                    alt="X Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
              }
              onClick={() => {
                setOpen((prev) => !prev);
                if (isAutoFocus && open && inputRef.current) {
                  inputRef.current.focus();
                }
              }}
              placeholder={
                selectedItems && !open ? "" : "Search for an account to add"
              }
              value={open ? shadowInput : value}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              key={id}
            />
            {selectedItems && !open && (
              <div className="pointer-events-none absolute left-0 top-0 z-[1500] flex h-full w-fit items-center justify-center p-1">
                <div className="flex h-full w-fit items-center justify-normal gap-x-1 rounded-[4px] bg-secondary px-2 py-1">
                  <div className="relative aspect-square h-4 w-4 flex-shrink-0 overflow-hidden rounded-full">
                    <Image
                      src={selectedItems.profile_image_url_https}
                      alt={selectedItems.name + " Image"}
                      fill
                      quality={100}
                      className="object-contain"
                    />
                  </div>
                  <h4 className="text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
                    {truncateString(selectedItems.name, 10)}
                  </h4>
                  <h5 className="text-nowrap font-geistLight text-xs text-foreground">
                    @{selectedItems.screen_name}
                  </h5>
                </div>
              </div>
            )}
          </div>
        </PopoverAnchor>
        <PopoverContent
          key={id}
          forceMount
          asChild
          className={cn(
            "gb__white__popover z-[9999] w-[--radix-popper-anchor-width] p-0 [[data-radix-popper-content-wrapper]:has(&)]:h-0",
            !open && "pointer-events-none",
          )}
        >
          <div className="relative flex h-52 flex-grow">
            <OverlayScrollbarsComponent
              defer
              element="div"
              className="flex h-full w-full flex-grow flex-col gap-y-1 p-2 pr-3"
              options={{
                overflow: {
                  x: "hidden",
                },
              }}
            >
              {showData?.length === 0 && !isLoading ? (
                <div className="text-muted-foreground p-4 text-center text-sm">
                  {inputValue.length === 0
                    ? "Type to search"
                    : "No results found"}
                </div>
              ) : (
                <>
                  {showData?.map((item, index) => {
                    const isChecked = item.screen_name == value;
                    if (isChecked) return null;
                    return (
                      <div
                        onClick={() => handleSelect(item)}
                        className="mb-1 flex h-[50px] w-full cursor-pointer items-center justify-between gap-x-3 overflow-hidden rounded-[4px] bg-white/[4%] px-3 py-[10px] transition-all duration-200 ease-out hover:bg-white/[8%]"
                        key={index}
                      >
                        <div className="relative aspect-square h-8 w-8 flex-shrink-0 overflow-hidden rounded-full">
                          <Image
                            src={item.profile_image_url_https}
                            alt={item.name + " Image"}
                            fill
                            quality={100}
                            className="object-contain"
                          />
                        </div>

                        <div className="flex h-[32px] w-full flex-col justify-center gap-y-1">
                          <div className="flex items-center gap-x-[4px]">
                            <h4 className="text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
                              {truncateString(item.name, 10)}
                            </h4>
                            <h5 className="text-nowrap font-geistLight text-xs text-foreground">
                              @{truncateString(item.screen_name, 10)}
                            </h5>
                          </div>
                          <h5 className="flex items-center gap-x-1 text-nowrap font-geistLight text-[10px] text-foreground">
                            <span>
                              <span className="font-geistRegular">
                                {item.favourites_count.toLocaleString()}
                              </span>{" "}
                              Following
                            </span>
                            <div className="size-[3px] bg-foreground" />
                            <span>
                              <span className="font-geistRegular">
                                {formatAmount(item.followers_count)}
                              </span>{" "}
                              Followers
                            </span>
                          </h5>
                        </div>

                        <button
                          title="Add"
                          type="button"
                          className="relative flex flex-shrink-0 items-center justify-center"
                        >
                          <div className="relative z-30 aspect-square h-4 w-4 flex-shrink-0">
                            <Image
                              src="/icons/pink-plus.svg"
                              alt="Delete Icon"
                              fill
                              quality={100}
                              className="object-contain"
                            />
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </>
              )}
            </OverlayScrollbarsComponent>

            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute z-[1000] flex size-full scale-[1.1] items-center justify-center bg-slate-950/20"
                >
                  <Loader2 className="animate-spin" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
