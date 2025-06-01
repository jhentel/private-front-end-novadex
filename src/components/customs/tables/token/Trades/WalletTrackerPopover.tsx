"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
// ######## Components 🧩 ########
import Image from "next/image";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PopoverClose } from "@radix-ui/react-popover";
import BaseButton from "@/components/customs/buttons/BaseButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SelectEmoji from "@/components/customs/SelectEmoji";
import CustomToast from "@/components/customs/toasts/CustomToast";
import AddressWithEmojis from "@/components/customs/AddressWithEmojis";
import CircleCount from "@/components/customs/CircleCount";
// ######## Utils & Helpers 🤝 ########
import {
  TrackedWallet,
  updateTrackedWallets,
} from "@/apis/rest/wallet-tracker";
import { useWalletTrackerStore } from "@/stores/footer/use-wallet-tracker";
import { truncateAddress } from "@/utils/truncateAddress";
import { Badge } from "@/components/ui/badge";
import { usePopupStore } from "@/stores/use-popup-state";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useWindowSizeStore } from "@/stores/use-window-size.store";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { isValidSolanaAddress } from "@/utils/walletValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

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

export default function WalletTrackerPopover({
  isFirst,
  makerAddress,
  isBuy,
  emojis,
  circleCount,
  isDeveloper,
  freshWalletFundedInfo,
  walletDefault,
  onOpenChange,
}: {
  isFirst: boolean;
  makerAddress: string;
  isBuy?: boolean;
  emojis: string[];
  circleCount: number;
  isDeveloper: boolean;
  walletDefault?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  freshWalletFundedInfo?: {
    wallet: string;
    fundedAmount: string;
    fundedBy: string;
    timestamp: number;
  };
}) {
  const [open, setOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const { remainingScreenWidth } = usePopupStore();

  const existingWallets = useWalletTrackerStore(
    (state) => state.trackedWallets,
  );
  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(open);
    }
  }, [open]);
  useEffect(() => {
    if (walletAddress.length > 0) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [walletAddress]);
  const queryClient = useQueryClient();

  const form = useForm<WalletFormValues>({
    resolver: zodResolver(walletFormSchema),
    defaultValues: {
      walletName: "",
      walletAddress: makerAddress,
      emoji: "",
    },
  });

  const addWalletMutation = useMutation({
    mutationFn: (newWallet: TrackedWallet) =>
      updateTrackedWallets([...(existingWallets || []), newWallet]),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tracked-wallets"],
      });
      setOpen(false);
      setWalletAddress("");
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message="Wallet added successfully"
          state="SUCCESS"
        />
      ));
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

  const width = useWindowSizeStore((state) => state.width);

  return (
    <>
      <div className="flex items-center gap-x-1" title="Set Wallet Address">
        {width! >= 1280 && (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button
                className="flex items-center gap-x-1"
                onClick={() => setWalletAddress(makerAddress)}
              >
                <AddressWithEmojis
                  walletDefault={walletDefault}
                  isWithOverview
                  isFirst={isFirst}
                  buy={isBuy}
                  fullAddress={makerAddress}
                  address={truncateAddress(makerAddress)}
                  emojis={emojis}
                  freshWalletFundedInfo={freshWalletFundedInfo}
                />
                <CircleCount value={circleCount} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="gb__white__popover h-auto w-[320px] rounded-[8px] border border-border p-0">
              <div className="flex h-[56px] w-full items-center justify-start border-b border-border px-4 md:p-4">
                <h4 className="text-nowrap font-geistSemiBold text-[18px] text-fontColorPrimary">
                  Add Wallet Tracker
                </h4>
                <PopoverClose
                  onClick={() => {
                    setWalletAddress("");
                  }}
                  className="ml-auto inline-block cursor-pointer text-fontColorSecondary"
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

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="relative flex w-full flex-grow flex-col px-4 pb-3 pt-2">
                    <div className="flex w-full gap-x-2">
                      <div className="flex flex-col gap-1">
                        <FormField
                          control={form.control}
                          name="emoji"
                          render={({ field }) => (
                            <FormItem className="flex max-w-14 flex-col gap-1">
                              <FormLabel>Emoji</FormLabel>
                              <SelectEmoji
                                alreadySelectedList={existingWallets.map(
                                  (w) => w.emoji,
                                )}
                                value={field.value}
                                onChange={field.onChange}
                                triggerClassName="max-xl:h-10"
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      {/* Hidden Input */}
                      <FormField
                        control={form.control}
                        name="walletAddress"
                        render={({ field }) => (
                          <FormItem className="invisible hidden flex-grow flex-col gap-1">
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
                      <div className="flex w-full flex-col gap-1">
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
                    </div>
                  </div>
                  <div className="flex h-[64px] w-full items-center justify-between gap-x-3 rounded-b-[8px] border border-t border-border bg-[#080811] p-4">
                    <BaseButton
                      type="submit"
                      variant="primary"
                      className="h-10 w-full xl:h-[32px]"
                      disabled={addWalletMutation.isPending}
                    >
                      <span className="inline-block whitespace-nowrap font-geistSemiBold text-base xl:text-sm">
                        {addWalletMutation.isPending
                          ? "Adding..."
                          : "Add Wallet"}
                      </span>
                    </BaseButton>
                  </div>
                </form>
              </Form>
            </PopoverContent>
          </Popover>
        )}

        {isDeveloper && remainingScreenWidth > 1500 && (
          <Badge className="bg-white/[12%] py-1 leading-3 text-warning">
            DEV
          </Badge>
        )}

        {width! < 1280 && (
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
              <button
                className="flex items-center gap-x-1"
                onClick={() => setWalletAddress(makerAddress)}
              >
                <AddressWithEmojis
                  walletDefault={walletDefault}
                  isWithOverview
                  isFirst={isFirst}
                  buy={isBuy}
                  fullAddress={makerAddress}
                  address={truncateAddress(makerAddress)}
                  emojis={emojis}
                  freshWalletFundedInfo={freshWalletFundedInfo}
                />
                <CircleCount value={circleCount} />
              </button>
            </DrawerTrigger>
            <DrawerContent className="h-[204px] w-full p-0 xl:hidden">
              <div className="flex h-[56px] w-full items-center justify-start border-b border-border px-4 md:p-4">
                <DrawerTitle className="text-nowrap font-geistSemiBold text-[18px] text-fontColorPrimary">
                  Add Wallet Tracker
                </DrawerTitle>
                <DrawerClose
                  onClick={() => {
                    setWalletAddress("");
                  }}
                  className="ml-auto inline-block cursor-pointer text-fontColorSecondary"
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
                </DrawerClose>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="relative flex w-full flex-grow flex-col px-4 pt-4">
                    <div className="flex w-full gap-x-2">
                      <div className="flex flex-col gap-1">
                        <FormField
                          control={form.control}
                          name="emoji"
                          render={({ field }) => (
                            <FormItem className="flex max-w-14 flex-col gap-1">
                              <FormLabel>Emoji</FormLabel>
                              <SelectEmoji
                                alreadySelectedList={existingWallets.map(
                                  (w) => w.emoji,
                                )}
                                value={field.value}
                                onChange={field.onChange}
                                triggerClassName="max-xl:h-10"
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      {/* Hidden Input */}
                      <FormField
                        control={form.control}
                        name="walletAddress"
                        render={({ field }) => (
                          <FormItem className="invisible hidden flex-grow flex-col gap-1">
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
                      <div className="flex w-full flex-col gap-1">
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
                    </div>
                  </div>
                  <div className="flex h-[64px] w-full items-center justify-between gap-x-3 mt-4 p-4">
                    <BaseButton
                      type="submit"
                      isLoading={addWalletMutation.isPending}
                      disabled={addWalletMutation.isPending}
                      variant="primary"
                      className="h-8 w-full"
                    >
                      <span className="text-sm">
                        {addWalletMutation.isPending
                          ? "Adding..."
                          : "Add Wallet"}
                      </span>
                    </BaseButton>
                  </div>
                </form>
              </Form>
            </DrawerContent>
          </Drawer>
        )}
      </div>
    </>
  );
}
