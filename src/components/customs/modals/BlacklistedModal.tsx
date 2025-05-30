"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useBlacklistedDeveloperFilterStore } from "@/stores/cosmo/use-blacklisted-developer-filter.store";
import toast from "react-hot-toast";
import cookies from "js-cookie";
// ######## APIs 🛜 ########
import {
  getBlacklistedDevelopers,
  updateUserBlacklistedDevelopers,
} from "@/apis/rest/cosmo";
// ######## Components 🧩 ########
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import BaseButton from "@/components/customs/buttons/BaseButton";
import { Skeleton } from "@/components/ui/skeleton";
import CustomToast from "@/components/customs/toasts/CustomToast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

import truncateCA from "@/utils/truncateCA";
import { useWindowSizeStore } from "@/stores/use-window-size.store";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { AxiosError } from "axios";
import { useNewlyCreatedFilterStore } from "@/stores/cosmo/use-newly-created-filter.store";
import convertCosmoIntoWSFilterFormat from "@/utils/convertCosmoIntoWSFilterFormat";
import { DynamicCosmoFilterSubscriptionMessageType } from "@/types/ws-general";
import { webSocketManager } from "@/lib/websocket-manager";
import { useAboutToGraduateFilterStore } from "@/stores/cosmo/use-about-to-graduate-filter.store";
import { useGraduatedFilterStore } from "@/stores/cosmo/use-graduated-filter.store";
import { useHiddenTokensStore } from "@/stores/cosmo/use-hidden-tokens.store";

