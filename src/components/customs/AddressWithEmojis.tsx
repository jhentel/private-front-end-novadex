"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
// ######## APIs 🛜 ########
import { getTraderOverview } from "@/apis/rest/trades";
// ######## Components 🧩 ########
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { useTradesWalletModalStore } from "@/stores/token/use-trades-wallet-modal.store";

const getFormattedTimeDiff = (timestamp: number, threshold = 0.5) => {
  const now = Math.floor(Date.now() / 1000);
  const normalizedTimestamp =
    String(timestamp).length > 10
      ? Math.floor(timestamp / 1000)
      : Math.floor(timestamp);

  const difference = now - normalizedTimestamp;

  if (difference < 0 || difference < threshold) return "Just Now";
  if (difference < 60) return `${difference.toFixed(0)} Seconds ago`;
  if (difference < 3600) return `${Math.floor(difference / 60)} Minutes ago`;
  if (difference < 86400) {
    const hours = Math.floor(difference / 3600);
    const minutes = Math.floor((difference % 3600) / 60);
    return `${hours} Hours ${minutes} Minutes ago`;
  }
  const days = Math.floor(difference / 86400);
  const hours = Math.floor((difference % 86400) / 3600);
  return `${days} Days ${hours} Hours ago`;
};

const getFundedBy = (address: string) => {
  const exchangeWallets: Record<string, string> = {
    "7FfB2zQRYUQwpPzkRxAeg2mCBGeCRKp4PCEeULJA9xTo": "deBridge",
    H8sMJSCQxfKiFTCfDR3DUMLPwcRbM61LGFJ8N4dK3WjS: "Coinbase",
    GJRs4FwHtemZ5ZE9x3FNvJ8TMwitKTh21yxdRPqn7npE: "Coinbase",
    F37Wb3pqcaYSBGXP7W699XZBqiEwkqVQpkreU9v6Ntkk: "Alex Fund",
    "5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBwuoFbhUvuAi9": "Binance",
    FWznbcNXWQuHTawe9RxvQ2LdCENssh12dsznf4RiouN5: "Kraken",
    AC5RDfQFmDS1deWZos921JfqscXdByf8BKHs5ACWjtW2: "Bybit",
    A77HErqtfN1hLLpvZ9pCtu66FEtM8BveoaKbbMoZ4RiR: "Bitget",
    AeBwztwXScyNNuQCEdhS54wttRQrw3Nj1UtqddzB4C7b: "Robinhood",
    "5VCwKtCXgCJ6kit5FybXjvriW3xELsFDhYrPSqtJNmcD": "OKX",
    G2YxRa6wt1qePMwfJzdXZG62ej4qaTC7YURzuh2Lwd3t: "ChangeNow",
    BmFdpraQhkiDQE6SnfG5omcA1VwzqfXrwtNYBwWTymy6: "Kucoin",
  };

  const match = exchangeWallets[address];

  if (match) {
    return match;
  } else {
    return "Coinbase";
  }
};

