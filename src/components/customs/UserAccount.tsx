"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useState, useRef, useEffect } from "react";
import { useUserInfoStore } from "@/stores/user/use-user-info.store";
import cookies from "js-cookie";
import { usePnlSettings } from "@/stores/use-pnl-settings";

// ######## Components 🧩 ########
import Image from "next/image";
import BaseButton from "@/components/customs/buttons/BaseButton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";

// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";

const UserAccount = () => {
  const { userName, profilePicture } = usePnlSettings();
  const [openMenuPopover, setOpenMenuPopover] = useState<boolean>(false);
  const setIsInitialized = usePnlSettings((s) => s.setIsInitialized);

  const resetAllTutorialStates = useUserInfoStore(
    (state) => state.resetAllTutorialStates,
  );

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleLogout = () => {
    timeoutRef.current = setTimeout(resetAllTutorialStates, 1000);
    cookies.remove("_nova_session");
    cookies.remove("_twitter_api_key");
    cookies.remove("_truthsocial_api_key");
    cookies.remove("isNew");
    cookies.remove("cosmo-hidden-tokens");
    cookies.remove("cosmo-blacklisted-developers");
    localStorage.removeItem("loginStep");
    localStorage.removeItem("authToken");
    localStorage.removeItem("quick-buy-amount");
    localStorage.removeItem("quick-buy-settings");
    localStorage.removeItem("wallet-addresses-filter-storage");
    localStorage.removeItem("cosmo-hidden-tokens");
    localStorage.removeItem("cosmo-blacklisted-developers");
    localStorage.removeItem("selected_wallet_pnl_tracker");

    // set is initialized to false for reset the pnl tracker when logged out
    setIsInitialized(false);
    window.location.replace("/login");
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  return (
    <Popover open={openMenuPopover} onOpenChange={setOpenMenuPopover}>
      <PopoverTrigger asChild>
        <BaseButton
          variant="gray"
          className="my-account hidden h-8 gap-x-2 p-1 xl:flex"
        >
          <div className="relative aspect-square h-6 w-6 flex-shrink-0">
            {profilePicture ? (
              <Image
                src={profilePicture}
                alt="User Profile Picture"
                fill
                quality={100}
                className="rounded-full object-contain"
              />
            ) : (
              <Image
                src="/icons/user-circle.png"
                alt="User Circle Icon"
                fill
                quality={100}
                className="object-contain"
              />
            )}
          </div>
          <span className="inline-block text-nowrap font-geistSemiBold text-sm font-semibold text-fontColorPrimary">
            {userName ? userName : "My Account"}
          </span>
          <div className="relative aspect-square h-6 w-6">
            <Image
              src="/icons/white-dropdown-arrow.png"
              alt="White Dropdown Arrow Icon"
              fill
              quality={100}
              className={cn(
                "object-contain duration-300",
                openMenuPopover ? "rotate-180" : "rotate-0",
              )}
            />
          </div>
        </BaseButton>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={12}
        className="gb__white__popover w-[240px] rounded-[8px] border border-border bg-card p-0 shadow-[0_0_20px_0_#000000]"
      >
        <div className="flex w-full flex-col gap-y-1.5 p-2">
          <Link
            href="/wallets"
            onClick={() => setOpenMenuPopover(false)}
            prefetch
            className="group flex h-[40px] w-full items-center gap-x-2 rounded-[8px] bg-white/[4%] px-4 py-3 transition-all duration-300 ease-out hover:bg-white/10"
          >
            <div className="relative aspect-square h-4 w-4 flex-shrink-0">
              <Image
                src="/icons/profile/wallet.png"
                alt="Wallet Icon"
                fill
                quality={100}
                className="object-contain duration-300 group-hover:scale-125"
              />
            </div>
            <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
              Wallet Manager
            </span>
          </Link>

          <Link
            href="/verify-2fa"
            onClick={() => setOpenMenuPopover(false)}
            prefetch
            className="group flex h-[40px] w-full items-center gap-x-2 rounded-[8px] bg-white/[4%] px-4 py-3 transition-all duration-300 ease-out hover:bg-white/10"
          >
            <div className="relative aspect-square h-4 w-4 flex-shrink-0">
              <Image
                src="/icons/profile/two-factor-authentication.png"
                alt="2FA Icon"
                fill
                quality={100}
                className="object-contain duration-300 group-hover:scale-125"
              />
            </div>
            <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
              2FA
            </span>
          </Link>

          <Link
            href="https://docs.nova.trade/"
            onClick={() => setOpenMenuPopover(false)}
            target="_blank"
            className="group flex h-[40px] w-full items-center gap-x-2 rounded-[8px] bg-white/[4%] px-4 py-3 transition-all duration-300 ease-out hover:bg-white/10"
          >
            <div className="relative aspect-square h-4 w-4 flex-shrink-0">
              <Image
                src="/icons/profile/documentation.png"
                alt="Documentation Icon"
                fill
                quality={100}
                className="object-contain duration-300 group-hover:scale-125"
              />
            </div>
            <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
              Documentation
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className="group flex h-[40px] w-full items-center gap-x-2 rounded-[8px] bg-white/[4%] py-3 pl-[18px] pr-4 transition-all duration-300 ease-out hover:bg-white/10"
          >
            <div className="relative aspect-square h-4 w-4 flex-shrink-0">
              <Image
                src="/icons/profile/logout.png"
                alt="Logout Icon"
                fill
                quality={100}
                className="object-contain duration-300 group-hover:scale-125"
              />
            </div>
            <span className="inline-block text-nowrap font-geistSemiBold text-sm text-destructive">
              Logout
            </span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default UserAccount;
