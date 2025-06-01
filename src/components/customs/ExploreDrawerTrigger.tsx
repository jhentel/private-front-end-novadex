import Image from "next/image";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { cn } from "@/libraries/utils";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useFooterStore } from "@/stores/footer/use-footer.store";
import { Footer as FooterCount, getFooterData } from "@/apis/rest/footer";
import { usePopupStore } from "@/stores/use-popup-state";
import AlertTable from "./tables/footer/AlertTable";
import SniperContent from "./SniperContent";

const mainMenus = [
  {
    icon: "/icons/footer/trend-up.svg",
    label: "Trending",
    href: "/trending",
  },
  {
    icon: "/icons/book.svg",
    label: "Holdings",
    href: "/holdings",
  },
  {
    icon: "/icons/footer/wallet-tracker-white.svg",
    label: "Wallet Tracker",
    href: "/wallet-tracker",
  },
  {
    icon: "/icons/footer/refferal.svg",
    label: "Referral",
    href: "/referral",
  },
  {
    icon: "/icons/footer/monitoring-white.svg",
    label: "Monitor",
    href: "/twitter-monitor",
  },
  // {
  //   icon: "/icons/footer/coins.svg",
  //   label: "Earn",
  //   href: "/earn",
  // },
  // {
  //   icon: "/icons/book.svg",
  //   label: "Documentation",
  //   href: "/documentations",
  // },
];

interface ExploreDrawerTriggerProps {
  isActive: boolean;
  label: string;
}

