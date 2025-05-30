"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useEffect, useState } from "react";
// ######## Components 🧩 ########
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import BaseButton from "../buttons/BaseButton";
import Image from "next/image";
import { useUserWalletStore } from "@/stores/wallet/use-user-wallet.store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/libraries/utils";
import { Wallet } from "@/apis/rest/wallet-manager";
import { DepositWalletContainer } from "../DepositWallet";

export default function DepositPopoverModal({
  customTriggerComponent,
  currentWallet,
}: {
  currentWallet?: Wallet;
  customTriggerComponent?: React.ReactNode;
}) {
  const { userWalletFullList } = useUserWalletStore();
  const [openPopover, setOpenPopover] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const [selectedWallet, setSelectedWallet] = useState<
    typeof userWalletFullList
  >([]);

  useEffect(() => {
    if (userWalletFullList.length > 0 && openPopover) {
      const defaultWallet =
        currentWallet ||
        userWalletFullList.find((wallet) => wallet.selected) ||
        userWalletFullList[0];
      if (selectedWallet.length === 0) {
        setSelectedWallet([defaultWallet]);
      }
    }
  }, [userWalletFullList, openPopover, currentWallet]);

  return (
    <>
      {/* Desktop Popover */}
      <Popover open={openPopover} onOpenChange={setOpenPopover}>
        <PopoverTrigger asChild>
          {customTriggerComponent ? (
            customTriggerComponent
          ) : (
            <BaseButton
              variant="gray"
              className="hidden h-10 xl:hidden"
              prefixIcon={
                <div className="relative aspect-square size-[20px] flex-shrink-0">
                  <Image
                    src="/icons/deposit.svg"
                    alt="Import Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
              }
            >
              <span className="inline-block font-geistSemiBold text-base text-fontColorPrimary">
                Deposit
              </span>
            </BaseButton>
          )}
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={6}
          className="-mr-5 hidden w-[360px] flex-col rounded-[8px] border border-border bg-card p-0 shadow-[0_0_20px_0_#000000] xl:flex"
        >
          <div className="flex h-[52px] w-full items-center justify-between border-b border-border p-4">
            <h4 className="text-nowrap font-geistSemiBold text-lg text-fontColorPrimary">
              Deposit
            </h4>
            <button
              title="Close"
              onClick={() => setOpenPopover((prev) => !prev)}
              className="relative aspect-square h-6 w-6 flex-shrink-0"
            >
              <Image
                src="/icons/close.png"
                alt="Close Icon"
                fill
                quality={100}
                className="object-contain"
              />
            </button>
          </div>

          <DepositWalletContainer
            currentWallet={currentWallet}
            isHeader={false}
          />
        </PopoverContent>
      </Popover>

      {/* Mobile Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogTrigger asChild>
          <BaseButton variant="gray" className="size-10 xl:hidden">
            <div className="relative aspect-square size-[20px] flex-shrink-0">
              <Image
                src="/icons/deposit.svg"
                alt="Import Icon"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
          </BaseButton>
        </DialogTrigger>
        <DialogContent className="flex h-auto w-full max-w-[382px] flex-col gap-y-0 rounded-[8px] border border-border bg-card xl:hidden xl:max-w-[480px]">
          <DialogHeader className="flex h-[56px] flex-row items-center border-b border-border p-4">
            <DialogTitle className="text-lg">Deposit</DialogTitle>
          </DialogHeader>
          <DepositWalletContainer
            currentWallet={currentWallet}
            isHeader={false}
            onClose={() => setOpenDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
