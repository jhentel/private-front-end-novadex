"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
// ######## Components 🧩 ########
import SnipeMigrationContent from "@/components/customs/modals/contents/footer/actions/SnipeMigrationContent";
import SnipeNewPairContent from "@/components/customs/modals/contents/footer/actions/SnipeNewPairContent";
import FooterModal from "@/components/customs/modals/FooterModal";
import SniperMigratingTable from "@/components/customs/tables/footer/SniperMigratingTable";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";
// ######## Utils & Helpers 🤝 ########
import { clearFooterSection } from "@/apis/rest/footer";
import { SniperTask } from "@/apis/rest/sniper";
import BaseButton from "@/components/customs/buttons/BaseButton";
import SniperCompletedTable from "@/components/customs/tables/footer/SniperCompletedTable";
import { cn } from "@/libraries/utils";
import { useFooterStore } from "@/stores/footer/use-footer.store";
import { useSniperFooterStore } from "@/stores/footer/use-sniper-footer.store";
import ConfigureSniper from "./twitter/ConfigureSniper";
import SnipeTwitterContent from "./actions/SnipeTwitterContent";

export type TabLabel = "Migrating" | "Completed";

type Tab = {
  label: TabLabel;
  tooltipDescription: string;
  table: React.ComponentType<{ tasks?: SniperTask[]; isLoading: boolean }>;
};

export const tabList: Tab[] = [
  {
    label: "Migrating",
    tooltipDescription: "Migrating Information",
    table: SniperMigratingTable,
  },
  {
    label: "Completed",
    tooltipDescription: "Completed Information",
    table: SniperCompletedTable,
  },
];

