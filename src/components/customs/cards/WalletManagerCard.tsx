"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useEffect, useState, useMemo } from "react";
import { useUserWalletStore } from "@/stores/wallet/use-user-wallet.store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSolPriceMessageStore } from "@/stores/use-solprice-message.store";
import { useWalletsMessageStore } from "@/stores/wallets/use-wallets-message.store";
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
import { useQuickAmountStore } from "@/stores/dex-setting/use-quick-amount.store";
import { useWalletTrackerStore } from "@/stores/footer/use-wallet-tracker";
import { CachedImage } from "../CachedImage";
import { truncateString } from "@/utils/truncateString";

type WalletManagerCardProps = {
  data: Wallet[];
  isFirst: boolean;
  wallet: Wallet;
};

export default function WalletManagerCard({
  data,
  isFirst,
  wallet,
}: WalletManagerCardProps) {
  const { cosmoWallets, setCosmoWallets } = useQuickAmountStore();
  const { trackerWalletsQuick, setTrackerWalletsQuick } =
    useWalletTrackerStore();
  const {
    selectedMultipleActiveWalletHoldings,
    setSelectedMultipleActiveWalletHoldings,
    setSelectedMultipleActiveWalletToken,
    selectedMultipleActiveWalletToken,
  } = useUserWalletStore();

  // Add new states for name editing
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [walletName, setWalletName] = useState<string>(wallet.name);
  const [previousName, setPreviousName] = useState<string>("");

  const [optimisticSelected, setOptimisticSelected] = useState<boolean>(
    wallet.selected || false,
  );
  const solPrice = useSolPriceMessageStore((state) => state.messages).price;
  // console.log("~ solPrice 🚀", solPrice);
  const holdings = useWalletsMessageStore((state) => state.messages);
  // console.log("~ Holdings 🚀", holdings);

  const allUserWallets = useUserWalletStore(
    (state) => state.userWalletFullList,
  );
  const queryClient = useQueryClient();

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
    },
  });

  useEffect(() => {
    setOptimisticSelected(wallet.selected || false);
  }, [wallet.selected]);

  // Add name update mutation
  const { mutate: updateWalletName } = useMutation({
    mutationFn: async (newName: string) => {
      return await renameWallet(wallet.address, newName);
    },
    onError: (error) => {
      // Rollback to previous name on error
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

  // Archive mutation
  const { mutate: toggleArchive, isPending: isArchivePending } = useMutation({
    mutationFn: async (archive: boolean) => {
      // First perform the API call
      if (archive) {
        return await archiveWallets([wallet.address]);
      } else {
        return await unarchiveWallets([wallet.address]);
      }
    },
    onSuccess: () => {
      if (!wallet.archived) {
        if (cosmoWallets.some((w) => w.address === wallet.address)) {
          setCosmoWallets(
            cosmoWallets.filter((w) => w.address !== wallet.address),
          );
        }

        if (
          selectedMultipleActiveWalletHoldings.some(
            (w) => w.address === wallet.address,
          )
        ) {
          setSelectedMultipleActiveWalletHoldings(
            selectedMultipleActiveWalletHoldings.filter(
              (w) => w.address !== wallet.address,
            ),
          );
        }

        if (
          selectedMultipleActiveWalletToken.some(
            (w) => w.address === wallet.address,
          )
        ) {
          setSelectedMultipleActiveWalletToken(
            selectedMultipleActiveWalletToken.filter(
              (w) => w.address !== wallet.address,
            ),
          );
        }
      }

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

  // Delete mutation
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

  const [errorLimitName, setErrorLimitName] = useState("");
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length > 20) {
      setErrorLimitName("Name cannot exceed 20 characters.");
    } else {
      setErrorLimitName("");
      setWalletName(value);
    }

  };

  const handleSave = async () => {
    // If name is empty, revert to the original wallet name
    if (!walletName.trim()) {
      setWalletName(wallet.name);
      setIsEditing(false);
      return;
    }

    // If name is unchanged, just exit edit mode without API call
    if (walletName === wallet.name) {
      setIsEditing(false);
      return;
    }

    // Store previous name for potential rollback
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

  const handleArchiveToggle = () => {
    toggleArchive(!wallet.archived);
  };

  const handleDelete = () => {
    deleteWallet(wallet.address);
  };

  const isImportExist = useMemo(() => {
    return data
      ?.filter((w) => !w.archived)
      .some((w) => {
        const twentyFourHoursAgo = Date.now() / 1000 - 24 * 60 * 60;
        return w.createdAt >= twentyFourHoursAgo;
      });
  }, [data]);

  return (
    <div className="transition-color flex h-[72px] min-w-max items-center pl-[25px] pr-[20px] duration-200 ease-out odd:bg-[#12121A] hover:bg-shadeTableHover">
      <div className="flex w-full min-w-[160px]">
        <div className="flex flex-col gap-y-1">
          <div className="flex items-center gap-x-1">
            {isEditing ? (
              <div className="relative">
                <Input
                  type="text"
                  value={walletName}
                  onChange={handleNameChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave();
                    if (e.key === "Escape") {
                      setWalletName(wallet.name);
                      setIsEditing(false);
                      setErrorLimitName("");
                    }
                  }}
                  autoFocus
                  className="ml-[-0.3rem] h-5 w-[180px] px-3 font-geistMedium"
                />
                {errorLimitName && (
                  <p className="absolute top-full mt-5 text-xs text-red-500">
                    {errorLimitName}
                  </p>
                )}
              </div>
            ) : (
              <h4 className="text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                {walletName.length > 46
                  ? truncateString(walletName, 46)
                  : walletName}
              </h4>
            )}

            <button
              title="Edit"
              onClick={() => setIsEditing(!isEditing)}
              className="relative ml-0.5 aspect-square h-4 w-4 flex-shrink-0 cursor-pointer"
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
              title="Favorite"
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

          <div className="-mt-0.5 flex items-center gap-x-1">
            <span className="inline-block text-nowrap text-xs text-fontColorSecondary">
              {truncateAddress(wallet.address)}
            </span>
            <Copy value={wallet.address} withToast />
          </div>
        </div>
      </div>
      <div className="flex h-full w-full min-w-[160px] pt-4">
        <div className="mb-auto flex flex-col gap-y-0.5">
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
            <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
              {formatAmountWithoutLeadingZero(Number(wallet.balance), 5)}
            </span>
          </div>

          <span className="inline-block text-nowrap text-xs text-fontColorSecondary">
            $
            {formatAmountWithoutLeadingZero(
              Number(wallet.balance) * solPrice,
              5,
            )}
          </span>
        </div>
      </div>
      <div className="flex h-full w-full min-w-[160px] pb-4 pt-4">
        <div className="flex items-center">
          <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
            {holdings.find((h) => h.wallet === wallet.address)?.tokens ?? 0}
          </span>
        </div>
      </div>
      {wallet.archived ? (
        <div className="ml-auto flex h-full min-w-[145px] max-w-[145px] items-center justify-end gap-x-2">
          <BaseButton
            type="button"
            variant="gray"
            size="short"
            className={cn(
              "h-8 pl-2 pr-3 text-sm",
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
        <div
          className={cn(
            "ml-auto flex h-full items-center justify-end gap-x-2",
            isImportExist
              ? "min-w-[410px] max-w-[410px]"
              : "ml-auto min-w-[140px] max-w-[140px]",
          )}
        >
          <WalletManagerButtons
            mintAddress={wallet.address}
            createdAt={wallet.createdAt}
            onArchive={handleArchiveToggle}
            isArchivePending={isArchivePending}
            isWalletSelected={optimisticSelected}
            isFirst={isFirst}
          />
        </div>
      )}
    </div>
  );
}
