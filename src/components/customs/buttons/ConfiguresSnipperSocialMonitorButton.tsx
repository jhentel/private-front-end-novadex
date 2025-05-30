import React from "react";
import Image from "next/image";
import BaseButton from "@/components/customs/buttons/BaseButton";

import { cn } from "@/libraries/utils";

const ConfigureSnipperSocialMonitorButton = () => {
  return (
    <>
      <BaseButton
        variant="gray"
        className={cn(
          "h-8 w-full flex-grow pl-2 pr-3",
          // isFullscreen ? "h-10 w-full" : "h-8",
        )}
        prefixIcon={
          <div className={cn("relative aspect-square size-4 flex-shrink-0")}>
            <Image
              src="/icons/footer/configure-sniper.svg"
              alt="Configure Sniper Icon"
              fill
              quality={100}
              className="object-contain duration-300"
            />
          </div>
        }
      >
        <span
          className={cn(
            "inline-block whitespace-nowrap font-geistSemiBold text-sm text-fontColorPrimary",
          )}
        >
          Configure Sniper
        </span>
      </BaseButton>
    </>
  );
};


export default ConfigureSnipperSocialMonitorButton;