const WalletTooltipContent = ({
  children,
  address,
  isWithOverview,
  isOpen,
}: {
  children: React.ReactNode;
  address: string;
  isWithOverview?: boolean;
  isOpen?: boolean;
}) => {
  const params = useParams();
  const { data: traderData, isLoading } = useQuery({
    queryKey: ["trader-overview", address],
    queryFn: () =>
      getTraderOverview(
        address,
        (params?.["mint-address"] || params?.["pool-address"]) as string,
      ),
    enabled: isWithOverview && isOpen,
    retry: 0,
  });

  if (!isWithOverview) {
    return children;
  }

  return (
    <>
      {children}
      <TooltipContent
        align="end"
        side="bottom"
        className="gb__white__popover z-[500] w-[240px] rounded-[8px] border border-border bg-card p-0 text-fontColorSecondary"
      >
        {isLoading ? (
          <div className="flex h-[200px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : traderData ? (
          <div className="flex flex-col text-xs">
            <div className="flex w-full justify-between border-b border-border px-3 py-2">
              <span>Invested</span>
              <span className="text-primary">
                ${traderData.invested_usd.toFixed(2)}
              </span>
            </div>
            <div className="flex w-full justify-between border-b border-border px-3 py-2">
              <span>Sold</span>
              <span className="text-success">
                ${traderData.sold_usd.toFixed(2)}
              </span>
            </div>
            <div className="flex w-full justify-between border-b border-border px-3 py-2">
              <span>Remaining</span>
              <span className="text-fontColorPrimary">
                ${traderData.remaining_usd.toFixed(2)}
              </span>
            </div>
            <div className="flex w-full justify-between border-b border-border px-3 py-2">
              <span>PnL</span>
              <span
                className={
                  traderData.profit_usd >= 0
                    ? "text-success"
                    : "text-destructive"
                }
              >
                ${traderData.profit_usd.toFixed(2)} (
                {traderData.percentage.toFixed(2)}%)
              </span>
            </div>
            <div className="flex w-full justify-between border-b border-border px-3 py-2">
              <span>Type</span>
              <span className="capitalize text-primary">
                {traderData.animal}
              </span>
            </div>
            <div className="flex w-full justify-between border-b border-border px-3 py-2">
              <span>Trades</span>
              <span className="text-fontColorPrimary">
                {traderData.buys} buys, {traderData.sells} sells
              </span>
            </div>
            <div className="flex w-full justify-between px-3 py-2">
              <span>Holder Since</span>
              <span className="text-fontColorPrimary">
                {new Date(traderData.holder_since).toLocaleDateString()}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-3 text-center text-xs text-destructive">
            Failed to load trader data
          </div>
        )}
      </TooltipContent>
    </>
  );
};

const WalletAddress = ({
  href,
  className,
  classNameSpan,
  address,
  fullAddress,
}: {
  href?: string;
  className: string;
  classNameSpan: string;
  address: string;
  fullAddress: string;
}) => {
  const setWalletModalAddress = useTradesWalletModalStore(
    (state) => state.setWallet,
  );
  const handleAddressClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.stopPropagation();
    setWalletModalAddress(fullAddress);
  };

  return (
    <>
      {href ? (
        <>
          {/* <Link */}
          {/*   href={href} */}
          {/*   target="_blank" */}
          {/*   className={className} */}
          {/*   onClick={(e) => e.stopPropagation()} */}
          {/* > */}
          {/*   <span>{address}</span> */}
          {/*   <span className={classNameSpan} /> */}
          {/* </Link> */}
          <button className={className} onClick={handleAddressClick}>
            <span>{address}</span>
            <span className={classNameSpan} />
          </button>
        </>
      ) : (
        <div className={className}>
          <span>{address}</span>
          <span className={classNameSpan} />
        </div>
      )}
    </>
  );
};

