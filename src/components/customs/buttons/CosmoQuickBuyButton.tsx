// @ts-nocheck

"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useQuickAmountStore } from "@/stores/dex-setting/use-quick-amount.store";
import toast from "react-hot-toast";
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
  convertPresetIdToKey,
  convertPresetKeyToId,
  convertPresetKeyToNumber,
} from "@/utils/convertPreset";
import { cn } from "@/libraries/utils";
import { useCustomizeSettingsStore } from "@/stores/setting/use-customize-settings.store";
import { quickBuyButtonStyles } from "../setting/CustomizedBuyButtonSettings";
import { CachedImage } from "../CachedImage";
import { useFeeTip } from "@/stores/setting/use-fee-tip.store";

type QuickBuyButtonProps = {
  mintAddress?: string;
  className?: string | undefined;
  amount?: number;
};

export default function CosmoQuickBuyButton({
  mintAddress,
  className,
  amount,
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
  const {
    presets: customizedSettingPresets,
    activePreset: customizedSettingActivePreset,
  } = useCustomizeSettingsStore();
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [transactionStatus, setTransactionStatus] = useState<
    "SUCCESS" | "FAILED" | null
  >(null);
  const currentButtonPreset =
    customizedSettingPresets[customizedSettingActivePreset].buttonSetting ||
    "normal";
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  // Memoize the buy amount calculation
  const buyAmount = useMemo(
    () => amount ?? cosmoQuickBuyAmount,
    [amount, cosmoQuickBuyAmount],
  );

  // Memoize the formatted amount
  const formattedAmount = useMemo(
    () => buyAmount.toFixed(9).replace(/\.?0+$/, ""),
    [buyAmount],
  );

  // Memoize the button style
  const quickBuyButtonStyle = useMemo(() => {
    return isLargeScreen
      ? quickBuyButtonStyles[currentButtonPreset].large
      : quickBuyButtonStyles[currentButtonPreset].default;
  }, [isLargeScreen, currentButtonPreset]);

  const [currentTXInfoString, setCurrentTXInfoString] = useState<string>("");

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
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
        `Submit TX Error 🔴 - (Cosmo Quick Buy Button): ${String(error?.message)} | TX: ${currentTXInfoString}`,
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

  const autoFeeEnabled = useQuickBuySettingsStore(
    (state) => state.presets.autoFeeEnabled,
  );
  const feetipData = useFeeTip((state) => state.data);

  // Memoize the handleQuickBuy function
  const handleQuickBuy = useCallback(
    async (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (!mintAddress) {
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
      submitTransactionMutation.mutate({
        mint: mintAddress,
        preset: convertPresetKeyToNumber(presetKey),
        wallets: (cosmoWallets ?? wallets).map((wallet) => ({
          address: wallet?.address,
          amount:
            parseFloat(buyAmount.toFixed(9).replace(/\.?0+$/, "")) /
            ((cosmoWallets ?? wallets).length ?? 1),
        })),
        amount: parseFloat(buyAmount.toFixed(9).replace(/\.?0+$/, "")),
        auto_tip:
          typeof presetData[presetKey]?.autoTipEnabled == "undefined"
            ? true
            : presetData[presetKey]?.autoTipEnabled,
        fee: presetData[presetKey]?.fee,
        slippage: presetData[presetKey]?.slippage,
        tip: autoFeeEnabled ? feetipData.tip : presetData[presetKey]?.tip,
        mev_protect: false,
        type: "buy",
        module: "Quick Buy",
        ...(autoFeeEnabled ? { fee: feetipData.fee } : {}),
      });
    },
    [
      mintAddress,
      cosmoActivePreset,
      cosmoWallets,
      wallets,
      buyAmount,
      presetData,
      autoFeeEnabled,
      feetipData,
      submitTransactionMutation,
    ],
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1600px)");

    // Set initial value
    setIsLargeScreen(mediaQuery.matches);

    // Add listener for changes
    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsLargeScreen(e.matches);
    };

    // Modern browsers use addEventListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleMediaChange);
      return () => mediaQuery.removeEventListener("change", handleMediaChange);
    }
    // Older browsers use addListener (deprecated)
    else {
      mediaQuery.addListener(handleMediaChange);
      return () => mediaQuery.removeListener(handleMediaChange);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  // Memoize the button content
  const buttonContent = useMemo(() => {
    if (submitTransactionMutation.isPending) {
      return (
        <RiLoader3Line className="animate-spin text-lg text-fontColorPrimary" />
      );
    }
    if (showMessage) {
      return transactionStatus === "SUCCESS" ? (
        <FaCheckCircle className="text-base text-success" />
      ) : (
        <FaExclamationCircle className="text-base text-destructive" />
      );
    }
    return (
      <>
        <CachedImage
          src="/icons/quickbuy.svg"
          alt="Quickbuy Icon"
          height={16}
          width={16}
          quality={50}
          className="relative flex-shrink-0 object-contain"
        />
        <CachedImage
          src="/icons/solana-sq.svg"
          alt="Solana SQ Icon"
          height={16}
          width={16}
          quality={50}
          className="relative block flex-shrink-0 object-contain"
        />
        {formattedAmount}
      </>
    );
  }, [
    submitTransactionMutation.isPending,
    showMessage,
    transactionStatus,
    formattedAmount,
  ]);

  return (
    <>
      <button
        onClick={handleQuickBuy}
        disabled={submitTransactionMutation.isPending}
        className={cn(
          "z-[60] flex h-[26px] w-fit min-w-[82px] items-center justify-center gap-x-1 overflow-hidden rounded-[40px] bg-[#2B2B3B] font-geistSemiBold text-sm text-fontColorPrimary transition-colors duration-300 hover:bg-white/[12%] disabled:opacity-50",
          className,
        )}
        style={quickBuyButtonStyle}
      >
        {buttonContent}
      </button>
    </>
  );
}
