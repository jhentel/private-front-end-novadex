// ######## Libraries 📦 & Hooks 🪝 ########
import React, { Fragment } from "react";
import dynamic from "next/dynamic";
// ######## Components 🧩 ########
import ScrollLayout from "@/components/layouts/ScrollLayout";
import Separator from "@/components/customs/Separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import {
  TokenHeaderLoading,
  TokenCardLoading,
} from "@/components/customs/loadings/TokenCardLoading";
import TokenWalletSelection from "@/components/customs/token/TokenWalletSelection";
import TokenTrendingTime from "@/components/customs/token/TokenTrendingTime";
import TokenInformation from "@/components/customs/token/TokenInformation";
import TokenBuyAndSell from "@/components/customs/token/TokenBuyAndSell";

export default function TokenPageLoading() {
  return (
    <ScrollLayout withPadding={false}>
      <div className="relative mb-14 mt-4 flex w-full flex-col-reverse gap-x-2 gap-y-4 pb-4 md:mb-12 md:mt-2 md:flex-row md:gap-y-0 md:px-4 xl:mt-0 xl:flex-grow">
        <LeftTokenSectionLoading />
        <RightTokenSectionLoading />
      </div>
    </ScrollLayout>
  );
}

export const TokenPageFullLoading = () => {
  return (
    <ScrollLayout withPadding={false}>
      <div className="relative mb-14 mt-4 flex w-full flex-col-reverse gap-x-2 gap-y-4 pb-4 md:mb-12 md:mt-2 md:flex-row md:gap-y-0 md:px-4 xl:mt-0 xl:flex-grow">
        <LeftTokenSectionLoading />
        <RightTokenSectionLoading />
      </div>
    </ScrollLayout>
  );
};

export const LeftTokenSectionLoading = () => {
  return (
    <div className="flex h-full flex-grow flex-col flex-wrap items-start gap-4 md:w-[40%] md:gap-2 lg:w-[70%] xl:w-[80%]">
      {/* Wallet Selection & Chart */}
      <TokenWalletSelectionLoading />

      {/* Tables */}
      <TokenTablesLoading />
    </div>
  );
};

export const RightTokenSectionLoading = () => {
  return (
    <div className="flex h-full flex-col items-start gap-4 md:mb-2 md:max-w-[365px]">
      <div className="flex w-full flex-shrink-0 flex-grow flex-col items-start gap-2 px-4 md:px-0">
        {/* Token Information */}
        <TokenInformation initPrice={null} initTokenInfo={null} />

        {/* Token Trending Time Volume */}
        {/* <TokenTrendingTimeLoading /> */}
        <TokenTrendingTime initVolumeData={null} loading />

        {/* Token Buy & Sell */}
        <TokenBuyAndSellLoading />
        {/* <TokenBuyAndSell tokenSymbol="-" /> */}

        {/* Token Data Security */}
        <TokenDataSecurityLoading />
      </div>
    </div>
  );
};

export const TokenWalletSelectionLoading = () => (
  <div className="inline-block h-auto w-dvw overflow-hidden rounded-[8px] px-4 md:mt-0 md:w-full md:border md:border-border md:bg-white/[4%] md:px-0">
    <TokenWalletSelection />

    <div className="h-[408px] w-full bg-[#080812]"></div>
  </div>
);

