"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useEffect, useState, useRef } from "react";
import { useUserInfoStore } from "@/stores/user/use-user-info.store";
import { useRouter } from "nextjs-toploader/app";
import { AnimatePresence, motion, useSpring } from "framer-motion";
import cookies from "js-cookie";
// ######## Components 🧩 ########
import Image from "next/image";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import BaseButton from "@/components/customs/buttons/BaseButton";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { useWindowSizeStore } from "@/stores/use-window-size.store";
import { usePnlSettings } from "@/stores/use-pnl-settings";

const menuVariants = {
  closed: {
    clipPath: "circle(0% at calc(100% - 32px) 32px)",
    opacity: 0,
  },
  open: {
    clipPath: "circle(150% at calc(100% - 32px) 32px)",
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
      opacity: { duration: 0.4 },
      staggerChildren: 0.07,
      delayChildren: 0.2,
    },
  },
  exit: {
    clipPath: "circle(0% at calc(100% - 32px) 32px)",
    opacity: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 40,
      staggerChildren: 0.03,
      staggerDirection: -1,
      when: "afterChildren",
    },
  },
};

const itemVariants = {
  closed: { x: 20, opacity: 0 },
  open: { x: 0, opacity: 1 },
  exit: { x: 20, opacity: 0 },
};

const logoutVariants = {
  closed: { x: 50, opacity: 0 },
  open: { x: 0, opacity: 1 },
  exit: { x: 50, opacity: 0 },
};

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

const switchModeVariants = {
  initial: { y: -10, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.2,
      delay: 0.1,
      ease: "easeOut",
    },
  },
  exit: {
    y: -10,
    opacity: 0,
    transition: {
      duration: 0.1,
    },
  },
};

const navItems = [
  { label: "Cosmo", link: "/" },
  { label: "Trending", link: "/trending" },
  {
    label: "Wallet Tracker",
    link: "/wallet-tracker",
  },
  {
    label: "Monitor",
    link: "/twitter-monitor",
  },
  { label: "Holdings", link: "/holdings" },
  {
    label: "Points",
    link: "/points",
  },
  {
    label: "Earn",
    link: "/earn",
  },
  { label: "Referral", link: "/referral" },
  {
    label: "Wallet Manager",
    link: "/wallets",
  },
  { label: "2FA", link: "/verify-2fa" },
  {
    label: "Documentation",
    link: "https://docs.nova.trade/",
  },
  // { label: "Settings", link: "/settings" },
];

const MobileNav = React.memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userType = useUserInfoStore((state) => state.type);
  const setUserType = useUserInfoStore((state) => state.setType);

  // Spring animation for hamburger button
  const hamburgerX = useSpring(0, {
    stiffness: 300,
    damping: 20,
  });

  useEffect(() => {
    hamburgerX.set(isOpen ? 1 : 0);
  }, [isOpen]);

  const resetAllTutorialStates = useUserInfoStore(
    (state) => state.resetAllTutorialStates,
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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

    setIsInitialized(false);
    // Reset user type to Simple on logout
    window.location.replace("/login");
  };

  return (
    <div className="relative flex w-full flex-col xl:hidden">
      {/* Mobile Header */}
      <BaseButton
        onClick={() => setIsOpen(!isOpen)}
        variant="gray"
        className="size-8 2xl:hidden"
        size="short"
      >
        <div className="relative aspect-square h-4 w-4 flex-shrink-0">
          <Image
            src="/icons/mobile-menu.png"
            alt="Mobile Menu Icon"
            fill
            quality={100}
            className="object-contain"
          />
        </div>
      </BaseButton>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[8888] bg-primary/5 backdrop-blur-md"
              // variants={overlayVariants}
              initial="closed"
              animate="open"
              exit="exit"
            />

            <motion.div
              className="fixed inset-0 z-[9999] flex flex-col bg-black/95 backdrop-blur-xl"
              // variants={menuVariants}
              initial="closed"
              animate="open"
              exit="exit"
            >
              <div className="relative flex h-full flex-col">
                {/* Header */}
                <motion.div
                  variants={headerVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="flex h-16 items-center justify-between border-b border-border p-2 px-4"
                >
                  <motion.div
                    initial={{ y: -10, opacity: 0 }}
                    animate={{
                      y: 0,
                      opacity: 1,
                      transition: { delay: 0.1, duration: 0.3 },
                    }}
                    exit={{ y: -10, opacity: 0 }}
                    className="relative aspect-square h-8 w-8 flex-shrink-0"
                  >
                    <Image
                      src="/logo.png"
                      alt="Nova Logo"
                      fill
                      quality={100}
                      className="object-contain"
                    />
                  </motion.div>

                  {/* Switch Mode */}
                  <motion.div
                    variants={switchModeVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="flex w-fit items-center justify-between gap-x-4 rounded-[8px] border border-border px-3 py-2 font-geistSemiBold text-xs text-fontColorSecondary"
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
                          setUserType(
                            userType === "Simple" ? "Advanced" : "Simple",
                          )
                        }
                      />
                    </motion.div>
                    <motion.span
                      animate={{
                        color: userType === "Advanced" ? "#FFFFFF" : "#666666",
                        transition: { duration: 0.3 },
                      }}
                    >
                      ADVANCE
                    </motion.span>
                  </motion.div>

                  <motion.button
                    onClick={() => setIsOpen(false)}
                    className="size-5"
                    whileHover={{
                      rotate: 90,
                      scale: 1.1,
                      transition: { duration: 0.2 },
                    }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <div className="relative aspect-square size-6 flex-shrink-0">
                      <Image
                        src="/icons/close.png"
                        alt="Close Icon"
                        fill
                        quality={100}
                        className="object-contain"
                      />
                    </div>
                  </motion.button>
                </motion.div>

                {/* Navigation Items */}
                <nav className="flex flex-col gap-2 px-3.5 pt-4">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      onClick={() => setIsOpen(false)}
                    >
                      <Link
                        href={item.link}
                        prefetch
                        target={
                          item.link.startsWith("http") ? "_blank" : "_self"
                        }
                        className="group flex h-[40px] w-full items-center gap-x-2 rounded-[8px] bg-white/[4%] px-4 py-3 transition-all duration-300 ease-out hover:bg-white/10"
                      >
                        <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                          {item.label}
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                <div className="mt-auto flex w-full items-center justify-end p-6">
                  <motion.button
                    variants={logoutVariants}
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
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
});

const MemoizedMobileNav = React.memo(() => {
  const width = useWindowSizeStore((state) => state.width);

  return width! < 1280 ? <MobileNav /> : null;
});

MobileNav.displayName = "MobileNav";
MemoizedMobileNav.displayName = "MemoizedMobileNav";

export default MemoizedMobileNav;
