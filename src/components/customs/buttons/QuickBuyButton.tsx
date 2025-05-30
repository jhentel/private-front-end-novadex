// @ts-nocheck

"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useState, useRef, useEffect } from "react";
import { useQuickAmountStore } from "@/stores/dex-setting/use-quick-amount.store";
import toast from "react-hot-toast";
import { submitQuickBuy } from "@/apis/rest/transaction/quick-buy";
import { useMutation } from "@tanstack/react-query";
import * as Sentry from "@sentry/nextjs";
// import { useWallet } from "@solana/wallet-adapter-react";
// ######## Components 🧩 ########
import Image from "next/image";
import CustomToast from "@/components/customs/toasts/CustomToast";
import { RiLoader3Line } from "react-icons/ri";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { useUserWalletStore } from "@/stores/wallet/use-user-wallet.store";
import { submitTransaction } from "@/apis/rest/transaction/submit-transaction";
import { useActivePresetStore } from "@/stores/dex-setting/use-active-preset.store";
import { useQuickBuySettingsStore } from "@/stores/setting/use-quick-buy-settings.store";
import {
  convertNumberToPresetKey,
  convertPresetIdToKey,
  convertPresetKeyToId,
  convertPresetKeyToNumber,
} from "@/utils/convertPreset";
import { useWalletTrackerStore } from "@/stores/footer/use-wallet-tracker";
import { cn } from "@/libraries/utils";
import { Wallet } from "@/apis/rest/wallet-manager";
import { CachedImage } from "../CachedImage";
import { useFeeTip } from "@/stores/setting/use-fee-tip.store";

type QuickBuyButtonProps = {
  variant?:
    | "cosmo"
    | "marquee"
    | "trending"
    | "footer-wallet-tracker"
    | "twitter-monitor-small"
    | "twitter-monitor-large"
    | "holdings"
    | "global-search"
    | "discord";
  mintAddress?: string;
  className?: string | undefined;
};

