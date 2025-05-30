"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
// ######## Components 🧩 ########
import Image from "next/image";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import QuickBuySettings from "./QuickBuySettings";
import QuickSellSettings from "./QuickSellSettings";
import BuySniperSettings from "./BuySniperSettings";
import SellSniperSettings from "./SellSniperSettings";
import CustomizeSettings from "./CustomizeSettings";
import NotificationSettings from "./NotificationSettings";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import Separator from "../Separator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import CustomizeTokenPageSettings from "./CustomizeTokenPageSettings";
import { FolderClosed, FolderOpen, ChevronRight } from "lucide-react";

type MenuLabel =
  | "Quick Buy"
  | "Quick Sell"
  | "Buy Sniper"
  | "Sell Sniper"
  | "Copy Trade"
  | "Buy Limit Order"
  | "Sell Limit Order"
  | "2FA Security"
  | "Customize";

type SubMenuLabel = "Cosmo Page" | "Token Page" | "Notification";

type Menu = {
  label: MenuLabel;
  description: string;
  icons: {
    active: string;
    inactive: string;
  };
  component: React.ComponentType<any>; // Updated to accept props
  isComingSoon?: boolean;
  subMenus?: Array<{
    label: SubMenuLabel;
    description: string;
    component: React.ComponentType<any>;
  }>;
};

type MenuList = {
  title: string;
  list: Menu[];
}[];

const menuList: MenuList = [
  {
    title: "PRESETS",
    list: [
      {
        label: "Quick Buy",
        description: "Customize trading presets up to 5 different settings.",
        icons: {
          active: "/icons/setting/active-quick-buy.png",
          inactive: "/icons/setting/inactive-quick-buy.png",
        },
        component: QuickBuySettings,
      },
      {
        label: "Quick Sell",
        description: "Customize trading presets up to 5 different settings.",
        icons: {
          active: "/icons/setting/active-quick-sell.png",
          inactive: "/icons/setting/inactive-quick-sell.png",
        },
        component: QuickSellSettings,
      },
      {
        label: "Buy Sniper",
        description: "Customize trading presets up to 5 different settings.",
        icons: {
          active: "/icons/setting/active-buy-sniper.png",
          inactive: "/icons/setting/inactive-buy-sniper.png",
        },
        component: BuySniperSettings,
      },
      {
        label: "Sell Sniper",
        description: "Customize trading presets up to 5 different settings.",
        icons: {
          active: "/icons/setting/active-sell-sniper.png",
          inactive: "/icons/setting/inactive-sell-sniper.png",
        },
        component: SellSniperSettings,
      },
      {
        label: "Customize",
        description:
          "Personalize the Cosmo buy button and adjust its size using the options below",
        icons: {
          active: "/icons/setting/active-customize-buy-button.png",
          inactive: "/icons/setting/inactive-customize-buy-button.png",
        },
        component: CustomizeSettings,
        subMenus: [
          {
            label: "Cosmo Page",
            description: "Personalize the Cosmo page using the options below.",
            component: CustomizeSettings,
          },
          {
            label: "Token Page",
            description: "Personalize the Token page using the options below.",
            component: CustomizeTokenPageSettings,
          },
          {
            label: "Notification",
            description:
              "Personalize the sound of all notification using the options below.",
            component: NotificationSettings,
          },
        ],
      },
    ],
  },
  //     {
  //       label: "Copy Trade",
  //       description:
  //         "Customize trading presets up to 5 different settings and instantly switch between them.",
  //       icons: {
  //         active: "/icons/setting/active-copy-trade.png",
  //         inactive: "/icons/setting/inactive-copy-trade.png",
  //       },
  //       component: CopyTradeSettings,
  //       isComingSoon: true,
  //     },
  //     {
  //       label: "Buy Limit Order",
  //       description:
  //         "Customize trading presets up to 5 different settings and instantly switch between them.",
  //       icons: {
  //         active: "/icons/setting/active-limit-order.png",
  //         inactive: "/icons/setting/inactive-limit-order.png",
  //       },
  //       component: BuyLimitOrderSettings,
  //       isComingSoon: true,
  //     },
  //     {
  //       label: "Sell Limit Order",
  //       description:
  //         "Customize trading presets up to 5 different settings and instantly switch between them.",
  //       icons: {
  //         active: "/icons/setting/active-limit-order.png",
  //         inactive: "/icons/setting/inactive-limit-order.png",
  //       },
  //       component: SellLimitOrderSettings,
  //       isComingSoon: true,
  //     },
  //   ],
  // },
  // {
  //   title: "OTHER",
  //   list: [
  //     {
  //       label: "2FA Security",
  //       description:
  //         "This is used to secure your wallet on all your devices. This cannot be recovered.",
  //       icons: {
  //         active: "/icons/setting/active-2fa-security.png",
  //         inactive: "/icons/setting/inactive-2fa-security.png",
  //       },
  //       component: TwoFactoryAuthenticationSecuritySettings,
  //     },
  //   ],
  // },
];

