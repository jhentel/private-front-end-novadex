import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/libraries/utils";
import { useMemo } from "react";

export function EarnReferralHistory() {
  return (
    <div className="space-y-4 overflow-visible">
      <h3 className="text-nowrap font-geistSemiBold text-[20px] text-fontColorPrimary">
        Referral History
      </h3>
      <ReferralHistoryCard amount={20932} volume={24712000} earnings={10712} />

      <div className="relative h-fit">
        <div className="absolute left-0 top-0 z-10 h-8 w-full bg-gradient-to-b from-[#080811] to-[#08081100]" />
        <div className="absolute bottom-0 left-0 z-10 h-8 w-full bg-gradient-to-t from-[#080811] to-[#08081100]" />
        <div className="nova-scroller max-h-[calc(100dvh_-_660px)] space-y-3 overflow-y-auto overflow-x-hidden py-3 max-lg:max-h-[280px]">
          <ReferralHistoryItem
            date="2024-04-19"
            newReferees={127}
            earnings={2270}
          />
          <ReferralHistoryItem
            date="2024-04-18"
            newReferees={155}
            earnings={3520}
            highest
          />
          <ReferralHistoryItem
            date="2024-04-17"
            newReferees={84}
            earnings={1460}
          />
          <ReferralHistoryItem
            date="2024-04-16"
            newReferees={78}
            earnings={1020}
          />
          <ReferralHistoryItem
            date="2024-04-15"
            newReferees={64}
            earnings={890}
          />
          <ReferralHistoryItem
            date="2024-04-14"
            newReferees={64}
            earnings={890}
          />
          <ReferralHistoryItem
            date="2024-04-13"
            newReferees={64}
            earnings={890}
          />
          <ReferralHistoryItem
            date="2024-04-12"
            newReferees={64}
            earnings={890}
          />
        </div>
      </div>
    </div>
  );
}

interface ReferralHistoryCardProps {
  amount: number;
  volume: number;
  earnings: number;
}

function ReferralHistoryCard({
  amount,
  volume,
  earnings,
}: ReferralHistoryCardProps) {
  return (
    <div className="border-1 flex h-[68px] w-full items-center justify-start gap-3 rounded-[12px] border-[#242436] bg-[#17171F] px-3 py-2 max-sm:h-fit max-sm:flex-col max-sm:items-start">
      <div className="flex flex-1 flex-col gap-1 p-2">
        <span className="font-geist text-xs text-[#9191A4]">
          Amount of Referrals
        </span>
        <span className="font-geist bg-gradient-to-b from-white to-[#9191A4] to-80% bg-clip-text text-[16px] font-[600] leading-6 text-transparent lg:text-2xl lg:leading-8">
          {amount}
        </span>
      </div>
      <div className="h-0 w-full border-t border-[#242436] sm:h-[28px] sm:w-0 sm:border-r sm:border-t-0" />
      <div className="flex flex-1 flex-col gap-1 p-2">
        <span className="font-geist text-xs text-[#9191A4]">
          Referred Volume
        </span>
        <span className="font-geist bg-gradient-to-b from-white to-[#9191A4] to-80% bg-clip-text text-[16px] font-[600] leading-6 text-transparent lg:text-2xl lg:leading-8">
          {formatCurrencyCompact(volume)}
        </span>
      </div>
      <div className="h-0 w-full border-t border-[#242436] sm:h-[28px] sm:w-0 sm:border-r sm:border-t-0" />
      <div className="flex flex-1 flex-col gap-1 p-2">
        <span className="font-geist text-xs text-[#9191A4]">Earnings</span>
        <span className="font-geist bg-gradient-to-b from-[#8CD9B6] to-[#4BAA7F] to-80% bg-clip-text text-[16px] font-[600] leading-6 text-transparent lg:text-2xl lg:leading-8">
          {formatCurrencyCompact(earnings)}
        </span>
      </div>
    </div>
  );
}

interface ReferralHistoryItemProps {
  date: string;
  newReferees: number;
  earnings: number;
  highest?: boolean;
}

