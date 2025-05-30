"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { UseFormReturn } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  EditMigrationTaskRequest,
  MigrationTaskRequest,
  SniperTask,
  addMigrationTask,
  editMigrationTask,
} from "@/apis/rest/sniper";
// ######## Components 🧩 ########
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import CustomToast from "@/components/customs/toasts/CustomToast";
// ######## Utils & Helpers 🤝 ########
import Separator from "@/components/customs/Separator";
import LabelStatusIndicator from "@/components/customs/LabelStatusIndicator";
import BaseButton from "@/components/customs/buttons/BaseButton";
import AvatarWithBadges from "@/components/customs/AvatarWithBadges";
import SellBuyInputAmount, {
  DEFAULT_QUICK_PICK_PERCENTAGE_LIST,
} from "@/components/customs/SellBuyInputAmount";
import OnOffToggle from "@/components/customs/OnOffToggle";
import { Input } from "@/components/ui/input";
import PresetSelectionButtons from "../../PresetSelectionButtons";
import ProcessorSelectionButton from "../../ProcessorSelectionButton";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  convertNumberToPresetId,
  convertNumberToPresetKey,
  convertPresetIdToNumber,
} from "@/utils/convertPreset";
import { useSellSniperSettingsStore } from "@/stores/setting/use-sell-sniper-settings.store";
import { useUserWalletStore } from "@/stores/wallet/use-user-wallet.store";
import { useBuySniperSettingsStore } from "@/stores/setting/use-buy-sniper-settings.store";
import WalletSelectionButton from "../../WalletSelectionButton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/libraries/utils";
import { useHoldingsMessageStore } from "@/stores/holdings/use-holdings-messages.store";
import { useSolPriceMessageStore } from "@/stores/use-solprice-message.store";
import { HoldingsTokenData } from "@/types/ws-general";
import { CachedImage } from "../../CachedImage";

interface Props {
  form: UseFormReturn<EditMigrationTaskRequest>;
  toggleModal: () => void;
  prevData: SniperTask;
}

