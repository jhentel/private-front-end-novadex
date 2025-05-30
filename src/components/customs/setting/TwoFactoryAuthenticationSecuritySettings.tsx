/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useQuery, useMutation } from "@tanstack/react-query";
import Image from "next/image";

// Form Components
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import BaseButton from "@/components/customs/buttons/BaseButton";

// API & Validation
import {
  configure2FASchema,
  configure2FA,
  get2FAStatus,
  passcodeSchema,
  confirmPasscodeSchema,
  emailSchema,
  complete2FASetup,
  authenticate,
} from "@/apis/rest/settings/two-factor-auth";
import type { Configure2FARequest } from "@/apis/rest/settings/two-factor-auth";
import { cn } from "@/libraries/utils";
import CustomToast from "../toasts/CustomToast";
import toast from "react-hot-toast";
import { z } from "zod";
import { AnimatePresence } from "framer-motion";
import Preloader from "../Preloader";
import { useRouter, useSearchParams } from "next/navigation";

export default function TwoFactoryAuthenticationSecuritySettings() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verificationToken = searchParams?.get("token") ?? "";

  const [securityStep, setSecurityStep] = useState<
    "INITIAL" | "SET PASSCODE" | "PASSCODE CONFIRMATION" | "EMAIL ADDRESS"
  >("INITIAL");

  // LOAD
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isDCFirstImageLoading, setIsDCFirstImageLoading] = useState(true);
  const [isDCSecondImageLoading, setIsDCSecondImageLoading] = useState(true);

  // Query 2FA Status
  const {
    data: twoFAStatus,
    refetch: refetchStatus,
    isLoading: isLoadingFetch,
  } = useQuery({
    queryKey: ["2faStatus"],
    queryFn: () => get2FAStatus(),
  });

  // Extract configured state from query data - memoized
  const isConfigured = useMemo(
    () => twoFAStatus?.enabled || false,
    [twoFAStatus?.enabled],
  );

  // Memoize the validation schema based on the current step and isConfigured state
  const validationSchema = useMemo(() => {
    switch (securityStep) {
      case "SET PASSCODE":
        return passcodeSchema;
      case "PASSCODE CONFIRMATION":
        return confirmPasscodeSchema;
      case "EMAIL ADDRESS":
        if (isConfigured) {
          // For updating email, we only need code and email (no confirmCode)
          return z.object({
            code: z.string().length(6, "Passcode must be 6 digits"),
            email: z.string().email("Please enter a valid email address"),
          });
        }
        return emailSchema;
      default:
        return z.object({});
    }
  }, [securityStep, isConfigured]);

  // Process verification token if present
  useEffect(() => {
    if (verificationToken) {
      complete2FAMutation({ token: verificationToken });
    }
  }, [verificationToken]);

  useEffect(() => {
    if (!isDCFirstImageLoading && !isDCSecondImageLoading && !isLoadingFetch) {
      setIsPageLoading(false);
    }
  }, [isDCFirstImageLoading, isDCSecondImageLoading, isLoadingFetch]);

  // Mutation for 2FA Setup
  const { mutate: configure2FAMutation, isPending: isConfiguring } =
    useMutation({
      mutationFn: configure2FA,
      onSuccess: (response) => {
        if (response.success) {
          toast.custom((t: any) => (
            <CustomToast
              tVisibleState={t.visible}
              message={
                isConfigured
                  ? "Email update initiated. Please check your email for verification."
                  : "2FA setup initiated. Please check your email for verification."
              }
              state="SUCCESS"
            />
          ));

          // If we have a redirectUrl for testing, we can use it
          if (response.redirectUrl) {
            // Extract token from redirectUrl and complete setup
            const url = new URL(response.redirectUrl);
            const token = url.searchParams.get("token");
            if (token) {
              complete2FAMutation({ token });
            }
          }
        }
      },
      onError: (error: Error) => {
        toast.custom((t: any) => (
          <CustomToast
            tVisibleState={t.visible}
            message={
              isConfigured
                ? error.message || "Failed to update email"
                : error.message || "Failed to setup 2FA"
            }
            state="ERROR"
          />
        ));
      },
      onSettled: () => {
        setSecurityStep("INITIAL");
      },
    });

  // Mutation for completing 2FA setup
  const { mutate: complete2FAMutation } = useMutation({
    mutationFn: complete2FASetup,
    onSuccess: (response) => {
      if (response.success) {
        toast.custom((t: any) => (
          <CustomToast
            tVisibleState={t.visible}
            message={
              isConfigured
                ? "Email updated successfully!"
                : "2FA configured successfully!"
            }
            state="SUCCESS"
          />
        ));
        // Remove token from URL without refreshing page
        router.replace("/verify-2fa", { scroll: false });
        // Refresh status to show 2FA is enabled
        refetchStatus();
      }
    },
    onError: (error: Error) => {
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message={
            isConfigured
              ? error.message || "Failed to update email"
              : error.message || "Failed to complete 2FA setup"
          }
          state="ERROR"
        />
      ));
      // Remove token from URL without refreshing page
      router.replace("/verify-2fa", { scroll: false });
    },
  });

  // Form handling - use memoized validation schema
  const form = useForm<Configure2FARequest>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      code: "",
      confirmCode: "",
      email: "",
    },
    mode: "onChange",
  });

  // Watch values for conditional logic
  const watchedCode = form.watch("code");
  const watchedConfirmCode = form.watch("confirmCode");

  // Memoize expensive conditions
  const isCodesMatch = useMemo(
    () => watchedCode === watchedConfirmCode && watchedConfirmCode.length === 6,
    [watchedCode, watchedConfirmCode],
  );

  const isCodeValid = useMemo(() => watchedCode.length === 6, [watchedCode]);

  // Handle step navigation - memoized with useCallback
  const handleNextStep = useCallback(() => {
    switch (securityStep) {
      case "INITIAL":
        setSecurityStep("SET PASSCODE");
        break;
      case "SET PASSCODE":
        // Only proceed if code field is valid
        if (isCodeValid) {
          // Skip confirmation step if already configured
          if (isConfigured) {
            setSecurityStep("EMAIL ADDRESS");
          } else {
            setSecurityStep("PASSCODE CONFIRMATION");
          }
        } else {
          form.trigger("code");
        }
        break;
      case "PASSCODE CONFIRMATION":
        // Only proceed if codes match
        if (isCodesMatch) {
          setSecurityStep("EMAIL ADDRESS");
        } else {
          form.setError("confirmCode", {
            type: "manual",
            message: "Passcodes do not match",
          });
          form.trigger("confirmCode");
        }
        break;
      default:
        break;
    }
  }, [securityStep, isCodeValid, isCodesMatch, form, isConfigured]);

  // Handle form submission - memoized with useCallback
  const onSubmit = useCallback(
    (data: Configure2FARequest) => {
      if (securityStep === "EMAIL ADDRESS") {
        if (isConfigured) {
          const requestData = {
            code: data.code,
            email: data.email,
            confirmCode: data.code,
          };
          configure2FAMutation(requestData);
          form.reset(); // Only reset form after submission
        } else {
          configure2FAMutation(data);
          form.reset(); // Only reset form after submission
        }
      } else {
        // For other steps, handle like clicking "Next" button
        handleNextStep();
      }
    },
    [securityStep, configure2FAMutation, isConfigured, handleNextStep],
  );

  // Memoize the title content
  const titleContent = useMemo(() => {
    if (securityStep === "SET PASSCODE") {
      return isConfigured
        ? "Enter your 6 digit passcode for 2FA"
        : "Set your 6 digit passcode for 2FA";
    }
    if (securityStep === "PASSCODE CONFIRMATION") {
      return "Verify your passcode for 2FA";
    }
    if (securityStep === "EMAIL ADDRESS") {
      return "Update Email";
    }
    return "Two-Factor Authentication (2FA)";
  }, [securityStep, isConfigured]);

  // Memoize the description content
  const descriptionContent = useMemo(() => {
    if (securityStep === "INITIAL") {
      return (
        <p className="text-center text-[14px] leading-[18px] text-[#9191A4]">
          Two-Factor authentication (2FA) is an extra layer of security for your
          Nova account. In additional using your username and password to login,
          you'll enter a security code generated by an authenticator app or sent
          to you as a text message.{" "}
          <span className="font-geistSemiBold text-[14px] font-semibold leading-[18px] text-fontColorPrimary">
            Once enabled, you will be logged out of all other devices except
            this one for security.
          </span>
        </p>
      );
    }

    if (securityStep === "EMAIL ADDRESS") {
      return (
        <p className="text-center text-[14px] leading-[18px] text-fontColorSecondary">
          Enter your 2FA email address, we will send you login links to the dex
          everytime.
        </p>
      );
    }

    return (
      <p className="text-center text-[14px] leading-[18px] text-fontColorSecondary">
        This is used to secure your wallet on all your devices.{" "}
        <span className="text-warning">This cannot be recovered.</span>
      </p>
    );
  }, [securityStep, isConfigured]);

  // Memoize button text
  const buttonText = useMemo(() => {
    if (securityStep === "EMAIL ADDRESS") {
      return isConfigured ? "Update Email" : "Send Verification Link";
    }
    return securityStep === "INITIAL"
      ? "Set-up Two-Factor Authenticator"
      : "Next";
  }, [securityStep, isConfigured]);

  // Calculate container class with useMemo
  const containerClass = useMemo(
    () =>
      cn(
        "relative z-20 flex w-full max-w-[398px] flex-col gap-y-8 rounded-[16px] border border-border bg-[#10101E]/80 p-6 backdrop-blur-[20px] sm:max-w-[400px]",
        securityStep == "INITIAL" && "sm:max-w-[504px]",
      ),
    [securityStep],
  );

  // Calculate status class with useMemo
  const statusClass = useMemo(
    () =>
      cn(
        "flex w-fit items-center justify-center rounded-[4px] bg-destructive/[12%] px-2 py-1 font-geistSemiBold text-base text-destructive",
        isConfigured && "bg-success/[12%] text-success",
      ),
    [isConfigured],
  );

  const TopGradientDecoration = useMemo(
    () => (
      <div className="absolute left-1/2 top-0 z-10 aspect-[2216/1052] h-auto w-[280%] max-w-[280%] flex-shrink-0 -translate-x-1/2 md:w-full md:max-w-[80%]">
        <Image
          src="/images/decorations/2FA-top-gradient-decoration.webp"
          alt="2FA Top Gradient Decoration Image"
          fill
          quality={100}
          className="object-contain"
          onLoad={() => setIsDCFirstImageLoading(false)}
          onError={() => setIsDCFirstImageLoading(false)}
        />
      </div>
    ),
    [setIsDCFirstImageLoading],
  );

  const BottomGradientDecoration = useMemo(
    () => (
      <div className="absolute bottom-0 left-1/2 z-10 aspect-[1108/691] h-[400px] w-[270%] flex-shrink-0 -translate-x-1/2 md:aspect-[2352/592] md:w-full lg:h-auto">
        <Image
          src="/images/decorations/2FA-bottom-gradient-decoration.webp"
          alt="2FA Bottom Gradient Decoration Image"
          fill
          quality={100}
          className="rounded-b-lg object-cover lg:object-contain"
          onLoad={() => setIsDCSecondImageLoading(false)}
          onError={() => setIsDCSecondImageLoading(false)}
        />
      </div>
    ),
    [setIsDCSecondImageLoading],
  );

  return (
    <>
      <AnimatePresence>{isPageLoading && <Preloader />}</AnimatePresence>
      <div className="relative flex h-full w-full flex-grow flex-col items-center justify-center rounded-lg border-[#242436] md:border md:bg-[#ffffff]/[0.04]">
        {TopGradientDecoration}

        <AnimatePresence mode="wait">
          {!isPageLoading && (
            <div className={containerClass}>
              {/* Title & Description */}
              <div className="flex w-full flex-col items-center gap-y-2">
                {securityStep == "INITIAL" && (
                  <div className={statusClass}>
                    <span>Status: {isConfigured ? "Enabled" : "Disabled"}</span>
                    <div className="relative ml-1 inline-block h-[17px] w-[18.3px] flex-shrink-0">
                      <Image
                        src={
                          isConfigured
                            ? "/icons/check-circle.svg"
                            : "/icons/issues.png"
                        }
                        alt={
                          isConfigured
                            ? "Check Circle Icon"
                            : "Alert Circle Icon"
                        }
                        fill
                        quality={100}
                        className="object-contain"
                      />
                    </div>
                  </div>
                )}
                <h1
                  className={cn(
                    "text-center font-geistSemiBold text-[40px] leading-[56px] text-fontColorPrimary",
                    securityStep !== "INITIAL" && "text-[32px] leading-[42px]",
                  )}
                >
                  {titleContent}
                </h1>
                {descriptionContent}
              </div>

              {/* Form */}
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {securityStep === "SET PASSCODE" && (
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <InputOTP
                              type="password"
                              maxLength={6}
                              pattern={REGEXP_ONLY_DIGITS}
                              value={field.value}
                              onChange={field.onChange}
                            >
                              {[...Array(6)].map((_, i) => (
                                <InputOTPGroup key={i}>
                                  <InputOTPSlot
                                    className="size-10 md:size-12"
                                    index={i}
                                  />
                                </InputOTPGroup>
                              ))}
                            </InputOTP>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {securityStep === "PASSCODE CONFIRMATION" && (
                    <FormField
                      control={form.control}
                      name="confirmCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <InputOTP
                              type="password"
                              maxLength={6}
                              pattern={REGEXP_ONLY_DIGITS}
                              value={field.value}
                              onChange={field.onChange}
                            >
                              {[...Array(6)].map((_, i) => (
                                <InputOTPGroup key={i}>
                                  <InputOTPSlot
                                    className="size-10 md:size-12"
                                    index={i}
                                  />
                                </InputOTPGroup>
                              ))}
                            </InputOTP>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {securityStep === "EMAIL ADDRESS" && (
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="-mb-3.5">
                          {/* TWO__FA__INPUT */}
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="jhondoe@gmail.com"
                              className="block h-12 w-full text-nowrap border-white/[16%] bg-transparent px-4 py-2 text-sm text-fontColorPrimary focus:outline-none focus:ring-0"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="flex w-full flex-col items-center justify-center gap-y-4">
                    {!(securityStep == "INITIAL" && isConfigured) && (
                      <>
                        {securityStep === "EMAIL ADDRESS" ? (
                          <BaseButton
                            type={"submit"}
                            variant="primary"
                            className="h-[48px] w-full"
                            disabled={isConfiguring}
                            isLoading={isConfiguring}
                          >
                            <span className="inline-block font-geistSemiBold text-base text-[#080811]">
                              {buttonText}
                            </span>
                          </BaseButton>
                        ) : (
                          <BaseButton
                            type={"button"}
                            onClick={handleNextStep}
                            variant="primary"
                            className="h-[48px] w-full"
                            disabled={isConfiguring}
                            isLoading={isConfiguring}
                          >
                            <span className="inline-block font-geistSemiBold text-base text-[#080811]">
                              {buttonText}
                            </span>
                          </BaseButton>
                        )}
                      </>
                    )}
                    {securityStep == "INITIAL" && (
                      <BaseButton
                        type={"button"}
                        // onClick={}
                        variant="gray"
                        className="h-[48px] w-full"
                      >
                        <span className="inline-block font-geistSemiBold text-base text-fontColorPrimary">
                          Learn more
                        </span>
                      </BaseButton>
                    )}
                    {securityStep == "INITIAL" && isConfigured && (
                      <p className="text-sm text-[#9191A4]">
                        Want to update your email?
                        <button
                          onClick={() => setSecurityStep("SET PASSCODE")}
                          className="ml-1 font-geistSemiBold text-primary"
                        >
                          Update email
                        </button>
                      </p>
                    )}
                  </div>
                </form>
              </Form>
            </div>
          )}
        </AnimatePresence>

        {BottomGradientDecoration}
      </div>
    </>
  );
}