function ReferralHistoryItem({
  date,
  newReferees,
  earnings,
  highest = false,
}: ReferralHistoryItemProps) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const time = useMemo(() => {
    const _date = new Date(date);
    const day = _date.getDate();
    const month = months[_date.getMonth()].toUpperCase();
    const year = _date.getFullYear();
    return { day, month, year };
  }, [date]);

  return (
    <div className="group flex">
      <div className="flex w-fit gap-3 pr-3 sm:w-1/3">
        <div className="relative isolate h-[58px] w-full overflow-hidden max-sm:hidden lg:h-[68px]">
          <div className="lg:1/4 absolute left-5 top-0 z-10 h-1/5 w-[10px] bg-gradient-to-t from-[#35353D] via-[#282830] to-[#080810] group-hover:from-[#F4D2FF] group-hover:via-[#E284FE] group-hover:to-[#080810]" />
          <div className="absolute right-0 top-[20px] z-10 h-[10px] w-1/4 bg-gradient-to-r from-[#35353D] via-[#282830] to-[#080810] group-hover:from-[#F4D2FF] group-hover:via-[#E284FE] group-hover:to-[#080810] lg:top-[30px]" />
          <div className="absolute -top-7 left-5 h-full w-full rounded-bl-[20px] border-[10px] border-[#35353D] group-hover:border-[#F4D2FF]" />
        </div>

        <div className="relative isolate h-[58px] w-[44px] rounded-[12px] bg-[#17171F] p-2 lg:h-[68px]">
          <div className="absolute -left-[1px] -top-[1px] h-[calc(100%_+_2px)] w-[calc(100%_+_2px)] rounded-[12px] bg-gradient-to-t from-white to-[#DF74FF] opacity-0 shadow-[0_0_5px_1px_#DF74FF] transition-opacity duration-300 group-hover:opacity-100" />

          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-[12px] bg-[#12121A]">
            <span className="font-geist bg-gradient-to-b from-white to-[#9191A4] to-80% bg-clip-text text-2xl font-[300] leading-8 text-transparent">
              {time.day}
            </span>

            <span className="font-geist text-xs font-[600] leading-[16px] text-[#9191A4] lg:leading-8">
              {time.month}
            </span>
          </div>
        </div>
      </div>

      <div className="relative isolate h-[58px] w-full overflow-visible rounded-[12px] bg-[#17171F] sm:w-2/3 md:group-hover:w-[calc(100%*2/3_-_4px)] lg:h-[68px]">
        <div className="absolute -left-[1px] -top-[1px] h-[calc(100%_+_2px)] w-[calc(100%_+_2px)] rounded-[12px] bg-gradient-to-t from-white to-[#DF74FF] opacity-0 shadow-[0_0_5px_1px_#DF74FF] transition-opacity duration-300 group-hover:opacity-100" />

        <div className="absolute inset-0 z-20 flex items-center justify-start gap-10 rounded-[12px] bg-[#17171F] px-4 py-2 group-hover:gap-[44px]">
          <div className="absolute right-0 h-full w-1/2 bg-[url('/icons/strips.svg')] bg-cover bg-no-repeat opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="flex flex-1 flex-col gap-1 lg:gap-2">
            <div className="flex items-center justify-start gap-1">
              <span className="font-geist text-nowrap text-xs text-[#9191A4]">
                New Referees
              </span>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                      <Image
                        src="/icons/info-tooltip.png"
                        alt="Info Tooltip Icon"
                        fill
                        quality={100}
                        className="object-contain"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>New Referees</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center justify-start gap-1 lg:gap-2">
              <span className="font-geist bg-gradient-to-b from-white to-[#9191A4] to-80% bg-clip-text text-sm font-[600] leading-[22px] text-transparent lg:text-xl lg:leading-8">
                {newReferees}
              </span>
              {highest ? (
                <span className="font-geist text-nowrap rounded-full bg-[#2A2A32] px-2 py-1 text-xs font-[600] leading-[18px] text-white lg:text-sm">
                  🔥 Highest
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-1 lg:gap-2">
            <div className="flex items-center justify-start gap-1">
              <span className="font-geist text-xs text-[#9191A4]">
                Earnings
              </span>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                      <Image
                        src="/icons/info-tooltip.png"
                        alt="Info Tooltip Icon"
                        fill
                        quality={100}
                        className="object-contain"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Earnings</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="font-geist text-nowrap bg-gradient-to-b from-[#8CD9B6] to-[#4BAA7F] to-80% bg-clip-text text-sm font-[600] leading-[22px] text-transparent lg:text-xl lg:leading-8">
              + {formatCurrencyCompact(earnings)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function formatCurrencyCompact(value: number): string {
  const absValue = Math.abs(value);
  let suffix = "";
  let shortValue = value;

  if (absValue >= 1_000_000_000) {
    shortValue = value / 1_000_000_000;
    suffix = "B";
  } else if (absValue >= 1_000_000) {
    shortValue = value / 1_000_000;
    suffix = "M";
  } else if (absValue >= 1_000) {
    shortValue = value / 1_000;
    suffix = "K";
  }

  const formatted = new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(shortValue);

  return `$${formatted}${suffix}`;
}
