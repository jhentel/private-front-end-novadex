"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import Image from "next/image";
import { usePnLModalStore } from "@/stores/use-pnl-modal.store";
import PnLContentRaw from "../token/PnL/PnLContentRaw";
import PnLContent from "../token/PnL/PnLContent";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useWindowSizeStore } from "@/stores/use-window-size.store";

export default function DialogPnLWrapper() {
  const width = useWindowSizeStore((state) => state.width);

  const {
    isOpen,
    tokenData,
    finalPrice,
    remainingSol,
    remainingUsd,
    profitAndLoss,
    profitAndLossUsd,
    profitAndLossPercentage,
    invested,
    investedD,
    sold,
    soldD,
    closeModal,
  } = usePnLModalStore();

  // Don't render anything if modal shouldn't be shown or data is missing
  if (
    !isOpen ||
    !tokenData ||
    finalPrice === null ||
    remainingSol === null ||
    remainingUsd === null
  ) {
    return null;
  }

  /* console.log("remaining", remainingSol) */;

  if (width && width < 768) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && closeModal()}>
        <DrawerContent
          onClick={(e) => e.stopPropagation()}
          className="flex w-full flex-col gap-y-0 bg-card p-0 shadow-[0_0_20px_0_#000000] md:hidden"
        >
          <DrawerHeader className="sr-only">
            <DrawerTitle>PnL</DrawerTitle>
          </DrawerHeader>
          <PnLContent
            title={"$" + tokenData?.symbol}
            solPrice={Number(finalPrice)}
            scrollable={true}
            profitAndLoss={profitAndLoss || 0}
            profitAndLossUsdRaw={profitAndLossUsd || 0}
            profitAndLossPercentage={profitAndLossPercentage || 0}
            invested={invested || 0}
            investedDRaw={investedD || 0}
            sold={sold || 0}
            soldDRaw={soldD || 0}
            image={tokenData?.image}
            remaining={remainingSol}
            remainingDRaw={remainingUsd}
            closeElement={
              <DrawerClose
                className="flex size-6 cursor-pointer items-center justify-center text-fontColorSecondary"
                onClick={closeModal}
              >
                <div
                  className="relative aspect-square size-6 flex-shrink-0"
                  aria-label="Close"
                >
                  <Image
                    src="/icons/close.png"
                    alt="Close Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
              </DrawerClose>
            }
          />
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent
        showCloseButton={false}
        onClick={(e) => e.stopPropagation()}
        className="hidden w-full flex-col gap-y-0 rounded-[8px] border border-border bg-card p-0 shadow-[0_0_20px_0_#000000] md:flex md:max-w-screen-sm lg:max-w-screen-md"
      >
        <DialogHeader className="hidden">
          <DialogTitle>PnL</DialogTitle>
        </DialogHeader>
        <PnLContent
          title={"$" + tokenData?.symbol}
          solPrice={Number(finalPrice)}
          scrollable={true}
          profitAndLoss={profitAndLoss || 0}
          profitAndLossUsdRaw={profitAndLossUsd || 0}
          profitAndLossPercentage={profitAndLossPercentage || 0}
          invested={invested || 0}
          investedDRaw={investedD || 0}
          sold={sold || 0}
          soldDRaw={soldD || 0}
          image={tokenData?.image}
          remaining={remainingSol}
          remainingDRaw={remainingUsd}
          closeElement={
            <DialogClose
              className="flex size-6 cursor-pointer items-center justify-center text-fontColorSecondary"
              onClick={closeModal}
            >
              <div
                className="relative aspect-square size-6 flex-shrink-0"
                aria-label="Close"
              >
                <Image
                  src="/icons/close.png"
                  alt="Close Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </div>
            </DialogClose>
          }
        />
      </DialogContent>
    </Dialog>
  );
}
