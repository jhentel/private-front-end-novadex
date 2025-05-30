"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useEffect, useRef } from "react";
import { useWalletTrackerMessageStore } from "@/stores/footer/use-wallet-tracker-message.store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
// ######## APIs 🛜 ########
import { getWalletTracker } from "@/apis/rest/wallet-tracker";
// ######## Components 🧩 ########
import NoScrollLayout from "@/components/layouts/NoScrollLayout";
import PageHeading from "@/components/customs/headings/PageHeading";
import DexBuySettings from "@/components/customs/DexBuySettings";
import WalletTrackerContent from "@/components/customs/WalletTrackerContent";
import { Paused } from "./cards/partials/Paused";
import { useWalletTrackerPaused } from "@/stores/footer/use-wallet-tracker-paused";
import ScrollLayout from "../layouts/ScrollLayout";
import { useWindowSize } from "@/hooks/use-window-size";
import { clearFooterSection } from "@/apis/rest/footer";
import { useFooterStore } from "@/stores/footer/use-footer.store";

const WalletTrackerClient = () => {
  const setWalletTrackerList = useWalletTrackerMessageStore(
    (state) => state.setInitMessages,
  );

  const isClient = useRef<boolean>(false);
  useEffect(() => {
    isClient.current = true;
  }, [isClient]);

  const {
    data: trackerData,
    isLoading: isTrackerDataLoading,
    isFetched: isFetchedTracker,
  } = useQuery({
    queryKey: ["wallet-tracker"],
    queryFn: async () => {
      const res = await getWalletTracker();

      return res;
    },
    gcTime: 0,
    staleTime: 0,
    // refetchOnMount: true,
  });
  const setFooterMessage = useFooterStore((state) => state.setMessage);
  useQuery({
    queryKey: ["clear-footer-wallet-tracker"],
    queryFn: async () => {
      const res = await clearFooterSection("walletTracker");
      setFooterMessage(res);
      return res;
    },
    gcTime: 0,
    staleTime: 0,
    refetchOnMount: true,
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (trackerData) {
      setWalletTrackerList(trackerData);
    }
  }, [trackerData]);

  useEffect(() => {
    return () => {
      queryClient.removeQueries({
        queryKey: ["wallet-tracker"],
        exact: true,
      });
    };
  }, [queryClient]);

  const isWalletTrackerHovered = useWalletTrackerPaused(
    (state) => state.isWalletTrackerHovered,
  );

  const { width } = useWindowSize();

  // Fix: Changed the Layout function to render the appropriate layout component
  const renderLayout = (children: React.ReactNode) => {
    if (width && width < 768) {
      return <ScrollLayout withPadding={false}>{children}</ScrollLayout>;
    }
    return (
      <NoScrollLayout mobileOnWhichBreakpoint="lg">{children}</NoScrollLayout>
    );
  };

  const layoutContent = (
    <>
      <div className="flex w-full flex-col flex-wrap justify-between gap-y-2 px-4 pb-3 pt-4 xl:flex-row xl:items-center xl:gap-y-4 xl:px-0 xl:pb-4 xl:pt-3">
        <PageHeading
          title="Wallet Tracker"
          description="Add any wallet to receive real-time notifications on trades and activity"
          line={1}
          showDescriptionOnMobile
        >
          <div className="hidden h-7 w-9 items-center justify-center lg:flex min-[1650px]:w-auto">
            {isWalletTrackerHovered && (
              <Paused
                separatorProps={{ className: "mr-2" }}
                className="hidden lg:flex"
              />
            )}
          </div>
        </PageHeading>

        <DexBuySettings variant="Wallet Tracker" />
      </div>

      <div className="flex w-full flex-grow flex-col items-center justify-center xl:px-0">
        <WalletTrackerContent
          isTrackerDataLoading={isTrackerDataLoading || !isFetchedTracker}
        />
      </div>
    </>
  );

  return (
    <>
      {renderLayout(layoutContent)}
      {/* <WalletTrackerInteractiveTutorials /> */}
    </>
  );
};

export default WalletTrackerClient;
