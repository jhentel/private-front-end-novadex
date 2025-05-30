"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useState } from "react";
import { useTSMonitorMessageStore } from "@/stores/footer/use-ts-monitor-message.store";
import toast from "react-hot-toast";
import cookies from "js-cookie";
// ######## APIs 🛜 ########
import { TSAccount, updateTSMonitorAccounts } from "@/apis/rest/ts-monitor";
// ######## Components 🧩 ########
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
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { useWindowSizeStore } from "@/stores/use-window-size.store";

const MANAGE_TS_CONTENT_CLASS =
  "gb__white__popover z-[9999] flex flex-col overflow-hidden border border-border p-0 h-[50vh] w-full xl:w-[320px]";

const ManageTSContent = ({
  closeComponent,
}: {
  closeComponent: React.ReactNode;
}) => {
  const accounts = useTSMonitorMessageStore((state) => state.accounts);
  const setAccounts = useTSMonitorMessageStore((state) => state.setAccounts);
  const wsRef = useTSMonitorMessageStore((state) => state.websocketRef);

  const [monitorDraftAccounts, setMonitorDraftAccounts] = useState<TSAccount[]>(
    accounts.map((account) => ({
      ...account,
      username: account.username.replace("@", ""),
    })),
  );

  const handleDeleteTSAccount = async (account: TSAccount) => {
    try {
      const newMonitorAccounts = monitorDraftAccounts.filter(
        (rta) => rta.username !== account.username,
      );
      setMonitorDraftAccounts(newMonitorAccounts);
      setAccounts(newMonitorAccounts);

      const result = await updateTSMonitorAccounts({
        accounts: newMonitorAccounts,
      });

      if (!result.success) {
        return;
      }

      await handleSendMessage([account]);

      toast.custom((t) => (
        <CustomToast
          tVisibleState={t.visible}
          message={`Success Delete @${account.username}`}
        />
      ));
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleSendMessage = async (list: TSAccount[]) => {
    if (wsRef?.OPEN) {
      const unsubscriptionMessage = {
        action: "unsubscribe",
        licenseKey: cookies.get("_truthsocial_api_key"),
        usernames: [...list.map((acc) => acc.username.replace("@", ""))],
      };

      wsRef.send(JSON.stringify(unsubscriptionMessage));
    }
  };

  return (
    <>
      <div className="flex h-[58px] w-full items-center justify-start border-b border-border p-4 xl:h-[56px]">
        <h4 className="text-nowrap font-geistSemiBold text-[18px] text-fontColorPrimary">
          Manage Truth Social
        </h4>
        {closeComponent}
      </div>
      <div className="relative flex w-full flex-grow flex-col gap-y-4 px-4 pb-5 pt-4">
        {monitorDraftAccounts?.length === 0 ? (
          <div className="flex h-full w-full items-center justify-center">
            <p className="text-center text-sm text-fontColorSecondary">
              No Truth Social accounts added yet.
            </p>
          </div>
        ) : (
          <MonitoredAccountList
            type="truthSocial"
            data={monitorDraftAccounts}
            handleDeleteTwitterAccount={(account) => {
              if ("username" in account) {
                handleDeleteTSAccount(account);
              }
            }}
          />
        )}
      </div>
    </>
  );
};

const ManageTS = ({
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
          <ManageTSContent
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
        <ManageTSContent
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

export default ManageTS;
