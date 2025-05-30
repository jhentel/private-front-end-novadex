"use client";
import WalletTrackerSkeleton from "@/components/customs/skeletons/WalletTrackerSkeleton";
import TrackedWalletsSkeleton from "@/components/customs/skeletons/TrackedWalletsSkeleton";
import { useWalletTrackerStore } from "@/stores/footer/use-wallet-tracker";
import dynamic from "next/dynamic";
const WalletTrackerTable = dynamic(
  () => import("@/components/customs/tables/footer/WalletTrackerTable"),
  { ssr: false },
);
const TrackedWallets = dynamic(
  () => import("@/components/customs/TrackedWallets"),
  { ssr: false },
);

const WalletTrackerContent = ({
  isTrackerDataLoading,
}: {
  isTrackerDataLoading: boolean;
}) => {
  const isTrackedWalletsLoading = useWalletTrackerStore(
    (state) => state.isLoadingTrackedWallets,
  );

  return (
    <div className="relative mb-8 flex h-full w-full flex-grow items-center justify-center overflow-hidden border-0 border-border xl:mb-12 xl:rounded-[8px] xl:border">
      <div className="absolute left-0 top-0 flex h-full w-full flex-grow flex-col xl:flex-row">
        {isTrackerDataLoading || isTrackedWalletsLoading ? (
          <TrackedWalletsSkeleton />
        ) : (
          <TrackedWallets />
        )}
        <div className="border-l-none mb-4 flex h-full flex-grow flex-col items-center justify-center border-border xl:border-l">
          {isTrackedWalletsLoading || isTrackerDataLoading ? (
            <WalletTrackerSkeleton />
          ) : (
            <WalletTrackerTable />
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletTrackerContent;
