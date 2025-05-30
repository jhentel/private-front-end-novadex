"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import cookies from "js-cookie";
import Image from "next/image";
import CustomToast from "@/components/customs/toasts/CustomToast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PopoverClose } from "@radix-ui/react-popover";
import MonitoredAccountList from "@/components/customs/lists/footer/MonitoredAccountList";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/libraries/utils";
import { useWindowSizeStore } from "@/stores/use-window-size.store";
import { useDiscordMonitorMessageStore } from "@/stores/footer/use-discord-monitor-message.store";
import { DiscordChannel, SuggestedDiscordChannel } from "@/types/monitor";
import {
  getSuggestedDiscordChannel,
  updateDiscordMonitorChannel,
} from "@/apis/rest/discord-monitor";
import { useQuery } from "@tanstack/react-query";

const MANAGE_TS_CONTENT_CLASS =
  "gb__white__popover z-[9999] flex flex-col overflow-hidden border border-border p-0 h-[50vh] min-h-[300px] w-full xl:w-[320px]";

const ManageDiscordContent = ({
  closeComponent,
}: {
  closeComponent: React.ReactNode;
}) => {
  const groups = useDiscordMonitorMessageStore((state) => state.accounts);
  const setGroups = useDiscordMonitorMessageStore((state) => state.setAccounts);
  const wsRef = useDiscordMonitorMessageStore((state) => state.websocketRef);
  const { data: suggestedGroups, isLoading: isLoadingSuggested } = useQuery<
    SuggestedDiscordChannel[]
  >({
    queryKey: ["discord-suggested-groups"],
    queryFn: getSuggestedDiscordChannel,
  });

  const [monitorDraftAccounts, setMonitorDraftAccounts] = useState<
    DiscordChannel[]
  >([]);

  useEffect(() => {
    if (suggestedGroups && suggestedGroups.length > 0 && !isLoadingSuggested) {
      setMonitorDraftAccounts(
        suggestedGroups.filter((group) =>
          groups.some((item) =>
            typeof item === "string"
              ? item === group.name
              : item.name === group.name,
          ),
        ),
      );
    }
  }, [suggestedGroups, groups]);

  const handleDeleteDiscordChannel = async (
    discord: DiscordChannel,
  ): Promise<void> => {
    try {
      const newMonitorChannels = monitorDraftAccounts.filter(
        (rta) =>
          (typeof rta === "string" && rta !== discord.name) ||
          (typeof rta === "object" &&
            "name" in rta &&
            rta.name !== discord.name),
      );
      setMonitorDraftAccounts(newMonitorChannels as DiscordChannel[]);

      const finalGroups = groups.filter(
        (group) =>
          (typeof group === "string" && group !== discord.name) ||
          (typeof group === "object" &&
            "name" in group &&
            group.name !== discord.name),
      );

      setGroups(finalGroups as DiscordChannel[] | string[]);

      const result = await updateDiscordMonitorChannel(
        finalGroups.map((acc) => (typeof acc === "string" ? acc : acc.name)),
      );

      if (!result.success) {
        return;
      }

      await handleSendMessage([discord]);

      toast.custom((t) => (
        <CustomToast
          tVisibleState={t.visible}
          message={`Success Delete ${discord.name}`}
        />
      ));
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleSendMessage = async (list: DiscordChannel[]) => {
    if (wsRef?.OPEN) {
      const unsubscriptionMessage = {
        action: "unsubscribe",
        licenseKey: cookies.get("_discord_api_key"),
        groups: [...list.map((acc) => acc.name)],
      };

      wsRef.send(JSON.stringify(unsubscriptionMessage));
    }
  };

  return (
    <>
      <div className="flex h-[58px] w-full items-center justify-start border-b border-border p-4 xl:h-[56px]">
        <h4 className="text-nowrap font-geistSemiBold text-[18px] text-fontColorPrimary">
          Manage Discord
        </h4>
        {closeComponent}
      </div>
      <div className="relative flex w-full flex-grow flex-col gap-y-4 px-4 pb-5 pt-4">
        {monitorDraftAccounts?.length === 0 && isLoadingSuggested ? (
          <div className="flex h-full w-full items-center justify-center">
            <p className="text-sm text-fontColorSecondary">
              No Discord servers monitored yet.
            </p>
          </div>
        ) : (
          <MonitoredAccountList
            type="discord"
            data={monitorDraftAccounts as DiscordChannel[]}
            handleDeleteTwitterAccount={(account) => {
              if ("name" in account && "image" in account) {
                // This checks if it's a DiscordChannel
                handleDeleteDiscordChannel(account as DiscordChannel);
              }
            }}
          />
        )}
      </div>
    </>
  );
};

const ManageDiscord = ({
  open,
  setOpen,
  trigger,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  trigger: React.ReactNode;
}) => {
  const width = useWindowSizeStore((state) => state.width);

  const isDesktop = width && width >= 1280;

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild className="w-full">
          {trigger}
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={6}
          className={MANAGE_TS_CONTENT_CLASS}
        >
          <ManageDiscordContent
            closeComponent={
              <PopoverClose className="ml-auto">
                <div className="relative aspect-square h-6 w-6 flex-shrink-0 duration-300 hover:opacity-70">
                  <Image
                    src="/icons/close.png"
                    alt="Close Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
              </PopoverClose>
            }
          />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer>
      <DrawerTrigger asChild className="w-full">
        <div className="w-full">{trigger}</div>
      </DrawerTrigger>
      <DrawerHeader className="hidden">
        <DrawerTitle>Manage Account</DrawerTitle>
      </DrawerHeader>
      <DrawerContent className={cn(MANAGE_TS_CONTENT_CLASS)}>
        <ManageDiscordContent
          closeComponent={
            <DrawerClose asChild className="ml-auto">
              <button
                title="close"
                className="relative aspect-square h-6 w-6 flex-shrink-0 duration-300 hover:opacity-70"
              >
                <Image
                  src="/icons/close.png"
                  alt="Close Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </button>
            </DrawerClose>
          }
        />
      </DrawerContent>
    </Drawer>
  );
};

export default ManageDiscord;
