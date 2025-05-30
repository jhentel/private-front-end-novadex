"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/libraries/utils";
import Image from "next/image";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    customValue?: number;
  }
>(({ className, customValue, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className,
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-white/[6%]">
      <SliderPrimitive.Range className="absolute h-full bg-primary dark:bg-neutral-50"></SliderPrimitive.Range>
    </SliderPrimitive.Track>

    <SliderPrimitive.Thumb className="relative block h-5 w-5">
      <div className="absolute left-1/2 top-1/2 block h-10 w-10 -translate-x-1/2 -translate-y-1/2">
        <Image
          src="/icons/slider-handler.png"
          alt="Slider Handler Icon"
          fill
          quality={100}
          className="object-contain"
        />
      </div>

      <div className="pointer-events-none absolute -bottom-6 left-1/2 flex h-[18px] w-auto -translate-x-1/2 items-center justify-center rounded-[4px] bg-white/[16%] px-2">
        <span className="block font-geistSemiBold text-xs text-fontColorPrimary">
          {customValue}%
        </span>
      </div>
    </SliderPrimitive.Thumb>
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