export default function SniperModalContent({
  toggleModal,
}: {
  toggleModal: () => void;
}) {
  const [activeTab, setActiveTab] = useState<TabLabel>("Migrating");
  const [openSnipeMigrationModal, setOpenSnipeMigrationModal] =
    useState<boolean>(false);
  const [openSnipeNewPairModal, setOpenSnipeNewPairModal] =
    useState<boolean>(false);
  const [openSnipeTwitterModal, setOpenSnipeTwitterModal] =
    useState<boolean>(false);
  const [openPopoverDesktop, setOpenPopoverDesktop] = useState(false);
  const [openPopoverMobile, setOpenPopoverMobile] = useState(false);
  const setFooterMessage = useFooterStore((state) => state.setMessage);

  const isLoading = useSniperFooterStore((state) => !state.isFetchedState);
  const tokenInfoState = useSniperFooterStore((state) => state.tokenInfoState);
  const sniperState = useSniperFooterStore((state) => state.sniperState);

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined;
    if (tokenInfoState) {
      setOpenSnipeMigrationModal(true);
      timeout = setTimeout(() => {
        setOpenPopoverDesktop(true);
        setOpenPopoverMobile(true);
      }, 10);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [tokenInfoState?.mint]);

  // Add query for sniper tasks
  useQuery({
    queryKey: ["sniper-clear"],
    queryFn: async () => {
      const footer = await clearFooterSection("sniper");
      setFooterMessage(footer);
      return footer;
    },
  });

  // Memoize callbacks
  const handleTabChange = useCallback((tab: TabLabel) => {
    setActiveTab(tab);
  }, []);

  const handleToggleOpenSnipeMigrationModal = useCallback(() => {
    setOpenSnipeMigrationModal((prev) => !prev);
  }, []);

  const handleToggleOpenSnipeNewPairModal = useCallback(() => {
    setOpenSnipeNewPairModal((prev) => !prev);
  }, []);

  const handleToggleOpenSnipeTwitterModal = useCallback(() => {
    setOpenSnipeTwitterModal((prev) => !prev);
  }, []);

  const handleModalClose = useCallback(() => {
    setOpenPopoverMobile(false);
    setOpenPopoverDesktop(false);
    toggleModal();
  }, [toggleModal]);

  // Memoize tab buttons
  const TabButtons = useMemo(() => {
    return tabList.map((tab) => {
      const isActive = activeTab === tab.label;

      return (
        <button
          key={tab.label}
          onClick={() => handleTabChange(tab.label)}
          className="relative flex h-[48px] items-center justify-center gap-x-[12px] bg-white/[4%] px-4 max-md:w-[100%]"
        >
          <span
            className={cn(
              "text-nowrap font-geistSemiBold text-sm",
              isActive ? "text-fontColorAction" : "text-fontColorSecondary",
            )}
          >
            {tab.label}
          </span>

          {isActive && (
            <div className="absolute bottom-0 left-0 h-[3px] w-full rounded-t-[100px] bg-primary"></div>
          )}
        </button>
      );
    });
  }, [activeTab, handleTabChange]);

  // Memoize table content
  const TableContent = useMemo(() => {
    return tabList.map((tab) => {
      const isActive = activeTab === tab.label;
      const TableComponent = tab.table;
      return isActive ? (
        <TableComponent isLoading={isLoading} key={tab.label} />
      ) : null;
    });
  }, [activeTab, isLoading]);

  // Memoize table component
  const TableComponent = useMemo(() => {
    return (
      <>
        <div className="flex h-[48px] w-full items-center border-b border-border">
          {TabButtons}
        </div>
        <div className="relative grid w-full flex-grow grid-cols-1">
          {/* Pass data to table */}
          {activeTab === "Migrating" && (
            <SniperMigratingTable tasks={sniperState} isLoading={isLoading} />
          )}
          {activeTab === "Completed" && (
            <SniperCompletedTable tasks={sniperState} isLoading={isLoading} />
          )}
        </div>
      </>
    );
  }, [TabButtons, TableContent, activeTab, sniperState, isLoading]);

  return (
    <>
      <div className="flex h-[48px] w-full justify-between border-border px-4 py-[14px] max-md:items-center max-md:border-b max-md:py-4 md:pt-[18px]">
        <h4 className="text-nowrap font-geistSemiBold text-[18px] text-fontColorPrimary">
          Sniper
        </h4>
        {/* Desktop Task Button */}
        <Popover open={openPopoverDesktop} onOpenChange={setOpenPopoverDesktop}>
          <PopoverTrigger asChild>
            <BaseButton
              onClick={() => setOpenPopoverDesktop((prev) => !prev)}
              variant="primary"
              className="h-[32px] pl-[8px] pr-[12px] max-md:hidden"
              prefixIcon={
                <div className="relative aspect-square size-4 flex-shrink-0">
                  <Image
                    src="/icons/add.png"
                    alt="Add Icon"
                    fill
                    quality={100}
                    className="object-contain duration-300"
                  />
                </div>
              }
            >
              <span className="inline-block font-geistSemiBold text-sm text-[#080811]">
                Add Task
              </span>
            </BaseButton>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={6}
            className={
              "gb__white__popover z-[130] hidden w-[200px] flex-col gap-y-1 rounded-[8px] border-2 border-border bg-card p-2 shadow-[0_0_20px_0_#000000] max-md:hidden md:flex"
            }
          >
            <FooterModal
              modalState={openSnipeMigrationModal}
              toggleModal={handleToggleOpenSnipeMigrationModal}
              layer={2}
              responsiveWidthAt={920}
              triggerChildren={
                <button
                  onClick={handleToggleOpenSnipeMigrationModal}
                  className="popover__button"
                >
                  <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                    <Image
                      src="/icons/footer/snipe-migration.png"
                      alt="Snipe Migration Icon"
                      fill
                      quality={100}
                      className="object-contain"
                    />
                  </div>
                  <span className="inline-block text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
                    Snipe Migration
                  </span>
                </button>
              }
              contentClassName="w-full max-w-[456px] flex flex-col h-auto md:bottom-[50px]"
            >
              <SnipeMigrationContent
                isOpen={openSnipeMigrationModal}
                toggleModal={handleToggleOpenSnipeMigrationModal}
              />
            </FooterModal>

            <FooterModal
              modalState={openSnipeNewPairModal}
              toggleModal={handleToggleOpenSnipeNewPairModal}
              layer={2}
              responsiveWidthAt={920}
              triggerChildren={
                <button
                  onClick={handleToggleOpenSnipeNewPairModal}
                  className="popover__button"
                >
                  <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                    <Image
                      src="/icons/footer/snipe-new-pair.png"
                      alt="Snipe New Pair Icon"
                      fill
                      quality={100}
                      className="object-contain"
                    />
                  </div>
                  <span className="inline-block text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
                    Snipe New Pair
                  </span>
                </button>
              }
              contentClassName="w-full max-w-[456px] flex flex-col h-auto md:bottom-[50px]"
            >
              <SnipeNewPairContent
                toggleModal={handleToggleOpenSnipeNewPairModal}
              />
            </FooterModal>

            <FooterModal
              modalState={openSnipeTwitterModal}
              toggleModal={handleToggleOpenSnipeTwitterModal}
              layer={2}
              responsiveWidthAt={920}
              triggerChildren={
                <button
                  onClick={handleToggleOpenSnipeTwitterModal}
                  className="popover__button"
                >
                  <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                    <Image
                      src="/icons/footer/snipe-new-pair.png"
                      alt="Snipe New Pair Icon"
                      fill
                      quality={100}
                      className="object-contain"
                    />
                  </div>
                  <span className="inline-block text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
                    Snipe Twitter
                  </span>
                </button>
              }
              contentClassName="w-full max-w-[456px] flex flex-col h-auto md:bottom-[50px]"
            >
              <SnipeTwitterContent toggleModal={handleToggleOpenSnipeTwitterModal} />
            </FooterModal>
          </PopoverContent>
        </Popover>

        {/* X for mobile close modal */}
        <button
          onClick={handleModalClose}
          className="relative aspect-square h-6 w-6 flex-shrink-0 duration-300 hover:opacity-70 md:hidden"
        >
          <Image
            src="/icons/close.png"
            alt="Close Icon"
            fill
            quality={100}
            className="object-contain"
          />
        </button>
      </div>

      {/* Table Tabs */}
      <div className="flex h-full w-full flex-col md:flex-grow">
        {TableComponent}

        {/* Mobile Task Button */}
        <div className="flex w-full justify-center border-t border-border bg-card p-3.5 md:hidden">
          <Popover open={openPopoverMobile} onOpenChange={setOpenPopoverMobile}>
            <PopoverTrigger asChild className="relative z-[5] w-full">
              <BaseButton
                onClick={() => setOpenPopoverMobile((prev) => !prev)}
                variant="primary"
                className="h-[32px] w-full md:hidden"
                prefixIcon={
                  <div className="relative aspect-square size-4 flex-shrink-0">
                    <Image
                      src="/icons/add.png"
                      alt="Add Icon"
                      fill
                      quality={100}
                      className="object-contain duration-300"
                    />
                  </div>
                }
              >
                <span className="inline-block font-geistSemiBold text-sm text-[#080811]">
                  Add Task
                </span>
              </BaseButton>
            </PopoverTrigger>
            <PopoverContent
              align="center"
              sideOffset={6}
              className="gb__white__popover z-[130] flex w-[90vw] flex-col gap-y-1 rounded-[8px] border-2 border-border bg-card p-2 shadow-[0_0_20px_0_#000000] md:hidden"
            >
              <FooterModal
                modalState={openSnipeMigrationModal}
                toggleModal={handleToggleOpenSnipeMigrationModal}
                layer={2}
                responsiveWidthAt={920}
                triggerChildren={
                  <button
                    onClick={handleToggleOpenSnipeMigrationModal}
                    className="popover__button"
                  >
                    <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                      <Image
                        src="/icons/footer/snipe-migration.png"
                        alt="Snipe Migration Icon"
                        fill
                        quality={100}
                        className="object-contain"
                      />
                    </div>
                    <span className="inline-block text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
                      Snipe Migration
                    </span>
                  </button>
                }
                contentClassName="w-full max-w-[456px] flex flex-col h-[70dvh] md:h-auto md:hidden max-md:bottom-[40px]"
              >
                <SnipeMigrationContent
                  isOpen={openSnipeMigrationModal}
                  toggleModal={handleToggleOpenSnipeMigrationModal}
                />
              </FooterModal>

              <FooterModal
                modalState={openSnipeNewPairModal}
                toggleModal={handleToggleOpenSnipeNewPairModal}
                layer={2}
                responsiveWidthAt={920}
                triggerChildren={
                  <button
                    onClick={handleToggleOpenSnipeNewPairModal}
                    className="popover__button"
                  >
                    <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                      <Image
                        src="/icons/footer/snipe-new-pair.png"
                        alt="Snipe New Pair Icon"
                        fill
                        quality={100}
                        className="object-contain"
                      />
                    </div>
                    <span className="inline-block text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
                      Snipe New Pair
                    </span>
                  </button>
                }
                contentClassName="w-full max-w-[456px] flex flex-col h-[70dvh] md:h-auto md:hidden max-md:bottom-[40px]"
              >
                <SnipeNewPairContent
                  toggleModal={handleToggleOpenSnipeNewPairModal}
                />
              </FooterModal>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </>
  );
}
