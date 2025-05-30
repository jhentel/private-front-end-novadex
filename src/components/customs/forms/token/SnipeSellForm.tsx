"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState, FormEvent, useEffect } from "react";
import { useStoredWalletStore } from "@/stores/dex-setting/use-stored-wallet.store";
import {
  useActivePresetStore,
  Preset,
} from "@/stores/dex-setting/use-active-preset.store";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  migrationTaskSchema,
  addMigrationTask,
  MigrationTaskRequest,
} from "@/apis/rest/sniper";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useSellSniperSettingsStore } from "@/stores/setting/use-sell-sniper-settings.store";
import {
  convertNumberToPresetId,
  convertNumberToPresetKey,
  convertPresetIdToNumber,
} from "@/utils/convertPreset";
import CustomToast from "@/components/customs/toasts/CustomToast";
import toast from "react-hot-toast";
// ######## Components 🧩 ########
import Image from "next/image";
import { Label } from "@/components/ui/label";
import LabelStatusIndicator from "@/components/customs/LabelStatusIndicator";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import BaseButton from "../../buttons/BaseButton";
import { Input } from "@/components/ui/input";
import OnOffToggle from "../../OnOffToggle";
import SellBuyInputAmount, {
  DEFAULT_QUICK_PICK_PERCENTAGE_LIST,
} from "../../SellBuyInputAmount";
import ProcessorSelectionButton from "../../ProcessorSelectionButton";
import WalletSelectionButton from "../../WalletSelectionButton";
import PresetSelectionButtons from "../../PresetSelectionButtons";
import { useUserWalletStore } from "@/stores/wallet/use-user-wallet.store";
import { useTokenMessageStore } from "@/stores/token/use-token-messages.store";
import { useHoldingsMessageStore } from "@/stores/holdings/use-holdings-messages.store";
import { useSolPriceMessageStore } from "@/stores/use-solprice-message.store";
import { HoldingsTokenData } from "@/types/ws-general";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CachedImage } from "../../CachedImage";

export default function SnipeSellForm() {
  const params = useParams();
  const queryClient = useQueryClient();
  const {
    selectedMultipleActiveWalletSniper,
    setSelectedMultipleActiveWalletSniper,
  } = useUserWalletStore();
  const presetData = useSellSniperSettingsStore((state) => state.presets);
  const tokenInfo = useTokenMessageStore((state) => state.tokenInfoMessage);
  const [preset, setPreset] = useState(1);
  const [walletWithAmount, setWalletWithAmount] = useState<
    {
      address: string;
      amount: number;
    }[]
  >([]);

  // Initialize form
  const form = useForm<MigrationTaskRequest>({
    resolver: zodResolver(migrationTaskSchema),
    defaultValues: {
      mint: (params?.["mint-address"] || params?.["pool-address"]) as string,
      method: "sell",
      // amount: 0,
      slippage: 20,
      fee: 0,
      minTip: 0,
      maxTip: 0,
      // minAmountOut: 0,
      mode: "secure",
      name: tokenInfo?.name || "",
      dex: tokenInfo?.dex || "",
      symbol: tokenInfo?.symbol || "",
      image: tokenInfo?.image || "",
    },
  });

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
        } catch (error) {
          console.warn("Error calculating sell amount:", error);
        }
      }
    } else {
      // SOL amount calculation
      if (amount && solPrice > 0) {
        form.setValue("percentage", undefined);
        const amountInputSol = Number(amount);

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

          return {
            address: w.address,
            amount: updatedAmount,
          };
        } else return null;
      })
      .filter((w) => !!w);
    setWalletWithAmount(finalWalletWithAmount);
  }, [
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

  // Sell transaction mutation
  const mutation = useMutation({
    mutationFn: addMigrationTask,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["sniper-tasks"] });
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message="Sell sniper task created successfully"
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
  const onSubmit = (data: MigrationTaskRequest) => {
    mutation.mutate({
      ...data,
    });
  };

  return (
    <Form {...form}>
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
        {/* Setups */}
        <div className="flex items-center justify-between gap-x-2 px-6 py-3">
          <div className="w-[180px]">
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
                      maxWalletShow={10}
                      // maxWalletShow={2}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
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

        {/* Sell Fields */}
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
                {/* <FormMessage /> */}
              </FormItem>
            )}
          />
        </div>

        {/* Other Settings */}
        <div className="flex w-full flex-col gap-y-4 px-4 pt-4">
          {/* Min Amount Field */}

          {/* Slippage and Sniper Mode */}
          <div className="grid h-[58px] w-full grid-cols-2 gap-x-3">
            <FormField
              control={form.control}
              name="slippage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slippage</FormLabel>
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

            <FormField
              control={form.control}
              name="mode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Sniper Mode{" "}
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

          {/* Fee and Tip Fields */}
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
                : `Snipe ${lastFocusOn == "picker" ? picker : form.watch("amount") || 0} ${!(lastFocusOn == "input" && solAmountType == "SOL") ? "%" : "SOL"}`}
            </span>
          </BaseButton>
          <p className="text-center text-xs text-fontColorSecondary">
            Once you click on Snipe, your transaction is sent immediately
          </p>
        </div>
      </form>
    </Form>
  );
}
