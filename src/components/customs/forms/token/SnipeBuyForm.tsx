"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  migrationTaskSchema,
  addMigrationTask,
  MigrationTaskRequest,
} from "@/apis/rest/sniper";
import toast from "react-hot-toast";
import CustomToast from "@/components/customs/toasts/CustomToast";
import { useStoredWalletStore } from "@/stores/dex-setting/use-stored-wallet.store";
import {
  useActivePresetStore,
  Preset,
} from "@/stores/dex-setting/use-active-preset.store";
// ######## Components 🧩 ########
import Image from "next/image";
import { Label } from "@/components/ui/label";
import LabelStatusIndicator from "@/components/customs/LabelStatusIndicator";
import Separator from "@/components/customs/Separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import BaseButton from "../../buttons/BaseButton";
import { Input } from "@/components/ui/input";
import OnOffToggle, { SnipeModeToggle } from "../../OnOffToggle";
import SellBuyInputAmount, {
  DEFAULT_QUICK_PICK_SOL_LIST,
} from "../../SellBuyInputAmount";
import PresetSelectionButtons from "../../PresetSelectionButtons";
import WalletSelectionButton from "../../WalletSelectionButton";
import ProcessorSelectionButton from "../../ProcessorSelectionButton";
import { useUserWalletStore } from "@/stores/wallet/use-user-wallet.store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Form,
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
import { useBuySniperSettingsStore } from "@/stores/setting/use-buy-sniper-settings.store";
import { useTokenMessageStore } from "@/stores/token/use-token-messages.store";
import { CachedImage } from "../../CachedImage";

export default function SnipeBuyForm() {
  const params = useParams();
  const [picker, setPicker] = useState<number | undefined>(0);
  const [lastFocusOn, setLastFocusOn] = useState<"input" | "picker">("input");
  const queryClient = useQueryClient();
  const {
    selectedMultipleActiveWalletSniper,
    setSelectedMultipleActiveWalletSniper,
  } = useUserWalletStore();
  const presetData = useBuySniperSettingsStore((state) => state.presets);
  const tokenInfo = useTokenMessageStore((state) => state.tokenInfoMessage);
  const [preset, setPreset] = useState(1);

  // Initialize form
  const form = useForm<MigrationTaskRequest>({
    resolver: zodResolver(migrationTaskSchema),
    defaultValues: {
      mint: (params?.["mint-address"] || params?.["pool-address"]) as string,
      method: "buy",
      // amount: 0,
      slippage: 20,
      fee: 0,
      minTip: 0,
      minAmountOut: 0,
      mode: "secure",
      name: tokenInfo?.name || "",
      dex: tokenInfo?.dex || "",
      symbol: tokenInfo?.symbol || "",
      image: tokenInfo?.image || "",
    },
  });

  // 🕍Preset Settings
  useEffect(() => {
    if (presetData) {
      const presetKey = convertNumberToPresetKey(
        preset,
      ) as keyof typeof presetData;
      form.reset({
        ...form.getValues(),
        // amount: Number(presetData[presetKey]?.buyAmount || 0),
        minAmountOut: Number(presetData[presetKey]?.minAmountOut || 0),
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

  // Buy transaction mutation
  const mutation = useMutation({
    mutationFn: addMigrationTask,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["sniper-tasks"] });
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message="Sniper task created successfully"
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
    const finalData = {
      ...data,
      wallets: (data.wallets as { address: string; amount: number }[]).map(
        (wallet) => ({
          address: wallet.address,
          amount:
            (lastFocusOn === "input" ? form.watch("amount") : picker) || 0,
        }),
      ),
    };
    mutation.mutate(finalData);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const finalData = {
            ...form.watch(),
            wallets: selectedMultipleActiveWalletSniper.map((w) => ({
              address: w.address,
              amount: lastFocusOn == "input" ? form.watch("amount") : picker,
            })),
          };
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
                        : DEFAULT_QUICK_PICK_SOL_LIST
                    }
                    {...field}
                    setPickerValue={setPicker}
                    pickerValue={picker}
                    lastFocusOn={lastFocusOn}
                    setLastFocusOn={setLastFocusOn}
                    type="buy"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Other Settings */}
        <div className="flex w-full flex-col gap-y-4 px-4 pt-4">
          {/* Min Amount Field */}
          <FormField
            control={form.control}
            name="minAmountOut"
            render={({ field }) => (
              <FormItem>
                <div className="flex w-full items-center justify-between">
                  <FormLabel className="text-sm text-fontColorSecondary">
                    Min amount of token you want to snipe
                  </FormLabel>
                  <div className="flex h-[20] items-center justify-center gap-x-0.5 rounded-[4px] bg-foreground/20 px-1.5 py-0.5">
                    <>
                      <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                        <Image
                          src="/icons/optional.png"
                          alt="Optional Icon"
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </div>
                      <span className="inline-block text-nowrap text-xs text-fontColorSecondary">
                        optional
                      </span>
                    </>
                  </div>
                </div>
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
                      form.trigger("minAmountOut");
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
                    <SnipeModeToggle
                      setValue={(value) => field.onChange(value)}
                      value={field.value as "fast" | "secure"}
                    />
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
                : `Snipe ${lastFocusOn == "picker" ? picker : form.watch("amount") || 0} SOL`}
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