export default function SettingsMenu() {
  const [selectedSettingMenu, setSelectedSettingMenu] = useState<
    MenuLabel | SubMenuLabel
  >("Quick Buy");

  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(
    {},
  );

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  // State for managing save functionality
  const [isSaving, setIsSaving] = useState(false);
  const [activeFormId, setActiveFormId] = useState<string>(
    "quick-buy-settings-form",
  );

  // Handler for the save button in the header
  // const handleSaveClick = () => {
  //   // Programmatically submit the active form
  //   const form = document.getElementById(activeFormId);
  //   if (form) {
  //     form.dispatchEvent(
  //       new Event("submit", { bubbles: true, cancelable: true }),
  //     );
  //   }
  // };

  // Generate form ID based on the selected menu
  const getFormId = (label: string): string => {
    return label.toLowerCase().replace(/\s+/g, "-") + "-settings-form";
  };

  // Update the active form ID when the selected menu changes
  const handleMenuChange = (menuLabel: MenuLabel | SubMenuLabel) => {
    setSelectedSettingMenu(menuLabel);
    setActiveFormId(getFormId(menuLabel));
  };

  // const debouncedSave = useMemo(() => {
  //   return debounce(() => {
  //     const form = document.getElementById(activeFormId);
  //     if (form) {
  //       form.dispatchEvent(
  //         new Event("submit", { bubbles: true, cancelable: true }),
  //       );
  //     }
  //   }, 1000);
  // }, [activeFormId]);
  //
  // useEffect(() => {
  //   return () => {
  //     debouncedSave.cancel();
  //   };
  // }, [debouncedSave]);

  return (
    <div className="flex h-full w-full flex-grow flex-col max-md:h-full md:flex-row md:bg-[#444]/[4%]">
      <div className="w-full border-border md:h-full md:max-w-[200px] md:border-r">
        <ScrollArea className="md:h-full md:w-full md:max-w-[200px]">
          <ScrollBar orientation="horizontal" className="hidden" />
          <div className="flex gap-y-2 border-border p-2 md:h-full md:w-full md:max-w-[200px] md:flex-col md:border-b-0 md:pb-2 xl:max-w-[200px] xl:p-2">
            {menuList.map((menu, i) => (
              <div
                key={i}
                className="flex cursor-pointer justify-center gap-2 gap-y-1 px-3 md:flex-col md:gap-x-0 md:px-0"
              >
                {i > 0 ? (
                  <Separator className="my-3 hidden md:inline-block" />
                ) : (
                  ""
                )}
                <h1 className="hidden font-geistRegular text-[10px] text-fontColorSecondary md:inline-block">
                  {menu.title}
                </h1>
                {menu.list.map((item, j) => {
                  const isSelected = item.label === selectedSettingMenu;
                  const hasSubmenus =
                    item?.subMenus && item.subMenus.length > 0;
                  const isExpanded = expandedMenus[item.label];

                  return (
                    <React.Fragment key={j + item?.label}>
                      <button
                        onClick={() => {
                          if (hasSubmenus) {
                            toggleMenu(item.label);
                          } else {
                            handleMenuChange(item?.label);
                          }
                        }}
                        className={cn(
                          "relative flex h-[40px] w-fit items-center justify-start gap-x-2 rounded-[8px] py-2 pl-1 pr-4 duration-300 md:pr-2 xl:w-full xl:pr-1",
                          isSelected
                            ? "bg-primary/[12%]"
                            : "bg-white/[6%] md:bg-transparent",
                        )}
                      >
                        <span
                          className={cn(
                            "h-6 w-1 flex-shrink-0 rounded-[10px] bg-transparent duration-300",
                            isSelected && "bg-primary",
                          )}
                        ></span>

                        {hasSubmenus ? (
                          // Show folder icon for items with submenus
                          <div className="relative aspect-square size-6 flex-shrink-0">
                            {isExpanded ? (
                              <FolderOpen
                                className={cn(
                                  "size-6",
                                  isSelected
                                    ? "text-[#DF74FF]"
                                    : "text-fontColorSecondary",
                                )}
                              />
                            ) : (
                              <FolderClosed
                                className={cn(
                                  "size-6",
                                  isSelected
                                    ? "text-[#DF74FF]"
                                    : "text-fontColorSecondary",
                                )}
                              />
                            )}
                          </div>
                        ) : (
                          // Regular icon for items without submenus
                          <div className="relative aspect-square size-6 flex-shrink-0">
                            <Image
                              src={
                                isSelected
                                  ? item?.icons?.active
                                  : item?.icons?.inactive
                              }
                              alt={item?.label + "Icon"}
                              fill
                              quality={100}
                              className="object-contain"
                            />
                          </div>
                        )}

                        <span
                          className={cn(
                            "inline-block text-nowrap font-geistSemiBold text-sm text-fontColorSecondary duration-300",
                            isSelected && "text-[#DF74FF]",
                          )}
                        >
                          {item?.label}
                        </span>

                        {/* Add chevron indicator for expandable menus */}
                        {hasSubmenus && (
                          <div className="ml-auto mr-1">
                            <ChevronRight
                              size={16}
                              className={cn(
                                "duration-300",
                                isExpanded ? "rotate-90" : "rotate-0",
                                isSelected
                                  ? "text-[#DF74FF]"
                                  : "text-fontColorSecondary",
                              )}
                            />
                          </div>
                        )}
                      </button>

                      {/* Enhanced submenu rendering with animations */}
                      <AnimatePresence>
                        {hasSubmenus && isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            {item?.subMenus?.map((subMenu, k) => {
                              const isSubMenuSelected =
                                subMenu.label === selectedSettingMenu;

                              return (
                                <div
                                  key={k + subMenu.label}
                                  className="mb-2 ml-6 flex !w-full gap-x-2"
                                >
                                  <div className="w-[90%]">
                                    <div className="relative flex w-full cursor-pointer items-center gap-x-1">
                                      <div
                                        className={cn(
                                          "absolute w-[20px] rounded-bl-[10px] border-b-[3px] border-l-[3px] border-r-0 border-t-0",
                                          isSubMenuSelected
                                            ? "border-[#DF74FF]"
                                            : "border-[#9191A4]",
                                        )}
                                        style={{
                                          height:
                                            k === 0
                                              ? "30px"
                                              : k === 1
                                                ? "76px"
                                                : "140px",
                                          top:
                                            k === 0 ? "-5px" : `-${k * 63}px`,
                                          zIndex: isSubMenuSelected
                                            ? 1000
                                            : `${1000 - k}`,
                                        }}
                                      ></div>
                                      <button
                                        onClick={() =>
                                          handleMenuChange(subMenu.label)
                                        }
                                        className={cn(
                                          "relative ml-6 mr-2 flex h-[40px] w-full items-center justify-start gap-x-2 rounded-[8px] py-2 pl-1 pr-4 duration-300 md:pr-2 xl:w-full",
                                          isSubMenuSelected
                                            ? "bg-primary/[12%]"
                                            : "bg-white/[6%] md:bg-transparent",
                                          k === 0 ? "mt-[5px]" : "mt-[-6px]",
                                        )}
                                      >
                                        <span
                                          className={cn(
                                            "h-6 w-1 flex-shrink-0 rounded-[10px] bg-transparent duration-300",
                                            isSubMenuSelected && "bg-primary",
                                          )}
                                        ></span>

                                        <span
                                          className={cn(
                                            "inline-block text-nowrap font-geistSemiBold text-sm text-fontColorSecondary duration-300",
                                            isSubMenuSelected &&
                                              "text-[#DF74FF]",
                                          )}
                                        >
                                          {subMenu?.label}
                                        </span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="relative h-full w-full flex-grow">
        <div className="relative z-20 flex h-full w-full flex-grow pr-1">
          <OverlayScrollbarsComponent
            defer
            element="div"
            className="setting__overlayscrollbar relative h-full w-full flex-grow overflow-y-scroll"
          >
            <div className="flex h-fit w-full flex-grow flex-col px-4 pb-[10.5rem] max-md:h-full md:pb-4">
              {!menuList[0].list.find(
                (menu) => menu.label === selectedSettingMenu,
              )?.isComingSoon ? (
                <div
                  className={cn(
                    "flex h-[78px] w-full items-center justify-between py-4",
                    {
                      "max-md:hidden":
                        selectedSettingMenu === "Cosmo Page" ||
                        selectedSettingMenu === "Token Page" ||
                        selectedSettingMenu === "Notification",
                    },
                  )}
                >
                  {/* Left side - Title and description */}
                  <div className="flex flex-col">
                    <h3 className="text-nowrap font-geistSemiBold text-lg text-fontColorPrimary">
                      {menuList[0].list
                        .flatMap((menu) => menu.subMenus || [])
                        .find(
                          (subMenu) => subMenu.label === selectedSettingMenu,
                        )?.label ??
                        menuList[0].list.find(
                          (menu) =>
                            menu.label === selectedSettingMenu ||
                            menu.subMenus?.some(
                              (subMenu) =>
                                subMenu.label === selectedSettingMenu,
                            ),
                        )?.label}
                    </h3>

                    <p className="w-full whitespace-normal text-sm text-fontColorSecondary">
                      {menuList[0].list
                        .flatMap((menu) => menu.subMenus || [])
                        .find(
                          (subMenu) => subMenu.label === selectedSettingMenu,
                        )?.description ??
                        menuList[0].list.find(
                          (menu) =>
                            menu.label === selectedSettingMenu ||
                            menu.subMenus?.some(
                              (subMenu) =>
                                subMenu.label === selectedSettingMenu,
                            ),
                        )?.description}
                    </p>
                  </div>

                  {/* Right side - Save button */}
                  {/* <div className="hidden md:block"> */}
                  {/*   <BaseButton */}
                  {/*     onClick={handleSaveClick} */}
                  {/*     variant="primary" */}
                  {/*     className="h-[32px] w-[114px] px-8" */}
                  {/*     disabled={isSaving} */}
                  {/*   > */}
                  {/*     <span className="inline-block font-geistSemiBold text-base text-[#080811]"> */}
                  {/*       {isSaving ? "Saving..." : "Save"} */}
                  {/*     </span> */}
                  {/*   </BaseButton> */}
                  {/* </div> */}
                </div>
              ) : (
                ""
              )}

              <div className="flex h-full w-full flex-grow">
                {menuList[0].list.map((menu) => {
                  const isSelected = selectedSettingMenu === menu.label;
                  const SettingComponent = menu.component;

                  const isSubMenuSelected = menu.subMenus?.some(
                    (subMenu) => subMenu.label === selectedSettingMenu,
                  );
                  const SubMenuComponent =
                    menu?.subMenus?.find(
                      (subMenu) => subMenu?.label === selectedSettingMenu,
                    )?.component ?? menu.component;

                  // sub menu attributes
                  const subMenu = menu.subMenus?.find(
                    (subMenu) => subMenu.label === selectedSettingMenu,
                  );

                  return isSelected ? (
                    <SettingComponent
                      key={menu.label}
                      setIsSaving={setIsSaving}
                      setActiveFormId={setActiveFormId}
                      formId={getFormId(menu.label)}
                      autoSave
                    />
                  ) : isSubMenuSelected ? (
                    <SubMenuComponent
                      key={subMenu?.label}
                      setIsSaving={setIsSaving}
                      setActiveFormId={setActiveFormId}
                      formId={getFormId(subMenu?.label || "")}
                      autoSave
                    />
                  ) : null;
                })}
              </div>
            </div>
          </OverlayScrollbarsComponent>
        </div>
      </div>
    </div>
  );
}
