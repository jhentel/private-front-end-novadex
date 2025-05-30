"use client";
import Image from "next/image";
import { Form, FormField } from "@/components/ui/form";
import BaseButton from "../buttons/BaseButton";
import { cn } from "@/libraries/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import GlobalSearchResultList from "../lists/GlobalSearchResultList";
import {
  fetchSearchResults,
  globalSearchFilterSchema,
  GlobalSearchModalFilter,
  NoResults,
} from "../modals/GlobalSearchModal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useRef, useState } from "react";
import { debounce } from "lodash";
import { useQuery } from "@tanstack/react-query";
import GlobalSearchResultCard from "../cards/GlobalSearchResultCard";
import { RecentSearchTokenGlobalSearch } from "../modals/global-search/RecentSearchToken";

const DEBOUNCE_SEARCH_QUERY_DELAY = 200;
function SearchPageClient() {
  const [keyword, setKeyword] = useState<string>("");
  const [focusedItemIndex, setFocusedItemIndex] = useState<number>(-1);
  const resultCardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const form = useForm<GlobalSearchModalFilter>({
    resolver: zodResolver(globalSearchFilterSchema),
    defaultValues: {
      sortBy: "creationDate",
      order: "desc",
      searchQuery: "",
      isOg: false,
    },
  });

  const debouncedSetSearchQuery = useCallback(
    debounce(async (value: string) => {
      setKeyword(value);
    }, DEBOUNCE_SEARCH_QUERY_DELAY),
    [],
  );

  const { data: searchTokenResults, isLoading } = useQuery({
    queryKey: [
      "search-tokens",
      keyword,
      form.watch("isOg"),
      form.watch("sortBy"),
    ],
    queryFn: async () => {
      const data = await fetchSearchResults(form.getValues());
      return data ? data : { results: [] };
    },
    enabled: !!keyword,
  });
  return (
    <>
      <div className="flex w-full max-w-none flex-col gap-y-0 overflow-hidden rounded-none bg-[#080812] [&>button]:hidden">
        <Form {...form}>
          {/* Search Input & Close */}
          <div className="flex h-[50px] flex-row items-center px-4 pt-3.5">
            <div
              className={cn(
                "base__input relative h-full w-full rounded-[8px] border border-border",
              )}
            >
              <div className="absolute left-3 top-1/2 z-10 aspect-square h-4 w-4 flex-shrink-0 -translate-y-1/2">
                <Image
                  src="/icons/search-input.png"
                  alt="Search Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </div>

              <FormField
                control={form.control}
                name="searchQuery"
                render={({ field }) => (
                  <>
                    <Input
                      id="global-search"
                      autoFocus
                      value={field.value}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const isPasteEvent =
                          (e.nativeEvent as any).inputType ===
                          "insertFromPaste";

                        field.onChange(e.target.value);
                        form.setValue("sortBy", "");
                        form.setValue("order", "");
                        if (isPasteEvent) {
                          setKeyword(e.target.value);
                        } else {
                          // Apply debounce for normal input changes
                          debouncedSetSearchQuery(e.target.value);
                        }
                      }}
                      placeholder="Search by ticker, token name or contract address"
                      className={`relative -bottom-[0.5px] z-20 flex h-full w-full border border-transparent bg-transparent py-1 pl-9 pr-3 text-sm text-fontColorPrimary shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-neutral-950 placeholder:text-fontColorSecondary focus:border-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50`}
                      autoComplete="off"
                    />

                    {(field?.value as string).length > 0 && (
                      <button
                        onClick={() => {
                          field.onChange("");
                          setKeyword("");
                        }}
                        title="Clear search"
                        type="button"
                        className="absolute right-2.5 top-1/2 z-30 aspect-square h-4 w-4 flex-shrink-0 -translate-y-1/2 duration-300 hover:opacity-70"
                      >
                        <Image
                          src="/icons/circle-close.png"
                          alt="Close Icon"
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </button>
                    )}
                  </>
                )}
              />
            </div>
          </div>

          {/* OG & Sort*/}
          <div className="flex items-center justify-between border-b border-border px-4 pb-3.5 pt-3">
            <FormField
              control={form.control}
              name="isOg"
              render={({ field }) => (
                <BaseButton
                  onClick={() => field.onChange(!field.value)}
                  className={cn(
                    "gap-2 border-solid text-sm",
                    field.value &&
                      "border border-solid !border-primary text-primary",
                  )}
                >
                  <Image
                    src={
                      field.value
                        ? "/icons/og-mode-primary.svg"
                        : "/icons/og-mode.svg"
                    }
                    alt="Og Mode Icon"
                    width={16}
                    height={15}
                    quality={100}
                    className="object-contain"
                  />
                  OG Mode
                </BaseButton>
              )}
            />

            <FormField
              control={form.control}
              name="sortBy"
              render={({ field }) => (
                <Select
                  value={field.value as string}
                  defaultValue={field.value as string}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="h-[32px] max-w-[200px]">
                    <span className="inline-block space-x-1 text-nowrap font-geistSemiBold text-fontColorPrimary">
                      <span className="text-sm text-[#9191A4]">Sort by:</span>
                      <SelectValue className="text-sm" />
                    </span>
                  </SelectTrigger>
                  <SelectContent className="z-[1000]">
                    <SelectItem
                      value="marketCap"
                      className="font-geistSemiBold"
                    >
                      Market Cap
                    </SelectItem>
                    <SelectItem
                      value="lastTrade"
                      className="font-geistSemiBold"
                    >
                      Last Trade
                    </SelectItem>
                    <SelectItem
                      value="creationDate"
                      className="font-geistSemiBold"
                    >
                      Creation Time
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </Form>

        {/* Recents */}
        <div className="h-10">
          <RecentSearchTokenGlobalSearch />
        </div>
      </div>

      {/* Search Result List */}
      <div className="relative mb-16 grid h-full w-full flex-grow grid-cols-1 px-4">
        <div className="relative col-span-1 flex h-full w-full items-center justify-center overflow-y-auto px-4">
          {form.getValues("searchQuery")?.trim() !== "" ? (
            isLoading ? (
              <div className="flex items-center justify-center sm:h-[300px]">
                <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                  <Image
                    src="/icons/search-loading.png"
                    alt="Search Loading Icon"
                    fill
                    quality={100}
                    className="animate-spin object-contain"
                  />
                </div>
              </div>
            ) : (
              <>
                {searchTokenResults?.results &&
                searchTokenResults?.results?.length > 0 ? (
                  <div className="absolute left-0 top-0 flex h-full w-full flex-col gap-y-2">
                    <div className="flex h-auto w-full flex-col gap-y-2 pb-2 sm:pb-4">
                      {searchTokenResults?.results.map((item, index) => (
                        <GlobalSearchResultCard
                          key={item.mint + index}
                          {...item}
                          isFocused={index === focusedItemIndex}
                          setOpenDialog={() => {}}
                          ref={
                            resultCardsRef
                              ? (el) => {
                                  if (resultCardsRef.current) {
                                    resultCardsRef.current[index] = el;
                                  }
                                }
                              : undefined
                          }
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <NoResults />
                )}
              </>
            )
          ) : (
            <span className="text-center text-sm text-fontColorSecondary">
              Search by ticker, token name or contract address
            </span>
          )}
        </div>
      </div>
    </>
  );
}

export default SearchPageClient;
