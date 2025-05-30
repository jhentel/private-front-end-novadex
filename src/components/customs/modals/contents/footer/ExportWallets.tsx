"use client";
import { TrackedWallet } from "@/apis/rest/wallet-tracker";
import BaseButton from "@/components/customs/buttons/BaseButton";
import CustomToast from "@/components/customs/toasts/CustomToast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/libraries/utils";
import { useSelectedWalletTrackerTradeAddressesFilterStore } from "@/stores/footer/use-selected-wallet-tracker-trade-filter.store";
import { useWalletTrackerMessageStore } from "@/stores/footer/use-wallet-tracker-message.store";
import { useWindowSizeStore } from "@/stores/use-window-size.store";
import Image from "next/image";
import { useCallback } from "react";
import toast from "react-hot-toast";

export const ExportWallets = () => {
  const currentSelectedAddresses =
    useSelectedWalletTrackerTradeAddressesFilterStore(
      (state) => state.selectedWalletAddresses,
    );

  const trackedWalletsList = useWalletTrackerMessageStore(
    (state) => state.trackedWallets,
  );

  const handleExport = useCallback(() => {
    if (!currentSelectedAddresses.length) {
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message="No wallets selected to export."
          state="ERROR"
        />
      ));

      return;
    }

    // Create a Set for O(1) lookup
    const addressSet = new Set(currentSelectedAddresses);

    // Filter trackedWalletsList to include only selected addresses
    const filteredWallets: TrackedWallet[] = trackedWalletsList.filter(
      (wallet) => addressSet.has(wallet.address),
    );

    // Convert to JSON string with indentation for readability
    const jsonContent = JSON.stringify(filteredWallets, null, 2);

    // Create a Blob with the JSON content
    const blob = new Blob([jsonContent], { type: "text/plain;charset=utf-8" });

    // Create a temporary URL for the Blob
    const url = window.URL.createObjectURL(blob);

    // Create a temporary anchor element to trigger download
    const link = document.createElement("a");
    link.href = url;
    link.download = "exported_wallets.txt";
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, [currentSelectedAddresses, trackedWalletsList]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <BaseButton onClick={handleExport} variant="gray" className="size-10">
            <div className="relative z-30 aspect-square h-5 w-5 flex-shrink-0">
              <Image
                src="/icons/export-wallet.svg"
                alt="Export Wallet Icon"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
          </BaseButton>
        </TooltipTrigger>
        <TooltipContent>
          <p>Export Wallet</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
