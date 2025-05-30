"use client";

// ######## Components 🧩 ########
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import toast from "react-hot-toast";
import WalletDistributePopoverModal from "@/components/customs/modals/WalletDistributePopoverModal";
import BaseButton from "@/components/customs/buttons/BaseButton";
import WithdrawModal from "@/components/customs/modals/WithdrawModal";
import PrivateKeyButton from "@/components/customs/buttons/PrivateKeyButton";
import CustomToast from "@/components/customs/toasts/CustomToast";

// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";

interface WalletManagerButtonsProps {
  mintAddress: string;
  createdAt: number;
  onArchive?: () => void;
  isArchivePending?: boolean;
  isDesktop?: boolean;
  isWalletSelected: boolean;
  isFirst?: boolean;
}

export default function WalletManagerButtons({
  mintAddress,
  createdAt,
  onArchive,
  isArchivePending,
  isDesktop = true,
  isWalletSelected,
  isFirst,
}: WalletManagerButtonsProps) {
  // A. Archive Configuration (PASSED)

  // B. Copy Mint Address Configuration
  const handleCopyMintAddress = () => {
    navigator.clipboard
      .writeText(mintAddress)
      .then(() => {
        toast.custom((t: any) => (
          <CustomToast
            tVisibleState={t.visible}
            message="Successfully copied"
            state="SUCCESS"
          />
        ));
      })
      .catch((err) => {
        console.warn("Failed to copy address:", err);
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = mintAddress;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand("copy");
        } catch (err) {
          console.warn("Failed to copy address:", err);
        }
        document.body.removeChild(textArea);
      });
  };

  return (
    <>
      {isDesktop ? (
        <>
          <PrivateKeyButton address={mintAddress} createdAt={createdAt} />

          <div id={isFirst ? "wallet-manager-archive-button-first" : undefined}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <BaseButton
                    type="button"
                    onClick={onArchive}
                    isLoading={isArchivePending}
                    disabled={isArchivePending || isWalletSelected}
                    variant="gray"
                    size="short"
                    className="aspect-square size-8"
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
                            : "/icons/archieve-wallet.svg"
                        }
                        alt="Copy Icon"
                        fill
                        quality={100}
                        className="object-contain"
                      />
                    </div>
                  </BaseButton>
                </TooltipTrigger>
                <TooltipContent side="top" className="px-2 py-1">
                  <span className="inline-block text-nowrap text-xs">
                    Archive Wallet
                  </span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <BaseButton
                  type="button"
                  onClick={handleCopyMintAddress}
                  variant="gray"
                  size="short"
                  className="aspect-square size-8"
                >
                  <div className="relative z-30 aspect-square h-4 w-4 flex-shrink-0">
                    <Image
                      src="/icons/copy-primary.svg"
                      alt="Copy Icon"
                      fill
                      quality={100}
                      className="object-contain"
                    />
                  </div>
                </BaseButton>
              </TooltipTrigger>
              <TooltipContent side="top" className="px-2 py-1">
                <span className="inline-block text-nowrap text-xs">Copy</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <WithdrawModal walletAddress={mintAddress} isSingle />

          <WalletDistributePopoverModal />
        </>
      ) : (
        <div className="flex flex-col justify-end gap-x-2 gap-y-1.5 md:flex-row">
          {/* <PrivateKeyButton address={mintAddress} createdAt={createdAt} /> */}

          <div className="flex items-center justify-end gap-x-2">
            <div
              id={isFirst ? "wallet-manager-archive-button-first" : undefined}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <BaseButton
                      type="button"
                      onClick={onArchive}
                      isLoading={isArchivePending}
                      disabled={isArchivePending || isWalletSelected}
                      variant="gray"
                      size="short"
                      className="aspect-square size-8"
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
                              : "/icons/archieve-wallet.svg"
                          }
                          alt="Copy Icon"
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </div>
                    </BaseButton>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="px-2 py-1">
                    <span className="inline-block text-nowrap text-xs">
                      Archive Wallet
                    </span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <BaseButton
                    type="button"
                    onClick={handleCopyMintAddress}
                    variant="gray"
                    size="short"
                    className="aspect-square size-8"
                  >
                    <div className="relative z-30 aspect-square h-4 w-4 flex-shrink-0">
                      <Image
                        src="/icons/copy-primary.svg"
                        alt="Copy Icon"
                        fill
                        quality={100}
                        className="object-contain"
                      />
                    </div>
                  </BaseButton>
                </TooltipTrigger>
                <TooltipContent side="top" className="px-2 py-1">
                  <span className="inline-block text-nowrap text-xs">Copy</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <WithdrawModal walletAddress={mintAddress} isSingle />

            <WalletDistributePopoverModal />
          </div>
        </div>
      )}
    </>
  );
}
