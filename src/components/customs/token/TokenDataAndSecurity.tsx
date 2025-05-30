"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, {
  Fragment,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
// ######## Components 🧩 ########
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Separator from "@/components/customs/Separator";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { useTokenMessageStore } from "@/stores/token/use-token-messages.store";
import { truncateAddress } from "@/utils/truncateAddress";
import { DataSecurityInfo } from "@/types/ws-general";
import BaseButton from "../buttons/BaseButton";
import { CachedImage } from "../CachedImage";
import { usePopupStore } from "@/stores/use-popup-state";

// Define interface for props
interface TokenDataAndSecurityProps {
  initTokenSecurityData: DataSecurityInfo | null;
  closeDrawer?: () => void;
}

const formatPercentage = (value: number) => {
  const percentage = value.toFixed(1);
  return `${percentage}%`;
};

const formatTimeStamp = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const baseClassNameValue =
  "inline-block text-nowrap font-geistSemiBold text-sm";

const handleDeployerClick = (deployer?: string) => {
  if (deployer) {
    window.open(
      `https://solscan.io/account/${deployer}`,
      "_blank",
      "noopener,noreferrer",
    );
  }
};

export const TokenDataAndSecurityContent = React.memo(
  ({
    tokenSecurityData,
    closeDrawer,
  }: {
    tokenSecurityData: DataSecurityInfo | null;
    closeDrawer?: () => void;
  }) => {
    const data = useMemo(
      () => [
        {
          label: "Mint Authority",
          tooltipContent: "Ability to mint new tokens",
          value: (
            <span
              className={cn(
                baseClassNameValue,
                tokenSecurityData?.mint_disabled
                  ? "text-success"
                  : "text-destructive",
              )}
            >
              {tokenSecurityData?.mint_disabled ? "Disabled" : "Enabled"}
            </span>
          ),
        },
        {
          label: "Freeze Authority",
          tooltipContent: "Ability to freeze token accounts",
          value: (
            <span
              className={cn(
                baseClassNameValue,
                tokenSecurityData?.freeze_disabled
                  ? "text-success"
                  : "text-destructive",
              )}
            >
              {tokenSecurityData?.freeze_disabled ? "Disabled" : "Enabled"}
            </span>
          ),
        },
        {
          label: "Deployer",
          tooltipContent: "Address of the token deployer",
          value: (
            <span
              onClick={() => handleDeployerClick(tokenSecurityData?.deployer)}
              className={cn(
                baseClassNameValue,
                "cursor-pointer border-b border-dashed border-warning text-warning",
              )}
            >
              {tokenSecurityData?.deployer
                ? truncateAddress(tokenSecurityData.deployer)
                : "Unknown"}
            </span>
          ),
        },
        {
          label: "LP Burned",
          tooltipContent:
            "Percentage of the Liquidity Pool which has been burnt",
          value: (
            <span
              className={cn(
                baseClassNameValue,
                tokenSecurityData?.burned ? "text-success" : "text-destructive",
              )}
            >
              {tokenSecurityData?.burned ? "Yes" : "No"}
            </span>
          ),
        },
        {
          label: "Open Trading",
          tooltipContent: "Time and date the token was made",
          value: (
            <span
              suppressHydrationWarning
              className={cn(baseClassNameValue, "text-fontColorPrimary")}
            >
              {tokenSecurityData?.open_trading
                ? formatTimeStamp(tokenSecurityData.open_trading)
                : "Unknown"}
            </span>
          ),
        },
        {
          label: "Bundled %",
          tooltipContent: "Percentage of the token that was bundled",
          value: (
            <span
              className={cn(
                baseClassNameValue,
                (tokenSecurityData?.bundled_percentage ?? 0) > 0
                  ? "text-destructive"
                  : "text-success",
              )}
            >
              {tokenSecurityData?.bundled_percentage
                ? formatPercentage(tokenSecurityData.bundled_percentage)
                : "0%"}
            </span>
          ),
        },
        {
          label: "Snipers",
          tooltipContent: "Number of wallets which sniped the coin",
          value: (
            <span className={cn(baseClassNameValue, "text-fontColorPrimary")}>
              {tokenSecurityData?.snipers || 0}
            </span>
          ),
        },
        {
          label: "Sniper Holding",
          tooltipContent: "Percentage of supply held by snipers",
          value: (
            <span className={cn(baseClassNameValue, "text-destructive")}>
              {tokenSecurityData?.sniper_holding
                ? formatPercentage(tokenSecurityData.sniper_holding)
                : "0%"}
            </span>
          ),
        },
        {
          label: "Dev Holding",
          tooltipContent: "Percentage of supply held by the deployer",
          value: (
            <span className={cn(baseClassNameValue, "text-destructive")}>
              {tokenSecurityData?.dev_holding
                ? formatPercentage(tokenSecurityData.dev_holding)
                : "0%"}
            </span>
          ),
        },
        {
          label: "Insider Holding",
          tooltipContent: "Percentage of supply held by insiders",
          value: (
            <span className={cn(baseClassNameValue, "text-destructive")}>
              {tokenSecurityData?.insider_holding
                ? formatPercentage(tokenSecurityData.insider_holding)
                : "0%"}
            </span>
          ),
        },
        {
          label: "Top 10 holders",
          tooltipContent: "Percentage of supply held by the top 10 holders",
          value: (
            <span className={cn(baseClassNameValue, "text-destructive")}>
              {tokenSecurityData?.top10_holding
                ? formatPercentage(tokenSecurityData.top10_holding)
                : "0%"}
            </span>
          ),
        },
      ],
      [
        tokenSecurityData,
        baseClassNameValue,
        formatTimeStamp,
        formatPercentage,
        handleDeployerClick,
      ],
    );

    return (
      <div className="flex w-full flex-col">
        <div className="flex flex-col px-4">
          {data?.map((item, index) => (
            <Fragment key={item.label}>
              <div className="flex h-[42px] w-full items-center justify-between py-3 md:h-[34px]">
                <div className="flex items-center gap-x-1">
                  <span className="inline-block text-nowrap text-sm text-fontColorSecondary">
                    {item.label}
                  </span>
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
                        <p>{item.tooltipContent}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                {item.value}
              </div>
              {index !== data.length - 1 && (
                <Separator color="#202037" orientation="horizontal" />
              )}
            </Fragment>
          ))}
        </div>
        <div className="mt-2 flex h-[72px] w-full items-center justify-center border-t border-border px-4 md:hidden">
          <BaseButton
            className="w-full font-geistSemiBold text-base"
            onClick={closeDrawer}
          >
            Close
          </BaseButton>
        </div>
      </div>
    );
  },
);
TokenDataAndSecurityContent.displayName = "TokenDataAndSecurityContent";