export default function BlacklistedModal() {
  const queryClient = useQueryClient();
  const { width } = useWindowSizeStore();
  const setGlobalIsModalOpen = useBlacklistedDeveloperFilterStore(
    (state) => state.setIsModalOpen,
  );
  const setGlobalBlacklistedDevelopers = useBlacklistedDeveloperFilterStore(
    (state) => state.setBlacklistedDevelopers,
  );

  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const handleDialogClose = (isOpen: boolean) => {
    setOpenDialog(isOpen);
  };

  const [blacklistedDeveloperAddress, setBlacklistedDeveloperAddress] =
    useState<string>("");

  const [blacklistedDevelopers, setBlacklistedDevelopers] = useState<string[]>(
    [],
  );

  const { isLoading } = useQuery({
    queryKey: ["blacklisted-developers"],
    queryFn: async () => {
      try {
        const data = await getBlacklistedDevelopers();

        if (data) {
          setBlacklistedDevelopers(data);
        }
        return data;
      } catch (error) {
        if (error instanceof AxiosError) {
          throw new Error(
            error.response?.data?.message ||
              "Failed to fetch user's blacklisted developers",
          );
        }
        throw new Error("Failed to fetch user's blacklisted developers");
      }
    },
    retry: 3,
  });

  const [isAdding, setIsAdding] = useState<boolean>(false);
  const handleAddBlacklistedDeveloper = async (
    address: string,
    blacklistedDeveloperAddress: string,
  ) => {
    if (blacklistedDeveloperAddress.trim() === "") {
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          state="ERROR"
          message="Enter Developer Address"
        />
      ));
      return;
    }
    if (
      blacklistedDeveloperAddress.length < 36 ||
      blacklistedDeveloperAddress.length > 50
    ) {
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          state="ERROR"
          message="Wrong Address Format"
        />
      ));
      return;
    }
    if (blacklistedDevelopers.find((item) => item === address)) {
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          state="ERROR"
          message="Address Already Added"
        />
      ));
      return;
    }

    setIsAdding(true);
    try {
      const result = await updateUserBlacklistedDevelopers([
        ...blacklistedDevelopers,
        address,
      ]);

      if (!result.success) {
        setIsAdding(false);
        toast.custom((t: any) => (
          <CustomToast
            tVisibleState={t.visible}
            state="ERROR"
            message={result.message || "Failed to add address"}
          />
        ));
        return;
      }

      setIsAdding(false);
      setBlacklistedDevelopers(blacklistedDevelopers);
      setGlobalBlacklistedDevelopers(blacklistedDevelopers);
      setBlacklistedDeveloperAddress("");
      await queryClient.invalidateQueries({
        queryKey: ["blacklisted-developers"],
      });
      // revalidate cosmo blacklisted-developers endpoint. the querykey shoulud be diffrent
      await queryClient.invalidateQueries({
        queryKey: ["blacklisted-developers-cosmo"],
      });

      toast.custom((t: any) => (
        <CustomToast tVisibleState={t.visible} message={`${address} Added`} />
      ));
    } catch (error) {
      setIsAdding(false);
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          state="ERROR"
          message="Failed to add address"
        />
      ));
    }
  };

  const hiddenTokens = useHiddenTokensStore((s) => s.hiddenTokens);

  const latestGenuineNewlyCreatedFilters =
    useNewlyCreatedFilterStore.getState().filters.genuine;

  const latestGenuineAboutToGraduateFilters =
    useAboutToGraduateFilterStore.getState().filters.genuine;

  const latestGenuineGraduatedFilters =
    useGraduatedFilterStore.getState().filters.genuine;

  const handleRemoveBlacklistedDeveloper = async (
    address: string,
    blacklistedDevelopers: string[],
  ) => {
    try {
      const result = await updateUserBlacklistedDevelopers(
        blacklistedDevelopers.filter(
          (blacklistedDeveloperAddress) =>
            blacklistedDeveloperAddress !== address,
        ),
      );

      if (!result.success) {
        toast.custom((t: any) => (
          <CustomToast
            tVisibleState={t.visible}
            state="ERROR"
            message={result.message || "Failed to remove address"}
          />
        ));
        return;
      }

      setBlacklistedDevelopers(blacklistedDevelopers);
      setGlobalBlacklistedDevelopers(blacklistedDevelopers);
      await queryClient.invalidateQueries({
        queryKey: ["blacklisted-developers"],
      });
      // revalidate cosmo blacklisted-developers endpoint. the querykey shoulud
      await queryClient.invalidateQueries({
        queryKey: ["blacklisted-developers-cosmo"],
      });

      if (blacklistedDevelopers.length === 1) {
        // resend to ws when user delete the last data from the blacklistdeveloper (empty blacklist developer).
        const token = cookies.get("_nova_session");
        if (!token || token === "") return;
        const filterSubscriptionMessage: DynamicCosmoFilterSubscriptionMessageType =
          {
            action: "update",
            channel: "cosmo2",
            token,
            created: convertCosmoIntoWSFilterFormat(
              latestGenuineNewlyCreatedFilters,
              [],
              hiddenTokens?.join(","),
              "created",
            ),
            aboutToGraduate: convertCosmoIntoWSFilterFormat(
              latestGenuineAboutToGraduateFilters,
              [],
              hiddenTokens?.join(","),
              "aboutToGraduate",
            ),
            graduated: convertCosmoIntoWSFilterFormat(
              latestGenuineGraduatedFilters,
              [],
              hiddenTokens?.join(","),
              "graduated",
            ),
          };
        webSocketManager.send(filterSubscriptionMessage);
      }

      toast.custom((t: any) => (
        <CustomToast tVisibleState={t.visible} message={`${address} Removed`} />
      ));
    } catch (error) {
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          state="ERROR"
          message="Failed to remove address"
        />
      ));
    }
  };

  useEffect(() => {
    setGlobalIsModalOpen(openDialog);
  }, [openDialog]);

  if (width && width > 1280) {
    return (
      <Dialog open={openDialog} onOpenChange={handleDialogClose}>
        <DialogTrigger asChild>
          <div className="cursor-pointer">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger id="blacklist-button" asChild>
                  <div className="relative block aspect-square size-5 flex-shrink-0">
                    <Image
                      src="/icons/blacklisted.svg"
                      alt="Blacklisted Dev Icon"
                      fill
                      quality={100}
                      className="object-contain"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent isWithAnimation={false}>
                  <p>Blacklist Developers</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </DialogTrigger>
        <DialogContent className="flex h-full w-full max-w-none flex-col gap-y-0 rounded-none sm:h-auto sm:max-w-[400px] lg:rounded-[8px]">
          <DialogHeader className="flex h-[56px] flex-row items-center border-b border-border p-4">
            <DialogTitle className="text-lg">
              Blacklisted Developers
            </DialogTitle>
          </DialogHeader>
          <div className="flex w-full flex-grow flex-col sm:flex-grow-0">
            {/* Add Input & CTA */}
            <div className="flex items-end gap-x-3 border-b border-border p-3">
              <div className="flex flex-grow flex-col gap-y-2">
                <Label className="text-nowrap text-sm text-fontColorSecondary">
                  Developer Address
                </Label>
                <div className="flex w-full items-center justify-between gap-x-2">
                  <Input
                    type="text"
                    value={blacklistedDeveloperAddress}
                    onChange={(e) =>
                      setBlacklistedDeveloperAddress(e.target.value)
                    }
                    placeholder="Enter developer address"
                    disabled={isAdding}
                    className="block h-8 w-full text-nowrap border-border bg-transparent pl-3 text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                  />
                </div>
              </div>
              <BaseButton
                variant="primary"
                className="h-8 rounded-[8px]"
                onClick={() => {
                  handleAddBlacklistedDeveloper(
                    blacklistedDeveloperAddress.trim(),
                    blacklistedDeveloperAddress,
                  );
                }}
                disabled={isAdding}
                prefixIcon={
                  <div className="relative block aspect-square size-4 flex-shrink-0">
                    <Image
                      src="/icons/add.png"
                      alt="Add Icon"
                      fill
                      quality={100}
                      className="object-contain"
                    />
                  </div>
                }
              >
                <span className="-mb-0.5">Add</span>
              </BaseButton>
            </div>

            {/* List */}
            <OverlayScrollbarsComponent
              defer
              element="div"
              className="popover__overlayscrollbar relative h-full w-full flex-grow overflow-y-scroll sm:h-[55vh] 2xl:max-h-[568px]"
            >
              <div className="flex flex-col gap-y-2 p-3">
                {isLoading ? (
                  Array.from({ length: 50 }).map((_, index) => (
                    <Skeleton
                      key={index}
                      className="flex h-8 w-full items-center justify-between rounded-[6px] border border-border bg-[#12121a] px-2 py-1.5 duration-300 hover:bg-[#1f1f2c]"
                    />
                  ))
                ) : blacklistedDevelopers.length > 0 ? (
                  blacklistedDevelopers.map((item, index) => (
                    <BlacklistedCard
                      key={index}
                      address={item}
                      handleRemove={(e) =>
                        handleRemoveBlacklistedDeveloper(
                          e,
                          blacklistedDevelopers,
                        )
                      }
                    />
                  ))
                ) : (
                  <div className="flex w-full text-fontColorSecondary">
                    No Data
                  </div>
                )}
              </div>
            </OverlayScrollbarsComponent>

            {/* Info */}
            <div className="w-full border-t border-border px-4 py-[14px]">
              <span className="text-sm text-foreground">
                {isLoading ? "-" : blacklistedDevelopers.length}/50 address
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <Drawer open={openDialog} onOpenChange={handleDialogClose}>
      <DrawerTrigger asChild>
        <div className="cursor-pointer">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger id="blacklist-button" asChild>
                <div className="relative block aspect-square size-5 flex-shrink-0">
                  <Image
                    src="/icons/blacklisted.svg"
                    alt="Blacklisted Dev Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent isWithAnimation={false}>
                <p>Blacklist Developers</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </DrawerTrigger>
      <DrawerContent className="flex h-[80dvh] w-full max-w-none flex-col gap-y-0 rounded-none">
        <DrawerHeader className="flex h-[56px] flex-row items-center justify-between border-b border-border p-4">
          <DrawerTitle className="text-lg">Blacklisted Developers</DrawerTitle>
          <DrawerClose asChild>
            <button className="relative aspect-square h-6 w-6 flex-shrink-0">
              <Image
                src="/icons/close.png"
                alt="Close Icon"
                fill
                quality={50}
                unoptimized
                className="object-contain"
              />
            </button>
          </DrawerClose>
        </DrawerHeader>
        <div className="flex w-full flex-grow flex-col sm:flex-grow-0">
          {/* Add Input & CTA */}
          <div className="flex items-end gap-x-3 border-b border-border p-3">
            <div className="flex flex-grow flex-col gap-y-2">
              <Label className="text-nowrap text-sm text-fontColorSecondary">
                Developer Address
              </Label>
              <div className="flex w-full items-center justify-between gap-x-2">
                <Input
                  type="text"
                  value={blacklistedDeveloperAddress}
                  onChange={(e) =>
                    setBlacklistedDeveloperAddress(e.target.value)
                  }
                  placeholder="Enter developer address"
                  disabled={isAdding}
                  className="block h-8 w-full text-nowrap border-border bg-transparent pl-3 text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                />
              </div>
            </div>
            <BaseButton
              variant="primary"
              className="h-8 rounded-[8px]"
              onClick={() => {
                handleAddBlacklistedDeveloper(
                  blacklistedDeveloperAddress.trim(),
                  blacklistedDeveloperAddress,
                );
              }}
              disabled={isAdding}
              prefixIcon={
                <div className="relative block aspect-square size-4 flex-shrink-0">
                  <Image
                    src="/icons/add.png"
                    alt="Add Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
              }
            >
              <span className="-mb-0.5">Add</span>
            </BaseButton>
          </div>

          {/* List */}
          <OverlayScrollbarsComponent
            defer
            element="div"
            className="popover__overlayscrollbar relative h-full w-full flex-grow overflow-y-scroll sm:h-[55vh] 2xl:max-h-[568px]"
          >
            <div className="flex flex-col gap-y-2 p-3">
              {isLoading ? (
                Array.from({ length: 50 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    className="flex h-8 w-full items-center justify-between rounded-[6px] border border-border bg-[#12121a] px-2 py-1.5 duration-300 hover:bg-[#1f1f2c]"
                  />
                ))
              ) : blacklistedDevelopers.length > 0 ? (
                blacklistedDevelopers.map((item, index) => (
                  <BlacklistedCard
                    key={index}
                    address={item}
                    handleRemove={(e) =>
                      handleRemoveBlacklistedDeveloper(e, blacklistedDevelopers)
                    }
                  />
                ))
              ) : (
                <div>No Data</div>
              )}
            </div>
          </OverlayScrollbarsComponent>

          {/* Info */}
          <div className="w-full border-t border-border px-4 py-[14px]">
            <span className="text-sm text-foreground">
              {isLoading ? "-" : blacklistedDevelopers.length}/50 address
            </span>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

const BlacklistedCard = ({
  address = "9nLKDbsFAjvwMZ6ndoh3TSuVr3iFEuNu5bXacrsbpump",
  handleRemove,
}: {
  address?: string;
  handleRemove: (address: string) => void;
}) => {
  return (
    <div className="flex h-8 w-full items-center justify-between rounded-[6px] border border-border bg-[#12121a] px-2 py-1.5 duration-300 hover:bg-[#1f1f2c]">
      <span className="text-sm text-fontColorPrimary">
        {truncateCA(address, 28)}
      </span>
      <button
        onClick={() => handleRemove(address)}
        className="relative block aspect-square size-4 flex-shrink-0 cursor-pointer"
      >
        <Image
          src="/icons/delete-red.svg"
          alt="Remove Blacklisted Dev Icon"
          fill
          quality={100}
          className="object-contain"
        />
      </button>
    </div>
  );
};
