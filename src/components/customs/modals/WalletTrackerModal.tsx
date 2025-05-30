"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useEffect, useState } from "react"; // Add this hook
// ######## Components 🧩 ########
import Image from "next/image";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { useTradesWalletModalStore } from "@/stores/token/use-trades-wallet-modal.store";
import BaseButton from "../buttons/BaseButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SelectEmoji from "../SelectEmoji";
import CustomToast from "../toasts/CustomToast";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import {
  TrackedWallet,
  updateTrackedWallets,
} from "@/apis/rest/wallet-tracker";
import { useWalletTrackerStore } from "@/stores/footer/use-wallet-tracker";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
import { DialogTitle } from "@radix-ui/react-dialog";

export default function WalletTrackerModal() {
  const [open, setOpen] = useState(false);
  const walletAddress = useTradesWalletModalStore((state) => state.wallet);
  const setWalletAddress = useTradesWalletModalStore(
    (state) => state.setWallet,
  );
  const existingWallets = useWalletTrackerStore(
    (state) => state.trackedWallets,
  );
  const [walletName, setWalletName] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("");

  useEffect(() => {
    if (walletAddress.length > 0) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [walletAddress]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      useTradesWalletModalStore.setState({ wallet: "" });
    }
  };

  const addWalletMutation = useMutation({
    mutationFn: (newWallet: TrackedWallet) =>
      updateTrackedWallets([...(existingWallets || []), newWallet]),
    onSuccess: () => {
      setOpen(false);
      setWalletAddress("");
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message="Wallet added successfully"
          state="SUCCESS"
        />
      ));
    },
    onError: (error: Error) => {
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message={error.message}
          state="ERROR"
        />
      ));
    },
  });

  const handleSubmit = () => {
    if (!walletName || !walletAddress) {
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message="Please fill in all fields"
          state="ERROR"
        />
      ));
      return;
    }

    addWalletMutation.mutate({
      emoji: selectedEmoji,
      name: walletName,
      address: walletAddress,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="gb__white__popover hidden h-[204px] w-[320px] flex-col rounded-[8px] border border-border p-0 md:flex">
          <div className="flex h-[56px] w-full items-center justify-start border-b border-border px-4 md:p-4">
            <DialogTitle className="text-nowrap font-geistSemiBold text-[18px] text-fontColorPrimary">
              Add Wallet Tracker
            </DialogTitle>
            <DialogClose
              onClick={() => {
                setWalletAddress("");
              }}
              className="ml-auto inline-block cursor-pointer text-fontColorSecondary"
            >
              <div className="relative aspect-square h-6 w-6 flex-shrink-0 duration-300 hover:opacity-70">
                <Image
                  src="/icons/close.png"
                  alt="Close Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </div>
            </DialogClose>
          </div>
          <div className="relative flex w-full flex-grow flex-col px-4">
            <div className="flex w-full gap-x-2">
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-fontColorSecondary">Emoji</Label>
                <SelectEmoji
                  value={selectedEmoji}
                  onChange={setSelectedEmoji}
                />
              </div>
              <div className="flex w-full flex-col gap-1">
                <Label className="text-xs text-fontColorSecondary">
                  Wallet Name
                </Label>
                <Input
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  placeholder="Wallet Name"
                  className="h-[32px] border border-border placeholder:text-fontColorSecondary focus:outline-none"
                />
              </div>
            </div>
          </div>
          <div className="flex h-[64px] w-full items-center justify-between gap-x-3 rounded-b-[8px] border border-t border-border bg-[#080811] p-4">
            <BaseButton
              onClick={handleSubmit}
              isLoading={addWalletMutation.isPending}
              disabled={addWalletMutation.isPending}
              type="button"
              variant="primary"
              className="h-8 w-full"
            >
              <span className="text-sm">Add Wallet</span>
            </BaseButton>
          </div>
        </DialogContent>
      </Dialog>
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerContent className="h-[204px] w-full p-0 md:hidden">
          <div className="flex h-[56px] w-full items-center justify-start border-b border-border px-4 md:p-4">
            <DrawerTitle className="text-nowrap font-geistSemiBold text-[18px] text-fontColorPrimary">
              Add Wallet Tracker
            </DrawerTitle>
            <DrawerClose
              onClick={() => {
                setWalletAddress("");
              }}
              className="ml-auto inline-block cursor-pointer text-fontColorSecondary"
            >
              <div className="relative aspect-square h-6 w-6 flex-shrink-0 duration-300 hover:opacity-70">
                <Image
                  src="/icons/close.png"
                  alt="Close Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </div>
            </DrawerClose>
          </div>
          <div className="relative flex w-full flex-grow flex-col px-4 pt-4">
            <div className="flex w-full gap-x-2">
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-fontColorSecondary">Emoji</Label>
                <SelectEmoji
                  value={selectedEmoji}
                  onChange={setSelectedEmoji}
                />
              </div>
              <div className="flex w-full flex-col gap-1">
                <Label className="text-xs text-fontColorSecondary">
                  Wallet Name
                </Label>
                <Input
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  placeholder="Wallet Name"
                  className="h-[32px] border border-border placeholder:text-fontColorSecondary focus:outline-none"
                />
              </div>
            </div>
          </div>
          <div className="flex h-[64px] w-full items-center justify-between gap-x-3 rounded-b-[8px] border border-t border-border bg-[#080811] p-4">
            <BaseButton
              onClick={handleSubmit}
              isLoading={addWalletMutation.isPending}
              disabled={addWalletMutation.isPending}
              type="button"
              variant="primary"
              className="h-8 w-full"
            >
              <span className="text-sm">Add Wallet</span>
            </BaseButton>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
