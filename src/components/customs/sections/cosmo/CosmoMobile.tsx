import dynamic from "next/dynamic";
import CosmoListSectionLoading from "../../loadings/CosmoListSectionLoading";
import NewlyCreatedListFilterPopover from "../../popovers/NewlyCreatedListFilterPopover";
import AboutToGraduateListFilterPopover from "../../popovers/AboutToGraduateListFilterPopover";
import GraduatedListFilterPopover from "../../popovers/GraduatedListFilterPopover";
import { ChangeEvent, useCallback, useEffect, useState, useMemo } from "react";
import { cn } from "@/libraries/utils";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { useSearchFilterStore } from "@/stores/cosmo/use-search-filter.store";
import { CosmoProps } from "./CosmoDesktop";
import { useNewlyCreatedFilterStore } from "@/stores/cosmo/use-newly-created-filter.store";
import debounce from "lodash/debounce";
import { useAboutToGraduateFilterStore } from "@/stores/cosmo/use-about-to-graduate-filter.store";
import { useGraduatedFilterStore } from "@/stores/cosmo/use-graduated-filter.store";
import { CosmoFilterSubscribeMessageType } from "@/types/ws-general";
import { NewlyCreatedListProps } from "@/components/customs/lists/NewlyCreatedList";
import { AboutToGraduateListProps } from "@/components/customs/lists/AboutToGraduateList";
import { GraduatedListProps } from "@/components/customs/lists/GraduatedList";
import { CosmoSound } from "@/components/customs/popovers/CosmoSound";
import { useActiveTabStore } from "@/stores/cosmo/use-active-tab.store";

const NewlyCreatedList = dynamic(
  () => import("@/components/customs/lists/NewlyCreatedList"),
  {
    loading: () => <CosmoListSectionLoading column={1} variant="mobile" />,
    ssr: false,
  },
);

const AboutToGraduateList = dynamic(
  () => import("@/components/customs/lists/AboutToGraduateList"),
  {
    loading: () => <CosmoListSectionLoading column={2} variant="mobile" />,
    ssr: false,
  },
);

const GraduatedList = dynamic(
  () => import("@/components/customs/lists/GraduatedList"),
  {
    loading: () => <CosmoListSectionLoading column={3} variant="mobile" />,
    ssr: false,
  },
);
type TabLabel = "Newly Created" | "About to Graduate" | "Graduated";

type Tab = {
  label: TabLabel;
  list: React.ComponentType<
    NewlyCreatedListProps | AboutToGraduateListProps | GraduatedListProps
  >;
  filter: React.ComponentType<{
    handleSendFilterMessage: (
      category: "created" | "aboutToGraduate" | "graduated",
      filterObject: CosmoFilterSubscribeMessageType,
    ) => void;
  }>;
};

