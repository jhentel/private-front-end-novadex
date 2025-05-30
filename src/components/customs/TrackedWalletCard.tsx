"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useEffect, useMemo, useState, useRef } from "react";
import { useSelectedWalletTrackerTradeAddressesFilterStore } from "@/stores/footer/use-selected-wallet-tracker-trade-filter.store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWalletTrackerMessageStore } from "@/stores/footer/use-wallet-tracker-message.store";
import toast from "react-hot-toast";
// ######## APIs 🛜 ########
import {
  TrackedWallet,
  updateTrackedWallets,
} from "@/apis/rest/wallet-tracker";
// ######## Components 🧩 ########
import Image from "next/image";
import Copy from "@/components/customs/Copy";
import AddressWithEmojis from "@/components/customs/AddressWithEmojis";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { PopoverClose } from "@radix-ui/react-popover";
import EditWalletForm from "@/components/customs/EditTrackedWallet";
import CustomToast from "@/components/customs/toasts/CustomToast";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { truncateString } from "@/utils/truncateString";
import truncateCA from "@/utils/truncateCA";
import EditTrackedWallet from "@/components/customs/EditTrackedWallet";
import BaseButton from "./buttons/BaseButton";
import { useWalletTrackerStore } from "@/stores/footer/use-wallet-tracker";
import { useWalletHighlightStore } from "@/stores/wallets/use-wallet-highlight-colors.store";
import { useWindowSize } from "@/hooks/use-window-size";
import { useLocalStorage } from "react-use";
import { X } from "lucide-react";
import { ColorPicker } from "@/components/customs/ColorPicker";
import { DialogTitle } from "@radix-ui/react-dialog";

const ADD_WALLET_CONTENT_CONTAINER_BASE_CLASS_2 =
  "border-2 border-border bg-card p-0 shadow-[0_0_20px_0_#000000] max-w-[95vw] sm:w-[518px] flex flex-col h-auto z-[1000]";

export type TrackedWalletCardProps = {
  name: string;
  address: string;
  emoji: string;
  trackedWallets: TrackedWallet[];
};

