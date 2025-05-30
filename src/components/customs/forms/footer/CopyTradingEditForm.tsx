"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState, useRef } from "react";
import { useUserWalletStore } from "@/stores/wallet/use-user-wallet.store";
import toast from "react-hot-toast";
// ######## Components 🧩 ########
import { FormEvent } from "react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import CustomToast from "../../toasts/CustomToast";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import {
  Preset,
  useActivePresetStore,
} from "@/stores/dex-setting/use-active-preset.store";
import LabelStatusIndicator from "../../LabelStatusIndicator";
import Separator from "../../Separator";
import SellBuyInputAmount from "../../SellBuyInputAmount";
import OnOffToggle from "../../OnOffToggle";
import BaseButton from "../../buttons/BaseButton";
import { Input } from "@/components/ui/input";
import PresetSelectionButtons from "../../PresetSelectionButtons";
import WalletSelectionButton from "../../WalletSelectionButton";
import ProcessorSelectionButton from "../../ProcessorSelectionButton";
import { CachedImage } from "../../CachedImage";

const quickPickList: number[] = [0.1, 0.3, 0.5, 0.7, 0.9, 1.2];

type CopyTradingEditFormProps = {
  toggleModal: () => void;
};

export default function CopyTradingEditForm({
  toggleModal,
}: CopyTradingEditFormProps) {
  // Setups Configuration ⚙️
  const { cosmoActivePreset, setCosmoActivePreset } = useActivePresetStore();
  const { selectedMultipleActiveWallet, setSelectedMultipleActiveWallet } =
    useUserWalletStore();

  // Buy Fields Configuration 📝
  const [buyMethod, setBuyMethod] = useState<"Exact" | "Percentage" | "Fixed">(
    "Fixed",
  );
  const [buyAmount, setBuyAmount] = useState<number | undefined>(undefined);
  const handleChangeBuyAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const isValid = /^[1-9]\d*(\.\d+)?$|^0(\.\d+)?$/.test(value);

    if (isValid) {
      setBuyAmount(parseFloat(value));
    }
  };
  const [selectedQuickPick, setSelectedQuickPick] = useState<
    number | undefined
  >(undefined);

  const [buyOnceStatus, setBuyOnceStatus] = useState<"ON" | "OFF">("ON");
  const [followSalesStatus, setFollowSalesStatus] = useState<"ON" | "OFF">(
    "OFF",
  );
  const [MEVProtectStatus, setMEVProtectStatus] = useState<"ON" | "OFF">("ON");

  const [minBuyTriggerAmount, setMinBuyTriggerAmount] = useState<number>(20);
  const [maxBuyTriggerAmount, setMaxBuyTriggerAmount] = useState<number>(20);
  const [minMarketCapAmount, setMinMarketCapAmount] = useState<number>(1000);
  const [maxMarketCapAmount, setMaxMarketCapAmount] = useState<number>(2000000);

  const [buySlippagePercentage, setBuySlippagePercentage] =
    useState<number>(20);
  const [buyTip, setBuyTip] = useState<number>(20);
  const [buyFee, setBuyFee] = useState<number>(20);
  const [sellSlippagePercentage, setSellSlippagePercentage] =
    useState<number>(20);
  const [sellTip, setSellTip] = useState<number>(20);
  const [sellFee, setSellFee] = useState<number>(20);
  const [selectedProcessor, setSelectedProcessor] = useState<
    "Jito" | "Node" | "Ultra" | "Ultra v2"
  >("Jito");

  const handleSwitchBuyOnceStatusChange = (checked: boolean) => {
    setBuyOnceStatus(checked ? "ON" : "OFF");
  };
  const handleSwitchFollowSalesStatusChange = (checked: boolean) => {
    setFollowSalesStatus(checked ? "ON" : "OFF");
  };
  const handleSwitchMEVProtectStatusChange = (checked: boolean) => {
    setMEVProtectStatus(checked ? "ON" : "OFF");
  };
  const handleChangeMinBuyTriggerAmount = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    const isValid = /^[1-9]\d*(\.\d+)?$|^0(\.\d+)?$/.test(value);

    if (isValid) {
      setMinBuyTriggerAmount(parseFloat(value));
    }
  };
  const handleChangeMaxBuyTriggerAmount = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    const isValid = /^[1-9]\d*(\.\d+)?$|^0(\.\d+)?$/.test(value);

    if (isValid) {
      setMaxBuyTriggerAmount(parseFloat(value));
    }
  };
  const handleChangeMinMarketCapAmount = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const rawValue = e.target.value.replace(/,/g, "");
    const isValid = /^\d*\.?\d*$/.test(rawValue);

    if (isValid) {
      const parsedValue = rawValue === "" ? 0 : parseFloat(rawValue);
      setMinMarketCapAmount(parsedValue);
    }
  };
  const handleChangeMaxMarketCapAmount = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const rawValue = e.target.value.replace(/,/g, "");
    const isValid = /^\d*\.?\d*$/.test(rawValue);

    if (isValid) {
      const parsedValue = rawValue === "" ? 0 : parseFloat(rawValue);
      setMaxMarketCapAmount(parsedValue);
    }
  };

  const handleChangeBuySlippagePercentage = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    const isValid = /^[1-9]$|^[1-9][0-9]$|^100$/.test(value);

    if (isValid) {
      setBuySlippagePercentage(parseInt(value));
    }
  };
  const handleChangeBuyTip = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const isValid = /^[1-9]\d*(\.\d+)?$|^0(\.\d+)?$/.test(value);

    if (isValid) {
      setBuyTip(parseFloat(value));
    }
  };
  const handleChangeBuyFee = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const isValid = /^[1-9]\d*(\.\d+)?$|^0(\.\d+)?$/.test(value);

    if (isValid) {
      setBuyFee(parseFloat(value));
    }
  };
  const handleChangeSellSlippagePercentage = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    const isValid = /^[1-9]$|^[1-9][0-9]$|^100$/.test(value);

    if (isValid) {
      setSellSlippagePercentage(parseInt(value));
    }
  };
  const handleChangeSellTip = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const isValid = /^[1-9]\d*(\.\d+)?$|^0(\.\d+)?$/.test(value);

    if (isValid) {
      setSellTip(parseFloat(value));
    }
  };
  const handleChangeSellFee = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const isValid = /^[1-9]\d*(\.\d+)?$|^0(\.\d+)?$/.test(value);

    if (isValid) {
      setSellFee(parseFloat(value));
    }
  };

  // Save Configuration 🆙
  const formRef = useRef<HTMLFormElement | null>(null);
  const handleSaveOutside = () => {
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
        className="modal__overlayscrollbar relative h-full w-full flex-grow overflow-y-scroll md:h-[450px] 2xl:h-[450px]"
      >
        <form
          ref={formRef}
          onSubmit={handleSave}
          className="absolute top-0 h-auto w-full pb-20"
        >
          {/* Setups */}
          <div className="flex w-full items-center justify-between gap-y-4 border-b border-border px-4 py-3">
            <PresetSelectionButtons isWithSetting isWithLabel />
          </div>
          <div className="flex w-full flex-col gap-y-3 p-4">
            <WalletSelectionButton
              value={selectedMultipleActiveWallet}
              setValue={setSelectedMultipleActiveWallet}
              maxWalletShow={10}
              // maxWalletShow={2}
              isFullWidth
            />
          </div>

          {/* Buy Fields */}
          <div className="flex w-full flex-col gap-y-3 px-4">
            <div className="flex w-full flex-col gap-y-4">
              {/* Processor */}
              <div className="grid h-auto w-full grid-cols-1">
                <div className="col-span-1 flex h-[58px] w-full flex-col justify-between">
                  <Label
                    htmlFor="buymethod"
                    className="text-nowrap text-sm text-fontColorSecondary"
                  >
                    Buy Method
                  </Label>
                  <Select
                    value={buyMethod}
                    onValueChange={(value) =>
                      setBuyMethod(value as "Exact" | "Percentage" | "Fixed")
                    }
                  >
                    <SelectTrigger className="h-[32px] w-full">
                      <span className="inline-block text-nowrap font-geistSemiBold text-fontColorPrimary">
                        <SelectValue placeholder="Select Buy Method" />
                      </span>
                    </SelectTrigger>
                    <SelectContent className="z-[320]">
                      <SelectItem value="Exact" className="font-geistSemiBold">
                        Exact
                      </SelectItem>
                      <SelectItem
                        value="Percentage"
                        className="font-geistSemiBold"
                      >
                        Percentage
                      </SelectItem>
                      <SelectItem value="Fixed" className="font-geistSemiBold">
                        Fixed
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Buy */}
              <div className="flex w-full flex-col">
                <SellBuyInputAmount
                  handleChange={handleChangeBuyAmount}
                  onChange={setBuyAmount}
                  value={buyAmount}
                  type="buy"
                />
              </div>

              <div className="grid h-auto w-full grid-cols-3 gap-x-3">
                <div className="col-span-1 flex h-[58px] w-full flex-col justify-between">
                  <Label
                    htmlFor="buyonce"
                    className="flex items-center justify-normal gap-2 text-nowrap text-sm text-fontColorSecondary"
                  >
                    Buy Once
                    <LabelStatusIndicator status={buyOnceStatus} />
                  </Label>
                  <OnOffToggle
                    value={buyOnceStatus}
                    setValue={setBuyOnceStatus}
                  />
                </div>
                <div className="col-span-1 flex h-[58px] w-full flex-col justify-between">
                  <Label
                    htmlFor="followsales"
                    className="flex items-center justify-normal gap-2 text-nowrap text-sm text-fontColorSecondary"
                  >
                    Follow Sales
                    <LabelStatusIndicator status={followSalesStatus} />
                  </Label>
                  <OnOffToggle
                    value={followSalesStatus}
                    setValue={setFollowSalesStatus}
                  />
                </div>
                <div className="col-span-1 flex h-[58px] w-full flex-col justify-between">
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
              </div>

              {/* Buy Trigger */}
              <div className="grid h-auto w-full grid-cols-2 gap-x-3">
                <div className="col-span-1 flex h-[58px] w-full flex-col justify-between">
                  <Label
                    htmlFor="minbuytrigger"
                    className="text-nowrap text-sm text-fontColorSecondary"
                  >
                    Min Buy Trigger
                  </Label>
                  <Input
                    type="number"
                    value={minBuyTriggerAmount}
                    onChange={handleChangeMinBuyTriggerAmount}
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
                </div>
                <div className="col-span-1 flex h-[58px] w-full flex-col justify-between">
                  <Label
                    htmlFor="maxbuytrigger"
                    className="text-nowrap text-sm text-fontColorSecondary"
                  >
                    Max Buy Trigger
                  </Label>
                  <Input
                    type="number"
                    value={maxBuyTriggerAmount}
                    onChange={handleChangeMaxBuyTriggerAmount}
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
                </div>
              </div>

              {/* Market Cap */}
              <div className="grid h-auto w-full grid-cols-2 gap-x-3 gap-y-4">
                <div className="col-span-1 flex h-[58px] w-full flex-col justify-between">
                  <Label
                    htmlFor="minmarketcap"
                    className="text-nowrap text-sm text-fontColorSecondary"
                  >
                    Min Market Cap
                  </Label>
                  <Input
                    type="number"
                    value={minMarketCapAmount.toLocaleString()}
                    onChange={handleChangeMinMarketCapAmount}
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
                  />
                </div>
                <div className="col-span-1 flex h-[58px] w-full flex-col justify-between">
                  <Label
                    htmlFor="maxmarketcap"
                    className="text-nowrap text-sm text-fontColorSecondary"
                  >
                    Max Market Cap
                  </Label>
                  <Input
                    type="number"
                    value={maxMarketCapAmount.toLocaleString()}
                    onChange={handleChangeMaxMarketCapAmount}
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
                  />
                </div>
              </div>

              {/* Buy */}
              <div className="grid h-auto w-full grid-cols-3 gap-x-3">
                <div className="col-span-1 flex h-[58px] w-full flex-col justify-between">
                  <Label
                    htmlFor="buyslippage"
                    className="text-nowrap text-sm text-fontColorSecondary"
                  >
                    Buy Slippage
                  </Label>
                  <Input
                    type="number"
                    value={buySlippagePercentage}
                    onChange={handleChangeBuySlippagePercentage}
                    placeholder="1-100"
                    suffixEl={
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-fontColorSecondary">
                        %
                      </span>
                    }
                  />
                </div>
                <div className="col-span-1 flex h-[58px] w-full flex-col justify-between">
                  <Label
                    htmlFor="buytip"
                    className="text-nowrap text-sm text-fontColorSecondary"
                  >
                    Buy tip
                  </Label>
                  <Input
                    type="number"
                    value={buyTip}
                    onChange={handleChangeBuyTip}
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
                <div className="col-span-1 flex h-[58px] w-full flex-col justify-between">
                  <Label
                    htmlFor="buyfee"
                    className="text-nowrap text-sm text-fontColorSecondary"
                  >
                    Buy fee
                  </Label>
                  <Input
                    type="number"
                    value={buyTip}
                    onChange={handleChangeBuyTip}
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

              {/* Sell */}
              <div className="grid h-auto w-full grid-cols-3 gap-x-3">
                <div className="col-span-1 flex h-[58px] w-full flex-col justify-between">
                  <Label
                    htmlFor="sellslippage"
                    className="text-nowrap text-sm text-fontColorSecondary"
                  >
                    Sell Slippage
                  </Label>
                  <Input
                    type="number"
                    value={sellSlippagePercentage}
                    onChange={handleChangeSellSlippagePercentage}
                    placeholder="1-100"
                    suffixEl={
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-fontColorSecondary">
                        %
                      </span>
                    }
                  />
                </div>
                <div className="col-span-1 flex h-[58px] w-full flex-col justify-between">
                  <Label
                    htmlFor="selltip"
                    className="text-nowrap text-sm text-fontColorSecondary"
                  >
                    Sell tip
                  </Label>
                  <Input
                    type="number"
                    value={sellTip}
                    onChange={handleChangeSellTip}
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
                <div className="col-span-1 flex h-[58px] w-full flex-col justify-between">
                  <Label
                    htmlFor="sellfee"
                    className="text-nowrap text-sm text-fontColorSecondary"
                  >
                    Sell fee
                  </Label>
                  <Input
                    type="number"
                    value={sellFee}
                    onChange={handleChangeSellFee}
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

              <div className="grid h-auto w-full grid-cols-1">
                <div className="col-span-1 flex h-[58px] w-full flex-col justify-between">
                  <Label
                    htmlFor="processor"
                    className="text-nowrap text-sm text-fontColorSecondary"
                  >
                    Processor
                  </Label>
                  <ProcessorSelectionButton
                    setValue={setSelectedProcessor as () => string}
                    value={selectedProcessor}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </OverlayScrollbarsComponent>

      {/* CTA */}
      <div className="absolute bottom-0 flex h-[64px] w-full items-center justify-end border-t border-border bg-[#10101E] p-4">
        <BaseButton
          onClick={handleSaveOutside}
          className="h-10 w-full"
          variant="primary"
        >
          <span className="inline-block text-nowrap font-geistSemiBold text-base text-[#080811]">
            Save
          </span>
        </BaseButton>
      </div>
    </>
  );
}
