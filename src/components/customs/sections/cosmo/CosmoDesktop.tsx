import React from "react";
import NewlyCreatedList from "../../lists/NewlyCreatedList";
import AboutToGraduateList from "../../lists/AboutToGraduateList";
import GraduatedList from "../../lists/GraduatedList";
import { CosmoFilterSubscribeMessageType } from "@/types/ws-general";

export interface CosmoProps {
  isLoading: boolean;
  trackedWalletsOfToken: Record<string, string[]>;
  handleSendFilterMessage: (
    category: "created" | "aboutToGraduate" | "graduated",
    filterObject: CosmoFilterSubscribeMessageType,
  ) => void;
}
const CosmoDesktop = ({
  isLoading,
  trackedWalletsOfToken,
  handleSendFilterMessage,
}: CosmoProps) => {
  return (
    <div
      className={
        "relative h-full w-full flex-grow grid-cols-3 gap-x-5 bg-[#080811] xl:mb-12 xl:grid"
      }
    >
      <NewlyCreatedList
        sizeVariant="desktop"
        isLoading={isLoading}
        trackedWalletsOfToken={trackedWalletsOfToken}
        handleSendFilterMessage={handleSendFilterMessage}
      />
      <AboutToGraduateList
        sizeVariant="desktop"
        isLoading={isLoading}
        trackedWalletsOfToken={trackedWalletsOfToken}
        handleSendFilterMessage={handleSendFilterMessage}
      />
      <GraduatedList
        sizeVariant="desktop"
        isLoading={isLoading}
        trackedWalletsOfToken={trackedWalletsOfToken}
        handleSendFilterMessage={handleSendFilterMessage}
      />
    </div>
  );
};

export default React.memo(CosmoDesktop);
