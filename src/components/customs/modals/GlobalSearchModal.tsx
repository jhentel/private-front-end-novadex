"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState, useCallback, useRef, useEffect, useMemo, memo } from "react";
import {
  RecentToken,
  useRecentSearchTokensStore,
} from "@/stores/use-recent-search-tokens";
import debounce from "lodash/debounce";
// ######## APIs 🛜 ########
import { searchTokens } from "@/apis/rest/search";
// ######## Components 🧩 ########
import Image from "next/image";
import BaseButton from "@/components/customs/buttons/BaseButton";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { useRouter } from "nextjs-toploader/app";
import { useQuery } from "@tanstack/react-query";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField } from "@/components/ui/form";
import { BaseButtonModalGlobalSearch } from "./global-search/BaseButtonGlobalSearch";
import { SearchInputGlobalSearch } from "./global-search/SearchInputGlobalSearch";
import SortBySelect from "./global-search/SortbySelect";
import { RecentSearchTokenGlobalSearch } from "./global-search/RecentSearchToken";
import { SearchResults } from "./global-search/SearchResult";
import { useGlobalSearchStore } from "@/stores/use-global-search-store";

// Constants
const DEBOUNCE_SEARCH_QUERY_DELAY = 400;

// Types
export interface GlobalSearchModalFilter {
  sortBy?: string;
  order?: string;
  searchQuery?: string;
  isOg?: boolean;
}

export interface SearchTokenResult {
  mint: string;
  dex: string;
  // Add other properties as needed
}

// Schema
export const globalSearchFilterSchema = z.object({
  sortBy: z.string().optional(),
  order: z.string().optional(),
  searchQuery: z.string().optional(),
  isOg: z.boolean(),
});

// API
export const fetchSearchResults = async (data: GlobalSearchModalFilter) => {
  try {
    const results = await searchTokens({
      q: data?.searchQuery as string,
      order: (data?.isOg ? "asc" : data?.order) || undefined,
      sortBy: (data?.isOg ? "creationDate" : data?.sortBy) || undefined,
    });
    return { results };
  } catch (error) {
    console.warn("Search error:", error);
    return { results: [] };
  }
};

const LoadingSpinner = memo(() => (
  <div className="flex flex-grow items-center justify-center px-4 sm:h-[300px] sm:flex-grow-0">
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
));

LoadingSpinner.displayName = "LoadingSpinner";

