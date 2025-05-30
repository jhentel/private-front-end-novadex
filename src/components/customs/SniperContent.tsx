import Image from "next/image";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import SnipeNewPairContent from "./modals/contents/footer/actions/SnipeNewPairContent";
import FooterModal from "./modals/FooterModal";
import BaseButton from "./buttons/BaseButton";
import SnipeMigrationContent from "./modals/contents/footer/actions/SnipeMigrationContent";
import { useCallback, useMemo, useState } from "react";
import { TabLabel, tabList } from "./modals/contents/footer/SniperModalContent";
import { useSniperFooterStore } from "@/stores/footer/use-sniper-footer.store";
import { cn } from "@/libraries/utils";
import SniperMigratingTable from "./tables/footer/SniperMigratingTable";
import SniperCompletedTable from "./tables/footer/SniperCompletedTable";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";

function SniperContent() {
  const [activeTab, setActiveTab] = useState<TabLabel>("Migrating");
  const [openSnipeMigrationModal, setOpenSnipeMigrationModal] = useState(false);
  const [openSnipeNewPairModal, setOpenSnipeNewPairModal] = useState(false);
  const [openPopoverMobile, setOpenPopoverMobile] = useState(false);

  const isLoading = useSniperFooterStore((state) => !state.isFetchedState);
  const tokenInfoState = useSniperFooterStore((state) => state.tokenInfoState);
  const sniperState = useSniperFooterStore((state) => state.sniperState);

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

  // Memoize tab buttons
  const TabButtons = useMemo(() => {
    return tabList.map((tab) => {
      const isActive = activeTab === tab.label;

      return (
        <button
          key={tab.label}
          onClick={() => handleTabChange(tab.label)}
          className="relative flex h-[48px] items-center justify-center gap-x-[12px] bg-white/[4%] px-4 max-xl:w-[100%]"
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
    <div className="flex h-full w-full flex-col md:flex-grow">
      {TableComponent}
      {/* Mobile Task Button */}
      <div className="flex w-full justify-center border-t border-border bg-card p-3.5 xl:hidden">
        <Popover open={openPopoverMobile} onOpenChange={setOpenPopoverMobile}>
          <PopoverTrigger asChild className="relative z-[5] w-full">
            <BaseButton
              variant="primary"
              className="h-[32px] w-full xl:hidden"
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
            className="gb__white__popover z-[500] flex w-[90vw] flex-col gap-y-1 rounded-[8px] border-2 border-border bg-card p-2 shadow-[0_0_20px_0_#000000] xl:hidden"
          >
            <Drawer>
              <DrawerTrigger asChild>
                <button className="popover__button">
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
              </DrawerTrigger>
              <DrawerContent overlayClassname="z-[500]" className="z-[600]">
                <DrawerTitle className="sr-only">Snipe Migration</DrawerTitle>
                <SnipeMigrationContent
                  isOpen={openSnipeMigrationModal}
                  toggleModal={handleToggleOpenSnipeMigrationModal}
                  isDrawer
                />
              </DrawerContent>
            </Drawer>
            <Drawer>
              <DrawerTrigger asChild>
                <button className="popover__button">
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
                    Snipe New Pair
                  </span>
                </button>
              </DrawerTrigger>
              <DrawerContent overlayClassname="z-[500]" className="z-[600]">
                <DrawerTitle className="sr-only">Snipe New Pair</DrawerTitle>
                <SnipeNewPairContent
                  toggleModal={handleToggleOpenSnipeNewPairModal}
                  isDrawer
                />
              </DrawerContent>
            </Drawer>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

export default SniperContent;
