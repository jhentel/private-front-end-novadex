"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
// ######## Components 🧩 ########
import SettingGridCard from "../cards/setting/SettingGridCard";
import { updateBuySniperPreset } from "@/apis/rest/settings/settings";
import CustomToast from "@/components/customs/toasts/CustomToast";
import toast from "react-hot-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
// ######## Utils & Helpers 🤝 ########
import BaseButton from "../buttons/BaseButton";
import OnOffToggle, { SnipeModeToggle } from "../OnOffToggle";
import { Input } from "@/components/ui/input";
import PresetButtonSelection from "./PresetButtonSelection";
import {
  BuySniperPresetRequest,
  buySniperPresetSchema,
} from "@/apis/rest/settings/settings";
import {
  SnipeBuyAmount,
  useBuySniperSettingsStore,
} from "@/stores/setting/use-buy-sniper-settings.store";
import { PresetId, PresetKey } from "@/types/preset";
import {
  convertPresetIdToKey,
  convertPresetKeyToId,
} from "@/utils/convertPreset";
import CustomQuickBuyAndSellInput from "./CustomQuickBuyAndSellInput";
import { DEFAULT_QUICK_PICK_SOL_LIST } from "../SellBuyInputAmount";
import debounce from "lodash/debounce";
import isEqual from "lodash/isEqual";
import { CachedImage } from "../CachedImage";

// Add props interface to accept state handlers from parent
interface BuySniperSettingsProps {
  setIsSaving?: (isSaving: boolean) => void;
  setActiveFormId?: (formId: string) => void;
  formId?: string;
  autoSave?: boolean;
}

