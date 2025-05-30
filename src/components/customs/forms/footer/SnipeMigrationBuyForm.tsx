"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { UseFormReturn } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MigrationTaskRequest,
  addMigrationTask,
  migrationTaskSchema,
  getTokenMetadata,
} from "@/apis/rest/sniper";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
// ######## Components 🧩 ########
import Image from "next/image";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import CustomToast from "@/components/customs/toasts/CustomToast";
import { Loader2 } from "lucide-react";
// ######## Utils & Helpers 🤝 ########
import Separator from "@/components/customs/Separator";
import BaseButton from "@/components/customs/buttons/BaseButton";
import AvatarWithBadges from "@/components/customs/AvatarWithBadges";
import SellBuyInputAmount, {
  DEFAULT_QUICK_PICK_SOL_LIST,
} from "@/components/customs/SellBuyInputAmount";
import { Input } from "@/components/ui/input";
import PresetSelectionButtons from "../../PresetSelectionButtons";
import {
  convertNumberToPresetId,
  convertNumberToPresetKey,
  convertPresetIdToNumber,
} from "@/utils/convertPreset";
import { useBuySniperSettingsStore } from "@/stores/setting/use-buy-sniper-settings.store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/libraries/utils";
import WalletSelectionButton from "../../WalletSelectionButton";
import { useUserWalletStore } from "@/stores/wallet/use-user-wallet.store";
import { CachedImage } from "../../CachedImage";

interface Props {
  form: UseFormReturn<MigrationTaskRequest>;
  toggleModal: () => void;
}

export default function SnipeMigrationBuyForm({ form, toggleModal }: Props) {
  const queryClient = useQueryClient();
  const [picker, setPicker] = useState<number | undefined>(0);
  const [lastFocusOn, setLastFocusOn] = useState<"input" | "picker">("input");
  const presetData = useBuySniperSettingsStore((state) => state.presets);
  const [preset, setPreset] = useState(1);
  const {
    selectedMultipleActiveWalletSniper,
    setSelectedMultipleActiveWalletSniper,
  } = useUserWalletStore();

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
        // wallets: presetData[presetKey]?.wallets?.map((w) => ({
        //   address: w,
        //   amount: 0,
        // })),
      });
      // setSelectedMultipleActiveWallet(
      //   userWalletFullList.filter((wallet) =>
      //     !!presetData[presetKey]?.wallets
      //       ? presetData[presetKey]?.wallets?.includes(wallet.address)
      //       : [userWalletFullList[0]],
      //   ),
      // );
    }
  }, [presetData, preset]);

  // Buy transaction mutation
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
      form.setValue("dex", res.dex);
      form.setValue("symbol", res.symbol);
      form.setValue("image", res.image);
      form.setValue("name", res.name);
      return res;
    },
    enabled: Boolean(form.watch("mint")?.length >= 32),
  });

  // Handle
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
    <OverlayScrollbarsComponent
      defer
      element="div"
      className="modal__overlayscrollbar relative w-full flex-grow overflow-y-scroll md:h-[520px] 2xl:h-auto"
    >
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
        <Separator />
        {/* Buy Fields */}
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
              activePreset={convertNumberToPresetId(preset)}
              setActivePreset={(value: string) =>
                setPreset(convertPresetIdToNumber(value))
              }
              isWithSetting
              isWithAutoFee={false}
            />
          </div>
        </div>

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
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Token Display Section */}
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

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <SellBuyInputAmount
                      {...field}
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
                : `Snipe ${lastFocusOn == "picker" ? picker : form.watch("amount") || "0"} SOL`}
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
