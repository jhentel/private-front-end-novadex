"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState, useRef } from "react";
import { useAFKStatusStore } from "@/stores/footer/use-afk-status.store";
import { motion, AnimatePresence } from "framer-motion";
// ######## Components 🧩 ########
import { FormEvent } from "react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import Separator from "../../Separator";
import BaseButton from "../../buttons/BaseButton";
import { Input } from "@/components/ui/input";
import OnOffToggle from "../../OnOffToggle";
import LabelStatusIndicator from "../../LabelStatusIndicator";
import { CachedImage } from "../../CachedImage";

export default function AFKMeteoraForm() {
  const { meteoraStatus, setMeteoraStatus } = useAFKStatusStore();

  // Fields Configuration 📝
  const [minLPBurnPercentage, setMinLPBurnPercentage] = useState<number>(24);
  const [maxLPBurnPercentage, setMaxLPBurnPercentage] = useState<number>(100);
  const [minInitialLiquidityAmount, setMinInitialLiquidityAmount] =
    useState<number>(1000);
  const [maxInitialLiquidityAmount, setMaxInitialLiquidityAmount] =
    useState<number>(10000);
  const [minMarketCostAmount, setMinMarketCostAmount] = useState<number>(24);
  const [maxMarketCostAmount, setMaxMarketCostAmount] = useState<number>(24);
  const [minMarketCapAmount, setMinMarketCapAmount] = useState<number>(1000);
  const [maxMarketCapAmount, setMaxMarketCapAmount] =
    useState<number>(10000000);
  const [minSupplyDeployedPercentage, setMinSupplyDeployedPercentage] =
    useState<number>(10);
  const [maxSupplyDeployedPercentage, setMaxSupplyDeployedPercentage] =
    useState<number>(50);
  const [minTopOnePercentage, setMinTopOnePercentage] = useState<number>(10);
  const [maxTopTenPercentage, setMaxTopTenPercentage] = useState<number>(10);
  const [renouncedStatus, setRenouncedStatus] = useState<"ON" | "OFF">("ON");
  const [freezeRevokedStatus, setFreezeRevokedStatus] = useState<"ON" | "OFF">(
    "ON",
  );

  const handleChangeMinLPBurnPercentage = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    const isValid = /^[1-9]$|^[1-9][0-9]$|^100$/.test(value);

    if (isValid) {
      setMinLPBurnPercentage(parseInt(value));
    }
  };
  const handleChangeMaxLPBurnPercentage = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    const isValid = /^[1-9]$|^[1-9][0-9]$|^100$/.test(value);

    if (isValid) {
      setMaxLPBurnPercentage(parseInt(value));
    }
  };
  const handleChangeMinInitialLiquidityAmount = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const rawValue = e.target.value.replace(/,/g, "");
    const isValid = /^\d*\.?\d*$/.test(rawValue);

    if (isValid) {
      const parsedValue = rawValue === "" ? 0 : parseFloat(rawValue);
      setMinInitialLiquidityAmount(parsedValue);
    }
  };
  const handleChangeMaxInitialLiquidityAmount = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const rawValue = e.target.value.replace(/,/g, "");
    const isValid = /^\d*\.?\d*$/.test(rawValue);

    if (isValid) {
      const parsedValue = rawValue === "" ? 0 : parseFloat(rawValue);
      setMaxInitialLiquidityAmount(parsedValue);
    }
  };
  const handleChangeMinMarketCostAmount = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    const isValid = /^[1-9]\d*(\.\d+)?$|^0(\.\d+)?$/.test(value);

    if (isValid) {
      setMinMarketCostAmount(parseFloat(value));
    }
  };
  const handleChangeMaxMarketCostAmount = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    const isValid = /^[1-9]\d*(\.\d+)?$|^0(\.\d+)?$/.test(value);

    if (isValid) {
      setMaxMarketCostAmount(parseFloat(value));
    }
  };
  const handleChangeMinSupplyDeployedPercentage = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    const isValid = /^[1-9]$|^[1-9][0-9]$|^100$/.test(value);

    if (isValid) {
      setMinSupplyDeployedPercentage(parseInt(value));
    }
  };
  const handleChangeMaxSupplyDeployedPercentage = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    const isValid = /^[1-9]$|^[1-9][0-9]$|^100$/.test(value);

    if (isValid) {
      setMaxSupplyDeployedPercentage(parseInt(value));
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
  const handleChangeMinTopOnePercentage = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    const isValid = /^[1-9]$|^[1-9][0-9]$|^100$/.test(value);

    if (isValid) {
      setMinTopOnePercentage(parseInt(value));
    }
  };
  const handleChangeMaxTopTenPercentage = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    const isValid = /^[1-9]$|^[1-9][0-9]$|^100$/.test(value);

    if (isValid) {
      setMaxTopTenPercentage(parseInt(value));
    }
  };

  // Advance Settings Configuration ⚙️
  const [openAdvanceSettings, setOpenAdvanceSettings] =
    useState<boolean>(false);
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

  // Start Configuration 🏁
  const formRef = useRef<HTMLFormElement | null>(null);
  const handleStartOutside = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  const handleStart = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setMeteoraStatus(!meteoraStatus);
    // Add your form submission logic here
  };

  return (
    <>
      <OverlayScrollbarsComponent
        defer
        element="div"
        className="modal__overlayscrollbar relative h-full w-full flex-grow overflow-y-scroll"
      >
        <form
          ref={formRef}
          onSubmit={handleStart}
          className="absolute top-0 h-auto w-full pb-16"
        >
          {/* Fields */}
          <div className="flex w-full flex-col gap-y-4 px-4 pt-4">
            <div className="flex w-full flex-col gap-y-4">
              {/* LP Burn */}
              <div className="grid h-auto w-full grid-cols-2 gap-x-3 gap-y-4">
                <div className="col-span-1 flex h-[58px] w-full flex-col justify-between">
                  <div className="flex items-center gap-x-1">
                    <Label
                      htmlFor="minlpburn"
                      className="text-nowrap text-sm text-fontColorSecondary"
                    >
                      Min. LP Burn
                    </Label>
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
                        <TooltipContent className="z-[320]">
                          <p>Min LP Burn Information</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    type="number"
                    value={minLPBurnPercentage}
                    onChange={handleChangeMinLPBurnPercentage}
                    placeholder="1-100"
                    suffixEl={
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-fontColorSecondary">
                        %
                      </span>
                    }
                  />
                </div>
                <div className="col-span-1 flex h-[58px] w-full flex-col justify-between">
                  <div className="flex items-center gap-x-1">
                    <Label
                      htmlFor="maxlpburn"
                      className="text-nowrap text-sm text-fontColorSecondary"
                    >
                      Max. LP Burn
                    </Label>
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
                        <TooltipContent className="z-[320]">
                          <p>Max LP Burn Information</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    type="number"
                    value={maxLPBurnPercentage}
                    onChange={handleChangeMaxLPBurnPercentage}
                    placeholder="1-100"
                    suffixEl={
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-fontColorSecondary">
                        %
                      </span>
                    }
                  />
                </div>
              </div>

              {/* Initial Liquidity */}
              <div className="grid h-auto w-full grid-cols-2 gap-x-3 gap-y-4">
                <div className="col-span-1 flex h-[58px] w-full flex-col justify-between">
                  <div className="flex items-center gap-x-1">
                    <Label
                      htmlFor="mininitialliq"
                      className="text-nowrap text-sm text-fontColorSecondary"
                    >
                      Min. Initial Liquidity
                    </Label>
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
                        <TooltipContent className="z-[320]">
                          <p>Min Initial Liq Information</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
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
                          quality={50}
                          className="object-contain"
                        />
                      </div>
                    }
                  />
                </div>
                <div className="col-span-1 flex h-[58px] w-full flex-col justify-between">
                  <div className="flex items-center gap-x-1">
                    <Label
                      htmlFor="maxinitialliq"
                      className="text-nowrap text-sm text-fontColorSecondary"
                    >
                      Max. Initial Liquidity
                    </Label>
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
                        <TooltipContent className="z-[320]">
                          <p>Max Initial Liq Information</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    type="number"
                    value={maxInitialLiquidityAmount.toLocaleString()}
                    onChange={handleChangeMaxInitialLiquidityAmount}
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
                  />
                </div>
              </div>

              {/* Market Cost */}
              <div className="grid h-auto w-full grid-cols-2 gap-x-3 gap-y-4">
                <div className="col-span-1 flex h-[58px] w-full flex-col justify-between">
                  <div className="flex items-center gap-x-1">
                    <Label
                      htmlFor="minmarketcost"
                      className="text-nowrap text-sm text-fontColorSecondary"
                    >
                      Min. Market Cost
                    </Label>
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
                        <TooltipContent className="z-[320]">
                          <p>Min Market Cost Information</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    type="number"
                    value={maxInitialLiquidityAmount.toLocaleString()}
                    onChange={handleChangeMaxInitialLiquidityAmount}
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
                  />
                </div>
                <div className="col-span-1 flex h-[58px] w-full flex-col justify-between">
                  <div className="flex items-center gap-x-1">
                    <Label
                      htmlFor="maxmarketcost"
                      className="text-nowrap text-sm text-fontColorSecondary"
                    >
                      Max. Market Cost
                    </Label>
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
                        <TooltipContent className="z-[320]">
                          <p>Max Market Cost Information</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    type="number"
                    value={maxMarketCostAmount}
                    onChange={handleChangeMaxMarketCostAmount}
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
                  />
                </div>
              </div>

              {/* Market Cap */}
              <div className="grid h-auto w-full grid-cols-2 gap-x-3 gap-y-4">
                <div className="col-span-1 flex h-[58px] w-full flex-col justify-between">
                  <div className="flex items-center gap-x-1">
                    <Label
                      htmlFor="minmarketcap"
                      className="text-nowrap text-sm text-fontColorSecondary"
                    >
                      Min. Market Cap
                    </Label>
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
                        <TooltipContent className="z-[320]">
                          <p>Min Market Cap Information</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
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
                          quality={50}
                          className="object-contain"
                        />
                      </div>
                    }
                  />
                </div>
                <div className="col-span-1 flex h-[58px] w-full flex-col justify-between">
                  <div className="flex items-center gap-x-1">
                    <Label
                      htmlFor="maxmarketcap"
                      className="text-nowrap text-sm text-fontColorSecondary"
                    >
                      Max. Market Cap
                    </Label>
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
                        <TooltipContent className="z-[320]">
                          <p>Max Market Cap Information</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
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
                          quality={50}
                          className="object-contain"
                        />
                      </div>
                    }
                  />
                </div>
              </div>

              {/* Supply Deployed */}
              <div className="grid h-auto w-full grid-cols-2 gap-x-3 gap-y-4">
                <div className="col-span-1 flex h-[58px] w-full flex-col justify-between">
                  <div className="flex items-center gap-x-1">
                    <Label
                      htmlFor="minsupplydeployed"
                      className="text-nowrap text-sm text-fontColorSecondary"
                    >
                      Min. Supply Deployed
                    </Label>
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
                        <TooltipContent className="z-[320]">
                          <p>Min Supply Deployed Information</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    type="number"
                    value={minSupplyDeployedPercentage}
                    onChange={handleChangeMinSupplyDeployedPercentage}
                    placeholder="1-100"
                    suffixEl={
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-fontColorSecondary">
                        %
                      </span>
                    }
                  />
                </div>
                <div className="col-span-1 flex h-[58px] w-full flex-col justify-between">
                  <div className="flex items-center gap-x-1">
                    <Label
                      htmlFor="maxsupplydeployed"
                      className="text-nowrap text-sm text-fontColorSecondary"
                    >
                      Max. Supply Deployed
                    </Label>
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
                        <TooltipContent className="z-[320]">
                          <p>Max Supply Deployed Information</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    type="number"
                    value={maxSupplyDeployedPercentage}
                    onChange={handleChangeMaxSupplyDeployedPercentage}
                    placeholder="1-100"
                    suffixEl={
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-fontColorSecondary">
                        %
                      </span>
                    }
                  />
                </div>
              </div>

              {/* Min Top One & Ten */}
              <div className="grid h-auto w-full grid-cols-2 gap-x-3 gap-y-4">
                <div className="col-span-1 flex h-[58px] w-full flex-col justify-between">
                  <div className="flex items-center gap-x-1">
                    <Label
                      htmlFor="mintopone"
                      className="text-nowrap text-sm text-fontColorSecondary"
                    >
                      Min. Top 1
                    </Label>
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
                        <TooltipContent className="z-[320]">
                          <p>Min Top 1 Information</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    type="number"
                    value={minTopOnePercentage}
                    onChange={handleChangeMinTopOnePercentage}
                    placeholder="1-100"
                    suffixEl={
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-fontColorSecondary">
                        %
                      </span>
                    }
                  />
                </div>
                <div className="col-span-1 flex h-[58px] w-full flex-col justify-between">
                  <div className="flex items-center gap-x-1">
                    <Label
                      htmlFor="maxtopten"
                      className="text-nowrap text-sm text-fontColorSecondary"
                    >
                      Max. Top 10
                    </Label>
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
                        <TooltipContent className="z-[320]">
                          <p>Max Top 10 Information</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    type="number"
                    value={maxTopTenPercentage}
                    onChange={handleChangeMaxTopTenPercentage}
                    placeholder="1-100"
                    suffixEl={
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-fontColorSecondary">
                        %
                      </span>
                    }
                  />
                </div>
              </div>

              {/* Renounced & Freeze Revoked*/}
              <div className="grid h-auto w-full grid-cols-2 gap-x-3 gap-y-4">
                <div className="col-span-1 flex h-[58px] w-full flex-col justify-between">
                  <div className="flex items-center gap-x-1">
                    <Label
                      htmlFor="renounced"
                      className="text-nowrap text-sm text-fontColorSecondary"
                    >
                      Renounced
                    </Label>
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
                        <TooltipContent className="z-[320]">
                          <p>Renounced Information</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <LabelStatusIndicator status={renouncedStatus} />
                  </div>
                  <OnOffToggle
                    value={renouncedStatus}
                    setValue={setRenouncedStatus}
                  />
                </div>
                <div className="col-span-1 flex h-[58px] w-full flex-col justify-between">
                  <div className="flex items-center gap-x-1">
                    <Label
                      htmlFor="freezerevoked"
                      className="text-nowrap text-sm text-fontColorSecondary"
                    >
                      Freeze Revoked
                    </Label>
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
                        <TooltipContent className="z-[320]">
                          <p>Freeze Revoked Information</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <LabelStatusIndicator status={freezeRevokedStatus} />
                  </div>
                  <OnOffToggle
                    value={freezeRevokedStatus}
                    setValue={setFreezeRevokedStatus}
                  />
                </div>
              </div>
            </div>

            <Separator />
          </div>

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
                    quality={50}
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
                  quality={50}
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
                      <div className="col-span-1 flex h-[58px] w-full flex-col justify-between">
                        <Label
                          htmlFor="mevprotect"
                          className="flex w-fit items-center justify-center gap-x-2 text-nowrap text-sm text-fontColorSecondary"
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
                          className="flex w-fit items-center justify-center gap-x-2 text-nowrap text-sm text-fontColorSecondary"
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
                                quality={50}
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
                                quality={50}
                                className="object-contain"
                              />
                            </div>
                          }
                          placeholder="0.0"
                        />
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
          type="button"
          variant="primary"
          onClick={handleStartOutside}
          className="w-full"
          prefixIcon={
            <div className="relative aspect-square h-4 w-4">
              <Image
                src={
                  meteoraStatus
                    ? "/icons/footer/black-stop.png"
                    : "/icons/footer/black-start.png"
                }
                alt="Black Start Icon"
                fill
                quality={50}
                className="object-contain"
              />
            </div>
          }
        >
          <span className="inline-block text-nowrap font-geistSemiBold text-sm text-[#080811]">
            {meteoraStatus ? "Stop" : "Start"}
          </span>
        </BaseButton>
      </div>
    </>
  );
}
