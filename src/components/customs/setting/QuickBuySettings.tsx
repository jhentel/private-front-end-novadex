"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  quickBuyPresetSchema,
  updateQuickBuyPreset,
  QuickBuyPresetRequest,
} from "@/apis/rest/settings/settings";
import CustomToast from "@/components/customs/toasts/CustomToast";
import toast from "react-hot-toast";
// ######## Components 🧩 ########
import SettingGridCard from "../cards/setting/SettingGridCard";
// ######## Utils & Helpers 🤝 ########
import BaseButton from "../buttons/BaseButton";
import OnOffToggle from "../OnOffToggle";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import ProcessorSelectionButton from "../ProcessorSelectionButton";
import PresetButtonSelection from "./PresetButtonSelection";
import CustomQuickBuyAndSellInput from "./CustomQuickBuyAndSellInput";
import {
  QuickBuyAmount,
  useQuickBuySettingsStore,
} from "@/stores/setting/use-quick-buy-settings.store";
import { PresetId, PresetKey } from "@/types/preset";
import {
  convertPresetIdToKey,
  convertPresetKeyToId,
} from "@/utils/convertPreset";
import { DEFAULT_QUICK_PICK_SOL_LIST } from "../SellBuyInputAmount";
import { CachedImage } from "../CachedImage";

interface QuickBuySettingsProps {
  setIsSaving?: (isSaving: boolean) => void;
  setActiveFormId?: (formId: string) => void;
  formId?: string;
  autoSave?: boolean;
}

