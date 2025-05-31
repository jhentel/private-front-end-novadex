import Image from "next/image";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useState } from "react";
import { cn } from "@/libraries/utils";

interface NotificationDrawerProps {
  isActive: boolean;
  label: string;
}
export default function NotificationDrawer({
  isActive,
  label,
}: NotificationDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openSniperModal, setOpenSniperModal] = useState<boolean>(false);
  const [openAlertsModal, setOpenAlertsModal] = useState<boolean>(false);

  // const { data } = useQuery({
  //   queryKey: ["footer"],
  //   queryFn: async () => {
  //     return await getFooterData();
  //   },
  // });
  const closeAllModals = () => {
    setOpenSniperModal(false);
    setOpenAlertsModal(false);
  };

  const handleToggleOpenSniperModal = (openSniperModal: boolean) => {
    if (!openSniperModal) closeAllModals();
    setOpenSniperModal((prev) => !prev);
  };

  // const handleToggleOpenTwitterMonitorModal = () => {
  //   if (!twitterPopup.isOpen) closeAllModals();
  //   togglePopup(twitterPopup.name);
  // };

  const handleToggleOpenAlertsModal = (openAlertsModal: boolean) => {
    if (!openAlertsModal) closeAllModals();
    setOpenAlertsModal((prev) => !prev);
  };

  //   const OTHER = useMemo(
  //   () => [
  //     {
  //       name: "Sniper",
  //       icon: "/icons/footer/sniper-white.svg",
  //       modal: openSniperModal,
  //       toggleModal: () => handleToggleOpenSniperModal(openSniperModal),
  //       content: SniperContent,
  //       // contentClassName: BASE_CONTENT_CLASSNAME,
  //       count: finalFooterData?.sniper?.isRunning
  //         ? undefined
  //         : finalFooterData?.sniper?.count,
  //       loading: finalFooterData?.sniper?.isRunning,
  //       isComingSoon: false,
  //     },
  //     {
  //       name: "Twitter Monitor",
  //       icon: "/icons/footer/twitter-monitor-white.svg",
  //       modal: twitterPopup.mode === "footer" && twitterPopup.isOpen,
  //       toggleModal: handleToggleOpenTwitterMonitorModal,
  //       contentClassName: cn("flex flex-col w-full md:bottom-[50px] bottom-11"),
  //     },
  //     {
  //       name: "Alerts",
  //       icon: "/icons/footer/alerts-white.svg",
  //       modal: openAlertsModal,
  //       toggleModal: () => handleToggleOpenAlertsModal(openAlertsModal),
  //       content: AlertTable,
  //       //      contentClassName: BASE_CONTENT_CLASSNAME,
  //       count: finalFooterData?.alerts,
  //       isComingSoon: false,
  //     },
  //     {
  //       name: "P&L Tracker",
  //       icon: "/icons/footer/trend-white.svg",
  //       modal: false,
  //       contentClassName: "",
  //       isComingSoon: false,
  //     },
  //   ],
  //   [
  //     // Dependencies
  //     openSniperModal,
  //     walletTrackerPopup.isOpen,
  //     twitterPopup.isOpen,
  //     openAlertsModal,
  //     handleToggleOpenSniperModal,
  //     handleToggleOpenTwitterMonitorModal,
  //     handleToggleOpenAlertsModal,
  //     finalFooterData,
  //   ],
  // );

  // const renderOtherItems = (items: typeof OTHER) =>
  //   items.map((item, index) => (
  //     <OtherMenuItem
  //       key={index}
  //       icon={item.icon}
  //       label={item.name}
  //       setIsOpen={setIsOpen}
  //       toggleModal={item.toggleModal!}
  //       openModal={item.modal}
  //       isLoading={item.loading}
  //       count={item.count}
  //       ContentComponent={item.content}
  //     />
  //   ));
  //
  // const renderMenuItems = (items: typeof mainMenus) =>
  //   items.map(({ icon, label, href }) => (
  //     <MenuItem
  //       key={label}
  //       href={href}
  //       icon={icon}
  //       label={label}
  //       setIsOpen={setIsOpen}
  //     />
  //   ));

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <button
          title="Notification Drawer Trigger"
          className="flex w-full min-w-[86px] flex-col items-center justify-center text-xs"
        >
          <Image
            src={
              isOpen || isActive
                ? "/icons/footer/bottom-nav/notification-active.svg"
                : "/icons/footer/bottom-nav/notification.svg"
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
        overlayClassName="z-[150] bottom-[58.25px]"
        className="bottom-[58.25px] z-[150] flex w-full flex-col gap-y-0 bg-card after:hidden xl:hidden xl:max-w-[480px]"
      >
        <DrawerHeader className="flex h-[56px] flex-row items-center justify-between border-b border-border p-4">
          <DrawerTitle className="text-lg">Notification</DrawerTitle>
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
        </div>
        <div className="grid grid-cols-2 gap-3 p-4">
          <div className="col-span-2 font-geistSemiBold text-sm text-fontColorSecondary">
            OTHER
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
