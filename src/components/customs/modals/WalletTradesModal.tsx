"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import Image from "next/image";
import { memo, useEffect, useState } from "react"; // Add this hook
// ######## Components 🧩 ########
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import AllRealizedPLChart from "../charts/AllRealizedPLChart";
// ######## Utils & Helpers 🤝 ########
import WalletTradesTabs from "@/components/customs/wallet-trade/WalletTradeTabs";
import { useTradesWalletModalStore } from "@/stores/token/use-trades-wallet-modal.store";
import { useWindowSizeStore } from "@/stores/use-window-size.store";
import { DialogClose } from "@radix-ui/react-dialog";
import Link from "next/link";
import WalletTradesInfo from "../WalletTradesInfo";

export default memo(function WalletTradesModal({
  onOpenChange,
}: {
  onOpenChange?: (state: boolean) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const walletAddress = useTradesWalletModalStore((state) => state.wallet);
  const cleanUp = useTradesWalletModalStore((state) => state.cleanup);
  const setWalletAddress = useTradesWalletModalStore(
    (state) => state.setWallet,
  );

  const width = useWindowSizeStore((state) => state.width);

  const handleEdit = () => {
    /* console.log("Edit wallet") */;
  };
  // console.log("Wallet Address🎯🎯🎯: ", walletAddress);

  useEffect(() => {
    if (walletAddress) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [walletAddress]);

  // useEffect(() => {
  //   if (walletAddress.length > 0) {
  //     setOpen(true);
  //   } else {
  //     setOpen(false);
  //   }
  // }, [walletAddress]);

  const handleOpenChange = (isOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(isOpen);
    }
    
    setIsOpen(isOpen);
    
    if (!isOpen) {
      setWalletAddress("");
      cleanUp();
    }
  };

  const WalletTradesContent = () => {
    // Add check for walletAddress
    if (!walletAddress) {
      return <div>No wallet address provided</div>;
    }

    return (
      <div className="flex w-full flex-col">
        <div className="flex w-full flex-col gap-4 p-4 pb-0">
          {/* Header */}
          <WalletTradesInfo />

          {/* Graph */}
          <div className="flex w-full flex-col items-center justify-center rounded-t-[8px] border border-border border-b-transparent md:h-[177px] md:flex-row">
            <AllRealizedPLChart />
          </div>
        </div>

        {/* Table Tabs */}
        {walletAddress && <WalletTradesTabs />}
      </div>
    );
  };

  if (width && width > 768) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent
          showCloseButton={false}
          overlayClassname="z-[300]"
          className="z-[300] flex min-h-[390px] w-full max-w-[900px] flex-col gap-y-0 space-y-0"
        >
          <DialogHeader className="flex h-fit min-h-0 flex-row items-center justify-between border-b border-border p-4">
            <DialogTitle>Wallet Trades</DialogTitle>
            <div className="flex items-center gap-2">
              <Link
                href={`/wallet-trade/${walletAddress}`}
                onClick={() => {
                  handleOpenChange(false);
                  cleanUp();
                }}
                className="relative aspect-square h-6 w-6 flex-shrink-0"
              >
                <Image
                  src="/icons/footer/fullscreen.png"
                  alt="Fullscreen Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </Link>
              <DialogClose asChild>
                <button className="relative aspect-square h-6 w-6 flex-shrink-0">
                  <Image
                    src="/icons/close.png"
                    alt="Close Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </button>
              </DialogClose>
            </div>
          </DialogHeader>
          {/* {true ? (
            <div className="flex size-full flex-1 items-center justify-center">
              <ComingSoon />
            </div>
          ) : ( */}
          <WalletTradesContent />
          {/* )} */}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={handleOpenChange}>
      <DrawerContent className="flex h-[95vh] flex-col">
        <DrawerHeader className="flex h-[58px] flex-row items-center justify-between border-b border-border p-4">
          <DrawerTitle>Wallet Trades</DrawerTitle>
          <div className="flex items-center gap-2">
            <Link
              href={`/wallet-trade/${walletAddress}`}
              className="relative aspect-square h-6 w-6 flex-shrink-0"
              onClick={() => {
                handleOpenChange(false);
                cleanUp();
              }}
            >
              <Image
                src="/icons/footer/fullscreen.png"
                alt="Fullscreen Icon"
                fill
                quality={100}
                className="object-contain"
              />
            </Link>
            <button
              onClick={() => {
                handleOpenChange(false);
                cleanUp();
              }}
              className="relative aspect-square h-6 w-6 flex-shrink-0 duration-300 hover:opacity-70"
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
        </DrawerHeader>
        <div className="flex-1 overflow-auto">
          <WalletTradesContent />
          {/* {true ? <ComingSoon /> : <WalletTradesContent />} */}
        </div>
      </DrawerContent>
    </Drawer>
  );
});
