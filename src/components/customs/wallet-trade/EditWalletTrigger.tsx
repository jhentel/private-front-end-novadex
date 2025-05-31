import Image from "next/image";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import AddressWithEmojis from "../AddressWithEmojis";
import { cn } from "@/libraries/utils";
import { PopoverClose } from "@radix-ui/react-popover";
import SelectEmoji from "../SelectEmoji";
import { Input } from "@/components/ui/input";
import BaseButton from "../buttons/BaseButton";
import Copy from "../Copy";
import { useWindowSizeStore } from "@/stores/use-window-size.store";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isValidSolanaAddress } from "@/utils/walletValidation";
import { z } from "zod";
import { useWalletTrackerMessageStore } from "@/stores/footer/use-wallet-tracker-message.store";
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  TrackedWallet,
  updateTrackedWallets,
} from "@/apis/rest/wallet-tracker";
import { useSelectedWalletTrackerTradeAddressesFilterStore } from "@/stores/footer/use-selected-wallet-tracker-trade-filter.store";
import toast from "react-hot-toast";
import CustomToast from "../toasts/CustomToast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { truncateAddress } from "@/utils/truncateAddress";
import { usePopupStore } from "@/stores/use-popup-state";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useWalletHighlightStore } from "@/stores/wallets/use-wallet-highlight-colors.store";
import { StarIcon } from "lucide-react";
import { clearFooterSection } from "@/apis/rest/footer";
import { useFooterStore } from "@/stores/footer/use-footer.store";

const walletFormSchema = z.object({
  name: z
    .string()
    .min(1, "Wallet name is required")
    .max(38, "Maximum characters of wallet name is 38"),
  address: z
    .string()
    .min(1, "Wallet address is required")
    .refine(isValidSolanaAddress, {
      message: "Please enter a valid Solana address",
    }),
  emoji: z.string().min(1, "Select an emoji"),
});

// Type for our form values
type WalletFormValues = z.infer<typeof walletFormSchema>;

