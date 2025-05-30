"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState, useEffect } from "react";
import { useUserWalletStore } from "@/stores/wallet/use-user-wallet.store";
// ######## Components 🧩 ########
import Image from "next/image";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import BaseButton from "../buttons/BaseButton";
import { Input } from "@/components/ui/input";
import WalletSelectionButton from "../WalletSelectionButton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { truncateAddress } from "@/utils/truncateAddress";
import { CachedImage } from "../CachedImage";
import { useWindowSizeStore } from "@/stores/use-window-size.store";

export default function WalletDistributePopoverModal() {
  const [openPopover, setOpenPopover] = useState(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const { activeWallet, setActiveWallet } = useUserWalletStore();
  const handleDialogClose = (isOpen: boolean) => {
    setOpenDialog(isOpen);
    setSelectedFromWallet(userWalletFullList[0]?.address);
    setSelectedWalletList(
      userWalletFullList.slice(0, 4).map((wallet) => wallet?.address),
    );
  };
  const width = useWindowSizeStore((state) => state.width);
  useEffect(() => {
    if (width! >= 1024 && openDialog) {
      setOpenDialog(false);
    } else if (width! < 1024 && openPopover) {
      setOpenPopover(false);
    }
  }, [width]);

  const { userWalletFullList } = useUserWalletStore();
  const [selectedFromWallet, setSelectedFromWallet] = useState<string>(
    userWalletFullList[0]?.address,
  );
  const [selectedWalletList, setSelectedWalletList] = useState<string[]>(
    userWalletFullList.slice(0, 4).map((wallet) => wallet?.address),
  );
  const addWalletToLocalSelectedToWalletList = (wallet: string) => {
    setSelectedWalletList([...selectedWalletList, wallet]);
  };
  const removeWalletToLocalSelectedToWalletList = (wallet: string) => {
    if (selectedWalletList.length === 1) return;

    const filteredLocalSelectedToWalletList = selectedWalletList.filter(
      (w) => w !== wallet,
    );
    setSelectedWalletList(filteredLocalSelectedToWalletList);
  };

  const [distributeAmount, setDistributeAmount] = useState<number | null>(null);
  const handleChangeDistributeAmount = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    const isValid = /^[1-9]\d*(\.\d+)?$|^0(\.\d+)?$/.test(value);

    if (isValid) {
      setDistributeAmount(parseFloat(value));
    }
  };

  const handleDistribute = () => {
    /* console.log("Distribute Handler") */;
  };

  return (
    <>
      {true ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <BaseButton
                onClick={() => setOpenPopover((prev) => !prev)}
                variant="gray"
                size="short"
                className="size-8"
              >
                <div className="relative z-30 aspect-square h-4 w-4 flex-shrink-0">
                  <Image
                    src="/icons/outline-distribute.png"
                    alt="Distribute Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
              </BaseButton>
            </TooltipTrigger>
            <TooltipContent side="top" className="px-2 py-1">
              <span className="inline-block text-nowrap text-xs">
                Coming Soon
              </span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <>
          {/* Desktop */}
          <Popover open={openPopover} onOpenChange={setOpenPopover}>
            <PopoverTrigger asChild>
              <BaseButton
                onClick={() => setOpenPopover((prev) => !prev)}
                variant="gray"
                className="block size-8 md:flex"
              >
                <div className="relative z-30 aspect-square h-4 w-4 flex-shrink-0">
                  <Image
                    src="/icons/outline-distribute.png"
                    alt="Distribute Icon"
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
              className="hidden w-[360px] flex-col rounded-[8px] border border-border bg-card p-0 shadow-[0_0_20px_0_#000000] lg:flex"
            >
              <div className="flex h-[56px] w-full items-center justify-between border-b border-border p-4">
                <h4 className="text-nowrap font-geistSemiBold text-[20px] text-fontColorPrimary">
                  Wallet Distribute
                </h4>
                <button
                  onClick={() => setOpenPopover(false)}
                  className="relative aspect-square h-7 w-7 flex-shrink-0"
                >
                  <Image
                    src="/icons/close.png"
                    alt="Close 2 Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </button>
              </div>

              <div className="w-full flex-grow pr-1">
                <OverlayScrollbarsComponent
                  defer
                  element="div"
                  className="popover__overlayscrollbar relative h-[256px] w-full flex-grow overflow-y-scroll"
                >
                  <div className="flex w-full flex-col gap-y-4 py-4 pl-4 pr-3.5">
                    <Input
                      type="number"
                      value={distributeAmount!}
                      onChange={handleChangeDistributeAmount}
                      placeholder="Enter amount"
                      prefixEl={
                        <div className="absolute left-3.5 mr-3 aspect-square h-4 w-4 flex-shrink-0">
                          <CachedImage
                            src="/icons/solana-sq.svg"
                            alt="Solana SQ Icon"
                            fill
                            quality={100}
                            className="object-contain"
                          />
                        </div>
                      }
                    />

                    <div className="flex h-auto w-full flex-col items-start gap-y-0.5">
                      <Label className="inline-block text-nowrap text-sm text-fontColorSecondary">
                        From
                      </Label>
                      <Select
                        value={selectedFromWallet}
                        onValueChange={(value) => setSelectedFromWallet(value)}
                      >
                        <SelectTrigger className="w-full">
                          <div className="flex items-center gap-x-3">
                            <div className="relative aspect-square h-[18px] w-[18px] flex-shrink-0">
                              <Image
                                src="/icons/wallet.png"
                                alt="Wallet Icon"
                                fill
                                quality={100}
                                className="object-contain"
                              />
                            </div>
                            <span className="inline-block text-nowrap text-fontColorSecondary">
                              <SelectValue placeholder="Select wallet" />
                            </span>
                          </div>
                        </SelectTrigger>
                        <SelectContent className="border border-border bg-[#10101E]">
                          {userWalletFullList.map((wallet, index) => (
                            <SelectItem
                              key={index + wallet?.address}
                              value={wallet?.address}
                            >
                              {truncateAddress(wallet?.address)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex h-auto w-full flex-col items-start gap-y-0.5">
                      <Label className="inline-block text-nowrap text-sm text-fontColorSecondary">
                        To
                      </Label>
                      <WalletSelectionButton
                        value={[activeWallet]}
                        setValue={(wallet) => {
                          setActiveWallet(wallet[0]);
                        }}
                        maxWalletShow={10}
                        // maxWalletShow={4}
                        className="w-full"
                      />
                      <div className="mt-2 flex h-auto w-full flex-wrap gap-1.5">
                        {userWalletFullList
                          ?.filter(
                            (wallet) =>
                              !selectedWalletList.find(
                                (w) => w === wallet?.address,
                              ),
                          )
                          ?.map((wallet, index) => (
                            <div
                              key={index + wallet?.address}
                              className="flex h-[26px] items-center justify-center gap-x-1 rounded-full border border-border bg-white/[5%] pl-2 pr-4 duration-300"
                            >
                              <button
                                onClick={() =>
                                  addWalletToLocalSelectedToWalletList(
                                    wallet?.address,
                                  )
                                }
                              >
                                <div className="relative aspect-square size-4 flex-shrink-0">
                                  <Image
                                    src="/icons/plus.png"
                                    alt="Plus Icon"
                                    fill
                                    quality={100}
                                    className="object-contain"
                                  />
                                </div>
                              </button>
                              <span className="inline-block font-geistSemiBold text-sm text-fontColorPrimary">
                                {truncateAddress(wallet?.address)}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </OverlayScrollbarsComponent>
              </div>

              <div className="flex items-center justify-center border-t border-border p-4">
                <BaseButton
                  variant="primary"
                  onClick={handleDistribute}
                  className="h-[40px] w-full"
                >
                  <span className="inline-block font-geistSemiBold text-base text-[#080811]">
                    Distribute
                  </span>
                </BaseButton>
              </div>
            </PopoverContent>
          </Popover>

          {/* Mobile */}
          <Dialog open={openDialog} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <BaseButton
                type="button"
                onClick={() => setOpenDialog(true)}
                variant="gray"
                size="short"
                className="block aspect-square size-8 md:hidden"
              >
                <div className="relative z-30 aspect-square h-4 w-4 flex-shrink-0">
                  <Image
                    src="/icons/outline-distribute.png"
                    alt="Distribute Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
              </BaseButton>
            </DialogTrigger>
            <DialogContent className="flex h-auto w-full max-w-[382px] flex-col gap-y-0 rounded-[8px] border border-border bg-card lg:hidden lg:max-w-[480px]">
              <DialogHeader className="flex h-[56px] flex-row items-center border-b border-border p-4">
                <DialogTitle className="text-lg">Wallet Distribute</DialogTitle>
              </DialogHeader>
              <div className="flex w-full flex-col gap-y-4">
                <div className="flex w-full flex-col gap-y-4 p-4">
                  <Input
                    type="number"
                    value={distributeAmount!}
                    onChange={handleChangeDistributeAmount}
                    placeholder="Enter amount"
                    prefixEl={
                      <div className="absolute left-3.5 mr-3 aspect-square h-4 w-4 flex-shrink-0">
                        <CachedImage
                          src="/icons/solana-sq.svg"
                          alt="Solana SQ Icon"
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </div>
                    }
                  />

                  <div className="flex h-auto w-full flex-col items-start gap-y-0.5">
                    <Label className="inline-block text-nowrap text-sm text-fontColorSecondary">
                      From
                    </Label>
                    <Select
                      value={selectedFromWallet}
                      onValueChange={(value) => setSelectedFromWallet(value)}
                    >
                      <SelectTrigger className="w-full">
                        <div className="flex items-center gap-x-3">
                          <div className="relative aspect-square h-[18px] w-[18px] flex-shrink-0">
                            <Image
                              src="/icons/wallet.png"
                              alt="Wallet Icon"
                              fill
                              quality={100}
                              className="object-contain"
                            />
                          </div>
                          <span className="inline-block text-nowrap text-fontColorSecondary">
                            <SelectValue placeholder="Select wallet" />
                          </span>
                        </div>
                      </SelectTrigger>
                      <SelectContent className="z-[320] border border-border bg-[#10101E]">
                        {userWalletFullList.map((wallet, index) => (
                          <SelectItem
                            key={index + wallet?.address}
                            value={wallet?.address}
                          >
                            {truncateAddress(wallet?.address)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex h-auto w-full flex-col items-start gap-y-0.5">
                    <Label className="inline-block text-nowrap text-sm text-fontColorSecondary">
                      To
                    </Label>
                    <WalletSelectionButton
                      value={[activeWallet]}
                      setValue={(wallet) => {
                        setActiveWallet(wallet[0]);
                      }}
                      maxWalletShow={10}
                      // maxWalletShow={4}
                      className="w-full"
                    />
                    <div className="mt-2 flex h-auto w-full flex-wrap gap-1.5">
                      {userWalletFullList
                        ?.filter(
                          (wallet) =>
                            !selectedWalletList.find(
                              (w) => w === wallet?.address,
                            ),
                        )
                        ?.map((wallet, index) => (
                          <div
                            key={index + wallet?.address}
                            className="flex h-[26px] items-center justify-center gap-x-1 rounded-full border border-border bg-white/[5%] pl-2 pr-4 duration-300"
                          >
                            <button
                              onClick={() =>
                                addWalletToLocalSelectedToWalletList(
                                  wallet?.address,
                                )
                              }
                            >
                              <div className="relative aspect-square size-4 flex-shrink-0">
                                <Image
                                  src="/icons/plus.png"
                                  alt="Plus Icon"
                                  fill
                                  quality={100}
                                  className="object-contain"
                                />
                              </div>
                            </button>
                            <span className="inline-block font-geistSemiBold text-sm text-fontColorPrimary">
                              {truncateAddress(wallet?.address)}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center border-t border-border p-4">
                  <BaseButton
                    variant="primary"
                    onClick={handleDistribute}
                    className="h-[40px] w-full"
                  >
                    <span className="inline-block font-geistSemiBold text-base text-[#080811]">
                      Distribute
                    </span>
                  </BaseButton>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  );
}
