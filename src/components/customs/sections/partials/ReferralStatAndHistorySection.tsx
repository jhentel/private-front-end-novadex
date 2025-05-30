"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import Image from "next/image";
import ReferralHistoryTable from "@/components/customs/tables/ReferralHistoryTable";
import EmptyState from "@/components/customs/EmptyState";
import { useReferralStore } from "@/stores/use-referral.store";
import { formatAmount } from "@/utils/formatAmount";

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

export default function ReferralStatAndHistorySection() {
  const referralData = useReferralStore((state) => state.referralData);
  const isFetching = useReferralStore((state) => state.isFetching);

  return (
    <div className="relative z-30 flex w-full items-center justify-center bg-[#080811] pb-2 pt-5 md:px-4 md:pb-3">
      <div className="flex h-[480px] w-full max-w-[1000px] flex-col rounded-[8px] border-border md:h-[786px] md:border">
        <div className="hidden h-[48px] w-full grid-cols-4 items-center border-b border-border bg-white/[4%] md:grid">
          <div className="flex h-[48px] flex-shrink-0 items-center justify-start gap-x-2.5 border-r border-border px-[16px]">
            <div className="relative aspect-square h-7 w-7 flex-shrink-0">
              {isFetching ? (
                <SkeletonLoader className="h-full w-full rounded-full" />
              ) : (
                <Image
                  src="/icons/user-circle.png"
                  alt="User Circle Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              )}
            </div>
            {isFetching ? (
              <SkeletonLoader className="h-4 w-1/2" />
            ) : (
              <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                {referralData?.username || "My Account"}
              </span>
            )}
          </div>

          <div className="col-span-3 grid h-[48px] grid-cols-3 items-center justify-center p-2">
            <div className="relative col-span-1 flex !h-[28px] flex-col justify-center border-r border-border pl-3">
              {isFetching ? (
                <SkeletonLoader className="mb-1 h-3 w-1/2" />
              ) : (
                <span className="relative z-20 inline-block text-xs text-fontColorSecondary">
                  Earnings
                </span>
              )}
              <div className="relative z-20 flex items-center gap-x-1.5">
                {isFetching ? (
                  <SkeletonLoader className="h-3 w-10" />
                ) : (
                  <span className="inline-block text-nowrap font-geistSemiBold text-sm text-success">
                    ${referralData?.referrals.earnings || 0}
                  </span>
                )}
              </div>
            </div>
            <div className="relative col-span-1 flex !h-[28px] flex-col justify-center border-r border-border pl-3">
              {isFetching ? (
                <SkeletonLoader className="mb-1 h-3 w-1/2" />
              ) : (
                <span className="relative z-20 inline-block text-xs text-fontColorSecondary">
                  Amount of Referrals
                </span>
              )}
              <div className="relative z-20 flex items-center gap-x-1.5">
                {isFetching ? (
                  <SkeletonLoader className="h-3 w-10" />
                ) : (
                  <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                    {formatAmount(referralData?.referrals.users || 0)}
                  </span>
                )}
              </div>
            </div>
            <div className="relative col-span-1 flex !h-[28px] flex-col justify-center pl-3">
              {isFetching ? (
                <SkeletonLoader className="mb-1 h-3 w-1/2" />
              ) : (
                <span className="relative z-20 inline-block text-xs text-fontColorSecondary">
                  Referred Volume
                </span>
              )}
              <div className="relative z-20 flex items-center gap-x-1.5">
                {isFetching ? (
                  <SkeletonLoader className="h-3 w-10" />
                ) : (
                  <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                    ${referralData?.referrals.volume || 0}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Skeleton */}
        {isFetching &&
          [...Array(5)].map((_, index) => (
            <div
              key={`mobile-skeleton-${index}`}
              className="mx-4 mb-4 rounded-[8px] border border-border md:hidden"
            >
              <div className="flex w-full flex-col">
                <div className="flex items-center justify-between bg-white/[4%] px-3 py-5">
                  <SkeletonLoader className="h-5 w-28" />
                  <SkeletonLoader className="h-5 w-28" />
                </div>

                <div className="relative flex w-full items-center justify-between p-3">
                  <SkeletonLoader className="h-5 w-24" />

                  <SkeletonLoader className="h-7 w-36" />
                </div>
              </div>
            </div>
          ))}

        {!referralData && !isFetching ? (
          <div className="mb-12 flex w-full flex-grow flex-col items-center justify-center px-4">
            <EmptyState state="Referral" />
          </div>
        ) : (
          <ReferralHistoryTable />
        )}
      </div>
    </div>
  );
}
