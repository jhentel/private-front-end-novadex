"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useEffect, useState } from "react";
import { useUserWalletStore } from "@/stores/wallet/use-user-wallet.store";
import { useSolPriceMessageStore } from "@/stores/use-solprice-message.store";
import { useWalletsMessageStore } from "@/stores/wallets/use-wallets-message.store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
// ######## APIs 🛜 ########
import {
  selectWallets,
  deselectWallets,
  Wallet,
  renameWallet,
  archiveWallets,
  unarchiveWallets,
  deleteWallets,
} from "@/apis/rest/wallet-manager";
// ######## Components 🧩 ########
import Image from "next/image";
import Copy from "@/components/customs/Copy";
import { Input } from "@/components/ui/input";
import CustomToast from "@/components/customs/toasts/CustomToast";
import BaseButton from "@/components/customs/buttons/BaseButton";
import WalletManagerButtons from "@/components/customs/buttons/WalletManagerButtons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// ######## Utils & Helpers 🤝 ########
import { truncateAddress } from "@/utils/truncateAddress";
import { cn } from "@/libraries/utils";
import { formatAmountWithoutLeadingZero } from "@/utils/formatAmount";
import { CachedImage } from "../../CachedImage";
import PrivateKeyButton from "../../buttons/PrivateKeyButton";
import { truncateString } from "@/utils/truncateString";

type WalletManagerCardMobileProps = {
  isFirst: boolean;
  wallet: Wallet;
};