export default function SnipeMigrationSellForm({
  form,
  toggleModal,
  prevData,
}: Props) {
  const queryClient = useQueryClient();
  const {
    selectedMultipleActiveWalletSniper,
    setSelectedMultipleActiveWalletSniper,
  } = useUserWalletStore();
  const [isPrevDataSetted, setIsPrevDataSetted] = useState(false);
  const presetData = useSellSniperSettingsStore((state) => state.presets);
  const [preset, setPreset] = useState(1);
  const [walletWithAmount, setWalletWithAmount] = useState<
    {
      address: string;
      amount: number;
    }[]
  >([]);

  // Prev data
  useEffect(() => {
    if (prevData) {
      form.setValue("method", "sell");
      form.setValue("mint", prevData?.mint);
      form.setValue(
        "amount",
        prevData?.method == "buy" ? undefined : prevData?.percentage,
      );
      // form.setValue("minAmountOut", Number(prevData?.minAmountOut));
      form.setValue(
        "mode",
        ["secure", "fast"].includes(prevData?.processor)
          ? (prevData?.processor as "secure" | "fast")
          : "secure",
      );
      form.setValue("slippage", Number(prevData?.slippage));
      form.setValue("autoTipEnabled", prevData?.autoTipEnabled);
      form.setValue(
        "mevProtectEnabled",
        prevData?.processor === "secure" ? true : false,
      );
      form.setValue("fee", Number(prevData?.fee));
      form.setValue("minTip", Number(prevData?.minTip));
      form.setValue("maxTip", Number(prevData?.maxTip));
      form.setValue("wallet", prevData?.wallet);
      setIsPrevDataSetted(true);
    }
  }, [prevData]);

  // ########## Calculation total sell amount 🧮 ##########
  const holdingsMessages = useHoldingsMessageStore((state) => state.messages);
  const [picker, setPicker] = useState<number | undefined>(0);
  const [solAmountType, setSolAmountType] = useState<"SOL" | "%">("SOL");
  const [lastFocusOn, setLastFocusOn] = useState<"input" | "picker">("input");
  const solPrice = useSolPriceMessageStore((state) => state.messages).price;
  const getAmountByWallet = (token: HoldingsTokenData[], amount: number) => {
    const totalHoldings =
      token?.find((t: any) => t.token.mint === form.watch("mint"))?.balance ||
      0;
    let finalAmount = 0;
    if (
      solAmountType === "%" ||
      (solAmountType === "SOL" && lastFocusOn === "picker")
    ) {
      if (amount) {
        try {
          // Ensure percentage is between 0 and 100
          const percentage = Math.min(Math.max(Number(amount), 0), 100) / 100;
          form.setValue("percentage", percentage * 100);
          const totalSellAmount = totalHoldings * percentage;
          finalAmount = totalSellAmount;
          form.setValue("amount", finalAmount);
        } catch (error) {
          console.warn("Error calculating sell amount:", error);
        }
      }
    } else {
      // SOL amount calculation
      if (amount && solPrice > 0) {
        const amountInputSol = Number(amount);
        form.setValue("percentage", undefined);

        // Calculate token amount from SOL input
        const percentage = amountInputSol / (totalHoldings * solPrice);

        // Cap at maximum available tokens
        const finalSellAmount = totalHoldings * percentage;
        finalAmount = finalSellAmount;
      }
    }
    return !isNaN(finalAmount) ? finalAmount : 0;
  };
  useEffect(() => {
    const amount = lastFocusOn === "input" ? form.watch("amount") : picker;

    const walletWithAmountTemp = walletWithAmount;

    // Selected wallet string
    const selectedWalletsString = selectedMultipleActiveWalletSniper.map(
      (w) => w.address,
    );
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
            lastFocusOn === "input" ? (amount as number) : (picker ?? 0),
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
    setWalletWithAmount(finalWalletWithAmount);
  }, [
    // solAmountType === "SOL" && lastFocusOn === "SOL"
    form.watch("amount"),
    picker,
    lastFocusOn,
    selectedMultipleActiveWalletSniper,
    solAmountType,
    form.watch("mint"),
  ]);

  // 🕍Preset Settings
  useEffect(() => {
    if (presetData && isPrevDataSetted) {
      const presetKey = convertNumberToPresetKey(
        preset,
      ) as keyof typeof presetData;
      form.reset({
        ...form.getValues(),
        // amount: 0,
        // minAmountOut: Number(presetData[presetKey]?.minAmountOut || 0),
        mode: ["secure", "fast"].includes(presetData[presetKey]?.processor)
          ? (presetData[presetKey]?.processor as "secure" | "fast")
          : "secure",
        slippage: Number(presetData[presetKey]?.slippage || 0),
        autoTipEnabled: presetData[presetKey]?.autoTipEnabled || true,
        fee: Number(presetData[presetKey]?.fee || 0.001),
        minTip: Number(presetData[presetKey]?.minTip || 0.001),
        maxTip: Number(presetData[presetKey]?.maxTip || 0.001),
      });
      // setSelectedMultipleActiveWallet(
      //   userWalletFullList.filter((wallet) =>
      //     !!presetData[presetKey]?.wallet
      //       ? presetData[presetKey]?.wallet?.includes(wallet.address)
      //       : [userWalletFullList[0]],
      //   ),
      // );
    }
  }, [presetData, preset]);

  // Buy transaction mutation
  const mutation = useMutation({
    mutationFn: editMigrationTask,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["sniper-tasks"] });
      toggleModal();
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message="Sniper task edited successfully"
          state="SUCCESS"
        />
      ));
    },
    onError: (error: Error) => {
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message={error.message}
          state="ERROR"
        />
      ));
    },
  });

  // Handle form submission
  const onSubmit = (data: EditMigrationTaskRequest) => {
    mutation.mutate({
      ...data,
      amount: lastFocusOn === "input" ? data.amount : picker,
      taskId: prevData.taskId,
    });
  };
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit(onSubmit)(e);
      }}
    >
      {/* Setups */}
      <div className="flex w-full items-center justify-between gap-y-4 border-b border-border px-4 py-3">
        <FormField
          control={form.control}
          name="wallet"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <WalletSelectionButton
                  value={selectedMultipleActiveWalletSniper}
                  setValue={(wallet) => {
                    setSelectedMultipleActiveWalletSniper(wallet);
                    field.onChange(wallet[0].address);
                  }}
                  isMultipleSelect={false}
                  className="w-[45vw] md:w-[230px]"
                  maxWalletShow={10}
                  // maxWalletShow={2}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="w-fit">
          <PresetSelectionButtons
            activePreset={convertNumberToPresetId(preset)}
            setActivePreset={(value: string) =>
              setPreset(convertPresetIdToNumber(value))
            }
            isWithSetting
            isWithAutoFee={false}
          />
        </div>
      </div>

      {/* Buy Fields */}
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
                        preset,
                      ) as keyof typeof presetData
                    ]?.amounts.length == 6
                      ? presetData[
                          convertNumberToPresetKey(
                            preset,
                          ) as keyof typeof presetData
                        ]?.amounts
                      : DEFAULT_QUICK_PICK_PERCENTAGE_LIST
                  }
                  setSolAmountType={(t) => {
                    if (solAmountType == "SOL" && t == "%") {
                      form.setValue("amount", picker);
                    } else {
                      form.setValue("amount", 0);
                    }
                    setSolAmountType(t);
                  }}
                  setPickerValue={setPicker}
                  pickerValue={picker}
                  setLastFocusOn={setLastFocusOn}
                  lastFocusOn={lastFocusOn}
                  {...field}
                  type="sell"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Other Settings */}
      <div className="flex w-full flex-col gap-y-4 px-4 pt-4">
        <div className="grid h-[58px] w-full grid-cols-2 gap-x-3">
          {/* Slippage Field */}
          <FormField
            control={form.control}
            name="slippage"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-fontColorSecondary">
                  Slippage
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (value < 0 || value > 100) return;
                      field.onChange(value);
                    }}
                    type="number"
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

          {/* Sniper Mode */}
          <FormField
            control={form.control}
            name="mode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-x-2">
                  Sniper Mode
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                          <CachedImage
                            src="/icons/info-tooltip.png"
                            alt="Info Tooltip Icon"
                            fill
                            quality={50}
                            className="object-contain"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="z-[1000]">
                        <p>Choose a processor to submit your transactions.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </FormLabel>
                <FormControl>
                  <div
                    className={cn(
                      "relative h-[34px] w-full rounded-[8px] border border-border p-[3px]",
                    )}
                  >
                    <div className="flex h-full w-full rounded-[6px] bg-white/[8%]">
                      <button
                        type="button"
                        onClick={() => field.onChange("fast")}
                        className={cn(
                          "w-full cursor-pointer rounded-[6px] font-geistSemiBold text-sm text-fontColorSecondary duration-300 hover:text-[#cccce1]",
                          field.value === "fast" &&
                            "bg-white/10 text-fontColorPrimary",
                        )}
                      >
                        Fast
                      </button>
                      <button
                        type="button"
                        onClick={() => field.onChange("secure")}
                        className={cn(
                          "w-full cursor-pointer rounded-[6px] font-geistSemiBold text-sm text-fontColorSecondary duration-300 hover:text-[#cccce1]",
                          field.value === "secure" &&
                            "bg-white/10 text-fontColorPrimary",
                        )}
                      >
                        Secure
                      </button>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid h-[58px] w-full grid-cols-3 gap-x-3">
          {/* Fee Field */}
          <FormField
            control={form.control}
            name="fee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority Fee</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    isNumeric
                    decimalScale={9}
                    {...field}
                    onNumericValueChange={(values) => {
                      const newValue =
                        values.floatValue === undefined ? 0 : values.floatValue;
                      field.onChange(newValue);
                      form.trigger("fee");
                    }}
                    placeholder="0.0"
                    prefixEl={
                      <div className="absolute left-3.5 aspect-square h-4 w-4 flex-shrink-0">
                        <CachedImage
                          src="/icons/solana-sq.svg"
                          alt="Solana SQ Icon"
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </div>
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tip Field */}
          <FormField
            control={form.control}
            name="minTip"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min Tip Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    isNumeric
                    decimalScale={9}
                    {...field}
                    onNumericValueChange={(values) => {
                      const newValue =
                        values.floatValue === undefined ? 0 : values.floatValue;
                      field.onChange(newValue);
                      form.trigger("minTip");
                    }}
                    placeholder="0.0"
                    prefixEl={
                      <div className="absolute left-3.5 aspect-square h-4 w-4 flex-shrink-0">
                        <CachedImage
                          src="/icons/solana-sq.svg"
                          alt="Solana SQ Icon"
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </div>
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maxTip"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Tip Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    isNumeric
                    decimalScale={9}
                    {...field}
                    onNumericValueChange={(values) => {
                      const newValue =
                        values.floatValue === undefined ? 0 : values.floatValue;
                      field.onChange(newValue);
                      form.trigger("maxTip");
                    }}
                    placeholder="0.0"
                    prefixEl={
                      <div className="absolute left-3.5 aspect-square h-4 w-4 flex-shrink-0">
                        <CachedImage
                          src="/icons/solana-sq.svg"
                          alt="Solana SQ Icon"
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </div>
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* CTA */}
      <div className="flex w-full flex-col gap-y-2 p-4">
        <BaseButton
          type="submit"
          variant="primary"
          className="w-full"
          disabled={mutation.isPending}
          prefixIcon={
            <div className="relative aspect-square h-[18px] w-[18px]">
              <Image
                src="/icons/black-snipe.png"
                alt="Black Snipe Icon"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
          }
        >
          <span className="inline-block text-nowrap font-geistSemiBold text-base text-[#080811]">
            {mutation.isPending
              ? "Processing..."
              : `Snipe Sell ${lastFocusOn == "picker" ? picker : form.watch("amount") || "0"} %`}
          </span>
        </BaseButton>
        <p className="text-center text-xs text-fontColorSecondary">
          Once you click on Snipe, your transaction is sent immediately
        </p>
      </div>
    </form>
  );
}
