import React from "react";
import NoScrollLayout from "./NoScrollLayout";
import PageHeading from "../customs/headings/PageHeading";
import BlacklistedModal from "../customs/modals/BlacklistedModal";
import CustomCardView from "../customs/CustomCardView";
import CosmoBuySettings from "../customs/CosmoBuySettings";
import Separator from "../customs/Separator";
import CosmoListTabSection from "../customs/sections/CosmoListTabSection";

const CosmoLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <NoScrollLayout>
        <div className="flex w-full flex-col flex-wrap justify-between gap-y-2 px-4 pb-4 pt-4 lg:px-0 xl:flex-row xl:items-center xl:gap-y-4">
          <div className="flex items-center gap-x-2">
            <PageHeading
              title="The Cosmo"
              description="Real-time feed of tokens throughout their lifespan."
              line={1}
            />
            <BlacklistedModal />
          </div>

          <div className="flex items-center gap-x-2">
            <CustomCardView />
            <CosmoBuySettings />
          </div>
        </div>

        <Separator color="#242436" className="hidden xl:block" />

        <CosmoListTabSection />
      </NoScrollLayout>
      {children}
    </>
  );
};

export default CosmoLayout;
