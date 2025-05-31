"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useHoldingsSelectedWalletStore } from "@/stores/holdings/use-holdings-selected-wallet.store";
import { useUserWalletStore } from "@/stores/wallet/use-user-wallet.store";
import { motion, useAnimation } from "framer-motion";
// ######## Components 🧩 ########
import Image from "next/image";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import Separator from "./Separator";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { truncateAddress } from "@/utils/truncateAddress";
import BaseButton from "./buttons/BaseButton";
import { CachedImage } from "./CachedImage";

export default function HoldingsSetup() {
  const { userWalletFullList } = useUserWalletStore();
  const finalWallets = userWalletFullList?.filter((w) => !w.archived);
  const { selectedWalletList, toggleSelectWallet } =
    useHoldingsSelectedWalletStore();

  const controls = useAnimation();
  const handleRefreshHoldings = async () => {
    await controls.start({ rotate: 360 });
    controls.set({ rotate: 0 });
  };

  return (
    <div className="flex h-auto w-full flex-col gap-x-6 overflow-hidden rounded-[8px] border border-border bg-[#10101E] py-0 xl:h-[100px] xl:flex-row xl:items-center xl:py-4 xl:pr-4">
      <div className="flex flex-grow items-center gap-x-6 xl:flex-grow-0">
        <div className="relative aspect-[83/64] w-[83px] flex-shrink-0">
          <Image
            src="/images/holdings.png"
            alt="Holdings Image"
            fill
            quality={100}
            className="object-contain"
          />
        </div>

        <div className="-mb-2 flex h-[52px] flex-shrink-0 flex-grow flex-col justify-center gap-y-1.5 pr-3.5 xl:mb-0 xl:w-[124px] xl:gap-y-2 xl:pr-0">
          <span className="inline-block text-xs text-fontColorSecondary">
            Wallet
          </span>
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex flex-grow cursor-pointer items-center justify-between">
                <div
                  className={cn(
                    "line-clamp-1 max-w-[190px] overflow-hidden font-geistSemiBold text-[24px] text-fontColorPrimary xl:max-w-[124px]",
                    selectedWalletList.length > 1 && "-ml-[8px] xl:-ml-4",
                  )}
                >
                  {selectedWalletList.join(", ")}
                </div>
                <div className="relative -mb-0.5 -mr-1 aspect-[8/3] h-auto w-[18px] flex-shrink-0">
                  <Image
                    src="/icons/dropdown-arrow.png"
                    alt="Dropdown Arrow Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              sideOffset={12}
              className="w-[186px] rounded-[8px] border border-border bg-[#10101E] p-2 shadow-[0_0_20px_0_#000000]"
            >
              <OverlayScrollbarsComponent
                defer
                element="div"
                className="invisible__overlayscrollbar h-[178px] w-full"
              >
                <div className="flex w-full flex-col gap-y-1">
                  <button
                    onClick={() =>
                      toggleSelectWallet(
                        "All",
                        finalWallets.map((wallet) => wallet.address),
                      )
                    }
                    className="flex h-[36px] flex-shrink-0 items-center justify-between rounded-[6px] bg-white/[4%] px-2 py-1.5 duration-300 hover:bg-white/[8%]"
                  >
                    <span className="flex items-center gap-x-[4px]">
                      <div className="relative aspect-square h-4 w-4">
                        <Image
                          src="/icons/wallet.png"
                          alt="Wallet Icon"
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </div>
                      <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                        All
                      </span>
                    </span>

                    {selectedWalletList.includes("All") && (
                      <div className="relative aspect-square h-6 w-6">
                        <Image
                          src="/icons/pink-check.png"
                          alt="Pink Check Icon"
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </div>
                    )}
                  </button>

                  {finalWallets?.map((wallet, index) => {
                    const isActive = selectedWalletList.includes(
                      wallet.address,
                    );

                    return (
                      <button
                        key={index + wallet.address}
                        onClick={() =>
                          toggleSelectWallet(
                            wallet.address,
                            finalWallets.map((wallet) => wallet.address),
                          )
                        }
                        className="flex h-[36px] flex-shrink-0 items-center justify-between rounded-[6px] bg-white/[4%] px-2 py-1.5 duration-300 hover:bg-white/[8%]"
                      >
                        <span className="flex items-center gap-x-[4px]">
                          <div className="relative aspect-square h-4 w-4">
                            <Image
                              src="/icons/wallet.png"
                              alt="Wallet Icon"
                              fill
                              quality={100}
                              className="object-contain"
                            />
                          </div>
                          <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                            {truncateAddress(wallet.address)}
                          </span>
                        </span>

                        {isActive && (
                          <div className="relative aspect-square h-6 w-6">
                            <Image
                              src="/icons/pink-check.png"
                              alt="Pink Check Icon"
                              fill
                              quality={100}
                              className="object-contain"
                            />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </OverlayScrollbarsComponent>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Separator
        color="#ffffff0f"
        orientation="vertical"
        unit="fixed"
        fixedHeight={40}
        className="hidden xl:block"
      />

      {/* Desktop */}
      <div className="hidden items-center gap-x-2 xl:flex">
        <div className="relative flex items-center justify-center rounded-t-[10px] bg-gradient-to-b from-border via-border to-[#10101E] p-[1px]">
          <div className="relative flex min-w-[155px] flex-col gap-y-0.5 rounded-t-[8px] px-4 pb-3 pt-2">
            <div className="absolute left-0 top-0 z-10 h-full w-full rounded-t-[8px] bg-[#10101E]"></div>
            <div className="absolute left-0 top-0 z-20 h-full w-full rounded-t-[8px] bg-gradient-to-b from-border to-border/0"></div>

            <span className="relative z-20 inline-block text-xs text-fontColorSecondary">
              Invested
            </span>
            <div className="relative z-20 flex items-center gap-x-1">
              <div className="relative -mt-[1px] aspect-auto h-[17px] w-[15px] flex-shrink-0">
                <CachedImage
                  src="/icons/solana-sq.svg"
                  alt="Solana SQ Icon"
                  fill
                  quality={50}
                  className="object-contain"
                />
              </div>
              <span className="inline-block text-nowrap font-geistSemiBold text-base text-fontColorPrimary">
                147.72359
              </span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 z-20 h-[10px] w-full bg-gradient-to-t from-[#10101E] to-[#10101E]/0"></div>
        </div>

        <div className="relative flex items-center justify-center rounded-t-[10px] bg-gradient-to-b from-border via-border to-[#10101E] p-[1px]">
          <div className="relative flex min-w-[155px] flex-col gap-y-0.5 rounded-t-[8px] px-4 pb-3 pt-2">
            <div className="absolute left-0 top-0 z-10 h-full w-full rounded-t-[8px] bg-[#10101E]"></div>
            <div className="absolute left-0 top-0 z-20 h-full w-full rounded-t-[8px] bg-gradient-to-b from-border to-border/0"></div>

            <span className="relative z-20 inline-block text-xs text-fontColorSecondary">
              Remaining
            </span>
            <div className="relative z-20 flex items-center gap-x-1">
              <div className="relative -mt-[1px] aspect-auto h-[17px] w-[15px] flex-shrink-0">
                <CachedImage
                  src="/icons/solana-sq.svg"
                  alt="Solana SQ Icon"
                  fill
                  quality={50}
                  className="object-contain"
                />
              </div>
              <span className="inline-block text-nowrap font-geistSemiBold text-base text-fontColorPrimary">
                147.72359
              </span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 z-20 h-[10px] w-full bg-gradient-to-t from-[#10101E] to-[#10101E]/0"></div>
        </div>

        <div className="relative flex items-center justify-center rounded-t-[10px] bg-gradient-to-b from-border via-border to-[#10101E] p-[1px]">
          <div className="relative flex min-w-[155px] flex-col gap-y-0.5 rounded-t-[8px] px-4 pb-3 pt-2">
            <div className="absolute left-0 top-0 z-10 h-full w-full rounded-t-[8px] bg-[#10101E]"></div>
            <div className="absolute left-0 top-0 z-20 h-full w-full rounded-t-[8px] bg-gradient-to-b from-border to-border/0"></div>

            <span className="relative z-20 inline-block text-xs text-fontColorSecondary">
              Sold
            </span>
            <div className="relative z-20 flex items-center gap-x-1">
              <div className="relative -mt-[1px] aspect-auto h-[17px] w-[15px] flex-shrink-0">
                <CachedImage
                  src="/icons/solana-sq.svg"
                  alt="Solana SQ Icon"
                  fill
                  quality={50}
                  className="object-contain"
                />
              </div>
              <span className="inline-block text-nowrap font-geistSemiBold text-base text-fontColorPrimary">
                147.72359
              </span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 z-20 h-[10px] w-full bg-gradient-to-t from-[#10101E] to-[#10101E]/0"></div>
        </div>
      </div>

      <Separator
        color="#ffffff0f"
        orientation="vertical"
        unit="fixed"
        fixedHeight={40}
        className="hidden xl:block"
      />

      <div className="hidden h-[64px] min-w-[202px] flex-shrink-0 items-center gap-x-3 rounded-[8px] bg-success/[12%] pl-1.5 pr-3 xl:flex">
        {/* <div className="absolute left-[4px] top-[4px] h-[52px] w-1  flex-shrink-0 rounded bg-success" /> */}

        <div className="flex flex-col gap-y-0.5">
          <span className="inline-block text-nowrap text-xs text-fontColorSecondary">
            Change in P&L
          </span>
          <span className="inline-block text-nowrap font-geistSemiBold text-base text-success">
            +100.95% (+0.1458)
          </span>
        </div>
      </div>

      <Separator
        color="#ffffff0f"
        orientation="vertical"
        unit="fixed"
        fixedHeight={40}
        className="hidden xl:block"
      />

      {/* Mobile */}
      <div className="grid grid-cols-2 grid-rows-2 gap-2 p-3 xl:hidden">
        <div className="relative flex h-[60px] items-center justify-center rounded-t-[10px] bg-gradient-to-b from-border via-border to-[#10101E] p-[1px]">
          <div className="relative flex w-full flex-col gap-y-0.5 rounded-t-[8px] px-4 pb-3 pt-2">
            <div className="absolute left-0 top-0 z-10 h-full w-full rounded-t-[8px] bg-[#10101E]"></div>
            <div className="absolute left-0 top-0 z-20 h-full w-full rounded-t-[8px] bg-gradient-to-b from-border to-border/0"></div>

            <span className="relative z-20 inline-block text-xs text-fontColorSecondary">
              Invested
            </span>
            <div className="relative z-20 flex items-center gap-x-1">
              <div className="relative aspect-auto h-[14px] w-[12px] flex-shrink-0">
                <CachedImage
                  src="/icons/solana-sq.svg"
                  alt="Solana SQ Icon"
                  fill
                  quality={50}
                  className="object-contain"
                />
              </div>
              <span className="inline-block text-nowrap font-geistSemiBold text-base text-fontColorPrimary">
                147.72359
              </span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 z-20 h-[10px] w-full bg-gradient-to-t from-[#10101E] to-[#10101E]/0"></div>
        </div>

        <div className="relative flex h-[60px] items-center justify-center rounded-t-[10px] bg-gradient-to-b from-border via-border to-[#10101E] p-[1px]">
          <div className="relative flex w-full flex-col gap-y-0.5 rounded-t-[8px] px-4 pb-3 pt-2">
            <div className="absolute left-0 top-0 z-10 h-full w-full rounded-t-[8px] bg-[#10101E]"></div>
            <div className="absolute left-0 top-0 z-20 h-full w-full rounded-t-[8px] bg-gradient-to-b from-border to-border/0"></div>

            <span className="relative z-20 inline-block text-xs text-fontColorSecondary">
              Remaining
            </span>
            <div className="relative z-20 flex items-center gap-x-1">
              <div className="relative aspect-auto h-[14px] w-[12px] flex-shrink-0">
                <CachedImage
                  src="/icons/solana-sq.svg"
                  alt="Solana SQ Icon"
                  fill
                  quality={50}
                  className="object-contain"
                />
              </div>
              <span className="inline-block text-nowrap font-geistSemiBold text-base text-fontColorPrimary">
                147.72359
              </span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 z-20 h-[10px] w-full bg-gradient-to-t from-[#10101E] to-[#10101E]/0"></div>
        </div>

        <div className="relative flex h-[60px] items-center justify-center rounded-t-[10px] bg-gradient-to-b from-border via-border to-[#10101E] p-[1px]">
          <div className="relative flex w-full flex-col gap-y-0.5 rounded-t-[8px] px-4 pb-3 pt-2">
            <div className="absolute left-0 top-0 z-10 h-full w-full rounded-t-[8px] bg-[#10101E]"></div>
            <div className="absolute left-0 top-0 z-20 h-full w-full rounded-t-[8px] bg-gradient-to-b from-border to-border/0"></div>

            <span className="relative z-20 inline-block text-xs text-fontColorSecondary">
              Sold
            </span>
            <div className="relative z-20 flex items-center gap-x-1">
              <div className="relative aspect-auto h-[14px] w-[12px] flex-shrink-0">
                <CachedImage
                  src="/icons/solana-sq.svg"
                  alt="Solana SQ Icon"
                  fill
                  quality={50}
                  className="object-contain"
                />
              </div>
              <span className="inline-block text-nowrap font-geistSemiBold text-base text-fontColorPrimary">
                147.72359
              </span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 z-20 h-[10px] w-full bg-gradient-to-t from-[#10101E] to-[#10101E]/0"></div>
        </div>

        <div className="-mt-0.5 mb-auto flex h-[58px] w-full flex-shrink-0 items-center gap-x-3 overflow-hidden rounded-[8px] bg-success/[12%] pl-1.5 pr-3">
          <div className="h-[44px] w-1 flex-shrink-0 rounded-[10px] bg-success"></div>

          <div className="flex flex-col gap-y-1">
            <span className="inline-block text-nowrap text-xs text-fontColorSecondary">
              Change in P&L
            </span>
            <span className="inline-block text-nowrap font-geistSemiBold text-base text-success">
              +100.95% (+0.1458)
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-x-4 border-t border-border p-3 xl:justify-start xl:border-none xl:p-0">
        <BaseButton
          onClick={handleRefreshHoldings}
          variant="gray"
          className="h-[40px]"
          prefixIcon={
            <motion.div
              className="relative z-30 aspect-square h-5 w-5 flex-shrink-0"
              animate={controls}
              transition={{ duration: 0.5, ease: "linear" }}
            >
              <Image
                src="/icons/refresh.png"
                alt="Refresh Icon"
                fill
                quality={100}
                className="object-contain"
              />
            </motion.div>
          }
        >
          <span className="relative z-30 font-geistSemiBold text-[15px] text-fontColorPrimary">
            Refresh P&L
          </span>
        </BaseButton>

        <span className="order-1 line-clamp-1 text-xs text-fontColorSecondary xl:order-2">
          Last refreshed 17d 7h ago
        </span>
      </div>
    </div>
  );
}