const FishIconSVG = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.0848 8.67098C15.2433 8.32566 15.239 7.92624 15.0672 7.58744C14.3314 6.13645 12.6214 3.99182 10.0391 3.99182C9.59684 3.56838 8.31302 2.76628 6.45113 2.60135C6.12534 2.57249 5.89696 2.90785 5.9905 3.22424C6.14787 3.75649 6.29361 4.43698 6.25275 4.97332C5.63021 5.3177 4.25721 6.21826 3.74554 7.06544C3.42099 6.58539 2.52064 5.72095 1.29633 5.67178C1.00815 5.66021 0.785018 5.90379 0.800773 6.19453C0.83438 6.81466 1.00555 7.66259 1.51975 8.15024C1.32325 8.41238 0.965062 9.09313 0.844356 9.99385C0.799314 10.33 1.0746 10.6076 1.40659 10.5557C2.13977 10.441 3.14204 10.0991 3.74554 9.28671C4.39366 10.0271 6.00714 11.5803 7.2761 11.8696C7.22574 12.1456 7.15838 12.772 7.22456 13.3582C7.24436 13.5335 7.41707 13.64 7.58315 13.5851C8.21766 13.3751 9.16414 12.9547 9.4763 12.412C10.8145 12.4283 13.701 11.6845 15.0848 8.67098ZM12.0091 7.4787C12.3199 7.4787 12.5719 7.22429 12.5719 6.91047C12.5719 6.59664 12.3199 6.34224 12.0091 6.34224C11.6982 6.34224 11.4463 6.59664 11.4463 6.91047C11.4463 7.22429 11.6982 7.4787 12.0091 7.4787Z"
        fill="#FBA544"
      />
    </svg>
  );
};
const DolphinIconSVG = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M4.17559 10.9557C3.35952 8.81319 5.47307 7.66436 6.63185 7.35776C6.56296 7.68405 6.25468 8.15397 5.9551 8.54537C5.78672 8.76537 5.93326 9.0933 6.20778 9.06759C8.00003 8.89973 8.89335 7.8957 9.12838 7.35776C10.442 6.53152 12.9915 6.34778 14.7014 6.36338C15.1251 6.36724 15.3693 5.93055 15.0624 5.63611C14.5657 5.15963 13.9525 4.75212 13.6114 4.55784C12.9027 2.31789 8.99416 2.40716 7.12848 2.73179C6.24262 1.95165 4.86691 1.92021 3.8533 2.07212C3.55315 2.11711 3.49716 2.57204 3.70324 2.79651C4.17946 3.31521 4.44005 4.02103 4.52457 4.40904C1.66833 6.33518 1.70591 9.7474 2.08173 11.2127C1.11395 11.8991 0.832907 13.0539 0.800201 13.792C0.792741 13.9604 0.982284 14.0524 1.12729 13.9684C1.79031 13.5844 2.85898 13.1516 3.38368 12.9576C3.90256 12.9396 4.73696 13.3898 5.26747 13.7308C5.39924 13.8156 5.57776 13.741 5.59706 13.5847C5.8311 11.6895 4.76846 11.0411 4.17559 10.9557Z"
        fill="#66B0FF"
      />
    </svg>
  );
};
const WhaleIconSVG = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M5.26729 3.3701C6.2395 3.4271 7.09488 4.05889 7.40105 4.36766C7.9239 3.91163 8.74347 3.56962 9.78915 3.52686C10.8348 3.48411 12.3186 3.24185 12.7142 2.61481C13.1099 1.98777 13.2795 1.73125 13.7317 1.81676C14.0934 1.88516 14.1179 2.88082 14.0849 3.3701C13.8023 6.53949 10.7265 8.27241 9.22392 8.74269C9.93083 10.124 12.7674 12.019 14.9667 13.2979C15.3774 13.5367 15.2113 14.2008 14.7372 14.2008H8.45362C8.35734 14.2008 8.26275 14.1708 8.18884 14.1086C6.83886 12.9718 6.49667 10.2031 6.49667 8.92795C2.04546 7.81638 1.12696 4.26791 0.943262 3.55537C0.759561 2.84282 0.688907 1.95926 1.12696 1.84526C1.56502 1.73125 1.74872 2.11602 2.21504 2.67181C2.68135 3.22759 4.05204 3.29885 5.26729 3.3701Z"
        fill="#895EE5"
      />
    </svg>
  );
};
const WhiteAnonymousSVG = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M11.8889 7.44553H13M11.8889 7.44553L11.5086 4.78318C11.408 4.0794 10.8053 3.55664 10.0943 3.55664H5.90566C5.19473 3.55664 4.59199 4.0794 4.49145 4.78318L4.11111 7.44553M11.8889 7.44553H4.11111M3 7.44553H4.11111"
        stroke="white"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M6.88327 10.6512C6.81847 9.78995 6.09916 9.11133 5.22135 9.11133C4.30088 9.11133 3.55469 9.85752 3.55469 10.778C3.55469 11.6985 4.30088 12.4447 5.22135 12.4447C6.14183 12.4447 6.88802 11.6985 6.88802 10.778C6.88802 10.7353 6.88642 10.693 6.88327 10.6512ZM6.88327 10.6512C7.51623 10.0796 8.48197 10.0795 9.11501 10.651M9.11501 10.651C9.11185 10.6929 9.11024 10.7353 9.11024 10.778C9.11024 11.6985 9.85644 12.4447 10.7769 12.4447C11.6974 12.4447 12.4436 11.6985 12.4436 10.778C12.4436 9.85752 11.6974 9.11133 10.7769 9.11133C9.89918 9.11133 9.17991 9.78983 9.11501 10.651Z"
        stroke="white"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};
