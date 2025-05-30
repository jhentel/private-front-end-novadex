import NoScrollLayout from "@/components/layouts/NoScrollLayout";
import React from "react";
import PageHeading from "../headings/PageHeading";
import TrackedWalletsSkeleton from "../skeletons/TrackedWalletsSkeleton";
import WalletTrackerSkeleton from "../skeletons/WalletTrackerSkeleton";

const WalletTrackerPageLoading = () => {
  return (
    <NoScrollLayout mobileOnWhichBreakpoint="xl">
      <div className="flex w-full flex-col flex-wrap justify-between gap-y-2 px-4 pb-3 pt-4 xl:flex-row xl:items-center xl:gap-y-4 xl:px-0 xl:pb-4 xl:pt-3">
        <PageHeading
          title="Wallet Tracker"
          description="Add any wallet to receive real-time notifications on trades and activity"
          line={1}
          showDescriptionOnMobile
        ></PageHeading>
      </div>

      <div className="flex w-full flex-grow flex-col items-center justify-center xl:px-0">
        <div className="relative mb-8 flex h-full w-full flex-grow items-center justify-center overflow-hidden border-0 border-border xl:mb-12 xl:rounded-[8px] xl:border">
          <div className="absolute left-0 top-0 flex h-full w-full flex-grow flex-col xl:flex-row">
            <TrackedWalletsSkeleton />
            <div className="border-l-none flex h-full flex-grow flex-col items-center justify-center border-border xl:border-l">
              <WalletTrackerSkeleton />
            </div>
          </div>
        </div>
      </div>
    </NoScrollLayout>
  );
};

export default WalletTrackerPageLoading;
