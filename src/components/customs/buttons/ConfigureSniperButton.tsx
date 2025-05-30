// ####### Reusable Buttons 🔄 #######

import BaseButton from "@/components/customs/buttons/BaseButton";
import { cn } from "@/libraries/utils";
import Image from "next/image";

// Configure Sniper 🎯
export const ConfigureSniperButton = ({
  isFullscreen = false,
}: {
  isFullscreen?: boolean;
}) => {
  return (
    <>
      <BaseButton
        variant="gray"
        className={cn(
          "flex-grow pl-2 pr-3 max-md:w-full",
          isFullscreen ? "h-10 w-full" : "h-8",
        )}
        prefixIcon={
          <div
            className={cn(
              "relative aspect-square flex-shrink-0",
              isFullscreen ? "size-5" : "size-4",
            )}
          >
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
            "inline-block whitespace-nowrap text-fontColorPrimary",
            isFullscreen
              ? "font-geistSemiBold text-base"
              : "font-geistSemiBold text-sm",
          )}
        >
          Configure Sniper
        </span>
      </BaseButton>
    </>
  );
};
ConfigureSniperButton.displayName = "ConfigureSniperButton";