const DBSVG = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.6663 8.0026C14.6663 11.6845 11.6816 14.6693 7.99967 14.6693C4.31778 14.6693 1.33301 11.6845 1.33301 8.0026C1.33301 4.32071 4.31778 1.33594 7.99967 1.33594C11.6816 1.33594 14.6663 4.32071 14.6663 8.0026ZM7.21266 6.06319C7.63893 6.5214 7.8537 7.18495 7.8537 8.00965C7.8537 8.83044 7.64245 9.4903 7.2231 9.94589C6.80219 10.4032 6.18896 10.6359 5.4251 10.6359H4.46863C4.03655 10.6359 3.69967 10.2665 3.69967 9.82784V6.17737C3.69967 5.73869 4.03655 5.36927 4.46863 5.36927H5.3853C6.16202 5.36927 6.78503 5.60353 7.21266 6.06319ZM4.80219 9.58758H5.3853C5.85759 9.58758 6.18473 9.45472 6.39718 9.20861C6.61299 8.95861 6.73129 8.56814 6.73129 8.00965C6.73129 7.44005 6.61276 7.04623 6.39704 6.79556C6.18484 6.54898 5.85804 6.41763 5.3853 6.41763H4.80219V9.58758ZM9.10698 10.6359C8.6749 10.6359 8.33802 10.2665 8.33802 9.82784V6.17737C8.33802 5.73869 8.6749 5.36927 9.10698 5.36927H10.1497C10.7688 5.36927 11.2577 5.48163 11.5942 5.73604C11.938 5.99608 12.1007 6.38731 12.1007 6.88993C12.1007 7.20843 12.008 7.47998 11.826 7.68241C11.7481 7.76905 11.656 7.8407 11.5517 7.89731C11.7159 7.96593 11.8577 8.06118 11.973 8.18297C12.1896 8.41199 12.2997 8.72163 12.2997 9.08711C12.2997 9.57711 12.133 9.97245 11.7999 10.2418C11.4714 10.5075 10.9992 10.6359 10.415 10.6359H9.10698ZM9.44054 9.60166H10.4283C10.6869 9.60166 10.8742 9.54507 10.9941 9.45191C11.1087 9.36279 11.1773 9.22821 11.1773 9.03077C11.1773 8.83301 11.1084 8.69414 10.9926 8.60141C10.8724 8.50522 10.6854 8.4458 10.4283 8.4458H9.44054V9.60166ZM9.44054 7.46786H10.1961C10.4705 7.46786 10.668 7.41378 10.7933 7.32511C10.9116 7.24134 10.9782 7.11813 10.9782 6.93922C10.9782 6.74497 10.913 6.6198 10.7995 6.5375C10.6781 6.44951 10.4823 6.3965 10.1961 6.3965H9.44054V7.46786Z"
        fill="#DF74FF"
      />
    </svg>
  );
};
const DSSVG = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.00035 14.6693C11.6822 14.6693 14.667 11.6845 14.667 8.0026C14.667 4.32071 11.6822 1.33594 8.00035 1.33594C4.31845 1.33594 1.33368 4.32071 1.33368 8.0026C1.33368 11.6845 4.31845 14.6693 8.00035 14.6693ZM11.1679 9.15035L11.1679 9.14811C11.1679 8.99358 11.1063 8.87084 10.946 8.75601C10.7769 8.63491 10.5039 8.528 10.0948 8.42387C9.62389 8.3101 9.20156 8.14505 8.89455 7.89982C8.58227 7.65036 8.38981 7.31748 8.38981 6.88524C8.38981 6.41928 8.57827 6.03499 8.90861 5.77005C9.23593 5.50753 9.69242 5.36979 10.2209 5.36979C11.1461 5.36979 11.8341 5.84818 12.1067 6.59341C12.2311 6.93379 11.95 7.22956 11.6362 7.24688C11.3324 7.26366 11.108 7.03177 10.9917 6.81265C10.8505 6.54657 10.5788 6.38172 10.2074 6.38172C9.98726 6.38172 9.81007 6.43901 9.69298 6.52869C9.57933 6.61573 9.51688 6.7364 9.52204 6.88746L9.52213 6.89015C9.52448 7.05915 9.61907 7.17745 9.80116 7.27774C9.98875 7.38105 10.2411 7.44866 10.5092 7.51961L10.5423 7.52837C11.0378 7.64927 11.473 7.82815 11.787 8.08244C12.1052 8.34023 12.3002 8.67759 12.3002 9.10069C12.3002 9.59927 12.0769 9.98871 11.7245 10.2495C11.3758 10.5075 10.9064 10.6365 10.4088 10.6365C9.43156 10.6365 8.66449 10.1598 8.38995 9.35819C8.27051 9.00941 8.56155 8.71557 8.87894 8.69804C9.17917 8.68147 9.40879 8.89896 9.52762 9.12333C9.68794 9.42604 9.98739 9.61776 10.4423 9.61776C10.6862 9.61776 10.8731 9.56931 10.994 9.4886C11.108 9.41253 11.1705 9.30404 11.1679 9.15035ZM10.4089 10.5026C11.2296 10.5026 11.9408 10.1357 12.1223 9.45392C11.941 10.1361 11.2297 10.5031 10.4088 10.5031C9.47545 10.5031 8.76825 10.0513 8.51609 9.31499C8.49315 9.24801 8.49169 9.18224 8.50694 9.12181C8.49183 9.18209 8.49335 9.24768 8.51622 9.31447C8.76838 10.0508 9.47558 10.5026 10.4089 10.5026ZM9.40556 6.72857C9.48065 6.43089 9.79519 6.24838 10.2074 6.24838C10.6222 6.24838 10.9424 6.43543 11.1095 6.75015C11.2164 6.95167 11.4028 7.12623 11.6289 7.11375C11.8068 7.10393 11.9551 6.98512 11.993 6.83191C11.9549 6.98486 11.8067 7.10342 11.629 7.11323C11.4029 7.12571 11.2166 6.95114 11.1096 6.74963C10.9426 6.4349 10.6223 6.24786 10.2076 6.24786C9.79508 6.24786 9.48042 6.43058 9.40556 6.72857ZM8.56447 6.53804C8.53727 6.64666 8.52314 6.76259 8.52314 6.88524C8.52314 7.6576 9.20089 8.07088 10.1269 8.29445C10.9523 8.50448 11.3012 8.74161 11.3012 9.14811C11.3021 9.20188 11.2966 9.25209 11.2851 9.29874C11.2967 9.25195 11.3023 9.20156 11.3014 9.14759C11.3014 8.74109 10.9524 8.50396 10.1271 8.29393C9.20102 8.07035 8.52327 7.65707 8.52327 6.88472C8.52327 6.76227 8.53735 6.64651 8.56447 6.53804ZM7.24883 6.14528C7.68104 6.58713 7.89917 7.22781 7.89917 8.02374C7.89917 8.81589 7.68462 9.45301 7.25939 9.89238C6.83353 10.3324 6.21444 10.5555 5.44404 10.5555H4.31286C3.9733 10.5555 3.70022 10.2779 3.70022 9.93818V6.09575C3.70022 5.75606 3.9733 5.47849 4.31286 5.47849H5.40378C6.18722 5.47849 6.81619 5.70299 7.24883 6.14528ZM4.81239 9.53675H5.40378C5.88382 9.53675 6.21597 9.40803 6.43072 9.17143C6.64778 8.93229 6.76686 8.5591 6.76686 8.02374C6.76686 7.47766 6.64753 7.10127 6.43058 6.86151C6.21608 6.62445 5.88426 6.49719 5.40378 6.49719H4.81239V9.53675ZM5.44417 10.4216C6.64427 10.4216 7.41759 9.86319 7.67291 8.84201C7.41772 9.86352 6.64435 10.4221 5.44404 10.4221H4.31286C4.04814 10.4221 3.83355 10.2055 3.83355 9.93818V6.09575C3.83355 6.05464 3.83863 6.01472 3.84819 5.9766C3.83871 6.01456 3.83368 6.0543 3.83368 6.09523V9.93766C3.83368 10.2049 4.04827 10.4216 4.31299 10.4216H5.44417ZM6.90033 8.02322C6.90033 8.26383 6.87707 8.47774 6.83029 8.66517C6.87699 8.47787 6.9002 8.26413 6.9002 8.02374C6.9002 6.89908 6.41034 6.36385 5.40378 6.36385H4.67919V6.36333H5.40391C6.41047 6.36333 6.90033 6.89856 6.90033 8.02322Z"
        fill="#F65B93"
      />
    </svg>
  );
};
const SniperSVG = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M8 13.5C4.96667 13.5 2.5 11.0333 2.5 8C2.5 4.96667 4.96667 2.5 8 2.5C11.0333 2.5 13.5 4.96667 13.5 8C13.5 11.0333 11.0333 13.5 8 13.5ZM8 3.5C5.52 3.5 3.5 5.52 3.5 8C3.5 10.48 5.52 12.5 8 12.5C10.48 12.5 12.5 10.48 12.5 8C12.5 5.52 10.48 3.5 8 3.5Z"
        fill="#FCFCFD"
      />
      <path
        d="M8 10.5C6.62 10.5 5.5 9.38 5.5 8C5.5 6.62 6.62 5.5 8 5.5C9.38 5.5 10.5 6.62 10.5 8C10.5 9.38 9.38 10.5 8 10.5ZM8 6.5C7.17333 6.5 6.5 7.17333 6.5 8C6.5 8.82667 7.17333 9.5 8 9.5C8.82667 9.5 9.5 8.82667 9.5 8C9.5 7.17333 8.82667 6.5 8 6.5Z"
        fill="#FCFCFD"
      />
      <path
        d="M8 3.16665C7.72667 3.16665 7.5 2.93998 7.5 2.66665V1.33331C7.5 1.05998 7.72667 0.833313 8 0.833313C8.27333 0.833313 8.5 1.05998 8.5 1.33331V2.66665C8.5 2.93998 8.27333 3.16665 8 3.16665Z"
        fill="#FCFCFD"
      />
      <path
        d="M2.66665 8.5H1.33331C1.05998 8.5 0.833313 8.27333 0.833313 8C0.833313 7.72667 1.05998 7.5 1.33331 7.5H2.66665C2.93998 7.5 3.16665 7.72667 3.16665 8C3.16665 8.27333 2.93998 8.5 2.66665 8.5Z"
        fill="#FCFCFD"
      />
      <path
        d="M8 15.1666C7.72667 15.1666 7.5 14.94 7.5 14.6666V13.3333C7.5 13.06 7.72667 12.8333 8 12.8333C8.27333 12.8333 8.5 13.06 8.5 13.3333V14.6666C8.5 14.94 8.27333 15.1666 8 15.1666Z"
        fill="#FCFCFD"
      />
      <path
        d="M14.6666 8.5H13.3333C13.06 8.5 12.8333 8.27333 12.8333 8C12.8333 7.72667 13.06 7.5 13.3333 7.5H14.6666C14.94 7.5 15.1666 7.72667 15.1666 8C15.1666 8.27333 14.94 8.5 14.6666 8.5Z"
        fill="#FCFCFD"
      />
    </svg>
  );
};

