"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState } from "react";
import { useUserWalletStore } from "@/stores/wallet/use-user-wallet.store";
import { useCopyTradeSettingsStore } from "@/stores/setting/use-copy-trade-settings.store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CopyTradePresetRequest,
  copyTradePresetSchema,
  updateCopyTradePreset,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import BaseButton from "../buttons/BaseButton";
import OnOffToggle from "../OnOffToggle";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import CustomToast from "../toasts/CustomToast";
import PresetButtonSelection from "./PresetButtonSelection";
import WalletSelectionButton from "../WalletSelectionButton";
import ProcessorSelectionButton from "../ProcessorSelectionButton";
import { PresetId, PresetKey } from "@/types/preset";
import {
  convertPresetIdToKey,
  convertPresetKeyToId,
} from "@/utils/convertPreset";
import ComingSoon from "../ComingSoon";
import { CachedImage } from "../CachedImage";

export default function CopyTradeSettings() {
  const queryClient = useQueryClient();
  const { activePreset, presets, setActivePreset } =
    useCopyTradeSettingsStore();
  const { activeWallet, setActiveWallet } = useUserWalletStore();

  const [selectedPreset, setSelectedPreset] = useState<PresetKey>(activePreset);
  const [isMEVEnabled, setIsMEVEnabled] = useState<boolean>(false);

  // Form setup
  const form = useForm<CopyTradePresetRequest>({
    resolver: zodResolver(copyTradePresetSchema),
    defaultValues: {
      preset: activePreset.replace("preset", ""),
      wallets: presets[activePreset]?.wallets || [],
      buyMethod: presets[activePreset]?.buyMethod || "Fixed",
      buyAmount: presets[activePreset]?.buyAmount || 0,
      minMarketCap: presets[activePreset]?.minMarketCap || 0,
      maxMarketCap: presets[activePreset]?.maxMarketCap || 0,
      minBuyTrigger: presets[activePreset]?.minBuyTrigger || 0,
      maxBuyTrigger: presets[activePreset]?.maxBuyTrigger || 0,
      followSales: presets[activePreset]?.followSales || false,
      buyOnce: presets[activePreset]?.buyOnce || false,
      buySlippage: presets[activePreset]?.buySlippage || 0,
      buyFee: presets[activePreset]?.buyFee || 0,
      buyTip: presets[activePreset]?.buyTip || 0,
      sellSlippage: presets[activePreset]?.sellSlippage || 0,
      sellFee: presets[activePreset]?.sellFee || 0,
      sellTip: presets[activePreset]?.sellTip || 0,
      buyProcessor: presets[activePreset]?.buyProcessor || "Jito",
      sellProcessor: presets[activePreset]?.sellProcessor || "Jito",
    },
  });

  // Update mutation
  const updateSettingsMutation = useMutation({
    mutationFn: updateCopyTradePreset,
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
  const handlePresetChange = (id: PresetId) => {
    const key = convertPresetIdToKey(id);
    setSelectedPreset(key);
    setActivePreset(key);
    form.setValue("preset", id.replace("S", ""));
  };

  const handleToggleSelectWallet = (selectedWallet: string) => {
    const currentWallets = form.getValues("wallets");
    const newWallets = currentWallets.includes(selectedWallet)
      ? currentWallets.filter((w) => w !== selectedWallet)
      : [...currentWallets, selectedWallet];

    form.setValue("wallets", newWallets);
  };

  const handleChangeMEVStatus = (status: "ON" | "OFF") => {
    const newProcessor = status === "ON" ? "Ultra" : "Jito";
    setIsMEVEnabled(status === "ON");
    form.setValue("buyProcessor", newProcessor);
    form.setValue("sellProcessor", newProcessor);
  };

  // Handle form submission
  const onSubmit = (data: CopyTradePresetRequest) => {
    const processor = data.buyProcessor;
    const { buyProcessor: _, ...rest } = data;
    const submitData = {
      ...rest,
      buyProcessor: processor,
      sellProcessor: processor,
      preset: data.preset.replace("preset", ""),
    };
    updateSettingsMutation.mutate(submitData);
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
    form.setValue("sellProcessor", value);
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
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex w-full flex-grow flex-col justify-between"
            >
              {/* Fields */}
              <div className="flex w-full flex-col">
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
                              className="md:max-w-[240px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </SettingGridCard>
                  <SettingGridCard
                    className="border-border md:border-b"
                    isInvisible
                  />
                </div>
                <div className="grid w-full grid-cols-1 xl:grid-cols-2">
                  <SettingGridCard
                    label="Buy Method"
                    description="How much less tokens you're willing to receive from a trade due to price volatility."
                    className="border-border md:border-b xl:border-r"
                  >
                    <FormField
                      control={form.control}
                      name="buyMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={(value) =>
                                field.onChange(value as string)
                              }
                            >
                              <SelectTrigger className="h-[32px] w-full md:max-w-[240px]">
                                <span className="inline-block text-nowrap font-geistSemiBold text-fontColorPrimary">
                                  <SelectValue placeholder="Select Buy Method" />
                                </span>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem
                                  value="Exact"
                                  className="font-geistSemiBold"
                                >
                                  Exact
                                </SelectItem>
                                <SelectItem
                                  value="Percentage"
                                  className="font-geistSemiBold"
                                >
                                  Percentage
                                </SelectItem>
                                <SelectItem
                                  value="Fixed"
                                  className="font-geistSemiBold"
                                >
                                  Fixed
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </SettingGridCard>
                  <SettingGridCard
                    label="Buy Amount"
                    description="How much more/less tokens you'll receive from a trade due to price volatility."
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
                    label="Min Market Cap"
                    description="Minimum market cap for trading"
                    className="border-border md:border-b xl:border-r"
                  >
                    <FormField
                      control={form.control}
                      name="minMarketCap"
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
                                form.trigger("minMarketCap");
                              }}
                              placeholder="0.0"
                              prefixEl={
                                <div className="absolute left-3.5 aspect-square h-4 w-4 flex-shrink-0">
                                  <Image
                                    src="/icons/token/currency.png"
                                    alt="Currency Icon"
                                    fill
                                    quality={100}
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
                    label="Max Market Cap"
                    description="Maximum market cap for trading"
                    className="border-border md:border-b"
                  >
                    <FormField
                      control={form.control}
                      name="maxMarketCap"
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
                                form.trigger("maxMarketCap");
                              }}
                              placeholder="0.0"
                              prefixEl={
                                <div className="absolute left-3.5 aspect-square h-4 w-4 flex-shrink-0">
                                  <Image
                                    src="/icons/token/currency.png"
                                    alt="Currency Icon"
                                    fill
                                    quality={100}
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
                    label="Min Buy Trigger"
                    description="How much less tokens you're willing to receive from a trade due to price volatility."
                    className="border-border md:border-b xl:border-r"
                  >
                    <FormField
                      control={form.control}
                      name="minBuyTrigger"
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
                                form.trigger("minBuyTrigger");
                              }}
                              placeholder="0.0"
                              prefixEl={
                                <div className="absolute left-3.5 aspect-square h-4 w-4 flex-shrink-0">
                                  <Image
                                    src="/icons/token/currency.png"
                                    alt="Currency Icon"
                                    fill
                                    quality={100}
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
                    label="Max Buy Trigger"
                    description="How much less tokens you're willing to receive from a trade due to price volatility."
                    className="border-border md:border-b"
                  >
                    <FormField
                      control={form.control}
                      name="maxBuyTrigger"
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
                                form.trigger("maxBuyTrigger");
                              }}
                              placeholder="0.0"
                              prefixEl={
                                <div className="absolute left-3.5 aspect-square h-4 w-4 flex-shrink-0">
                                  <Image
                                    src="/icons/token/currency.png"
                                    alt="Currency Icon"
                                    fill
                                    quality={100}
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
                    label="Follow Sales"
                    description="Enable following sales"
                    className="border-border md:border-b xl:border-r"
                  >
                    <FormField
                      control={form.control}
                      name="followSales"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <OnOffToggle
                              variant="dark"
                              value={field.value ? "ON" : "OFF"}
                              setValue={(value) =>
                                field.onChange(value === "ON")
                              }
                              className="h-[32px] md:w-[240px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </SettingGridCard>
                  <SettingGridCard
                    label="Buy Once"
                    description="Enable buy once"
                    className="border-border md:border-b"
                  >
                    <FormField
                      control={form.control}
                      name="buyOnce"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <OnOffToggle
                              variant="dark"
                              value={field.value ? "ON" : "OFF"}
                              setValue={(value) =>
                                field.onChange(value === "ON")
                              }
                              className="h-[32px] md:w-[240px]"
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
                    label="Buy Slippage"
                    description="How much less tokens you're willing to receive from a trade due to price volatility."
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
                  <SettingGridCard
                    label="Buy Fee"
                    description="How much more/less tokens you'll receive from a trade due to price volatility."
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
                                <div className="absolute left-3.5 aspect-auto h-[12px] w-[14px] flex-shrink-0">
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
                    label="Buy Tip"
                    description="How much less tokens you're willing to receive from a trade due to price volatility."
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
                                <div className="absolute left-3.5 aspect-auto h-[12px] w-[14px] flex-shrink-0">
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
                    label="Sell Slippage"
                    description="How much more/less tokens you'll receive from a trade due to price volatility."
                    className="border-border md:border-b"
                  >
                    <FormField
                      control={form.control}
                      name="sellSlippage"
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
                </div>
                <div className="grid w-full grid-cols-1 xl:grid-cols-2">
                  <SettingGridCard
                    label="Sell Fee"
                    description="How much less tokens you're willing to receive from a trade due to price volatility."
                    className="border-border md:border-b xl:border-r"
                  >
                    <FormField
                      control={form.control}
                      name="sellFee"
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
                                form.trigger("sellFee");
                              }}
                              placeholder="0.0"
                              prefixEl={
                                <div className="absolute left-3.5 aspect-auto h-[12px] w-[14px] flex-shrink-0">
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
                    label="Sell Tip"
                    description="How much less tokens you're willing to receive from a trade due to price volatility."
                    className="border-border md:border-b"
                  >
                    <FormField
                      control={form.control}
                      name="sellTip"
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
                                form.trigger("sellTip");
                              }}
                              placeholder="0.0"
                              prefixEl={
                                <div className="absolute left-3.5 aspect-auto h-[12px] w-[14px] flex-shrink-0">
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
                  <SettingGridCard
                    label="Processsor"
                    description="How much less tokens you're willing to receive from a trade due to price volatility."
                    className="border-border md:border-b xl:border-r"
                  >
                    <ProcessorSelectionButton
                      variant="dark"
                      setValue={handleChangeSelectedProcessor}
                      value={form.watch("buyProcessor")}
                      template={["Jito", "Node", "Ultra", "Ultra v2"]}
                      className="max-w-[356px]"
                    />
                  </SettingGridCard>
                </div>
              </div>

              <div className="flex h-[72px] w-full items-center justify-end border-t border-border p-4 md:w-full">
                <BaseButton
                  type="submit"
                  variant="primary"
                  className="h-[40px] w-full px-8 md:w-fit"
                >
                  <span className="inline-block font-geistSemiBold text-base text-[#080811]">
                    Save
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
