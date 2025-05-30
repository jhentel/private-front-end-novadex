import { cn } from "@/libraries/utils";
import {
  Preset,
  useActivePresetStore,
} from "@/stores/dex-setting/use-active-preset.store";
import Image from "next/image";
import React, { HTMLAttributes, useCallback, useMemo } from "react";
import { Label } from "../ui/label";
import { useSettingStore } from "@/stores/footer/use-setting.store";
import { useQuickBuySettingsStore } from "@/stores/setting/use-quick-buy-settings.store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Bot, BotOff, Fuel, HandCoins, PersonStanding } from "lucide-react";
import { QuickPresetData } from "@/apis/rest/settings/settings";
import {
  convertPresetIdToKey,
  convertPresetKeyToId,
} from "@/utils/convertPreset";
import { PresetKey } from "@/types/preset";
import Link from "next/link";

type PresetType = "N1" | "N2" | "N3";
const presetOptions = ["N1", "N2", "N3"];
const PresetSelectionButtons = ({
  activePreset = "preset1",
  setActivePreset = () => {},
  isWithSetting = false,
  isWithLabel,
  isWithEdit,
  isEditing,
  onClickEdit,
  isSmall = false,
  setAutoFeeEnabled: setAutoFeeEnableState,
  autoFeeEnabled: autoFeeEnabledState = undefined,
  isWithAutoFee = true,
  isGlobal = true,
  variant,
}: {
  activePreset?: string | number;
  setActivePreset?: (preset: Preset) => void;
  isWithSetting?: boolean;
  isWithLabel?: boolean;
  isWithEdit?: boolean;
  isEditing?: boolean;
  onClickEdit?: () => void;
  isSmall?: boolean;
  setAutoFeeEnabled?: (value: boolean) => void;
  autoFeeEnabled?: boolean;
  isWithAutoFee?: boolean;
  isGlobal?: boolean;
  variant?: "instant-trade";
}) => {
  const { isOpen: isOpenSettings, setIsOpen: setIsOpenSettings } =
    useSettingStore();
  // const activePresetGlobal = useQuickBuySettingsStore(
  //   (state) => state.activePreset,
  // );
  // const setActivePresetGlobal = useQuickBuySettingsStore(
  //   (state) => state.setActivePreset,
  // );
  const setCosmoActivePreset = useActivePresetStore(
    (state) => state.setCosmoActivePreset,
  );
  const activePresetGlobal = useActivePresetStore(
    (state) => state.cosmoActivePreset,
  );
  const autoFeeEnabled = useQuickBuySettingsStore(
    (state) => state.presets.autoFeeEnabled,
  );
  const preset = useQuickBuySettingsStore((state) => state.presets);

  const finalActivePreset = isGlobal ? activePresetGlobal : activePreset;
  const setFinalActivePreset = (v: string) => {
    if (isGlobal) {
      // setActivePresetGlobal(v as PresetKey);
      setCosmoActivePreset(v as PresetKey);
    }
    if (setActivePreset) {
      setActivePreset(convertPresetKeyToId(v) as any);
    }
  };

  const autoFeedEnabledMemo = useMemo(() => {
    if (autoFeeEnabledState === undefined) {
      return autoFeeEnabled;
    }
    return autoFeeEnabledState;
  }, [autoFeeEnabledState, autoFeeEnabled]);

  const setAutoFeeEnable = useQuickBuySettingsStore(
    (state) => state.setAutoFeeEnable,
  );

  const setAutoFeeEnabled = useCallback(
    (value: boolean) => {
      if (setAutoFeeEnableState !== undefined) {
        setAutoFeeEnableState(value);
      }
      setAutoFeeEnable(value);
    },
    [setAutoFeeEnable, setAutoFeeEnableState],
  );

  if (isWithEdit) {
    return (
      <div
        className={cn(
          "flex w-full items-center justify-between rounded-[8px] border border-border",
          variant === "instant-trade" && "border-white/[8%]",
        )}
      >
        <div className="flex h-[32px] flex-shrink-0 items-center overflow-hidden rounded-[8px]">
          <div className="h-full flex-grow p-[2px]">
            <div
              className={cn(
                "flex h-full w-full items-center rounded-[6px] bg-secondary p-1",
                isSmall && "p-0.5",
                variant === "instant-trade" && "bg-white/[8%]",
              )}
            >
              {presetOptions?.map((option, index) => {
                const isActive = isWithAutoFee
                  ? finalActivePreset === option && !autoFeedEnabledMemo
                  : finalActivePreset === option;

                return (
                  <button
                    type="button"
                    key={index + option}
                    onClick={() => {
                      setFinalActivePreset(
                        convertPresetIdToKey(option as PresetType),
                      );
                      setAutoFeeEnabled(false);
                    }}
                    className={cn(
                      "h-full w-full rounded-[6px] px-3 font-geistSemiBold text-sm leading-3 text-fontColorPrimary duration-300",
                      isActive ? "bg-white/[12%]" : "bg-transparent",
                      isSmall && "px-2",
                    )}
                  >
                    {option}
                  </button>
                );
              })}

              {isWithAutoFee && (
                <AutoFeeButton
                  autoFeedEnabledMemo={autoFeedEnabledMemo}
                  setAutoFeeEnabled={setAutoFeeEnabled}
                  isWithTooltip={false}
                />
              )}

              <button
                onClick={onClickEdit}
                type="button"
                className={cn(
                  "h-full w-full rounded-[6px] px-3 font-geistSemiBold text-sm text-fontColorPrimary duration-300",
                )}
              >
                <div className="relative flex size-4 items-center justify-center">
                  <Image
                    src={
                      isEditing
                        ? "/icons/setting/tick.svg"
                        : "/icons/setting/edit.svg"
                    }
                    alt="Setting Icon"
                    fill
                    quality={50}
                    className="object-contain"
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isWithSetting) {
    if (isWithLabel) {
      return (
        <div className="flex w-fit items-center justify-between rounded-[8px] border border-border pl-3 max-[425px]:pl-0">
          <Label className="mr-2 text-nowrap font-geistSemiBold text-sm text-fontColorSecondary max-[425px]:hidden">
            Presets
          </Label>
          <div className="flex h-[32px] flex-shrink-0 items-center overflow-hidden rounded-[8px]">
            <div className="h-full flex-grow p-[3px]">
              <div className="flex h-full w-full items-center rounded-[6px] bg-secondary p-1">
                {presetOptions?.map((option, index) => {
                  const isActive = isWithAutoFee
                    ? (finalActivePreset === convertPresetIdToKey(option) ||
                        "N" + finalActivePreset ===
                          convertPresetIdToKey(option)) &&
                      !autoFeedEnabledMemo
                    : finalActivePreset === convertPresetIdToKey(option) ||
                      "N" + finalActivePreset === convertPresetIdToKey(option);

                  return (
                    <ButtonWithTooltip
                      presetData={
                        preset?.[convertPresetIdToKey(option as PresetType)]
                      }
                      key={index + option}
                      buttonProps={{
                        onClick: () => {
                          setFinalActivePreset(
                            convertPresetIdToKey(option as PresetType),
                          );
                          setAutoFeeEnabled(false);
                        },
                        children: option,
                      }}
                      isActive={isActive}
                    />
                  );
                })}

                {isWithAutoFee && (
                  <AutoFeeButton
                    autoFeedEnabledMemo={autoFeedEnabledMemo}
                    setAutoFeeEnabled={setAutoFeeEnabled}
                  />
                )}
                <Link
                  href="/settings"
                  className={cn(
                    "h-full w-full rounded-[6px] px-3 font-geistSemiBold text-sm text-fontColorPrimary duration-300 xl:hidden",
                  )}
                >
                  <div className="relative flex size-4 items-center justify-center">
                    <Image
                      src="/icons/setting.png"
                      alt="Setting Icon"
                      fill
                      quality={50}
                      unoptimized
                      className="object-contain"
                    />
                  </div>
                </Link>
                <button
                  onClick={() => setIsOpenSettings(!isOpenSettings)}
                  type="button"
                  className={cn(
                    "h-full w-full rounded-[6px] px-3 font-geistSemiBold text-sm text-fontColorPrimary duration-300 max-xl:hidden",
                  )}
                >
                  <div className="relative flex size-4 items-center justify-center">
                    <Image
                      src="/icons/setting.png"
                      alt="Setting Icon"
                      fill
                      quality={50}
                      className="object-contain"
                    />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="flex w-full items-center justify-between rounded-[8px] border border-border">
        <div className="flex h-[32px] flex-shrink-0 items-center overflow-hidden rounded-[8px]">
          <div className="h-full flex-grow p-[2px]">
            <div className="flex h-full w-full items-center rounded-[6px] bg-secondary p-1">
              {presetOptions?.map((option, index) => {
                const isActive = isWithAutoFee
                  ? finalActivePreset === convertPresetIdToKey(option) &&
                    !autoFeedEnabledMemo
                  : finalActivePreset === convertPresetIdToKey(option);

                return (
                  <ButtonWithTooltip
                    presetData={
                      preset?.[convertPresetIdToKey(option as PresetType)]
                    }
                    key={index + option}
                    buttonProps={{
                      onClick: () => {
                        setFinalActivePreset(
                          convertPresetIdToKey(option as PresetType),
                        );
                        setAutoFeeEnabled(false);
                      },
                      children: option,
                    }}
                    isActive={isActive}
                  />
                );
              })}

              {isWithAutoFee && (
                <AutoFeeButton
                  autoFeedEnabledMemo={autoFeedEnabledMemo}
                  setAutoFeeEnabled={setAutoFeeEnabled}
                />
              )}
              <Link
                href="/settings"
                className={cn(
                  "h-full w-full rounded-[6px] px-3 font-geistSemiBold text-sm text-fontColorPrimary duration-300 xl:hidden",
                )}
              >
                <div className="relative flex size-4 items-center justify-center">
                  <Image
                    src="/icons/setting.png"
                    alt="Setting Icon"
                    fill
                    quality={50}
                    unoptimized
                    className="object-contain"
                  />
                </div>
              </Link>
              <button
                onClick={() => setIsOpenSettings(!isOpenSettings)}
                type="button"
                className={cn(
                  "h-full w-full rounded-[6px] px-3 font-geistSemiBold text-sm text-fontColorPrimary duration-300 max-xl:hidden",
                )}
              >
                <div className="relative flex size-4 items-center justify-center">
                  <Image
                    src="/icons/setting.png"
                    alt="Setting Icon"
                    fill
                    quality={50}
                    className="object-contain"
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[32px] flex-shrink-0 items-center overflow-hidden rounded-[8px] border border-border">
      <div className="h-full flex-grow p-[3px]">
        <div className="flex h-full w-full items-center rounded-[6px] bg-white/[6%] p-0.5">
          {presetOptions?.map((option, index) => {
            const isActive = isWithAutoFee
              ? finalActivePreset === convertPresetIdToKey(option) &&
                !autoFeedEnabledMemo
              : finalActivePreset === convertPresetIdToKey(option);

            return (
              <button
                type="button"
                key={index + option}
                onClick={() => {
                  setFinalActivePreset(
                    convertPresetIdToKey(option as PresetType),
                  );
                  setAutoFeeEnabled(false);
                }}
                className={cn(
                  "h-full w-full rounded-[6px] px-3 font-geistSemiBold text-sm leading-3 text-fontColorPrimary duration-300",
                  isActive ? "bg-white/[12%]" : "bg-transparent",
                )}
              >
                {option}
              </button>
            );
          })}

          {isWithAutoFee && (
            <AutoFeeButton
              isWithTooltip={false}
              autoFeedEnabledMemo={autoFeedEnabledMemo}
              setAutoFeeEnabled={setAutoFeeEnabled}
            />
          )}
        </div>
      </div>
    </div>
  );
};

interface ButtonWithTooltipProps {
  buttonProps?: HTMLAttributes<HTMLButtonElement>;
  isActive?: boolean;
  presetData?: QuickPresetData;
}

const ButtonWithTooltip = ({
  buttonProps,
  isActive,
  presetData,
}: ButtonWithTooltipProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              "h-full w-full rounded-[6px] px-3 font-geistSemiBold text-sm leading-3 text-fontColorPrimary duration-300",
              isActive ? "bg-white/[12%]" : "bg-transparent",
            )}
            {...buttonProps}
          />
        </TooltipTrigger>
        <TooltipContent className="z-[1000] px-2 py-2.5" side="bottom">
          <ul className="space-y-3">
            <li className="flex items-center gap-1">
              <Fuel height={14} className="shrink-0" />
              <span>{presetData?.fee}</span>
            </li>
            <li className="flex items-center gap-1">
              <HandCoins height={14} className="shrink-0" />
              <span>{presetData?.tip}</span>
            </li>
            <li className="flex items-center gap-1">
              <PersonStanding height={20} className="shrink-0" />
              <span>{presetData?.slippage}%</span>
            </li>
            <li className="flex items-center gap-1">
              {["secure", "jito"].includes(
                (presetData?.processor as string)?.toLowerCase(),
              ) ? (
                <Bot height={16} className="shrink-0 text-green-500" />
              ) : (
                <BotOff height={16} className="shrink-0 text-red-500" />
              )}

              <span>
                {["secure", "jito"].includes(
                  (presetData?.processor as string)?.toLowerCase(),
                )
                  ? "ON"
                  : "OFF"}
              </span>
            </li>
          </ul>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

interface AutoFeeButtonProps {
  setAutoFeeEnabled: (value: boolean) => void;
  autoFeedEnabledMemo: boolean;
  isWithTooltip?: boolean;
}
const AutoFeeButton = ({
  autoFeedEnabledMemo,
  setAutoFeeEnabled,
  isWithTooltip = true,
}: AutoFeeButtonProps) => {
  if (isWithTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setAutoFeeEnabled(true)}
              type="button"
              className={cn(
                "h-full w-full rounded-[6px] px-3 font-geistSemiBold text-sm text-fontColorPrimary duration-300",
                autoFeedEnabledMemo ? "bg-white/[12%]" : "bg-transparent",
              )}
            >
              <div className="relative flex size-4 items-center justify-center">
                <Image
                  src="/icons/auto-fee-icon.svg"
                  alt="Auto "
                  fill
                  quality={100}
                  className="object-contain"
                />
              </div>
            </button>
          </TooltipTrigger>
          <TooltipContent
            className="z-[1000] max-w-[300px] px-2 py-2.5"
            side="bottom"
          >
            <span className="text-xs">
              SuperNova mode automatically optimizes your gas, bribes, slippage,
              and other settings to ensure you&apos;re always using the most
              effective configuration.
            </span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <button
      onClick={() => setAutoFeeEnabled(true)}
      type="button"
      className={cn(
        "h-full w-full rounded-[6px] px-3 font-geistSemiBold text-sm text-fontColorPrimary duration-300",
        autoFeedEnabledMemo ? "bg-white/[12%]" : "bg-transparent",
      )}
    >
      <div className="relative flex size-4 items-center justify-center">
        <Image
          src="/icons/auto-fee-icon.svg"
          alt="Auto "
          fill
          quality={100}
          className="object-contain"
        />
      </div>
    </button>
  );
};

export default React.memo(PresetSelectionButtons);
