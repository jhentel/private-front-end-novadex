"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
// ######## Components 🧩 ########
import { FormEvent } from "react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import CustomToast from "@/components/customs/toasts/CustomToast";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import Separator from "@/components/customs/Separator";
import {
  Preset,
  useActivePresetStore,
} from "@/stores/dex-setting/use-active-preset.store";
import BaseButton from "@/components/customs/buttons/BaseButton";
import SellBuyInputAmount from "@/components/customs/SellBuyInputAmount";
import LabelStatusIndicator from "@/components/customs/LabelStatusIndicator";
import OnOffToggle from "@/components/customs/OnOffToggle";
import { Input } from "@/components/ui/input";
import PresetSelectionButtons from "../../PresetSelectionButtons";
import ProcessorSelectionButton from "../../ProcessorSelectionButton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  addNewPairTask,
  getTokenMetadata,
  NewPairTaskRequest,
  newPairTaskSchema,
} from "@/apis/rest/sniper";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  convertNumberToPresetId,
  convertNumberToPresetKey,
  convertPresetIdToNumber,
  convertPresetKeyToId,
} from "@/utils/convertPreset";
import { useBuySniperSettingsStore } from "@/stores/setting/use-buy-sniper-settings.store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import WalletSelectionButton from "../../WalletSelectionButton";
import { useUserWalletStore } from "@/stores/wallet/use-user-wallet.store";
import { CachedImage } from "../../CachedImage";

type SnipeNewPairFormProps = {
  toggleModal: () => void;
};

export default function SnipeNewPairForm({
  toggleModal,
}: SnipeNewPairFormProps) {
  const queryClient = useQueryClient();
  const [picker, setPicker] = useState<number | undefined>(0);
  const [lastFocusOn, setLastFocusOn] = useState<"input" | "picker">("input");
  const {
    selectedMultipleActiveWalletSniper,
    setSelectedMultipleActiveWalletSniper,
  } = useUserWalletStore();
  const presetData = useBuySniperSettingsStore((state) => state.presets);
  const [preset, setPreset] = useState(1);

  // Initialize form with current preset data
  const form = useForm<NewPairTaskRequest>({
    resolver: zodResolver(newPairTaskSchema),
    defaultValues: {
      autoTipEnabled: false,
      mevProtectEnabled: true,
      slippage: 20,
      fee: 0,
      minTip: 0,
      maxTip: 0,
      // amount: 0,
      mint: "",
      minAmountOut: 0,
      mode: "secure",
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

  // Update mutation with refetch
  const mutation = useMutation({
    mutationFn: addNewPairTask,
    onSuccess: () => {
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message="Create sniper new pair successfully"
          state="SUCCESS"
        />
      ));
      // Refetch settings after successful update
      queryClient.invalidateQueries({ queryKey: ["sniper-tasks"] });
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

  // Save Configuration 🆙
  const onSubmit = (data: NewPairTaskRequest) => {
    mutation.mutate(data);
  };
  return (
    <OverlayScrollbarsComponent
      defer
      element="div"
      className="modal__overlayscrollbar relative h-full w-full flex-grow overflow-y-scroll md:h-[520px] 2xl:h-auto"
    >
      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const finalData = {
              ...form.getValues(),
              wallets: selectedMultipleActiveWalletSniper.map((wallet) => ({
                address: wallet.address,
                amount:
                  (lastFocusOn === "input" ? form.watch("amount") : picker) ||
                  0,
              })),
            };
            form.reset(finalData);
            form.handleSubmit(onSubmit)(e);
          }}
        >
          {/* Fields */}
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

          <div className="flex w-full flex-col gap-y-3 px-4 pt-4">
            <div className="flex w-full flex-col gap-y-4">
              <div className="grid grid-cols-3 gap-x-2">
                <div className="flex w-full flex-col gap-y-2">
                  <FormField
                    control={form.control}
                    name="mint"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-nowrap text-sm text-fontColorSecondary">
                          Enter CA
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            {...field}
                            placeholder="Enter CA"
                          />
                        </FormControl>
                        <FormMessage />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex w-full flex-col gap-y-2">
                  <FormField
                    control={form.control}
                    name="developer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-nowrap text-sm text-fontColorSecondary">
                          Developer Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            {...field}
                            placeholder="Enter Developer Address"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex w-full flex-col gap-y-2">
                  <FormField
                    control={form.control}
                    name="ticker"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-nowrap text-sm text-fontColorSecondary">
                          Ticker
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            {...field}
                            placeholder="Enter Ticker"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                          values.floatValue === undefined
                            ? 0
                            : values.floatValue;
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
                            <p>
                              Choose a processor to submit your transactions.
                            </p>
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
      </Form>
    </OverlayScrollbarsComponent>
  );
}
