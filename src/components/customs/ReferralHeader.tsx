"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState } from "react";
import { useUserWalletStore } from "@/stores/wallet/use-user-wallet.store";
import { useStoredWalletStore } from "@/stores/dex-setting/use-stored-wallet.store";
// ######## Components 🧩 ########
import Image from "next/image";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import BaseButton from "./buttons/BaseButton";
import { truncateAddress } from "@/utils/truncateAddress";

export default function ReferralHeader() {
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);

  const [localSelectedWalletList, setLocalSelectedWalletList] = useState<
    string[]
  >([]);

  const toggleSelectWallet = (wallet: string) => {
    const isSelected = localSelectedWalletList.includes(wallet);

    setLocalSelectedWalletList(
      isSelected
        ? localSelectedWalletList.length > 1
          ? localSelectedWalletList.filter((w) => w !== wallet)
          : localSelectedWalletList
        : [...localSelectedWalletList, wallet],
    );
  };

  return (
    <div className="flex items-center gap-x-2">
      {/* Desktop */}
      <Popover>
        <PopoverTrigger asChild>
          <BaseButton
            variant="gray"
            size="short"
            className="hidden size-10 items-center justify-center p-0 md:flex"
          >
            <div className="relative aspect-square h-5 w-5 flex-shrink-0">
              <Image
                src="/icons/white-info-tooltip.png"
                alt="White Info Tooltip Icon"
                fill
                quality={50}
                className="object-contain"
              />
            </div>
          </BaseButton>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="hidden w-[240px] rounded-[8px] border border-border bg-card p-0 shadow-[0_10px_20px_0_#000000] md:block"
        >
          <p className="px-4 py-3 text-sm text-fontColorPrimary">
            {`
              The Referral Tracker tracks earnings, referral volume by tier, 
              and daily stats like new referees and payment status. 
              Manage referrals effortlessly.
            `}
          </p>
        </PopoverContent>
      </Popover>
      {/* Mobile */}
      <Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
        <DrawerTrigger asChild>
          <div className="gb__white__btn relative flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-[8px] bg-white/[8%] p-2 duration-300 hover:bg-white/[16%] md:hidden">
            <div className="relative aspect-square h-5 w-5 flex-shrink-0">
              <Image
                src="/icons/white-info-tooltip.png"
                alt="White Info Tooltip Icon"
                fill
                quality={50}
                className="object-contain"
              />
            </div>
          </div>
        </DrawerTrigger>
        <DrawerContent className="rounded-t-[8px] bg-card">
          <DrawerHeader className="flex h-[56px] flex-row items-center justify-between border-b border-border p-4">
            <DrawerTitle className="text-lg">Info</DrawerTitle>
            <button
              title="Close"
              onClick={() => setOpenDrawer((prev) => !prev)}
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
          </DrawerHeader>
          <p className="p-4 text-fontColorSecondary">
            {`
              The Referral Tracker tracks earnings, referral volume by tier, 
              and daily stats like new referees and payment status. 
              Manage referrals effortlessly.
            `}
          </p>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
