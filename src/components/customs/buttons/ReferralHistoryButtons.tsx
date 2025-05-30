"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState } from "react";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMutation } from "@tanstack/react-query";
import { claimReferral } from "@/apis/rest/referral";
import { useReferralStore } from "@/stores/use-referral.store";
import { toast } from "sonner";

interface ReferralHistoryButtonsProps {
  historyId: string;
  status: "processing" | "available" | "claimed";
  transactionUrl?: string;
}

export default function ReferralHistoryButtons({
  historyId,
  status,
  transactionUrl,
}: ReferralHistoryButtonsProps) {
  const { setClaimedTransaction } = useReferralStore();

  const { mutate: claimReward, isPending } = useMutation({
    mutationFn: claimReferral,
    onSuccess: (data) => {
      setClaimedTransaction(historyId, data.transaction_url);
      toast.success("Successfully claimed referral reward");
    },
    onError: () => {
      toast.error("Failed to claim referral reward");
    },
  });

  // Handle coin view for claimed transactions
  const handleCoin = () => {
    if (transactionUrl) {
      window.open(transactionUrl, "_blank");
    }
  };

  if (status === "claimed") {
    return (
      <>
        <div className="relative flex h-[32px] w-auto flex-shrink-0 items-center justify-center gap-x-1.5 overflow-hidden rounded-[8px] bg-white/[4%] pl-2 pr-3">
          <div className="relative z-30 aspect-square h-4 w-4 flex-shrink-0">
            <Image
              src="/icons/claimed.png"
              alt="Claimed Icon"
              fill
              quality={100}
              className="object-contain opacity-[12%]"
            />
          </div>
          <span className="relative z-30 font-geistSemiBold text-sm text-fontColorPrimary/[12%]">
            Claimed
          </span>
        </div>

        {transactionUrl && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleCoin}
                  className="group relative flex h-[32px] w-[32px] items-center justify-center rounded-[8px] bg-white/[6%]"
                >
                  <div className="relative z-30 aspect-square h-4 w-4 flex-shrink-0">
                    <Image
                      src="/icons/token/actions/coin.png"
                      alt="Coin Icon"
                      fill
                      quality={100}
                      className="object-contain"
                    />
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="px-2 py-1">
                <span className="inline-block text-nowrap text-xs text-fontColorSecondary">
                  View Transaction
                </span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </>
    );
  }

  if (status === "processing" || isPending) {
    return (
      <div className="relative flex h-[32px] w-auto flex-shrink-0 items-center justify-center gap-x-1.5 overflow-hidden rounded-[8px] bg-white/[4%] pl-2 pr-3">
        <div className="relative z-30 aspect-square h-4 w-4 flex-shrink-0 animate-pulse">
          <Image
            src="/icons/gray-clock.png"
            alt="On Process Icon"
            fill
            quality={100}
            className="object-contain opacity-[12%]"
          />
        </div>
        <span className="relative z-30 animate-pulse font-geistSemiBold text-sm text-fontColorPrimary/[12%]">
          {isPending ? "Claiming..." : "On Process"}
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={() => claimReward(historyId)}
      disabled={isPending}
      className="group relative flex h-[32px] flex-shrink-0 items-center justify-center gap-x-2 rounded-[8px] bg-primary px-[10px] py-1.5 duration-300 hover:bg-primary-hover"
    >
      <span className="inline-block font-geistSemiBold text-xs text-[#080811]">
        Claim
      </span>
    </button>
  );
}
