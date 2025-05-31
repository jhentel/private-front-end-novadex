import WalletTradesModal from "@/components/customs/modals/WalletTradesModal";
import { WebSocketProvider } from "@/providers/websocket-provider";
import dynamic from "next/dynamic";

const GetSettingsLayout = dynamic(
  () => import("@/components/layouts/GetSettingsLayout"),
);

const AllWSProvider = dynamic(() => import("@/providers/AllWSProvider"));

const MainLayout = dynamic(() => import("@/components/layouts/MainLayout"));

export default function PrimaryLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <WebSocketProvider>
        <AllWSProvider>
          <GetSettingsLayout />
          <MainLayout>{children}</MainLayout>
          <WalletTradesModal />
        </AllWSProvider>
      </WebSocketProvider>
    </>
  );
}
