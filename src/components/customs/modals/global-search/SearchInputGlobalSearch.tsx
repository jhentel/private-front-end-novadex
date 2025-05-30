import { FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/libraries/utils";
import Image from "next/image";
import { memo } from "react";

// Components
export const SearchInputGlobalSearch = memo(
  ({
    form,
    onSearchChange,
    onClear,
  }: {
    form: any;
    onSearchChange: (value: string) => void;
    onClear: () => void;
  }) => (
    <div className={cn("base__input relative h-full w-full rounded-[8px]")}>
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
                  (e.nativeEvent as any).inputType === "insertFromPaste";
                field.onChange(e.target.value);
                form.setValue("order", "");
                onSearchChange(isPasteEvent ? e.target.value : field.value);
              }}
              placeholder="Search by ticker, token name or contract address"
              className="relative -bottom-[0.5px] z-20 flex h-full w-full border border-transparent bg-transparent py-1 pl-9 pr-3 text-sm text-fontColorPrimary shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-neutral-950 placeholder:text-fontColorSecondary focus:border-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              autoComplete="off"
            />

            {field.value && (
              <button
                onClick={onClear}
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
  ),
);

SearchInputGlobalSearch.displayName = "SearchInputGlobalSearch";
