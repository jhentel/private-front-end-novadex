import NoScrollLayout from "@/components/layouts/NoScrollLayout";
import React from "react";
import PageHeading from "../headings/PageHeading";
import Separator from "../Separator";
import CosmoListSectionLoading from "./CosmoListSectionLoading";

const CosmoPageLoading = () => {
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
          </div>
        </div>

        <Separator color="#242436" className="hidden xl:block" />

        <div className="relative mb-14 hidden w-full flex-grow grid-cols-3 gap-x-5 bg-[#080811] xl:mb-12 xl:grid">
          <CosmoListSectionLoading column={1} variant="desktop" />
          <CosmoListSectionLoading column={2} variant="desktop" />
          <CosmoListSectionLoading column={3} variant="desktop" />
        </div>
      </NoScrollLayout>
    </>
  );
};

export default CosmoPageLoading;
