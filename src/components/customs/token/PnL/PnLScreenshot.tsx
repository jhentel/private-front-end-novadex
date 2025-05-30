"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React from "react";
// ######## Components 🧩 ########
import Image from "next/image";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PopoverClose } from "@radix-ui/react-popover";
import PnLTrigger from "@/components/customs/token/PnL/PnLTrigger";
import PnLContent from "@/components/customs/token/PnL/PnLContent";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import { Wallet } from "@/apis/rest/wallet-manager";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { getIsStrippedHoldingPreviewData } from "@/utils/getIsStrippedHoldingPreviewData";

const PnLScreenshot = ({
  profitAndLoss,
  profitAndLossPercentage,
  invested,
  sold,
  handleReload,
  isLoading,
  isWithDialog,
  trigger,
  solPrice,
  wallets,
  setWallets,
  title,
  image,
  type,
  remaining,
  profitAndLossUsdRaw,
  invevtedDRaw,
  remainingDRaw,
  soldDRaw,
  countdown,
}: {
  invevtedDRaw?: string | number;
  remainingDRaw?: string | number;
  soldDRaw?: string | number;
  profitAndLoss: string | number;
  profitAndLossPercentage: string | number;
  invested: string | number;
  sold: string | number;
  handleReload?: (e: React.MouseEvent) => void;
  isLoading?: boolean;
  isWithDialog?: boolean;
  trigger?: React.ReactNode;
  solPrice: number;
  wallets?: Wallet[];
  setWallets?: (wallets: Wallet[]) => void;
  title: string;
  sheetsTriggerClassname?: string;
  image?: string;
  type?: string;
  remaining: string | number;
  profitAndLossUsdRaw?: string | number;
  countdown?: number;
}) => {
  return (
    <>
      {isWithDialog ? (
        <Dialog>
          <DialogTrigger
            asChild
            className="h-full w-full flex-grow cursor-pointer max-md:hidden"
          >
            <div className="relative w-fit">
              {!!trigger ? (
                trigger
              ) : (
                <PnLTrigger
                  profitAndLoss={
                    getIsStrippedHoldingPreviewData(invested, remaining)
                      ? "-"
                      : profitAndLoss
                  }
                  profitAndLossPercentage={
                    getIsStrippedHoldingPreviewData(invested, remaining)
                      ? "-"
                      : profitAndLossPercentage
                  }
                  handleReload={handleReload}
                  isLoading={isLoading}
                  countdown={countdown}
                />
              )}
            </div>
          </DialogTrigger>
          <DialogContent
            showCloseButton={false}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="flex w-full max-w-xs flex-col gap-y-0 rounded-[8px] border border-border bg-card p-0 shadow-[0_0_20px_0_#000000] md:max-w-screen-sm lg:max-w-screen-md"
          >
            <DialogHeader className="hidden">
              <DialogTitle>PnL</DialogTitle>
            </DialogHeader>
            <PnLContent
              soldDRaw={soldDRaw}
              investedDRaw={invevtedDRaw}
              remainingDRaw={remainingDRaw}
              profitAndLossUsdRaw={profitAndLossUsdRaw}
              title={title}
              wallets={wallets}
              setWallets={setWallets}
              solPrice={solPrice}
              scrollable={true}
              profitAndLoss={profitAndLoss}
              profitAndLossPercentage={profitAndLossPercentage}
              invested={invested}
              sold={sold}
              image={image}
              type={type}
              remaining={remaining}
              closeElement={
                <DialogClose className="flex size-6 cursor-pointer items-center justify-center text-fontColorSecondary">
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
      ) : (
        <Popover>
          <PopoverTrigger
            asChild
            className="h-full w-full cursor-pointer max-md:hidden"
          >
            <div className="relative w-fit">
              {!!trigger ? (
                trigger
              ) : (
                <PnLTrigger
                  profitAndLoss={
                    getIsStrippedHoldingPreviewData(invested, remaining)
                      ? "-"
                      : profitAndLoss
                  }
                  profitAndLossPercentage={
                    getIsStrippedHoldingPreviewData(invested, remaining)
                      ? "-"
                      : profitAndLossPercentage
                  }
                  handleReload={handleReload}
                  isLoading={isLoading}
                  countdown={countdown}
                />
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            align="center"
            sideOffset={6}
            className="relative z-[1000] flex w-full flex-col rounded-[8px] border-2 border-border bg-card p-0 shadow-[0_0_20px_0_#000000] md:max-w-screen-md lg:max-w-screen-lg xl:w-[816px]"
          >
            <PnLContent
              soldDRaw={soldDRaw}
              investedDRaw={invevtedDRaw}
              remainingDRaw={remainingDRaw}
              profitAndLossUsdRaw={profitAndLossUsdRaw}
              title={title}
              wallets={wallets}
              setWallets={setWallets}
              solPrice={solPrice}
              profitAndLoss={profitAndLoss}
              scrollable={true}
              profitAndLossPercentage={profitAndLossPercentage}
              invested={invested}
              sold={sold}
              image={image}
              type={type}
              remaining={remaining}
              closeElement={
                <PopoverClose className="flex h-6 w-6 cursor-pointer items-center justify-center text-fontColorSecondary">
                  <div
                    className="relative aspect-square h-6 w-6 flex-shrink-0"
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
                </PopoverClose>
              }
            />
          </PopoverContent>
        </Popover>
      )}
      <Drawer>
        <DrawerTrigger
          asChild
          className="flex h-full w-full cursor-pointer md:hidden md:flex-grow"
        >
          <div className="relative z-10 w-fit">
            {!!trigger ? (
              trigger
            ) : (
              <PnLTrigger
                profitAndLoss={
                  getIsStrippedHoldingPreviewData(invested, remaining)
                    ? "-"
                    : profitAndLoss
                }
                profitAndLossPercentage={
                  getIsStrippedHoldingPreviewData(invested, remaining)
                    ? "-"
                    : profitAndLossPercentage
                }
                handleReload={handleReload}
                isLoading={isLoading}
                countdown={countdown}
              />
            )}
          </div>
        </DrawerTrigger>
        <DrawerContent
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="flex w-full flex-col gap-y-0 bg-card p-0 shadow-[0_0_20px_0_#000000]"
        >
          <DialogHeader className="hidden">
            <DialogTitle>PnL</DialogTitle>
          </DialogHeader>
          <PnLContent
            soldDRaw={soldDRaw}
            investedDRaw={invevtedDRaw}
            remainingDRaw={remainingDRaw}
            profitAndLossUsdRaw={profitAndLossUsdRaw}
            title={title}
            wallets={wallets}
            setWallets={setWallets}
            solPrice={solPrice}
            scrollable={true}
            profitAndLoss={profitAndLoss}
            profitAndLossPercentage={profitAndLossPercentage}
            invested={invested}
            sold={sold}
            image={image}
            type={type}
            remaining={remaining}
            closeElement={
              <DrawerClose className="flex size-6 cursor-pointer items-center justify-center text-fontColorSecondary">
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
    </>
  );
};

export default React.memo(PnLScreenshot);
