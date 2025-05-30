"use client";
import Image from "next/image";
import cookies from "js-cookie";
import { useUserInfoStore } from "@/stores/user/use-user-info.store";
import { cn } from "@/libraries/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { useEffect, useRef, useState } from "react";
import FeeSummary from "../FeeSummary";
import QuickBuySettings from "./QuickBuySettings";
import QuickSellSettings from "./QuickSellSettings";
import BuySniperSettings from "./BuySniperSettings";
import SellSniperSettings from "./SellSniperSettings";
import CustomizeSettings from "./CustomizeSettings";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import Link from "next/link";
import { usePnlSettings } from "@/stores/use-pnl-settings";

const switchModeVariants = {
  initial: { y: -10, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.2, delay: 0.1, ease: "easeOut" },
  },
  exit: {
    y: -10,
    opacity: 0,
    transition: { duration: 0.1 },
  },
};

interface Menu {
  icon: string;
  grayscale?: boolean;
  description: string;
  label: string;
  href?: string;
  component?: React.ComponentType<any>;
}

// Static config for menu items
const settingMenus = [
  // {
  //   icon: "/icons/user-circle.png",
  //   label: "Account",
  //   description: "Your account info",
  //   component: QuickBuySettings,
  // },
  // {
  //   icon: "/icons/regions.svg",
  //   label: "Regions",
  //   grayscale: true,
  //   description: "Change Region",
  // },
  {
    icon: "/icons/profile/wallet.png",
    label: "Wallet Manager",
    description: "Wallet Manager",
    href: "/wallets",
  },
  {
    icon: "/icons/profile/two-factor-authentication.png",
    label: "2FA",
    description: "2FA Authentication",
    href: "/verify-2fa",
  },
  {
    icon: "/icons/paper.svg",
    label: "Documentation",
    description: "Nova Documentation",
    href: "https://docs.nova.trade/",
  },
];

const tradeMenus = [
  {
    icon: "/icons/quickbuy.svg",
    label: "Quick Buy",
    description: "Customize trading presets up to 5 different settings.",
    component: QuickBuySettings,
  },
  {
    icon: "/icons/quicksell.svg",
    label: "Quick Sell",
    description: "Customize trading presets up to 5 different settings.",
    component: QuickSellSettings,
  },
  {
    icon: "/icons/buy-sniper.svg",
    label: "Buy Sniper",
    description: "Customize trading presets up to 5 different settings.",
    component: BuySniperSettings,
  },
  {
    icon: "/icons/sell-sniper.svg",
    label: "Sell Sniper",
    description: "Customize trading presets up to 5 different settings.",
    component: SellSniperSettings,
  },
  {
    icon: "/icons/customize.svg",
    label: "Customize",
    description:
      "Personalize the Cosmo buy button and adjust its size using the options below",
    component: CustomizeSettings,
  },
];

function SettingsClient() {
  const { profilePicture, userName } = usePnlSettings();
  const userType = useUserInfoStore((state) => state.type);
  const setUserType = useUserInfoStore((state) => state.setType);
  const resetAllTutorialStates = useUserInfoStore(
    (state) => state.resetAllTutorialStates,
  );

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const renderMenuItems = (items: Menu[]) =>
    items.map(({ href, icon, description, component, label, grayscale }) => (
      <TradeSettingItem
        key={label}
        href={href}
        icon={icon}
        label={label}
        grayscale={grayscale}
        description={description}
        Component={component!}
      />
    ));

  const setIsInitialized = usePnlSettings((s) => s.setIsInitialized);
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

    setIsInitialized(false); // Reset PNL tracker state
    window.location.replace("/login");
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div className="mb-14 w-full text-white">
        {/* Profile + Wallet */}
        <div className="flex flex-col items-center justify-center gap-6 bg-white/[4%] p-4 py-8">
          <div className="space-y-3 text-center">
            <div className="relative mx-auto aspect-square size-[74px] overflow-hidden rounded-full">
              <Image
                src={
                  profilePicture
                    ? profilePicture
                    : "/icons/user-circle-thin.svg"
                }
                alt="User"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="font-geistSemiBold text-2xl">
                {userName ? userName : "My Account"}
              </div>
              {/*   <div className="text-sm text-fontColorSecondary"> */}
              {/*     ibra.cadabra@gmail.com */}
              {/*   </div> */}
            </div>
          </div>
        </div>

        {/* Setting Menu */}
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between font-geistSemiBold text-sm text-fontColorSecondary">
            <span>SETTINGS</span>
            <button
              onClick={handleLogout}
              className="flex w-fit items-center gap-x-2 rounded-[8px]"
            >
              <div className="relative aspect-square h-5 w-5 flex-shrink-0">
                <Image
                  src="/icons/profile/logout.png"
                  alt="Logout Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </div>
              <span className="inline-block text-nowrap font-geistSemiBold text-sm text-destructive">
                Logout
              </span>
            </button>
          </div>
          <div className="rounded-xl bg-white/[4%] p-1">
            {renderMenuItems(settingMenus)}
          </div>
        </div>

        {/* Trade Settings Toggle */}
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between font-geistSemiBold text-sm text-fontColorSecondary">
            <span>TRADE SETTINGS</span>
            {/* <motion.div
              variants={switchModeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex w-fit items-center justify-between gap-x-4 rounded-[8px] border border-border px-3 py-2 text-xs text-fontColorSecondary"
            >
              <motion.span
                animate={{
                  color: userType === "Simple" ? "#FFFFFF" : "#666666",
                  transition: { duration: 0.3 },
                }}
              >
                SIMPLE
              </motion.span>
              <motion.div
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
              >
                <Switch
                  checked={userType === "Advanced"}
                  onCheckedChange={() =>
                    setUserType(userType === "Simple" ? "Advanced" : "Simple")
                  }
                />
              </motion.div>
              <motion.span
                animate={{
                  color: userType === "Advanced" ? "#DF74FF" : "#666666",
                  transition: { duration: 0.3 },
                }}
              >
                ADVANCE
              </motion.span>
            </motion.div> */}
          </div>

          {/* Trade Menu */}
          <div className="rounded-xl bg-white/[4%] p-1">
            {renderMenuItems(tradeMenus)}
          </div>
        </div>
      </div>
    </>
  );
}