interface EditWalletTriggerProps {
  isModalContent?: boolean;
  walletAddress: string;
}
export default function EditWalletTrigger({
  isModalContent = true,
  walletAddress,
}: EditWalletTriggerProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const width = useWindowSizeStore((state) => state.width);
  const remainingScreenWidth = usePopupStore(
    (state) => state.remainingScreenWidth,
  );
  const trackedWallets = useWalletTrackerMessageStore(
    (state) => state.trackedWallets,
  );

  const existingWallets = useWalletTrackerMessageStore(
    (state) => state.trackedWallets,
  );
  const currentSelectedAddresses =
    useSelectedWalletTrackerTradeAddressesFilterStore(
      (state) => state.selectedWalletAddresses,
    );
  const setSelectedWalletAddressesFilter =
    useSelectedWalletTrackerTradeAddressesFilterStore(
      (state) => state.setSelectedWalletAddresses,
    );
  const walletToEdit = useMemo(() => {
    const existedWallet = trackedWallets.find(
      (w) => w.address === walletAddress,
    );
    if (existedWallet) return existedWallet;
    return {
      name: truncateAddress(walletAddress),
      address: walletAddress,
      emoji: "",
    };
  }, [trackedWallets]);

  // Initialize react-hook-form with zod resolver
  const form = useForm<WalletFormValues>({
    resolver: zodResolver(walletFormSchema),
    defaultValues: {
      name: walletToEdit.name || truncateAddress(walletAddress),
      address: walletToEdit.address || walletAddress,
      emoji: walletToEdit.emoji,
    },
  });

  const handleDeselect = () => {
    const newFilter = currentSelectedAddresses.filter(
      (a) => a !== walletAddress,
    );
    setSelectedWalletAddressesFilter(newFilter);
  };

  // add wallets mutation
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
      setIsOpen(false);
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

  // Update mutation
  const updateWalletsMutation = useMutation({
    mutationFn: updateTrackedWallets,
    onSuccess: () => {
      handleDeselect();
      queryClient.invalidateQueries({ queryKey: ["tracked-wallets"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-tracker"] });
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message="Wallet updated successfully"
          state="SUCCESS"
        />
      ));
      setIsOpen(false);
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
    // Update only the edited wallet in the tracked wallets array
    const updatedWallets = trackedWallets.map((w) =>
      w.address === walletAddress ? values : w,
    );
    const isWalletExist = trackedWallets.find(
      (w) => w.address === values.address,
    );

    if (!isWalletExist) {
      addWalletMutation.mutate(values);
      return;
    }
    updateWalletsMutation.mutate(updatedWallets);
  };

  const FormComponent = () => (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col"
      >
        <div className="flex w-full gap-x-2 p-4 pb-0">
          <div className="flex flex-col">
            <FormField
              control={form.control}
              name="emoji"
              render={({ field }) => (
                <FormItem className="flex max-w-14 flex-col gap-1">
                  <FormLabel>Emoji</FormLabel>
                  <SelectEmoji
                    alreadySelectedList={trackedWallets
                      .filter((w) => w.address !== walletAddress)
                      .map((w) => w.emoji)}
                    value={field.value}
                    onChange={field.onChange}
                    triggerClassName="max-xl:h-10"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex w-full flex-col gap-y-1">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col gap-1">
                  <FormLabel>Wallet Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Wallet Name"
                      className="h-10 border border-border placeholder:text-fontColorSecondary focus:outline-none xl:h-[32px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="flex flex-col gap-y-2 p-4">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="flex flex-grow flex-col gap-1">
                <FormLabel>Wallet Address</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Wallet Address"
                    className="h-10 border border-border placeholder:text-fontColorSecondary focus:outline-none xl:h-[32px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex w-full items-center justify-between border-t border-border p-4">
          <BaseButton variant="primary" className="h-[32px] w-full">
            <span className="inline-block whitespace-nowrap font-geistSemiBold text-sm">
              Save
            </span>
          </BaseButton>
        </div>
      </form>
    </Form>
  );

  if (width && width > 768) {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex w-full items-center gap-x-3 px-3 md:rounded-[4px] lg:w-[240px]">
          <div className="relative aspect-square size-4">
            <Image
              src="/icons/wallet.png"
              alt="Wallet Icon"
              fill
              quality={100}
              className="object-contain"
            />
          </div>
          <div className="flex h-full flex-shrink-0 flex-col justify-start">
            <span
              className={cn(
                "mb-[-0.2rem] flex w-fit items-center justify-center gap-2 font-geistSemiBold text-[16px] text-fontColorPrimary md:mb-0 md:text-[14px]",
                isModalContent && "max-w-[170px]",
                remainingScreenWidth < 1300 && "max-w-[170px]",
              )}
            >
              {walletToEdit.emoji && (
                <span className="relative aspect-square text-base">
                  {walletToEdit.emoji}
                </span>
              )}
              <span className="truncate">
                {walletToEdit.name || truncateAddress(walletAddress)}
              </span>

              <PopoverTrigger asChild className="size-3 cursor-pointer">
                <button
                  title="Edit"
                  className="relative ml-auto hidden aspect-square size-3 md:inline-block"
                >
                  <Image
                    src={
                      isOpen
                        ? "/icons/wallet-trades-edit.svg"
                        : "/icons/wallet-trades-edit-gray.svg"
                    }
                    alt="Wallet Trades Edit Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </button>
              </PopoverTrigger>
              <TrackWalletTrigger
                walletAddress={walletToEdit.address ?? walletAddress}
                handleDeselect={handleDeselect}
                trackedWallets={trackedWallets}
                existingWallets={existingWallets}
              />
            </span>

            <div className="flex w-fit cursor-pointer items-center justify-between gap-2">
              <AddressWithEmojis address={truncateAddress(walletAddress)} />
              <Copy value={walletAddress} />
            </div>
          </div>
        </div>
        <PopoverContent
          align="start"
          className={cn(
            "z-[9000] w-[380px] rounded-[8px] border border-border bg-card p-0 shadow-[0_0_20px_0_#000000]",
            !isModalContent && "w-[400px]",
          )}
        >
          <>
            <div className="flex w-full items-center justify-start border-b border-border p-4">
              <h4 className="text-nowrap font-geistSemiBold text-[18px] text-fontColorPrimary">
                Edit Wallet
              </h4>

              {/* X for mobile close modal */}
              <PopoverClose className="ml-auto cursor-pointer text-fontColorSecondary">
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
            <FormComponent />
          </>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex h-[54px] w-full items-center gap-3 border-b border-border bg-white/[4%] px-3 py-2">
        <div className="flex size-full flex-shrink-0 flex-col justify-start">
          <div className="relative w-full items-center gap-1">
            <div
              className={cn(
                "flex items-center gap-2",
                isModalContent && "max-w-[240px]",
              )}
            >
              {walletToEdit.emoji && (
                <span className="text-sm">{walletToEdit.emoji}</span>
              )}
              <h1 className="truncate font-geistBold text-sm text-fontColorPrimary">
                {walletToEdit.name || truncateAddress(walletAddress)}
              </h1>
              <TrackWalletTrigger
                walletAddress={walletToEdit.address ?? walletAddress}
                handleDeselect={handleDeselect}
                trackedWallets={trackedWallets}
                existingWallets={existingWallets}
              />
            </div>
          </div>

          <div className="flex w-full cursor-pointer items-center justify-between">
            <div className="flex gap-x-2 overflow-hidden">
              <p className="font-geistRegular text-xs text-fontColorSecondary">
                {truncateAddress(walletAddress)}
              </p>
              <Copy value={walletAddress} />
            </div>

            <DrawerTrigger className="relative ml-auto aspect-square size-[16px]">
              <Image
                src="/icons/wallet-trades-edit-white.svg"
                alt="Wallet Trades Edit Icon"
                fill
                quality={100}
                className="object-contain"
              />
            </DrawerTrigger>
          </div>
        </div>
      </div>
      <DrawerContent
        overlayClassName="z-[300]"
        className="z-[1000] w-[100%] gap-0 bg-card p-0 shadow-[0_0_20px_0_#000000]"
      >
        <div className="flex w-full items-center justify-start border-b border-border p-4">
          <DrawerTitle className="text-nowrap font-geistSemiBold text-[18px] text-fontColorPrimary">
            Edit Wallet
          </DrawerTitle>

          {/* X for mobile close modal */}
          <DrawerClose className="ml-auto cursor-pointer text-fontColorSecondary">
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
        <FormComponent />
      </DrawerContent>
    </Drawer>
  );
}

const TrackWalletTrigger = ({
  walletAddress,
  handleDeselect,
  trackedWallets,
  existingWallets,
}: {
  walletAddress: string;
  handleDeselect: () => void;
  trackedWallets: TrackedWallet[];
  existingWallets?: TrackedWallet[];
}) => {
  const queryClient = useQueryClient();
  const deleteWalletColor = useWalletHighlightStore(
    (state) => state.deleteWalletColor,
  );
  const setFooterMessage = useFooterStore((state) => state.setMessage);

  // Update wallets mutation
  const addWalletMutation = useMutation({
    mutationFn: (newWallet: TrackedWallet) =>
      updateTrackedWallets([newWallet, ...(existingWallets || [])]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracked-wallets"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-tracker"] });
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message="Wallet tracked successfully"
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
  // delete tracked wallet
  const deleteWalletsMutation = useMutation({
    mutationFn: updateTrackedWallets,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["tracked-wallets"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-tracker"] });
      const res = await clearFooterSection("walletTracker");
      setFooterMessage(res);
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message="Selected wallets deleted successfully"
          state="SUCCESS"
        />
      ));
      handleDeselect();
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

  const isWalletTracked = trackedWallets.find(
    (w) => w.address === walletAddress,
  );

  const handleClick = () => {
    if (!isWalletTracked) {
      addWalletMutation.mutate({
        address: walletAddress,
        name: "New Tracked Wallet",
        emoji: "🎯",
      });
      return;
    }
    deleteWalletsMutation.mutate(
      trackedWallets.filter((w) => w.address !== walletAddress),
    );
    deleteWalletColor(walletAddress);
  };
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleClick}
            className="relative inline-block aspect-square h-4 w-4"
          >
            <StarIcon
              size={16}
              fill={isWalletTracked ? "#FBA544" : "#9191A4"}
              color={isWalletTracked ? "#FBA544" : "#9191A4"}
            />
          </button>
        </TooltipTrigger>
        <TooltipContent>Track Wallet</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
