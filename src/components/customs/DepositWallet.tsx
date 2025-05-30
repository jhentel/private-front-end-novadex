"use client";
import Image from "next/image";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import BaseButton from "./buttons/BaseButton";
import { memo, useEffect, useState } from "react";
import WalletSelectionButton from "./WalletSelectionButton";
import { useUserWalletStore } from "@/stores/wallet/use-user-wallet.store";
import { Label } from "../ui/label";
import Link from "next/link";
import { ExternalLinkIcon, XIcon } from "lucide-react";
import Copy from "./Copy";
import { QRCode } from "react-qrcode-logo";
import { Wallet } from "@/apis/rest/wallet-manager";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";

const DepositWallet = ({ isMobile }: { isMobile?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  if (isMobile) {
    return (
      <Drawer onOpenChange={setIsOpen} open={isOpen}>
        <DrawerTrigger asChild>
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
        </DrawerTrigger>
        <DrawerContent className="flex h-auto w-full flex-col gap-y-0 bg-card xl:hidden xl:max-w-[480px]">
          <DrawerHeader className="flex h-[56px] flex-row items-center justify-between border-b border-border p-4">
            <DrawerTitle className="text-lg">Deposit</DrawerTitle>
            <DrawerClose asChild>
              <button className="flex h-6 w-6 cursor-pointer items-center justify-center bg-transparent text-transparent">
                <div
                  className="relative aspect-square h-6 w-6 flex-shrink-0"
                  aria-label="Close"
                  title="Close"
                >
                  <Image
                    src="/icons/close.png"
                    alt="Close Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
              </button>
            </DrawerClose>
          </DrawerHeader>
          <DepositWalletContainer
            isHeader={false}
            onClose={() => setIsOpen(false)}
          />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover onOpenChange={setIsOpen} open={isOpen}>
      <PopoverTrigger asChild>
        <BaseButton
          variant="gray"
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
          size="long"
          className="relative h-[40px]"
        >
          <h2>Deposit</h2>
        </BaseButton>
      </PopoverTrigger>

      <PopoverContent
        sideOffset={5}
        align="start"
        className="z-50 w-[400px] bg-background px-0 pb-0 pt-[14px]"
      >
        <DepositWalletContainer onClose={() => setIsOpen(false)} />
      </PopoverContent>
    </Popover>
  );
};

export const DepositWalletContainer = ({
  onClose,
  isHeader = true,
  currentWallet,
}: {
  onClose?: () => void;
  isHeader?: boolean;
  currentWallet?: Wallet;
}) => {
  const { userWalletFullList } = useUserWalletStore();
  const [selectedWallet, setSelectedWallet] = useState<
    typeof userWalletFullList
  >([]);

  useEffect(() => {
    if (currentWallet) {
      setSelectedWallet([currentWallet]);
    }
  }, [currentWallet]);

  return (
    <div>
      {isHeader && (
        <div className="hidden items-center justify-between border-b border-border px-4 pb-[14px] xl:flex">
          <h2 className="text-semibold font-semibold">Deposit</h2>

          <button
            title="Close"
            onClick={onClose}
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
      )}

      <div className="px-4 pt-[14px]">
        <div className="flex flex-col gap-y-1">
          <Label className="text-fontColorSecondary">Wallet name</Label>
          <WalletSelectionButton
            value={selectedWallet}
            setValue={setSelectedWallet}
            // selectedWalletClass="bg-[#242436]"
            isMultipleSelect={false}
            showAllOption={false}
            maxWalletShow={10}
            isGlobal={false}
            // maxWalletShow={2}
            className="w-full"
            triggerClassName="h-10"
          />
        </div>

        <div className="relative my-4 flex items-center gap-x-4 rounded-lg border border-border px-3 py-2">
          <div className="shrink-0 overflow-hidden rounded bg-white">
            <QRCode
              value={`solana:${
                selectedWallet.length > 0
                  ? selectedWallet[0].address
                  : "No wallet selected"
              }`}
              size={120}
              logoWidth={30}
              logoImage="/icons/solana-filled.svg"
            />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm text-[#9191A4]">Deposit Address</h2>
            <h3 className="break-all text-sm text-[#FCFCFD]">
              {selectedWallet.length > 0
                ? selectedWallet[0].address
                : "No wallet selected"}
            </h3>
            <Copy
              variant="primary"
              className="absolute right-3 top-1"
              value={selectedWallet[0]?.address}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border p-4 text-white">
        <span className="text-sm text-[#9191A4]">Do you need help?</span>

        <Link
          href="/guide"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-[#DF74FF] no-underline"
        >
          <ExternalLinkIcon size={16} />
          <span>Read the guide</span>
        </Link>
      </div>
    </div>
  );
};

export default memo(DepositWallet);
