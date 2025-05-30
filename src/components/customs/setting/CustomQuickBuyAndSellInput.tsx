import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { CachedImage } from "../CachedImage";

interface BaseQuickAmount {
  order: number;
  amount: number;
}

interface CustomQuickBuyAmountType extends BaseQuickAmount {}
interface CustomQuickSellPercentageType extends BaseQuickAmount {}

interface Props {
  type: "buy" | "sell";
  values: BaseQuickAmount[];
  onChange: (order: number, value: string) => void;
  presetAmount: number[];
}

const CustomQuickBuyAndSellInput = ({
  presetAmount,
  type,
  values,
  onChange,
}: Props) => {
  const [focused, setFocused] = useState<number | null>(null);
  // Store string representations of inputs to preserve leading zeros after decimal
  const [inputStrings, setInputStrings] = useState<Record<number, string>>({});

  useEffect(() => {
    setInputStrings((prev) => {
      const newStrings: Record<number, string> = { ...prev };
      presetAmount.forEach((item, i) => {
        newStrings[i + 1] = String(item);
      });
      return newStrings;
    });
  }, [presetAmount]);

  const handleChange = (order: number, value: string) => {
    // Validate input: allow empty string, numbers, and decimal numbers with trailing zeros
    if (value === "" || /^-?\d*\.?\d*$/.test(value)) {
      // Store the string representation
      setInputStrings((prev) => ({ ...prev, [order]: value }));

      // Convert to number for the parent component
      onChange(order, value);
    }
  };

  // Ensure we only render 6 inputs
  const normalizedValues = values.slice(0, 6);

  if (type === "buy") {
    return (
      <div className="flex w-full flex-wrap items-center gap-2">
        {normalizedValues.map((item, index) => (
          <div
            key={`buy-input-${index}`}
            className="relative flex h-auto w-full max-w-[100px] items-center"
          >
            <Input
              type="text" // Essential for handling decimal inputs correctly
              value={
                inputStrings[item.order] !== undefined
                  ? inputStrings[item.order]
                  : String(item.amount)
              }
              onChange={(e) => handleChange(item.order, e.target.value)}
              onFocus={() => setFocused(index)}
              autoFocus={focused === index}
              placeholder="0.0"
              inputMode="decimal" // Helps with mobile keyboard
              prefixEl={
                <div className="absolute left-3 aspect-auto h-[12px] w-[14px] flex-shrink-0">
                  <CachedImage
                    src="/icons/solana-sq.svg"
                    alt="Solana SQ Icon"
                    fill
                    quality={50}
                    className="object-contain"
                  />
                </div>
              }
              className="h-8 border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary"
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-wrap items-center gap-2">
      {normalizedValues.map((item, index) => (
        <div
          key={`sell-input-${index}`}
          className="relative flex h-auto w-full max-w-[72px] items-center"
        >
          <Input
            type="text"
            value={
              inputStrings[item.order] !== undefined
                ? inputStrings[item.order]
                : String(item.amount)
            }
            onChange={(e) => {
              const value = e.target.value;
              if (
                value === "" ||
                (/^\d*\.?\d*$/.test(value) && parseFloat(value) <= 100)
              ) {
                handleChange(item.order, value);
              }
            }}
            onFocus={() => setFocused(index)}
            autoFocus={focused === index}
            inputMode="decimal"
            placeholder="0"
            className="h-8 border-border bg-transparent pr-6 text-sm text-fontColorPrimary placeholder:text-fontColorSecondary"
            suffixEl={
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-fontColorPrimary">
                %
              </span>
            }
          />
        </div>
      ))}
    </div>
  );
};

export default CustomQuickBuyAndSellInput;
