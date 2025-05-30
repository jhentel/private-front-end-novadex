"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState, useEffect } from "react";
import { useUserWalletStore } from "@/stores/wallet/use-user-wallet.store";
import { useLimitOrderSettingsStore } from "@/stores/setting/use-limit-order-settings.store";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  LimitOrderPresetRequest,
  limitOrderPresetSchema,
  updateLimitOrderPreset,
} from "@/apis/rest/settings/settings";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
// ######## Components 🧩 ########
import Image from "next/image";
import SettingGridCard from "../cards/setting/SettingGridCard";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import BaseButton from "../buttons/BaseButton";
import OnOffToggle from "../OnOffToggle";
import { Input } from "@/components/ui/input";
import ProcessorSelectionButton from "../ProcessorSelectionButton";
import WalletSelectionButton from "../WalletSelectionButton";
import PresetButtonSelection from "./PresetButtonSelection";
import CustomToast from "../toasts/CustomToast";
import toast from "react-hot-toast";
import { PresetId, PresetKey } from "@/types/preset";
import {
  convertPresetIdToKey,
  convertPresetKeyToId,
} from "@/utils/convertPreset";
import ComingSoon from "../ComingSoon";
import { CachedImage } from "../CachedImage";

export default function BuyLimitOrderSettings() {
  const queryClient = useQueryClient();
  const { activePreset, presets, setActivePreset } =
    useLimitOrderSettingsStore();
  const { activeWallet, setActiveWallet } = useUserWalletStore();

  const [selectedPreset, setSelectedPreset] = useState<PresetKey>(activePreset);
  const [isMEVEnabled, setIsMEVEnabled] = useState<boolean>(false);

  // Form setup
  const form = useForm<LimitOrderPresetRequest>({
    resolver: zodResolver(limitOrderPresetSchema),
    defaultValues: {
      preset: activePreset.replace("preset", ""),
      wallets: presets[activePreset]?.wallets || [],
      buySlippage: presets[activePreset]?.buySlippage || 0,
      sellSlippage: presets[activePreset]?.sellSlippage || 0,
      buyFee: presets[activePreset]?.buyFee || 0,
      sellFee: presets[activePreset]?.sellFee || 0,
      buyTip: presets[activePreset]?.buyTip || 0,
      sellTip: presets[activePreset]?.sellTip || 0,
      buyProcessor: presets[activePreset]?.buyProcessor || "Jito",
      sellProcessor: presets[activePreset]?.sellProcessor || "Jito",
    },
  });

  // Update form when preset changes
  useEffect(() => {
    const currentPreset = presets[selectedPreset];
    if (currentPreset) {
      form.reset({
        preset: selectedPreset.replace("preset", ""),
        wallets: currentPreset.wallets,
        buySlippage: currentPreset.buySlippage,
        sellSlippage: currentPreset.sellSlippage,
        buyFee: currentPreset.buyFee,
        sellFee: currentPreset.sellFee,
        buyTip: currentPreset.buyTip,
        sellTip: currentPreset.sellTip,
        buyProcessor: currentPreset.buyProcessor,
        sellProcessor: currentPreset.sellProcessor,
      });
      setIsMEVEnabled(currentPreset.buyProcessor === "Ultra");
    }
  }, [selectedPreset, presets]);

  // Handle MEV toggle
  const handleChangeMEVStatus = (status: "ON" | "OFF") => {
    form.setValue("buyProcessor", status === "OFF" ? "Jito" : "Ultra");
    setIsMEVEnabled(status === "ON");
  };

  // Mutation
  const updateSettingsMutation = useMutation({
    mutationFn: updateLimitOrderPreset,
    onSuccess: () => {
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message="Settings updated successfully"
          state="SUCCESS"
        />
      ));
      queryClient.invalidateQueries({ queryKey: ["settings"] });
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

  // Handlers
  const onSubmit = (data: LimitOrderPresetRequest) => {
    const submitData = {
      ...data,
      preset: data.preset.replace("preset", ""),
    };
    updateSettingsMutation.mutate(submitData);
  };

  const handleToggleSelectWallet = (selectedWallet: string) => {
    const currentWallets = form.getValues("wallets");
    const newWallets = currentWallets.includes(selectedWallet)
      ? currentWallets.filter((w) => w !== selectedWallet)
      : [...currentWallets, selectedWallet];

    form.setValue("wallets", newWallets);
  };

  const handlePresetChange = (id: PresetId) => {
    const key = convertPresetIdToKey(id);
    setSelectedPreset(key);
    setActivePreset(key);
    form.setValue("preset", id.replace("S", ""));
  };

  const handleChangeSmartMEVProtectionStatus = (value: "ON" | "OFF") => {
    handleChangeMEVStatus(value);
  };

  const handleChangeSelectedProcessor = (value: string) => {
    if (value === "Ultra") {
      setIsMEVEnabled(true);
    } else {
      setIsMEVEnabled(false);
    }
    form.setValue("buyProcessor", value);
  };

  return (
    <>
      {true ? (
        <ComingSoon />
      ) : (
        <div className="flex h-auto w-full flex-grow flex-col overflow-hidden rounded-[8px] bg-white/[4%]">
          <PresetButtonSelection
            onClick={handlePresetChange}
            value={convertPresetKeyToId(selectedPreset)}
          />
          <Form {...form}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit(onSubmit)();
              }}
              className="flex w-full flex-grow flex-col justify-between"
            >
              <div className="flex w-full flex-col">
                {/* Wallet Selection */}
                <div className="grid w-full grid-cols-1 xl:grid-cols-2">
                  <SettingGridCard
                    label="Default Wallet"
                    description="Select default wallet"
                    className="border-border md:border-b xl:border-r"
                  >
                    <FormField
                      control={form.control}
                      name="wallets"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <WalletSelectionButton
                              setValue={(value) => {
                                setActiveWallet(value[0]);
                                field.onChange(value[0].address);
                              }}
                              value={[activeWallet]}
                              isMultipleSelect={false}
                              maxWalletShow={10}
                              // maxWalletShow={1}
                              className="md:max-w-[240px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </SettingGridCard>
                  <SettingGridCard
                    isInvisible
                    className="border-border md:border-b"
                  />
                </div>

                {/* Buy Slippage */}
                <div className="grid w-full grid-cols-1 xl:grid-cols-2">
                  <SettingGridCard
                    label="Buy Slippage"
                    description="Slippage percentage for buy orders"
                    className="border-border md:border-b xl:border-r"
                  >
                    <FormField
                      control={form.control}
                      name="buySlippage"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                if (
                                  !isNaN(value) &&
                                  value >= 0 &&
                                  value <= 100
                                ) {
                                  field.onChange(value);
                                }
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

                  {/* Buy Fee */}
                  <SettingGridCard
                    label="Buy Fee"
                    description="Fee for buy orders"
                    className="border-border md:border-b"
                  >
                    <FormField
                      control={form.control}
                      name="buyFee"
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
                                form.trigger("buyFee");
                              }}
                              placeholder="0.0"
                              prefixEl={
                                <div className="absolute left-3.5 aspect-square h-4 w-4 flex-shrink-0">
                                  <CachedImage
                                    src="/icons/solana-sq.svg"
                                    alt="Solana Icon"
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

                {/* Buy Tip & Auto Tip */}
                <div className="grid w-full grid-cols-1 xl:grid-cols-2">
                  <SettingGridCard
                    label="Buy Tip"
                    description="Tip for buy orders"
                    className="border-border md:border-b xl:border-r"
                  >
                    <FormField
                      control={form.control}
                      name="buyTip"
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
                                form.trigger("buyTip");
                              }}
                              placeholder="0.0"
                              prefixEl={
                                <div className="absolute left-3.5 aspect-square h-4 w-4 flex-shrink-0">
                                  <CachedImage
                                    src="/icons/solana-sq.svg"
                                    alt="Solana Icon"
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
                    label="Smart-Mev Protection"
                    description="How much less tokens you're willing to receive from a trade due to price volatility."
                    className="border-border md:border-b xl:border-r"
                  >
                    <OnOffToggle
                      variant="dark"
                      value={isMEVEnabled ? "ON" : "OFF"}
                      setValue={handleChangeSmartMEVProtectionStatus}
                      className="h-[32px] md:w-[240px]"
                    />
                  </SettingGridCard>
                </div>

                <div className="grid w-full grid-cols-1 xl:grid-cols-2">
                  <SettingGridCard
                    label="Buy Processor"
                    description="Select processor for buy orders"
                    className="border-border md:border-b xl:border-r"
                  >
                    <FormField
                      control={form.control}
                      name="buyProcessor"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <ProcessorSelectionButton
                              variant="dark"
                              setValue={handleChangeSelectedProcessor}
                              value={field.value}
                              template={["Jito", "Node", "Ultra", "Ultra v2"]}
                              className="max-w-[356px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </SettingGridCard>
                  <SettingGridCard
                    isInvisible
                    className="border-border md:border-b xl:border-r"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex h-[72px] w-full items-center justify-end border-t border-border p-4 md:w-full">
                <BaseButton
                  type="submit"
                  variant="primary"
                  className="h-[40px] w-full px-8 md:w-fit"
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
      )}
    </>
  );
}