export default function BuySniperSettings({
  setIsSaving,
  setActiveFormId,
  formId = "buy-sniper-settings-form",
  autoSave = false,
}: BuySniperSettingsProps) {
  const queryClient = useQueryClient();
  const { activePreset, presets, setActivePreset } =
    useBuySniperSettingsStore();

  const [localQuickBuyAmount, setLocalQuickBuyAmount] = useState<
    SnipeBuyAmount[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [selectedPreset, setSelectedPreset] = useState<PresetKey>(activePreset);

  // Inform parent component about this form's ID
  useEffect(() => {
    if (setActiveFormId) {
      setActiveFormId(formId);
    }
  }, [setActiveFormId, formId]);

  // Form setup with default values
  const form = useForm<BuySniperPresetRequest>({
    resolver: zodResolver(buySniperPresetSchema),
    defaultValues: {
      preset: activePreset.replace("preset", ""),
      slippage: presets[activePreset]?.slippage || 0,
      fee: presets[activePreset]?.fee || 0,
      minTip: presets[activePreset]?.minTip || 0,
      maxTip: presets[activePreset]?.maxTip || 0,
      buyAmount: presets[activePreset]?.buyAmount || 0,
      minAmountOut: presets[activePreset]?.minAmountOut || 0,
      processor: presets[activePreset]?.processor || "fast",
      mevProtectEnabled:
        presets[activePreset]?.processor === "secure" ? "ON" : "OFF",
    },
  });

  // Reset form when preset changes
  const currentPreset = presets[selectedPreset];
  useEffect(() => {
    if (currentPreset) {
      form.reset({
        preset: selectedPreset.replace("preset", ""),
        slippage: currentPreset?.slippage,
        fee: currentPreset?.fee,
        minTip: currentPreset?.minTip,
        maxTip: currentPreset?.maxTip,
        buyAmount: currentPreset?.buyAmount,
        minAmountOut: currentPreset?.minAmountOut ?? 0,
        processor: currentPreset?.processor,
        mevProtectEnabled: currentPreset?.processor === "secure" ? "ON" : "OFF",
        amounts: currentPreset?.amounts,
      });
      setLocalQuickBuyAmount(
        (currentPreset?.amounts && currentPreset?.amounts?.length == 6
          ? currentPreset?.amounts
          : DEFAULT_QUICK_PICK_SOL_LIST
        )?.map((amount, index) => ({
          order: index + 1,
          amount,
        })),
      );
      setIsLoading(false);
    }
  }, [selectedPreset, presets]);

  // Update mutation with refetch
  const updateSettingsMutation = useMutation({
    mutationFn: updateBuySniperPreset,
    onMutate: () => {
      // Inform parent component that saving is in progress
      if (setIsSaving) {
        setIsSaving(true);
      }
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      // Inform parent component that saving is complete
      if (setIsSaving) {
        setIsSaving(false);
      }
    },
    onError: (error: Error) => {
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message={error.message}
          state="ERROR"
        />
      ));
      // Inform parent component that saving is complete (but with error)
      if (setIsSaving) {
        setIsSaving(false);
      }
    },
  });

  // Handle preset change
  const handlePresetChange = (id: PresetId) => {
    if (autoSave) {
      form.handleSubmit(onSubmit)();
    }
    const key = convertPresetIdToKey(id);
    setSelectedPreset(key);
    setActivePreset(key);
    // Update form with numeric ID (1-5)
    // form.setValue("preset", key.replace("S", ""));
    form.setValue("preset", key.replace("preset", ""));
  };

  // Handle amount changes locally
  const handleChangeSnipeBuyAmount = (order: number, value: string) => {
    const isValid = /^[1-9]\d*(\.\d+)?$|^0(\.\d+)?$/.test(value);
    if (isValid) {
      const newAmounts = localQuickBuyAmount.map((item) =>
        item.order === order ? { ...item, amount: parseFloat(value) } : item,
      );
      setLocalQuickBuyAmount(newAmounts);
      form.setValue(
        "amounts",
        newAmounts.map((item) => item.amount),
      );
    }
  };

  // Handle form submission
  const onSubmit = (data: BuySniperPresetRequest) => {
    // const isDuplicateAmount = localQuickBuyAmount.some((item, index) =>
    //   localQuickBuyAmount
    //     .slice(index + 1)
    //     .some((i) => i.amount === item.amount),
    // );
    // if (isDuplicateAmount) {
    //   toast.custom((t: any)=> (
    //     <CustomToast
    //       tVisibleState={t.visible}
    //       message="Duplicate amounts are not allowed"
    //       state="ERROR"
    //     />
    //   ));
    //   return;
    // }
    const submitData = {
      ...data,
      preset: data.preset.replace("preset", ""),
    };

    updateSettingsMutation.mutate(submitData);
  };

  // Add a ref to track if form was modified
  const wasFormModified = useRef(false);

  // Modify the useEffect to only submit if form was modified
  useEffect(() => {
    wasFormModified.current = false;
    const subscription = form.watch(() => {
      wasFormModified.current = true;
    });

    return () => {
      if (wasFormModified.current) {
        form.handleSubmit(onSubmit)();
      }
      wasFormModified.current = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="relative flex h-auto w-full flex-grow flex-col rounded-[8px] max-xl:mb-[72px]">
      <PresetButtonSelection
        onClick={handlePresetChange}
        value={convertPresetKeyToId(selectedPreset)}
      />
      <Form {...form}>
        <form
          id={formId}
          onSubmit={(e) => {
            e.preventDefault();
            const finalData = {
              ...form.getValues(),
              slippage: Number(form.getValues().slippage) || 1,
              amounts: localQuickBuyAmount.map((item) => Number(item.amount)),
              processor: ["fast", "secure", "auto"].includes(
                form.getValues("processor"),
              )
                ? form.getValues("processor")
                : "fast",
            };
            form.reset(finalData);
            form.handleSubmit(onSubmit)(e);
          }}
          className="flex w-full flex-grow flex-col justify-between rounded-b-[8px] xl:bg-[#1B1B24]"
        >
          <div className="flex w-full flex-col">
            <div className="grid w-full grid-cols-1 xl:grid-cols-2">
              <SettingGridCard
                label="Buy Slippage"
                description="The amount of tokens you may lose due to price volatility."
                className="border-border md:border-b xl:border-r"
              >
                <FormField
                  control={form.control}
                  name="slippage"
                  render={({ field }) => (
                    <FormItem>
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
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-fontColorSecondary">
                              %
                            </span>
                          }
                          parentClassName="md:max-w-[240px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </SettingGridCard>
              <SettingGridCard
                label="Buy Amount"
                description="The amount of SOL you wish to snipe token with."
                className="border-border md:border-b"
              >
                <FormField
                  control={form.control}
                  name="buyAmount"
                  render={({ field }) => (
                    <FormItem>
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
                            form.trigger("buyAmount");
                          }}
                          placeholder="0.0"
                          prefixEl={
                            <div className="absolute left-3.5 aspect-square h-4 w-4 flex-shrink-0">
                              <CachedImage
                                src="/icons/solana-sq.svg"
                                alt="Solana SQ Icon"
                                fill
                                quality={50}
                                className="object-contain"
                              />
                            </div>
                          }
                          parentClassName="md:max-w-[240px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </SettingGridCard>
            </div>
            <div className="grid w-full grid-cols-1 border-border md:border-b xl:grid-cols-2 xl:border-r">
              <SettingGridCard
                label="Minimum Buy Tip"
                description="The minimum amount your Buy Tip will be set to."
                className="border-border xl:border-r"
              >
                <FormField
                  control={form.control}
                  name="minTip"
                  render={({ field }) => (
                    <FormItem>
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
                                quality={50}
                                className="object-contain"
                              />
                            </div>
                          }
                          parentClassName="md:max-w-[240px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </SettingGridCard>
              <SettingGridCard
                label="Maximum Buy Tip"
                description="The maximum amount your Buy Tip will be set to."
                className="border-border"
              >
                <FormField
                  control={form.control}
                  name="maxTip"
                  render={({ field }) => (
                    <FormItem>
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
                                quality={50}
                                className="object-contain"
                              />
                            </div>
                          }
                          parentClassName="md:max-w-[240px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </SettingGridCard>
            </div>
            <div className="grid w-full grid-cols-1 xl:grid-cols-2">
              <SettingGridCard
                label="Buy Fee"
                description="The amount of extra SOL paid for validators to pick up your transaction."
                className="border-border md:border-b xl:border-r"
              >
                <FormField
                  control={form.control}
                  name="fee"
                  render={({ field }) => (
                    <FormItem>
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
                                quality={50}
                                className="object-contain"
                              />
                            </div>
                          }
                          parentClassName="md:max-w-[240px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </SettingGridCard>

              <SettingGridCard
                label="Smart-MEV Protection"
                description="Protect your transaction from MEV Attacks."
                className="border-border md:border-b xl:border-r"
                indicator={form.watch("mevProtectEnabled")}
              >
                <FormField
                  control={form.control}
                  name="mevProtectEnabled"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <OnOffToggle
                          variant="dark"
                          value={field.value}
                          setValue={(value) => {
                            field.onChange(value);
                            if (value == "ON") {
                              form.setValue("processor", "secure");
                            } else {
                              form.setValue("processor", "fast");
                            }
                            toast.custom((t: any) => (
                              <CustomToast
                                tVisibleState={t.visible}
                                message={`Sniper mode changed to ${value}`}
                                state="SUCCESS"
                              />
                            ));
                          }}
                          className="h-[32px] md:w-[240px]"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </SettingGridCard>
            </div>
            <div className="grid w-full grid-cols-1 xl:grid-cols-2">
              <SettingGridCard
                label="Sniper Mode"
                description="Choose whether to prioritise MEV Protection or Speed."
                className="border-border md:border-b xl:border-r"
              >
                <FormField
                  control={form.control}
                  name="processor"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <SnipeModeToggle
                          setValue={(value) => {
                            toast.custom((t: any) => (
                              <CustomToast
                                tVisibleState={t.visible}
                                message={`Sniper mode changed to ${value}`}
                                state="SUCCESS"
                              />
                            ));
                            field.onChange(value);
                          }}
                          value={field.value as "fast" | "secure"}
                          className="h-[32px] md:w-[240px]"
                          variant="dark"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </SettingGridCard>
              <SettingGridCard
                label="Minimum Amount Out"
                description="Input the minimum amount of tokens you want to receive for this snipe."
                className="border-border md:border-b xl:border-r"
              >
                <FormField
                  control={form.control}
                  name="minAmountOut"
                  render={({ field }) => (
                    <FormItem>
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
                                quality={50}
                                className="object-contain"
                              />
                            </div>
                          }
                          parentClassName="md:max-w-[240px]"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </SettingGridCard>
            </div>
            <div className="grid w-full grid-cols-1 xl:grid-cols-2">
              <SettingGridCard
                label="Customize"
                description="Change your Buy Sniper buttons with your own amounts."
                className="border-border xl:border-r"
              >
                {!isLoading && (
                  <CustomQuickBuyAndSellInput
                    presetAmount={
                      currentPreset?.amounts &&
                      currentPreset?.amounts.length == 6
                        ? currentPreset?.amounts
                        : DEFAULT_QUICK_PICK_SOL_LIST
                    }
                    type="buy"
                    values={localQuickBuyAmount}
                    onChange={(order, value) => {
                      handleChangeSnipeBuyAmount(order, value.toString());
                    }}
                  />
                )}
              </SettingGridCard>
              <SettingGridCard className="border-border" isInvisible />
            </div>
          </div>

          {/* Mobile Save button - only visible on mobile */}
          <div className="fixed bottom-0 left-0 flex h-[72px] w-full items-center justify-end border-t border-border bg-card p-4 md:hidden">
            <BaseButton
              type="submit"
              variant="primary"
              className="h-[40px] w-full px-8"
              disabled={updateSettingsMutation.isPending}
            >
              <span className="inline-block font-geistSemiBold text-base text-[#080811]">
                {updateSettingsMutation.isPending ? "Saving..." : "Save"}
              </span>
            </BaseButton>
          </div>
        </form>
      </Form>
    </div>
  );
}
