"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useTwitterMonitorModalFullscreenStore } from "@/stores/footer/use-twitter-monitor-modal-fullscreen.store";
import { useAPIEndpointBasedOnRegionStore } from "@/stores/setting/use-api-endpoint-based-on-region.store";
import { usePnlTrackerFooterData } from "@/hooks/use-pnl-tracker-footer-data";
import React, { useEffect, useMemo, useState } from "react";
import cookies from "js-cookie";
// ######## Components 🧩 ########
import Separator from "@/components/customs/Separator";
import FooterModal from "@/components/customs/modals/FooterModal";
import AlertsModalContent from "@/components/customs/modals/contents/footer/AlertsModalContent";
import SniperModalContent from "@/components/customs/modals/contents/footer/SniperModalContent";
import WalletTrackerModalContent from "@/components/customs/modals/contents/footer/WalletTrackerModalContent";
import TwitterMonitorModalContent from "@/components/customs/modals/contents/footer/twitter/TwitterMonitorModalContent";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";

const PnLTrackerModal = dynamic(
  () =>
    import(
      "@/components/customs/modals/contents/footer/pnl-tracker/PnLTrackerModal"
    ),
  {
    ssr: false,
  },
);
const SocialLinkButton = dynamic(
  () => import("@/components/customs/buttons/SocialLinkButton"),
  {
    ssr: false,
  },
);
const SettingsPopUp = dynamic(
  () => import("@/components/customs/setting/SettingsPopUp"),
  {
    ssr: false,
  },
);
// ######## Utils & Helpers 🤝 ########
import { Footer as FooterCount, getFooterData } from "@/apis/rest/footer";
import { cn } from "@/libraries/utils";
import { useFooterStore } from "@/stores/footer/use-footer.store";
import { useSettingStore } from "@/stores/footer/use-setting.store";
import { useSniperFooterStore } from "@/stores/footer/use-sniper-footer.store";
import { usePopupStore } from "@/stores/use-popup-state";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { fetchResolveSymbol } from "@/apis/rest/trading-view";
import { SOLANA_ADDRESS_REGEX } from "@/constants/regex";
import { useCopyAddress } from "@/stores/use-copy-address";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useWindowSizeStore } from "@/stores/use-window-size.store";
import { usePnlSettings } from "@/stores/use-pnl-settings";
import FeeSummary from "@/components/customs/FeeSummary";

const rightFooterLinks = {
  guide: {
    label: "Guide",
    href: "#",
  },
  support: {
    label: "Support",
    href: "#",
  },
  socials: {
    guide: {
      iconURL: "/icons/support.svg",
      href: "https://docs.nova.trade/",
    },
    x: {
      iconURL: "/icons/x.svg",
      href: "https://x.com/TradeOnNova",
    },
  },
};

type FooterProps = {
  variant?: "fixed" | "relative";
};

const BASE_CONTENT_CLASSNAME =
  "w-full max-md:w-screen h-[90dvh] md:max-w-[1000px] flex flex-col h-[calc(80%-42.8px)] md:max-h-[595px] m-0 md:bottom-[50px] bottom-11";
