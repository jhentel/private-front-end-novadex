"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
// ######## Components 🧩 ########
import Image from "next/image";
import { OverlayScrollbarsComponent, OverlayScrollbarsComponentRef } from "overlayscrollbars-react";
import CustomToast from "@/components/customs/toasts/CustomToast";
// ######## Utils & Helpers 🤝 ########
import BaseButton from "@/components/customs/buttons/BaseButton";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getTwitterSniper,
  twitterSniperSchema,
  TwitterSniperTask,
  updateTwitterSniper,
} from "@/apis/rest/sniper";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { CachedImage } from "../../CachedImage";
import { Separator } from "@radix-ui/react-select";
import { motion, AnimatePresence } from "framer-motion";
import { ComboboxTwitter } from "../../ComboboxTwitter";
import LabelStatusIndicator from "../../LabelStatusIndicator";
import OnOffToggle from "../../OnOffToggle";
import { TwitterAccount } from "@/apis/rest/twitter-monitor";

type SnipeTwitterProps = {
  toggleModal: () => void;
};

export default function SnipeTwitterForm({
  toggleModal,
}: SnipeTwitterProps) {
  const queryClient = useQueryClient();
  const [openAdvanceSettings, setOpenAdvanceSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [twitterAccount, setTwitterAccount] = useState<TwitterAccount | null>(
    null,
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getTwitterSniper();
        form.reset({
          ...form.watch(),
          ...res,
        });
      } catch (error) {
        console.warn(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const form = useForm<TwitterSniperTask>({
    resolver: zodResolver(twitterSniperSchema),
    defaultValues: {
      username: "",
      amount: 20,
      snipeTweet: true,
      snipeReply: true,
      snipeRetweet: false,
      snipeBio: true,
      minMarketCap: 1000,
      maxMarketCap: 2000000,
      minTokenAge: 1,
      maxTokenAge: 100,
      dex: "Pumpfun",
      checkFreeze: true,
      checkMint: false,
      slippage: 20,
      mevProtectEnabled: true,
      autoTipEnabled: false,
      fee: 20,
      tip: 20,
    },
  });

  const mutation = useMutation({
    mutationFn: updateTwitterSniper,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["twitter-sniper"] });
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message="Settings updated successfully"
          state="SUCCESS"
        />
      ));
      toggleModal();
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

  const onSubmit = async (data: TwitterSniperTask) => {
    await mutation.mutateAsync(data);
  };

  const handleSelectDEX = (value: string) => {
    const currentDexes = form.getValues("dex");
    const newDexes = new Set(currentDexes);
    if (newDexes.has(value)) {
      newDexes.delete(value);
    } else {
      newDexes.add(value);
    }
    form.setValue("dex", value);
  };

  const osRef = useRef<OverlayScrollbarsComponentRef>(null);
  const scrollToBottomContent = () => {
    const { current } = osRef;
    const osInstance = current?.osInstance();

    if (!osInstance) {
      return;
    }

    const { scrollOffsetElement } = osInstance.elements();
    const { scrollHeight } = scrollOffsetElement;

    setTimeout(() => {
      scrollOffsetElement.scrollTo({
        behavior: "smooth",
        top: scrollHeight + 100,
      });
    }, 320);
  };

  return (
    <>
      {isLoading ? (
        <div className="flex h-full w-full items-center justify-center">
          <div className="flex flex-col items-center gap-y-2">
            <div className="relative aspect-square h-8 w-8 animate-spin">
              <Image
                src="/icons/search-loading.png"
                alt="Loading Spinner"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
            <span className="text-sm text-fontColorSecondary">Loading...</span>
          </div>
        </div>
      ) : (
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();

              if (form.getValues("amount") === 0) {
                toast.custom((t: any) => (
                  <CustomToast
                    tVisibleState={t.visible}
                    message="Amount should be greater than 0"
                    state="ERROR"
                  />
                ));
              }
              const finalData = {
                ...form.getValues(),
                slippage: Number(form.getValues().slippage) || 1,
              };
              form.reset(finalData);
              form.handleSubmit(onSubmit)(e);
            }}
            className="relative flex flex-grow flex-col"
          >
            <OverlayScrollbarsComponent
              defer
              element="div"
              ref={osRef}
              className="invisible__overlayscrollbar relative w-full h-[320px] flex-grow overflow-y-scroll md:h-[520px]"
            >
              <div className="absolute left-0 top-0 w-full flex-grow">
                <div className="flex w-full flex-col gap-y-4 px-4 pt-4">
                  <div className="grid h-auto w-full grid-cols-2 gap-x-4 gap-y-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem className="col-span-1">
                          <FormLabel className="text-sm text-fontColorSecondary">
                            Twitter Username
                          </FormLabel>
                          <FormControl>
                            <ComboboxTwitter
                              id={`account-input-combobox-username`}
                              onChange={(value) => {
                                field.onChange(value.username);
                                setTwitterAccount(value);
                              }}
                              value={field.value}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem className="col-span-1">
                          <FormLabel className="text-sm text-fontColorSecondary">
                            Buy Amount
                          </FormLabel>
                          <FormControl>
                            <Input
                              isNumeric
                              decimalScale={9}
                              {...field}
                              onNumericValueChange={(values) => {
                                const newValue =
                                  values.floatValue === undefined
                                    ? 0
                                    : values.floatValue;
                                field.onChange(newValue);
                              }}
                              placeholder="0.0"
                              prefixEl={
                                <div className="absolute left-3.5 aspect-square h-4 w-4 flex-shrink-0">
                                  <CachedImage
                                    src="/icons/solana-sq.svg"
                                    alt="Solana SQ Icon"
                                    fill
                                    quality={100}
                                    className="object-contain"
                                  />
                                </div>
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="snipeTweet"
                      render={({ field }) => (
                        <FormItem className="col-span-1">
                          <FormLabel className="flex items-center gap-x-2 text-sm text-fontColorSecondary">
                            Twitter Tweet
                            <LabelStatusIndicator
                              status={field.value ? "ON" : "OFF"}
                            />
                          </FormLabel>
                          <FormControl>
                            <OnOffToggle
                              value={field.value ? "ON" : "OFF"}
                              setValue={(value) =>
                                field.onChange(value === "ON")
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="snipeReply"
                      render={({ field }) => (
                        <FormItem className="col-span-1">
                          <FormLabel className="flex items-center gap-x-2 text-sm text-fontColorSecondary">
                            Twitter Reply
                            <LabelStatusIndicator
                              status={field.value ? "ON" : "OFF"}
                            />
                          </FormLabel>
                          <FormControl>
                            <OnOffToggle
                              value={field.value ? "ON" : "OFF"}
                              setValue={(value) =>
                                field.onChange(value === "ON")
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="snipeRetweet"
                      render={({ field }) => (
                        <FormItem className="col-span-1">
                          <FormLabel className="flex items-center gap-x-2 text-sm text-fontColorSecondary">
                            Twitter RT
                            <LabelStatusIndicator
                              status={field.value ? "ON" : "OFF"}
                            />
                          </FormLabel>
                          <FormControl>
                            <OnOffToggle
                              value={field.value ? "ON" : "OFF"}
                              setValue={(value) =>
                                field.onChange(value === "ON")
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="snipeBio"
                      render={({ field }) => (
                        <FormItem className="col-span-1">
                          <FormLabel className="flex items-center gap-x-2 text-sm text-fontColorSecondary">
                            Twitter Bio
                            <LabelStatusIndicator
                              status={field.value ? "ON" : "OFF"}
                            />
                          </FormLabel>
                          <FormControl>
                            <OnOffToggle
                              value={field.value ? "ON" : "OFF"}
                              setValue={(value) =>
                                field.onChange(value === "ON")
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="minMarketCap"
                      render={({ field }) => (
                        <FormItem className="col-span-1">
                          <FormLabel className="text-sm text-fontColorSecondary">
                            Min Market Cap
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.0"
                              {...field}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                if (value < 0) return;
                                field.onChange(value);
                              }}
                              prefixEl={
                                <div className="absolute left-3.5 aspect-square h-4 w-4 flex-shrink-0">
                                  <Image
                                    src="/icons/token/currency.png"
                                    alt="Currency Icon"
                                    fill
                                    quality={100}
                                    className="object-contain"
                                  />
                                </div>
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="maxMarketCap"
                      render={({ field }) => (
                        <FormItem className="col-span-1">
                          <FormLabel className="text-sm text-fontColorSecondary">
                            Max Market Cap
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.0"
                              {...field}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                if (value < 0) return;
                                field.onChange(value);
                              }}
                              prefixEl={
                                <div className="absolute left-3.5 aspect-square h-4 w-4 flex-shrink-0">
                                  <Image
                                    src="/icons/token/currency.png"
                                    alt="Currency Icon"
                                    fill
                                    quality={100}
                                    className="object-contain"
                                  />
                                </div>
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="minTokenAge"
                      render={({ field }) => (
                        <FormItem className="col-span-1">
                          <FormLabel className="text-sm text-fontColorSecondary">
                            Min Token Age
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.0"
                              {...field}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                if (value < 0) return;
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="maxTokenAge"
                      render={({ field }) => (
                        <FormItem className="col-span-1">
                          <FormLabel className="text-sm text-fontColorSecondary">
                            Max Token Age
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.0"
                              {...field}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                if (value < 0) return;
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid h-auto w-full grid-cols-1">
                    <div className="col-span-1 flex h-auto w-full flex-col justify-between gap-y-1.5">
                      <FormField
                        control={form.control}
                        name="dex"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-fontColorSecondary">
                              Dex
                            </FormLabel>
                            <FormControl>
                              <div className="flex w-full flex-col gap-y-1.5">
                                <div
                                  onClick={() => handleSelectDEX("Pumpfun")}
                                  className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border bg-white/[3%] py-1 pl-2 pr-1 duration-300 hover:bg-white/[6%]"
                                >
                                  <div className="flex items-center gap-x-2">
                                    <div className="relative aspect-square h-5 w-5 flex-shrink-0">
                                      <Image
                                        src="/icons/asset/pumpfun.png"
                                        alt="Pump Fun Icon"
                                        fill
                                        quality={100}
                                        className="object-contain"
                                      />
                                    </div>
                                    <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                                      Pump.Fun
                                    </span>
                                  </div>
                                  <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                                    <Image
                                      src={
                                        field.value.includes("Pumpfun")
                                          ? "/icons/footer/checked.png"
                                          : "/icons/footer/unchecked.png"
                                      }
                                      alt="Check / Unchecked Icon"
                                      fill
                                      quality={100}
                                      className="object-contain"
                                    />
                                  </div>
                                </div>
                                <div
                                  onClick={() => handleSelectDEX("Moonshot")}
                                  className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border bg-white/[3%] py-1 pl-2 pr-1 duration-300 hover:bg-white/[6%]"
                                >
                                  <div className="flex items-center gap-x-2">
                                    <div className="relative aspect-square h-5 w-5 flex-shrink-0">
                                      <Image
                                        src="/icons/asset/moonshot.png"
                                        alt="Moonshot Icon"
                                        fill
                                        quality={100}
                                        className="object-contain"
                                      />
                                    </div>
                                    <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                                      Moonshot
                                    </span>
                                  </div>
                                  <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                                    <Image
                                      src={
                                        field.value.includes("Moonshot")
                                          ? "/icons/footer/checked.png"
                                          : "/icons/footer/unchecked.png"
                                      }
                                      alt="Check / Unchecked Icon"
                                      fill
                                      quality={100}
                                      className="object-contain"
                                    />
                                  </div>
                                </div>
                                <div
                                  onClick={() => handleSelectDEX("Raydium")}
                                  className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border bg-white/[3%] py-1 pl-2 pr-1 duration-300 hover:bg-white/[6%]"
                                >
                                  <div className="flex items-center gap-x-2">
                                    <div className="relative aspect-square h-5 w-5 flex-shrink-0">
                                      <Image
                                        src="/icons/asset/raydium.png"
                                        alt="Raydium Icon"
                                        fill
                                        quality={100}
                                        className="object-contain"
                                      />
                                    </div>
                                    <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                                      Raydium
                                    </span>
                                  </div>
                                  <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                                    <Image
                                      src={
                                        field.value.includes("Raydium")
                                          ? "/icons/footer/checked.png"
                                          : "/icons/footer/unchecked.png"
                                      }
                                      alt="Check / Unchecked Icon"
                                      fill
                                      quality={100}
                                      className="object-contain"
                                    />
                                  </div>
                                </div>
                                <div
                                  onClick={() => handleSelectDEX("Pumpswap")}
                                  className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border bg-white/[3%] py-1 pl-2 pr-1 duration-300 hover:bg-white/[6%]"
                                >
                                  <div className="flex items-center gap-x-2">
                                    <div className="relative aspect-square h-5 w-5 flex-shrink-0 hue-rotate-[120deg] saturate-150">
                                      <Image
                                        src="/icons/asset/pumpfun.png"
                                        alt="Pump Swap Icon"
                                        fill
                                        quality={100}
                                        className="object-contain"
                                      />
                                    </div>
                                    <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                                      Pump.Swap
                                    </span>
                                  </div>
                                  <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                                    <Image
                                      src={
                                        field.value.includes("Pumpswap")
                                          ? "/icons/footer/checked.png"
                                          : "/icons/footer/unchecked.png"
                                      }
                                      alt="Check / Unchecked Icon"
                                      fill
                                      quality={100}
                                      className="object-contain"
                                    />
                                  </div>
                                </div>
                                <div
                                  onClick={() => handleSelectDEX("Meteora")}
                                  className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border bg-white/[3%] py-1 pl-2 pr-1 duration-300 hover:bg-white/[6%]"
                                >
                                  <div className="flex items-center gap-x-2">
                                    <div className="relative aspect-square h-5 w-5 flex-shrink-0">
                                      <Image
                                        src="/icons/asset/meteora.png"
                                        alt="Meteora Icon"
                                        fill
                                        quality={100}
                                        className="object-contain"
                                      />
                                    </div>
                                    <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                                      Meteora
                                    </span>
                                  </div>
                                  <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                                    <Image
                                      src={
                                        field.value.includes("Meteora")
                                          ? "/icons/footer/checked.png"
                                          : "/icons/footer/unchecked.png"
                                      }
                                      alt="Check / Unchecked Icon"
                                      fill
                                      quality={100}
                                      className="object-contain"
                                    />
                                  </div>
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="grid h-auto w-full grid-cols-1">
                    <div className="col-span-1 flex h-auto w-full flex-col justify-between gap-y-1.5">
                      <div className="flex w-full flex-col gap-y-1.5">
                        <FormField
                          control={form.control}
                          name="checkFreeze"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm text-fontColorSecondary">
                                Authority
                              </FormLabel>
                              <FormControl>
                                <div
                                  onClick={() => field.onChange(!field.value)}
                                  className="flex h-8 w-full cursor-pointer items-center gap-x-2 rounded-[8px] border border-border px-2 py-1"
                                >
                                  <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                                    <Image
                                      src={
                                        field.value
                                          ? "/icons/footer/checked.png"
                                          : "/icons/footer/unchecked.png"
                                      }
                                      alt="Check / Unchecked Icon"
                                      fill
                                      quality={100}
                                      className="object-contain"
                                    />
                                  </div>
                                  <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                                    if Freeze Authority is Disabled
                                  </span>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="checkMint"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div
                                  onClick={() => field.onChange(!field.value)}
                                  className="flex h-8 w-full cursor-pointer items-center gap-x-2 rounded-[8px] border border-border px-2 py-1"
                                >
                                  <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                                    <Image
                                      src={
                                        !field.value
                                          ? "/icons/footer/checked.png"
                                          : "/icons/footer/unchecked.png"
                                      }
                                      alt="Check / Unchecked Icon"
                                      fill
                                      quality={100}
                                      className="object-contain"
                                    />
                                  </div>
                                  <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                                    if Mint Authority is Disabled
                                  </span>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <Separator className="mt-4" />

                <motion.div
                  animate={openAdvanceSettings ? "open" : "closed"}
                  className="h-auto w-full px-4"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setOpenAdvanceSettings((prev) => !prev);
                      scrollToBottomContent();
                    }}
                    className="flex h-[48px] w-full items-center justify-between"
                  >
                    <div className="flex items-center gap-x-2">
                      <div className="relative aspect-square h-[18px] w-[18px] focus:border-none focus:outline-none focus:ring-0">
                        <Image
                          src="/icons/white-setting.png"
                          alt="White Setting Icon"
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </div>
                      <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                        Advanced Settings
                      </span>
                    </div>
                    <div className="relative aspect-square h-6 w-6 flex-shrink-0 cursor-pointer">
                      <Image
                        src="/icons/pink-chevron-down.png"
                        alt="Accordion Icon"
                        fill
                        quality={100}
                        className={`object-contain transition-transform duration-300 ${openAdvanceSettings ? "rotate-180" : "rotate-0"
                          }`}
                      />
                    </div>
                  </button>

                  <AnimatePresence>
                    {openAdvanceSettings && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="flex w-full flex-col gap-y-4 pb-2">
                          <div className="grid h-[58px] w-full grid-cols-3 gap-x-3">
                            <FormField
                              control={form.control}
                              name="slippage"
                              render={({ field }) => (
                                <FormItem className="col-span-1">
                                  <FormLabel className="text-sm text-fontColorSecondary">
                                    Slippage
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      {...field}
                                      onChange={(e) => {
                                        const value = parseFloat(
                                          e.target.value,
                                        );
                                        if (value < 0 || value > 100) return;
                                        field.onChange(value);
                                      }}
                                      placeholder="1-100"
                                      suffixEl={
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-fontColorSecondary">
                                          %
                                        </span>
                                      }
                                      parentClassName="md:max-w-[240px]"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="mevProtectEnabled"
                              render={({ field }) => (
                                <FormItem className="col-span-1">
                                  <FormLabel className="flex items-center gap-x-2 text-sm text-fontColorSecondary">
                                    Mev Protect
                                    <LabelStatusIndicator
                                      status={field.value ? "ON" : "OFF"}
                                    />
                                  </FormLabel>
                                  <FormControl>
                                    <OnOffToggle
                                      value={field.value ? "ON" : "OFF"}
                                      setValue={(value) => {
                                        field.onChange(value);
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="autoTipEnabled"
                              render={({ field }) => (
                                <FormItem className="col-span-1">
                                  <FormLabel className="flex items-center gap-x-2 text-sm text-fontColorSecondary">
                                    Auto-Tip
                                    <LabelStatusIndicator
                                      status={field.value ? "ON" : "OFF"}
                                    />
                                  </FormLabel>
                                  <FormControl>
                                    <OnOffToggle
                                      value={field.value ? "ON" : "OFF"}
                                      setValue={(value) =>
                                        field.onChange(value === "ON")
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid h-[58px] w-full grid-cols-2 gap-x-3">
                            <FormField
                              control={form.control}
                              name="fee"
                              render={({ field }) => (
                                <FormItem className="col-span-1">
                                  <FormLabel className="text-sm text-fontColorSecondary">
                                    Priority Fee
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      isNumeric
                                      decimalScale={9}
                                      {...field}
                                      onNumericValueChange={(values) => {
                                        const newValue =
                                          values.floatValue === undefined
                                            ? 0
                                            : values.floatValue;
                                        field.onChange(newValue);
                                        form.trigger("fee");
                                      }}
                                      placeholder="Priority Fee"
                                      prefixEl={
                                        <div className="absolute left-3.5 aspect-square h-4 w-4 flex-shrink-0">
                                          <CachedImage
                                            src="/icons/solana-sq.svg"
                                            alt="Solana SQ Icon"
                                            fill
                                            quality={100}
                                            className="object-contain"
                                          />
                                        </div>
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="tip"
                              render={({ field }) => (
                                <FormItem className="col-span-1">
                                  <FormLabel className="text-sm text-fontColorSecondary">
                                    Bribery Amount
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      isNumeric
                                      decimalScale={9}
                                      {...field}
                                      onNumericValueChange={(values) => {
                                        const newValue =
                                          values.floatValue === undefined
                                            ? 0
                                            : values.floatValue;
                                        field.onChange(newValue);
                                        form.trigger("fee");
                                      }}
                                      placeholder="Priority Fee"
                                      prefixEl={
                                        <div className="absolute left-3.5 aspect-square h-4 w-4 flex-shrink-0">
                                          <CachedImage
                                            src="/icons/solana-sq.svg"
                                            alt="Solana SQ Icon"
                                            fill
                                            quality={100}
                                            className="object-contain"
                                          />
                                        </div>
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            </OverlayScrollbarsComponent>
            <div className="flex flex-col items-center justify-center gap-y-4 border-t border-border p-4">
              <BaseButton
                type="submit"
                variant="primary"
                className="h-[32px] w-full"
                disabled={mutation.isPending}
              >
                <span className="inline-block whitespace-nowrap font-geistSemiBold text-sm">
                  {mutation.isPending ? "Saving..." : "Submit"}
                </span>
              </BaseButton>
            </div>
          </form>
        </Form>
      )}
    </>
  );
}