export default function TrackerWalletCard({
  name,
  address,
  emoji,
  trackedWallets,
}: TrackedWalletCardProps) {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const queryClient = useQueryClient();
  const trackedEnabledSound = useWalletTrackerStore(
    (state) => state.trackedEnabledSound,
  );
  const setTrackerEnabledSound = useWalletTrackerStore(
    (state) => state.setTrackerEnabledSound,
  );
  const deleteWalletColor = useWalletHighlightStore(
    (state) => state.deleteWalletColor,
  );

  const currentSelectedAddresses =
    useSelectedWalletTrackerTradeAddressesFilterStore(
      (state) => state.selectedWalletAddresses,
    );
  const setSelectedWalletAddressesFilter =
    useSelectedWalletTrackerTradeAddressesFilterStore(
      (state) => state.setSelectedWalletAddresses,
    );
  const handleFilterTradeOfThisWallet = () => {
    if (!currentSelectedAddresses.includes(address)) {
      setSelectedWalletAddressesFilter([...currentSelectedAddresses, address]);

      // setCurrentSingleSelectedAddress(address);
    } else {
      const newFilter = currentSelectedAddresses.filter((a) => a !== address);
      setSelectedWalletAddressesFilter(newFilter);

      // setCurrentSingleSelectedAddress("");
    }
  };

  const setCurrentSingleSelectedAddress = useWalletTrackerMessageStore(
    (state) => state.setCurrentSingleSelectedAddress,
  );

  const handleSoundToggle = () => {
    if (typeof trackedEnabledSound == "boolean") {
      setTrackerEnabledSound([address]);
    } else if (trackedEnabledSound.includes(address)) {
      setTrackerEnabledSound(trackedEnabledSound.filter((w) => w !== address));
    } else {
      setTrackerEnabledSound([...trackedEnabledSound, address]);
    }
  };

  const isSoundEnabled =
    typeof trackedEnabledSound == "boolean"
      ? false
      : trackedEnabledSound?.includes(address);

  const updateWalletsMutation = useMutation({
    mutationFn: updateTrackedWallets,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracked-wallets"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-tracker"] });
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message="Wallets updated successfully"
          state="SUCCESS"
        />
      ));
      setOpenDeleteDialog(false);
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

  const handleDelete = (address: string) => {
    updateWalletsMutation.mutate(
      trackedWallets.filter((w) => w.address !== address),
    );
    // handleFilterTradeOfThisWallet();
    const newFilter = currentSelectedAddresses.filter((a) => a !== address);
    deleteWalletColor(address);
    setSelectedWalletAddressesFilter(newFilter);
  };

  return (
    <div
      className={cn(
        "relative h-[70px] w-full items-center justify-between overflow-hidden rounded-[8px] border border-border duration-300 max-xl:grid max-xl:grid-cols-2 max-xl:gap-x-3 max-md:border md:hover:bg-shadeTableHover xl:flex xl:rounded-none xl:border-none",
        currentSelectedAddresses.includes(address)
          ? "bg-[#191024]"
          : "odd:bg-shadeTable",
      )}
    >
      <div className="flex items-start gap-x-3 px-4 xl:w-40">
        <div
          onClick={handleFilterTradeOfThisWallet}
          className="relative -mt-[1.5px] aspect-square h-5 w-5 flex-shrink-0 cursor-pointer"
        >
          <Image
            src={
              currentSelectedAddresses.includes(address)
                ? "/icons/footer/checked.png"
                : "/icons/footer/unchecked.png"
            }
            alt="Check / Unchecked Icon"
            fill
            quality={100}
            className="object-contain"
          />
        </div>
        <div className="flex h-[32px] w-full flex-col justify-center xl:-ml-0.5">
          <div className="flex flex-col justify-center gap-y-0">
            <h4
              onClick={handleFilterTradeOfThisWallet}
              className="w-fit max-w-[150px] cursor-pointer truncate text-nowrap font-geistSemiBold text-sm text-fontColorPrimary"
            >
              {emoji}
              <span className="ml-1">{name}</span>
            </h4>

            <span className="flex items-center justify-start gap-x-1 text-nowrap pl-0.5 text-xs text-fontColorSecondary">
              <span className="text-xs">{truncateCA(address, 10)}</span>
              <Copy className="size-4" value={address} />
            </span>
          </div>
        </div>
      </div>

      <div className="flex h-full items-center justify-end">
        <div className="flex h-full w-[104px] items-center justify-center p-4">
          <WalletHighlightColor wallet={{ name, emoji, address }} />
        </div>
        <div className="flex items-center justify-end gap-x-1 p-4">
          <BaseButton
            onClick={() => handleSoundToggle()}
            variant="gray"
            size="short"
            className="relative size-[32px] bg-secondary"
          >
            <div className="relative z-30 aspect-square h-4 w-4 flex-shrink-0">
              <Image
                src={
                  !isSoundEnabled
                    ? "/icons/footer/sound-on.png"
                    : "/icons/footer/sound-off.png"
                }
                alt="Sound On Icon"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
          </BaseButton>

          <EditTrackedWallet
            triggerElement={
              <button
                type="button"
                className="relative flex h-[32px] w-[32px] flex-shrink-0 items-center justify-center gap-x-1 overflow-hidden rounded-[8px] bg-secondary duration-300 hover:bg-white/[12%]"
              >
                <div className="relative z-30 aspect-square h-4 w-4 flex-shrink-0">
                  <Image
                    src="/icons/wallet-trades-edit.png"
                    alt="Edit Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
              </button>
            }
            address={address}
          />

          <Dialog
            open={openDeleteDialog}
            onOpenChange={(open) => {
              if (updateWalletsMutation.isPending) return;
              setOpenDeleteDialog(open);
            }}
          >
            <DialogTrigger asChild>
              <button
                type="button"
                className="relative flex h-[32px] w-[32px] flex-shrink-0 items-center justify-center gap-x-1 overflow-hidden rounded-[8px] bg-secondary duration-300 hover:bg-white/[12%]"
              >
                <div className="relative z-30 aspect-square h-4 w-4 flex-shrink-0">
                  <Image
                    src={
                      updateWalletsMutation.isPending
                        ? "/icons/search-loading.png"
                        : "/icons/footer/delete.png"
                    }
                    alt="Delete Icon"
                    fill
                    quality={100}
                    className={cn(
                      "object-contain",
                      updateWalletsMutation.isPending && "animate-spin",
                    )}
                  />
                </div>
              </button>
            </DialogTrigger>
            <DialogContent className="max-sm:max-w-[95%]">
              <DialogTitle className="border-b border-[#242436] p-4 font-geistSemiBold text-[18px] text-white">
                Delete Wallet
              </DialogTitle>
              <div className="-mt-4 space-y-4 p-4">
                <div className="text-fontColorSecondary">
                  Are you sure you want to delete this wallet?
                </div>
                <div className="flex w-full flex-col justify-center rounded-md border border-[#242436] p-4">
                  <div className="flex flex-col justify-center gap-y-0">
                    <h4 className="w-fit cursor-pointer truncate text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                      {emoji}
                      <span className="ml-1">{name}</span>
                    </h4>

                    <span className="flex items-center justify-start gap-x-1 text-nowrap pl-0.5 text-xs text-fontColorSecondary">
                      <div className="truncate text-xs">{address}</div>
                      <Copy className="size-4" value={address} />
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-start gap-2">
                  <BaseButton
                    variant="primary"
                    className="px-2 text-sm"
                    disabled={updateWalletsMutation.isPending}
                    onClick={() => handleDelete(address)}
                  >
                    <span>Delete</span>
                  </BaseButton>
                  <BaseButton
                    variant="gray"
                    className="px-2 text-sm"
                    onClick={() => setOpenDeleteDialog(false)}
                    disabled={updateWalletsMutation.isPending}
                  >
                    Cancel
                  </BaseButton>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

function uniqueArray<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

type WalletHighlightColorProps = {
  wallet: {
    name: string;
    emoji: string;
    address: string;
  };
};

const DEFAULT_HIGHLIGHT_COLOR = "transparent";
function WalletHighlightColor({ wallet }: WalletHighlightColorProps) {
  const wallets = useWalletHighlightStore((state) => state.wallets);

  const setWalletColor = useWalletHighlightStore(
    (state) => state.setWalletColor,
  );

  const color = useMemo(() => {
    return wallets[wallet.address]?.color || DEFAULT_HIGHLIGHT_COLOR;
  }, [wallet.address, wallets]);

  const { width, height } = useWindowSize();
  const [open, setOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(color);
  const [savedColors, setSavedColors] = useLocalStorage<string[]>(
    "nova-saved-colors",
    [],
  );
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [popoverPosition, setPopoverPosition] = useState<
    "top" | "bottom" | "right"
  >("bottom");

  const isMobile = width && width < 640;

  // Improved positioning logic to avoid overflow at top and bottom
  useEffect(() => {
    const checkPosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const distanceFromBottom = viewportHeight - rect.bottom;
        const distanceFromTop = rect.top;
        const popupHeight = 500; // Estimated height of the popup

        // Safe distances from edges
        const safeMargin = 80; // Buffer for navbar and other UI elements
        const footerMargin = 120; // Additional margin to account for footer height

        // Check if there's enough space at the bottom (considering footer)
        const hasSpaceBelow = distanceFromBottom > popupHeight + footerMargin;

        // Check if there's enough space at the top
        const hasSpaceAbove = distanceFromTop > popupHeight + safeMargin;

        // Check if there's enough space on the right (for side=right)
        const hasSpaceRight = viewportWidth - rect.right > 300;

        // Check if we're near the bottom of the page
        if (distanceFromBottom < popupHeight + footerMargin) {
          // Near bottom - check if we have space at the top, otherwise try right
          if (hasSpaceAbove) {
            setPopoverPosition("top");
          } else if (hasSpaceRight) {
            setPopoverPosition("right");
          } else {
            setPopoverPosition("bottom"); // Default to bottom even if not ideal
          }
        } else if (distanceFromTop < popupHeight + safeMargin) {
          // Near top - never use top position, check right or use bottom
          if (hasSpaceRight) {
            setPopoverPosition("right");
          } else {
            setPopoverPosition("bottom");
          }
        } else if (hasSpaceRight) {
          // If right side has space, prefer it
          setPopoverPosition("right");
        } else {
          // Default to bottom when no special cases apply
          setPopoverPosition("bottom");
        }
      }
    };

    if (open) {
      checkPosition();
      window.addEventListener("resize", checkPosition);
      return () => window.removeEventListener("resize", checkPosition);
    }
  }, [open]);

  function handleSave() {
    setWalletColor(wallet, selectedColor);
    setSavedColors(
      uniqueArray([selectedColor, ...(savedColors || [])]).slice(0, 14),
    );
    setOpen(false);
  }

  useEffect(() => {
    if (wallets[wallet.address]) return;
    setWalletColor(wallet, DEFAULT_HIGHLIGHT_COLOR);
  }, [wallet, wallets]);

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <button
            ref={buttonRef}
            className={cn(
              "size-5 rounded-full border border-white transition-all duration-200 hover:ring-2 hover:ring-white",
              color === DEFAULT_HIGHLIGHT_COLOR &&
                "bg-[url('/images/decorations/transparent.jpg')] bg-cover",
            )}
            style={{ backgroundColor: open ? selectedColor : color }}
          ></button>
        </DrawerTrigger>
        <DrawerContent className="">
          <div className="bg-[#080811] drop-shadow-xl">
            <div className="flex h-14 items-center justify-between gap-5 border-b border-[#242436] px-4 py-[14px]">
              <div className="font-geistSemiBold text-lg text-[#FCFCFD]">
                Highlight Color
              </div>
              <button
                onClick={() => setOpen(false)}
                className="ml-auto size-[24px] cursor-pointer text-fontColorSecondary hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4 sm:h-[380px]">
              <ColorPicker
                color={selectedColor}
                savedColors={savedColors || []}
                onChange={(color) => setSelectedColor(color.hex)}
                onSaveColor={(color) =>
                  setSavedColors(
                    uniqueArray([...(savedColors || []), selectedColor]),
                  )
                }
              />
            </div>
            <div className="h-16 border-t border-[#242436] p-4">
              <BaseButton
                variant="primary"
                className="w-full"
                onClick={handleSave}
              >
                <span className="inline-block whitespace-nowrap font-geistSemiBold text-sm text-[#080811]">
                  Save
                </span>
              </BaseButton>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          ref={buttonRef}
          className={cn(
            "size-5 rounded-full border border-white transition-all duration-200 hover:ring-2 hover:ring-white",
            color === DEFAULT_HIGHLIGHT_COLOR &&
              "bg-[url('/images/decorations/transparent.jpg')] bg-cover",
          )}
          style={{ backgroundColor: open ? selectedColor : color }}
        ></button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        side={popoverPosition}
        alignOffset={0}
        sideOffset={20}
        avoidCollisions={true}
        collisionPadding={{ top: 20, bottom: 120, left: 20, right: 20 }}
        className="w-fit border-none bg-transparent p-0"
      >
        <div className="h-[500px] w-[264px] rounded-lg border border-[#242436] bg-[#080811] drop-shadow-xl">
          <div className="flex h-14 items-center justify-between gap-5 border-b border-[#242436] px-4 py-[14px]">
            <div className="font-geistSemiBold text-lg text-[#FCFCFD]">
              Highlight Color
            </div>
            <button
              onClick={() => setOpen(false)}
              className="ml-auto size-[24px] cursor-pointer text-fontColorSecondary hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          <div className="h-[380px] p-4">
            <ColorPicker
              color={selectedColor}
              savedColors={savedColors || []}
              onChange={(color) => setSelectedColor(color.hex)}
              onSaveColor={(color) =>
                setSavedColors(
                  uniqueArray([color, ...(savedColors || [])]).slice(0, 14),
                )
              }
            />
          </div>
          <div className="h-16 border-t border-[#242436] p-4">
            <BaseButton
              variant="primary"
              className="w-full"
              onClick={handleSave}
            >
              <span className="inline-block whitespace-nowrap font-geistSemiBold text-sm text-[#080811]">
                Save
              </span>
            </BaseButton>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