export default function WalletManagerCardMobile({
  isFirst,
  wallet,
}: WalletManagerCardMobileProps) {
  const [optimisticSelected, setOptimisticSelected] = useState<boolean>(
    wallet.selected || false,
  );
  const solPrice = useSolPriceMessageStore((state) => state.messages)?.price;
  const holdings = useWalletsMessageStore((state) => state.messages);
  const queryClient = useQueryClient();

  // Add edit states
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [walletName, setWalletName] = useState<string>(wallet.name);
  const [previousName, setPreviousName] = useState<string>("");

  const allUserWallets = useUserWalletStore(
    (state) => state.userWalletFullList,
  );

  const { mutate: toggleSelect, isPending } = useMutation({
    mutationFn: async (selected: boolean) => {
      // find and count the active wallet
      const activeWallet = allUserWallets
        .filter((w) => w.selected)
        .map((w) => w.address);
      // Simulation for testing error handling
      if (activeWallet.length == 1 && !selected) {
        throw new Error("Cannot deselect the last active wallet");
      }
      if (selected) {
        await deselectWallets(activeWallet);
        return await selectWallets([wallet.address]);
      } else {
        return await deselectWallets([wallet.address]);
      }
    },
    onError: (error, selected) => {
      // Revert optimistic update on error
      setOptimisticSelected(!selected);
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message={
            error instanceof Error
              ? error.message
              : "Failed to update favorite status"
          }
          state="ERROR"
        />
      ));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
    },
  });

  useEffect(() => {
    setOptimisticSelected(wallet.selected || false);
  }, [wallet.selected]);

  // Add rename mutation
  const { mutate: updateWalletName } = useMutation({
    mutationFn: async (newName: string) => {
      return await renameWallet(wallet.address, newName);
    },
    onError: (error) => {
      setWalletName(previousName);
      setIsEditing(false);
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message={
            error instanceof Error ? error.message : "Failed to rename wallet"
          }
          state="ERROR"
        />
      ));
    },
    onSuccess: () => {
      setIsEditing(false);
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message="Wallet name updated successfully"
          state="SUCCESS"
        />
      ));
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
    },
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWalletName(e.target.value);
  };

  const handleSave = async () => {
    if (!walletName || walletName === previousName) {
      setIsEditing(false);
      return;
    }
    setPreviousName(wallet.name);
    updateWalletName(walletName);
  };

  const handleChangeFavoriteStatus = () => {
    const newSelectedState = !optimisticSelected;
    // Optimistically update the UI
    setOptimisticSelected(newSelectedState);
    // Make the actual API call
    toggleSelect(newSelectedState);
  };

  const { mutate: toggleArchive, isPending: isArchivePending } = useMutation({
    mutationFn: async (archive: boolean) => {
      if (archive) {
        return await archiveWallets([wallet.address]);
      } else {
        return await unarchiveWallets([wallet.address]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message={`Wallet ${wallet.archived ? "unarchived" : "archived"} successfully`}
          state="SUCCESS"
        />
      ));
    },
    onError: (error) => {
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message={
            error instanceof Error
              ? error.message
              : "Failed to update wallet status"
          }
          state="ERROR"
        />
      ));
    },
  });

  const { mutate: deleteWallet, isPending: isDeletePending } = useMutation({
    mutationFn: async (address: string) => {
      return await deleteWallets([address]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message={`Wallet ${wallet.name} deleted successfully`}
          state="SUCCESS"
        />
      ));
    },
    onError: (error) => {
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message={
            error instanceof Error ? error.message : "Failed to delete wallet"
          }
          state="ERROR"
        />
      ));
    },
  });

  const handleArchiveToggle = () => {
    toggleArchive(!wallet.archived);
  };

  const handleDelete = () => {
    deleteWallet(wallet.address);
  };

  return (
    <div className="flex h-auto w-full flex-col rounded-[8px] border border-border">
      <div className="flex h-[32px] w-full items-center justify-between bg-white/[4%] px-3 py-2">
        <div className="flex items-center gap-x-1">
          <h4 className="flex w-fit items-center gap-x-1 text-nowrap">
            {isEditing ? (
              <Input
                type="text"
                value={walletName}
                onChange={handleNameChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") {
                    setWalletName(wallet.name);
                    setIsEditing(false);
                  }
                }}
                autoFocus
                className="h-5 w-[120px] px-2 py-0 font-geistMedium text-xs"
              />
            ) : (
              <>
                <span className="font-geistSemiBold text-xs text-fontColorPrimary">
                  {walletName.length > 36
                    ? truncateString(walletName, 36)
                    : walletName}
                </span>
                <span className="text-[10px] leading-3 text-fontColorSecondary">
                  {truncateAddress(wallet.address)}
                </span>
                <Copy value={wallet.address} />
              </>
            )}
          </h4>
        </div>
        <div className="flex items-center gap-x-2">
          <button
            title="Edit"
            onClick={() => setIsEditing(!isEditing)}
            className="relative aspect-square h-4 w-4 flex-shrink-0 cursor-pointer"
          >
            <Image
              src={isEditing ? "/icons/pink-check.png" : "/icons/edit.png"}
              alt="Edit Icon"
              fill
              quality={100}
              className="object-contain"
            />
          </button>
          <button
            title="Favorite Status"
            onClick={handleChangeFavoriteStatus}
            className={cn(
              "relative aspect-square h-4 w-4",
              isPending && "animate-pulse",
            )}
          >
            <Image
              src={
                optimisticSelected
                  ? "/icons/favorite.svg"
                  : "/icons/not-favorite.png"
              }
              alt="Favorite Status Icon"
              fill
              quality={100}
              className="object-contain"
            />
          </button>
        </div>
      </div>

      <div className="flex h-full w-full items-center gap-x-3 p-3 md:gap-x-6">
        <div className="flex h-full min-w-[100px] flex-col md:w-full md:max-w-[160px]">
          <span className="font-geistSemiBold text-xs text-fontColorSecondary">
            Solana
          </span>
          <div className="flex items-center gap-x-1">
            <div className="relative aspect-auto h-[16px] w-[16px] flex-shrink-0">
              <CachedImage
                src="/icons/solana-sq.svg"
                alt="Solana SQ Icon"
                fill
                quality={50}
                className="object-contain"
              />
            </div>
            <span className="inline-block text-nowrap font-geistSemiBold text-[13px] text-fontColorPrimary">
              {formatAmountWithoutLeadingZero(Number(wallet.balance), 5)}
            </span>
          </div>
          <span className="text-xs text-fontColorSecondary">
            $
            {formatAmountWithoutLeadingZero(
              Number(wallet.balance) * solPrice,
              5,
            )}
          </span>
        </div>
        <div className="flex h-full w-full max-w-[65px] flex-col">
          <span className="font-geistSemiBold text-xs text-fontColorSecondary">
            Holdings
          </span>
          <span className="inline-block text-nowrap font-geistSemiBold text-[13px] text-fontColorPrimary">
            {holdings.find((h) => h.wallet === wallet.address)?.tokens || 0}
          </span>
        </div>
        <div className="ml-auto flex h-full items-center justify-end gap-x-2">
          {wallet.archived ? (
            <div className="flex items-center gap-x-2">
              <BaseButton
                type="button"
                variant="gray"
                size="short"
                className={cn(
                  "h-8 pl-2.5 pr-3 text-sm",
                  isArchivePending && "opacity-50",
                )}
                onClick={handleArchiveToggle}
                disabled={isArchivePending}
              >
                <div
                  className={cn(
                    "relative z-30 aspect-square h-4 w-4 flex-shrink-0",
                    isArchivePending && "animate-spin",
                  )}
                >
                  <Image
                    src={
                      isArchivePending
                        ? "/icons/search-loading.png"
                        : "/icons/unarchieve.svg"
                    }
                    alt="Unarchive Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
                {isArchivePending ? "Processing..." : "Unarchive"}
              </BaseButton>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <BaseButton
                      type="button"
                      onClick={handleDelete}
                      isLoading={isDeletePending}
                      disabled={isDeletePending}
                      variant="gray"
                      size="short"
                      className="aspect-square size-8"
                    >
                      <div
                        className={cn(
                          "relative z-30 aspect-square h-4 w-4 flex-shrink-0",
                          isDeletePending && "animate-spin",
                        )}
                      >
                        <Image
                          src={
                            isDeletePending
                              ? "/icons/search-loading.png"
                              : "/icons/delete.svg"
                          }
                          alt="Delete Icon"
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </div>
                    </BaseButton>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="px-2 py-1">
                    <span className="inline-block text-nowrap text-xs">
                      Delete Wallet
                    </span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ) : (
            <WalletManagerButtons
              mintAddress={wallet.address}
              createdAt={wallet.createdAt}
              onArchive={handleArchiveToggle}
              isArchivePending={isArchivePending}
              isDesktop={false}
              isWalletSelected={optimisticSelected}
              isFirst={isFirst}
            />
          )}
        </div>
      </div>
      {!wallet.archived && (
        <PrivateKeyButton
          address={wallet.address}
          createdAt={wallet.createdAt}
          isMobile
        />
      )}
    </div>
  );
}
