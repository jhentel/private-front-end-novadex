import BaseButton from "@/components/customs/buttons/BaseButton";
import { CachedImage } from "@/components/customs/CachedImage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/libraries/utils";
import { useWalletTrackerFilterStore } from "@/stores/dex-setting/use-wallet-tracker-filter.store";
import { PopoverClose } from "@radix-ui/react-popover";
import Image from "next/image";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";

const WalletTrackerTotalFilter = () => {
  const setTotalFilter = useWalletTrackerFilterStore(
    (state) => state.setTotalFilter,
  );
  const totalFilter = useWalletTrackerFilterStore((state) => state.totalFilter);

  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: totalFilter,
  });

  useEffect(() => {
    setValue("min", totalFilter.min);
    setValue("max", totalFilter.max);
  }, [totalFilter, setValue]);

  const onSubmit = (data: { min: number; max: number }) => {
    setTotalFilter(data);
    const closeButton = document.querySelector(
      "[data-maker-close-button]",
    ) as HTMLButtonElement;
    if (closeButton) {
      closeButton.click();
    }
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <button className="relative inline-block size-3">
            <Image
              src={
                totalFilter.min > 0 || totalFilter.max > 0
                  ? "/icons/active-filter.svg"
                  : "/icons/filter.svg"
              }
              alt="Filter icon"
              width={24}
              height={24}
              className="object-contain"
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={6}
          className={cn(
            "gb__white__popover z-50 h-[206px] w-[320px] rounded-[8px] border border-border p-0",
          )}
          style={{
            zIndex: 999999,
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex w-full items-center justify-start border-b border-border px-4 max-md:h-[56px] md:p-4">
              <h4 className="text-nowrap font-geistSemiBold text-[18px] text-fontColorPrimary">
                Total Filter
              </h4>
              <PopoverClose
                data-maker-close-button
                className="ml-auto hidden cursor-pointer text-fontColorSecondary md:inline-block"
              >
                <div className="relative aspect-square h-6 w-6 flex-shrink-0 duration-300 hover:opacity-70">
                  <Image
                    src="/icons/close.png"
                    alt="Close Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
              </PopoverClose>
            </div>
            <div className="relative flex w-full flex-grow gap-x-2 p-4">
              <div className="flex flex-grow flex-col gap-1">
                <Label className="text-xs text-fontColorSecondary">Min</Label>
                <Input
                  type="number"
                  step="any"
                  {...register("min", { valueAsNumber: true })}
                  placeholder="Min"
                  prefixEl={
                    <div className="absolute left-3.5 aspect-square h-4 w-4">
                      <CachedImage
                        src="/icons/solana-sq.svg"
                        alt="Solana Icon"
                        fill
                        quality={50}
                        className="object-contain"
                      />
                    </div>
                  }
                />
              </div>
              <div className="flex flex-grow flex-col justify-end gap-1 pb-[5px]">
                -
              </div>
              <div className="flex flex-grow flex-col gap-1">
                <Label className="text-xs text-fontColorSecondary">Max</Label>
                <Input
                  type="number"
                  step="any"
                  {...register("max", { valueAsNumber: true })}
                  placeholder="Max"
                  prefixEl={
                    <div className="absolute left-3.5 aspect-square h-4 w-4">
                      <CachedImage
                        src="/icons/solana-sq.svg"
                        alt="Solana Icon"
                        fill
                        quality={50}
                        className="object-contain"
                      />
                    </div>
                  }
                />
              </div>
            </div>
            <div className="absolute bottom-[0px] left-0 flex h-[64px] w-full items-center justify-between gap-x-3 rounded-b-[8px] border border-t border-border bg-[#080811] p-4">
              <button
                type="button"
                onClick={() => {
                  reset({ min: 0, max: 0 });
                  setTotalFilter({ min: 0, max: 0 });
                  const closeButton = document.querySelector(
                    "[data-maker-close-button]",
                  ) as HTMLButtonElement;
                  if (closeButton) {
                    closeButton.click();
                  }
                }}
                className="font-geistSemiBold text-sm text-primary duration-300 hover:text-[#be7ad2]"
              >
                Clear
              </button>
              <BaseButton
                type="submit"
                variant="primary"
                className="h-8 w-[63px]"
              >
                <span className="text-sm">Apply</span>
              </BaseButton>
            </div>
          </form>
        </PopoverContent>
      </Popover>
    </>
  );
};

export default WalletTrackerTotalFilter;