const tabList: Tab[] = [
  {
    label: "Newly Created",
    list: NewlyCreatedList,
    filter: NewlyCreatedListFilterPopover,
  },
  {
    label: "About to Graduate",
    list: AboutToGraduateList,
    filter: AboutToGraduateListFilterPopover,
  },
  {
    label: "Graduated",
    list: GraduatedList,
    filter: GraduatedListFilterPopover,
  },
];
const CosmoMobile = ({
  isLoading,
  trackedWalletsOfToken,
  handleSendFilterMessage,
}: CosmoProps) => {
  // Active Tab Configuration 📄
  const activeTab = useActiveTabStore((state) => state.activeTab);
  const setActiveTab = useActiveTabStore((state) => state.setActiveTab);

  // SEARCH STATE NEWLY CREATED
  const setPreviewSearchNewly = useNewlyCreatedFilterStore(
    (s) => s.setPreviewSearch,
  );
  const previewSearchValueNewly = useNewlyCreatedFilterStore(
    (s) => s.filters.preview.showKeywords,
  );
  const applyFilterNewly = useNewlyCreatedFilterStore(
    (s) => s.applyNewlyCreatedFilters,
  );
  const setIsLoadingFilterFetchNewly = useNewlyCreatedFilterStore(
    (state) => state.setIsLoadingFilterFetch,
  );
  const updateNewlyCreatedFiltersCount = useNewlyCreatedFilterStore(
    (state) => state.updateNewlyCreatedFiltersCount,
  );

  // SEARCH STATE ABOUT TO GRADUATE
  const setPreviewSearchAboutToGraduate = useAboutToGraduateFilterStore(
    (s) => s.setPreviewSearch,
  );
  const previewSearchValueAboutToGraduate = useAboutToGraduateFilterStore(
    (s) => s.filters.preview.showKeywords,
  );
  const applyFilterAboutToGraduate = useAboutToGraduateFilterStore(
    (s) => s.applyAboutToGraduateFilters,
  );
  const setIsLoadingFilterFetchAboutToGraduate = useAboutToGraduateFilterStore(
    (state) => state.setIsLoadingFilterFetch,
  );
  const updateAboutToGraduateFiltersCount = useAboutToGraduateFilterStore(
    (state) => state.updateAboutToGraduateFiltersCount,
  );

  // SEARCH STATE GRADUATED
  const setPreviewSearchGraduated = useGraduatedFilterStore(
    (s) => s.setPreviewSearch,
  );
  const previewSearchValueGraduated = useGraduatedFilterStore(
    (s) => s.filters.preview.showKeywords,
  );
  const applyFilterGraduated = useGraduatedFilterStore(
    (s) => s.applyGraduatedFilters,
  );
  const setIsLoadingFilterFetchGraduated = useGraduatedFilterStore(
    (state) => state.setIsLoadingFilterFetch,
  );
  const updateGraduatedFiltersCount = useGraduatedFilterStore(
    (state) => state.updateGraduatedFiltersCount,
  );

  // Function to get the current search value based on active tab
  const currentSearchValue = useMemo(() => {
    if (activeTab === "Newly Created") {
      return previewSearchValueNewly;
    } else if (activeTab === "About to Graduate") {
      return previewSearchValueAboutToGraduate;
    } else {
      return previewSearchValueGraduated;
    }
  }, [
    activeTab,
    previewSearchValueNewly,
    previewSearchValueAboutToGraduate,
    previewSearchValueGraduated,
  ]);

  const debouncedSetGenuineSearch = useCallback(
    debounce(async () => {
      if (activeTab === "Newly Created") {
        setIsLoadingFilterFetchNewly(true);
        applyFilterNewly();
        updateNewlyCreatedFiltersCount();
      } else if (activeTab === "About to Graduate") {
        setIsLoadingFilterFetchAboutToGraduate(true);
        applyFilterAboutToGraduate();
        updateAboutToGraduateFiltersCount();
      } else if (activeTab === "Graduated") {
        setIsLoadingFilterFetchGraduated(true);
        applyFilterGraduated();
        updateGraduatedFiltersCount();
      }
    }, 300),
    [
      activeTab,
      applyFilterNewly,
      applyFilterAboutToGraduate,
      applyFilterGraduated,
      setIsLoadingFilterFetchNewly,
      setIsLoadingFilterFetchAboutToGraduate,
      setIsLoadingFilterFetchGraduated,
      updateNewlyCreatedFiltersCount,
      updateAboutToGraduateFiltersCount,
      updateGraduatedFiltersCount,
    ],
  );

  // function to handle search input changes - only update the active tab's search
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      // Only update the search state for the active tab
      if (activeTab === "Newly Created") {
        setPreviewSearchNewly(value);
      } else if (activeTab === "About to Graduate") {
        setPreviewSearchAboutToGraduate(value);
      } else if (activeTab === "Graduated") {
        setPreviewSearchGraduated(value);
      }

      debouncedSetGenuineSearch();
    },
    [
      activeTab,
      setPreviewSearchNewly,
      setPreviewSearchAboutToGraduate,
      setPreviewSearchGraduated,
      debouncedSetGenuineSearch,
    ],
  );

  return (
    <div className="relative mb-12 flex w-full flex-grow grid-cols-1 xl:mb-3.5">
      <div className="col-span-1 flex w-full flex-grow flex-col">
        <div className="flex w-full items-center justify-between border-b border-border pr-4">
          <div className="flex h-[48px] w-full max-w-[384px] items-center">
            {tabList.map((tab) => {
              const isActive = activeTab === tab.label;

              return (
                <button
                  key={tab.label}
                  onClick={() => {
                    setActiveTab(tab.label);
                    debouncedSetGenuineSearch();
                  }}
                  className={cn(
                    "relative flex h-[48px] w-full items-center justify-center px-1 py-[14px]",
                  )}
                >
                  <span
                    className={cn(
                      "line-clamp-1 text-sm",
                      isActive ? "text-[#DF74FF]" : "text-fontColorSecondary",
                    )}
                  >
                    {tab.label}
                  </span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 h-[3px] w-full rounded-t-[100px] bg-primary"></div>
                  )}
                </button>
              );
            })}
          </div>
          <div className="pl-2">
            {tabList.map((tab) => {
              const isActive = activeTab === tab.label;
              const FilterComponent = tab.filter;

              return isActive ? (
                <FilterComponent
                  key={tab.label}
                  handleSendFilterMessage={handleSendFilterMessage}
                />
              ) : null;
            })}
          </div>
        </div>

        <div className="w-full px-4 pt-4">
          <div className="relative h-8 w-full">
            <div className="absolute left-3 top-1/2 z-10 aspect-square h-4 w-4 flex-shrink-0 -translate-y-1/2">
              <Image
                src="/icons/search-input.png"
                alt="Search Icon"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search tokens..."
                className="h-8 pl-8"
                value={currentSearchValue}
                onChange={handleSearchChange}
              />
              <CosmoSound
                listType={
                  activeTab === "Newly Created"
                    ? "newlyCreated"
                    : activeTab === "About to Graduate"
                      ? "aboutToGraduate"
                      : "graduated"
                }
              />
            </div>
          </div>
        </div>

        {tabList.map((tab) => {
          const isActive = activeTab === tab.label;
          const ListComponent = tab.list;

          return isActive ? (
            <ListComponent
              key={tab.label}
              sizeVariant="mobile"
              trackedWalletsOfToken={trackedWalletsOfToken}
              isLoading={isLoading}
              handleSendFilterMessage={handleSendFilterMessage}
            />
          ) : null;
        })}
      </div>
    </div>
  );
};

export default CosmoMobile;