const GlobalSearchModal = () => {
  const router = useRouter();
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [focusedItemIndex, setFocusedItemIndex] = useState<number>(-1);
  const [keyword, setKeyword] = useState<string>("");
  const resultCardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { sortBy, order, setSortBy, setOrder } = useGlobalSearchStore();

  const form = useForm<GlobalSearchModalFilter>({
    resolver: zodResolver(globalSearchFilterSchema),
    defaultValues: {
      sortBy,
      order,
      searchQuery: "",
      isOg: false,
    },
  });

  const { recentTokens, setRecentSearchTokens } = useRecentSearchTokensStore();

  // Update form when store values change
  useEffect(() => {
    form.setValue("sortBy", sortBy);
    form.setValue("order", order);
  }, [sortBy, order, form]);

  // Update store when form values change
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.sortBy !== sortBy) setSortBy(value.sortBy || "");
      if (value.order !== order) setOrder(value.order || "");
    });
    return () => subscription.unsubscribe();
  }, [form, setSortBy, setOrder, sortBy, order]);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !openDialog) {
        e.preventDefault();
        setOpenDialog(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [openDialog]);

  // Search query handler
  const debouncedSetSearchQuery = useCallback(
    debounce((value: string) => setKeyword(value), DEBOUNCE_SEARCH_QUERY_DELAY),
    [],
  );

  // Search results query
  const { data: searchTokenResults, isLoading } = useQuery({
    queryKey: [
      "search-tokens",
      keyword,
      form.watch("isOg"),
      form.watch("sortBy"),
    ],
    queryFn: () => {
      const values = form.getValues();
      if (!values.searchQuery) return { results: [] };
      return fetchSearchResults(values);
    },
    enabled: openDialog && !!keyword.trim(),
  });

  const filteredData = useMemo(() => {
    return searchTokenResults?.results || [];
  }, [searchTokenResults?.results]);

  const handleResultSelect = useCallback(
    (token: SearchTokenResult) => {
      const updatedTokens = recentTokens.filter(
        (existingToken) => existingToken.mint !== token.mint,
      );
      setRecentSearchTokens([token as RecentToken, ...updatedTokens]);
      router.push(`/token/${token.mint}`);
      setKeyword("");
      form.setValue("searchQuery", "");
      handleDialogClose(!openDialog);
    },
    [recentTokens, router, form, openDialog],
  );

  const handleDialogClose = useCallback(
    (isOpen: boolean) => {
      setOpenDialog(false);
      setKeyword("");
      form.setValue("searchQuery", "");
      if (!isOpen) {
        timeoutRef.current = setTimeout(() => setFocusedItemIndex(0), 500);
      }
    },
    [form, order],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      debouncedSetSearchQuery(value);
    },
    [debouncedSetSearchQuery],
  );

  const handleClear = useCallback(() => {
    form.setValue("searchQuery", "");
    setKeyword("");
  }, [form]);

  // Old Keyboard navigation handler
  // useEffect(() => {
  //   const dialog = dialogRef.current;
  //   if (!dialog || !openDialog) return;

  //   const handleKeyDown = (e: KeyboardEvent) => {
  //     if (!openDialog || !filteredData?.length) return;

  //     switch (e.key) {
  //       case "ArrowDown":
  //         e.preventDefault();
  //         setFocusedItemIndex((prev) =>
  //           Math.min(prev + 1, filteredData.length - 1),
  //         );
  //         break;

  //       case "ArrowUp":
  //         e.preventDefault();
  //         setFocusedItemIndex((prev) => Math.max(prev - 1, 0));
  //         break;

  //       case "Enter":
  //         if (focusedItemIndex >= 0 && filteredData[focusedItemIndex]) {
  //           e.preventDefault();
  //           handleResultSelect(filteredData[focusedItemIndex]);
  //         }
  //         break;

  //       case "Escape":
  //         e.preventDefault();
  //         handleDialogClose(openDialog);
  //         break;
  //     }
  //   };

  //   dialog.addEventListener("keydown", handleKeyDown, true);
  //   return () => dialog.removeEventListener("keydown", handleKeyDown, true);
  // }, [openDialog, filteredData, focusedItemIndex]);

  // New Keyboard navigation handler
  const focusedItemIndexRef = useRef(focusedItemIndex);
  useEffect(() => {
    focusedItemIndexRef.current = focusedItemIndex;
  }, [focusedItemIndex]);

  // Memoized keyboard handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!openDialog || !filteredData?.length) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedItemIndex((prev) =>
            Math.min(prev + 1, filteredData.length - 1),
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedItemIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          if (
            focusedItemIndexRef.current >= 0 &&
            filteredData[focusedItemIndexRef.current]
          ) {
            e.preventDefault();
            handleResultSelect(filteredData[focusedItemIndexRef.current]);
          }
          break;
        case "Escape":
          e.preventDefault();
          handleDialogClose(false); // Close the dialog
          break;
      }
    },
    [
      openDialog,
      filteredData,
      handleResultSelect,
      handleDialogClose,
      setFocusedItemIndex /* focusedItemIndexRef is stable */,
    ],
  );

  // Effect to add/remove keyboard listener
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !openDialog) return;

    dialog.addEventListener("keydown", handleKeyDown, true);
    return () => dialog.removeEventListener("keydown", handleKeyDown, true);
  }, [openDialog, handleKeyDown]);

  // Scroll focused item into view
  useEffect(() => {
    if (!openDialog || focusedItemIndex < 0) return;

    const element = resultCardsRef.current[focusedItemIndex];
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [focusedItemIndex, openDialog]);

  // Reset focus when search results change
  useEffect(() => {
    if (filteredData?.length > 0) {
      setFocusedItemIndex(0);
    } else {
      setFocusedItemIndex(-1);
    }
  }, [filteredData, setFocusedItemIndex]);

  // Cleanup
  useEffect(() => {
    return () => {
      debouncedSetSearchQuery.cancel();
      resultCardsRef.current = [];
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  return (
    <Dialog open={openDialog} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <BaseButtonModalGlobalSearch setOpenDialog={setOpenDialog} />
      </DialogTrigger>

      <DialogContent
        ref={dialogRef}
        className="flex h-full w-full max-w-none flex-col gap-y-0 rounded-none bg-[#080812] sm:h-auto sm:max-w-[600px] sm:rounded-[8px] 2xl:max-w-[720px] [&>button]:hidden"
      >
        <Form {...form}>
          <DialogTitle className="hidden" />

          <div className="flex items-center justify-between border-b border-border px-3 py-2">
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
            <SortBySelect form={form} />
          </div>

          <div className="flex h-[50px] flex-row items-center border-b border-border py-2 pl-1 pr-4">
            <SearchInputGlobalSearch
              form={form}
              onSearchChange={handleSearchChange}
              onClear={handleClear}
            />
            <div
              onClick={() => handleDialogClose(!openDialog)}
              className="relative aspect-square h-6 w-6 flex-shrink-0 cursor-pointer"
            >
              <Image
                src="/icons/close.png"
                alt="Close Icon"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
          </div>
        </Form>

        <RecentSearchTokenGlobalSearch
          setOpenDialog={(value) => {
            setOpenDialog(value);
            setKeyword("");
          }}
        />

        <div className="flex h-full w-full flex-grow flex-col sm:flex-grow-0">
          {form.getValues("searchQuery")?.trim() !== "" ? (
            isLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                {searchTokenResults?.results &&
                searchTokenResults.results.length > 0 ? (
                  <SearchResults
                    results={searchTokenResults.results}
                    focusedItemIndex={focusedItemIndex}
                    resultCardsRef={resultCardsRef}
                    onResultClick={() => {
                      setOpenDialog(false);
                      setKeyword("");
                    }}
                  />
                ) : (
                  <NoResults />
                )}
              </>
            )
          ) : (
            <div className="flex flex-grow items-center justify-center px-4 sm:h-[194px] sm:flex-grow-0">
              <span className="text-center text-sm text-fontColorSecondary">
                Search by ticker, token name or contract address
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default memo(GlobalSearchModal);

GlobalSearchModal.displayName = "GlobalSearchModal";

export const NoResults = () => {
  return (
    <div className="flex flex-grow flex-col items-center justify-center gap-y-3 sm:h-[194px] sm:flex-grow-0">
      <div className="relative aspect-[160/160] h-auto w-full max-w-[100px] flex-shrink-0">
        <Image
          src="/images/page-states/no_result.svg"
          alt="No Result Image"
          fill
          quality={100}
          className="object-contain"
        />
      </div>
      <p className="text-center text-sm text-fontColorSecondary">
        No tokens matched this search
      </p>
    </div>
  );
};
