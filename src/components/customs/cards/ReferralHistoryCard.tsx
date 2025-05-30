"use client";

// ######## Components 🧩 ########
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import ReferralHistoryButtons from "@/components/customs/buttons/ReferralHistoryButtons";
import { cn } from "@/libraries/utils";
import { ReferralHistoryAPIItem } from "@/apis/rest/referral";
import { formatAmountDollar } from "@/utils/formatAmount";
import { useReferralStore } from "@/stores/use-referral.store";
import { toast } from "sonner";

interface ReferralHistoryCardProps {
  historyData: ReferralHistoryAPIItem;
}

export default function ReferralHistoryCard({
  historyData,
}: ReferralHistoryCardProps) {
  return (
    <div
      className={cn(
        "transition-color flex-shrink-0 items-center overflow-hidden duration-300 ease-out md:odd:bg-white/[4%] md:even:bg-[#080811] md:hover:bg-white/[8%]",
        "max-md:rounded-[8px] max-md:border max-md:border-border max-md:bg-card",
        "md:flex md:h-[56px] md:min-w-max md:px-3",
      )}
    >
      {/* Desktop Layout */}
      <div className="hidden h-full w-full min-w-[150px] items-center md:flex lg:min-w-[235px]">
        <HoverCard>
          <HoverCardTrigger>
            <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
              {historyData.date}
            </span>
          </HoverCardTrigger>
          <HoverCardContent className="w-auto border-none bg-transparent duration-0">
            <div className="-mt-4 ml-16 flex h-[42px] w-fit items-center justify-center rounded-[8px] border border-border bg-card p-3">
              <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                {historyData.dateHover}
              </span>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
      <div className="hidden h-full w-full min-w-[150px] items-center md:flex lg:min-w-[235px]">
        <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
          {historyData.referrals}
        </span>
      </div>
      <div className="hidden h-full w-full min-w-[150px] items-center md:flex lg:min-w-[235px]">
        <span className="inline-block text-nowrap font-geistSemiBold text-sm text-customGreen">
          + {formatAmountDollar(historyData.earnings)}
        </span>
      </div>
      <div className="ml-auto hidden h-full w-full min-w-[150px] items-center justify-end gap-x-2 md:flex lg:min-w-[235px]">
        <ReferralHistoryButtons
          historyId={historyData.id}
          status={historyData.status}
          transactionUrl={historyData.url}
        />
      </div>

      {/* Mobile Layout */}
      <div className="flex w-full flex-col md:hidden">
        {/* Header */}
        <div className="relative flex h-3 w-full items-center justify-between overflow-hidden bg-white/[4%] px-3 py-5">
          <div className="flex items-center gap-x-2">
            <span className="text-nowrap font-geistRegular text-xs text-fontColorSecondary">
              New Referees
              <span className="ml-1 font-geistSemiBold text-fontColorPrimary">
                {historyData.referrals}
              </span>
            </span>
          </div>
          <span className="text-nowrap text-xs text-fontColorSecondary">
            {historyData.date}
          </span>
        </div>

        {/* Content */}
        <div className="relative flex w-full items-center justify-between p-3">
          <div className="flex items-center gap-x-1">
            <span className="text-nowrap text-xs text-fontColorSecondary">
              Earnings
            </span>
            <span className="text-nowrap font-geistSemiBold text-sm text-customGreen">
              {formatAmountDollar(historyData.earnings)}
            </span>
          </div>

          <div className="flex items-center gap-x-2">
            <ReferralHistoryButtons
              historyId={historyData.id}
              status={historyData.status}
              transactionUrl={historyData.url}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
