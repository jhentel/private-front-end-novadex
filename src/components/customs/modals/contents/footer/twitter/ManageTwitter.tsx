"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useState } from "react";
import { useTwitterMonitorMessageStore } from "@/stores/footer/use-twitter-monitor-message.store";
import toast from "react-hot-toast";
import cookies from "js-cookie";
// ######## APIs 🛜 ########
import {
  TwitterAccount,
  updateTwitterMonitorAccounts,
} from "@/apis/rest/twitter-monitor";
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
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { useWindowSizeStore } from "@/stores/use-window-size.store";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

const MANAGE_TWITTER_CONTENT_CLASS =
  "gb__white__popover z-[9999] flex flex-col overflow-hidden border border-border p-0 h-[442px] xl:h-[440px] w-full";

const ManageTwitterContent = ({
  closeComponent,
}: {
  closeComponent: React.ReactNode;
}) => {
  const accounts = useTwitterMonitorMessageStore((state) => state.accounts);
  const setAccounts = useTwitterMonitorMessageStore(
    (state) => state.setAccounts,
  );
  const wsRef = useTwitterMonitorMessageStore((state) => state.websocketRef);

  const [monitorDraftAccounts, setMonitorDraftAccounts] =
    useState<TwitterAccount[]>(accounts);
  const handleRemoveAccountFromMonitorDraft = (removedAccount: string) => {
    // console.log("Handle Delete Monitored Account ➖", removedAccount);
    const newList = monitorDraftAccounts.filter(
      (account) => account.username !== removedAccount,
    );
    setMonitorDraftAccounts(newList);
  };
  // const handleManageTwitterSubmit = async () => {
  //   if (JSON.stringify(accounts) === JSON.stringify(monitorDraftAccounts)) {
  //     toast.custom((t: any)=> (
  //       <CustomToast
  //         tVisibleState={t.visible}
  //         state="ERROR"
  //         message="There's no changes made"
  //       />
  //     ));
  //     return;
  //   }

  //   setAccounts(monitorDraftAccounts);

  //   try {
  //     const result = await updateTwitterMonitorAccounts({
  //       accounts: monitorDraftAccounts.map((rta) => ({
  //         name: rta.name,
  //         username: rta.username,
  //         profilePicture: rta.profilePicture,
  //       })),
  //     });

  //     if (!result.success) {
  //       console.log("Failed to update accounts to monitor");
  //       return;
  //     }

  //     // const subscriptionMessage = {
  //     //   type: "add_profile",
  //     //   data: { profiles: monitorDraftAccounts },
  //     // };

  //     // wsRef?.send(JSON.stringify(subscriptionMessage));
  //     wsRef?.close();
  //     console.log("RESUBSCRIBE TO TWITTER MONITOR WS 📨");

  //     toast.custom((t: any)=> (
  //       <CustomToast tVisibleState={t.visible} message="Success Save Changes" />
  //     ));
  //   } catch (error) {
  //     console.warn("Error sending message:", error);
  //   }
  // };

  const handleDeleteTwitterAccount = async (account: TwitterAccount) => {
    try {
      const newMonitorAccounts = monitorDraftAccounts.filter(
        (rta) => rta.username !== account.username,
      );
      setMonitorDraftAccounts(newMonitorAccounts);
      setAccounts(newMonitorAccounts);

      const result = await updateTwitterMonitorAccounts({
        accounts: newMonitorAccounts,
      });

      if (!result.success) {
        // console.log("Failed to update accounts to monitor");
        return;
      }

      if (wsRef?.OPEN) {
        // console.log("WS OPEN", wsRef);
        // wsRef?.close();
        handleSendMessage([account]);
        // setTwitterMonitorIsRenewing(true);
      } else {
        // console.log("WS CLOSE", wsRef);
      }
      // console.log("RESUBSCRIBE TO TWITTER MONITOR WS 📨");
      // handleSendMessage(newMonitorAccounts);

      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message={`Success Delete @${account.username}`}
        />
      ));
    } catch (error) {
      console.warn("Error sending message:", error);
    }
  };

  const setTwitterMonitorIsRenewing = useTwitterMonitorMessageStore(
    (state) => state.setIsRenewing,
  );
  const handleSendMessage = async (list: TwitterAccount[]) => {
    if (wsRef?.OPEN) {
      // setTwitterMonitorIsRenewing(true);

      // console.log("WS OPEN", wsRef);
      const subscriptionMessage = {
        action: "unsubscribe",
        licenseKey: cookies.get("_twitter_api_key"),
        usernames: [...list.map((acc) => acc.username)],
      };

      wsRef.send(JSON.stringify(subscriptionMessage));
    }
  };

  return (
    <>
      <div className="flex h-[58px] w-full items-center justify-start border-b border-border p-4 xl:h-[56px]">
        <h4 className="text-nowrap font-geistSemiBold text-[18px] text-fontColorPrimary">
          Manage Twitter
        </h4>
        {closeComponent}
      </div>
      <div className="relative flex w-full flex-grow flex-col gap-y-4 px-4 pb-5 pt-4">
        {monitorDraftAccounts.length === 0 ? (
          <div className="flex h-full w-full items-center justify-center">
            <p className="text-sm text-fontColorSecondary">
              No Twitter accounts to monitor.
            </p>
          </div>
        ) : (
          <MonitoredAccountList
            type="twitter"
            data={monitorDraftAccounts}
            handleDeleteTwitterAccount={(account) => {
              if ("username" in account) {
                handleDeleteTwitterAccount(account);
              }
            }}
          />
        )}
        {/* <div className="absolute bottom-0 left-0 z-[500] min-h-[56px] w-full flex-shrink-0 rounded-b-[8px] border-t border-border bg-card p-4">
          <BaseButton
            variant="primary"
            onClick={handleManageTwitterSubmit}
            className="h-[32px] w-full"
          >
            <span className="inline-block whitespace-nowrap font-geistSemiBold text-sm">
              Save Changes
            </span>
          </BaseButton>
        </div> */}
      </div>
    </>
  );
};

const ManageTwitter = ({
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
          className={MANAGE_TWITTER_CONTENT_CLASS}
        >
          <ManageTwitterContent
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
      <DrawerContent className={cn(MANAGE_TWITTER_CONTENT_CLASS)}>
        <ManageTwitterContent
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

export default ManageTwitter;