const TokenDataAndSecurity: React.FC<TokenDataAndSecurityProps> = React.memo(
  ({ initTokenSecurityData, closeDrawer }) => {
    const [open, setOpen] = useState<boolean>(true);
    const tokenSecurityData = useTokenMessageStore(
      (state) => state.dataSecurityMessage,
    );
    const { remainingScreenWidth } = usePopupStore();

    const finalTokenSecurityData = useMemo(
      () =>
        (tokenSecurityData?.deployer
          ? tokenSecurityData
          : initTokenSecurityData) as DataSecurityInfo,
      [tokenSecurityData, initTokenSecurityData],
    );

    const calculateIssues = useMemo(() => {
      let issues = 0;

      if (finalTokenSecurityData) {
        if (finalTokenSecurityData.top10_holding > 15) issues++;
        if (finalTokenSecurityData.insider_holding > 5) issues++;
        if (finalTokenSecurityData.dev_holding > 75) issues++;
        if (finalTokenSecurityData.sniper_holding > 5) issues++;
        if (!finalTokenSecurityData.mint_disabled) issues++;
        if (!finalTokenSecurityData.freeze_disabled) issues++;
        if (!finalTokenSecurityData.burned) issues++;
        if ((finalTokenSecurityData.bundled_percentage ?? 0) > 0) issues++;
        if (finalTokenSecurityData.snipers > 0) issues++;
      }

      return issues;
    }, [finalTokenSecurityData]);

    const handleToggle = useCallback(() => {
      setOpen((prev) => !prev);
    }, []);

    return (
      <motion.div
        animate={open ? "open" : "closed"}
        className={cn(
          "hidden h-auto w-full rounded-[8px] border border-border md:inline-block",
          !open && "rounded-b-[8px]",
          remainingScreenWidth <= 768 && "md:hidden",
        )}
      >
        <div
          onClick={handleToggle}
          className={cn(
            "group relative flex h-[56px] w-full cursor-pointer items-center justify-between rounded-t-[8px] border-b border-border bg-white/[4%] px-4",
            !open && "rounded-b-[8px] border-transparent",
          )}
        >
          <span className="relative z-20 inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
            Data & Security
          </span>

          <div className="relative z-20 flex items-center gap-x-2">
            <div className="flex h-[20px] items-center gap-x-0.5 rounded-[4px] bg-destructive/10 pl-1 pr-1.5">
              <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                <Image
                  src="/icons/issues.png"
                  alt="Issues Icon"
                  fill
                  quality={50}
                  className="object-contain"
                />
              </div>
              <span className="inline-block font-geistSemiBold text-xs text-destructive">
                {calculateIssues} {calculateIssues === 1 ? "Issue" : "Issues"}
              </span>
            </div>
            <div className="relative aspect-square h-6 w-6 flex-shrink-0 cursor-pointer">
              <Image
                src="/icons/pink-chevron-down.png"
                alt="Pink Accordion Icon"
                fill
                quality={50}
                className={`object-contain transition-transform duration-300 ${
                  open ? "rotate-180" : "rotate-0"
                }`}
              />
            </div>
          </div>

          <div className="absolute right-0 top-0 z-10 aspect-[352/112] h-[56px] flex-shrink-0 mix-blend-overlay"></div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <TokenDataAndSecurityContent
                closeDrawer={closeDrawer}
                tokenSecurityData={finalTokenSecurityData}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  },
);
TokenDataAndSecurity.displayName = "TokenDataAndSecurity";
export default TokenDataAndSecurity;
