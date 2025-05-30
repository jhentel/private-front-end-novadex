"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTrackedWallets,
  updateTrackedWallets,
  TrackedWallet,
} from "@/apis/rest/wallet-tracker";
import toast from "react-hot-toast";
import CustomToast from "@/components/customs/toasts/CustomToast";
import { useWalletTrackerStore } from "@/stores/footer/use-wallet-tracker";
import { Label } from "@/components/ui/label";
import SelectEmoji from "../../SelectEmoji";
import { Input } from "@/components/ui/input";
import BaseButton from "../../buttons/BaseButton";
import Image from "next/image";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import EmptyState from "../../EmptyState";
import { useSelectedWalletTrackerTradeAddressesFilterStore } from "@/stores/footer/use-selected-wallet-tracker-trade-filter.store";

const WalletManagerFooterForm = React.memo(function WalletManagerFooterForm({
  handleClose,
  closeComponent,
}: {
  handleClose: () => void;
  closeComponent: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const { data: trackedWallets } = useQuery({
    queryKey: ["tracked-wallets"],
    queryFn: async () => getTrackedWallets(),
    initialData: useWalletTrackerStore.getState().trackedWallets,
  });

  const [localWallets, setLocalWallets] = useState<TrackedWallet[]>(
    trackedWallets || [],
  );

  const currentSelectedAddresses =
    useSelectedWalletTrackerTradeAddressesFilterStore(
      (state) => state.selectedWalletAddresses,
    );

  useEffect(() => {
    if (trackedWallets) {
      setLocalWallets(trackedWallets);
    }
  }, [trackedWallets]);

  const updateWalletsMutation = useMutation({
    mutationFn: updateTrackedWallets,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracked-wallets"] });
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message="Wallets updated successfully"
          state="SUCCESS"
        />
      ));
      setTimeout(() => {
        handleClose();
      }, 500);
    },
    onError: (error: Error) => {
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message={error.message}
          state="ERROR"
        />
      ));
    },
  });

  const handleDeleteWallet = (
    address: string,
    currentSelectedAddresses: string[],
  ) => {
    updateWalletsMutation.mutate(
      localWallets.filter((w) => w.address !== address),
    );
    const newFilter = currentSelectedAddresses.filter((a) => a !== address);
    setSelectedWalletAddressesFilter(newFilter);
  };

  const setSelectedWalletAddressesFilter =
    useSelectedWalletTrackerTradeAddressesFilterStore(
      (state) => state.setSelectedWalletAddresses,
    );
  const handleFilterTradeOfThisWallet = (localWallets: TrackedWallet[]) => {
    const addresses = localWallets.map((wallet) => wallet.address);
    setSelectedWalletAddressesFilter(addresses);
  };

  const handleSubmit = (localWallets: TrackedWallet[]) => {
    updateWalletsMutation.mutate(localWallets);
    handleFilterTradeOfThisWallet(localWallets);
  };

  return (
    <>
      <div className="flex w-full items-center justify-start border-b border-border px-4 max-md:h-[56px] md:p-4">
        <h4 className="text-nowrap font-geistSemiBold text-[18px] text-fontColorPrimary">
          Wallet Manager
        </h4>
        {closeComponent}
      </div>
      <div className="relative flex w-full flex-grow flex-col gap-y-4 p-4 pt-0 md:pb-[72px] md:pt-1">
        {localWallets && localWallets.length > 0 ? (
          <OverlayScrollbarsComponent
            defer
            element="div"
            className="invisible__overlayscrollbar h-[382px] w-full md:h-[320px]"
          >
            <div className="flex w-full flex-col overflow-y-auto">
              {localWallets.map((wallet, index) => {
                return (
                  <div
                    key={wallet.address}
                    className="flex w-full gap-x-2 border-b border-border p-3"
                  >
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs text-fontColorSecondary">
                        Emoji
                      </Label>
                      <SelectEmoji
                        alreadySelectedList={trackedWallets.map((w) => w.emoji)}
                        value={wallet.emoji}
                        onChange={(emoji) => {
                          const newWallets = [...localWallets];
                          newWallets[index] = {
                            ...newWallets[index],
                            emoji: emoji,
                          };
                          setLocalWallets(newWallets);
                        }}
                      />
                    </div>
                    <div className="flex max-w-[120px] flex-grow flex-col gap-1">
                      <Label className="text-xs text-fontColorSecondary">
                        Wallet Name
                      </Label>
                      <Input
                        value={wallet.name}
                        onChange={(e) => {
                          const newWallets = [...localWallets];
                          newWallets[index] = {
                            ...newWallets[index],
                            name: e.target.value,
                          };
                          setLocalWallets(newWallets);
                        }}
                        placeholder="Wallet Name"
                        className="h-[32px] border border-border placeholder:text-fontColorSecondary focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-grow flex-col gap-1">
                      <Label className="text-xs text-fontColorSecondary">
                        Wallet Address
                      </Label>
                      <Input
                        value={wallet.address}
                        onChange={(e) => {
                          const newWallets = [...localWallets];
                          newWallets[index] = {
                            ...newWallets[index],
                            address: e.target.value,
                          };
                          setLocalWallets(newWallets);
                        }}
                        placeholder="Wallet Name"
                        className="h-[32px] border border-border placeholder:text-fontColorSecondary focus:outline-none"
                      />
                    </div>
                    <BaseButton
                      variant="gray"
                      size="short"
                      className="mt-auto size-[32px]"
                      onClick={() =>
                        handleDeleteWallet(
                          wallet.address,
                          currentSelectedAddresses,
                        )
                      }
                      disabled={updateWalletsMutation.isPending}
                    >
                      <div className="relative z-30 aspect-square h-4 w-4 flex-shrink-0">
                        <Image
                          src="/icons/delete.png"
                          alt="Delete Icon"
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </div>
                    </BaseButton>
                  </div>
                );
              })}
            </div>
          </OverlayScrollbarsComponent>
        ) : (
          <div className="flex h-full w-full items-center justify-center p-4">
            <EmptyState state="Wallet" size="sm" />
          </div>
        )}

        <div className="absolute bottom-0 left-0 z-[100] flex w-full items-center justify-center rounded-b-[8px] border-t border-border bg-card px-4 max-md:h-[56px] md:p-4">
          <BaseButton
            variant="primary"
            className="m-auto h-[32px] w-full"
            onClick={() => handleSubmit(localWallets)}
            disabled={updateWalletsMutation.isPending}
          >
            <span className="inline-block whitespace-nowrap font-geistSemiBold text-sm">
              {updateWalletsMutation.isPending ? "Saving..." : "Save Changes"}
            </span>
          </BaseButton>
        </div>
      </div>
    </>
  );
});

WalletManagerFooterForm.displayName = "WalletManagerFooterForm";

export default WalletManagerFooterForm;
