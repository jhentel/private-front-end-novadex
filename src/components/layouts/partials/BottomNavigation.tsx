"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/libraries/utils";
import ExploreDrawerTrigger from "@/components/customs/ExploreDrawerTrigger";
import Notifications from "@/components/customs/Notifications";

const navItems = [
  {
    label: "Cosmo",
    icons: [
      "/icons/footer/bottom-nav/home.svg",
      "/icons/footer/bottom-nav/home-active.svg",
    ],
    href: "/",
  },
  {
    label: "Search",
    icons: [
      "/icons/footer/bottom-nav/search.svg",
      "/icons/footer/bottom-nav/search-active.svg",
    ],
    href: "/search",
  },
  {
    label: "Explore",
    icons: [
      "/icons/footer/bottom-nav/explore.svg",
      "/icons/footer/bottom-nav/explore-active.svg",
    ],
    href: "#explore",
  },
  // {
  //   label: "Notification",
  //   icons: [
  //     "/icons/footer/bottom-nav/notification.svg",
  //     "/icons/footer/bottom-nav/notification-active.svg",
  //   ],
  //   href: "#notif",
  // },
  {
    label: "Settings",
    icons: [
      "/icons/footer/bottom-nav/settings.svg",
      "/icons/footer/bottom-nav/settings-active.svg",
    ],
    href: "/settings",
  },
];

export const pathnamesWithoutBottomNav = [
  "verify-2fa",
  "token",
  "wallet-trade",
];
export const pathnamesExplore = [
  "trending",
  "holdings",
  "referral",
  "wallet-tracker",
  "twitter-monitor",
  "documentations",
];

export default function BottomNavigation() {
  const pathname = usePathname();
  if (pathnamesWithoutBottomNav.includes(pathname.split("/")[1])) return null;
  return (
    <nav className="fixed bottom-0 z-[160] flex w-full items-center justify-around border-t border-border bg-[#080811] py-2 xl:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const isExploreActive = pathnamesExplore.includes(
          pathname.split("/")[1],
        );
        if (item.label === "Explore") {
          return (
            <ExploreDrawerTrigger
              key={item.label}
              isActive={isExploreActive}
              label={item.label}
            />
          );
        }
        // if (item.label === "Notification") {
        //   return <Notifications key={item.label} />;
        // }
        return (
          <Link
            key={item.label}
            href={item.href}
            className="flex w-full min-w-[86px] flex-col items-center justify-center text-xs max-[425px]:min-w-fit"
          >
            <Image
              src={isActive ? item.icons[1] : item.icons[0]}
              alt={`${item.label} Icon`}
              width={20}
              height={20}
              className={cn("mb-1")}
              priority
            />
            <span
              className={cn(
                "text-xs text-fontColorSecondary group-hover:text-fontColorPrimary",
                isActive
                  ? "font-geistSemiBold text-fontColorAction"
                  : "font-geistRegular text-fontColorSecondary",
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
