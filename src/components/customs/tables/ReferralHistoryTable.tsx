"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useReferralHistoryTableSettingStore } from "@/stores/table/use-referral-history-table-setting.store";
import { useReferralStore } from "@/stores/use-referral.store";
// ######## Components 🧩 ########
import Image from "next/image";
import ReferralHistoryCard from "../cards/ReferralHistoryCard";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { HiArrowNarrowUp, HiArrowNarrowDown } from "react-icons/hi";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { CachedImage } from "../CachedImage";

const skeletonBackground = {
  background:
    "linear-gradient(288.8deg, rgba(255, 255, 255, 0.02) 12.7%, rgba(255, 255, 255, 0.08) 87.3%)",
};

const SkeletonLoader = ({ className }: { className: string }) => (
  <div
    className={`${className} animate-pulse rounded`}
    style={skeletonBackground}
  />
);

const ReferralHistoryCardSkeleton = ({ i }: { i: number }) => (
  <div className="sticky top-0 z-[999] hidden h-[70px] min-w-max items-center border-b border-border pl-3 pr-3 odd:bg-[#080811] even:bg-white/[4%] md:flex">
    <SkeletonLoader className="h-3 w-1/2" />
    <SkeletonLoader className="h-3 w-1/2" />
    <SkeletonLoader className="h-3 w-1/2" />
    <SkeletonLoader className="h-3 w-1/2" />
  </div>
);

export default function ReferralHistoryTable() {
  const referralData = useReferralStore((state) => state.referralData);
  const isFetching = useReferralStore((state) => state.isFetching);

  return (
    <div className="flex w-full flex-grow flex-col">
      <OverlayScrollbarsComponent
        defer
        element="div"
        className="invisible__overlayscrollbar relative w-full flex-grow md:overflow-y-scroll"
      >
        <div className="absolute left-0 top-0 flex w-full flex-grow flex-col">
          <div className="sticky top-0 z-[999] hidden h-[40px] min-w-max items-center border-b border-border bg-[#080811] pl-3 pr-3 md:flex">
            <div className="flex w-full min-w-[150px] items-center gap-x-0.5 lg:min-w-[235px]">
              {isFetching ? (
                <SkeletonLoader className="h-3 w-1/2" />
              ) : (
                <>
                  <span className="header__table__text">Date</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="relative aspect-square h-3.5 w-3.5 flex-shrink-0">
                          <CachedImage
                            src="/icons/info-tooltip.png"
                            alt="Info Tooltip Icon"
                            fill
                            quality={50}
                            className="object-contain"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Date Information</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              )}
            </div>
            <div className="flex w-full min-w-[150px] items-center gap-x-0.5 lg:min-w-[235px]">
              {isFetching ? (
                <SkeletonLoader className="h-3 w-1/2" />
              ) : (
                <>
                  <span className="header__table__text">New Referees</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="relative aspect-square h-3.5 w-3.5 flex-shrink-0">
                          <CachedImage
                            src="/icons/info-tooltip.png"
                            alt="Info Tooltip Icon"
                            fill
                            quality={50}
                            className="object-contain"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>New Referees Information</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              )}
            </div>
            <div className="flex w-full min-w-[150px] items-center gap-x-0.5 lg:min-w-[235px]">
              {isFetching ? (
                <SkeletonLoader className="h-3 w-1/2" />
              ) : (
                <>
                  <span className="header__table__text">Earnings</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="relative aspect-square h-3.5 w-3.5 flex-shrink-0">
                          <CachedImage
                            src="/icons/info-tooltip.png"
                            alt="Info Tooltip Icon"
                            fill
                            quality={50}
                            className="object-contain"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Earnings Information</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              )}
            </div>
            <div className="mr-auto flex w-full min-w-[150px] items-center justify-start gap-x-1 lg:min-w-[235px]">
              {isFetching ? (
                <SkeletonLoader className="h-3 w-1/2" />
              ) : (
                <>
                  <span className="header__table__text">Status</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="relative aspect-square h-3.5 w-3.5 flex-shrink-0">
                          <CachedImage
                            src="/icons/info-tooltip.png"
                            alt="Info Tooltip Icon"
                            fill
                            quality={50}
                            className="object-contain"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Status Information</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              )}
            </div>
          </div>
          {isFetching ? (
            [...Array(10)].map((_, index) => (
              <ReferralHistoryCardSkeleton
                key={`referral-history-card-skeleton-${index}`}
                i={index}
              />
            ))
          ) : (
            <div className="flex h-auto w-full flex-col gap-y-3 p-4 md:gap-y-0 md:px-0">
              {referralData?.history.map((historyItem) => (
                <ReferralHistoryCard
                  key={historyItem.id}
                  historyData={historyItem}
                />
              ))}
            </div>
          )}
        </div>
      </OverlayScrollbarsComponent>
    </div>
  );
}