export default React.memo(function QuickBuyButton({
  variant = "cosmo",
  mintAddress,
  className,
}: QuickBuyButtonProps) {
  const cosmoQuickBuyAmount = useQuickAmountStore(
    (state) => state.cosmoQuickBuyAmount,
  );
  const cosmoWallets = useQuickAmountStore((state) => state.cosmoWallets);
  const cosmoActivePreset = useActivePresetStore(
    (state) => state.cosmoActivePreset,
  );
  const wallets = useUserWalletStore(
    (state) => state.selectedMultipleActiveWallet,
  );

  const presetData = useQuickBuySettingsStore((state) => state.presets);
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [transactionStatus, setTransactionStatus] = useState<
    "SUCCESS" | "FAILED" | null
  >(null);

  const [currentTXInfoString, setCurrentTXInfoString] = useState<string>("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoFeeEnabled = useQuickBuySettingsStore(
    (state) => state.presets.autoFeeEnabled,
  );
  const feetipData = useFeeTip((state) => state.data);
  const submitTransactionMutation = useMutation({
    mutationFn: submitTransaction,
    onMutate: (data) => {
      setCurrentTXInfoString(JSON.stringify(data));
    },
    onSuccess: () => {
      setTransactionStatus("SUCCESS");
      setCurrentTXInfoString("");
    },
    onError: (error: Error) => {
      Sentry.captureMessage(
        `Submit TX Error 🔴 - (Quick Buy Button): ${String(error?.message)} | TX: ${currentTXInfoString}`,
        "error",
      );
      setCurrentTXInfoString("");
      setTransactionStatus("FAILED");
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message={error.message || "Transaction failed"}
          state="ERROR"
        />
      ));
    },
    onSettled: () => {
      setShowMessage(true);
      timeoutRef.current = setTimeout(() => setShowMessage(false), 1500);
    },
  });

  const handleQuickBuy = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!mintAddress) {
      // console.log(mintAddress);
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message="Invalid token"
          state="ERROR"
        />
      ));
      return;
    }

    const presetKey = cosmoActivePreset;

    const is_twitter =
      variant === "twitter-monitor-small" ||
      variant === "twitter-monitor-large" ||
      variant === "footer-wallet-tracker" ||
      variant === "holdings" ||
      variant === "marquee" ||
      variant === "discord";

    submitTransactionMutation.mutate({
      mint: mintAddress,
      preset: convertPresetKeyToNumber(presetKey),
      wallets: (cosmoWallets ?? wallets).map((wallet) => ({
        address: wallet.address,
        amount: parseFloat(
          cosmoQuickBuyAmount.toFixed(9).replace(/\.?0+$/, "") /
            ((cosmoWallets ?? wallets).length ?? 1),
        ),
      })),
      amount: parseFloat(cosmoQuickBuyAmount.toFixed(9).replace(/\.?0+$/, "")),
      auto_tip:
        typeof presetData[presetKey]?.autoTipEnabled == "undefined"
          ? true
          : presetData[presetKey]?.autoTipEnabled,
      fee: presetData[presetKey]?.fee,
      slippage: presetData[presetKey]?.slippage,
      // tip: presetData[presetKey]?.tip,
      tip: (autoFeeEnabled
        ? feetipData.tip
        : presetData[presetKey]?.tip) as number,
      mev_protect: false,
      type: "buy",
      module: "Quick Buy",
      is_fetch: is_twitter,
      ...(autoFeeEnabled ? { fee: feetipData.fee } : {}),
    });
  };

  const formattedAmount = cosmoQuickBuyAmount.toFixed(9).replace(/\.?0+$/, "");

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  return (
    <>
      {(variant === "cosmo" ||
        variant === "marquee" ||
        variant === "discord") && (
        <button
          onClick={handleQuickBuy}
          disabled={submitTransactionMutation.isPending}
          className={cn(
            "flex h-[26px] w-fit items-center justify-center gap-x-1 overflow-hidden rounded-[40px] bg-[#2B2B3B] pl-2.5 pr-3 transition-colors duration-300 hover:bg-white/[12%] disabled:opacity-50",
            // "relative -bottom-6 flex h-[26px] w-fit min-w-[82px] items-center justify-center gap-x-1 overflow-hidden rounded-[40px] bg-[#2B2B3B] pl-2.5 pr-3 duration-300 hover:bg-white/[12%] disabled:opacity-50 min-[490px]:bottom-0 xl:-bottom-6 min-[1490px]:bottom-0",
            variant === "marquee" && "bottom-0 xl:bottom-0",
            className,
          )}
        >
          {submitTransactionMutation.isPending ? (
            <RiLoader3Line className="animate-spin text-lg text-fontColorPrimary" />
          ) : showMessage ? (
            transactionStatus === "SUCCESS" ? (
              <FaCheckCircle className="text-base text-success" />
            ) : (
              <FaExclamationCircle className="text-base text-destructive" />
            )
          ) : (
            <>
              <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                <CachedImage
                  src="/icons/quickbuy.svg"
                  alt="Quickbuy Icon"
                  fill
                  quality={50}
                  className="object-contain"
                />
              </div>
              <div className="relative block aspect-auto h-4 w-4 flex-shrink-0">
                <CachedImage
                  src="/icons/solana-sq.svg"
                  alt="Solana SQ Icon"
                  fill
                  quality={50}
                  className="object-contain"
                />
              </div>
              <span className="block truncate font-geistSemiBold text-sm text-fontColorPrimary">
                {formattedAmount}
              </span>
            </>
          )}
        </button>
      )}

      {["trending", "footer-wallet-tracker"].includes(variant) && (
        <button
          onClick={handleQuickBuy}
          disabled={submitTransactionMutation.isPending}
          className={cn(
            "relative flex h-[26px] w-fit items-center justify-center gap-x-1 overflow-hidden rounded-[40px] bg-[#2B2B3B] pl-[10px] pr-[13px] transition-colors duration-300 hover:bg-white/[12%] disabled:opacity-50",
            className,
          )}
        >
          {submitTransactionMutation.isPending ? (
            <RiLoader3Line className="animate-spin text-lg text-fontColorPrimary" />
          ) : showMessage ? (
            transactionStatus === "SUCCESS" ? (
              <FaCheckCircle className="text-base text-success" />
            ) : (
              <FaExclamationCircle className="text-base text-destructive" />
            )
          ) : (
            <>
              <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                <CachedImage
                  src="/icons/quickbuy.svg"
                  alt="Quickbuy Icon"
                  fill
                  quality={50}
                  className="object-contain"
                />
              </div>
              <div className="relative block aspect-auto h-4 w-4 flex-shrink-0">
                <CachedImage
                  src="/icons/solana-sq.svg"
                  alt="Solana SQ Icon"
                  fill
                  quality={50}
                  className="object-contain"
                />
              </div>
              <span className="font-geistSemiBold text-[12.5px] text-fontColorPrimary">
                {formattedAmount}
              </span>
            </>
          )}
        </button>
      )}

      {variant === "twitter-monitor-small" && (
        <button
          onClick={handleQuickBuy}
          disabled={submitTransactionMutation.isPending}
          className={cn(
            "gb__white__btn relative flex h-[32px] w-[32px] items-center justify-center gap-x-1 overflow-hidden rounded-[8px] bg-white/[4%] transition-colors duration-300 hover:bg-white/[8%]",
            className,
          )}
        >
          {submitTransactionMutation.isPending ? (
            <RiLoader3Line className="animate-spin text-base text-fontColorPrimary" />
          ) : showMessage ? (
            transactionStatus === "SUCCESS" ? (
              <FaCheckCircle className="text-sm text-success" />
            ) : (
              <FaExclamationCircle className="text-sm text-destructive" />
            )
          ) : (
            <div className="relative z-30 aspect-square h-4 w-4 flex-shrink-0">
              <Image
                src="/icons/quickbuy.png"
                alt="Quick Buy Icon"
                fill
                quality={50}
                className="object-contain"
              />
            </div>
          )}
        </button>
      )}
      {variant === "twitter-monitor-large" && (
        <button
          onClick={handleQuickBuy}
          disabled={submitTransactionMutation.isPending}
          className={cn(
            "gb__white__btn relative flex h-10 w-10 items-center justify-center gap-x-1 overflow-hidden rounded-[10px] bg-white/[4%] transition-colors duration-300 hover:bg-white/[8%]",
            className,
          )}
        >
          {submitTransactionMutation.isPending ? (
            <RiLoader3Line className="animate-spin text-xl text-fontColorPrimary" />
          ) : showMessage ? (
            transactionStatus === "SUCCESS" ? (
              <FaCheckCircle className="text-lg text-success" />
            ) : (
              <FaExclamationCircle className="text-lg text-destructive" />
            )
          ) : (
            <div className="relative z-30 aspect-square h-5 w-5 flex-shrink-0">
              <Image
                src="/icons/quickbuy.png"
                alt="Quick Buy Icon"
                fill
                quality={50}
                className="object-contain"
              />
            </div>
          )}
        </button>
      )}
      {variant === "holdings" && (
        <button
          onClick={handleQuickBuy}
          disabled={submitTransactionMutation.isPending}
          className={cn(
            "gb__white__btn relative flex h-[32px] w-[32px] items-center justify-center gap-x-1 overflow-hidden rounded-[8px] bg-white/[4%] transition-colors duration-300 hover:bg-white/[8%]",
            className,
          )}
        >
          {submitTransactionMutation.isPending ? (
            <RiLoader3Line className="animate-spin text-base text-fontColorPrimary" />
          ) : showMessage ? (
            transactionStatus === "SUCCESS" ? (
              <FaCheckCircle className="text-sm text-success" />
            ) : (
              <FaExclamationCircle className="text-sm text-destructive" />
            )
          ) : (
            <div className="relative z-30 aspect-square h-4 w-4 flex-shrink-0">
              <Image
                src="/icons/quickbuy.png"
                alt="Quick Buy Icon"
                fill
                quality={50}
                className="object-contain"
              />
            </div>
          )}
        </button>
      )}

      {variant === "global-search" && (
        <button
          onClick={handleQuickBuy}
          disabled={submitTransactionMutation.isPending}
          className={cn(
            "relative flex h-[30px] w-fit min-w-[82px] items-center justify-center gap-x-1 overflow-hidden rounded-[40px] bg-[#2B2B3B] pl-2.5 pr-3 transition-colors duration-300 hover:bg-white/[12%] disabled:opacity-50",
            className,
          )}
        >
          {submitTransactionMutation.isPending ? (
            <RiLoader3Line className="animate-spin text-lg text-fontColorPrimary" />
          ) : showMessage ? (
            transactionStatus === "SUCCESS" ? (
              <FaCheckCircle className="text-base text-success" />
            ) : (
              <FaExclamationCircle className="text-base text-destructive" />
            )
          ) : (
            <>
              <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                <CachedImage
                  src="/icons/quickbuy.svg"
                  alt="Quickbuy Icon"
                  fill
                  quality={50}
                  className="object-contain"
                />
              </div>
              <div className="relative block aspect-auto h-4 w-4 flex-shrink-0">
                <CachedImage
                  src="/icons/solana-sq.svg"
                  alt="Solana SQ Icon"
                  fill
                  quality={50}
                  className="object-contain"
                />
              </div>
              <span className="block font-geistSemiBold text-sm text-fontColorPrimary">
                {formattedAmount}
              </span>
            </>
          )}
        </button>
      )}
    </>
  );
});
