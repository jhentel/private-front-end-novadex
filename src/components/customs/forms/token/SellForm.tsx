"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "next/navigation";
import { useUserWalletStore } from "@/stores/wallet/use-user-wallet.store";
import { useQuickSellSettingsStore } from "@/stores/setting/use-quick-sell-settings.store";
// import { useSolPriceMessageStore } from "@/stores/use-solprice-message.store";
import { useOpenAdvanceSettingsFormStore } from "@/stores/use-open-advance-settings-form.store";
import { useLatestTransactionMessageStore } from "@/stores/use-latest-transactions.store";
// import { useHoldingsMessageStore } from "@/stores/holdings/use-holdings-messages.store";
import { useForm, useWatch } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
// import axios from "axios";
import * as Sentry from "@sentry/nextjs";
import debounce from "lodash/debounce";
import isEqual from "lodash/isEqual";
// ######## APIs 🛜 ########
import {
  submitTransaction,
  submitTransactionSchema,
  SubmitTransactionRequest,
} from "@/apis/rest/transaction/submit-transaction";
import {
  updateQuickSellPreset,
  QuickSellPresetRequest,
} from "@/apis/rest/settings/settings";
// ######## Components 🧩 ########
import Image from "next/image";
import { Input } from "@/components/ui/input";
import BaseButton from "@/components/customs/buttons/BaseButton";
import LabelStatusIndicator from "@/components/customs/LabelStatusIndicator";
import OnOffToggle from "@/components/customs/OnOffToggle";
import WalletSelectionButton from "@/components/customs/WalletSelectionButton";
import PresetSelectionButtons from "@/components/customs/PresetSelectionButtons";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import SellBuyInputAmount, {
  DEFAULT_QUICK_PICK_PERCENTAGE_LIST,
} from "@/components/customs/SellBuyInputAmount";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import {
  convertNumberToPresetId,
  convertNumberToPresetKey,
  convertPresetIdToKey,
  convertPresetIdToNumber,
  convertPresetKeyToNumber,
} from "@/utils/convertPreset";
// ######## Types 🗨️ ########
import {
  HoldingsConvertedMessageType,
  HoldingsTokenData,
} from "@/types/ws-general";
import CustomToast from "../../toasts/CustomToast";
import toast from "react-hot-toast";
import { useTokenHoldingStore } from "@/stores/token/use-token-holding.store";
import { CachedImage } from "../../CachedImage";
import { useQuickAmountStore } from "@/stores/dex-setting/use-quick-amount.store";
import { useQuickBuySettingsStore } from "@/stores/setting/use-quick-buy-settings.store";
import { useFeeTip } from "@/stores/setting/use-fee-tip.store";
import { SuperNovaActived } from "./SuperNovaActived";
import { usePopupStore } from "@/stores/use-popup-state";
import { formatAmountWithoutLeadingZero } from "@/utils/formatAmount";
import { useActivePresetStore } from "@/stores/dex-setting/use-active-preset.store";
import { PresetKey } from "@/types/preset";

// Define interface for settings to autosave
interface SettingsToAutoSave {
  slippage: number;
  mev_protect: boolean;
  auto_tip: boolean;
  fee: number;
  tip: number;
  preset: number;
}

