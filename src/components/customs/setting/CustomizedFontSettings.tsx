import React from "react";
import StatText from "../cards/partials/StatText";
import { ColorSetting, FontSetting } from "@/apis/rest/settings/settings";

// mapping text size class
const fontSizeMap = {
  normal: "text-xs",
  large: "text-sm",
  extralarge: "text-base",
  doubleextralarge: "text-lg",
};
const iconSizeMap = {
  normal: "size-4",
  large: "size-5",
  extralarge: "size-5",
  doubleextralarge: "size-5",
};

// mapping value color class
const valueColorMap = {
  normal: "text-white",
  blue: "text-[#4A89FF]",
  purple: "text-[#DF74FF]",
  fluorescentblue: "text-[#1BF6FD]",
  neutral: "text-warning",
  lemon: "text-[#C0FD30]",
};

const CustomizedFontSettings = ({
  font = "normal",
  color = "normal",
}: {
  font?: FontSetting;
  color?: ColorSetting;
}) => {
  return (
    <div className="flex items-center gap-x-2">
      <StatText
        value="$75K"
        label="MC"
        tooltipLabel="Market Cap"
        valueColor="text-fontColorPrimary"
        customClassName={fontSizeMap[font]}
      />
      <StatText
        value="$98K"
        label="V"
        tooltipLabel="Volume"
        valueColor={valueColorMap[color]}
        customClassName={fontSizeMap[font]}
      />
      <StatText
        icon="holders"
        value="4"
        label="Holders"
        tooltipLabel="Holders"
        valueColor={valueColorMap[color]}
        customClassName={fontSizeMap[font]}
        customClassIcon={iconSizeMap[font]}
      />
      <StatText
        icon="wallet"
        value="2"
        label="Wallets"
        tooltipLabel="Wallets"
        valueColor={valueColorMap[color]}
        customClassName={fontSizeMap[font]}
        customClassIcon={iconSizeMap[font]}
      />
    </div>
  );
};

export default CustomizedFontSettings;