export default SettingsClient;

const overlayVariants = {
  closed: { opacity: 0 },
  open: {
    opacity: 1,
    transition: { duration: 0.4 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3 },
  },
};

const menuVariants = {
  closed: { x: "100%", opacity: 0 },
  open: {
    x: "0%",
    opacity: 1,
    transition: { type: "tween", duration: 0.3 },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: { type: "tween", duration: 0.2 },
  },
};

const headerVariants = {
  initial: { y: -20, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  exit: {
    y: -20,
    opacity: 0,
    transition: {
      duration: 0.3,
    },
  },
};
const TradeSettingItem = ({
  href,
  icon,
  label,
  description,
  grayscale,
  Component,
}: {
  href?: string;
  icon: string;
  label: string;
  description: string;
  grayscale?: boolean;
  Component: React.ComponentType<any>;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerContent = (
    <>
      <Image
        src={icon}
        alt={label}
        width={24}
        height={24}
        className={cn({ grayscale })}
      />
      <span className="w-full text-left font-geistSemiBold text-base text-fontColorPrimary">
        {label}
      </span>
      <div className="relative aspect-square h-6 w-6">
        <Image
          src="/icons/white-dropdown-arrow.png"
          alt="Chevron"
          fill
          unoptimized
          quality={100}
          className="-rotate-90 object-contain"
        />
      </div>
    </>
  );
  return (
    <>
      {href ? (
        <Link
          href={href}
          target={href.startsWith("http") ? "_blank" : "_self"}
          className="flex w-full items-center gap-4 rounded-[8px] p-4 pr-3 hover:bg-[#17171F]"
        >
          {triggerContent}
        </Link>
      ) : (
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex w-full items-center gap-4 rounded-[8px] p-4 pr-3 hover:bg-[#17171F]"
        >
          {triggerContent}
        </button>
      )}
      {label === "Customize" ? (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerContent className="z-[1000] bg-card p-0 shadow-[0_0_20px_0_#000000]">
            <DrawerHeader className="flex flex-row items-center justify-between space-y-0 border-b border-[#242436] px-4 py-3.5">
              <DrawerTitle className="text-fontColorPrimary">
                Customize
              </DrawerTitle>
              <DrawerClose>
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
              </DrawerClose>
            </DrawerHeader>
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-[16px] py-[80px]">
              <Image
                src="/images/only-on-desktop.png"
                alt="Only Available on Desktop"
                width={180}
                height={120}
                className="mb-4"
              />
              <h3 className="text-center font-geistSemiBold text-2xl text-fontColorPrimary">
                Only Available on Desktop
              </h3>
              <p className="text-md text-center font-geistRegular text-fontColorSecondary">
                This feature is currently optimized for desktop use. Please
                switch to a desktop device for the best experience.
              </p>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-[8888] bg-primary/5 backdrop-blur-md"
                variants={overlayVariants}
                initial="closed"
                animate="open"
                exit="exit"
              />

              <motion.div
                className="fixed inset-0 z-[9999] flex flex-col bg-card backdrop-blur-xl"
                variants={menuVariants}
                initial="closed"
                animate="open"
                exit="exit"
              >
                {/* Header */}
                <div className="border-b border-border">
                  <div className="flex h-12 items-center justify-between p-2 px-4">
                    <button onClick={() => setIsOpen(false)}>
                      <div className="relative aspect-square size-3.5 flex-shrink-0">
                        <Image
                          src="/icons/left-arrow.svg"
                          alt="Back Icon"
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </div>
                    </button>
                  </div>
                  {/* <FeeSummary variant="header" /> */}
                </div>

                <div className="nova-scroller hide relative flex h-full flex-col">
                  <div className="flex flex-col gap-1 p-4 pt-2">
                    <h3 className="text-nowrap font-geistSemiBold text-lg text-fontColorPrimary">
                      {label}
                    </h3>

                    <p className="w-full whitespace-normal text-sm text-fontColorSecondary">
                      {description}
                    </p>
                  </div>
                  <Component />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}
    </>
  );
};
