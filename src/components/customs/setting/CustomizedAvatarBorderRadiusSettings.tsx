import React from "react";
import { AvatarBorderRadiusSetting } from "@/apis/rest/settings/settings";
import AvatarWithBadges from "../AvatarWithBadges";

const CustomizedAvatarBorderRadiusSettings = ({
  option,
}: {
  option: AvatarBorderRadiusSetting;
}) => {
  return (
    <AvatarWithBadges
      src="/images/sample-avatar.png"
      alt="Token Detail Image"
      leftType="pumpfun"
      rightType="raydium"
      size={"lg"}
      classNameParent="!size-[56px]"
      rightClassName={`size-[16px] ${option === "squared" && "-right-[6px] -bottom-[6px]"}`}
      leftClassName={`size-[16px] ${option === "squared" && "-left-[6px] -bottom-[6px]"}`}
      isSquared={option === "squared"}
      isCosmo
    />
  );
};

export default CustomizedAvatarBorderRadiusSettings;
