// @ts-nocheck

import { useQuickAmountStore } from "@/stores/dex-setting/use-quick-amount.store";
import { useActivePresetStore } from "@/stores/dex-setting/use-active-preset.store";
import { submitTransaction } from "@/apis/rest/transaction/submit-transaction";
import { Wallet } from "@/apis/rest/wallet-manager";
import BaseButton from "@/components/customs/buttons/BaseButton";
import PresetSelectionButtons from "@/components/customs/PresetSelectionButtons";
import {
  DEFAULT_QUICK_PICK_PERCENTAGE_LIST,
  DEFAULT_QUICK_PICK_SOL_LIST,
} from "@/components/customs/SellBuyInputAmount";
import CustomToast from "@/components/customs/toasts/CustomToast";
import WalletSelectionButton from "@/components/customs/WalletSelectionButton";
import { Input } from "@/components/ui/input";
import { cn } from "@/libraries/utils";
import { useQuickBuySettingsStore } from "@/stores/setting/use-quick-buy-settings.store";
import { useUserWalletStore } from "@/stores/wallet/use-user-wallet.store";
import {
  convertNumberToPresetId,
  convertNumberToPresetKey,
  convertPresetIdToKey,
  convertPresetIdToNumber,
  convertPresetKeyToNumber,
} from "@/utils/convertPreset";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, {
  useState,
  useEffect,
  useRef,
  KeyboardEvent,
  Dispatch,
  SetStateAction,
} from "react";
import toast from "react-hot-toast";
import { updateQuickBuyPreset } from "@/apis/rest/settings/settings";
import * as Sentry from "@sentry/nextjs";
import { CachedImage } from "@/components/customs/CachedImage";
import { useFeeTip } from "@/stores/setting/use-fee-tip.store";
import { SuperNovaActived } from "@/components/customs/forms/token/SuperNovaActived";

const quickPickSolList: number[] = [0.1, 0.3, 0.5, 0.7];

interface BuySectionPanelProps {
  parentWidth: number;
  buttonStyle?: React.CSSProperties | undefined;
  walletSelectionClassName?: string;
  isSmallScreen?: boolean;
  setActiveBuyPreset: (value: number) => void;
  activeBuyPreset: number;
  autoFeeEnabled: boolean;
  setAutoFeeEnabled: (autoFeeEnabled: boolean) => void;
}

