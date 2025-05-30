// ######## Components 🧩 ########
import NoScrollLayout from "@/components/layouts/NoScrollLayout";
import PageHeading from "@/components/customs/headings/PageHeading";
import DexBuySettings from "@/components/customs/DexBuySettings";
import HoldingsListSection from "@/components/customs/sections/HoldingsListSection";
import HoldingsWalletSelection from "@/components/customs/HoldingsWalletSelection";
// ######## Utils & Helpers 🤝 ########
import { generateMetadata } from "@/utils/generateMetadata";

export const metadata = generateMetadata({
  title: "Holdings",
});

export default async function HoldingsPage() {
  return (
    <NoScrollLayout>
      <div className="px-3.5 pb-1 pt-4 lg:px-0 xl:p-0">
        <HoldingsWalletSelection />
      </div>

      <div className="flex w-full flex-col justify-between gap-y-2 px-4 py-4 md:mt-2 lg:gap-y-4 lg:px-0 xl:flex-row xl:items-center">
        <PageHeading
          title="My Holdings"
          description="View all tokens you've bought"
          line={1}
          showDescriptionOnMobile
        />
        <DexBuySettings variant="Holdings" />
      </div>
      <HoldingsListSection />
    </NoScrollLayout>
  );
}