const AddressWithEmojis = ({
  address,
  fullAddress,
  // href,
  emojis,
  color = "primary",
  isFirst = false,
  buy,
  walletDefault,
  isWithOverview = false,
  trackedWalletIcon,
  freshWalletFundedInfo,
  className,
  onOpenChange,
  isWithLink,
  stripClassname,
  isUserWallet = false,
}: {
  address: string;
  fullAddress?: string;
  // href: string;
  buy?: boolean;
  isFirst?: boolean;
  walletDefault?: boolean;
  emojis?: string[];
  color?: "primary" | "success" | "destructive";
  isWithOverview?: boolean;
  trackedWalletIcon?: string;
  freshWalletFundedInfo?: {
    wallet: string;
    fundedAmount: string;
    fundedBy: string;
    timestamp: number;
  };
  className?: string;
  onOpenChange?: (isOpen: boolean) => void;
  isWithLink?: boolean;
  stripClassname?: string;
  isUserWallet?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(isOpen);
    }
  }, [isOpen]);

  return (
    <div className="flex w-fit items-center gap-x-1">
      {emojis &&
        emojis.length > 0 &&
        !trackedWalletIcon &&
        !isUserWallet &&
        emojis.map((emoji, index) => {
          const widthHeight = "h-4 w-4";

          return (
            <div
              key={index}
              className={cn("relative aspect-auto flex-shrink-0", widthHeight)}
            >
              {["fish.svg", "dolphin.svg", "whale.svg"].includes(emoji) ? (
                <TooltipProvider>
                  <Tooltip
                    delayDuration={0}
                    open={isOpen}
                    onOpenChange={setIsOpen}
                  >
                    <WalletTooltipContent
                      address={fullAddress as string}
                      isWithOverview={isWithOverview}
                      isOpen={isOpen}
                    >
                      <TooltipTrigger asChild>
                        <div className="relative">
                          {emoji === "fish.svg" && <FishIconSVG />}
                          {emoji === "dolphin.svg" && <DolphinIconSVG />}
                          {emoji === "whale.svg" && <WhaleIconSVG />}
                        </div>
                      </TooltipTrigger>
                    </WalletTooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <>
                  {emoji === "white-anonymous.svg" && <WhiteAnonymousSVG />}
                  {emoji === "db.svg" && <DBSVG />}
                  {emoji === "ds.svg" && <DSSVG />}
                  {emoji === "sniper.svg" && <SniperSVG />}
                </>
              )}
            </div>
          );
        })}

      {freshWalletFundedInfo && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative size-4">
                <Image
                  fill
                  src="/icons/token/fresh-wallet.svg"
                  alt="Fresh Wallet"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent
              isWithAnimation={false}
              side="top"
              className="bg-[#202037] px-2"
            >
              <div className="flex items-center gap-x-1">
                Fresh Wallet Funded by:{" "}
                <div className="flex items-center gap-x-1">
                  <div className="relative size-4">
                    <Image
                      fill
                      src={`/icons/token/fresh-wallets/${getFundedBy(freshWalletFundedInfo.fundedBy).toLowerCase().replaceAll(" ", "-")}.svg`}
                      alt="Exchange Icon"
                    />
                  </div>
                  {getFundedBy(freshWalletFundedInfo.fundedBy)}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {trackedWalletIcon && (
        <span className="text-sm">{trackedWalletIcon}</span>
      )}

      <WalletAddress
        address={address}
        fullAddress={fullAddress as string}
        href={
          isWithLink ? `https://solscan.io/account/${fullAddress}` : undefined
        }
        className={cn(
          "relative flex w-fit items-center justify-center text-nowrap font-geistSemiBold text-xs",
          isFirst || isUserWallet
            ? "text-[#66B0FF]"
            : buy
              ? "text-success"
              : walletDefault
                ? "text-primary"
                : "text-destructive",
          trackedWalletIcon && "text-warning",
          className,
        )}
        classNameSpan={cn(
          "absolute bottom-[-2px] w-full border-b border-dashed",
          stripClassname,
          isFirst || isUserWallet
            ? "border-[#66B0FF]"
            : buy
              ? "border-success"
              : walletDefault
                ? "border-primary"
                : "border-destructive",
          trackedWalletIcon && "border-warning",
        )}
      />
    </div>
  );
};

export default React.memo(AddressWithEmojis);
