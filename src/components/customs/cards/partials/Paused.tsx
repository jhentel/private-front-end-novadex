import Image, { ImageProps } from "next/image";
import Separator, { SeparatorProps } from "../../Separator";
import { cn } from "@/libraries/utils";
import { HTMLAttributes } from "react";

export const Paused = ({
  separatorProps,
  textProps,
  imageProps,
  imageContainerProps,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  separatorProps?: SeparatorProps;
  textProps?: HTMLAttributes<HTMLSpanElement>;
  imageProps?: HTMLAttributes<HTMLDivElement>;
  imageContainerProps?: HTMLAttributes<HTMLDivElement>;
}) => {
  return (
    <div className="flex items-center" {...props}>
      <Separator
        color="#202037"
        orientation="vertical"
        unit="fixed"
        fixedHeight={24}
        {...separatorProps}
      />

      <div
        {...imageContainerProps}
        className={cn(
          "flex h-[24px] items-center gap-x-0.5 rounded-[4px] bg-success/20 px-1.5",
          imageContainerProps?.className,
        )}
      >
        <div
          className="relative aspect-square h-5 w-5 flex-shrink-0"
          {...imageProps}
        >
          <Image
            src="/icons/paused.png"
            alt="Pause Icon"
            fill
            quality={100}
            className="object-contain"
          />
        </div>
        <span
          className={cn(
            "hidden font-geistRegular text-sm text-success min-[1650px]:inline-block",
          )}
          {...textProps}
        >
          Paused
        </span>
      </div>
    </div>
  );
};