const BuySectionPanel = ({
  parentWidth,
  buttonStyle,
  walletSelectionClassName,
  isSmallScreen = false,
  setActiveBuyPreset,
  activeBuyPreset,
  autoFeeEnabled,
  setAutoFeeEnabled,
}: BuySectionPanelProps) => {
  const params = useParams();
  const queryClient = useQueryClient();

  const cosmoWallets = useQuickAmountStore((state) => state.cosmoWallets);
  const setCosmoWallets = useQuickAmountStore((state) => state.setCosmoWallets);

  const [buyValue, setBuyValue] = useState(0);
  const [isLoadingBuy, setIsLoadingBuy] = useState(false);

  const buyPresets = useQuickBuySettingsStore((state) => state.presets);

  const [isEditInstantBuy, setIsEditInstantBuy] = useState<boolean>(false);
  const updatePresets = useQuickBuySettingsStore((state) => state.setPresets);

  // State for editable preset values
  const [editablePresetValues, setEditablePresetValues] = useState<number[]>(
    [],
  );

  // Keep a backup of original values for potential cancel operation
  const originalValuesRef = useRef<number[]>([]);

  // Ref for the form container to detect key presses
  const formContainerRef = useRef<HTMLDivElement>(null);

  // Initialize editable preset values when active preset changes
  useEffect(() => {
    if (buyPresets) {
      const presetKey = convertNumberToPresetKey(
        activeBuyPreset,
      ) as keyof typeof buyPresets;
      const preset = buyPresets[presetKey];

      const amounts = preset?.amounts?.length
        ? [...preset.amounts]
        : [...DEFAULT_QUICK_PICK_PERCENTAGE_LIST];

      setEditablePresetValues(amounts);

      // Save original for cancel logic
      originalValuesRef.current = [...amounts];
    }
  }, [activeBuyPreset, buyPresets]);

  // Buy mutation
  const [currentTXInfoString, setCurrentTXInfoString] = useState<string>("");
  const buyMutation = useMutation({
    mutationFn: submitTransaction,
    onMutate: (data) => {
      setIsLoadingBuy(true);
      setCurrentTXInfoString(JSON.stringify(data));
    },
    onSuccess: () => {
      setCurrentTXInfoString("");
    },
    onError: (error: Error) => {
      Sentry.captureMessage(
        `Submit TX Error 🔴 - (Buy Section Panel): ${String(error?.message)} | TX: ${currentTXInfoString}`,
        "error",
      );
      setCurrentTXInfoString("");
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message={error.message}
          state="ERROR"
        />
      ));
    },
    onSettled: () => {
      setIsLoadingBuy(false);
    },
  });

  // Add updateSettings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: updateQuickBuyPreset,
    onSuccess: () => {
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message="Quick buy presets updated successfully"
          state="SUCCESS"
        />
      ));
      // Refetch settings after successful update
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

  const handleBuySubmit = () => {
    if (!cosmoWallets?.[0]?.address || !buyPresets) return;

    const presetKey = convertNumberToPresetKey(
      activeBuyPreset,
    ) as keyof typeof buyPresets;
    const preset = buyPresets[presetKey];

    buyMutation.mutate({
      mint: (params?.["mint-address"] || params?.["pool-address"]) as string,
      type: "buy",
      wallets: cosmoWallets?.map((wallet) => ({
        address: wallet?.address,
        amount: buyValue,
      })),
      preset: activeBuyPreset,
      slippage: preset?.slippage,
      mev_protect: false,
      auto_tip: preset?.autoTipEnabled,
      fee: preset?.fee,
      tip: preset?.tip,
      module: "Quick Buy",
    });
  };

  const feetipData = useFeeTip((state) => state.data);
  const handleInstaBuyTrade = (amount: number) => {
    if (isLoadingBuy) return;
    if (!cosmoWallets?.[0]?.address || !buyPresets) return;

    const presetKey = convertNumberToPresetKey(
      activeBuyPreset,
    ) as keyof typeof buyPresets;
    const preset = buyPresets[presetKey];

    buyMutation.mutate({
      mint: (params?.["mint-address"] || params?.["pool-address"]) as string,
      type: "buy",
      wallets: cosmoWallets?.map((wallet) => ({
        address: wallet?.address,
        amount: amount / (cosmoWallets?.length ?? 1),
      })),
      preset: activeBuyPreset,
      slippage: preset?.slippage,
      mev_protect: false,
      auto_tip: preset?.autoTipEnabled,
      fee: (autoFeeEnabled ? feetipData.fee : preset?.fee) as number,
      // tip: preset?.tip,
      module: "Quick Buy",
      tip: (autoFeeEnabled ? feetipData.tip : preset.tip) as number,
    });
  };

  // Handle editing a preset value (only updates local state)
  const handleEditPresetValue = (index: number, value: number) => {
    const newValues = [...editablePresetValues];
    if (isSmallScreen) {
      const exists = allAmounts.findIndex((prevValue) => prevValue === value);
      if (exists === -1) {
        newValues[index] = value;
      } else {
        const duplicateValue = allAmounts[exists];
        const prevValue = allAmounts[index];
        newValues[exists] = prevValue;
        newValues[index] = duplicateValue;
      }
    } else {
      newValues[index] = value;
    }

    setEditablePresetValues(newValues);
  };

  // Check for duplicate values in the preset amounts
  const hasDuplicateValues = (values: number[]): boolean => {
    const uniqueValues = new Set(values);
    return uniqueValues.size !== values.length;
  };

  function compareArraysByIndex<T>(a: T[], b: T[]) {
    const diffs: { index: number; aValue: T; bValue: T }[] = [];

    const maxLength = Math.max(a.length, b.length);
    for (let i = 0; i < maxLength; i++) {
      if (a[i] !== b[i]) {
        diffs.push({ index: i, aValue: a[i], bValue: b[i] });
      }
    }

    return diffs;
  }

  // Save changes to both store and backend
  const savePresetValues = () => {
    if (!buyPresets || updateSettingsMutation.isPending) return;

    // Check for duplicate values before saving
    let newValues = [...editablePresetValues];
    // if (hasDuplicateValues(editablePresetValues)) {
    //   if (!isSmallScreen) {
    //     toast.custom((t: any)=> (
    //       <CustomToast
    //         tVisibleState={t.visible}
    //         message="Duplicate percentage values are not allowed"
    //         state="ERROR"
    //       />
    //     ));
    //     return;
    //   }
    //   const diffs = compareArraysByIndex(allAmounts, editablePresetValues);
    //   console.log("INSTANT TRADE - prev value ", allAmounts);
    //   console.log("INSTANT TRADE - new value ", editablePresetValues);
    //   console.log("INSTANT TRADE - differences ", diffs);
    //   diffs.forEach((diff) => {
    //     const exists = allAmounts.findIndex(
    //       (prevValue) => prevValue === diff.bValue,
    //     );
    //     if (exists === -1) {
    //       newValues[diff.index] = diff.bValue;
    //     } else {
    //       const duplicateValue = allAmounts[exists];
    //       const prevValue = allAmounts[diff.index];
    //       newValues[exists] = prevValue;
    //       newValues[diff.index] = duplicateValue;
    //     }
    //   });
    //   console.log("INSTANT TRADE - swap value ", newValues);
    //   setEditablePresetValues(newValues);
    // }

    const presetKey = convertNumberToPresetKey(
      activeBuyPreset,
    ) as keyof typeof buyPresets;

    // Create the updated preset object for the store
    const updatedPresets = { ...buyPresets };
    const updatedPreset = { ...updatedPresets[presetKey] };
    updatedPreset.amounts = newValues;
    updatedPresets[presetKey] = updatedPreset;

    // Update the local store first
    updatePresets(updatedPresets);

    // Prepare data for the API call
    const submitData = {
      preset: presetKey?.replace("preset", ""),
      slippage: updatedPreset?.slippage,
      autoTipEnabled: updatedPreset?.autoTipEnabled,
      fee: updatedPreset?.fee,
      tip: updatedPreset?.tip,
      processor: updatedPreset?.processor,
      amounts: newValues,
    };

    // Make the API call to update backend
    updateSettingsMutation.mutate(submitData);
  };

  // Handle edit button click
  const handleClickEdit = () => {
    if (isEditInstantBuy) {
      // Save changes when exiting edit mode
      savePresetValues();
      if (!updateSettingsMutation.isPending) {
        setIsEditInstantBuy(false);
      }
    } else {
      // Enter edit mode and backup current values
      originalValuesRef.current = [...editablePresetValues];
      setIsEditInstantBuy(true);
    }
  };

  // Handle key down event to detect Enter key press
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && isEditInstantBuy) {
      e.preventDefault();
      savePresetValues();
      if (!updateSettingsMutation.isPending) {
        setIsEditInstantBuy(false);
      }
    }
  };

  // Add global keyboard event listener for Enter key when in edit mode
  useEffect(() => {
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Enter" && isEditInstantBuy) {
        e.preventDefault();
        savePresetValues();
        if (!updateSettingsMutation.isPending) {
          setIsEditInstantBuy(false);
        }
      }
    };

    if (isEditInstantBuy) {
      window.addEventListener("keydown", handleGlobalKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [isEditInstantBuy, editablePresetValues]);

  const presetKey = convertNumberToPresetKey(activeBuyPreset);

  // Full preset (always full length)
  const allAmounts = buyPresets[presetKey]?.amounts?.length
    ? [...buyPresets[presetKey].amounts]
    : [...DEFAULT_QUICK_PICK_SOL_LIST];

  // Only used for rendering
  const visibleAmounts = isSmallScreen ? allAmounts.slice(0, 4) : allAmounts;

  // Grid logic based on visible count
  let gridColsClass = "grid-cols-3";

  const count = visibleAmounts.length;

  if (isSmallScreen) {
    gridColsClass = "grid-cols-4";
  } else if (count <= 3) {
    gridColsClass = `grid-cols-${count}`;
  } else if (count === 4) {
    gridColsClass = "grid-cols-4";
  } else if (count <= 6) {
    gridColsClass = "grid-cols-3";
  } else {
    gridColsClass = "grid-cols-4";
  }

  return (
    <div
      className={cn(
        "flex h-1/3 w-full flex-col gap-y-2 px-3",
        isSmallScreen && "pb-2",
      )}
      ref={formContainerRef}
    >
      <div className="flex w-full flex-col justify-between gap-y-1.5">
        <div className="flex w-full items-center justify-between">
          <h6 className="font-geistLight text-sm font-normal text-fontColorPrimary">
            Buy
          </h6>
          {/* <WalletSelectionButton
            displayVariant="name"
            value={cosmoWallets}
            setValue={(wallet) => {
              setCosmoWallets(wallet);
            }}
            isGlobal={false}
            className={cn("w-[25%]", walletSelectionClassName)}
            maxWalletShow={10}
          /> */}
          <div>
            <PresetSelectionButtons
              autoFeeEnabled={autoFeeEnabled}
              setAutoFeeEnabled={setAutoFeeEnabled}
              isSmall={isSmallScreen}
              activePreset={convertNumberToPresetId(activeBuyPreset)}
              setActivePreset={(value: string) =>
                setActiveBuyPreset(convertPresetIdToNumber(value))
              }
              isWithEdit
              isEditing={isEditInstantBuy}
              onClickEdit={handleClickEdit}
              isGlobal={false}
              variant="instant-trade"
            />
          </div>
        </div>
      </div>
      <div className="flex w-full items-center gap-x-3 max-md:flex-wrap">
        <div className={cn("grid w-full gap-2", gridColsClass)}>
          {isEditInstantBuy
            ? // Edit mode - render editable inputs
              visibleAmounts.map((value, index) => (
                <div key={`edit_${index}`} className="flex flex-col">
                  <Input
                    type="text"
                    value={value}
                    isNumeric={true}
                    decimalScale={9}
                    onNumericValueChange={({ floatValue }) =>
                      handleEditPresetValue(index, floatValue || 0)
                    }
                    onKeyDown={handleKeyDown}
                    placeholder="Amount"
                    className={cn(
                      "h-[32px]",
                      parentWidth < 400 && "pl-6 pr-2 text-xs",
                    )}
                    prefixEl={
                      <div
                        className={cn(
                          "absolute left-3 flex aspect-square size-4 flex-shrink-0 items-center justify-center",
                          parentWidth < 400 && "left-2 size-3.5",
                        )}
                      >
                        <CachedImage
                          src="/icons/solana-sq.svg"
                          alt="Solana SQ Icon"
                          fill
                          quality={50}
                          className="object-contain"
                        />
                      </div>
                    }
                    disabled={updateSettingsMutation.isPending}
                  />
                </div>
              ))
            : // Normal mode - render buttons
              visibleAmounts.map((quickPickValue, index) => {
                const isSelected = quickPickValue === buyValue;

                return (
                  <BaseButton
                    type="button"
                    key={quickPickValue + "_" + index}
                    variant="rounded"
                    size="long"
                    onClick={() => handleInstaBuyTrade(quickPickValue)}
                    disabled={isLoadingBuy}
                    className={cn(
                      "flex h-[32px] items-center justify-center border-white/[8%] hover:border-success hover:bg-success/[8%] hover:text-success disabled:opacity-[70%]",
                      isSelected &&
                        "border-success bg-success/[8%] text-success",
                      parentWidth < 400 && "gap-0.5 px-1.5",
                    )}
                    style={buttonStyle}
                  >
                    <div
                      className={cn(
                        "relative aspect-square size-4 flex-shrink-0",
                        parentWidth < 400 && "size-3.5",
                      )}
                    >
                      <CachedImage
                        src="/icons/solana-sq.svg"
                        alt="Solana SQ Icon"
                        fill
                        quality={50}
                        className="object-contain"
                      />
                    </div>
                    <span
                      className={cn(
                        "inline-block truncate text-nowrap font-geistSemiBold text-sm leading-3",
                        parentWidth < 400 && "text-[12px]",
                      )}
                    >
                      {quickPickValue}
                    </span>
                  </BaseButton>
                );
              })}
        </div>
      </div>
      {autoFeeEnabled && (
        <SuperNovaActived
          className="flex items-center gap-1"
          title="Buy mode is active"
        />
      )}
    </div>
  );
};

export default BuySectionPanel;