export default function Footer({ variant = "fixed" }: FooterProps) {
  const setDetailCopied = useCopyAddress((state) => state.setDetailCopied);
  const region = useAPIEndpointBasedOnRegionStore(
    (state) => state.selectedRegion,
  );
  const setRegion = useAPIEndpointBasedOnRegionStore(
    (state) => state.setRegion,
  );

  // Twitter Monitor WS Configuration 🛜 (GLOBAL)

  // Modal Configuration ✨
  const [openSniperModal, setOpenSniperModal] = useState<boolean>(false);
  const [openLimitOrdersModal, setOpenLimitOrdersModal] =
    useState<boolean>(false);
  const [openCopyTradingModal, setOpenCopyTradingModal] =
    useState<boolean>(false);
  const [openAFKModal, setOpenAFKModal] = useState<boolean>(false);
  const [openAlertsModal, setOpenAlertsModal] = useState<boolean>(false);

  const { twitterMonitorModalFullscreen, setTwitterMonitorModalFullscreen } =
    useTwitterMonitorModalFullscreenStore();
  const { tokenInfoState: sniperState } = useSniperFooterStore();
  const { isOpen: isOpenSettings, setIsOpen: setIsOpenSettings } =
    useSettingStore();
  const { isOpen: openPnLModal, setIsOpen: setOpenPnLModal } = usePnlSettings();

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const message =
        typeof event.error === "string"
          ? event.error
          : event.error instanceof Error
            ? event.error.message
            : "";

      if (
        message.includes("Maximum update depth exceeded") ||
        message.includes("#185") ||
        message.includes("#301") ||
        message.includes("Minified React error")
      ) {
        console.warn(
          "App Crash | Maximum update depth exceeded error detected 🔴",
          {
            message,
          },
        );
        window.location.reload();
      }
    };

    window.addEventListener("error", handleError);

    return () => {
      window.removeEventListener("error", handleError);
    };
  }, []);

  useEffect(() => {
    if (sniperState) {
      setOpenSniperModal(true);
    }
  }, [sniperState]);

  // Popover Configuration ✨
  const [openMenuPopover, setOpenMenuPopover] = useState<boolean>(false);
  const [prevActiveModal, setPrevActiveModal] = useState<
    | "Sniper"
    | "Limit Orders"
    | "Copy Trading"
    | "Wallet Tracker"
    | "Monitor"
    | "AFK"
    | "Alerts"
  >("Sniper");
  const footerMessage = useFooterStore((state) => state.message);
  const setFooterMessage = useFooterStore((state) => state.setMessage);

  const { popups, togglePopup, setPopupState } = usePopupStore();
  const twitterPopup = popups.find((p) => p.name === "twitter");
  const walletTrackerPopup = popups.find((p) => p.name === "wallet_tracker");
  if (!twitterPopup || !walletTrackerPopup) throw new Error("Popups not found");

  const { data, isLoading } = useQuery({
    queryKey: ["footer"],
    queryFn: async () => {
      const res = await getFooterData();
      if (res) {
        setFooterMessage({
          ...res,
          timestamp: Math.floor(Date.now() / 1000),
        });
      }
      return res;
    },
  });

  const finalFooterData = useMemo(() => {
    if (data && footerMessage) {
      if (data!.timestamp > footerMessage!.timestamp) {
        // console.log("FOOTER MESSAGE 🔔 - FETCH 🔴: ", {
        //   data,
        //   footerMessage,
        // });

        return data;
      } else {
        // console.log("FOOTER MESSAGE 🔔 - STREAM 🟢: ", {
        //   data,
        //   footerMessage,
        // });

        return footerMessage;
      }
    } else if (data && !footerMessage) {
      // console.log("FOOTER MESSAGE 🔔 - INITIAL 🔴: ", {
      //   data,
      //   footerMessage,
      // });

      return data;
    }
  }, [data, footerMessage, isLoading]);

  // Helper
  const closeAllModals = () => {
    setOpenSniperModal(false);
    setOpenLimitOrdersModal(false);
    setOpenCopyTradingModal(false);
    if (walletTrackerPopup.mode === "footer") {
      setPopupState(walletTrackerPopup.name, (p) => ({ ...p, isOpen: false }));
    }
    if (twitterPopup.mode === "footer") {
      setPopupState(twitterPopup.name, (p) => ({ ...p, isOpen: false }));
    }
    setOpenAFKModal(false);
    setOpenAlertsModal(false);
  };

  const handleToggleOpenSniperModal = (openSniperModal: boolean) => {
    if (!openSniperModal) closeAllModals();
    setPrevActiveModal("Sniper");
    setOpenMenuPopover(false);
    setOpenSniperModal((prev) => !prev);
  };

  const handleToggleOpenLimitOrdersModal = () => {
    if (!openLimitOrdersModal) closeAllModals();
    setPrevActiveModal("Limit Orders");
    setOpenMenuPopover(false);
    setOpenLimitOrdersModal((prev) => !prev);
  };

  const handleToggleOpenWalletTrackerModal = () => {
    if (!walletTrackerPopup.isOpen) closeAllModals();
    setPrevActiveModal("Wallet Tracker");
    setOpenMenuPopover(false);
    togglePopup(walletTrackerPopup.name);
  };

  const handleToggleOpenTwitterMonitorModal = () => {
    if (!twitterPopup.isOpen) closeAllModals();
    setPrevActiveModal("Monitor");
    setOpenMenuPopover(false);
    togglePopup(twitterPopup.name);
    if (twitterMonitorModalFullscreen) {
      setTwitterMonitorModalFullscreen(false);
    }
  };

  const handleToggleOpenAFKModal = () => {
    if (!openAFKModal) closeAllModals();
    setPrevActiveModal("AFK");
    setOpenMenuPopover(false);
    setOpenAFKModal((prev) => !prev);
  };

  const handleToggleOpenAlertsModal = (openAlertsModal: boolean) => {
    if (!openAlertsModal) closeAllModals();
    setPrevActiveModal("Alerts");
    setOpenMenuPopover(false);
    setOpenAlertsModal((prev) => !prev);
  };

  const handleToggleOpenPnLModal = (openPnLModal: boolean) => {
    setOpenPnLModal(!openPnLModal);
  };

  const width = useWindowSizeStore((state) => state.width);

  useEffect(() => {
    if (isOpenSettings && width! < 920) {
      closeAllModals();
    }
  }, [isOpenSettings]);

  useEffect(() => {
    const isAnyModalOpen =
      openSniperModal ||
      openLimitOrdersModal ||
      openCopyTradingModal ||
      (walletTrackerPopup.isOpen && walletTrackerPopup.mode === "popup") ||
      (twitterPopup.isOpen && twitterPopup.mode === "popup") ||
      openAFKModal ||
      openAlertsModal;

    document.body.style.overflow = isAnyModalOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [
    openSniperModal,
    openLimitOrdersModal,
    openCopyTradingModal,
    walletTrackerPopup.isOpen,
    twitterPopup.isOpen,
    openAFKModal,
  ]);

  const MENU = useMemo(
    () => [
      {
        name: "Sniper",
        icon: "/icons/footer/sniper.svg",
        modal: openSniperModal,
        toggleModal: () => handleToggleOpenSniperModal(openSniperModal),
        content: (
          <SniperModalContent
            toggleModal={() => handleToggleOpenSniperModal(openSniperModal)}
          />
        ),
        contentClassName: BASE_CONTENT_CLASSNAME,
        count: finalFooterData?.sniper?.isRunning
          ? undefined
          : finalFooterData?.sniper?.count,
        loading: finalFooterData?.sniper?.isRunning,
        isComingSoon: false,
      },
      {
        name: "Wallet Tracker",
        icon: "/icons/footer/wallet-tracker.svg",
        modal:
          walletTrackerPopup.mode === "footer" && walletTrackerPopup.isOpen,
        toggleModal: handleToggleOpenWalletTrackerModal,
        content: (
          <WalletTrackerModalContent
            toggleModal={handleToggleOpenWalletTrackerModal}
          />
        ),
        contentClassName: cn(BASE_CONTENT_CLASSNAME, "md:max-w-[1000px]"),
        count: finalFooterData?.walletTracker,
      },
      {
        name: "Monitor",
        icon: "/icons/footer/monitoring.svg",
        modal: twitterPopup.mode === "footer" && twitterPopup.isOpen,
        toggleModal: handleToggleOpenTwitterMonitorModal,
        content: <TwitterMonitorModalContent />,
        contentClassName: cn(
          "flex flex-col w-full md:bottom-[50px] bottom-0 z-[120]",
          twitterMonitorModalFullscreen
            ? "max-w-[calc(100%-16px)] md:border-2 h-[calc(100%-56px)]"
            : "w-full md:max-w-[375px] h-[90vh] md:h-[560px]",
        ),
        // w-full max-md:w-screen h-[90vh] md:max-w-[900px] flex flex-col md:h-[595px] m-0 md:bottom-[50px] bottom-11
      },
      {
        name: "Alerts",
        icon: "/icons/footer/afk.svg",
        modal: openAlertsModal,
        toggleModal: () => handleToggleOpenAlertsModal(openAlertsModal),
        content: (
          <AlertsModalContent
            toggleModal={() => handleToggleOpenSniperModal(openSniperModal)}
          />
        ),
        contentClassName: BASE_CONTENT_CLASSNAME,
        count: finalFooterData?.alerts,
        isComingSoon: false,
      },
      {
        name: "P&L Tracker",
        icon: "/icons/footer/trend.svg",
        modal: false,
        toggleModal: () => handleToggleOpenPnLModal(openPnLModal),
        content: <></>,
        contentClassName: "",
        isComingSoon: false,
      },
    ],
    [
      // Dependencies
      openSniperModal,
      walletTrackerPopup.isOpen,
      twitterPopup.isOpen,
      openAlertsModal,
      openLimitOrdersModal,
      openAFKModal,
      handleToggleOpenSniperModal,
      handleToggleOpenWalletTrackerModal,
      handleToggleOpenTwitterMonitorModal,
      handleToggleOpenAlertsModal,
      handleToggleOpenLimitOrdersModal,
      handleToggleOpenAFKModal,
      handleToggleOpenPnLModal,
      twitterMonitorModalFullscreen,
      BASE_CONTENT_CLASSNAME,
      finalFooterData,
      data,
      footerMessage?.walletTracker,
      data?.walletTracker,
      isLoading,
    ],
  );

  useEffect(() => {
    // console.log("Setting up clipboard monitoring");
    const isFirefox = navigator.userAgent.includes("Firefox");

    if (!isFirefox) {
      // Check permissions
      if (navigator.permissions) {
        navigator.permissions
          .query({ name: "clipboard-read" as PermissionName })
          .then((result) => {
            // console.log("Clipboard permission status:", result.state);
          })
          .catch((err) => console.warn("Permission check failed:", err));
      }

      let previousClipboardContent = "";

      const checkClipboardInterval = setInterval(async () => {
        try {
          // This will only work when the permission is granted
          const clipboardText = await navigator.clipboard.readText();

          // Only process if the content is new (to avoid processing the same content repeatedly)
          if (clipboardText !== previousClipboardContent) {
            // console.log("New clipboard content detected:", clipboardText);
            previousClipboardContent = clipboardText;

            if (SOLANA_ADDRESS_REGEX.test(clipboardText)) {
              // console.log("Valid token address found!");
              fetchResolveSymbol(clipboardText)
                .then((response) => {
                  // console.log("Token data fetched:", response);
                  const { symbol, name, image } = response;
                  if (
                    symbol &&
                    symbol !== "N/A" &&
                    name &&
                    name !== "N/A" &&
                    image &&
                    image !== "N/A"
                  ) {
                    setDetailCopied({ ...response, mint: clipboardText });
                  }
                })
                .catch((err) => console.warn("Token data fetch failed:", err));
            }
          }
        } catch (err) {
          // Silent fail - don't flood console with errors when permissions aren't available
        }
      }, 100);

      return () => {
        clearInterval(checkClipboardInterval);
      };
    }
  }, []);

  const handleRegionChange = (newRegion: "EU" | "US" | "ASIA") => {
    /* console.log("REGION CHANGED 🌍") */;
    setRegion(newRegion);
    cookies.set("_api_region", newRegion);

    window.location.reload();
  };

  const {
    solPrice,
    totalStoredBalance,
    totalBalance,
    totalProfitAndLoss,
    totalProfitAndLossPercentage,
  } = usePnlTrackerFooterData();

  return (
    <>
      {/* <div className="fixed right-3 top-3 z-[200000] flex flex-col border border-white/30 bg-black/80 p-2 text-white backdrop-blur-md">
        <h3 className="font-geistSemiBold text-xl">PNL Tracker Debug 🖖</h3>

        <div className="flex flex-col text-lg text-white">
          <span>SOL PRICE: {solPrice}</span>
          <span>TOTAL STORED BALANCE: {totalStoredBalance}</span>
          <span>TOTAL CURRENT BALANCE: {totalBalance}</span>
          <span>RAW PNL: {totalBalance - totalStoredBalance}</span>

          <span className="my-2 block h-px w-full bg-white"></span>
          <span>TOTAL P&L: {totalProfitAndLoss}</span>
          <span>TOTAL P&L PERCENTAGE: {totalProfitAndLossPercentage}</span>
        </div>
      </div> */}
      <footer
        className={cn(
          "z-[150] hidden h-auto w-full border-t border-border bg-[#080811] xl:flex",
          variant === "fixed" ? "fixed bottom-[-1px] left-0" : "relative",
          isOpenSettings || (openPnLModal && "z-[1000]"),
        )}
      >
        <div className="flex h-[42px] w-full items-center justify-between px-2 lg:px-4">
          {/* Desktop (trigger) + modal */}
          <nav className="hidden items-center justify-start gap-x-1 lg:flex">
            {MENU.map((item, index) => (
              <React.Fragment key={index}>
                <FooterModal
                  modalState={item.modal}
                  toggleModal={item.isComingSoon ? () => {} : item.toggleModal}
                  layer={1}
                  responsiveWidthAt={920}
                  isComingSoon={item.isComingSoon || false}
                  triggerChildren={
                    <div
                      id={
                        item.name?.toLowerCase()?.replace(" ", "-") +
                        (item.name == "Sniper" ? "-task" : "")
                      }
                      onClick={item.isComingSoon ? () => {} : item.toggleModal}
                      className={cn(
                        "group flex flex-shrink-0 cursor-pointer items-center gap-x-2 rounded-[8px] px-3 py-1 tracking-normal duration-300 ease-out hover:bg-white/[8%] max-lg:hidden",
                        item.modal && "bg-white/[8%]",
                        item.name === "P&L Tracker" &&
                          openPnLModal &&
                          "bg-white/[8%]",
                      )}
                    >
                      <div
                        className={cn(
                          "relative aspect-square h-4 w-4 flex-shrink-0 duration-300",
                          item.modal &&
                            "brightness-[5] group-hover:brightness-[5]",
                          !item.isComingSoon && "group-hover:brightness-200",
                          item.name === "Monitor" &&
                            twitterPopup.isOpen &&
                            "brightness-[5] group-hover:brightness-[5]",
                          item.name === "Wallet Tracker" &&
                            walletTrackerPopup.isOpen &&
                            "brightness-[5] group-hover:brightness-[5]",
                          item.name === "P&L Tracker" &&
                            openPnLModal &&
                            "brightness-[5] group-hover:brightness-[5]",
                        )}
                      >
                        <Image
                          src={item.icon}
                          alt={item.name + " Icon"}
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </div>
                      <span
                        className={cn(
                          "text-nowrap font-geistMonoRegular text-xs text-fontColorSecondary duration-300",
                          item.modal &&
                            "text-fontColorPrimary group-hover:text-fontColorPrimary",
                          !item.isComingSoon && "group-hover:text-[#cccce1]",
                          item.name === "Monitor" &&
                            twitterPopup.isOpen &&
                            "text-fontColorPrimary group-hover:text-fontColorPrimary",
                          item.name === "Wallet Tracker" &&
                            walletTrackerPopup.isOpen &&
                            "text-fontColorPrimary group-hover:text-fontColorPrimary",
                          item.name === "P&L Tracker" &&
                            openPnLModal &&
                            "text-fontColorPrimary group-hover:text-fontColorPrimary",
                        )}
                      >
                        {item.name}
                      </span>
                      {item.loading ? (
                        <div className="relative inline-block size-4 animate-spin">
                          <Image
                            src="/icons/pink-loading.svg"
                            alt="Loading Icon"
                            fill
                            objectFit="content"
                          />
                        </div>
                      ) : item.count !== undefined && item.count > 0 ? (
                        <span className="flex h-4 w-fit items-center justify-center rounded-[8px] bg-[#F65B93] px-1 font-geistRegular text-[10px] leading-3 text-fontColorPrimary">
                          {item.count &&
                            (item.count >= 100 ? "99+" : item.count)}
                        </span>
                      ) : null}
                    </div>
                  }
                  contentClassName={item.contentClassName}
                >
                  {item.content}
                </FooterModal>

                {index < MENU.length - 1 && (
                  <Separator
                    color="#202037"
                    orientation="vertical"
                    unit="fixed"
                    className="max-md:hidden"
                    fixedHeight={14}
                  />
                )}
              </React.Fragment>
            ))}
          </nav>

          <PnLTrackerModal
            isOpen={openPnLModal}
            onOpenChange={(val) => setOpenPnLModal(val)}
          />

          {/* Mobile */}
          <nav className="max-w-[45%] lg:hidden">
            <Popover open={openMenuPopover} onOpenChange={setOpenMenuPopover}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="gb__white__btn__long relative flex h-[24px] w-full flex-shrink-0 cursor-pointer items-center justify-between gap-x-2 rounded-[4px] bg-white/[8%] px-2 duration-300 hover:bg-white/[16%]"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="relative aspect-square size-4 flex-shrink-0">
                      <Image
                        src={
                          MENU.find((item) => item.name === prevActiveModal)
                            ?.icon as string
                        }
                        alt={prevActiveModal + " Icon"}
                        fill
                        quality={100}
                        className="object-contain brightness-[5]"
                      />
                    </div>
                    <span className="inline-block text-nowrap font-geistMonoRegular text-xs text-fontColorPrimary">
                      {prevActiveModal}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "relative aspect-square size-4 flex-shrink-0 duration-300 hover:opacity-70 md:hidden",
                      openMenuPopover ? "rotate-180" : "rotate-0",
                    )}
                  >
                    <Image
                      src="/icons/chevron.svg"
                      alt="Accordion Icon"
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
                className="gb__white__popover z-[200] w-[247px] rounded-[8px] border border-border bg-card p-0 shadow-[0_0_20px_0_#000000]"
              >
                <div className="flex w-full flex-col gap-y-2 p-2">
                  <button
                    onClick={() => setIsOpenSettings(!isOpenSettings)}
                    type="button"
                    className="group flex h-10 w-full items-center gap-x-2 rounded-[6px] bg-white/[4%] px-4"
                  >
                    <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                      <Image
                        src="/icons/footer/settings.svg"
                        alt="Settings Icon"
                        fill
                        quality={100}
                        className="object-contain brightness-[5] duration-300 group-hover:scale-125"
                      />
                    </div>
                    <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                      Settings
                    </span>
                  </button>
                  {MENU.map((item, index) => (
                    <React.Fragment key={index}>
                      <button
                        onClick={item.toggleModal}
                        type="button"
                        className="group flex h-10 w-full items-center gap-x-2 rounded-[6px] bg-white/[4%] px-4"
                        disabled={item.name === "P&L Tracker"}
                      >
                        <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                          <Image
                            src={item.icon}
                            alt={item.name + " Icon"}
                            fill
                            quality={100}
                            className={cn(
                              "object-contain duration-300",
                              item.name === "P&L Tracker"
                                ? "brightness-[0.5] group-hover:scale-100"
                                : "brightness-[5] group-hover:scale-125",
                            )}
                          />
                        </div>
                        <span
                          className={cn(
                            "inline-block text-nowrap text-sm",
                            item.name === "P&L Tracker"
                              ? "text-[#FFFFFF]/20"
                              : "text-fontColorPrimary",
                          )}
                        >
                          {item.name === "P&L Tracker"
                            ? "P&L Tracker (Desktop only)"
                            : item.name}
                        </span>
                        {item.loading && (
                          <div className="relative inline-block size-4 animate-spin">
                            <Image
                              src="/icons/pink-loading.svg"
                              alt="Loading Icon"
                              fill
                              objectFit="content"
                            />
                          </div>
                        )}
                        {item.count !== undefined && (
                          <span className="flex h-4 w-fit items-center justify-center rounded-[8px] bg-[#F65B93] px-1 font-geistRegular text-[10px] leading-3 text-fontColorPrimary">
                            {item.count &&
                              (item.count >= 100 ? "99+" : item.count)}
                          </span>
                        )}
                      </button>
                    </React.Fragment>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </nav>

          <SettingsPopUp
            isOpen={isOpenSettings}
            onOpenChange={(val) => setIsOpenSettings(val)}
          />

          <Separator
            color="#202037"
            orientation="vertical"
            unit="fixed"
            fixedHeight={14}
            className="mx-4 block flex-shrink-0 md:hidden"
          />
          <nav className="flex items-center justify-end gap-x-3 lg:w-full lg:gap-x-[23px]">
            {/* <FeeSummary variant="footer" /> */}
            <button
              onClick={() => setIsOpenSettings(!isOpenSettings)}
              className={cn(
                "group flex flex-shrink-0 items-center gap-x-2 rounded-[8px] py-1 tracking-normal duration-300 ease-out max-lg:hidden",
              )}
            >
              {/* <div
              className={cn(
                "relative aspect-square h-4 w-4 flex-shrink-0 duration-300 group-hover:brightness-[5]",
              )}
            ></div> */}
              <div
                className={cn(
                  "relative aspect-square h-4 w-4 flex-shrink-0 duration-300 group-hover:brightness-200",
                )}
              >
                <Image
                  src="/icons/footer/settings.svg"
                  alt="Settings Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </div>
              <span
                className={cn(
                  "text-nowrap font-geistMonoRegular text-xs text-fontColorSecondary duration-300 group-hover:text-[#cccce1] group-hover:text-fontColorPrimary",
                )}
              >
                Settings
              </span>
            </button>

            <div className="flex items-center">
              {/* <div className="relative">
              <Select
                value={region}
                onValueChange={(value) =>
                  handleRegionChange(value as "EU" | "US" | "ASIA")
                }
              >
                <SelectTrigger className="gb__white__btn__long relative h-[29px] w-full bg-white/[6%] hover:bg-white/[16%]">
                  <div className="flex items-center gap-1 text-nowrap !rounded-none font-geistSemiBold text-fontColorPrimary">
                    <div className="flex items-center gap-1">
                      <Image
                        src={
                          region === "US"
                            ? "/icons/globe-purple.svg"
                            : "/icons/globe.svg"
                        }
                        alt="Globe"
                        width={16}
                        height={16}
                        draggable="false"
                        quality={100}
                        className={cn("object-contain grayscale")}
                      />
                      <span>{region === "ASIA" ? "Asia" : region}</span>
                    </div>
                  </div>
                </SelectTrigger>
                <SelectContent className="z-[1000]">
                  <SelectItem
                    value="US"
                    className="font-geistSemiBold data-[state=checked]:border data-[state=checked]:border-primary"
                  >
                    <div className="flex items-center gap-1">
                      <Image
                        src={
                          region === "US"
                            ? "/icons/globe-purple.svg"
                            : "/icons/globe.svg"
                        }
                        alt="Globe"
                        width={16}
                        height={16}
                        draggable="false"
                        quality={100}
                        className={cn(
                          "object-contain",
                          region !== "US" && "grayscale",
                        )}
                      />
                      <span>USA</span>
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="EU"
                    className="font-geistSemiBold data-[state=checked]:border data-[state=checked]:border-primary"
                  >
                    <div className="flex items-center gap-1">
                      <Image
                        src={
                          region === "EU"
                            ? "/icons/globe-purple.svg"
                            : "/icons/globe.svg"
                        }
                        alt="Globe"
                        width={16}
                        height={16}
                        draggable="false"
                        quality={100}
                        className={cn(
                          "object-contain",
                          region !== "EU" && "grayscale",
                        )}
                      />
                      <span>EU</span>
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="ASIA"
                    className="font-geistSemiBold data-[state=checked]:border data-[state=checked]:border-primary"
                  >
                    <div className="flex items-center gap-1">
                      <Image
                        src={
                          region === "ASIA"
                            ? "/icons/globe-purple.svg"
                            : "/icons/globe.svg"
                        }
                        alt="Globe"
                        width={16}
                        height={16}
                        draggable="false"
                        quality={100}
                        className={cn(
                          "object-contain",
                          region !== "ASIA" && "grayscale",
                        )}
                      />
                      <span>Asia </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div> */}

              <Separator
                color="#202037"
                orientation="vertical"
                unit="fixed"
                fixedHeight={14}
                className="flex-shrink-0"
              />

              <div className="ml-2 flex items-center gap-x-1 lg:ml-5">
                <SocialLinkButton
                  size="md"
                  href={rightFooterLinks["socials"]["guide"]["href"]}
                  icon="support"
                  label="Guide"
                  typeImage="svg"
                  withTooltip={false}
                />
                {/*    <SocialLinkButton
                size="md"
                href={rightFooterLinks["socials"]["x"]["href"]}
                icon="x"
                label="Twitter"
                typeImage="svg"
                withTooltip={false}
              /> */}
              </div>
            </div>
          </nav>
        </div>
      </footer>
    </>
  );
}
