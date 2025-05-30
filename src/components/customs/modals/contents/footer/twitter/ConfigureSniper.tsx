import ConfigureSniperForm from "@/components/customs/forms/footer/ConfigureSniperForm";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"; 
import { cn } from "@/libraries/utils";
import { useWindowSizeStore } from "@/stores/use-window-size.store";
import { PopoverClose } from "@radix-ui/react-popover";
import Image from "next/image";
import React from "react";

const CONFIGURE_SNIPER_POPOVER_CLASSNAME =
  "gb__white__popover z-[320] gap-y-0 flex w-[380px] xl:w-[360px] flex-col rounded-[8px] h-[404px] border border-border bg-card p-0 shadow-[0_0_20px_0_#000000] max-xl:h-[556px] max-h-[100vh] overflow-hidden z-[9999]";
// xl:translate-x-60

const ConfigureSniperContent = ({
  closeComponent,
}: {
  closeComponent: React.ReactNode;
}) => {
  return (
    <>
      <div className="flex h-[58px] w-full items-center justify-start border-b border-border p-4 xl:h-[56px]">
        <h4 className="text-nowrap font-geistSemiBold text-lg text-fontColorPrimary">
          Configure Sniper
        </h4>
        {closeComponent}
      </div>

      <ConfigureSniperForm />
    </>
  );
};

const ConfigureSniper = ({ trigger }: { trigger: React.ReactNode }) => {
    const width = useWindowSizeStore((state) => state.width);

  const isDesktop = width && width >= 1280;

  if (isDesktop) {
    return (
      <Popover>
        <PopoverTrigger asChild className="w-full">
          <div className="w-full">{trigger}</div>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          // sideOffset={-100}
          sideOffset={2}
          className={CONFIGURE_SNIPER_POPOVER_CLASSNAME}
        >
          <ConfigureSniperContent
            closeComponent={
              <PopoverClose asChild data-close-sniper className="ml-auto">
                <button className="relative aspect-square h-6 w-6 flex-shrink-0 duration-300 hover:opacity-70">
                  <Image
                    src="/icons/close.png"
                    alt="Close Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </button>
              </PopoverClose>
            }
          />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild className="w-full">
        <div>{trigger}</div>
      </DialogTrigger>
      <DialogContent
        className={cn(CONFIGURE_SNIPER_POPOVER_CLASSNAME, "max-w-[95vw]")}
      >
        <ConfigureSniperContent
          closeComponent={
            <DialogClose asChild data-close-sniper className="ml-auto">
              <button className="relative aspect-square h-6 w-6 flex-shrink-0 duration-300 hover:opacity-70">
                <Image
                  src="/icons/close.png"
                  alt="Close Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </button>
            </DialogClose>
          }
        />
      </DialogContent>
    </Dialog>
  );
};

export default ConfigureSniper;