export default React.memo(function SellForm({
  mint,
  type = "token",
  onClose,
  holdingsMessages,
  solPrice,
  isFetch,
}: {
  mint?: string;
  type?: "holding" | "token";
  onClose?: () => void;
  holdingsMessages: HoldingsConvertedMessageType[];
  solPrice: number;
  isFetch?: boolean;
}) {
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  // const [debug, setDebug] = useState({
  //   totalHolding: 0,
  //   finalAmount: 0,
  //   percentage: 0,
  //   holdingsMessages: holdingsMessages,
  // });
  // const [finalDebug, setFinalDebug] = useState({
  //   totalHolding: 0,
  //   finalAmount: 0,
  //   percentage: 0,
  //   holdingsMessages: [],
  // });
  // useEffect(() => {
  //   setDebug((prev) => ({
  //     ...prev,
  //     holdingsMessages: holdingsMessages,
  //   }));
  // }, [holdingsMessages]);
  const params = useParams();
  const { openAdvanceSettings, setOpenAdvanceSettings } =
    useOpenAdvanceSettingsFormStore();
  const presetData = useQuickSellSettingsStore((state) => state.presets);
  const cosmoWallets = useQuickAmountStore((state) => state.cosmoWallets);
  const setCosmoWallets = useQuickAmountStore((state) => state.setCosmoWallets);
  const [walletWithAmount, setWalletWithAmount] = useState<
    {
      address: string;
      amount: number;
    }[]
  >([]);

  const { selectedMultipleActiveWalletHoldings } = useUserWalletStore();

  const isLoading = useTokenHoldingStore((state) => state.isLoading);
  const latestTransactionMessages = useLatestTransactionMessageStore(
    (state) => state.messages,
  );
  const resetLatestTransactionMessages = useLatestTransactionMessageStore(
    (state) => state.resetMessages,
  );

  // Add query client for invalidating queries
  const queryClient = useQueryClient();

  // Add state for autosave indicator
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Add a ref to track previous settings for comparison
  const previousSettingsRef = useRef<SettingsToAutoSave | null>(null);

  // Initialize form
  const form = useForm<SubmitTransactionRequest>({
    resolver: zodResolver(submitTransactionSchema),
    defaultValues: {
      mint:
        mint ||
        ((params?.["mint-address"] || params?.["pool-address"]) as string),
      type: "sell",
      wallets: cosmoWallets.map((wallet) => ({
        address: wallet.address,
        amount: 0,
      })),
      preset: 1,
      slippage: 20,
      mev_protect:
        presetData?.preset1?.processor === "Jito" ||
        presetData?.preset1?.processor === "secure",
      auto_tip: presetData?.preset1?.autoTipEnabled,
      fee: 0,
      tip: 0,
      // amount: 0,
      module: "Quick Sell",
      max: false,
    },
  });

  // ########## Calculation total sell amount 🧮 ##########
  const [picker, setPicker] = useState<number | undefined>();
  const [solAmountType, setSolAmountType] = useState<"SOL" | "%">("SOL");
  const [lastFocusOn, setLastFocusOn] = useState<"input" | "picker">("input");
  const transactionsMessages = useLatestTransactionMessageStore(
    (state) => state.messages,
  );

  // const solPrice = useSolPriceMessageStore((state) => state.messages).price;
  // const solPrice = useTokenMessageStore((state) => state.priceMessage.price_sol);
  //

  const watch = useWatch(form);
  const totalSOL = useMemo(() => {
    // const sellValue = lastFocusOn == "picker" ? picker || 0 : watch.amount || 0;
    const currBalance = walletWithAmount.reduce(
      (total, wallet) => total + wallet.amount,
      0,
    );
    return currBalance * solPrice;
  }, [lastFocusOn, picker, watch.amount, solPrice, walletWithAmount]);

  const getAmountByWallet = (token: HoldingsTokenData[], amount: number) => {
    let totalHolding = 0;
    const totalHoldings = token?.find(
      (t) =>
        t.token.mint ===
        (mint ||
          params?.["mint-address"] ||
          (params?.["pool-address"] as string)),
    )?.balance;

    const totalTransactions = transactionsMessages.find((message) => {
      return (
        message.mint ===
        (mint ||
          params?.["mint-address"] ||
          (params?.["pool-address"] as string))
      );
    })?.balance;

    totalHolding = totalHoldings || totalTransactions || 0;

    // setDebug((prev) => ({
    //   ...prev,
    //   totalHolding: totalHolding,
    //   percentage: amount,
    // }));
    let finalAmount = 0;
    if (
      solAmountType === "%" ||
      (solAmountType === "SOL" && lastFocusOn === "picker")
    ) {
      if (amount) {
        try {
          // Ensure percentage is between 0 and 100
          const percentage = Math.min(Math.max(Number(amount), 0), 100) / 100;
          const totalSellAmount = totalHolding * percentage;
          finalAmount = totalSellAmount;
        } catch (error) {
          console.warn("Error calculating sell amount:", error);
        }
      }
    } else {
      // SOL amount calculation
      if (amount && solPrice > 0) {
        const amountInputSol = Number(amount);
        const finalSellAmount = amountInputSol / solPrice;
        finalAmount = finalSellAmount;
      }
    }
    // setDebug((prev) => ({
    //   ...prev,
    //   finalAmount: finalAmount,
    // }));
    return !isNaN(finalAmount) ? finalAmount : 0;
  };

  useEffect(() => {
    if (type === "holding") {
      setCosmoWallets(selectedMultipleActiveWalletHoldings);
    }
  }, []);

  useEffect(() => {
    const amount = lastFocusOn === "input" ? form.watch("amount") : picker;

    if (
      (amount === 100 && lastFocusOn === "input" && solAmountType === "%") ||
      (amount === 100 && lastFocusOn === "picker")
    ) {
      form.setValue("max", true);
      // console.log("FORM VALUE 🟢", {
      //   formValue: form.getValues("max"),
      //   lastFocusOn,
      //   solAmountType,
      //   amount,
      //   picker,
      // });
    } else {
      // console.log("FORM VALUE 🔴", {
      //   formValue: form.getValues("max"),
      //   lastFocusOn,
      //   solAmountType,
      //   amount,
      //   picker,
      // });
    }

    const walletWithAmountTemp = walletWithAmount;

    // Selected wallet string
    const selectedWalletsString = cosmoWallets.map((w) => w.address);
    const selectedWalletWithAmountString = walletWithAmountTemp.map(
      (w) => w.address,
    );

    // Create final wallet with correct amount
    selectedWalletsString.map((w) => {
      if (!selectedWalletWithAmountString.includes(w)) {
        walletWithAmountTemp.push({
          address: w,
          amount: 0,
        });
      }
    });
    // let highestAmount = 0;
    const finalWalletWithAmount = walletWithAmountTemp
      .map((w) => {
        if (selectedWalletsString.includes(w.address)) {
          const updatedAmount = getAmountByWallet(
            holdingsMessages.find((h) => h.wallet == w.address)
              ?.tokens as HoldingsTokenData[],
            amount as number,
          );

          // if (updatedAmount > highestAmount) {
          //   highestAmount = updatedAmount;
          // }
          return {
            address: w.address,
            amount: updatedAmount,
          };
        } else return null;
      })
      .filter((w) => !!w);
    // if (solAmountType === "SOL") {
    //   form.setValue("amount", highestAmount);
    // }

    const isLatestTransactionHaveFiveSecondDifferenceWithCurrent =
      latestTransactionMessages?.filter((tx) => {
        const currentTime = new Date().getTime();
        const txTime = new Date(tx.timestamp).getTime();
        const timeDifference = Math.abs(currentTime - txTime);
        return timeDifference > 5000;
      });

    if (
      type === "token" &&
      isLoading &&
      latestTransactionMessages.length > 0 &&
      isLatestTransactionHaveFiveSecondDifferenceWithCurrent.length > 0
    ) {
      const updatedFinalWalletWithAmount = finalWalletWithAmount.map((w) => {
        const matchingTx = latestTransactionMessages.find(
          (tx) => tx.wallet === w.address,
        );
        if (matchingTx) {
          return {
            ...w,
            amount: matchingTx.balance,
          };
        }

        return w;
      });

      setWalletWithAmount(updatedFinalWalletWithAmount);
      console.warn("BALANCE ✨ - Sell Form 🟢", {
        updatedFinalWalletWithAmount,
        latestTransactionMessages,
        isLatestTransactionHaveFiveSecondDifferenceWithCurrent,
        holdingsMessages,
        isLoading,
      });
      resetLatestTransactionMessages();
    } else {
      setWalletWithAmount(finalWalletWithAmount);
      console.warn("BALANCE ✨ - Sell Form 🔴", {
        finalWalletWithAmount,
        latestTransactionMessages,
        isLatestTransactionHaveFiveSecondDifferenceWithCurrent,
        holdingsMessages,
        isLoading,
      });
      resetLatestTransactionMessages();
    }
  }, [
    // solAmountType === "SOL" && lastFocusOn === "SOL"
    holdingsMessages,
    form.watch("amount"),
    picker,
    lastFocusOn,
    cosmoWallets,
    solAmountType,
    mint || params?.["mint-address"] || (params?.["pool-address"] as string),
  ]);

  // Add autosave mutation
  const autoSaveMutation = useMutation({
    mutationFn: updateQuickSellPreset,
    onMutate: () => {
      setIsAutoSaving(true);
    },
    onSuccess: () => {
      setIsAutoSaving(false);
      // Show success toast notification
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message="Settings updated successfully"
          state="SUCCESS"
        />
      ));

      // Refresh related data to update the UI
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (error: Error) => {
      setIsAutoSaving(false);
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message={`Failed to save settings: ${error.message}`}
          state="ERROR"
        />
      ));
    },
  });

  // Sell transaction mutation
  const [currentTXInfoString, setCurrentTXInfoString] = useState<string>("");
  const mutation = useMutation({
    mutationFn: submitTransaction,
    onMutate: (data) => {
      setCurrentTXInfoString(JSON.stringify(data));
    },
    onSuccess: async (data) => {
      setCurrentTXInfoString("");
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
      closeTimeoutRef.current = setTimeout(() => {
        onClose?.();
      }, 2500);
    },
    onError: (error: Error) => {
      Sentry.captureMessage(
        `Submit TX Error 🔴 - (Sell Form): ${String(error?.message)} | TX: ${currentTXInfoString}`,
        "error",
      );
      setCurrentTXInfoString("");
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message={error.message}
          state="ERROR"
        />
      ));
    },
  });

  const activePreset = useActivePresetStore((state) => state.sellActivePreset);
  const setActivePreset = useActivePresetStore(
    (state) => state.setSellActivePreset,
  );

  // 🕍Preset Settings
  useEffect(() => {
    const preset = activePreset;
    if (presetData) {
      const presetKey = preset as keyof typeof presetData;
      form.reset({
        ...form.getValues(),
        preset: convertPresetKeyToNumber(presetKey),
        type: "sell",
        // amount: 0,
        slippage: Number(
          presetData[presetKey]?.slippage || form.getValues("slippage"),
        ),
        auto_tip: presetData[presetKey]?.autoTipEnabled,
        fee: Number(presetData[presetKey]?.fee || form.getValues("fee")),
        tip: Number(presetData[presetKey]?.tip || form.getValues("tip")),
        mev_protect:
          presetData[presetKey]?.processor === "Jito" ||
          presetData[presetKey]?.processor === "secure",
      });

      // Initialize previous settings ref
      previousSettingsRef.current = {
        slippage: Number(
          presetData[presetKey]?.slippage || form.getValues("slippage"),
        ),
        mev_protect:
          presetData[presetKey]?.processor === "Jito" ||
          presetData[presetKey]?.processor === "secure",
        auto_tip: presetData[presetKey]?.autoTipEnabled,
        fee: Number(presetData[presetKey]?.fee || form.getValues("fee")),
        tip: Number(presetData[presetKey]?.tip || form.getValues("tip")),
        preset: convertPresetKeyToNumber(presetKey),
      };
    }
  }, [presetData, activePreset]);

  const autoFeeEnabled = useQuickBuySettingsStore(
    (state) => state.presets.autoFeeEnabled,
  );
  const feetipData = useFeeTip((state) => state.data);

  // Create a debounced function for autosaving
  const debouncedAutoSave = useRef(
    debounce((formValues: SettingsToAutoSave) => {
      // Only save if values have changed
      if (
        previousSettingsRef.current &&
        !isEqual(previousSettingsRef.current, formValues)
      ) {
        // Check for minimum tip value when auto-tip is disabled
        // if (!formValues.auto_tip && formValues.tip < 0.001) {
        //   toast.custom((t: any) => (
        //     <CustomToast
        //       tVisibleState={t.visible}
        //       message="We recommend a minimum tip of 0.001 for faster transaction"
        //       state="ERROR"
        //     />
        //   ));
        //   return; // Don't proceed with saving
        // }

        // Check for minimum fee value when auto-fee is disabled
        // if (!formValues.auto_tip && formValues.fee < 0.001) {
        //   toast.custom((t: any) => (
        //     <CustomToast
        //       tVisibleState={t.visible}
        //       message="We recommend a minimum tip of 0.001 for faster transaction"
        //       state="ERROR"
        //     />
        //   ));
        // return; // Don't proceed with saving
        // }

        if (!formValues?.slippage) {
          toast.custom((t: any) => (
            <CustomToast
              tVisibleState={t.visible}
              message="Slippage is required"
              state="ERROR"
            />
          ));
          return;
        }

        // Prepare the data for the API
        const dataToSave: QuickSellPresetRequest = {
          preset: convertNumberToPresetKey(formValues.preset).replace(
            "preset",
            "",
          ),
          slippage: formValues.slippage,
          autoTipEnabled: formValues.auto_tip,
          fee: formValues.fee,
          tip: formValues.tip,
          // Determine processor based on MEV protection status
          processor: formValues.mev_protect ? "Jito" : "Node",
          // Include amounts from current preset
          amounts:
            presetData[convertNumberToPresetKey(formValues.preset)]?.amounts ||
            [],
          autoFeeEnabled,
        };

        // Call the mutation to save settings
        autoSaveMutation.mutate(dataToSave);

        // Update the previous settings ref
        previousSettingsRef.current = formValues;
      }
    }, 800),
  ).current;

  // Watch form values and autosave when they change
  useEffect(() => {
    const subscription = form.watch((value) => {
      // Extract only the settings we want to autosave
      const settingsToSave: SettingsToAutoSave = {
        slippage: Number(value.slippage || 0),
        mev_protect: Boolean(value.mev_protect),
        auto_tip: Boolean(value.auto_tip),
        fee: Number(value.fee || 0),
        tip: Number(value.tip || 0),
        preset: Number(value.preset || 1),
      };

      // Call the debounced autosave function
      debouncedAutoSave(settingsToSave);
    });

    // Cleanup on component unmount
    return () => {
      subscription.unsubscribe();
      debouncedAutoSave.cancel();
    };
  }, [form.watch, debouncedAutoSave]);

  // 💵Wallet Settings
  const onSubmit = (data: SubmitTransactionRequest) => {
    // Check if auto-tip is disabled and tip is less than the minimum
    // if (!data.auto_tip && data.tip < 0.001 && data.tip !== 0) {
    //   toast.custom((t: any) => (
    //     <CustomToast
    //       tVisibleState={t.visible}
    //       message="We recommend a minimum tip of 0.001 for faster transaction"
    //       state="ERROR"
    //     />
    //   ));
    //   return; // Don't proceed with submission
    // }

    // Check if auto-tip is disabled and fee is less than the minimum
    // if (!data.auto_tip && data.fee < 0.001 && data.fee !== 0) {
    //   toast.custom((t: any) => (
    //     <CustomToast
    //       tVisibleState={t.visible}
    //       message="We recommend a minimum tip of 0.001 for faster transaction"
    //       state="ERROR"
    //     />
    //   ));
    //   return; // Don't proceed with submission
    // }

    delete data.amount;
    mutation.mutate({
      ...data,
      tip: (autoFeeEnabled ? feetipData.tip : data.tip) as number,
      ...(autoFeeEnabled ? { fee: feetipData.fee } : {}),
      wallets: walletWithAmount,
      is_fetch: isFetch,
    });
  };

  // useEffect(() => {
  //   console.log("##### finalDebug🦋🦋", finalDebug);
  //   console.log("##### Debug🦋🦋", debug);
  // }, [finalDebug]);

  const handleToggle = () => setOpenAdvanceSettings(!openAdvanceSettings);
  const { remainingScreenWidth } = usePopupStore();

  return (
    <>
      {/* <div
        className={cn(
          "fixed z-[1000] m-3 flex flex-col gap-y-2 rounded-xl bg-white/80 p-3 leading-5 backdrop-blur-sm",
          !mint ? "top-[0%]" : "-top-[50%] left-[-50%]",
        )}
      >
        <h1>######## JUST FOR DEBUG💜 ########</h1>
        <h1>percentage: {debug.percentage}</h1>
        <h1>totalHolding: {debug.totalHolding}</h1>
        <h1>finalAmount: {debug.finalAmount}</h1>
        <h1>==================================</h1>
        <h1>percentage: {finalDebug.percentage}</h1>
        <h1>totalHolding: {finalDebug.totalHolding}</h1>
        <h1>finalAmount: {finalDebug.finalAmount}</h1>
      </div> */}
      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const finalData = {
              ...form.watch(),
              wallets: walletWithAmount,
            };
            // console.log(
            //   "finalData",
            //   submitTransactionSchema.safeParse(finalData),
            //   finalData,
            // );
            form.reset(finalData);
            form.handleSubmit(onSubmit)(e);
          }}
          className="@container"
        >
          {/* Wallet Selection & Preset */}
          {/* md:flex-col xl:flex-row */}
          <div className="flex w-full flex-col gap-x-2 gap-y-2 p-3 @[240px]:flex-row">
            {/* <div className="flex h-10 items-center rounded-[8px] border border-border p-[3px]">
          <div className="flex h-full w-full items-center rounded-[6px] bg-white/[6%]">
            <button
              onClick={() => setSellTabs("Sell Now")}
              className={cn(
                "flex h-[32px] w-full items-center justify-center gap-x-2 rounded-[6px] duration-300",
                sellTabs === "Sell Now" && "bg-white/[6%]",
              )}
            >
              <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                Sell Now
              </span>
            </button>
            <button
              onClick={() => setSellTabs("Auto Sell")}
              className={cn(
                "flex h-[32px] w-full items-center justify-center gap-x-2 rounded-[6px] bg-transparent duration-300",
                sellTabs === "Auto Sell" && "bg-white/[6%]",
              )}
            >
              <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                Auto Sell
              </span>
            </button>
          </div>
        </div> */}
            <FormField
              control={form.control}
              name="wallets"
              render={({ field }) => (
                <FormItem
                  className={cn(
                    "flex flex-grow",
                    // type !== "holding"
                    //   ? "@[240px]:[&_#wallet-selection-button]:max-w-[190.5px]"
                    "[&_#wallet-selection-button]:max-w-full md:[&_#wallet-selection-button]:max-w-[145px]",
                  )}
                >
                  <FormControl>
                    <WalletSelectionButton
                      displayVariant="name"
                      value={cosmoWallets}
                      setValue={(wallet) => {
                        field.onChange(
                          wallet.map((w) => ({
                            address: w.address,
                            amount: 0,
                          })),
                        );
                        setCosmoWallets(wallet);
                      }}
                      maxWalletShow={10}
                      // maxWalletShow={2}
                      className={cn(
                        "w-[145px] max-md:w-full md:max-w-[190.5px]",
                        remainingScreenWidth <= 1280 && "md:max-w-[150px]",
                      )}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="preset"
              render={({ field }) => (
                <FormItem className="w-full @[240px]:w-fit">
                  <FormControl>
                    <PresetSelectionButtons
                      activePreset={convertNumberToPresetKey(field.value)}
                      setActivePreset={(value: string) => {
                        field.onChange(convertPresetIdToNumber(value));
                        setActivePreset(
                          convertPresetIdToKey(value) as PresetKey,
                        );
                      }}
                      isGlobal={false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* Sell Amount */}
          {/* Sell Now Fields (Conditional) */}
          <div className="flex w-full flex-col px-3">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <SellBuyInputAmount
                      quickPickList={
                        presetData[
                          convertNumberToPresetKey(
                            form.watch("preset"),
                          ) as keyof typeof presetData
                        ]?.amounts.length == 6
                          ? presetData[
                              convertNumberToPresetKey(
                                form.watch("preset"),
                              ) as keyof typeof presetData
                            ]?.amounts
                          : DEFAULT_QUICK_PICK_PERCENTAGE_LIST
                      }
                      setSolAmountType={(t) => {
                        form.setValue("amount", undefined);
                        setSolAmountType(t);
                      }}
                      setPickerValue={setPicker}
                      pickerValue={picker}
                      setLastFocusOn={setLastFocusOn}
                      lastFocusOn={lastFocusOn}
                      {...field}
                      type="swap"
                    />
                  </FormControl>
                  {/* <FormMessage /> */}
                </FormItem>
              )}
            />
          </div>
          {/* )} */}
          {/* Auto Sell Fields (Conditional) */}
          {/* {sellTabs === "Auto Sell" && (
        <div className="mb-2 flex w-full flex-col px-3">
          <div className="flex w-full flex-col rounded-[8px] bg-gradient-to-b from-[#1B1B31] via-[#080811] via-[63%] to-[#1B1B31]">
            <div className="grid h-[40px] w-full grid-cols-3 border-b border-border">
              {sellTabList.map((tab, index) => {
                const isActive = activeSellTab === tab;

                return (
                  <button
                    key={index + tab}
                    onClick={() =>
                      setActiveSellTab(
                        tab as "Order" | "Stop Loss" | "Take Profit",
                      )
                    }
                    className="relative flex h-full items-center justify-center gap-x-3 px-6"
                  >
                    <span
                      className={cn(
                        "inline-block text-nowrap text-sm",
                        isActive
                          ? "font-geistSemiBold text-[#DF74FF]"
                          : "text-fontColorSecondary",
                      )}
                    >
                      {tab}
                    </span>

                    {isActive && (
                      <div className="absolute bottom-0 left-0 h-[2px] w-full rounded-t-[100px] bg-primary"></div>
                    )}
                  </button>
                );
              })}
            </div>

            {activeSellTab === "Order" && (
              <div className="flex w-full flex-col gap-y-4 p-4">
                <div className="flex w-full justify-between">
                  <div className="flex items-center gap-x-2">
                    <div
                      onClick={() => setOrderSelectedOption("Dev Sell")}
                      className="relative aspect-square h-5 w-5 flex-shrink-0 cursor-pointer"
                    >
                      <Image
                        src={
                          orderSelectedOption === "Dev Sell"
                            ? "/icons/active-radio.png"
                            : "/icons/inactive-radio.png"
                        }
                        alt="Active / Inactive Radio Icon"
                        fill
                        quality={50}
                
                        className="object-contain"
                      />
                    </div>
                    <span
                      onClick={() => setOrderSelectedOption("Dev Sell")}
                      className={cn(
                        "inline-block cursor-pointer text-sm text-fontColorSecondary",
                        orderSelectedOption === "Dev Sell" && "text-fontColorPrimary",
                      )}
                    >
                      Dev Sell
                    </span>
                  </div>
                  <Input
                    type="number"
                    value={devSellPercentage}
                    onChange={handleChangeDevSellPercentage}
                    placeholder="1-100"
                    disabled={orderSelectedOption !== "Dev Sell"}
                    suffixEl={
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-fontColorSecondary">
                        %
                      </span>
                    }
                    parentClassName="max-w-[121px]"
                    className={cn(
                      "pl-3",
                      orderSelectedOption !== "Dev Sell" &&
                        "pointer-events-none opacity-50",
                    )}
                  />
                </div>

                <Separator />

                <div className="flex w-full flex-col gap-y-4">
                  <div className="flex items-center gap-x-2">
                    <div
                      onClick={() => setOrderSelectedOption("Market Cap")}
                      className="relative aspect-square h-5 w-5 flex-shrink-0 cursor-pointer"
                    >
                      <Image
                        src={
                          orderSelectedOption === "Market Cap"
                            ? "/icons/active-radio.png"
                            : "/icons/inactive-radio.png"
                        }
                        alt="Active / Inactive Radio Icon"
                        fill
                        quality={50}
                
                        className="object-contain"
                      />
                    </div>
                    <span
                      onClick={() => setOrderSelectedOption("Market Cap")}
                      className={cn(
                        "inline-block cursor-pointer text-sm text-fontColorSecondary",
                        orderSelectedOption === "Market Cap" && "text-fontColorPrimary",
                      )}
                    >
                      Market Cap
                    </span>
                  </div>

                  <div className="grid h-[32px] w-full grid-cols-3 gap-x-3">
                    <div className="col-span-1 flex h-full w-full">
                      <Select
                        value={marketCapCondition}
                        onValueChange={(value) =>
                          setMarketCapCondition(value as "UP" | "DOWN")
                        }
                        disabled={orderSelectedOption !== "Market Cap"}
                      >
                        <SelectTrigger className="h-[32px] w-full">
                          <span className="inline-block text-nowrap text-fontColorSecondary">
                            <SelectValue placeholder="Select Condition" />
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DOWN" className="text-fontColorSecondary">
                            Buy ↓
                          </SelectItem>
                          <SelectItem value="UP" className="text-fontColorSecondary">
                            Buy ↑
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1 flex h-full w-full">
                      <Select
                        value={marketCapMCStatus}
                        onValueChange={(value) =>
                          setMarketCapMCStatus(value as "MC")
                        }
                        disabled={orderSelectedOption !== "Market Cap"}
                      >
                        <SelectTrigger className="h-[32px] w-full">
                          <span className="inline-block text-nowrap text-fontColorSecondary">
                            <SelectValue placeholder="Select MC" />
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MC" className="text-fontColorSecondary">
                            MC
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1 flex h-full w-full">
                      <Input
                        type="number"
                        value={marketCapAmount}
                        onChange={handleChangeMarketCapAmount}
                        placeholder="0"
                        disabled={orderSelectedOption !== "Market Cap"}
                        prefixEl={
                          <div className="absolute left-3.5 aspect-square h-4 w-4 flex-shrink-0">
                            <Image
                              src="/icons/token/currency.png"
                              alt="Currency Icon"
                              fill
                              quality={50}
                
                              className="object-contain"
                            />
                          </div>
                        }
                        parentClassName="max-w-[121px]"
                        className={cn(
                          "pl-3",
                          orderSelectedOption !== "Market Cap" &&
                            "pointer-events-none opacity-50",
                        )}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex w-full flex-col gap-y-4">
                  <div className="flex items-center gap-x-2">
                    <div
                      onClick={() => setOrderSelectedOption("Price")}
                      className="relative aspect-square h-5 w-5 flex-shrink-0 cursor-pointer"
                    >
                      <Image
                        src={
                          orderSelectedOption === "Price"
                            ? "/icons/active-radio.png"
                            : "/icons/inactive-radio.png"
                        }
                        alt="Active / Inactive Radio Icon"
                        fill
                        quality={50}
                
                        className="object-contain"
                      />
                    </div>
                    <span
                      onClick={() => setOrderSelectedOption("Price")}
                      className={cn(
                        "inline-block cursor-pointer text-sm text-fontColorSecondary",
                        orderSelectedOption === "Price" && "text-fontColorPrimary",
                      )}
                    >
                      Price
                    </span>
                  </div>

                  <div className="grid h-[32px] w-full grid-cols-3 gap-x-3">
                    <div className="col-span-1 flex h-full w-full">
                      <Select
                        value={priceCondition}
                        onValueChange={(value) =>
                          setPriceCondition(value as "UP" | "DOWN")
                        }
                        disabled={orderSelectedOption !== "Price"}
                      >
                        <SelectTrigger className="h-[32px] w-full">
                          <span className="inline-block text-nowrap text-fontColorSecondary">
                            <SelectValue placeholder="Select Condition" />
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DOWN" className="text-fontColorSecondary">
                            Buy ↓
                          </SelectItem>
                          <SelectItem value="UP" className="text-fontColorSecondary">
                            Buy ↑
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1 flex h-full w-full">
                      <Select
                        value={priceMCStatus}
                        onValueChange={(value) =>
                          setPriceMCStatus(value as "MC")
                        }
                        disabled={orderSelectedOption !== "Price"}
                      >
                        <SelectTrigger className="h-[32px] w-full">
                          <span className="inline-block text-nowrap text-fontColorSecondary">
                            <SelectValue placeholder="Select MC" />
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MC" className="text-fontColorSecondary">
                            MC
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1 flex h-full w-full">
                      <Input
                        type="number"
                        value={priceAmount}
                        onChange={handleChangePriceAmount}
                        placeholder="0"
                        disabled={orderSelectedOption !== "Price"}
                        prefixEl={
                          <div className="absolute left-3.5 aspect-square h-4 w-4 flex-shrink-0">
                            <Image
                              src="/icons/token/currency.png"
                              alt="Currency Icon"
                              fill
                              quality={50}
                
                              className="object-contain"
                            />
                          </div>
                        }
                        parentClassName="max-w-[121px]"
                        className={cn(
                          "pl-3",
                          orderSelectedOption !== "Price" &&
                            "pointer-events-none opacity-50",
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSellTab === "Stop Loss" && (
              <div className="flex w-full flex-col gap-y-4 p-4">
                <div className="flex w-full flex-col justify-between gap-y-0.5">
                  <Label
                    htmlFor="stoploss"
                    className="text-nowrap text-sm text-fontColorSecondary"
                  >
                    Stop Loss
                  </Label>
                  <Input
                    type="number"
                    value={stopLossPercentage}
                    onChange={handleChangeStopLossPercentage}
                    placeholder="0"
                    suffixEl={
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-fontColorSecondary">
                        %
                      </span>
                    }
                  />
                </div>

                <div className="flex w-full flex-col justify-between gap-y-0.5">
                  <Label
                    htmlFor="stoplosssellamount"
                    className="text-nowrap text-sm text-fontColorSecondary"
                  >
                    Sell Amount
                  </Label>
                  <Input
                    type="number"
                    value={stopLossSellAmountPercentage}
                    onChange={handleChangeStopLossSellAmountPercentage}
                    placeholder="0"
                    suffixEl={
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-fontColorSecondary">
                        %
                      </span>
                    }
                  />
                </div>

                <div className="flex w-full flex-col justify-between gap-y-0.5">
                  <Label
                    htmlFor="stoplossexpiresinhours"
                    className="text-nowrap text-sm text-fontColorSecondary"
                  >
                    Expires in hrs
                  </Label>
                  <Input
                    type="number"
                    value={stopLossExpiresInHours}
                    onChange={handleChangeStopLossExpiresInHours}
                    placeholder="Hours"
                    prefixEl={
                      <div className="absolute left-3.5 aspect-square h-4 w-4 flex-shrink-0">
                        <Image
                          src="/icons/gray-clock.png"
                          alt="Gray Clock Icon"
                          fill
                          quality={50}
                
                          className="object-contain"
                        />
                      </div>
                    }
                  />
                </div>
              </div>
            )}

            {activeSellTab === "Take Profit" && (
              <div className="flex w-full flex-col gap-y-4 p-4">
                <div className="flex w-full flex-col justify-between gap-y-0.5">
                  <Label
                    htmlFor="takeprofit"
                    className="text-nowrap text-sm text-fontColorSecondary"
                  >
                    Take Profit
                  </Label>
                  <Input
                    type="number"
                    value={takeProfitPercentage}
                    onChange={handleChangeTakeProfitPercentage}
                    placeholder="0"
                    suffixEl={
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-fontColorSecondary">
                        %
                      </span>
                    }
                  />
                </div>

                <div className="flex w-full flex-col justify-between gap-y-0.5">
                  <Label
                    htmlFor="takeprofitsellamount"
                    className="text-nowrap text-sm text-fontColorSecondary"
                  >
                    Sell Amount
                  </Label>
                  <Input
                    type="number"
                    value={takeProfitSellAmountPercentage}
                    onChange={handleChangeTakeProfitPercentage}
                    placeholder="0"
                    suffixEl={
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-fontColorSecondary">
                        %
                      </span>
                    }
                  />
                </div>

                <div className="flex w-full flex-col justify-between gap-y-0.5">
                  <Label
                    htmlFor="takeprofitexpiresinhours"
                    className="text-nowrap text-sm text-fontColorSecondary"
                  >
                    Expires in hrs
                  </Label>
                  <Input
                    type="number"
                    value={takeProfitExpiresInHours}
                    onChange={handleChangeTakeProfitExpiresInHours}
                    placeholder="Hours"
                    prefixEl={
                      <div className="absolute left-3.5 aspect-square h-4 w-4 flex-shrink-0">
                        <Image
                          src="/icons/gray-clock.png"
                          alt="Gray Clock Icon"
                          fill
                          quality={50}
                
                          className="object-contain"
                        />
                      </div>
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )} */}
          {/* Advance Settings */}
          <motion.div
            animate={openAdvanceSettings ? "open" : "closed"}
            className="flex h-auto w-full flex-col px-4"
          >
            {/* Advanced Settings Header */}
            <button
              type="button"
              onClick={handleToggle}
              className="flex h-[48px] w-full items-center justify-between"
            >
              <div className="flex items-center gap-x-2">
                <div className="relative aspect-square h-[18px] w-[18px] focus:border-none focus:outline-none focus:ring-0">
                  <Image
                    src="/icons/setting-primary.svg"
                    alt="Gray Setting Icon"
                    fill
                    quality={50}
                    className="object-contain"
                  />
                </div>
                <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                  Advanced Settings
                </span>
              </div>
              <div className="flex items-center gap-1">
                {autoFeeEnabled && <SuperNovaActived />}

                <div className="relative aspect-square h-6 w-6 flex-shrink-0 cursor-pointer">
                  <Image
                    src="/icons/pink-chevron-down.png"
                    alt="Accordion Icon"
                    fill
                    quality={50}
                    className={`object-contain transition-transform duration-300 ${
                      openAdvanceSettings ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </div>
              </div>
            </button>

            <AnimatePresence>
              {openAdvanceSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div
                    className={cn(
                      "flex w-full flex-col gap-y-4 pb-4 pt-3",
                      type == "holding" ? "pb-6 xl:pb-20" : "",
                    )}
                  >
                    <div className="grid w-full grid-cols-3 gap-x-3 md:h-[58px]">
                      {/* Slippage */}
                      <FormField
                        control={form.control}
                        name="slippage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Slippage</FormLabel>
                            <FormControl>
                              <Input
                                disabled={autoFeeEnabled}
                                type="number"
                                {...field}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value);
                                  if (value < 0 || value > 100) return;
                                  field.onChange(value);
                                }}
                                className={
                                  type == "holding" ? "rounded-[14px]" : ""
                                }
                                placeholder="1-100"
                                suffixEl={
                                  <span className="absolute right-3.5 text-sm text-fontColorSecondary">
                                    %
                                  </span>
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* MEV Protect */}
                      <FormField
                        control={form.control}
                        name="mev_protect"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              MEV Protect
                              <LabelStatusIndicator
                                status={field.value ? "ON" : "OFF"}
                              />
                            </FormLabel>
                            <FormControl>
                              <OnOffToggle
                                disabled={autoFeeEnabled}
                                variant="dark"
                                value={field.value ? "ON" : "OFF"}
                                setValue={(value) =>
                                  field.onChange(value === "ON")
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Auto Tip */}
                      <FormField
                        control={form.control}
                        name="auto_tip"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              Auto-Tip
                              <LabelStatusIndicator
                                status={field.value ? "ON" : "OFF"}
                              />
                            </FormLabel>
                            <FormControl>
                              <OnOffToggle
                                variant="dark"
                                disabled={autoFeeEnabled}
                                value={field.value ? "ON" : "OFF"}
                                setValue={(value) =>
                                  field.onChange(value === "ON")
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Fee and Tip Fields */}
                    <div
                      className={cn(
                        "grid w-full grid-cols-2 gap-3",
                        type == "holding" ? "grid-cols-1" : "",
                      )}
                    >
                      <FormField
                        control={form.control}
                        name="fee"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority Fee</FormLabel>
                            <FormControl>
                              <Input
                                disabled={autoFeeEnabled}
                                type="number"
                                isNumeric
                                decimalScale={9}
                                {...field}
                                onNumericValueChange={(values) => {
                                  const newValue =
                                    values.floatValue === undefined
                                      ? 0
                                      : values.floatValue;

                                  // Update the field value
                                  field.onChange(newValue);

                                  // Show toast if value is invalid and not empty/zero
                                  // if (
                                  //   !form.getValues().auto_tip &&
                                  //   newValue < 0.001 &&
                                  //   newValue !== 0
                                  // ) {
                                  //   toast.custom((t: any) => (
                                  //     <CustomToast
                                  //       tVisibleState={t.visible}
                                  //       message="We recommend a minimum tip of 0.001 for faster transaction"
                                  //       state="ERROR"
                                  //     />
                                  //   ));
                                  // }

                                  form.trigger("fee");
                                }}
                                placeholder="0.0"
                                className={
                                  type == "holding" ? "rounded-[8px]" : ""
                                }
                                prefixEl={
                                  <div className="absolute left-3.5 aspect-square h-4 w-4">
                                    <CachedImage
                                      src="/icons/solana-sq.svg"
                                      alt="Solana Icon"
                                      fill
                                      quality={50}
                                      className="object-contain"
                                    />
                                  </div>
                                }
                              />
                            </FormControl>
                            {form.watch("fee") < 0.001 ? (
                              <FormMessage className="leading-4">
                                We recommend a minimum tip of 0.001 for faster
                                transaction
                              </FormMessage>
                            ) : (
                              <FormMessage />
                            )}
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tip"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sell Tip</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                isNumeric
                                disabled={autoFeeEnabled}
                                decimalScale={9}
                                {...field}
                                onNumericValueChange={(values) => {
                                  const newValue =
                                    values.floatValue === undefined
                                      ? 0
                                      : values.floatValue;

                                  // Update the field value
                                  field.onChange(newValue);

                                  // Show toast if value is invalid and not empty/zero
                                  // if (
                                  //   !form.getValues().auto_tip &&
                                  //   newValue < 0.001 &&
                                  //   newValue !== 0
                                  // ) {
                                  //   toast.custom((t: any) => (
                                  //     <CustomToast
                                  //       tVisibleState={t.visible}
                                  //       message="We recommend a minimum tip of 0.001 for faster transaction"
                                  //       state="ERROR"
                                  //     />
                                  //   ));
                                  // }

                                  form.trigger("tip");
                                }}
                                placeholder="0.0"
                                className={
                                  type == "holding" ? "rounded-[8px]" : ""
                                }
                                prefixEl={
                                  <div className="absolute left-3.5 aspect-square h-4 w-4">
                                    <CachedImage
                                      src="/icons/solana-sq.svg"
                                      alt="Solana Icon"
                                      fill
                                      quality={50}
                                      className="object-contain"
                                    />
                                  </div>
                                }
                              />
                            </FormControl>
                            {form.watch("tip") < 0.001 ? (
                              <FormMessage className="leading-4">
                                We recommend a minimum tip of 0.001 for faster
                                transaction
                              </FormMessage>
                            ) : (
                              <FormMessage />
                            )}
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          <div className="min-h-0 flex-grow"></div>
          {/* CTA */}
          <div className="mt-auto flex w-full flex-col gap-y-2 px-4 pb-4">
            {type == "token" ? (
              <BaseButton
                type="submit"
                variant="primary"
                className="w-full py-2.5"
                // disabled={mutation.isPending}
                prefixIcon={
                  <div className="relative aspect-square h-[18px] w-[18px]">
                    <Image
                      src="/icons/black-quicksell.png"
                      alt="Black Quick Sell Icon"
                      fill
                      quality={50}
                      className="object-contain"
                    />
                  </div>
                }
              >
                <span className="inline-block text-nowrap font-geistSemiBold text-base text-[#080811]">
                  {mutation.isPending
                    ? "Processing..."
                    : `Quick Sell ${lastFocusOn == "picker" ? picker : form.watch("amount") || "0"} ${!(lastFocusOn == "input" && solAmountType == "SOL") ? `% (${formatAmountWithoutLeadingZero(totalSOL)} SOL)` : "SOL"}`}
                </span>
              </BaseButton>
            ) : (
              <BaseButton
                type="submit"
                variant="primary"
                className="h-10 w-full xl:h-8"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const finalData = {
                    ...form.watch(),
                    wallets: walletWithAmount,
                  };
                  // console.log(
                  //   "finalData",
                  //   submitTransactionSchema.safeParse(finalData),
                  //   finalData,
                  // );
                  form.reset(finalData);
                  form.handleSubmit(onSubmit)(e);
                  // onSubmit(finalData);
                }}
                // disabled={mutation.isPending}
                prefixIcon={
                  <div className="relative aspect-square h-[18px] w-[18px]">
                    <Image
                      src="/icons/black-quicksell.png"
                      alt="Black Quick Sell Icon"
                      fill
                      quality={50}
                      className="object-contain"
                    />
                  </div>
                }
              >
                <span className="inline-block text-nowrap font-geistSemiBold text-base text-[#080811]">
                  {mutation.isPending
                    ? "Processing..."
                    : `Quick Sell ${lastFocusOn == "picker" ? picker : form.watch("amount") || "0"} ${!(lastFocusOn == "input" && solAmountType == "SOL") ? `% (${formatAmountWithoutLeadingZero(totalSOL)} SOL)` : "SOL"}`}
                </span>
              </BaseButton>
            )}
            {/* <div className="text-primary">
              {totalSOL}
            </div> */}
            {/* {type === "token" && ( */}
            {/*   <BaseButton */}
            {/*     type="button" */}
            {/*     variant="primary" */}
            {/*     className="bg-success py-[7px] hover:bg-success/80 focus:bg-success disabled:bg-success/60" */}
            {/*     onClick={(e) => { */}
            {/*       e.preventDefault(); */}
            {/*       // Get initial token holdings for each wallet */}
            {/*       const walletsWithInitialAmount = cosmoWallets.map( */}
            {/*         (wallet) => { */}
            {/*           const walletHoldings = holdingsMessages.find( */}
            {/*             (h) => h.wallet === wallet.address, */}
            {/*           ); */}
            {/*           const tokenData = walletHoldings?.tokens?.find( */}
            {/*             (t) => */}
            {/*               t.token.mint === */}
            {/*               (mint || */}
            {/*                 params?.["mint-address"] || */}
            {/*                 params?.["pool-address"]), */}
            {/*           ); */}
            {/*           return { */}
            {/*             address: wallet.address, */}
            {/*             amount: tokenData?.balance || 0, */}
            {/*           }; */}
            {/*         }, */}
            {/*       ); */}
            {/**/}
            {/*       // Create the final submission data */}
            {/*       const finalData = { */}
            {/*         ...form.getValues(), */}
            {/*         wallets: walletsWithInitialAmount, */}
            {/*       }; */}
            {/**/}
            {/*       delete finalData.amount; */}
            {/*       delete finalData.max; */}
            {/**/}
            {/*       // Submit transaction with initial amounts */}
            {/*       mutation.mutate({ */}
            {/*         ...finalData, */}
            {/*         tip: (autoFeeEnabled */}
            {/*           ? feetipData.tip */}
            {/*           : finalData.tip) as number, */}
            {/*         ...(autoFeeEnabled ? { fee: feetipData.fee } : {}), */}
            {/*         is_fetch: isFetch, */}
            {/*       }); */}
            {/*       console.log("form data", { */}
            {/*         ...finalData, */}
            {/*         tip: (autoFeeEnabled */}
            {/*           ? feetipData.tip */}
            {/*           : finalData.tip) as number, */}
            {/*         ...(autoFeeEnabled ? { fee: feetipData.fee } : {}), */}
            {/*         is_fetch: isFetch, */}
            {/*       }); */}
            {/*     }} */}
            {/*     prefixIcon={ */}
            {/*       <div className="relative aspect-square size-4"> */}
            {/*         <Image */}
            {/*           src="/icons/black-initialsell.svg" */}
            {/*           alt="Black Quick Sell Icon" */}
            {/*           fill */}
            {/*           quality={50} */}
            {/*           className="object-contain" */}
            {/*         /> */}
            {/*       </div> */}
            {/*     } */}
            {/*   > */}
            {/*     <span className="inline-block text-nowrap font-geistSemiBold text-sm text-[#080811]"> */}
            {/*       {mutation.isPending ? "Processing..." : "Sell Initial"} */}
            {/*     </span> */}
            {/*   </BaseButton> */}
            {/* )} */}
            <p className="text-center text-xs text-fontColorSecondary">
              Once you click on Quick Sell, your transaction is sent immediately
              {isAutoSaving && (
                <span className="ml-1 text-green-400">• Auto saving</span>
              )}
            </p>
          </div>
        </form>
      </Form>
    </>
  );
});
