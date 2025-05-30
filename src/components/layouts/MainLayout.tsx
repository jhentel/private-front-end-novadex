// ######## Components 🧩 ########
import dynamic from "next/dynamic";
const Announcement = dynamic(
  () => import("@/components/layouts/partials/Announcement"),
);
const HoldingsAndWatchlist = dynamic(
  () => import("@/components/layouts/partials/HoldingsAndWatchlist"),
);
const Header = dynamic(() => import("@/components/layouts/partials/Header"));
const BottomNavigation = dynamic(
  () => import("@/components/layouts/partials/BottomNavigation"),
);
const Footer = dynamic(() => import("@/components/layouts/partials/Footer"));
import GlobalSnapLayout from "@/components/layouts/GlobalSnapLayout";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex h-auto min-h-dvh w-full flex-col xl:h-screen xl:min-h-fit">
      <Announcement />
      <HoldingsAndWatchlist />
      <Header />
      <main className="flex w-full grow flex-col">
        <GlobalSnapLayout>{children}</GlobalSnapLayout>
      </main>
      <BottomNavigation />
      <Footer />
    </section>
  );
}
