"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateTrackedWallets,
  TrackedWallet,
} from "@/apis/rest/wallet-tracker";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import SelectEmoji from "./SelectEmoji";
import { Input } from "@/components/ui/input";
import BaseButton from "./buttons/BaseButton";
import CustomToast from "./toasts/CustomToast";
import { useWalletTrackerMessageStore } from "@/stores/footer/use-wallet-tracker-message.store";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";
import { isValidSolanaAddress } from "@/utils/walletValidation";
import { cn } from "@/libraries/utils";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useWindowSizeStore } from "@/stores/use-window-size.store";

// Define Zod schema for form validation
const walletFormSchema = z.object({
  walletName: z.string().min(1, "Wallet name is required"),
  walletAddress: z
    .string()
    .min(1, "Wallet address is required")
    .refine(isValidSolanaAddress, {
      message: "Please enter a valid Solana address",
    }),
  emoji: z.string().min(1, "Select an emoji"),
});

// Type for our form values
type WalletFormValues = z.infer<typeof walletFormSchema>;

// Content component - refactored from original AddTrackedWallet
function AddTrackedWalletContent({
  handleClose,
  closeComponent,
}: {
  handleClose: () => void;
  closeComponent: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const existingWallets = useWalletTrackerMessageStore(
    (state) => state.trackedWallets,
  );

  // Initialize react-hook-form with zod resolver
  const form = useForm<WalletFormValues>({
    resolver: zodResolver(walletFormSchema),
    defaultValues: {
      walletName: "",
      walletAddress: "",
      emoji: "",
    },
  });

  // Update wallets mutation
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const addWalletMutation = useMutation({
    mutationFn: (newWallet: TrackedWallet) =>
      updateTrackedWallets([newWallet, ...(existingWallets || [])]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracked-wallets"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-tracker"] });
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message="Wallet added successfully"
          state="SUCCESS"
        />
      ));
      timeoutRef.current = setTimeout(() => {
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

  const onSubmit = (values: WalletFormValues) => {
    const existAddress = existingWallets.some(
      (w) => w.address === values.walletAddress,
    );
    const existName = existingWallets.some((w) => w.name === values.walletName);
    if (existAddress) {
      form.setError("walletAddress", {
        message: "Wallet address already exists",
      });
      return;
    }
    if (existName) {
      form.setError("walletName", { message: "Wallet name already exists" });
      return;
    }
    addWalletMutation.mutate({
      emoji: values.emoji,
      name: values.walletName,
      address: values.walletAddress,
    });
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <div className="flex w-full items-center justify-start border-b border-border px-4 max-md:h-[56px] md:p-4">
        <h4 className="text-nowrap font-geistSemiBold text-[18px] text-fontColorPrimary max-xl:text-lg">
          Add Wallet
        </h4>
        {closeComponent}
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex w-full flex-grow flex-col gap-y-4 p-4">
            <div className="flex w-full gap-x-2">
              <FormField
                control={form.control}
                name="emoji"
                render={({ field }) => (
                  <FormItem className="flex max-w-14 flex-col gap-1">
                    <FormLabel>Emoji</FormLabel>
                    <SelectEmoji
                      alreadySelectedList={existingWallets.map((w) => w.emoji)}
                      value={field.value}
                      onChange={field.onChange}
                      triggerClassName="max-xl:h-10"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="walletName"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col gap-1">
                    <FormLabel>Wallet Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Wallet Name"
                        className="h-10 border border-border placeholder:text-fontColorSecondary focus:outline-none max-xl:text-base xl:h-[32px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="walletAddress"
              render={({ field }) => (
                <FormItem className="flex flex-grow flex-col gap-1">
                  <FormLabel>Wallet Address</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Wallet Address"
                      className="h-10 border border-border placeholder:text-fontColorSecondary focus:outline-none max-xl:text-base xl:h-[32px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="relative z-[100] flex w-full items-center justify-center rounded-b-[8px] border-t border-border bg-card p-4">
            <BaseButton
              type="submit"
              variant="primary"
              className="h-10 w-full xl:h-[32px]"
              disabled={addWalletMutation.isPending}
            >
              <span className="inline-block whitespace-nowrap font-geistSemiBold text-base xl:text-sm">
                {addWalletMutation.isPending ? "Adding..." : "Add Wallet"}
              </span>
            </BaseButton>
          </div>
        </form>
      </Form>
    </>
  );
}

// Main component - decides between Drawer or Popover
export default function AddTrackedWallet({
  type = "page",
}: {
  type?: "footer" | "page";
}) {
  const width = useWindowSizeStore((state) => state.width);
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const closeComponent = (
    <button
      onClick={handleClose}
      className="ml-auto size-[24px] cursor-pointer text-fontColorSecondary hover:text-white"
    >
      <X size={24} />
    </button>
  );

  const trigger = (
    <BaseButton
      variant="primary"
      className={cn(
        "w-full pl-2 pr-2",
        (width as number) > 450 && "pr-3",
        type == "footer" ? "h-[32px]" : "h-10",
      )}
      prefixIcon={
        <div className="relative aspect-square h-5 w-5 flex-shrink-0">
          <Image
            src="/icons/add.png"
            alt="Add Icon"
            fill
            quality={100}
            className="object-contain duration-300"
          />
        </div>
      }
    >
      {(width as number) > 450 && (
        <span
          className={cn(
            "inline-block whitespace-nowrap font-geistSemiBold text-[#080811]",
            type == "footer" ? "text-sm" : "text-base",
          )}
        >
          Add Wallet
        </span>
      )}
    </BaseButton>
  );

  if (width && width < 1280) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent className="border-border bg-card p-0 text-white">
          <DrawerTitle className="sr-only">Add Wallet</DrawerTitle>
          <AddTrackedWalletContent
            handleClose={handleClose}
            closeComponent={closeComponent}
          />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align="start"
        className="z-[999] w-[425px] border-border bg-card p-0 text-white"
      >
        <AddTrackedWalletContent
          handleClose={handleClose}
          closeComponent={closeComponent}
        />
      </PopoverContent>
    </Popover>
  );
}