export default function QuickBuySettings({
  setIsSaving,
  setActiveFormId,
  formId = "quick-buy-settings-form",
  autoSave = false,
}: QuickBuySettingsProps) {
  const queryClient = useQueryClient();
  const { activePreset, presets, setActivePreset } = useQuickBuySettingsStore();

  const [selectedPreset, setSelectedPreset] = useState<PresetKey>(activePreset);
  const [isMEVEnabled, setIsMEVEnabled] = useState<boolean>(true);
  const [localQuickBuyAmount, setLocalQuickBuyAmount] = useState<
    QuickBuyAmount[]
  >([]);
  const [inputStrings, setInputStrings] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Inform parent component about this form's ID
  useEffect(() => {
    if (setActiveFormId) {
      setActiveFormId(formId);
    }
  }, [setActiveFormId, formId]);

  // Initialize form with current preset data
  const form = useForm<QuickBuyPresetRequest>({
    resolver: zodResolver(quickBuyPresetSchema),
    defaultValues: {
      preset: activePreset.replace("preset", ""),
      slippage: presets[activePreset]?.slippage || 0,
      autoTipEnabled: presets[activePreset]?.autoTipEnabled || false,
      fee: presets[activePreset]?.fee || 0,
      tip: presets[activePreset]?.tip || 0,
      processor:
        presets[activePreset]?.processor === "secure"
          ? "Jito"
          : presets[activePreset]?.processor || "Jito",
      amounts: presets[activePreset]?.amounts || [0, 0, 0, 0, 0],
    },
  });

  // Reset form when preset changes
  const currentPreset = presets[selectedPreset];
  useEffect(() => {
    if (currentPreset) {
      form.reset({
        preset: selectedPreset.replace("preset", ""),
        slippage: currentPreset?.slippage,
        autoTipEnabled: currentPreset?.autoTipEnabled,
        fee: currentPreset?.fee,
        tip: currentPreset?.tip,
        processor: currentPreset?.processor,
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
      setIsMEVEnabled(
        currentPreset?.processor === "secure" ||
          currentPreset?.processor === "Jito",
      );
    }
    setIsLoading(false);
  }, [selectedPreset, presets]);

  // Handle MEV toggle
  const handleChangeMEVStatus = (status: "ON" | "OFF") => {
    // If MEV protection is turned ON, force processor to JITO
    if (status === "ON") {
      form.setValue("processor", "Jito");
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message={`Sniper mode changed to Jito`}
          state="SUCCESS"
        />
      ));
    }
    // If turning MEV OFF and current processor is JITO, default to NODE
    else if (form.getValues()?.processor === "Jito") {
      form.setValue("processor", "Node");
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message={`Sniper mode changed to Node`}
          state="SUCCESS"
        />
      ));
    }
    setIsMEVEnabled(status === "ON");
  };

  // Handle amount changes locally
  const handleChangeQuickBuyAmount = (order: number, value: string) => {
    const isValid = /^-?\d*\.?\d*$/.test(value);
    if (isValid) {
      setInputStrings((prev) => ({ ...prev, [order]: value }));

      if (!value.endsWith(".") && !value.endsWith("-")) {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          const newAmounts = localQuickBuyAmount.map((item) =>
            item.order === order ? { ...item, amount: numValue } : item,
          );
          setLocalQuickBuyAmount(newAmounts);
          form.setValue(
            "amounts",
            newAmounts.map((item) => item.amount),
          );
        }
      }
    }
  };

  // Update mutation with refetch
  const updateSettingsMutation = useMutation({
    mutationFn: updateQuickBuyPreset,
    onMutate: () => {
      // Inform parent component that saving is in progress
      if (setIsSaving) {
        setIsSaving(true);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
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
    form.setValue("preset", key.replace("preset", ""));
  };

  // Handle form submission
  const onSubmit = (data: QuickBuyPresetRequest) => {
    const isDuplicateAmount = localQuickBuyAmount.some((item, index) =>
      localQuickBuyAmount
        .slice(index + 1)
        .some((i) => i.amount === item.amount),
    );
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

    // Add validation for minimum tip amount if auto-tip is disabled
    // if (!data.autoTipEnabled && data.tip < 0.001) {
    //   toast.custom((t: any) => (
    //     <CustomToast
    //       tVisibleState={t.visible}
    //       message="We recommend a minimum tip of 0.001 for faster transaction"
    //       state="ERROR"
    //     />
    //   ));
    //   return;
    // }

    // Add validation for minimum fee amount if auto-tip is disabled
    // if (!data.autoTipEnabled && data.fee < 0.001) {
    //   toast.custom((t: any) => (
    //     <CustomToast
    //       tVisibleState={t.visible}
    //       message="We recommend a minimum tip of 0.001 for faster transaction"
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

  const handleChangeSelectedProcessor = (value: string) => {
    toast.custom((t: any) => (
      <CustomToast
        tVisibleState={t.visible}
        message={`Processor changed to ${value}`}
        state="SUCCESS"
      />
    ));

    // If selecting JITO, enable MEV protection
    if (value === "Jito") {
      setIsMEVEnabled(true);
    }
    // If selecting NODE or ULTRA, disable MEV protection
    else {
      setIsMEVEnabled(false);
    }
    form.setValue("processor", value);
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
    <div className="relative flex h-auto w-full flex-grow flex-col rounded-[8px] max-xl:mb-[72px] max-md:pb-2">
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
            };
            form.reset(finalData);
            form.handleSubmit(onSubmit)(e);
          }}
          className="flex w-full flex-grow flex-col justify-between rounded-b-[8px] xl:bg-[#1B1B24]"
        >
          <div className="flex w-full flex-col">
            <div className="grid w-full grid-cols-1 xl:grid-cols-2">
              <SettingGridCard
                label="Slippage"
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
                            if (value < 0) return;
                            field.onChange(value);
                          }}
                          placeholder="Enter Slippage"
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
                label="Auto-Tip"
                description="Automatically judges the best tip and applies it to your transaction."
                className="border-border md:border-b"
                indicator={form.getValues().autoTipEnabled ? "ON" : "OFF"}
              >
                <FormField
                  control={form.control}
                  name="autoTipEnabled"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <OnOffToggle
                          variant="dark"
                          value={field.value ? "ON" : "OFF"}
                          setValue={(value) => {
                            const enabled = value === "ON";
                            field.onChange(enabled);
                          }}
                          className="h-[32px] md:w-[240px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </SettingGridCard>
            </div>

            {!form.watch("autoTipEnabled") && (
              <div className="grid w-full grid-cols-1 xl:grid-cols-2">
                <SettingGridCard
                  label="Priority Fee"
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

                              // Update the field value
                              field.onChange(newValue);

                              // Show toast if value is invalid and not empty/zero
                              // if (
                              //   !form.getValues().autoTipEnabled &&
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
                        {form.watch("fee") < 0.001 ? (
                          <FormMessage className="leading-4">We recommend a minimum tip of 0.001 for faster transaction</FormMessage>
                        ) : (
                          <FormMessage />
                        )}
                      </FormItem>
                    )}
                  />
                </SettingGridCard>

                <SettingGridCard
                  label="Buy Tip"
                  description="An additional tip to incentivise validators to pick up your transactions faster."
                  className="border-border md:border-b"
                >
                  <FormField
                    control={form.control}
                    name="tip"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            isNumeric
                            decimalScale={9}
                            onNumericValueChange={(values) => {
                              const newValue =
                                values.floatValue === undefined
                                  ? 0
                                  : values.floatValue;

                              // Update the field value
                              field.onChange(newValue);

                              // Show toast if value is invalid and not empty/zero
                              // if (
                              //   !form.getValues().autoTipEnabled &&
                              //   newValue < 0.001 &&
                              //   newValue !== 0
                              // ) {
                              //   toast.custom((t: any) => (
                              //     <CustomToast
                              //       tVisibleState={t.visible}
                              //       message="Buy Tip must be at least 0.001 SOL"
                              //       state="ERROR"
                              //     />
                              //   ));
                              // }

                              form.trigger("tip");
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
            )}

            <div className="xl:grid-cols- grid w-full grid-cols-1">
              <SettingGridCard
                label="Smart-Mev Protection"
                description="Protect your transaction from MEV Attacks."
                className="border-border md:border-b xl:border-r"
                indicator={isMEVEnabled ? "ON" : "OFF"}
              >
                <OnOffToggle
                  variant="dark"
                  value={isMEVEnabled ? "ON" : "OFF"}
                  setValue={handleChangeMEVStatus}
                  className="h-[32px] md:w-[240px]"
                />
              </SettingGridCard>
              <SettingGridCard
                label="Processor"
                description="Different processors to optimise your trading speeds."
                className="border-border md:border-b xl:border-r"
              >
                <ProcessorSelectionButton
                  variant="dark"
                  setValue={handleChangeSelectedProcessor}
                  value={
                    form.watch("processor") === "secure"
                      ? "Jito"
                      : form.watch("processor")
                  }
                  template={["Jito", "Node", "Ultra"]}
                  className="max-w-[356px]"
                />
              </SettingGridCard>
            </div>
            <div className="grid w-full grid-cols-1 xl:grid-cols-2">
              <SettingGridCard
                label="Customize"
                description="Change your Quick Buy buttons with your own amounts."
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
                      handleChangeQuickBuyAmount(order, value);
                    }}
                  />
                )}
              </SettingGridCard>
              <SettingGridCard
                className="border-border max-md:hidden"
                isInvisible
              />
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
