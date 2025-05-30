"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useUserWalletStore } from "@/stores/wallet/use-user-wallet.store";
import { useHoldingsMessageStore } from "@/stores/holdings/use-holdings-messages.store";
import { useSolPriceMessageStore } from "@/stores/use-solprice-message.store";
import { useQueryClient } from "@tanstack/react-query";
// ######## Components 🧩 ########
import Image from "next/image";
import BaseButton from "@/components/customs/buttons/BaseButton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { truncateAddress } from "@/utils/truncateAddress";
import { formatAmountWithoutLeadingZero } from "@/utils/formatAmount";
// ######## Types 🗨️ ########
import { HoldingsConvertedMessageType } from "@/types/ws-general";
import { Wallet } from "@/apis/rest/wallet-manager";
import PnLScreenshot from "./token/PnL/PnLScreenshot";
import { Checkbox } from "../ui/checkbox";
import { usePopupStore } from "@/stores/use-popup-state";
import { CachedImage } from "./CachedImage";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { getIsStrippedHoldingPreviewData } from "@/utils/getIsStrippedHoldingPreviewData";

const HoldingsWalletSelection = ({
  initHoldings,
  initWallets,
}: {
  initHoldings?: HoldingsConvertedMessageType[] | null;
  initWallets?: Wallet[] | null;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshingHolding, setIsRefreshingHolding] =
    useState<boolean>(false);
  // const chartPriceMessage = useHoldingsMessageStore(
  //   (state) => state.chartPriceMessage,
  // );

  // Add ref for measuring button width
  // const buttonRef = React.useRef<HTMLButtonElement>(null);

  // Update width when component mounts and on window resize
  // useEffect(() => {
  //   const updateWidth = () => {
  //     if (buttonRef.current) {
  //       setButtonWidth(buttonRef.current.offsetWidth);
  //     }
  //   };
  //
  //   updateWidth();
  //   window.addEventListener("resize", updateWidth);
  //   return () => window.removeEventListener("resize", updateWidth);
  // }, []);

  const {
    userWalletFullList,
    selectedMultipleActiveWalletHoldings,
    setSelectedMultipleActiveWalletHoldings,
  } = useUserWalletStore();

  const finalWallets = (
    (selectedMultipleActiveWalletHoldings &&
    selectedMultipleActiveWalletHoldings.length
      ? selectedMultipleActiveWalletHoldings
      : initWallets || []) as Wallet[]
  )?.filter((w) => !w.archived);

  const solPrice = useSolPriceMessageStore((state) => state.messages).price;

  const holdingsMessages = useHoldingsMessageStore((state) => state.messages);
  const priceMessages = useHoldingsMessageStore(
    (state) => state.chartPriceMessage,
  );
  const [isOpenSelectWallet, setIsOpenSelectWallet] = useState<boolean>(false);

  const finalHoldings = (
    holdingsMessages.length ? holdingsMessages : initHoldings
  ) as HoldingsConvertedMessageType[];

  const totalInvested = useMemo(() => {
    let total = 0;

    finalHoldings?.forEach((message) => {
      const wallet = message.wallet;

      const isWalletSelected = finalWallets?.some(
        (selectedWallet) => selectedWallet.address === wallet,
      );

      if (isWalletSelected) {
        message.tokens.forEach((token) => {
          total += token.investedSol || 0;
        });
      }
    });

    return String(total);
  }, [finalWallets, finalHoldings]);
  const totalRemaining = useMemo(() => {
    let total = 0;

    finalHoldings?.forEach((message) => {
      const wallet = message.wallet;

      const isWalletSelected = finalWallets?.some(
        (selectedWallet) => selectedWallet.address === wallet,
      );

      if (isWalletSelected) {
        message.tokens.forEach((token) => {
          const currentSolPrice =
            priceMessages.find((m) => m.mint === token.token.mint)?.priceSol ||
            token.price.price_sol ||
            0;
          total += Math.max(0, token.balance * Number(currentSolPrice)) || 0;
        });
      }
    });

    return String(total);
  }, [finalWallets, finalHoldings]);

  const totalSold = useMemo(() => {
    let total = 0;

    finalHoldings?.forEach((message) => {
      const wallet = message.wallet;

      const isWalletSelected = finalWallets?.some(
        (selectedWallet) => selectedWallet.address === wallet,
      );

      if (isWalletSelected) {
        message.tokens.forEach((token) => {
          total += token.soldSol || 0;
        });
      }
    });

    return String(total);
  }, [finalWallets, finalHoldings]);
  const profitAndLoss = useMemo(() => {
    let total = 0;

    finalHoldings?.forEach((message) => {
      const wallet = message.wallet;

      const isWalletSelected = finalWallets?.some(
        (selectedWallet) => selectedWallet.address === wallet,
      );

      if (isWalletSelected) {
        message.tokens.forEach((token) => {
          const currentSolPrice =
            priceMessages.find((m) => m.mint === token.token.mint)?.priceSol ||
            token.price.price_sol;
          const prevCalc =
            token?.soldSol + token?.balance * Number(currentSolPrice);
          const pnlSol = prevCalc - token?.investedSol;

          total += pnlSol || 0;
        });
      }
    });

    return String(total);
  }, [finalWallets, finalHoldings]);
  const profitAndLossPercentage = useMemo(() => {
    let totalPnl = 0;
    let totalInvested = 0;

    finalHoldings?.forEach((message) => {
      const wallet = message.wallet;

      const isWalletSelected = finalWallets?.some(
        (selectedWallet) => selectedWallet.address === wallet,
      );

      if (isWalletSelected) {
        message.tokens.forEach((token) => {
          const currentSolPrice =
            priceMessages.find((m) => m.mint === token.token.mint)?.priceSol ||
            token.price.price_sol;
          const prevCalc =
            token?.soldSol + token?.balance * Number(currentSolPrice);
          const pnlSol = prevCalc - token?.investedSol;

          totalPnl += pnlSol || 0;
          totalInvested += token?.investedSol || 0;
        });
      }
    });

    return totalInvested ? (totalPnl / totalInvested) * 100 : 0;
  }, [finalHoldings, finalWallets]);

  const [countdown, setCountdown] = useState(0); // in seconds
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();

  const handleRefreshHoldings = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRefreshingHolding) return;
    await queryClient.invalidateQueries({ queryKey: ["init-holdings"] });

    setIsRefreshingHolding(true);
    setCountdown(30); // start from 30 seconds

    // clear existing interval if any
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start countdown interval
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setIsRefreshingHolding(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!!initHoldings || !!initWallets) {
      setIsLoading(false);
    }
  }, [initHoldings, initWallets]);

  useEffect(() => {
    const savedWallets = localStorage.getItem("selected_wallet");
    if (savedWallets) {
      setSelectedMultipleActiveWalletHoldings(JSON.parse(savedWallets));
    }
  }, []);

  const handleWalletSelection = (wallets: Wallet[]) => {
    setSelectedMultipleActiveWalletHoldings(wallets);
    localStorage.setItem("selected_wallet", JSON.stringify(wallets));
  };

  const { remainingScreenWidth } = usePopupStore();
  const shouldDesktopLayout = remainingScreenWidth >= 1000;

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center gap-x-1 rounded-[8px] border border-border bg-[#12121a]",
        shouldDesktopLayout && "md:mb-0 md:h-[50px] md:flex-row md:pl-1",
      )}
    >
      <div
        className={cn(
          "h-[57px] w-full border-border p-3 max-md:border-b",
          shouldDesktopLayout && "md:h-[46px] md:w-auto md:p-1 md:px-0",
        )}
      >
        <HoldingsWalletSelectionPopup
          shouldDesktopLayout={shouldDesktopLayout}
          isOpen={isOpenSelectWallet}
          onOpenChange={setIsOpenSelectWallet}
          finalWallets={finalWallets}
          userWalletFullList={userWalletFullList}
          handleWalletSelection={handleWalletSelection}
          setSelectedMultipleActiveWalletHoldings={
            setSelectedMultipleActiveWalletHoldings
          }
        />
      </div>

      <div className="relative flex h-full min-h-[110px] w-full flex-col-reverse items-center gap-x-0 gap-y-2 border-border p-3 md:min-h-0 md:flex-row md:gap-2 md:border-l md:p-1">
        {isLoading ? (
          <div className="absolute left-1/2 top-1/2 aspect-square size-5 flex-shrink-0 -translate-x-1/2 -translate-y-1/2 transform-gpu">
            <Image
              src="/icons/search-loading.png"
              alt="Loading Icon"
              fill
              quality={50}
              className="animate-spin object-contain"
            />
          </div>
        ) : (
          <>
            <div className="grid w-full flex-grow grid-cols-3 gap-x-2.5 px-0 md:w-auto md:p-2 md:py-1 md:pl-4 md:pr-0">
              <div className="relative col-span-1 flex h-[46px] flex-col justify-center rounded-[4px] border-r border-border bg-[#1b1b24] px-2 py-1 max-md:border md:rounded-none md:bg-transparent md:p-0">
                <span className="relative z-20 mb-1 inline-block text-xs text-fontColorSecondary">
                  Invested
                </span>
                <div className="relative z-20 mt-[-0.2rem] flex items-center gap-x-1.5">
                  <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                    <CachedImage
                      src="/icons/solana-sq.svg"
                      alt="Solana SQ Icon"
                      fill
                      quality={50}
                      className="object-contain"
                    />
                  </div>
                  <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                    {getIsStrippedHoldingPreviewData(
                      totalInvested,
                      totalRemaining,
                    )
                      ? "-"
                      : formatAmountWithoutLeadingZero(Number(totalInvested))}
                  </span>
                </div>
              </div>
              <div className="relative col-span-1 flex h-[46px] flex-col justify-center rounded-[4px] border-r border-border bg-[#1b1b24] px-2 py-1 max-md:border md:rounded-none md:bg-transparent md:p-0">
                <span className="relative z-20 mb-1 inline-block text-xs text-fontColorSecondary">
                  Remaining
                </span>
                <div className="relative z-20 mt-[-0.2rem] flex items-center gap-x-1.5">
                  <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                    <CachedImage
                      src="/icons/solana-sq.svg"
                      alt="Solana SQ Icon"
                      fill
                      quality={50}
                      className="object-contain"
                    />
                  </div>
                  <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                    {formatAmountWithoutLeadingZero(Number(totalRemaining))}
                  </span>
                </div>
              </div>
              <div className="relative col-span-1 flex h-[46px] flex-col justify-center rounded-[4px] border-border bg-[#1b1b24] px-2 py-1 max-md:border md:rounded-none md:border-r md:bg-transparent md:p-0">
                <span className="relative z-20 mb-1 inline-block text-xs text-fontColorSecondary">
                  Sold
                </span>
                <div className="relative z-20 mt-[-0.2rem] flex items-center gap-x-1.5">
                  <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                    <CachedImage
                      src="/icons/solana-sq.svg"
                      alt="Solana SQ Icon"
                      fill
                      quality={50}
                      className="object-contain"
                    />
                  </div>
                  <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                    {getIsStrippedHoldingPreviewData(
                      Number(totalSold) + Number(totalInvested),
                      totalRemaining,
                    )
                      ? "-"
                      : formatAmountWithoutLeadingZero(Number(totalSold))}
                  </span>
                </div>
              </div>
            </div>

            <div className="max-md:w-full">
              <PnLScreenshot
                title="NOVA"
                setWallets={setSelectedMultipleActiveWalletHoldings}
                wallets={finalWallets}
                isWithDialog
                profitAndLoss={profitAndLoss}
                profitAndLossPercentage={profitAndLossPercentage}
                invested={totalInvested}
                sold={totalSold}
                remaining={totalRemaining}
                handleReload={handleRefreshHoldings}
                isLoading={isRefreshingHolding}
                solPrice={solPrice}
                type="holding"
                countdown={countdown}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HoldingsWalletSelection;

interface HoldingsWalletSelectionPopupProps {
  shouldDesktopLayout: boolean;
  isOpen: boolean;
  onOpenChange: (state: boolean) => void;
  finalWallets: Wallet[];
  userWalletFullList: Wallet[];
  handleWalletSelection: (wallets: Wallet[]) => void;
  setSelectedMultipleActiveWalletHoldings: (wallets: Wallet[]) => void;
}

const HoldingsWalletSelectionPopup = ({
  shouldDesktopLayout,
  finalWallets,
  userWalletFullList,
  isOpen,
  onOpenChange,
  handleWalletSelection,
  setSelectedMultipleActiveWalletHoldings,
}: HoldingsWalletSelectionPopupProps) => {
  if (shouldDesktopLayout) {
    return (
      <Popover onOpenChange={(isOpen) => onOpenChange(isOpen)} open={isOpen}>
        <PopoverTrigger
          asChild
          // ref={buttonRef}
          className="h-full w-full cursor-pointer"
        >
          <button
            className={cn(
              "flex h-full w-full items-center gap-x-3 rounded-[8px] border border-border bg-white bg-white/[4%] px-2 transition-all duration-200 ease-out active:border-primary active:bg-primary/[6%]",
              isOpen && "border-primary bg-primary/[6%]",
              shouldDesktopLayout && "md:w-[300px] md:rounded-[4px]",
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
                        shouldDesktopLayout && "md:py-1",
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
                          shouldDesktopLayout && "md:py-1",
                        )}
                      >
                        {wallet.name}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div
              className={cn(
                "relative mb-auto ml-auto mt-auto size-5 flex-shrink-0 transition-all duration-200 ease-out",
                isOpen && "rotate-180",
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
          align="start"
          className={cn(
            "mt-[-0.8rem] rounded-[8px] border border-border bg-card py-2 pl-2 pr-1 shadow-[0_0_20px_0_#000000]",
            shouldDesktopLayout && "w-[280px]",
          )}
          // style={{ width: Math.max(buttonWidth) }}
        >
          <OverlayScrollbarsComponent
            defer
            element="div"
            className="popover__overlayscrollbar h-[240px] w-full pr-2.5"
          >
            <div className="flex w-full flex-col gap-y-1">
              <button
                onClick={() =>
                  handleWalletSelection(
                    userWalletFullList?.filter((w) => !w.archived),
                  )
                }
                className={cn(
                  "flex h-[55px] flex-shrink-0 items-center justify-between rounded-[6px] border border-transparent bg-white/[4%] px-2 py-1.5 duration-300 hover:bg-white/[8%]",
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
                    onChange={() =>
                      setSelectedMultipleActiveWalletHoldings(
                        userWalletFullList
                          ?.filter((w) => !w.archived)
                          ?.filter((w) => !w.archived),
                      )
                    }
                  />
                </div>
              </button>

              {userWalletFullList
                ?.filter((w) => !w.archived)
                ?.map((wallet, index) => {
                  const isActive = finalWallets?.find(
                    (w) => w.address === wallet.address,
                  );

                  return (
                    <button
                      key={index + wallet.address}
                      onClick={() => handleWalletSelection([wallet])}
                      className={cn(
                        "flex h-[55px] flex-shrink-0 items-center justify-between rounded-[6px] border border-transparent bg-white/[4%] px-2 py-1.5 duration-300 hover:bg-white/[8%]",
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
                    </button>
                  );
                })}
            </div>
          </OverlayScrollbarsComponent>
        </PopoverContent>
      </Popover>
    );
  }
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        <div
          className={cn(
            "flex h-full w-full items-center gap-x-3 rounded-[8px] border border-border bg-white bg-white/[4%] px-2 transition-all duration-200 ease-out active:border-primary active:bg-primary/[6%]",
            isOpen && "border-primary bg-primary/[6%]",
            // shouldDesktopLayout && "md:w-[300px] md:rounded-[4px]",
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
                      // shouldDesktopLayout && "md:py-1",
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
                        // shouldDesktopLayout && "md:py-1",
                      )}
                    >
                      {wallet.name}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
          <div
            className={cn(
              "relative mb-auto ml-auto mt-auto size-5 flex-shrink-0 transition-all duration-200 ease-out",
              isOpen && "rotate-180",
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
        </div>
      </DrawerTrigger>
      <DrawerContent className="z-[1000] bg-card p-0 shadow-[0_0_20px_0_#000000]">
        <DrawerHeader className="flex flex-row items-center justify-between space-y-0 border-b border-[#242436] px-4 py-3.5">
          <DrawerTitle className="text-fontColorPrimary">
            Select Wallet
          </DrawerTitle>
          <button
            className="flex h-6 w-6 cursor-pointer items-center justify-center bg-transparent text-transparent"
            onClick={() => onOpenChange(false)}
          >
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
        </DrawerHeader>
        <OverlayScrollbarsComponent
          defer
          element="div"
          className="popover__overlayscrollbar h-full max-h-[80dvh] w-full p-4"
        >
          <div className="flex w-full flex-col gap-y-1">
            <button
              onClick={() =>
                handleWalletSelection(
                  userWalletFullList?.filter((w) => !w.archived),
                )
              }
              className={cn(
                "flex h-[55px] flex-shrink-0 items-center justify-between rounded-[6px] border border-transparent bg-white/[4%] px-2 py-1.5 duration-300 hover:bg-white/[8%]",
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
                  onChange={() =>
                    setSelectedMultipleActiveWalletHoldings(
                      userWalletFullList
                        ?.filter((w) => !w.archived)
                        ?.filter((w) => !w.archived),
                    )
                  }
                />
              </div>
            </button>

            {userWalletFullList
              ?.filter((w) => !w.archived)
              ?.map((wallet, index) => {
                const isActive = finalWallets?.find(
                  (w) => w.address === wallet.address,
                );

                return (
                  <button
                    key={index + wallet.address}
                    onClick={() => handleWalletSelection([wallet])}
                    className={cn(
                      "flex h-[55px] flex-shrink-0 items-center justify-between rounded-[6px] border border-transparent bg-white/[4%] px-2 py-1.5 duration-300 hover:bg-white/[8%]",
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
                  </button>
                );
              })}
          </div>
        </OverlayScrollbarsComponent>
        <DrawerFooter>
          <DrawerClose asChild>
            <BaseButton variant="primary">Done</BaseButton>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
