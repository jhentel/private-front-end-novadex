"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { UseFormReturn } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MigrationTaskRequest,
  addMigrationTask,
  getTokenMetadata,
  migrationTaskSchema,
} from "@/apis/rest/sniper";
// ######## Components 🧩 ########
import { FormEvent } from "react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import CustomToast from "@/components/customs/toasts/CustomToast";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import Separator from "@/components/customs/Separator";
import BaseButton from "@/components/customs/buttons/BaseButton";
import AvatarWithBadges from "@/components/customs/AvatarWithBadges";
import SellBuyInputAmount, {
  DEFAULT_QUICK_PICK_PERCENTAGE_LIST,
  DEFAULT_QUICK_PICK_SOL_LIST,
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
import { getSettings } from "@/apis/rest/settings/settings";
import { useBuySniperSettingsStore } from "@/stores/setting/use-buy-sniper-settings.store";
import { useSellSniperSettingsStore } from "@/stores/setting/use-sell-sniper-settings.store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import WalletSelectionButton from "../../WalletSelectionButton";
import { useUserWalletStore } from "@/stores/wallet/use-user-wallet.store";
import { HoldingsTokenData } from "@/types/ws-general";
import { useHoldingsMessageStore } from "@/stores/holdings/use-holdings-messages.store";
import { useSolPriceMessageStore } from "@/stores/use-solprice-message.store";
import { CachedImage } from "../../CachedImage";

interface Props {
  form: UseFormReturn<MigrationTaskRequest>;
  toggleModal: () => void;
}

export default function SnipeMigrationSellForm({ form, toggleModal }: Props) {
  const queryClient = useQueryClient();
  const presetData = useSellSniperSettingsStore((state) => state.presets);
  const [preset, setPreset] = useState(1);
  const {
    selectedMultipleActiveWalletSniper,
    setSelectedMultipleActiveWalletSniper,
  } = useUserWalletStore();
  const [walletWithAmount, setWalletWithAmount] = useState<
    {
      address: string;
      amount: number;
    }[]
  >([]);

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
    if (presetData) {
      const presetKey = convertNumberToPresetKey(
        preset,
      ) as keyof typeof presetData;
      form.reset({
        ...form.getValues(),
        // amount: 0,
        method: "sell",
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
    }
  }, [presetData, preset]);

  const mutation = useMutation({
    mutationFn: addMigrationTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sniper-tasks"] });
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message="Task created successfully"
          state="SUCCESS"
        />
      ));
      toggleModal();
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

  // Add token metadata query
  const { data: tokenMetadata, isLoading: isLoadingMetadata } = useQuery({
    queryKey: ["token-metadata", form.watch("mint")],
    queryFn: async () => {
      const res = await getTokenMetadata(form.watch("mint"));
      form.setValue("name", res.name);
      form.setValue("dex", res.dex);
      form.setValue("symbol", res.symbol);
      form.setValue("image", res.image);
      return res;
    },
    enabled: Boolean(form.watch("mint")?.length >= 32), // Only fetch when address looks valid
  });

  // Handle
  const onSubmit = (data: MigrationTaskRequest) => {
    mutation.mutate(data);
  };

  return (
    <OverlayScrollbarsComponent
      defer
      element="div"
      className="modal__overlayscrollbar relative w-full flex-grow overflow-y-scroll 2xl:h-auto"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const finalData = {
            ...form.watch(),
            wallets: walletWithAmount,
          };
          const inufficientBalanceAddress = finalData.wallets.find(
            (w) => w.amount <= 0,
          );
          if (inufficientBalanceAddress) {
            toast.custom((t: any) => (
              <CustomToast
                tVisibleState={t.visible}
                message={
                  "Insufficient balance on wallet: " +
                  selectedMultipleActiveWalletSniper.find(
                    (w) => w.address == inufficientBalanceAddress.address,
                  )?.name
                }
                state="ERROR"
              />
            ));
            return;
          }
          form.reset(finalData);
          form.handleSubmit(onSubmit)(e);
        }}
      >
        <Separator />

        {/* Preset Selection */}
        <div className="flex w-full items-center justify-between gap-y-4 border-b border-border px-4 py-3">
          <FormField
            control={form.control}
            name="wallets"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <WalletSelectionButton
                    value={selectedMultipleActiveWalletSniper}
                    setValue={(wallet) => {
                      setSelectedMultipleActiveWalletSniper(wallet);
                      field.onChange(
                        wallet.map((w) => ({
                          address: w.address,
                          amount: 0,
                        })),
                      );
                    }}
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
              isWithAutoFee={false}
              activePreset={convertNumberToPresetId(preset)}
              setActivePreset={(value: string) =>
                setPreset(convertPresetIdToNumber(value))
              }
              isWithSetting
            />
          </div>
        </div>

        {/* Token Fields */}
        <div className="flex w-full flex-col gap-y-3 px-4 pt-2">
          <div className="flex w-full flex-col gap-y-4">
            <div className="grid w-full grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="mint"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Enter CA</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        isError={fieldState.invalid}
                        placeholder="Enter CA"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Token Display */}
              <div className="flex w-full flex-col gap-y-1">
                <FormLabel>Token Name</FormLabel>
                {isLoadingMetadata ? (
                  <div className="flex h-[40px] items-center">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AvatarWithBadges
                      src={tokenMetadata?.image}
                      alt={`${tokenMetadata?.symbol} Token Image`}
                      rightType={
                        tokenMetadata?.dex
                          ?.replace(/\./g, "")
                          ?.replace(/ /g, "_")
                          ?.toLowerCase() as any
                      }
                    />
                    <h4 className="text-nowrap font-geistLight text-sm text-fontColorPrimary">
                      {tokenMetadata?.symbol
                        ? tokenMetadata?.symbol
                        : form.watch("mint")?.length >= 32
                          ? "Token not found"
                          : "Enter token address"}
                    </h4>
                  </div>
                )}
              </div>
            </div>

            {/* Amount and Processor Fields */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field, fieldState }) => (
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
                  {/* <FormMessage /> */}
                </FormItem>
              )}
            />
          </div>
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
                      type="number"
                      {...field}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (value < 0 || value > 100) return;
                        field.onChange(value);
                      }}
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
                          values.floatValue === undefined
                            ? 0
                            : values.floatValue;
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
                          values.floatValue === undefined
                            ? 0
                            : values.floatValue;
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
                          values.floatValue === undefined
                            ? 0
                            : values.floatValue;
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
                : `Snipe Sell ${lastFocusOn == "picker" ? picker : form.watch("amount") || "0"} ${!(lastFocusOn == "input" && solAmountType == "SOL") ? "%" : "%"}`}
            </span>
          </BaseButton>
          <p className="text-center text-xs text-fontColorSecondary">
            Once you click on Snipe, your transaction is sent immediately
          </p>
        </div>
      </form>
    </OverlayScrollbarsComponent>
  );
}
