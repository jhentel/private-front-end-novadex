import React from "react";
import { AvatarSetting } from "@/apis/rest/settings/settings";
import AvatarWithBadges from "../AvatarWithBadges";

const avatarSizeMap = {
  normal: "!size-[48px]",
  large: "!size-[56px]",
  extralarge: "!size-[64px]",
  doubleextralarge: "!size-[72px]",
};

const CustomizedAvatarSettings = ({ option }: { option: AvatarSetting }) => {
  return (
    <AvatarWithBadges
      src="/images/sample-avatar.png"
      alt="Token Detail Image"
      leftType="pumpfun"
      rightType="raydium"
      size={option === "normal" || option === "large" ? "sm" : "lg"}
      classNameParent={avatarSizeMap[option]}
    />
  );
};

export default CustomizedAvatarSettings;
