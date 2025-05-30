import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import React, { useState, useEffect } from "react";
import BaseButton from "./BaseButton";
import Image from "next/image";
import { cn } from "@/libraries/utils";
import { PopoverClose } from "@radix-ui/react-popover";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { revealWalletKey } from "@/apis/rest/wallet-manager";
import { Loader2 } from "lucide-react";
import CustomToast from "@/components/customs/toasts/CustomToast";
import toast from "react-hot-toast";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useWindowSizeStore } from "@/stores/use-window-size.store";

const PrivateKeyButton = ({
  address,
  createdAt,
  isMobile = false,
}: {
  address: string;
  createdAt: number;
  isMobile?: boolean;
}) => {
  const width = useWindowSizeStore((state) => state.width);
  const queryClient = useQueryClient();
  const [privateKey, setPrivateKey] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [isCopied, setIsCopied] = useState<boolean>(false);
  const handleCustomClose = (isOpen: boolean) => {
    if (!isOpen) {
      if (isCopied) {
        setIsOpen(false);
      } else {
        toast.custom((t: any) => (
          <CustomToast
            tVisibleState={t.visible}
            message={"Copy your private key first"}
            state="ERROR"
          />
        ));
      }
    }
  };

  useEffect(() => {
    const expirationTime = createdAt + 24 * 60 * 60;

    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const difference = expirationTime - now;

      if (difference <= 0) {
        setIsLocked(true);
        setTimeLeft("");
        clearInterval(timer);
      } else {
        const hours = Math.floor(difference / 3600);
        const minutes = Math.floor((difference % 3600) / 60);
        const seconds = difference % 60;
        setTimeLeft(
          `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
        );
        setIsLocked(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [createdAt]);

  const { mutate: revealKey, isPending: isRevealPending } = useMutation({
    mutationFn: revealWalletKey,
    onSuccess: (data) => {
      if (data.success && data.privateKey) {
        setPrivateKey(data.privateKey);
        setIsOpen(true);
        setIsCopied(false);
      } else {
        toast.custom((t: any) => (
          <CustomToast
            tVisibleState={t.visible}
            message={"Failed to reveal key"}
            state="ERROR"
          />
        ));
      }
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

  useEffect(() => {
    let timeout;

    if (!isOpen && isCopied) {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["wallets"] });
      }, 500);
    }
  }, [isOpen, isCopied, queryClient]);

  if (Math.floor(Date.now() / 1000) > createdAt + 24 * 60 * 60) {
    return null;
  }

  const contentBody = (
    <div className="relative flex w-full flex-col gap-y-4 p-4">
      <div className="flex items-center justify-center">
        {isRevealPending ? (
          <Loader2 className="h-[56px] w-[56px] animate-spin text-primary" />
        ) : (
          <div className="relative inline-block size-[56px]">
            <Image
              src="/images/Solana.png"
              alt="Solana Logo"
              fill
              quality={100}
              className="object-contain"
            />
          </div>
        )}
      </div>
      <div className="flex h-[48px] w-full flex-grow items-center justify-center gap-x-2 rounded-[8px] border border-border px-4 text-fontColorSecondary">
        <span className="inline-block w-full max-w-[50vw] overflow-hidden truncate text-nowrap text-base">
          {privateKey ||
            "•••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"}
        </span>
        <BaseButton
          variant="primary"
          className="hidden h-[32px] w-[79px] flex-shrink-0 px-0 xl:flex"
          onClick={() => {
            if (privateKey) {
              navigator.clipboard.writeText(privateKey);
              setIsCopied(true);
              toast.custom((t: any) => (
                <CustomToast
                  tVisibleState={t.visible}
                  message={"Private key copied to clipboard"}
                  state="SUCCESS"
                />
              ));
            }
          }}
          disabled={!privateKey}
        >
          <div className="relative inline-block size-4 flex-shrink-0">
            <Image
              src="/icons/black-copy.svg"
              alt="Copy Icon"
              fill
              quality={100}
              className="object-contain"
            />
          </div>
          Copy
        </BaseButton>
      </div>
      <BaseButton
        variant="primary"
        className="flex h-[40px] flex-shrink-0 px-0 xl:hidden"
        onClick={() => {
          if (privateKey) {
            navigator.clipboard.writeText(privateKey);
            setIsCopied(true);
            toast.custom((t: any) => (
              <CustomToast
                tVisibleState={t.visible}
                message={"Private key copied to clipboard"}
                state="SUCCESS"
              />
            ));
          }
        }}
        disabled={!privateKey}
      >
        <div className="relative inline-block size-5 flex-shrink-0">
          <Image
            src="/icons/black-copy.svg"
            alt="Copy Icon"
            fill
            quality={100}
            className="object-contain"
          />
        </div>
        Copy
      </BaseButton>
    </div>
  );

  const triggerButton = !isLocked && (
    <BaseButton
      className="h-[32px] w-full md:w-fit items-center justify-between gap-x-2 md:justify-center"
      onClick={() => revealKey(address)}
      disabled={isRevealPending}
    >
      <div className="flex items-center gap-x-2">
        {isRevealPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <div className="relative inline-block size-4">
            <Image
              src="/icons/key.svg"
              alt="Key Icon"
              fill
              quality={100}
              className="object-contain"
            />
          </div>
        )}
        <span className="text-nowrap font-geistSemiBold text-sm">
          {isRevealPending ? "Revealing Key..." : "Export Private Key"}
        </span>
      </div>
      <span className="inline-block text-nowrap rounded-[4px] bg-destructive/10 px-[4px] py-[2px] font-geistRegular text-[10px] text-destructive">
        Ends {timeLeft ? "in " + timeLeft : ""}
      </span>
    </BaseButton>
  );

  return (
    <>
      {width! <= 1280 ? (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerTrigger asChild>
            <div className="p-3 w-full">{triggerButton}</div>
          </DrawerTrigger>
          <DrawerContent className="p-0 xl:hidden">
            <DrawerHeader className="flex h-[56px] w-full items-center justify-between border-b border-border px-4">
              <DrawerTitle className="text-nowrap font-geistSemiBold text-[18px] text-fontColorPrimary">
                Export Private Keys
              </DrawerTitle>
              <DrawerClose asChild>
                <button className="flex h-6 w-6 cursor-pointer items-center justify-center bg-transparent text-transparent">
                  <div
                    className="relative aspect-square h-6 w-6 flex-shrink-0"
                    aria-label="Close"
                    title="Close"
                  >
                    <Image
                      src="/icons/close.png"
                      alt="Close Icon"
                      fill
                      quality={100}
                      className="object-contain"
                    />
                  </div>
                </button>
              </DrawerClose>
            </DrawerHeader>
            {contentBody}
          </DrawerContent>
        </Drawer>
      ) : (
        <Popover open={isOpen} onOpenChange={handleCustomClose}>
          <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={6}
            className={cn(
              "gb__white__popover h-[208px] w-[450px] rounded-[8px] border border-border p-0",
            )}
          >
            <div className="flex w-full items-center justify-start border-b border-border px-4 max-md:h-[56px] md:p-4">
              <h4 className="text-nowrap font-geistSemiBold text-[18px] text-fontColorPrimary">
                Export Private Keys
              </h4>
              <PopoverClose
                maker-close-button="true"
                className="ml-auto hidden cursor-pointer text-fontColorSecondary md:inline-block"
              >
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
            </div>
            {contentBody}
          </PopoverContent>
        </Popover>
      )}
    </>
  );
};

export default PrivateKeyButton;
