"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
// ######## Components 🧩 ########
import { FormEvent } from "react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import Separator from "../../Separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import CustomToast from "../../toasts/CustomToast";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import {
  Preset,
  useActivePresetStore,
} from "@/stores/dex-setting/use-active-preset.store";
import BaseButton from "../../buttons/BaseButton";
import LabelStatusIndicator from "../../LabelStatusIndicator";
import OnOffToggle from "../../OnOffToggle";
import { Input } from "@/components/ui/input";
import PresetSelectionButtons from "../../PresetSelectionButtons";
import { CachedImage } from "../../CachedImage";

type LimitOrdersEditBuyFormProps = {
  toggleModal: () => void;
};

export default function LimitOrdersEditBuyForm({
  toggleModal,
}: LimitOrdersEditBuyFormProps) {
  // Buy Fields Configuration 📝
  const [selectedBuyOrderOption, setSelectedBuyOrderOption] = useState<
    "Market Cap" | "Price" | "Dev Sell" | "Profit %"
  >("Market Cap");
  const { presetOptions, cosmoActivePreset, setCosmoActivePreset } =
    useActivePresetStore();

  // Order Tab
  // ### Market Cap
  const [marketCapCondition, setMarketCapCondition] = useState<"UP" | "DOWN">(
    "DOWN",
  );
  const [marketCapMCStatus, setMarketCapMCStatus] = useState<"MC">("MC");
  // ### Price
  const [priceCondition, setPriceCondition] = useState<"UP" | "DOWN">("DOWN");
  const [priceStatus, setPriceStatus] = useState<"Price">("Price");
  // ### Dev Sell
  const [devSellCondition, setDevSellCondition] = useState<"UP" | "DOWN">(
    "DOWN",
  );

  const [buyAmount, setBuyAmount] = useState<number | undefined>(undefined);
  const handleChangeBuyAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const isValid = /^[1-9]\d*(\.\d+)?$|^0(\.\d+)?$/.test(value);

    if (isValid) {
      setBuyAmount(parseFloat(value));
    }
  };
  const [expiresInHours, setExpiresInHours] = useState<number>(24);
  const handleChangeExpiresInHours = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    const parsedValue = parseFloat(value);
    const isValid =
      /^\d*\.?\d*$/.test(value) && parsedValue >= 1 && parsedValue <= 24;

    if (isValid) {
      setExpiresInHours(parsedValue);
    }
  };

  // Advance Settings Configuration ⚙️
  const [openAdvanceSettings, setOpenAdvanceSettings] = useState<boolean>(true);
  const handleToggle = () => {
    setOpenAdvanceSettings((prev) => !prev);
  };

  const [slippagePercentage, setSlippagePercentage] = useState<number>(20);
  const [MEVProtectStatus, setMEVProtectStatus] = useState<"ON" | "OFF">("ON");
  const [autoTipStatus, setAutoTipStatus] = useState<"ON" | "OFF">("OFF");
  const [priorityFee, setPriorityFee] = useState<number>(20);
  const [briberyAmount, setBriberyAmount] = useState<number>(20);

  const handleChangeSlippagePercentage = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    const isValid = /^[1-9]$|^[1-9][0-9]$|^100$/.test(value);

    if (isValid) {
      setSlippagePercentage(parseInt(value));
    }
  };
  const handleChangePriorityFee = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const isValid = /^[1-9]\d*(\.\d+)?$|^0(\.\d+)?$/.test(value);

    if (isValid) {
      setPriorityFee(parseFloat(value));
    }
  };
  const handleChangeBriberyAmount = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    const isValid = /^[1-9]\d*(\.\d+)?$|^0(\.\d+)?$/.test(value);

    if (isValid) {
      setBriberyAmount(parseFloat(value));
    }
  };

  // Save Configuration 🆙
  const formRef = useRef<HTMLFormElement | null>(null);
  const handleSubmitOutside = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  const handleSave = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Add your form submission logic here
    toggleModal();
    toast.custom((t: any) => (
      <CustomToast tVisibleState={t.visible} message="Success toast" />
    ));
  };

  return (
    <>
      <OverlayScrollbarsComponent
        defer
        element="div"
        className="modal__overlayscrollbar relative h-full w-full flex-grow overflow-y-scroll pb-16"
      >
        <form
          ref={formRef}
          onSubmit={handleSave}
          className="absolute top-0 h-auto w-full pb-16"
        >
          {/* Buy Fields */}
          <div className="flex w-full items-center justify-between gap-y-4 border-b border-border px-4 py-3">
            <PresetSelectionButtons isWithSetting isWithLabel />
          </div>
          <div className="flex w-full flex-col gap-y-4 px-4 pt-4">
            <div className="flex w-full flex-col gap-y-4">
              <div className="relative h-[34px] w-full rounded-[8px] border border-border p-[3px]">
                <div className="flex h-full w-full rounded-[6px] bg-white/[8%]">
                  <button
                    type="button"
                    onClick={() => setSelectedBuyOrderOption("Market Cap")}
                    className={cn(
                      "w-full cursor-pointer rounded-[6px] font-geistSemiBold text-sm text-fontColorSecondary duration-300 hover:text-[#cccce1]",
                      selectedBuyOrderOption === "Market Cap" &&
                        "bg-white/10 text-fontColorPrimary",
                    )}
                  >
                    Market Cap
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedBuyOrderOption("Price")}
                    className={cn(
                      "w-full cursor-pointer rounded-[6px] font-geistSemiBold text-sm text-fontColorSecondary duration-300 hover:text-[#cccce1]",
                      selectedBuyOrderOption === "Price" &&
                        "bg-white/10 text-fontColorPrimary",
                    )}
                  >
                    Price
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedBuyOrderOption("Dev Sell")}
                    className={cn(
                      "w-full cursor-pointer rounded-[6px] font-geistSemiBold text-sm text-fontColorSecondary duration-300 hover:text-[#cccce1]",
                      selectedBuyOrderOption === "Dev Sell" &&
                        "bg-white/10 text-fontColorPrimary",
                    )}
                  >
                    Dev Sell
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedBuyOrderOption("Profit %")}
                    className={cn(
                      "w-full cursor-pointer rounded-[6px] font-geistSemiBold text-sm text-fontColorSecondary duration-300 hover:text-[#cccce1]",
                      selectedBuyOrderOption === "Profit %" &&
                        "bg-white/10 text-fontColorPrimary",
                    )}
                  >
                    Profit %
                  </button>
                </div>
              </div>

              <div className="flex w-full flex-col gap-y-2">
                <Label className="text-nowrap text-sm text-fontColorSecondary">
                  Configuration
                </Label>

                {selectedBuyOrderOption === "Market Cap" && (
                  <div className="grid w-full grid-cols-3 items-center gap-3 rounded-[8px]">
                    <Select
                      value={marketCapCondition}
                      onValueChange={(value) =>
                        setMarketCapCondition(value as "UP" | "DOWN")
                      }
                    >
                      <SelectTrigger className="h-[32px] flex-shrink-0 bg-transparent pl-4">
                        <span className="inline-block text-nowrap font-geistSemiBold text-fontColorPrimary">
                          <SelectValue placeholder="Select Condition" />
                        </span>
                      </SelectTrigger>
                      <SelectContent className="z-[320]">
                        <SelectItem value="DOWN" className="font-geistSemiBold">
                          Buy ↓
                        </SelectItem>
                        <SelectItem value="UP" className="font-geistSemiBold">
                          Buy ↑
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={marketCapMCStatus}
                      onValueChange={(value) =>
                        setMarketCapMCStatus(value as "MC")
                      }
                    >
                      <SelectTrigger className="h-[32px] flex-shrink-0 bg-transparent pl-4">
                        <span className="inline-block text-nowrap font-geistSemiBold text-fontColorPrimary">
                          <SelectValue placeholder="Select MC" />
                        </span>
                      </SelectTrigger>
                      <SelectContent className="z-[320]">
                        <SelectItem value="MC" className="font-geistSemiBold">
                          MC
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      value={buyAmount}
                      onChange={handleChangeBuyAmount}
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
                      placeholder="Enter Amount"
                    />
                  </div>
                )}
                {selectedBuyOrderOption === "Price" && (
                  <div className="grid w-full grid-cols-3 items-center gap-3 rounded-[8px]">
                    <Select
                      value={priceCondition}
                      onValueChange={(value) =>
                        setPriceCondition(value as "UP" | "DOWN")
                      }
                    >
                      <SelectTrigger className="h-[32px] flex-shrink-0 bg-transparent pl-4">
                        <span className="inline-block text-nowrap font-geistSemiBold text-fontColorPrimary">
                          <SelectValue placeholder="Select Condition" />
                        </span>
                      </SelectTrigger>
                      <SelectContent className="z-[320]">
                        <SelectItem value="DOWN" className="font-geistSemiBold">
                          Buy ↓
                        </SelectItem>
                        <SelectItem value="UP" className="font-geistSemiBold">
                          Buy ↑
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={priceStatus}
                      onValueChange={(value) =>
                        setPriceStatus(value as "Price")
                      }
                    >
                      <SelectTrigger className="h-[32px] flex-shrink-0 bg-transparent pl-4">
                        <span className="inline-block text-nowrap font-geistSemiBold text-fontColorPrimary">
                          <SelectValue placeholder="Select Price" />
                        </span>
                      </SelectTrigger>
                      <SelectContent className="z-[320]">
                        <SelectItem
                          value="Price"
                          className="font-geistSemiBold"
                        >
                          Price
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      value={buyAmount}
                      onChange={handleChangeBuyAmount}
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
                      placeholder="Enter Amount"
                    />
                  </div>
                )}
                {selectedBuyOrderOption === "Dev Sell" && (
                  <div className="grid w-full grid-cols-2 items-center gap-3 rounded-[8px]">
                    <Select
                      value={devSellCondition}
                      onValueChange={(value) =>
                        setDevSellCondition(value as "UP" | "DOWN")
                      }
                    >
                      <SelectTrigger className="h-[32px] flex-shrink-0 bg-transparent pl-4">
                        <span className="inline-block text-nowrap font-geistSemiBold text-fontColorPrimary">
                          <SelectValue placeholder="Select Condition" />
                        </span>
                      </SelectTrigger>
                      <SelectContent className="z-[320]">
                        <SelectItem value="DOWN" className="font-geistSemiBold">
                          Buy ↓
                        </SelectItem>
                        <SelectItem value="UP" className="font-geistSemiBold">
                          Buy ↑
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      value={buyAmount}
                      onChange={handleChangeBuyAmount}
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
                      placeholder="Enter Amount"
                    />
                  </div>
                )}
              </div>

              <div className="flex w-full flex-col gap-y-2">
                <Label className="text-nowrap text-sm text-fontColorSecondary">
                  Expires in hrs
                </Label>
                <Input
                  type="number"
                  value={expiresInHours}
                  onChange={handleChangeExpiresInHours}
                  placeholder="Hours"
                  prefixEl={
                    <div className="absolute left-3.5 aspect-square h-5 w-5 flex-shrink-0">
                      <Image
                        src="/icons/gray-clock.png"
                        alt="Gray Clock Icon"
                        fill
                        quality={100}
                        className="object-contain"
                      />
                    </div>
                  }
                />
              </div>
            </div>
          </div>

          <Separator className="mt-4" />

          {/* Advance Settings */}
          <motion.div
            animate={openAdvanceSettings ? "open" : "closed"}
            className="h-auto w-full px-4"
          >
            <button
              type="button"
              onClick={handleToggle}
              className="flex h-[48px] w-full items-center justify-between"
            >
              <div className="flex items-center gap-x-2">
                <div className="relative aspect-square h-[18px] w-[18px] focus:border-none focus:outline-none focus:ring-0">
                  <Image
                    src="/icons/white-setting.png"
                    alt="White Setting Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
                <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                  Advanced Settings
                </span>
              </div>
              <div className="relative aspect-square h-6 w-6 flex-shrink-0 cursor-pointer">
                <Image
                  src="/icons/pink-chevron-down.png"
                  alt="Accordion Icon"
                  fill
                  quality={100}
                  className={`object-contain transition-transform duration-300 ${
                    openAdvanceSettings ? "rotate-180" : "rotate-0"
                  }`}
                />
              </div>
            </button>

            <AnimatePresence>
              {openAdvanceSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="flex w-full flex-col gap-y-4 pb-4">
                    <div className="grid h-auto w-full grid-cols-3 gap-x-3 gap-y-4">
                      <div className="col-span-1 flex h-[58px] w-full flex-col justify-between">
                        <Label
                          htmlFor="slippage"
                          className="text-nowrap text-sm text-fontColorSecondary"
                        >
                          Slippage
                        </Label>
                        <Input
                          type="number"
                          value={slippagePercentage}
                          onChange={handleChangeSlippagePercentage}
                          placeholder="1-100"
                          suffixEl={
                            <span className="absolute right-3.5 text-sm text-fontColorSecondary">
                              %
                            </span>
                          }
                        />
                      </div>
                      <div className="col-span-1 flex h-full w-full flex-col justify-between">
                        <Label
                          htmlFor="mevprotect"
                          className="flex items-center justify-normal gap-2 text-nowrap text-sm text-fontColorSecondary"
                        >
                          Mev Protect
                          <LabelStatusIndicator status={MEVProtectStatus} />
                        </Label>
                        <OnOffToggle
                          value={MEVProtectStatus}
                          setValue={setMEVProtectStatus}
                        />
                      </div>
                      <div className="col-span-1 flex h-[58px] w-full flex-col justify-between">
                        <Label
                          htmlFor="autotip"
                          className="flex items-center justify-normal gap-2 text-nowrap text-sm text-fontColorSecondary"
                        >
                          Auto-Tip
                          <LabelStatusIndicator status={autoTipStatus} />
                        </Label>
                        <OnOffToggle
                          value={autoTipStatus}
                          setValue={setAutoTipStatus}
                        />
                      </div>
                    </div>

                    <div className="grid h-auto w-full grid-cols-2 gap-x-3">
                      <div className="grid h-auto w-full grid-cols-1 gap-x-3">
                        <div className="col-span-1 flex h-[58px] w-full flex-col justify-between">
                          <Label
                            htmlFor="priorityfee"
                            className="text-nowrap text-sm text-fontColorSecondary"
                          >
                            Priority Fee
                          </Label>
                          <Input
                            type="number"
                            value={priorityFee}
                            onChange={handleChangePriorityFee}
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
                            placeholder="Priority Fee"
                          />
                        </div>
                      </div>

                      <div className="grid h-auto w-full grid-cols-1 gap-x-3">
                        <div className="col-span-1 flex h-[58px] w-full flex-col justify-between">
                          <Label
                            htmlFor="briberyamount"
                            className="text-nowrap text-sm text-fontColorSecondary"
                          >
                            Bribery Amount
                          </Label>
                          <Input
                            type="number"
                            value={briberyAmount}
                            onChange={handleChangeBriberyAmount}
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
                            placeholder="0.0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </form>
      </OverlayScrollbarsComponent>

      {/* CTA */}
      <div className="absolute bottom-0 flex h-[64px] w-full items-center justify-end border-t border-border bg-[#10101E] p-4">
        <BaseButton
          variant="primary"
          onClick={handleSubmitOutside}
          className="w-full"
        >
          <span className="inline-block text-nowrap font-geistSemiBold text-base text-[#080811]">
            Submit
          </span>
        </BaseButton>
      </div>
    </>
  );
}
