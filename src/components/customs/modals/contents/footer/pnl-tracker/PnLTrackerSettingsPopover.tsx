"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePnlSettings } from "@/stores/use-pnl-settings";
import { useUserWalletStore } from "@/stores/wallet/use-user-wallet.store";
import { usePnlTrackerFooterData } from "@/hooks/use-pnl-tracker-footer-data";
import { useWindowSizeStore } from "@/stores/use-window-size.store";

// ######## Components 🧩 ########
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { CachedImage } from "@/components/customs/CachedImage";
import Image from "next/image";
import PnLDisplayUSDButtons from "./PnLDisplayUSDButtons";
import PnLImageSelector from "./PnLImageSelector";
import PnLUploadProfilePicture from "./PnLUploadProfilePicture";
import BaseButton from "@/components/customs/buttons/BaseButton";

// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { truncateAddress } from "@/utils/truncateAddress";
import { Wallet } from "@/apis/rest/wallet-manager";

// ######## Types 🗨️ ########
import { Display } from "./types";
import toast from "react-hot-toast";
import CustomToast from "@/components/customs/toasts/CustomToast";

type Position = { x: number; y: number };
const DRAG_AREA_MARGIN_BOTTOM = 42;
export default function PnLTrackerSettingPopover({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const {
    selectedTheme: selectedThemeSetting,
    userName: savedUserName,
    size: selectedSize,
    selectedDisplayUSD,
    setStoredWallets,
    handleSavePNLSettings,
    handleResetPNLSettings,
    handleAddNewStoredWallet,
    isInitialized: pnlSettingsIsInitialized,
    storedWallets: currentStoredWallets,
    setIsInitialized,
  } = usePnlSettings();
  const { handleWalletSelection } = usePnlTrackerFooterData();
  const { width, height } = useWindowSizeStore();
  const {
    userWalletFullList,
    balance,
    selectedMultipleActiveWalletPnLTracker,
    isLoading,
  } = useUserWalletStore();

  const finalWallets = (
    (selectedMultipleActiveWalletPnLTracker &&
    selectedMultipleActiveWalletPnLTracker.length
      ? selectedMultipleActiveWalletPnLTracker
      : []) as Wallet[]
  )?.filter((w) => !w.archived);

  // const storedWallets = useMemo(() => {
  //   return userWalletFullList.map((wallet) => {
  //     const matchedWallet = finalWallets.find(
  //       (w) => w.address === wallet.address,
  //     );
  //     return {
  //       balance: matchedWallet ? Number(matchedWallet?.balance) : Number(wallet.balance),
  //       address: wallet.address,
  //     };
  //   });
  // }, [userWalletFullList, finalWallets]);

  const finalFullListWallets = userWalletFullList?.filter((w) => !w.archived);

  const storedWallets = useMemo(() => {
    return finalFullListWallets.map((w) => {
      return {
        balance: Number(w.balance || balance[w.address] || 0),
        address: w.address,
      };
    });
  }, [userWalletFullList, balance]);

  const isStoredWalletsMatch = currentStoredWallets.find(
    (item) => item.address === finalFullListWallets[0]?.address,
  );

  // useEffect(() => {
  //   if (!pnlSettingsIsInitialized) {
  //     console.log("SET storedWallets", initStoredWallets);
  //     setStoredWallets(initStoredWallets);
  //     setIsInitialized(true);
  //   }
  // }, [initStoredWallets]);

  const [selectedTheme, setSelectedTheme] = useState(selectedThemeSetting);
  const [size, setSize] = useState(selectedSize);
  const [userName, setUserName] = useState(savedUserName ?? "");
  const [activeDisplay, setActiveDisplay] = useState<Display>(
    selectedDisplayUSD ?? "Both",
  );
  const [profilePicture, setProfilePicture] = useState<string>("");

  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const initializedRef = useRef(false);

  // Handle header drag start
  const handleDragStart = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest("input") ||
      target.closest("textarea") ||
      target.closest("select") ||
      target.closest("button")
    ) {
      return;
    }

    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y,
    };
    document.body.style.userSelect = "none";
  };

  // Handle initial position
  useEffect(() => {
    if (!isOpen || initializedRef.current || !width || !height) return;

    const modalWidth = 360;
    const modalHeight = 740;

    setPosition({
      x: Math.max((width - modalWidth) / 2, 0),
      y: Math.max((height - DRAG_AREA_MARGIN_BOTTOM - modalHeight) / 2, 0),
    });

    setUserName(savedUserName ?? "");
    setSelectedTheme(selectedThemeSetting ?? "theme1");

    initializedRef.current = true;

    return () => {
      initializedRef.current = false;
    };
  }, [isOpen, width, height]);

  // Handle drag move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !width || !height) return;

      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;

      let newX = dragStartRef.current.posX + deltaX;
      let newY = dragStartRef.current.posY + deltaY;

      newX = Math.max(0, Math.min(newX, width - size.width));
      newY = Math.max(
        0,
        Math.min(newY, height - DRAG_AREA_MARGIN_BOTTOM - size.height),
      );

      setPosition({
        x: Math.round(newX),
        y: Math.round(newY),
      });

      //   localStorage.setItem(
      //     STORAGE_KEY_POSITION,
      //     JSON.stringify({
      //       x: Math.round(newX),
      //       y: Math.round(newY),
      //     }),
      //   );
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.userSelect = "";
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, width, height, size]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSave = useCallback(() => {
    handleSavePNLSettings({
      selectedTheme,
      selectedDisplayUSD: activeDisplay,
      userName: userName.slice(0, 20),
      profilePicture,
      size,
    });
    toast.custom((t: any) => (
      <CustomToast
        tVisibleState={t.visible}
        message="Settings saved successfully!"
        state="SUCCESS"
      />
    ));
    onOpenChange(false);
  }, [activeDisplay, selectedTheme, userName, profilePicture, size]);

  const handleReset = useCallback(() => {
    handleResetPNLSettings(storedWallets);
    toast.custom((t: any) => (
      <CustomToast
        tVisibleState={t.visible}
        message="P&L has been reset"
        state="SUCCESS"
      />
    ));
    onOpenChange(false);
  }, [storedWallets, handleResetPNLSettings]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length >= 20) {
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message="Maximum length reached (20 characters)"
          state="WARNING"
        />
      ));
    }
    setUserName(value.slice(0, 20));
  };
  
  const unarchivedWallets = useMemo(() => {
    return userWalletFullList.filter((w) => !w?.archived);
  }, [userWalletFullList]);

  useEffect(() => {
    if (!pnlSettingsIsInitialized && !isLoading) {
      /* console.log("SET storedWallets", storedWallets, userWalletFullList, isLoading) */;
      
      handleWalletSelection(unarchivedWallets);
      handleAddNewStoredWallet(storedWallets);
      setIsInitialized(true);
    } 
  }, [storedWallets, isLoading]);
  
  useEffect(() => { 
    if (pnlSettingsIsInitialized) {
      handleWalletSelection(unarchivedWallets);
      handleAddNewStoredWallet(storedWallets);
    }
  }, [unarchivedWallets?.length])

  return (
    <>
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              duration: 0.2,
              ease: "easeOut",
            }}
            className="group fixed z-[990] overflow-visible max-lg:hidden"
            style={{
              top: `${position.y}px`,
              left: `${position.x}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className={cn(
                "relative flex h-full w-full flex-col overflow-visible",
              )}
            >
              <div className="gb__white__popover relative z-[1000] flex h-full w-[360px] flex-col overflow-hidden rounded-[8px] border border-b border-border bg-[#080811] p-0 shadow-[0_0_20px_0_#000000] duration-300">
                <motion.div
                  className={`flex h-[56px] w-full items-center justify-between gap-5 border-b border-border px-4 py-3.5`}
                  onMouseDown={handleDragStart}
                  id="pnl-tracker-setting-card"
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                  style={{
                    cursor: isDragging ? "grabbing" : "grab",
                    transformOrigin: "center center",
                  }}
                >
                  <h4 className="text-nowrap font-geistSemiBold text-[18px] text-fontColorPrimary">
                    Settings
                  </h4>
                  <button
                    onClick={handleClose}
                    className="relative size-6 flex-shrink-0"
                  >
                    <Image
                      src="/icons/close.png"
                      alt="Close Icon"
                      fill
                      quality={100}
                      className="object-contain"
                    />
                  </button>
                </motion.div>
                <div className="flex flex-col gap-4 overflow-hidden border-b border-border p-4">
                  <div className="hidden h-[32px] w-full flex-shrink-0 items-center lg:flex">
                    <WalletSelectionPopover
                      finalWallets={finalWallets}
                      userWalletFullList={userWalletFullList}
                      handleWalletSelection={handleWalletSelection}
                    />
                  </div>
                  <div className="flex flex-col gap-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="font-geistRegular text-xs text-fontColorSecondary">
                        Enter Username
                      </Label>
                      <div className="flex gap-0.5 rounded bg-[#9191A41F]/20 p-0.5 pr-2">
                        <Image
                          src="/icons/optional.png"
                          alt="Close Icon"
                          quality={100}
                          width={16}
                          height={16}
                          className="size-4 object-contain"
                        />
                        <p className="text-xs text-fontColorSecondary">
                          optional
                        </p>
                      </div>
                    </div>
                    <Input
                      type="text"
                      placeholder="Enter your username"
                      className="min-h-8 border-[#FCFCFD14]/[8%] bg-[#FFFFFF]/[2%] px-3 py-[14px] text-sm"
                      value={userName}
                      maxLength={20}
                      onChange={handleUsernameChange}
                    />
                  </div>

                  <div className="w-full gap-4">
                    <Label className="font-geistRegular text-xs text-fontColorSecondary">
                      Display Currency
                    </Label>
                    <PnLDisplayUSDButtons
                      activeDisplay={activeDisplay}
                      setActiveDisplay={setActiveDisplay}
                    />
                  </div>
                  <div className="w-full">
                    <PnLImageSelector
                      selectedTheme={selectedTheme}
                      setSelectedTheme={setSelectedTheme}
                      setSize={setSize}
                    />
                  </div>
                  <div className="w-full items-center justify-center">
                    <PnLUploadProfilePicture
                      setProfilePicture={setProfilePicture}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 overflow-hidden p-4">
                  <BaseButton variant="primary" onClick={handleSave}>
                    Save
                  </BaseButton>
                  <BaseButton
                    variant="gray"
                    className="bg-[#F65B9326]/15 text-destructive hover:bg-[#F65B9326]/25"
                    onClick={handleReset}
                  >
                    Reset P&L
                  </BaseButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

const WalletSelectionPopover = ({
  finalWallets,
  userWalletFullList,
  handleWalletSelection,
}: {
  userWalletFullList: Wallet[];
  finalWallets: Wallet[];
  handleWalletSelection: (wallet: Wallet[]) => void;
}) => {
  const [isOpenSelectWallet, setIsOpenSelectWallet] = useState<boolean>(false);
  return (
    <Popover
      onOpenChange={(isOpen) => setIsOpenSelectWallet(isOpen)}
      open={isOpenSelectWallet}
    >
      <PopoverTrigger asChild className="h-full w-full cursor-pointer">
        <button
          className={cn(
            "flex h-full w-full items-center gap-x-3 rounded-[8px] border border-border bg-white bg-white/[4%] px-2 transition-all duration-200 ease-out active:border-primary active:bg-primary/[6%]",
          )}
        >
          <div className="relative flex aspect-square h-4 w-4 items-center justify-center">
            <Image
              src="/icons/wallet.png"
              alt="Wallet Icon"
              fill
              quality={50}
              className="object-contain"
            />
            <span className="absolute top-0 mt-[3px] font-geistSemiBold text-[8px] text-black">
              {finalWallets.length}
            </span>
          </div>

          <div className="my-auto flex h-full w-[92px] flex-shrink-0 flex-col justify-center text-start">
            <div className="flex w-fit cursor-pointer items-center justify-between">
              <div className="w-auto space-x-2 overflow-hidden text-ellipsis whitespace-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                {finalWallets.length ===
                userWalletFullList?.filter((w) => !w.archived).length ? (
                  <span
                    className={cn(
                      "inline-block rounded-md bg-white/[4%] px-2 py-[2px]",
                    )}
                  >
                    All Wallets Selected
                  </span>
                ) : (
                  finalWallets?.slice(0, 3).map((wallet, index) => (
                    <span
                      key={index}
                      className={cn(
                        "inline-block rounded-md bg-white/[4%] px-2 py-[2px]",
                      )}
                    >
                      {wallet.name.length > 30
                        ? truncateAddress(wallet.name)
                        : wallet.name}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
          <div
            className={cn(
              "relative mb-auto ml-auto mt-auto size-5 flex-shrink-0 transition-all duration-200 ease-out",
              isOpenSelectWallet && "rotate-180",
            )}
          >
            <Image
              src="/icons/pink-chevron-down.png"
              alt="Dropdown Pink Arrow Icon"
              fill
              quality={50}
              className="object-contain"
            />
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent
        sideOffset={24}
        className={cn(
          "z-[1200] mt-[-0.8rem] rounded-[8px] border border-border bg-card py-2 pl-2 pr-1 shadow-[0_0_20px_0_#000000]",
        )}
      >
        <OverlayScrollbarsComponent
          defer
          element="div"
          className="popover__overlayscrollbar h-[240px] w-full pr-2.5"
        >
          <div className="flex w-full flex-col gap-y-1">
            <div
              onClick={() =>
                handleWalletSelection(
                  userWalletFullList.filter((w) => !w.archived),
                )
              }
              className={cn(
                "flex h-[55px] flex-shrink-0 cursor-pointer items-center justify-between rounded-[6px] border border-transparent bg-white/[4%] px-2 py-1.5 duration-300 hover:bg-white/[8%]",
                finalWallets?.length ==
                  userWalletFullList?.filter((w) => !w.archived).length
                  ? "border-primary bg-primary/[8%]"
                  : "",
              )}
            >
              <span className="flex items-center gap-x-[4px]">
                <div className="relative aspect-square h-4 w-4">
                  <Image
                    src="/icons/wallet.png"
                    alt="Wallet Icon"
                    fill
                    quality={50}
                    className="object-contain"
                  />
                </div>
                <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                  All
                </span>
              </span>

              <div className="relative mb-2 aspect-square size-4">
                <Checkbox
                  checked={
                    finalWallets?.length ==
                    userWalletFullList?.filter((w) => !w.archived).length
                  }
                />
              </div>
            </div>

            {userWalletFullList
              ?.filter((w) => !w.archived)
              ?.map((wallet, index) => {
                const isActive = finalWallets?.find(
                  (w) => w.address === wallet.address,
                );

                return (
                  <div
                    key={index + wallet.address}
                    onClick={() => handleWalletSelection([wallet])}
                    className={cn(
                      "flex h-[55px] flex-shrink-0 cursor-pointer items-center justify-between rounded-[6px] border border-transparent bg-white/[4%] px-2 py-1.5 duration-300 hover:bg-white/[8%]",
                      isActive ? "border-primary bg-primary/[8%]" : "",
                    )}
                  >
                    <span className="flex items-center gap-x-[4px]">
                      <div className="relative aspect-square h-4 w-4">
                        <Image
                          src="/icons/wallet.png"
                          alt="Wallet Icon"
                          fill
                          quality={50}
                          className="object-contain"
                        />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                          {truncateAddress(wallet.name)}
                        </span>
                        <span className="inline-block text-nowrap text-xs text-fontColorSecondary">
                          {truncateAddress(wallet.address)}
                        </span>
                      </div>
                    </span>

                    <div className="flex items-center gap-x-2">
                      <div className="flex items-center gap-x-1">
                        <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                          <CachedImage
                            src="/icons/solana-sq.svg"
                            alt="Solana SQ Icon"
                            fill
                            quality={50}
                            className="object-contain"
                          />
                        </div>
                        <span className="inline-block text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
                          {wallet.balance}
                        </span>
                      </div>
                      <div className="relative mb-2 aspect-square size-4">
                        <Checkbox
                          checked={!!isActive}
                          onClick={() => handleWalletSelection([wallet])}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </OverlayScrollbarsComponent>
      </PopoverContent>
    </Popover>
  );
};

export const PnLTrackerSettingTrigger = () => {
  const { setIsSettingOpen, isSettingOpen } = usePnlSettings();
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setIsSettingOpen(!isSettingOpen);
      }}
      className="size-6 flex-shrink-0 rounded-full bg-white/[8%] p-1 hover:bg-white/20"
    >
      <Image
        src="/icons/white-setting.png"
        alt="Setting Icon"
        quality={100}
        width={16}
        height={16}
        className="pointer-events-none size-4 object-contain"
      />
    </button>
  );
};
