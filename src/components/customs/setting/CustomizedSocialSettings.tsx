import React from "react";
import { SocialSetting } from "@/apis/rest/settings/settings";
import Image from "next/image";
import { cn } from "@/libraries/utils";

const iconSizeContainerMap: Record<
  string,
  "size-[20px]" | "size-[22px]" | "size-[24px]" | "size-[28px]"
> = {
  normal: "size-[20px]",
  large: "size-[22px]",
  extralarge: "size-[24px]",
  doubleextralarge: "size-[28px]",
};

const iconSizeMap: Record<
  string,
  "size-[16px]" | "size-[18px]" | "size-[20px]" | "size-[24px]"
> = {
  normal: "size-[16px]",
  large: "size-[18px]",
  extralarge: "size-[20px]",
  doubleextralarge: "size-[24px]",
};

const CustomizedSocialSettings = ({
  option = "normal",
}: {
  option: SocialSetting;
}) => {
  return (
    <div className="flex items-center gap-x-2">
      <div
        className={cn(
          "gb__white__btn relative flex aspect-square flex-shrink-0 items-center justify-center rounded-[4px] bg-white/[6%] duration-300 before:!absolute before:!rounded-[4px] hover:bg-white/[12%]",
          iconSizeContainerMap[option], "!w-auto pl-1 pr-1.5"
        )}
      >
        <div className="flex items-center gap-x-1">
          <div
            className={cn(
              "relative aspect-square flex-shrink-0",
              iconSizeMap[option],
            )}
          >
            <Image
              src={`/icons/social/twitter.svg`}
              alt={`Twitter Social Icon`}
              fill
              quality={50}
              loading="lazy"
              className="object-contain"
            />
          </div>
          <span className="text-xs text-white">9</span>
        </div>
      </div>
      <div
        className={cn(
          "gb__white__btn relative flex aspect-square flex-shrink-0 items-center justify-center rounded-[4px] bg-white/[6%] duration-300 before:!absolute before:!rounded-[4px] hover:bg-white/[12%]",
          iconSizeContainerMap[option],
        )}
      >
        <div
          className={cn(
            "relative aspect-square flex-shrink-0",
            iconSizeMap[option],
          )}
        >
          <Image
            src={`/icons/social/pumpfun.svg`}
            alt={`Pumpfun Social Icon`}
            fill
            quality={50}
            loading="lazy"
            className="object-contain"
          />
        </div>
      </div>
      <div
        className={cn(
          "gb__white__btn relative flex aspect-square flex-shrink-0 items-center justify-center rounded-[4px] bg-white/[6%] duration-300 before:!absolute before:!rounded-[4px] hover:bg-white/[12%]",
          iconSizeContainerMap[option],
        )}
      >
        <div
          className={cn(
            "relative aspect-square flex-shrink-0",
            iconSizeMap[option],
          )}
        >
          <Image
            src={`/icons/social/telegram-white.svg`}
            alt={`Telegram Social Icon`}
            fill
            quality={50}
            loading="lazy"
            className="object-contain"
          />
        </div>
      </div>
      <div
        className={cn(
          "gb__white__btn relative flex aspect-square flex-shrink-0 items-center justify-center rounded-[4px] bg-white/[6%] duration-300 before:!absolute before:!rounded-[4px] hover:bg-white/[12%]",
          iconSizeContainerMap[option],
        )}
      >
        <div
          className={cn(
            "relative aspect-square flex-shrink-0",
            iconSizeMap[option],
          )}
        >
          <Image
            src={`/icons/social/website.svg`}
            alt={`Website Social Icon`}
            fill
            quality={50}
            loading="lazy"
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default CustomizedSocialSettings;
