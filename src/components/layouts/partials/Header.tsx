"use client";
// ######## Components 🧩 ########
import Separator from "@/components/customs/Separator";
import Image from "next/image";
import Link from "next/link";
import BaseButton from "@/components/customs/buttons/BaseButton";
const QuickClipboard = dynamic(
  () => import("@/components/customs/QuickClipboard"),
);
const GlobalSearchModal = dynamic(
  () => import("@/components/customs/modals/GlobalSearchModal"),
);
const UserWallet = dynamic(() => import("@/components/customs/UserWallet"));
// const UserEarningLevel = dynamic(
//   () => import("@/components/customs/UserEarningLevel"),
//   {
//     ssr: false,
//   },
// );
const UserAccount = dynamic(() => import("@/components/customs/UserAccount"));
const NavLink = dynamic(() => import("@/components/layouts/partials/NavLink"));

// ######## Utils & Helpers 🤝 ########
import dynamic from "next/dynamic";
import Notifications from "@/components/customs/Notifications";
import FeeSummary from "@/components/customs/FeeSummary";
import { usePathname, useRouter } from "next/navigation";
import { pathnamesWithoutBottomNav } from "./BottomNavigation";
import { useWhatsNewStore } from "@/stores/use-whats-new.store";

const navigationLinks = [
  {
    label: "Cosmo",
    href: "/",
  },
  {
    label: "Trending",
    href: "/trending",
  },
  {
    label: "Wallet Tracker",
    href: "/wallet-tracker",
  },
  {
    label: "Monitor",
    href: "/twitter-monitor",
  },
  {
    label: "Holdings",
    href: "/holdings",
  },
  {
    label: "Points",
    href: "/points",
  },
  // {
  //   label: "Earn",
  //   href: "/earn",
  // },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const handleBack = () => {
    const referrer = document.referrer;
    const isExternalReferrer =
      referrer && !referrer.startsWith(window.location.origin);
    if (isExternalReferrer) {
      router.push("/default-page"); // atau show modal
    } else {
      router.back();
    }
  };

  // const state = useWhatsNewStore((state) => state.isShowWhatsNew);
  const toggleWhatsNew = useWhatsNewStore((state) => state.toggleWhatsNew);

  return (
    <header className="sticky top-0 z-[100] border-border max-xl:border-b">
      <div className="flex w-full justify-between bg-background px-4 py-2 xl:border-transparent">
        <div className="flex w-fit items-center gap-x-4">
          {pathnamesWithoutBottomNav.includes(pathname.split("/")[1]) ? (
            <>
              <button onClick={handleBack}>
                <div className="relative flex aspect-square size-4 flex-shrink-0 xl:hidden">
                  <Image
                    src="/icons/left-arrow.svg"
                    alt="Back Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
              </button>
              <Link
                href={"/"}
                prefetch
                className="relative hidden aspect-square h-8 w-8 flex-shrink-0 xl:flex"
              >
                <Image
                  src="/logo.png"
                  alt="Nova Logo"
                  fill
                  quality={100}
                  className="object-contain"
                  loading="eager"
                  priority
                />
              </Link>
            </>
          ) : (
            <Link
              href={"/"}
              prefetch
              className="relative aspect-square h-8 w-8 flex-shrink-0"
            >
              <Image
                src="/logo.png"
                alt="Nova Logo"
                fill
                quality={100}
                className="object-contain"
                loading="eager"
                priority
              />
            </Link>
          )}
          <Separator
            color="#202037"
            orientation="vertical"
            unit="fixed"
            className="hidden xl:block"
            fixedHeight={16}
          />
          <nav className="hidden items-center justify-start gap-x-3 xl:flex">
            {navigationLinks?.map((link, index) => (
              <NavLink
                link={link}
                key={index + "-" + link.label}
                prefetch
                scroll={false}
              />
            ))}
          </nav>
        </div>

        <div className="flex w-auto items-center justify-end gap-x-2">
          <QuickClipboard
            parentClassName="flex relative right-0 top-0 translate-y-0"
            wrapperClassName="h-8 pr-1"
          />

          <BaseButton
            type="button"
            onClick={() => toggleWhatsNew()}
            variant="gray"
            size="long"
            className="hidden h-8 w-8 items-center gap-x-2 bg-[#17171F] pl-0 pr-0 focus:bg-white/[6%] xl:flex 2xl:w-auto 2xl:px-2"
            prefixIcon={
              <div className="relative hidden aspect-square size-4 flex-shrink-0 2xl:block">
                <Image
                  src="/icons/whats-new.svg"
                  alt="What's New Logo"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </div>
            }
          >
            <div className="relative mx-auto block aspect-square size-4 flex-shrink-0 2xl:hidden">
              <Image
                src="/icons/whats-new.svg"
                alt="What's New Logo"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
            <span className="hidden text-nowrap text-start font-geistSemiBold text-xs text-fontColorPrimary 2xl:inline-block">
              What&apos;s new
            </span>
          </BaseButton>

          <div className="hidden xl:flex">
            <GlobalSearchModal />
          </div>

          <UserWallet />

          {/* <div className="hidden xl:flex">
            <Notifications />
          </div> */}

          {/* <UserEarningLevel /> */}
          <UserAccount />

          {/*<MobileNav />*/}
        </div>
      </div>

      {/* Bonding Curv, Prior Fee, and Bribe Fee */}
      {/* <FeeSummary variant="header" /> */}
    </header>
  );
}
