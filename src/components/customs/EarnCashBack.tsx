import Image from "next/image";
import { useMemo, Fragment } from "react";

export function EarnCashBack() {
  return (
    <Fragment>
      <div className="relative rounded-t-xl bg-gradient-to-b from-[#242436] to-[#24243600] to-80% p-[1px]">
        <div className="rounded-t-xl bg-[#080810] pt-4">
          <h3 className="item-center flex w-full justify-center gap-[56.58px] font-geistBlack text-2xl font-[800] leading-8">
            <span className="bg-gradient-to-r from-[#9191A4] to-[#9191A400] bg-clip-text text-transparent">
              CASH
            </span>
            <span className="bg-gradient-to-r from-[#9191A400] to-[#9191A4] bg-clip-text text-transparent">
              BACK
            </span>
          </h3>
        </div>
        <Image
          className="absolute bottom-[1px] left-[50%] -translate-x-1/2"
          src="/images/decorations/deposit-box.png"
          alt="Deposit Box Image"
          width={56.58}
          height={60}
        />
        <div className="h-[1px] bg-gradient-to-r from-[#24243600] via-[#242436] to-[#24243600]" />
      </div>
      <div className="relative h-fit">
        <div className="absolute left-0 top-0 z-10 h-8 w-full bg-gradient-to-b from-[#080811] to-[#08081100]" />
        <div className="absolute bottom-0 left-0 z-10 h-8 w-full bg-gradient-to-t from-[#080811] to-[#08081100]" />
        <div className="nova-scroller max-h-[calc(100dvh_-_660px)] space-y-2 overflow-y-auto p-3 max-lg:max-h-[272px]">
          <CashBackItem
            date="2024-05-19"
            volume={20460}
            multiplier={2.25}
            earnings={124750}
          />
          <CashBackItem
            date="2024-05-18"
            volume={12250}
            multiplier={2.25}
            earnings={86350}
          />
          <CashBackItem
            date="2024-05-17"
            volume={7850}
            multiplier={2}
            earnings={87050}
          />
          <CashBackItem
            date="2024-05-16"
            volume={6810}
            multiplier={2}
            earnings={72750}
          />
          <CashBackItem
            date="2024-05-15"
            volume={6240}
            multiplier={2}
            earnings={52750}
          />
          <CashBackItem
            date="2024-05-14"
            volume={6240}
            multiplier={2}
            earnings={52750}
          />
          <CashBackItem
            date="2024-05-13"
            volume={6240}
            multiplier={2}
            earnings={52750}
          />
          <CashBackItem
            date="2024-05-12"
            volume={6240}
            multiplier={2}
            earnings={52750}
          />
        </div>
      </div>
    </Fragment>
  );
}

interface CashBackItemProps {
  date: string;
  volume: number;
  multiplier: number;
  earnings: number;
}

function CashBackItem({
  date,
  volume,
  multiplier,
  earnings,
}: CashBackItemProps) {
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
      <div className="flex w-fit gap-3 pr-3">
        <div className="relative isolate h-[62px] w-10 overflow-hidden max-sm:hidden lg:h-[68px]">
          <div className="absolute left-0 top-0 z-10 h-1/4 w-[10px] bg-gradient-to-t from-[#35353D] via-[#282830] to-[#080810] group-hover:from-[#F4D2FF] group-hover:via-[#E284FE] group-hover:to-[#080810]" />
          <div className="absolute right-0 top-[28px] z-10 h-[10px] w-1/4 bg-gradient-to-r from-[#35353D] via-[#282830] to-[#080810] group-hover:from-[#F4D2FF] group-hover:via-[#E284FE] group-hover:to-[#080810] lg:top-[34px]" />
          <div className="absolute -top-6 left-0 h-full w-[150%] rounded-bl-[20px] border-[10px] border-[#35353D] group-hover:border-[#F4D2FF]" />
        </div>

        <div className="relative isolate h-[62px] w-[44px] rounded-[12px] bg-[#17171F] p-2 lg:h-[68px]">
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

      <div className="relative isolate h-[62px] w-full overflow-visible rounded-[12px] bg-[#17171F] lg:h-[68px]">
        <div className="absolute -left-[1px] -top-[1px] h-[calc(100%_+_2px)] w-[calc(100%_+_2px)] rounded-[12px] bg-gradient-to-t from-white to-[#DF74FF] opacity-0 shadow-[0_0_5px_1px_#DF74FF] transition-opacity duration-300 group-hover:opacity-100" />

        <div className="absolute inset-0 z-20 flex items-center justify-start gap-2 rounded-[12px] bg-[#17171F] px-4 py-3">
          <div className="flex flex-1 flex-col">
            <span className="font-geist text-nowrap text-xs text-[#9191A4]">
              Vol.
            </span>
            <span className="font-geist bg-gradient-to-b from-white to-[#9191A4] to-80% bg-clip-text text-[14px] font-[600] leading-[22px] text-transparent">
              {formatCurrencyCompact(volume)}
            </span>
          </div>
          <div className="h-[38px] w-0 border-r border-[#242436]" />
          <div className="flex flex-1 flex-col">
            <span className="font-geist text-xs text-[#9191A4]">
              Multiplier
            </span>

            <span
              className="font-geist text-nowrap bg-gradient-to-b from-white to-[#FFF3B7] to-80% bg-clip-text text-[14px] font-[600] leading-[22px] text-transparent"
              style={{
                textShadow:
                  "0 0 2px rgba(255, 153, 0, 0.8), 0 0 8px rgba(255, 153, 0, 0.6), 0 0 12px rgba(255, 153, 0, 0.4)",
              }}
            >
              {multiplier}X
            </span>
          </div>
          <div className="h-[38px] w-0 border-r border-[#242436]" />
          <div className="flex flex-1 flex-col">
            <span className="font-geist text-xs text-[#9191A4]">Earnings</span>

            <span className="font-geist text-nowrap bg-gradient-to-b from-[#8CD9B6] to-[#4BAA7F] to-80% bg-clip-text text-[14px] font-[600] leading-[22px] text-transparent">
              {formatCurrencyCompact(earnings, false)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function formatCurrencyCompact(value: number, prefix = true): string {
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

  if (prefix) return `$${formatted}${suffix}`;

  return `${formatted}${suffix}`;
}
