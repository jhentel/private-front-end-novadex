"use client";

// ######## Libraries 📦 & Hooks 🪝 ########.
import React, { useState, useMemo } from "react";
import { useQuickAmountStore } from "@/stores/dex-setting/use-quick-amount.store";
import { useDebouncedQuickBuy } from "@/hooks/use-debounced-quickbuy";
// ######## Components 🧩 ########
import Image from "next/image";
import BaseButton from "@/components/customs/buttons/BaseButton";
import WalletTrackerTable from "@/components/customs/tables/footer/WalletTrackerTable";
import QuickAmountInput from "@/components/customs/QuickAmountInput";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PopoverClose } from "@radix-ui/react-popover";
import { PopupWindow } from "@/components/customs/PopupWindow";
import WalletManagerFooterForm from "@/components/customs/forms/footer/WalletManagerFooterForm";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import WalletTrackerFilter from "@/components/customs/WalletTrackerFilter";
import { usePopupStore, WindowName } from "@/stores/use-popup-state";
import { useWalletTrackerPaused } from "@/stores/footer/use-wallet-tracker-paused";

const ADD_WALLET_CONTENT_CONTAINER_BASE_CLASS =
  "border-2 border-border bg-card p-0 shadow-[0_0_20px_0_#000000] max-w-[95vw] sm:w-[518px] flex flex-col h-[496px] md:h-[480px] z-[1000]";
const WalletTrackerPopup = React.memo(function WalletTrackerPopup() {
  const { debouncedUpdateQuickBuyAmount } = useDebouncedQuickBuy();

  const cosmoQuickBuyAmount = useQuickAmountStore(
    (state) => state.cosmoQuickBuyAmount,
  );
  const setCosmoQuickBuyAmount = useQuickAmountStore(
    (state) => state.setCosmoQuickBuyAmount,
  );

  const [openEditPopover, setOpenEditPopover] = useState<boolean>(false);

  const [_, setOpenEditDialog] = useState<boolean>(false);
  const handleCloseEditForm = () => {
    setOpenEditPopover(false);
    setOpenEditDialog(false);
  };

  const memoizedWalletTrackerTable = useMemo(
    () => <WalletTrackerTable variant="pop-out" />,
    [],
  );

  const { popups } = usePopupStore();
  const windowName: WindowName = "wallet_tracker";
  const walletTracker = popups.find((value) => value.name === windowName)!;
  const { size, mode } = walletTracker;
  const popUpResponsive = size.width < 600 && mode !== "footer";
  const popupState = popups.find((item) => item.name === "wallet_tracker");
  const isWalletTrackerPaused = useWalletTrackerPaused(
    (state) => state.isWalletTrackerHovered,
  );
  return (
    <PopupWindow
      title="Wallet Tracker"
      windowName="wallet_tracker"
      isPaused={isWalletTrackerPaused}
      minWidth={430}
      maxWidth={0.6}
      maxSnapWidth={0.4}
      headerRightContent={
        !popUpResponsive && (
          <>
            <QuickAmountInput
              width="160px"
              // value={cosmoQuickBuyAmount}
              // onChange={(val) => {
              //   if (Number(val) >= 0.00001) {
              //     setCosmoQuickBuyAmount(val);
              //     debouncedUpdateQuickBuyAmount({
              //       amount: val,
              //       type: "cosmo",
              //     });
              //   }
              // }}
            />
            <Popover open={openEditPopover} onOpenChange={setOpenEditPopover}>
              <PopoverTrigger asChild>
                <BaseButton variant="gray" className="h-[32px]">
                  <div className="relative z-30 aspect-square h-4 w-4 flex-shrink-0 text-fontColorSecondary">
                    <Image
                      src="/icons/footer/wallet-manager.png"
                      alt="Wallet Manager Icon"
                      fill
                      quality={100}
                      className="object-contain"
                    />
                  </div>
                </BaseButton>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                sideOffset={6}
                className={cn(ADD_WALLET_CONTENT_CONTAINER_BASE_CLASS)}
              >
                <WalletManagerFooterForm
                  handleClose={handleCloseEditForm}
                  closeComponent={
                    <PopoverClose className="ml-auto hidden cursor-pointer text-fontColorSecondary md:inline-block">
                      <div className="relative aspect-square h-6 w-6 flex-shrink-0 duration-300 hover:opacity-70">
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
            <WalletTrackerFilter />
          </>
        )
      }
    >
      {popUpResponsive && (
        <div className="flex w-full items-center gap-2 overflow-hidden p-2">
          <QuickAmountInput
            width="160px"
            // value={cosmoQuickBuyAmount}
            // onChange={(val) => {
            //   if (Number(val) >= 0.00001) {
            //     setCosmoQuickBuyAmount(val);
            //     debouncedUpdateQuickBuyAmount({
            //       amount: val,
            //       type: "cosmo",
            //     });
            //   }
            // }}
          />
          <Popover open={openEditPopover} onOpenChange={setOpenEditPopover}>
            <PopoverTrigger asChild>
              <BaseButton variant="gray" className="h-[32px]">
                <div className="relative z-30 aspect-square h-4 w-4 flex-shrink-0 text-fontColorSecondary">
                  <Image
                    src="/icons/footer/wallet-manager.png"
                    alt="Wallet Manager Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
              </BaseButton>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              sideOffset={6}
              className={cn(ADD_WALLET_CONTENT_CONTAINER_BASE_CLASS)}
            >
              <WalletManagerFooterForm
                handleClose={handleCloseEditForm}
                closeComponent={
                  <PopoverClose className="ml-auto hidden cursor-pointer text-fontColorSecondary md:inline-block">
                    <div className="relative aspect-square h-6 w-6 flex-shrink-0 duration-300 hover:opacity-70">
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
          <WalletTrackerFilter />
        </div>
      )}

      <div
        className={cn(
          "flex h-full w-full flex-col space-y-2 overflow-hidden",
          popupState?.isOpen &&
            popupState.snappedSide === "none" &&
            popUpResponsive &&
            "h-[90%]",
        )}
      >
        <div className="relative min-h-0 flex-1 overflow-hidden">
          {cosmoQuickBuyAmount}
          <div className="absolute inset-0 overflow-auto">
            {memoizedWalletTrackerTable}
          </div>
        </div>
      </div>
    </PopupWindow>
  );
});

WalletTrackerPopup.displayName = "WalletTrackerPopup";

export default WalletTrackerPopup;
