"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as z from "zod";
import { importWallets } from "@/apis/rest/wallet-manager";
import CustomToast from "@/components/customs/toasts/CustomToast";
import toast from "react-hot-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
// ######## Components 🧩 ########
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import BaseButton from "../buttons/BaseButton";
import { Input } from "@/components/ui/input";
import { useWindowSizeStore } from "@/stores/use-window-size.store";

// Schema to validate Solana private key format
const importWalletSchema = z.object({
  name: z.string().min(1, "Name is required"),
  key: z
    .string()
    .min(1, "Private key is required")
    .refine(
      (value) => {
        const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{87,88}$/;
        const rawKeyRegex = /^[0-9a-fA-F]{64}$/;
        return base58Regex.test(value) || rawKeyRegex.test(value);
      },
      {
        message:
          "Invalid Solana private key format. Please enter a valid wallet private key.",
      },
    ),
});

type ImportWalletValues = z.infer<typeof importWalletSchema>;

export default function ImportWalletPopoverModal() {
  const queryClient = useQueryClient();
  const [openPopover, setOpenPopover] = useState(false);
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const width = useWindowSizeStore((state) => state.width);
  useEffect(() => {
    if (width! >= 1024 && openDrawer) {
      setOpenDrawer(false);
    } else if (width! < 1024 && openPopover) {
      setOpenPopover(false);
    }
  }, [width]);

  const form = useForm<ImportWalletValues>({
    resolver: zodResolver(importWalletSchema),
    defaultValues: {
      name: "",
      key: "",
    },
  });

  // Update mutation to only send private key
  const importWalletMutation = useMutation({
    mutationFn: (props: { key: string; name: string }) => {
      return importWallets([props]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message="Wallet imported successfully"
          state="SUCCESS"
        />
      ));
      handleDrawerClose(false);
      setOpenPopover(false);
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

  const handleDrawerClose = (isOpen: boolean) => {
    setOpenDrawer(isOpen);
    if (!isOpen) {
      form.reset();
    }
  };

  const onSubmit = (data: ImportWalletValues) => {
    importWalletMutation.mutate(data);
  };

  return (
    <>
      {/* Desktop Popover */}
      <Popover open={openPopover} onOpenChange={setOpenPopover}>
        <PopoverTrigger asChild>
          <BaseButton
            variant="gray"
            className="h-10 max-md:hidden"
            prefixIcon={
              <div className="relative aspect-square size-[20px] flex-shrink-0">
                <Image
                  src="/icons/import-primary.svg"
                  alt="Import Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </div>
            }
          >
            <span className="inline-block font-geistSemiBold text-base text-fontColorPrimary">
              Import wallet
            </span>
          </BaseButton>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={6}
          className="hidden w-[360px] flex-col rounded-[8px] border border-border bg-card p-0 shadow-[0_0_20px_0_#000000] md:flex"
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex h-[52px] w-full items-center justify-between border-b border-border p-4">
                <h4 className="text-nowrap font-geistSemiBold text-lg text-fontColorPrimary">
                  Import Wallet
                </h4>
                <button
                  onClick={() => setOpenPopover((prev) => !prev)}
                  className="relative aspect-square h-6 w-6 flex-shrink-0"
                >
                  <Image
                    src="/icons/close.png"
                    alt="Close Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </button>
              </div>
              <div className="flex flex-col gap-y-3 p-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="walletName">Wallet name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter wallet name"
                          className="border border-border bg-transparent placeholder:text-fontColorSecondary focus:outline-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="key">Private Key</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your private key"
                          className="border border-border bg-transparent placeholder:text-fontColorSecondary focus:outline-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="border-t border-border p-4">
                <BaseButton
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={importWalletMutation.isPending}
                >
                  {importWalletMutation.isPending ? "Importing..." : "Submit"}
                </BaseButton>
              </div>
            </form>
          </Form>
        </PopoverContent>
      </Popover>

      {/* Mobile Drawer */}
      <Drawer open={openDrawer} onOpenChange={handleDrawerClose}>
        <DrawerTrigger asChild>
          <BaseButton variant="gray" className="size-10 md:hidden">
            <div className="relative aspect-square size-[20px] flex-shrink-0">
              <Image
                src="/icons/import-primary.svg"
                alt="Import Icon"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
          </BaseButton>
        </DrawerTrigger>
        <DrawerContent className="flex h-auto w-full flex-col gap-y-0 bg-card xl:hidden">
          <DrawerHeader className="flex h-[56px] w-full items-center justify-between border-b border-border px-4">
            <DrawerTitle className="text-lg">Import Wallet</DrawerTitle>
            <DrawerClose asChild>
              <button
                onClick={() => handleDrawerClose(false)}
                className="flex h-6 w-6 cursor-pointer items-center justify-center bg-transparent text-transparent"
              >
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-y-3 p-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="walletName">Wallet name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter wallet name"
                          className="h-10 border border-border bg-transparent text-sm placeholder:text-fontColorSecondary focus:outline-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="key">Private Key</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your private key"
                          className="h-10 border border-border bg-transparent placeholder:text-fontColorSecondary focus:outline-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="border-t border-border p-4">
                <BaseButton
                  type="submit"
                  variant="primary"
                  className="h-10 w-full"
                  disabled={importWalletMutation.isPending}
                >
                  {importWalletMutation.isPending ? "Importing..." : "Submit"}
                </BaseButton>
              </div>
            </form>
          </Form>
        </DrawerContent>
      </Drawer>
    </>
  );
}