export const TokenTablesLoading = () => (
  <div className="rounded-t-0 relative mb-[-1.5rem] flex h-[95dvh] w-dvw flex-col overflow-hidden md:mb-0 md:h-[1237px] md:w-full md:rounded-[8px] md:border md:border-border">
    <div className="flex h-12 w-full items-center border-b border-border bg-transparent md:h-10 xl:bg-white/[4%]">
      <div id="tab-list" className="flex h-full items-center">
        {Array.from({ length: 6 }).map((_, index) => {
          return (
            <React.Fragment key={index}>
              <div className="relative flex h-12 items-center justify-center gap-x-2 py-2 pl-4 md:h-10 md:py-0">
                <Skeleton className="h-4 w-20"></Skeleton>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>

    <div className="relative grid w-full flex-grow grid-cols-1">
      <div className="flex w-full flex-grow flex-col items-start">
        {/* List */}
        <div className="flex w-full flex-grow flex-col">
          <div className="nova-scroller relative w-full flex-grow !overflow-y-hidden">
            <div className="absolute left-0 top-0 flex w-full flex-grow flex-col">
              <div className="sticky top-0 z-[999] hidden h-[40px] min-w-max flex-shrink-0 items-center border-b border-border bg-[#080811] md:flex">
                <TokenHeaderLoading />
              </div>

              <div className="flex h-auto w-full flex-col gap-y-2 p-4 md:gap-y-0 md:p-0">
                {Array.from({ length: 30 }).map((_, index) => (
                  <TokenCardLoading key={index} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const TokenInformationLoading = () => (
  <>
    <div className="w-full rounded-[8px] border border-border bg-[#080811]">
      <div className="flex w-full flex-col gap-y-4 p-3 md:p-4">
        <div className="flex h-auto w-full items-center justify-between gap-x-3">
          <div className="flex w-full items-center gap-x-3">
            <Skeleton className="h-10 w-10 flex-shrink-0 rounded-full" />
            <div className="flex w-full flex-col gap-y-2">
              <Skeleton className="h-4 w-full max-w-[156px] flex-shrink-0 rounded-[4px]" />
              <Skeleton className="h-4 w-full max-w-[78px] flex-shrink-0 rounded-[4px]" />
            </div>
          </div>

          <div className="flex items-center gap-x-2">
            <Skeleton className="size-6 flex-shrink-0 rounded-[4px]" />
            <Skeleton className="size-6 flex-shrink-0 rounded-[4px]" />
            <Skeleton className="size-6 flex-shrink-0 rounded-[4px]" />
            <Skeleton className="size-6 flex-shrink-0 rounded-[4px]" />
          </div>
        </div>
      </div>

      <div className="mb-5 flex w-full gap-x-4 px-3 md:px-4">
        <Skeleton className="h-4 w-full max-w-[130px] flex-shrink-0 rounded-[4px]" />
        <Skeleton className="h-4 w-full max-w-[78px] flex-shrink-0 rounded-[4px]" />
      </div>

      <div className="relative flex h-auto w-full flex-col gap-y-[15px] rounded-[8px] bg-gradient-to-b from-[#131320] via-[#0B0B14] to-[#131320] p-4">
        <div className="grid h-[40px] grid-cols-3 gap-x-2">
          <div className="col-span-1 flex h-full w-full flex-col justify-start gap-y-2">
            <Skeleton className="h-4 w-full max-w-[156px] flex-shrink-0 rounded-[4px]" />
            <Skeleton className="h-4 w-full max-w-[78px] flex-shrink-0 rounded-[4px]" />
          </div>
          <div className="col-span-1 flex h-full w-full flex-col justify-start gap-y-2">
            <Skeleton className="h-4 w-full max-w-[156px] flex-shrink-0 rounded-[4px]" />
            <Skeleton className="h-4 w-full max-w-[78px] flex-shrink-0 rounded-[4px]" />
          </div>
          <div className="col-span-1 flex h-full w-full flex-col justify-start gap-y-2">
            <Skeleton className="h-4 w-full max-w-[156px] flex-shrink-0 rounded-[4px]" />
            <Skeleton className="h-4 w-full max-w-[78px] flex-shrink-0 rounded-[4px]" />
          </div>
        </div>

        <Separator />

        <div className="grid h-auto grid-cols-3 gap-x-2">
          <div className="col-span-1 flex h-full w-full flex-col justify-start gap-y-2">
            <Skeleton className="h-4 w-full max-w-[156px] flex-shrink-0 rounded-[4px]" />
            <Skeleton className="h-4 w-full max-w-[78px] flex-shrink-0 rounded-[4px]" />
          </div>
          <div className="col-span-1 flex h-full w-full flex-col justify-start gap-y-2">
            <Skeleton className="h-4 w-full max-w-[156px] flex-shrink-0 rounded-[4px]" />
            <Skeleton className="h-4 w-full max-w-[78px] flex-shrink-0 rounded-[4px]" />
          </div>
          <div className="col-span-1 flex h-full w-full flex-col justify-start gap-y-2">
            <Skeleton className="h-4 w-full max-w-[156px] flex-shrink-0 rounded-[4px]" />
            <Skeleton className="h-4 w-full max-w-[78px] flex-shrink-0 rounded-[4px]" />
          </div>
        </div>
      </div>
    </div>
  </>
);

export const TokenTrendingTimeLoading = () => (
  <>
    <div className="hidden h-auto w-full grid-cols-4 overflow-hidden rounded-[8px] border border-border md:grid">
      <div className="flex h-full w-full flex-col items-center justify-center gap-y-1 border-r border-border py-1.5">
        <Skeleton className="h-3 w-full max-w-[18px] flex-shrink-0 rounded-[4px]" />
        <Skeleton className="h-4 w-full max-w-[52px] flex-shrink-0 rounded-[4px]" />
      </div>
      <div className="flex h-full w-full flex-col items-center justify-center gap-y-1 border-r border-border py-1.5">
        <Skeleton className="h-3 w-full max-w-[18px] flex-shrink-0 rounded-[4px]" />
        <Skeleton className="h-4 w-full max-w-[52px] flex-shrink-0 rounded-[4px]" />
      </div>
      <div className="flex h-full w-full flex-col items-center justify-center gap-y-1 border-r border-border py-1.5">
        <Skeleton className="h-3 w-full max-w-[18px] flex-shrink-0 rounded-[4px]" />
        <Skeleton className="h-4 w-full max-w-[52px] flex-shrink-0 rounded-[4px]" />
      </div>
      <div className="flex h-full w-full flex-col items-center justify-center gap-y-1 py-1.5">
        <Skeleton className="h-3 w-full max-w-[18px] flex-shrink-0 rounded-[4px]" />
        <Skeleton className="h-4 w-full max-w-[52px] flex-shrink-0 rounded-[4px]" />
      </div>
    </div>
  </>
);

export const TokenBuyAndSellLoading = () => (
  <>
    <TokenBuyAndSell tokenSymbol="-" loading />
  </>
);

export const TokenDataSecurityLoading = () => (
  <>
    <div className="hidden h-auto w-full rounded-[8px] border border-border md:inline-block">
      <div className="group relative flex h-[56px] w-full items-center justify-between rounded-t-[8px] border-b border-border bg-white/[4%] px-4">
        <Skeleton className="h-5 w-full max-w-[105px] flex-shrink-0 rounded-[4px]" />

        <div className="relative z-20 flex w-full items-center justify-end gap-x-2">
          <Skeleton className="h-5 w-full max-w-[80px] flex-shrink-0 rounded-[4px]" />
          <Skeleton className="h-5 w-5 flex-shrink-0 rounded-[4px]" />
        </div>
      </div>

      <div className="flex flex-col px-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Fragment key={index}>
            <div className="flex w-full items-center justify-between py-2.5">
              <Skeleton className="h-4 w-full max-w-[105px] flex-shrink-0 rounded-[4px]" />
              <Skeleton className="h-4 w-full max-w-[60px] flex-shrink-0 rounded-[4px]" />
            </div>
            {index !== 4 && (
              <Separator color="#202037" orientation="horizontal" />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  </>
);
