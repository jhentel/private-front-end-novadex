"use client";

import { useQuery } from "@tanstack/react-query";
import { getReferralData } from "@/apis/rest/referral";
import { useReferralStore } from "@/stores/use-referral.store";
import ReferralTrackerStatSection from "@/components/customs/sections/partials/ReferralTrackerStatSection";
import TierLevelSection from "@/components/customs/sections/partials/TierLevelSection";
import ReferralStatAndHistorySection from "@/components/customs/sections/partials/ReferralStatAndHistorySection";

export default function ReferralTrackerSection() {
  const { setReferralData, setIsFetching } = useReferralStore();

  useQuery({
    queryKey: ["referralData"],
    queryFn: async () => {
      try {
        setIsFetching(true);
        const res = await getReferralData();
        setReferralData(res);
        setIsFetching(false);
        return res;
      } catch (error) {
        setIsFetching(false);
        throw error;
      }
    },
    retry: 0,
  });

  return (
    <div className="relative mb-14 flex w-full flex-grow flex-col">
      <ReferralTrackerStatSection />
      <TierLevelSection />
      <ReferralStatAndHistorySection />
    </div>
  );
}
