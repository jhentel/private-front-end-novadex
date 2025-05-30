"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

// ######## Components 🧩 ########
import Image from "next/image";
import { Input } from "@/components/ui/input";
import Separator from "@/components/customs/Separator";
import CustomToast from "@/components/customs/toasts/CustomToast";

// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import {
  MAXIMUM_BUY_AMOUNT_MESSAGE,
  MINIMMUM_BUY_AMOUNT,
} from "@/constants/constant";
import { useQuickAmountStore } from "@/stores/dex-setting/use-quick-amount.store";
import { useDebouncedQuickBuy } from "@/hooks/use-debounced-quickbuy";
import { useTokenStateAmountStore } from "@/stores/dex-setting/use-token-state-amount.store";
import { TokenState } from "./lists/NewlyCreatedList";

const QuickAmountInput = ({
  isLoading = false,
  value,
  onChange: propOnChange,
  className,
  classNameChildren,
  width,
  type = "buy",
}: {
  isLoading?: boolean;
  value?: number;
  onChange?: (value: number) => void;
  className?: string;
  classNameChildren?: string;
  width?: number | string;
  type?: "buy" | "sell";
}) => {
  const { debouncedUpdateQuickBuyAmount } = useDebouncedQuickBuy();
  const valueStore = useQuickAmountStore((state) => state.cosmoQuickBuyAmount);
  const onChangeStore = useQuickAmountStore(
    (state) => state.setCosmoQuickBuyAmount,
  );
  const displayValueStore = useQuickAmountStore(
    (state) => state.cosmoQuickBuyAmountDisplay,
  );
  const setDisplayValueStore = useQuickAmountStore(
    (state) => state.setCosmoQuickBuyAmountDisplay,
  );
  const setTokenStateAmount = useTokenStateAmountStore(
    (state: { setAmount: (tokenState: TokenState, amount: number) => void }) =>
      state.setAmount,
  );
  const [displayValue, setDisplayValue] = useState("");
  const [isSetted, setIsSetted] = useState(false);

  useEffect(() => {
    setDisplayValue(value?.toFixed(9)?.replace(/\.?0+$/, "") ?? "");
    setIsSetted(true);
  }, []);
  useEffect(() => {
    if (!isSetted && !isLoading) {
      setDisplayValueStore(valueStore?.toFixed(9)?.replace(/\.?0+$/, "") ?? "");
      setIsSetted(true);
    }
  }, [valueStore]);

  useEffect(() => {
    const newValue = parseFloat(displayValue.replace(/,/g, ""));
    if (!isNaN(newValue)) {
      // onChange(newValue);
      propOnChange?.(newValue);
      // debouncedUpdateQuickBuyAmount({
      //   amount: newValue,
      //   type: "cosmo",
      // });
    }
  }, [displayValue]);

  useEffect(() => {
    const newValue = parseFloat(displayValueStore.replace(/,/g, ""));
    if (!isNaN(newValue)) {
      onChangeStore(newValue);

      debouncedUpdateQuickBuyAmount({
        amount: newValue,
        type: "cosmo",
      });
    }
  }, [displayValueStore]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    // Detect backspace and delete actions
    const inputType = (e.nativeEvent as InputEvent).inputType;
    const isBackspaceOrDelete =
      inputType === "deleteContentBackward" ||
      inputType === "deleteContentForward";

    // Exclude toast logic for backspace and delete inputs
    if (isBackspaceOrDelete) {
      setDisplayValue(value);
      return;
    }

    const numericValue = parseFloat(value);
    const isInvalidNumber = Array.from(value).some((c, i) => {
      const isNaN = Number.isNaN(Number(c));
      // Allow decimal point anywhere but only once
      return (c === "." && value.indexOf(".") !== i) || (isNaN && c !== ".");
    });

    if (!isInvalidNumber) {
      // Handle single decimal point
      if (value === ".") {
        setDisplayValue(value);
        return;
      }

      // Convert decimal numbers starting with dot
      const processedValue =
        value.startsWith(".") && value.length > 1 ? `0${value}` : value;

      if (processedValue.length <= 6) {
        setDisplayValue(processedValue);
      } else {
        if (processedValue.length > 5 && numericValue < MINIMMUM_BUY_AMOUNT) {
          toast.custom((t: any) => (
            <CustomToast
              tVisibleState={t.visible}
              message={MAXIMUM_BUY_AMOUNT_MESSAGE}
              state="ERROR"
            />
          ));
          setDisplayValue(MINIMMUM_BUY_AMOUNT.toString());
        } else {
          setDisplayValue(processedValue);
        }
      }
    }
  };
  const handleChangeStore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    // Detect backspace and delete actions
    const inputType = (e.nativeEvent as InputEvent).inputType;
    const isBackspaceOrDelete =
      inputType === "deleteContentBackward" ||
      inputType === "deleteContentForward";

    // Exclude toast logic for backspace and delete inputs
    if (isBackspaceOrDelete) {
      setDisplayValueStore(value);
      return;
    }

    const numericValue = parseFloat(value);
    const isInvalidNumber = Array.from(value).some((c, i) => {
      const isNaN = Number.isNaN(Number(c));
      // Allow decimal point anywhere but only once
      return (c === "." && value.indexOf(".") !== i) || (isNaN && c !== ".");
    });

    if (!isInvalidNumber) {
      // Handle single decimal point
      if (value === ".") {
        setDisplayValueStore(value);
        return;
      }

      // Convert decimal numbers starting with dot
      const processedValue =
        value.startsWith(".") && value.length > 1 ? `0${value}` : value;

      if (processedValue.length <= 6) {
        setDisplayValueStore(processedValue);
      } else {
        if (processedValue.length > 5 && numericValue < MINIMMUM_BUY_AMOUNT) {
          toast.custom((t: any) => (
            <CustomToast
              tVisibleState={t.visible}
              message={MAXIMUM_BUY_AMOUNT_MESSAGE}
              state="ERROR"
            />
          ));
          setDisplayValueStore(MINIMMUM_BUY_AMOUNT.toString());
        } else {
          setDisplayValueStore(processedValue);
        }
      }
    }
  };

  return (
    <>
      <Input
        type="text"
        value={isLoading ? "-" : value ? displayValue : displayValueStore}
        maxLength={11}
        onChange={value ? handleChange : handleChangeStore}
        placeholder="Enter Amount"
        isError={false}
        prefixEl={
          <div className="absolute left-0 flex h-[14px] flex-shrink-0 items-center justify-center gap-x-2 pl-2.5">
            <div className="relative aspect-square h-3.5 w-3.5 flex-shrink-0 lg:h-[15px] lg:w-[15px]">
              <Image
                src="/icons/quickbuy.png"
                alt="Quickbuy Icon"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
            <Separator
              color="#202037"
              orientation="vertical"
              unit="fixed"
              fixedHeight={18}
            />
            <div className="relative flex aspect-square size-[16px] flex-shrink-0 items-center justify-center">
              {type === "buy" ? (
                <Image
                  src="/icons/solana-sq.svg"
                  alt="Solana SQ Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              ) : (
                <span className="h-full leading-4 text-fontColorPrimary">
                  %
                </span>
              )}
            </div>
          </div>
        }
        className={cn("h-[32px] pl-16 pr-1.5", classNameChildren)}
        parentClassName={cn("flex-grow-0", className)}
        width={typeof width === "number" ? `${width}px` : width}
        isExpandable
      />
    </>
  );
};

export default QuickAmountInput;
