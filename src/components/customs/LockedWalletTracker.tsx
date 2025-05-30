"use client";

import { ResizableProps } from "re-resizable";
import { useState, useMemo } from "react";
import Image from "next/image";
import Separator from "@/components/customs/Separator";
import { useQuickAmountStore } from "@/stores/dex-setting/use-quick-amount.store";
import { useWalletTrackerLockedStore } from "@/stores/footer/use-wallet-tracker-locked.store";
import WalletTrackerTable from "./tables/footer/WalletTrackerTable";
import { useDebouncedQuickBuy } from "@/hooks/use-debounced-quickbuy";
import QuickAmountInput from "./QuickAmountInput";
import PresetSelectionButtons from "./PresetSelectionButtons";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/libraries/utils";
import { PopoverClose } from "@radix-ui/react-popover";
import { X } from "lucide-react";
import AddTrackedWallet from "./AddTrackedWallet";
import BaseButton from "./buttons/BaseButton";
import WalletManagerFooterForm from "./forms/footer/WalletManagerFooterForm";
import { ImportWalletContent } from "./modals/contents/footer/WalletTrackerImport";
import { DraggableWindow } from "./DraggableWindow";
import WalletTrackerFilter from "./WalletTrackerFilter";

interface LockedWalletTrackerProps {
  disableSnap?: boolean;
  scrollable?: boolean;
}

export function LockedWalletTracker({
  disableSnap = false,
  scrollable = false,
}: LockedWalletTrackerProps) {
  const { debouncedUpdateQuickBuyAmount } = useDebouncedQuickBuy();

  const {
    setIsOpenWalletTrackerModal,
    setWalletTrackerModalMode,
    walletTrackerModalMode,
    isOpenWalletTrackerModal,
    walletTrackerSnappedState,
    setWalletTrackerSnappedState,
    walletTrackerSize,
    setWalletTrackerSize,
    isWalletTrackerInitialized,
    setIsWalletTrackerInitialized,
    setWalletTrackerPosition,
    walletTrackerPosition,
    previousState,
    setPreviousState,
    hasRestoredPreviousState,
    setHasRestoredPreviousState,
  } = useWalletTrackerLockedStore();
  const cosmoQuickBuyAmount = useQuickAmountStore(
    (state) => state.cosmoQuickBuyAmount,
  );
  const setCosmoQuickBuyAmount = useQuickAmountStore(
    (state) => state.setCosmoQuickBuyAmount,
  );

  const [openEditPopover, setOpenEditPopover] = useState<boolean>(false);
  const ADD_WALLET_CONTENT_CONTAINER_BASE_CLASS =
    "border-2 border-border bg-card p-0 shadow-[0_0_20px_0_#000000] max-w-[95vw] sm:w-[518px] flex flex-col h-[496px] md:h-[480px] z-[1000]";
  const [_, setOpenEditDialog] = useState<boolean>(false);
  const handleCloseEditForm = () => {
    setOpenEditPopover(false);
    setOpenEditDialog(false);
  };
  const IMPORT_WALLET_CONTENT_CONTAINER_BASE_CLASS =
    "border-2 border-border bg-card p-0 shadow-[0_0_20px_0_#000000] max-w-[95vw] sm:w-[320px] z-[1000]";

  const memoizedWalletTrackerTable = useMemo(
    () => <WalletTrackerTable variant="pop-out" />,
    [],
  );

  return (
    <DraggableWindow
      title="Wallet Tracker"
      isOpen={isOpenWalletTrackerModal}
      setIsOpen={setIsOpenWalletTrackerModal}
      size={walletTrackerSize}
      setSize={setWalletTrackerSize}
      snappedState={walletTrackerSnappedState}
      setSnappedState={setWalletTrackerSnappedState}
      modalMode={walletTrackerModalMode}
      setModalMode={setWalletTrackerModalMode}
      disableSnap={disableSnap}
      isInitialized={isWalletTrackerInitialized}
      setIsInitialized={setIsWalletTrackerInitialized}
      position={walletTrackerPosition}
      setPosition={setWalletTrackerPosition}
      scrollable={scrollable}
      maxWidth={0.6}
      setPreviousState={setPreviousState}
      previousState={previousState}
      hasRestoredPreviousState={hasRestoredPreviousState}
      setHasRestoredPreviousState={setHasRestoredPreviousState}
      minWidth={560}
      headerRightContent={
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
        </>
      }
    >
      <div className="flex h-full w-full flex-col space-y-2 overflow-hidden">
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <div className="absolute inset-0 overflow-auto">
            {memoizedWalletTrackerTable}
          </div>
        </div>
      </div>
    </DraggableWindow>
  );
}
