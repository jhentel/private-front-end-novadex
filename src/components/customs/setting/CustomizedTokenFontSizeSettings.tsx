"use client";

import React, { useMemo } from "react";
import { CachedImage } from "../CachedImage";
import { TokenText } from "../cards/partials/TokenText";
import { TokenFontSizeSetting } from "@/apis/rest/settings/settings";
import { truncateString } from "@/utils/truncateString";
import { cn } from "@/libraries/utils";

interface CustomizedTokenFontSizeSettingsProps {
  option: TokenFontSizeSetting;
}

interface FontSizeConfig {
  nameClass: string;
  symbolClass: string;
  nameTruncate: boolean;
  symbolTruncate: boolean;
  nameMaxChars?: number;
  symbolMaxChars?: number;
}

// Mapping for font sizes with automatic truncation behavior
const sizesConfig: Record<TokenFontSizeSetting, FontSizeConfig> = {
  normal: {
    nameClass: "text-sm",
    symbolClass: "text-sm",
    nameTruncate: false,
    symbolTruncate: false,
  },
  large: {
    nameClass: "text-base",
    symbolClass: "text-base",
    nameTruncate: false,
    symbolTruncate: false,
  },
  extralarge: {
    nameClass: "text-lg",
    symbolClass: "text-lg",
    nameTruncate: true,
    nameMaxChars: 4,
    symbolTruncate: true,
    symbolMaxChars: 5,
  },
  doubleextralarge: {
    nameClass: "text-xl",
    symbolClass: "text-xl",
    nameTruncate: true,
    nameMaxChars: 3,
    symbolTruncate: true,
    symbolMaxChars: 4,
  },
};

const CustomizedTokenFontSizeSettings = ({
  option,
}: CustomizedTokenFontSizeSettingsProps) => {
  const config = useMemo(() => sizesConfig[option], [option]);
  // Display values with truncation applied if needed
  const displaySymbol = useMemo(() => {
    const symbol = "ByMiles";
    return config?.symbolTruncate && config?.symbolMaxChars
      ? truncateString(symbol, config.symbolMaxChars)
      : symbol;
  }, [config]);

  const displayName = useMemo(() => {
    const name = "BYMILES";
    return config?.nameTruncate && config?.nameMaxChars
      ? truncateString(name, config.nameMaxChars)
      : name;
  }, [config]);

  return (
    <div className="flex items-center gap-x-2">
      <CachedImage
        src={"/icons/eye-hide.svg"}
        alt={"Show Token Icon"}
        height={16}
        width={16}
        quality={100}
        className="object-contain"
      />
      <p className={cn(config?.symbolClass, "text-white")}>{displaySymbol}</p>
      <p className={cn(config?.nameClass)}>{displayName}</p>
      <CachedImage
        src={"/icons/copy-secondary.svg"}
        alt={"Show Token Icon"}
        height={16}
        width={16}
        quality={100}
        className="object-contain"
      />
    </div>
  );
};

export default CustomizedTokenFontSizeSettings;