export default function ExploreDrawerTrigger({
  isActive,
  label,
}: ExploreDrawerTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openSniperModal, setOpenSniperModal] = useState<boolean>(false);
  const [openAlertsModal, setOpenAlertsModal] = useState<boolean>(false);
  const footerMessage = useFooterStore((state) => state.message);

  const { popups, togglePopup } = usePopupStore();
  const twitterPopup = popups.find((p) => p.name === "twitter");
  const walletTrackerPopup = popups.find((p) => p.name === "wallet_tracker");
  if (!twitterPopup || !walletTrackerPopup) throw new Error("Popups not found");

  const { data } = useQuery({
    queryKey: ["footer"],
    queryFn: async () => {
      return await getFooterData();
    },
  });
  const closeAllModals = () => {
    setOpenSniperModal(false);
    setOpenAlertsModal(false);
  };

  const handleToggleOpenSniperModal = (openSniperModal: boolean) => {
    if (!openSniperModal) closeAllModals();
    setOpenSniperModal((prev) => !prev);
  };

  const handleToggleOpenTwitterMonitorModal = () => {
    if (!twitterPopup.isOpen) closeAllModals();
    togglePopup(twitterPopup.name);
  };

  const handleToggleOpenAlertsModal = (openAlertsModal: boolean) => {
    if (!openAlertsModal) closeAllModals();
    setOpenAlertsModal((prev) => !prev);
  };

  const finalFooterData = (
    !!footerMessage ? footerMessage : data
  ) as FooterCount;

  const OTHER = useMemo(
    () => [
      {
        name: "Sniper",
        icon: "/icons/footer/sniper-white.svg",
        modal: openSniperModal,
        toggleModal: () => handleToggleOpenSniperModal(openSniperModal),
        content: SniperContent,
        // contentClassName: BASE_CONTENT_CLASSNAME,
        count: finalFooterData?.sniper?.isRunning
          ? undefined
          : finalFooterData?.sniper?.count,
        loading: finalFooterData?.sniper?.isRunning,
        isComingSoon: false,
      },
      {
        name: "Alerts",
        icon: "/icons/footer/alerts-white.svg",
        modal: openAlertsModal,
        toggleModal: () => handleToggleOpenAlertsModal(openAlertsModal),
        content: AlertTable,
        //      contentClassName: BASE_CONTENT_CLASSNAME,
        count: finalFooterData?.alerts,
        isComingSoon: false,
      },
      {
        name: "P&L Tracker",
        icon: "/icons/footer/trend-white.svg",
        modal: false,
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
      handleToggleOpenSniperModal,
      handleToggleOpenTwitterMonitorModal,
      handleToggleOpenAlertsModal,
      finalFooterData,
    ],
  );

  const renderOtherItems = (items: typeof OTHER) =>
    items.map((item, index) => (
      <OtherMenuItem
        key={index}
        icon={item.icon}
        label={item.name}
        setIsOpen={setIsOpen}
        toggleModal={item.toggleModal!}
        openModal={item.modal}
        isLoading={item.loading}
        count={item.count}
        ContentComponent={item.content}
      />
    ));

  const renderMenuItems = (items: typeof mainMenus) =>
    items.map(({ icon, label, href }) => (
      <MenuItem
        key={label}
        href={href}
        icon={icon}
        label={label}
        setIsOpen={setIsOpen}
      />
    ));

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <button
          title="Explore Drawer Trigger"
          className="flex w-full min-w-[86px] flex-col items-center justify-center text-xs"
        >
          <Image
            src={
              isOpen || isActive
                ? "/icons/footer/bottom-nav/explore-active.svg"
                : "/icons/footer/bottom-nav/explore.svg"
            }
            alt={`${label} Icon`}
            width={20}
            height={20}
            className={cn("mb-1")}
            priority
          />
          <span
            className={cn(
              "text-xs text-fontColorSecondary group-hover:text-fontColorPrimary",
              isOpen || isActive
                ? "font-geistSemiBold text-fontColorAction"
                : "font-geistRegular text-fontColorSecondary",
            )}
          >
            {label}
          </span>
        </button>
      </DrawerTrigger>
      <DrawerContent
        overlayClassname="z-[150] bottom-[58.25px]"
        className="bottom-[58.25px] z-[150] flex w-full flex-col gap-y-0 bg-card after:hidden xl:hidden xl:max-w-[480px]"
      >
        <DrawerHeader className="flex h-[56px] flex-row items-center justify-between border-b border-border p-4">
          <DrawerTitle className="text-lg">Explore</DrawerTitle>
          <DrawerClose asChild>
            <button className="flex h-6 w-6 cursor-pointer items-center justify-center bg-transparent text-transparent">
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
          </DrawerClose>
        </DrawerHeader>
        <div className="grid grid-cols-2 gap-3 p-4">
          <div className="col-span-2 font-geistSemiBold text-sm text-fontColorSecondary">
            MAIN MENU
          </div>
          {renderMenuItems(mainMenus)}
        </div>
        <div className="grid grid-cols-2 gap-3 p-4">
          <div className="col-span-2 font-geistSemiBold text-sm text-fontColorSecondary">
            OTHER
          </div>
          {renderOtherItems(OTHER)}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
const OtherMenuItem = ({
  icon,
  label,
  setIsOpen,
  toggleModal,
  isLoading = false,
  count,
  openModal,
  ContentComponent,
}: {
  icon: string;
  label: string;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  toggleModal: () => void;
  isLoading?: boolean;
  count?: number;
  openModal?: boolean;
  ContentComponent?: React.ComponentType<any>;
}) => {
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const handleClick = () => {
    setIsOpen(false);
    toggleModal();
  };
  return (
    <>
      <button
        onClick={
          label === "P&L Tracker" || label === "Alerts" || label === "Sniper"
            ? () => setIsOpenDrawer(true)
            : handleClick
        }
        className="flex w-full items-center gap-3 rounded-[8px] border border-border bg-white/[4%] p-4 pr-3 hover:bg-[#17171F]"
      >
        <Image src={icon} alt={label} width={24} height={24} />
        <span className="w-full truncate text-nowrap text-left font-geistSemiBold text-base text-fontColorPrimary">
          {label}
        </span>

        {isLoading && (
          <div className="relative inline-block size-4 shrink-0 animate-spin">
            <Image
              src="/icons/pink-loading.svg"
              alt="Loading Icon"
              fill
              objectFit="content"
            />
          </div>
        )}
        {count !== undefined && count > 0 ? (
          <span className="flex h-4 w-fit items-center justify-center rounded-[8px] bg-[#F65B93] px-1 font-geistRegular text-[10px] leading-3 text-fontColorPrimary">
            {count && (count >= 100 ? "99+" : count)}
          </span>
        ) : null}
      </button>
      <Drawer open={isOpenDrawer} onOpenChange={setIsOpenDrawer}>
        <DrawerContent className="z-[300] bg-card p-0 shadow-[0_0_20px_0_#000000]">
          <DrawerHeader className="flex flex-row items-center justify-between space-y-0 border-b border-[#242436] px-4 py-3.5">
            <DrawerTitle className="text-fontColorPrimary">{label}</DrawerTitle>
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
          {ContentComponent ? (
            <div className="flex h-[87dvh] w-full flex-grow flex-col">
              <ContentComponent />
            </div>
          ) : (
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
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
};
const MenuItem = ({
  icon,
  label,
  href,
  setIsOpen,
}: {
  icon: string;
  label: string;
  href?: string;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const handleClick = () => {
    setIsOpen(false);
  };
  return (
    <Link
      onClick={handleClick}
      className="flex w-full items-center gap-3 rounded-[8px] border border-border bg-white/[4%] p-4 pr-3 hover:bg-[#17171F]"
      href={href!}
    >
      <Image src={icon} alt={label} width={24} height={24} />
      <span className="w-full text-left font-geistSemiBold text-base text-fontColorPrimary">
        {label}
      </span>
    </Link>
  );
};
