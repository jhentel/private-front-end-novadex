/* eslint-disable react/no-unescaped-entities */
"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useState, useCallback, useEffect } from "react";
import { useWhatsNewStore } from "@/stores/use-whats-new.store";
// ######## Components 🧩 ########
import Preloader from "@/components/customs/Preloader";
import NoScrollLayout from "../layouts/NoScrollLayout";
import PageHeading from "./headings/PageHeading";
import BlacklistedModal from "./modals/BlacklistedModal";
import CustomCardView from "./CustomCardView";
import CosmoBuySettings from "./CosmoBuySettings";
import Separator from "./Separator";
import CosmoListTabSection from "./sections/CosmoListTabSection";
import { cn } from "@/libraries/utils";
import { usePopupStore } from "@/stores/use-popup-state";

interface CosmoClientProps {
  initialIsNewUser: boolean;
}

const CosmoClient = ({ initialIsNewUser }: CosmoClientProps) => {
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const [isInitialFetchFinished] = useState<boolean>(true);
  // const [isNewFeatureModalOpen, setIsNewFeatureModalOpen] =
  //   useState<boolean>(false);

  const setIsShowWhatsNew = useWhatsNewStore(
    (state) => state.setIsShowWhatsNew,
  );

  // Check localStorage to see if we should show the new features modal
  useEffect(() => {
    if (typeof window !== "undefined") {
      const shouldShowModal =
        localStorage.getItem("show_new_features_modal") === "true";
      if (shouldShowModal) {
        // setIsNewFeatureModalOpen(true);
        setIsShowWhatsNew(true);
        // Clear the flag so it only shows once after login
        localStorage.removeItem("show_new_features_modal");
      }
    }
  }, []);

  useEffect(() => {
    setIsPageLoading(false);
  }, [isInitialFetchFinished]);

  const remainingScreenWidth = usePopupStore(
    (state) => state.remainingScreenWidth,
  );

  return (
    <>
      <NoScrollLayout>
        <div
          className={cn(
            "flex w-full flex-col justify-between gap-y-2 px-4 pb-4 pt-4 lg:px-0 xl:flex-row xl:gap-y-4",
            remainingScreenWidth >= 1314.9 || isPageLoading
              ? "xl:flex-row"
              : "xl:flex-col",
          )}
        >
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
      {initialIsNewUser && (
        <Preloader vanillaCSSAnimation vanillaLoadingState={isPageLoading} />
      )}
    </>
  );
};

export default React.memo(CosmoClient);
