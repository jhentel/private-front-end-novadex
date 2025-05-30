"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import Image from "next/image";

import { cn } from "@/libraries/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-0 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-secondary data-[state=unchecked]:bg-secondary",
      className,
    )}
    {...props}
    ref={ref}
  >
    <div className="absolute left-0 top-0 z-10 h-full w-full rounded-full bg-white/[8%] duration-300"></div>
    <div className="absolute left-0 top-0 z-20 h-full w-full rounded-full bg-white/[2%]"></div>
    <div className="absolute left-0 top-0 z-30 h-full w-full rounded-full bg-gradient-to-b from-black/0 to-black opacity-20"></div>

    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none relative z-30 flex h-[14px] w-[14px] items-center justify-center rounded-full shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-[18px] data-[state=unchecked]:translate-x-1 data-[state=unchecked]:mix-blend-luminosity",
      )}
    >
      <Image src="/icons/switch.png" alt="Switch" fill quality={100} />
    </SwitchPrimitives.Thumb>
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
