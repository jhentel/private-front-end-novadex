"use client";

// ######## Components 🧩 ########
import NoScrollLayout from "@/components/layouts/NoScrollLayout";
import PageHeading from "@/components/customs/headings/PageHeading";
import WalletManager from "@/components/customs/WalletManager";
import WalletManagerListSection from "@/components/customs/sections/WalletManagerListSection";
import WalletManagerInteractiveTutorials from "@/components/customs/interactive-tutorials/WalletManagerInteractiveTutorials";
// ######## Types 🗨️ ########
import { Wallet } from "@/apis/rest/wallet-manager";
import WalletManagerCardLoading from "./loadings/WalletManagerCardLoading";
import WalletManagerCardMobileLoading from "./loadings/WalletManagerCardMobileLoading";

const WalletsClient = ({ initialData }: { initialData: Wallet[] | null }) => {
  return (
    <>
      <NoScrollLayout mobileOnWhichBreakpoint="xl">
        <div className="flex w-full items-center justify-between px-4 pb-2 pt-4 lg:pt-3 xl:px-0">
          <div className="flex items-center gap-x-3">
            <PageHeading
              title="Wallet Manager"
              description="Top token pairs by transaction."
              line={1}
              showDescriptionOnMobile
            />
          </div>
          <WalletManager />
        </div>

        <WalletManagerListSection initialData={initialData} />
      </NoScrollLayout>
      {/* <WalletManagerInteractiveTutorials /> */}
    </>
  );
};

export default WalletsClient;
