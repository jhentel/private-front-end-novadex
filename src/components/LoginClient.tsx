"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useState, useEffect, useRef, use } from "react";
import { useMutation } from "@tanstack/react-query";
import { useUserInfoStore } from "@/stores/user/use-user-info.store";
import { useAPIEndpointBasedOnRegionStore } from "@/stores/setting/use-api-endpoint-based-on-region.store";
import { motion, AnimatePresence } from "framer-motion";
import { useNewlyCreatedFilterStore } from "@/stores/cosmo/use-newly-created-filter.store";
import { useAboutToGraduateFilterStore } from "@/stores/cosmo/use-about-to-graduate-filter.store";
import { useGraduatedFilterStore } from "@/stores/cosmo/use-graduated-filter.store";
import toast from "react-hot-toast";
import cookies from "js-cookie";
import * as Sentry from "@sentry/nextjs";
import axios from "axios";
// ######## APIs 🛜 ########
import {
  authenticate,
  revealKey,
  checkBalance,
  validateAccessCode,
  connectTelegram,
  AuthenticateSignatureRequest,
} from "@/apis/rest/auth";
// ######## Components 🧩 ########
import dynamic from "next/dynamic";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import CustomToast from "@/components/customs/toasts/CustomToast";
import BaseButton from "@/components/customs/buttons/BaseButton";
import Copy from "@/components/customs/Copy";
import Preloader from "@/components/customs/Preloader";
import Separator from "@/components/customs/Separator";
import { Input } from "@/components/ui/input";
import { useDispatchEvent } from "@/hooks/useEventEmitter";
import { EventNames } from "@/types/events";
import { useIsClient } from "@/hooks/use-is-client";
import { formatAmountWithoutLeadingZero } from "@/utils/formatAmount";
import { use2FAAuthentication } from "@/hooks/use2FAAuthentication";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
const ConnectWalletButton = dynamic(
  () =>
    import("@/components/customs/buttons/ConnectButton/ConnectWalletButton"),
);
// ######## Constants ☑️ ########
import {
  defaultTVChartProperties,
  defaultTVChartPropertiesMainSeriesProperties,
} from "@/constants/trading-view.constant";
import { isMobileDevice } from "@/utils/phantom-wallet";
import { usePopupStore } from "@/stores/use-popup-state";
import { usePathname } from "next/navigation";

const CountDownChunk = ({ value, label }: { value: string; label: string }) => (
  <div className="text-center">
    <div className="flex items-center gap-x-1">
      <span className="flex h-[64px] w-[44px] items-center justify-center rounded-[8px] border border-primary/[20%] bg-primary/[12%] px-[15px] py-[11px] text-[32px] font-semibold text-primary">
        {value[0]}
      </span>
      <span className="flex h-[64px] w-[44px] items-center justify-center rounded-[8px] border border-primary/[20%] bg-primary/[12%] px-[15px] py-[11px] text-[32px] font-semibold text-primary">
        {value[1]}
      </span>
    </div>
    <span>{label}</span>
  </div>
);

interface TelegramData {
  id: number;
  username: string;
  token: string;
}

const LoginClient = ({
  telegramData,
}: {
  telegramData?: TelegramData | null;
}) => {
  // Load 🔁
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isDCFirstImageLoading, setIsDCFirstImageLoading] = useState(true);
  const [isDCSecondImageLoading, setIsDCSecondImageLoading] = useState(true);

  // States Configuration ✨
  const [emailNotification, setEmailNotification] = useState(false);
  const [telegramNotification, setTelegramNotification] = useState(false);
  const { setIsNewUser, setHasSeenTutorial, resetAllTutorialStates } =
    useUserInfoStore();

  const initialTime = 2 * 24 * 60 * 60 + 23 * 60 * 60 + 11 * 60;

  const [timeLeft, setTimeLeft] = useState(initialTime);
  // Initialize step from localStorage if available to maintain state across redirects
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6>(() => {
    if (typeof window !== "undefined") {
      // Check for phantom parameters or pending connection first
      if (!isMobileDevice()) {
        return localStorage.getItem("access_code") ? 1 : 0;
        // return 0;
      }
      const url = new URL(window.location.href);
      const phantomData = url.searchParams.get("data");
      const phantomNonce = url.searchParams.get("nonce");
      const isPendingConnection =
        localStorage.getItem("phantomConnectionPending") === "true";

      // If we have phantom data or a pending connection, start at step 1
      if (phantomData || phantomNonce || isPendingConnection) {
        return 1;
      }

      // Otherwise use the saved step
      const savedStep = localStorage.getItem("loginStep");
      return savedStep ? (Number(savedStep) as 0 | 1 | 2 | 3 | 4 | 5 | 6) : 0;
    }
    return 0;
  });
  const [choice, setChoice] = useState<null | "YES" | "NO">(null);
  const [openSaveDialog, setOpenSaveDialog] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [balanceWallet, setBallanceWallet] = useState<number>(0);

  const setBaseNewlyCreatedFilterState = useNewlyCreatedFilterStore(
    (state) => state?.resetNewlyCreatedFilters,
  );
  const setBaseAboutToGraduateFilterState = useAboutToGraduateFilterStore(
    (state) => state?.resetAboutToGraduateFilters,
  );
  const setBaseGraduatedFilterState = useGraduatedFilterStore(
    (state) => state?.resetGraduatedFilters,
  );

  const setBaseCosmoFilterState = () => {
    setBaseNewlyCreatedFilterState("preview");
    setBaseNewlyCreatedFilterState("genuine");
    setBaseAboutToGraduateFilterState("preview");
    setBaseAboutToGraduateFilterState("genuine");
    setBaseGraduatedFilterState("preview");
    setBaseGraduatedFilterState("genuine");
  };
  const setBaseTVState = () => {
    if (!cookies.get("_chart_interval_resolution")) {
      cookies.set("_chart_interval_resolution", "1S");
    }
    if (!localStorage.getItem("chart_currency")) {
      localStorage.setItem("chart_currency", "USD");
      cookies.set("_chart_currency", "USD");
    }
    if (!localStorage.getItem("chart_type")) {
      localStorage.setItem("chart_type", "MCap");
    }
    if (!localStorage.getItem("chart_hide_buy_avg_price_line")) {
      localStorage.setItem("chart_hide_buy_avg_price_line", "false");
    }
    if (!localStorage.getItem("chart_hide_sell_avg_price_line")) {
      localStorage.setItem("chart_hide_sell_avg_price_line", "false");
    }

    if (!localStorage.getItem("tradingview.chartproperties")) {
      localStorage.setItem(
        "tradingview.chartproperties",
        JSON.stringify(defaultTVChartProperties),
      );
    }
    if (
      !localStorage.getItem("tradingview.chartproperties.mainSeriesProperties")
    ) {
      localStorage.setItem(
        "tradingview.chartproperties.mainSeriesProperties",
        JSON.stringify(defaultTVChartPropertiesMainSeriesProperties),
      );
    }
  };
  const resetSnappedPopups = usePopupStore((state) => state.resetAllPopups);

  // Save step to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("loginStep", step.toString());
    }
  }, [step]);

  const handleNoExisitingNovaUserChoice = () => {
    setChoice("NO");
    revealKeyMutation.mutate(undefined, {
      onSuccess: (keyResponse) => {
        setGeneratedWallet({
          address: keyResponse.publicKey!,
          privateKey: keyResponse.privateKey!,
        });
        setStep(5);
      },
    });
  };

  const handleYesExisitingNovaUserChoice = () => {
    setChoice("YES");
    setStep(4);
  };

  const connectTelegramMutation = useMutation({
    mutationFn: connectTelegram,
    onSuccess: () => {
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message="Telegram connected successfully"
          state="SUCCESS"
        />
      ));

      // After successful connection, proceed with revealing key
      revealKeyMutation.mutate(undefined, {
        onSuccess: (keyResponse) => {
          setGeneratedWallet({
            address: keyResponse.publicKey!,
            privateKey: keyResponse.privateKey!,
          });
          setStep(5);
        },
      });
    },
    onError: (error: Error) => {
      Sentry.captureException(error);
      setStep(0);
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
    if (telegramData) {
      connectTelegramMutation.mutate({
        telegramUserId: telegramData.id,
        telegramUsername: telegramData.username,
        telegramToken: telegramData.token,
      });
    }
  }, [telegramData]);

  const handleConnectWithTelegram = () => {
    window.open(
      "https://t.me/TradeonNovaBot?start=a-novadex",
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleSkip = () => {
    revealKeyMutation.mutate(undefined, {
      onSuccess: (keyResponse) => {
        setGeneratedWallet({
          address: keyResponse.publicKey!,
          privateKey: keyResponse.privateKey!,
        });
        setStep(5);
      },
    });
  };

  const saveWalletAndKeyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleSaveWalletAndKey = () => {
    setIsSaved(true);
    setOpenSaveDialog(false);

    toast.custom((t: any) => (
      <CustomToast tVisibleState={t.visible} message="Saved" />
    ));

    saveWalletAndKeyTimeoutRef.current = setTimeout(() => {
      setStep(6);
    }, 1000);
  };

  // Connect Wallet Configuration 👛
  const [generatedWallet, setGeneratedWallet] = useState<{
    address: string;
    privateKey: string;
  } | null>(null);

  const revealKeyMutation = useMutation({
    mutationFn: revealKey,
    retry: 3,
    onError: (error: Error) => {
      console.warn("Reveal key error:", error);
      Sentry.captureException(error);

      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message={error.message}
          state="ERROR"
        />
      ));
    },
  });

  const { mutate: checkBalanceMutation, isPending } = useMutation({
    mutationFn: checkBalance,
    onSuccess: (data) => {
      const key = Object.keys(data)[0];
      setBallanceWallet(data[key]);
    },
    onError: (error) => {
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message={error.message}
          state="ERROR"
        />
      ));
    },
  });

  const redirectsaveWalletAndKeyTimeoutRef = useRef<NodeJS.Timeout | null>(
    null,
  );
  const handleAuthSuccess = (
    authResponse: any,
    walletDetails?: { signature: string; nonce: string; signer: string },
  ) => {
    cookies.set("_nova_session", authResponse.token!, {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: 30,
    });

    cookies.set("isNew", authResponse.isNew);

    // Set localStorage flag to show new features modal after login
    localStorage.setItem("show_new_features_modal", "true");

    if (authResponse.isNew || authResponse.isTelegramConnected) {
      setIsNewUser(true);
      cookies.set("_is_new_user", "true");

      setStep(3);
    } else {
      setIsNewUser(false);
      cookies.remove("_is_new_user");

      // setBaseCosmoFilterState();

      redirectsaveWalletAndKeyTimeoutRef.current = setTimeout(() => {
        setBaseTVState();
        resetSnappedPopups();
        // window.location.href = "/";
      }, 500);
    }
  };
  const pathname = usePathname();

  const [accessCode, setAccessCode] = useState("");
  const [twoFACode, setTwoFACode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [twoFAParams, setTwoFAParams] = useState<{
    signature: string;
    nonce: string;
    signer: string;
    code?: string;
  }>({
    signature: "",
    nonce: "",
    signer: "",
  });

  useEffect(() => {
    const accessCodeFromCookie = cookies.get("_access_code");
    if (accessCodeFromCookie) {
      // const validAccessCode = "frixeth"
      // if (accessCodeFromCookie !== validAccessCode) return

      localStorage.setItem("access_code", accessCodeFromCookie);
      setStep(1);
      cookies.remove("_access_code");
    }
  }, [cookies]);

  // handle access code validation
  const handleValidateAccessCode = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await validateAccessCode(accessCode);

      if (!response.success) {
        setError(response.message || "Invalid Access Code");
        toast.custom((t: any) => (
          <CustomToast
            tVisibleState={t.visible}
            message="Ran out of uses! Try again later 👋"
            state="ERROR"
          />
        ));
        return;
      }

      localStorage.setItem("access_code", accessCode);
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message={"Access Code Granted!"}
          state="SUCCESS"
        />
      ));

      setStep(1);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Network Error. Please try again.";
      Sentry.captureException(error);

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const dispatchEvent = useDispatchEvent();

  // Helper function untuk reset loading state
  const resetLoadingState = () => {
    setLoading(false);
    // Pastikan juga clear localStorage jika diperlukan
    localStorage.removeItem("phantomConnectionPending");
  };

  const {
    authenticateWithWallet,
    completeAuthWith2FA,
    requires2FA,
    walletAuthenticated,
    isAuthenticating,
  } = use2FAAuthentication({
    onSuccess: (res) => {
      /* console.log("Authentication successful with token:", res.token) */;
      resetLoadingState();
      handleAuthSuccess(
        {
          token: res.token,
          isNew: res.isNew,
          isTelegramConnected: res.isTelegramConnected,
        },
        twoFAParams,
      );
    },
    onError: (error) => {
      console.error("Authentication error in LoginClient:", error);

      // Check if error message indicates 2FA is required
      if (
        error.message ===
        "Wallet authentication successful. Please provide 2FA code."
      ) {
        /* console.log("2FA required (from error in LoginClient)") */;
        setStep(2);
        setTwoFACode("");
        resetLoadingState();
        return;
      }

      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message={error.message}
          state="ERROR"
        />
      ));
      resetLoadingState();
    },
  });

  // Tambahkan useEffect untuk menangani perubahan requires2FA
  useEffect(() => {
    /* console.log("2FA state changed:", { requires2FA, walletAuthenticated }) */;
    if (requires2FA && walletAuthenticated) {
      /* console.log("Moving to 2FA step (step 6)") */;
      // Jika memerlukan 2FA dan wallet sudah terautentikasi, arahkan ke step 6
      setStep(2);
      setTwoFACode("");
      resetLoadingState();
    }
  }, [requires2FA, walletAuthenticated]);

  // Update the ConnectWalletButton onSuccess handler
  const handleWalletConnectSuccess = async (connectResponse: {
    signature: string;
    nonce: string;
    signer: string;
  }) => {
    /* console.log("Wallet connect success:", connectResponse) */;
    setLoading(true);

    try {
      const storedCode = localStorage.getItem("access_code") || "";
      const isNewUser = !!storedCode;

      setTwoFAParams({
        signature: connectResponse.signature,
        nonce: connectResponse.nonce,
        signer: connectResponse.signer,
        ...(isNewUser && { code: storedCode }),
      });

      localStorage.removeItem("phantomConnectionPending");

      /* console.log("Calling authenticateWithWallet") */;

      // Now this can catch errors from authenticate()
      await authenticateWithWallet(
        connectResponse.signature,
        connectResponse.nonce,
        connectResponse.signer,
        storedCode,
      );

      /* console.log("Authentication completed successfully") */;
    } catch (error) {
      if ((error as any).message === "Invalid access code") {
        localStorage.removeItem("access_code");
        localStorage.removeItem("phantomConnectionPending");
        localStorage.removeItem("loginStep");
        setStep(0);
      }
      console.error("Authentication failed:", error);
      // This error will propagate to ConnectDesktop's catch block
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handle2FAConnectSuccess = async () => {
    /* console.log("Handling 2FA connect success with params:", twoFAParams) */;
    if (!twoFAParams.signature || !twoFAParams.nonce || !twoFAParams.signer) {
      console.error("Missing authentication parameters for 2FA");
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message="Missing authentication parameters"
          state="ERROR"
        />
      ));
      return;
    }

    setLoading(true);
    setError("");

    /* console.log("Calling completeAuthWith2FA with code:", twoFACode) */;
    // Use the 2FA hook to complete authentication
    completeAuthWith2FA(
      twoFAParams.signature,
      twoFAParams.nonce,
      twoFAParams.signer,
      twoFAParams.code || "",
      twoFACode,
    );
  };

  // Check for Telegram data on component mount
  useEffect(() => {
    if (telegramData) {
      setChoice("YES");
    }
  }, [telegramData]);

  const imageLoadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!isDCFirstImageLoading && !isDCSecondImageLoading) {
      imageLoadingTimeoutRef.current = setTimeout(() => {
        setIsPageLoading(false);
      }, 500);
    }

    return () => {
      if (imageLoadingTimeoutRef.current) {
        clearTimeout(imageLoadingTimeoutRef.current);
        imageLoadingTimeoutRef.current = null;
      }
    };
  }, [isDCFirstImageLoading, isDCSecondImageLoading]);

  useEffect(() => {
    if (step === 5 && !generatedWallet) {
      revealKey()
        .then((response) => {
          setGeneratedWallet({
            address: response.publicKey!,
            privateKey: response.privateKey!,
          });
        })
        .catch((error) => {
          console.warn("Failed to reveal key:", error);
          Sentry.captureException(error);

          toast.custom((t: any) => (
            <CustomToast
              tVisibleState={t.visible}
              message="Failed to reveal key"
              state="ERROR"
            />
          ));
        });
    } else if (
      step > 4 &&
      !generatedWallet?.address &&
      !revealKeyMutation.isSuccess &&
      !revealKeyMutation.isError
    ) {
      setStep(localStorage.getItem("access_code") ? 1 : 0);
      localStorage.removeItem("phantomConnectionPending");
      localStorage.removeItem("loginStep");
    }
  }, [step]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Check for phantom deep link parameters on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const phantomData = url.searchParams.get("data");
      const phantomNonce = url.searchParams.get("nonce");

      // Priority 1: If we have phantom parameters in the URL, ALWAYS set to step 1
      if (phantomData && phantomNonce) {
        setStep(0);
        return;
      }

      // Priority 2: If we have a pending connection, also ALWAYS set to step 1
      const isPendingConnection =
        localStorage.getItem("phantomConnectionPending") === "true";
      if (isPendingConnection) {
        setStep(0);
      }
    }

    return () => {
      if (saveWalletAndKeyTimeoutRef.current) {
        clearTimeout(saveWalletAndKeyTimeoutRef.current);
        saveWalletAndKeyTimeoutRef.current = null;
      }
      if (redirectsaveWalletAndKeyTimeoutRef.current) {
        clearTimeout(redirectsaveWalletAndKeyTimeoutRef.current);
        redirectsaveWalletAndKeyTimeoutRef.current = null;
      }
    };
  }, []);

  const days = Math.floor(timeLeft / (24 * 60 * 60));
  const hours = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((timeLeft % (60 * 60)) / 60);

  const NumberBox = ({ value }: { value: string }) => (
    <div className="flex space-x-1">
      {value?.split("")?.map((char, index) => (
        <span
          key={index}
          className="flex h-12 w-10 items-center justify-center rounded-md bg-gray-900 text-2xl font-bold text-fontColorPrimary"
        >
          {char}
        </span>
      ))}
    </div>
  );

  const isClient = useIsClient();

  const setRegion = useAPIEndpointBasedOnRegionStore(
    (state) => state.setRegion,
  );
  useEffect(() => {
    const EU_COUNTRIES = [
      "AT",
      "BE",
      "BG",
      "HR",
      "CY",
      "CZ",
      "DK",
      "EE",
      "FI",
      "FR",
      "DE",
      "GR",
      "HU",
      "IE",
      "IT",
      "LV",
      "LT",
      "LU",
      "MT",
      "NL",
      "PL",
      "PT",
      "RO",
      "SK",
      "SI",
      "ES",
      "SE",
    ];

    const ASIA_COUNTRIES = [
      "ID",
      "SG",
      "MY",
      "TH",
      "VN",
      "PH",
      "JP",
      "KR",
      "CN",
      "IN",
      "PK",
      "BD",
      "LK",
      "NP",
    ];

    const setRegionFromCountryCode = (countryCode: string) => {
      cookies.set("_country_code", countryCode);

      if (countryCode === "US") {
        /* console.log("Auto Region 🌍 - User is in the US") */;
        cookies.set("_api_region", "US");
        setRegion("US");
      } else if (EU_COUNTRIES.includes(countryCode)) {
        /* console.log("Auto Region 🌍 - User is in the EU") */;
        cookies.set("_api_region", "EU");
        setRegion("EU");
      } else if (ASIA_COUNTRIES.includes(countryCode)) {
        /* console.log("Auto Region 🌍 - User is in Asia | FALL BACK") */;
        cookies.set("_api_region", "US");
        setRegion("US");
      } else {
        /* console.log("Auto Region 🌍 - User is outside US, EU, and Asia") */;
        cookies.set("_api_region", "US");
        setRegion("US");
      }
    };

    const fallbackWithJS = () => {
      const lang = navigator.language || navigator.languages?.[0] || "";
      const guessCountry = lang.split("-")[1] || "US";
      console.warn(
        "Using JS fallback 🌐 - Detected language region:",
        guessCountry,
      );
      setRegionFromCountryCode(guessCountry.toUpperCase());
    };

    const getUserRegion = async () => {
      try {
        const { data } = await axios.get("https://ipapi.co/json/");
        if (data?.country_code) {
          // console.log(
          //   "Auto Region 🌍 (ipapi) - User Country:",
          //   data.country_code,
          // );
          setRegionFromCountryCode(data.country_code);
          return;
        }
        console.error("ipapi returned no country_code");
      } catch (err) {
        console.warn(
          "Geolocation failed. Falling back to JS-based detection.",
          err,
        );
        fallbackWithJS();
      }
    };

    getUserRegion();
  }, []);

  // Tambahkan monitoring untuk perubahan step
  useEffect(() => {
    /* console.log("Step changed to:", step) */;
    // Jika kembali ke step 0 atau 1, reset loading state
    if (step === 0 || step === 1) {
      resetLoadingState();
    }
  }, [step]);

  return (
    <>
      <section className="relative flex h-full min-h-dvh w-full items-center justify-center overflow-hidden p-4 pb-[rem] text-fontColorPrimary xl:min-h-screen">
        <div className="absolute left-1/2 top-0 z-10 aspect-[1108/691] h-auto w-[270%] flex-shrink-0 -translate-x-1/2 sm:w-full sm:max-w-[85%] lg:max-w-[75%]">
          <Image
            src="/images/decorations/auth-top-gradient-decoration.webp"
            alt="Auth Top Gradient Decoration Image"
            fill
            draggable="false"
            unoptimized={true}
            quality={100}
            className="object-contain"
            onLoadingComplete={() => setIsDCFirstImageLoading(false)}
          />
        </div>

        <AnimatePresence mode="wait">
          {isClient ? (
            <>
              {step === 0 && !isPageLoading && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="relative z-20 flex w-full max-w-[98vw] flex-col gap-y-8 rounded-[16px] border border-border bg-[#10101E]/80 p-6 backdrop-blur-[16px] sm:max-w-[400px]"
                >
                  <div className="flex w-full flex-col items-center gap-y-1">
                    <div className="relative aspect-square h-[96px] w-[96px] flex-shrink-0">
                      <Image
                        src="/images/auth-logo.png"
                        alt="Auth Logo"
                        fill
                        quality={100}
                        className="object-contain"
                      />
                    </div>
                    <div className="flex w-full flex-col items-center gap-y-2">
                      {/* <h1 className="text-center font-geistMedium text-[32px] leading-[42px] text-fontColorPrimary">
                    You&apos;re in the Queue
                  </h1>
                  <span className="inline-block text-center text-base leading-[20px] text-fontColorSecondary">
                    Hang tight! Your access will be ready soon.
                  </span> */}

                      <h1 className="text-center font-geistMedium text-[32px] leading-[42px] text-fontColorPrimary">
                        Login to Dashboard
                      </h1>
                      <span className="inline-block text-center text-base leading-[20px] text-fontColorSecondary">
                        To get started, enter your access code or connect your
                        wallet.
                      </span>
                    </div>
                  </div>

                  {/* Countdown Timer */}
                  {/* <div className="flex w-full flex-col items-center gap-y-2 overflow-hidden rounded-[12px] border border-white/[12%]">
                <span className="mt-[-1px] w-full bg-[#22222E] p-2 text-center font-geistMedium text-lg text-fontColorPrimary">
                  Estimated Wait Time
                </span>
                <div className="flex items-center justify-center gap-x-[8px] px-[13px] py-[16px]">
                  <CountDownChunk
                    label="Days"
                    value={String(days).padStart(2, "0")}
                  />
                  <span className="mb-8 text-[28px] text-foreground">:</span>
                  <CountDownChunk
                    label="Hours"
                    value={String(hours).padStart(2, "0")}
                  />
                  <span className="mb-8 text-[28px] text-foreground">:</span>
                  <CountDownChunk
                    label="Mins"
                    value={String(minutes).padStart(2, "0")}
                  />
                </div>
              </div> */}

                  {/* Notifications */}
                  {/* <div className="flex w-full flex-col items-center">
                <span className="text-sm text-white">
                  Get notified when it&apos;s your turn
                </span>
                <div className="mt-4 grid w-full grid-cols-2 gap-x-3">
                  <button className="flex items-center justify-between rounded-[8px] border border-border bg-white/[4%] p-3 text-white">
                    <span className="flex w-fit items-center justify-center gap-x-2">
                      <div className="relative aspect-square size-[20px] flex-shrink">
                        <Image
                          src="/icons/white-mail.svg"
                          alt="White Mail Icon"
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </div>
                      Email
                    </span>

                    <Switch
                      checked={emailNotification}
                      onCheckedChange={setEmailNotification}
                    />
                  </button>
                  <button className="flex items-center justify-between rounded-[8px] border border-border bg-white/[4%] p-3 text-white">
                    <span className="flex w-fit items-center justify-center gap-x-2">
                      <div className="relative aspect-square size-[20px] flex-shrink">
                        <Image
                          src="/icons/white-telegram.svg"
                          alt="Telegram Icon"
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </div>
                      Telegram
                    </span>

                    <Switch
                      checked={telegramNotification}
                      onCheckedChange={setTelegramNotification}
                    />
                  </button>
                </div>
                {emailNotification && (
                  <div className="mt-3 flex w-full items-center justify-center gap-x-3">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      className="h-[48px]"
                    />
                    <BaseButton variant="primary" className="h-[48px] w-[72px]">
                      Submit
                    </BaseButton>
                  </div>
                )}
                {telegramNotification && (
                  <div className="mt-3 flex w-full items-center justify-center">
                    <BaseButton
                      variant="primary"
                      className="h-[32px] w-full"
                      prefixIcon={
                        <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                          <Image
                            src="/icons/black-telegram.png"
                            alt="Black Telegram Icon"
                            fill
                            quality={100}
                            className="object-contain"
                          />
                        </div>
                      }
                    >
                      <span className="inline-block font-geistSemiBold text-base text-[#080811]">
                        Connect with Telegram
                      </span>
                    </BaseButton>
                  </div>
                )}
              </div> */}

                  {/* Enter access code */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleValidateAccessCode();
                    }}
                    className="flex w-full flex-col gap-y-5"
                  >
                    <div className="flex flex-col gap-y-2">
                      <Label className="text-base font-normal text-fontColorPrimary">
                        Enter Access Code
                      </Label>
                      <Input
                        type="text"
                        value={accessCode}
                        onChange={(e) => setAccessCode(e.target.value)}
                        disabled={loading}
                        placeholder="Enter your access code"
                        className="min-h-12 border-[#FCFCFD14]/[8%] bg-[#FFFFFF]/[2%] px-3 py-[14px] text-base"
                      />
                    </div>
                    <BaseButton
                      disabled={loading}
                      type="submit"
                      variant="primary"
                      className="whitespace-nowrap py-[14px]"
                    >
                      {loading ? "Validating..." : "Submit"}
                    </BaseButton>
                  </form>

                  {/* Separator */}
                  <div className="flex w-full items-center justify-center gap-x-3 overflow-hidden">
                    <Separator
                      orientation="horizontal"
                      color="#9191A4"
                      className="w-fit flex-grow"
                    />
                    <span className="flex flex-shrink-0 whitespace-nowrap font-geistRegular text-base text-fontColorPrimary">
                      or are you an existing user?
                    </span>
                    <Separator orientation="horizontal" color="#9191A4" />
                  </div>

                  {/* <BaseButton
                variant="gray"
                className="whitespace-nowrap py-[14px]"
                onClick={() => setStep(1)}
              >
                <div className="relative aspect-square size-6 flex-shrink-0">
                  <Image
                    src="/icons/white-wallet.svg"
                    alt="Walllet Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
                Connect Wallet
              </BaseButton> */}

                  <ConnectWalletButton
                    onSuccess={handleWalletConnectSuccess}
                    variant="gray"
                  />

                  {/* Accordion */}
                  {/* <div className="relative flex w-full flex-col gap-y-3">
                <h1 className="flex w-full items-center justify-center gap-x-3 overflow-hidden">
                  <Separator
                    orientation="horizontal"
                    color="#242436"
                    className="w-fit flex-grow"
                  />
                  <span className="flex flex-shrink-0 whitespace-nowrap font-geistRegular text-[12px] text-foreground">
                    Skip the queue with
                  </span>
                  <Separator orientation="horizontal" color="#242436" />
                </h1>
                <Accordion type="single" collapsible className="space-y-3">
                  <AccordionItem
                    value="access-code"
                    className="overflow-hidden rounded-[8px] border border-border"
                  >
                    <AccordionTrigger className="h-[44px] rounded-none border-b border-transparent px-[12px] [&[data-state=open]]:border-border [&[data-state=open]]:bg-white/[4%]">
                      Enter Access Code
                    </AccordionTrigger>
                    <AccordionContent className="flex w-full items-center justify-center gap-x-3 p-3">
                      <Input type="text" placeholder="Enter your access code" />
                      <BaseButton
                        variant="primary"
                        className="h-[32px] w-[72px]"
                      >
                        Submit
                      </BaseButton>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem
                    value="existing-account"
                    className="overflow-hidden rounded-[8px] border border-border"
                  >
                    <AccordionTrigger className="h-[44px] rounded-none border-b border-transparent px-[12px] [&[data-state=open]]:border-border [&[data-state=open]]:bg-white/[4%]">
                      Existing User Account
                    </AccordionTrigger>
                    <AccordionContent className="grid grid-cols-1 gap-x-3 px-[15px] py-3">
                      <BaseButton
                        onClick={() => setStep(1)}
                        variant="primary"
                        className="h-[32px] whitespace-nowrap"
                      >
                        <div className="relative aspect-square size-4 flex-shrink-0">
                          <Image
                            src="/icons/black-wallet.svg"
                            alt="Walllet Icon"
                            fill
                            quality={100}
                            className="object-contain"
                          />
                        </div>
                        Take me to login
                      </BaseButton>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div> */}
                </motion.div>
              )}

              {/* Step 1 (Connect Wallet) */}
              {step === 1 && !isPageLoading && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="relative z-20 flex w-full max-w-[360px] flex-col gap-y-8 rounded-[16px] border border-border bg-[#10101E]/80 p-6 backdrop-blur-[16px] sm:max-w-[400px]"
                >
                  <div className="flex w-full flex-col items-center gap-y-1">
                    <div className="relative aspect-square h-[96px] w-[96px] flex-shrink-0">
                      <Image
                        src="/images/auth-logo.png"
                        alt="Auth Logo Image"
                        fill
                        quality={100}
                        className="object-contain"
                      />
                    </div>
                    <div className="flex w-full flex-col items-center gap-y-2">
                      <h1 className="text-center font-geistSemiBold text-[32px] leading-[42px] text-fontColorPrimary">
                        Connect your wallet to start trading
                      </h1>
                      <span className="inline-block text-center text-base leading-[20px] text-fontColorSecondary">
                        To get started connect your wallet.
                      </span>
                    </div>
                  </div>

                  <ConnectWalletButton
                    onSuccess={handleWalletConnectSuccess}
                    variant="primary"
                  />
                </motion.div>
              )}

              {/* Step 2 (Exisiting User Confirmation) */}
              {step === 3 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="relative z-20 flex w-full max-w-[360px] flex-col gap-y-8 rounded-[16px] border border-border bg-[#10101E]/80 p-6 backdrop-blur-[16px] sm:max-w-[400px]"
                >
                  <div className="flex w-full flex-col items-center gap-y-2 pt-3">
                    <h2 className="text-center font-geistSemiBold text-[32px] leading-[42px] text-fontColorPrimary">
                      Are You an Existing Nova User?
                    </h2>
                    <span className="inline-block text-center text-base text-fontColorSecondary">
                      Confirm if you are an existing Nova user by choosing Yes
                      or No.
                    </span>
                  </div>

                  <div className="grid w-full grid-cols-2 items-center gap-x-4">
                    <BaseButton
                      onClick={handleNoExisitingNovaUserChoice}
                      variant="gray"
                      className="h-[48px] w-full"
                    >
                      <span className="inline-block font-geistSemiBold text-base text-fontColorPrimary">
                        No
                      </span>
                    </BaseButton>
                    <BaseButton
                      onClick={handleYesExisitingNovaUserChoice}
                      variant="primary"
                      className="h-[48px] w-full"
                    >
                      <span className="inline-block font-geistSemiBold text-base text-[#080811]">
                        Yes
                      </span>
                    </BaseButton>
                  </div>
                </motion.div>
              )}

              {/* Step 3 (Login Telegram) */}
              {step === 4 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="relative z-20 flex w-full max-w-[360px] flex-col gap-y-8 rounded-[16px] border border-border bg-[#10101E]/80 p-6 backdrop-blur-[16px] sm:max-w-[400px]"
                >
                  <div className="flex w-full flex-col items-center gap-y-2 pt-3">
                    <h2 className="text-center font-geistSemiBold text-[32px] leading-[42px] text-fontColorPrimary">
                      Connect to Telegram
                    </h2>
                    <span className="inline-block text-center text-base leading-[20px] text-fontColorSecondary">
                      {telegramData
                        ? `Connected as @${telegramData.username}`
                        : "Your private key and recovery phrase are your only way to access your wallet. Be sure to save them securely."}
                    </span>
                  </div>

                  <div className="flex w-full flex-col items-center gap-y-4">
                    <BaseButton
                      onClick={handleConnectWithTelegram}
                      variant="primary"
                      className="h-[48px] w-full"
                      prefixIcon={
                        <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                          <Image
                            src="/icons/black-telegram.png"
                            alt="Black Telegram Icon"
                            fill
                            quality={100}
                            className="object-contain"
                          />
                        </div>
                      }
                      disabled={!!telegramData}
                    >
                      <span className="inline-block font-geistSemiBold text-base text-[#080811]">
                        {telegramData
                          ? "Connected with Telegram"
                          : "Connect with Telegram"}
                      </span>
                    </BaseButton>
                    <BaseButton
                      onClick={handleSkip}
                      variant="gray"
                      className="h-[48px] w-full"
                    >
                      <span className="inline-block font-geistSemiBold text-base text-fontColorPrimary">
                        {telegramData ? "Continue" : "Skip"}
                      </span>
                    </BaseButton>
                  </div>
                </motion.div>
              )}

              {/* Step 4 (Generate Wallet & Private Key) */}
              {step === 5 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="relative z-20 flex w-full max-w-[360px] flex-col gap-y-8 rounded-[16px] border border-border bg-[#10101E]/80 p-6 backdrop-blur-[16px] sm:max-w-[400px]"
                >
                  <div className="flex w-full flex-col items-center gap-y-1">
                    <div className="flex w-full flex-col items-center gap-y-2">
                      <h1 className="text-center font-geistSemiBold text-[32px] leading-[42px] text-fontColorPrimary">
                        Generate wallet and private key
                      </h1>
                      <span className="inline-block text-center text-base text-fontColorSecondary">
                        To get started, connect your wallet.
                      </span>
                    </div>
                  </div>

                  <div className="flex w-full flex-col items-center gap-y-4">
                    <div className="flex w-full flex-col items-center gap-y-4">
                      <div className="flex h-[56px] w-full items-center justify-between rounded-[14px] border border-white/[12%] bg-transparent py-2 pl-3 pr-4">
                        <div className="flex flex-col justify-center gap-y-0.5 truncate">
                          <span className="inline-block text-xs text-fontColorSecondary">
                            Wallet
                          </span>
                          <span className="line-clamp-1 inline-block flex-grow truncate font-geistSemiBold text-sm text-fontColorPrimary">
                            {generatedWallet?.address}
                          </span>
                        </div>

                        <Copy
                          variant="white"
                          value={generatedWallet?.address || ""}
                          className="flex-shrink-0 md:size-5"
                        />
                      </div>
                      <div className="flex h-[56px] w-full items-center justify-between rounded-[14px] border border-white/[12%] bg-transparent py-2 pl-3 pr-4">
                        <div className="flex flex-col justify-center gap-y-0.5 truncate">
                          <span className="inline-block text-xs text-fontColorSecondary">
                            Private Key
                          </span>
                          <span className="line-clamp-1 inline-block flex-grow truncate font-geistSemiBold text-sm text-fontColorPrimary">
                            {generatedWallet?.privateKey}
                          </span>
                        </div>

                        <Copy
                          variant="white"
                          value={generatedWallet?.privateKey || ""}
                          className="flex-shrink-0 md:size-5"
                        />
                      </div>
                    </div>

                    <Dialog
                      open={step === 5 && openSaveDialog}
                      onOpenChange={setOpenSaveDialog}
                    >
                      <DialogTrigger asChild>
                        <>
                          {isSaved ? (
                            <BaseButton
                              disabled
                              variant="primary"
                              className="h-[48px] w-full animate-pulse bg-primary-hover transition-all duration-1000"
                            >
                              <span className="inline-block font-geistSemiBold text-base text-[#080811]">
                                Redirecting...
                              </span>
                            </BaseButton>
                          ) : (
                            <BaseButton
                              onClick={() => setOpenSaveDialog(true)}
                              variant="primary"
                              className="h-[48px] w-full"
                            >
                              <span className="inline-block font-geistSemiBold text-base text-[#080811]">
                                Save
                              </span>
                            </BaseButton>
                          )}
                        </>
                      </DialogTrigger>
                      <DialogContent
                        overlayClassname="bg-black/60"
                        showCloseButton={false}
                        className="flex w-full max-w-[400px] flex-col gap-y-0 rounded-[16px] border border-[#242436] bg-card shadow-[0_0_20px_0_#000000]"
                      >
                        <div className="flex w-full flex-col gap-y-7 p-6">
                          <div className="flex w-full flex-col items-center gap-y-2 pt-3">
                            <h2 className="text-center font-geistSemiBold text-[32px] leading-[42px] text-fontColorPrimary">
                              Final chance to save private key!
                            </h2>
                            <span className="inline-block text-center text-base leading-[20px] text-fontColorSecondary">
                              Be sure to save your private key securely.
                            </span>
                          </div>

                          <div className="grid w-full grid-cols-2 items-center gap-x-4">
                            <BaseButton
                              onClick={() => setOpenSaveDialog(false)}
                              variant="gray"
                              className="h-[48px] w-full"
                            >
                              <span className="inline-block font-geistSemiBold text-base text-fontColorPrimary">
                                Cancel
                              </span>
                            </BaseButton>
                            <BaseButton
                              onClick={handleSaveWalletAndKey}
                              variant="primary"
                              className="h-[48px] w-full"
                            >
                              <span className="inline-block font-geistSemiBold text-base text-[#080811]">
                                Confirm
                              </span>
                            </BaseButton>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </motion.div>
              )}

              {/* Step 5 (Add Balance) */}
              {step === 6 &&
                (balanceWallet > 0 ? (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="relative z-20 flex w-full max-w-[360px] flex-col gap-y-8 rounded-2xl border border-border bg-[#10101E]/80 p-6 backdrop-blur-[16px] sm:max-w-[400px]"
                  >
                    <div className="flex flex-col items-center gap-y-2">
                      <h1 className="px-4 text-center font-geistSemiBold text-[32px] leading-[42px] text-fontColorPrimary">
                        Excellent! Your Nova Wallet has{" "}
                        <span className="text-fontColorAction">
                          {formatAmountWithoutLeadingZero(balanceWallet)}
                        </span>{" "}
                        SOL
                      </h1>
                    </div>

                    <div className="flex w-full flex-col items-center gap-y-4">
                      <div className="flex w-full flex-col items-center gap-y-4">
                        <div className="flex h-[56px] w-full items-center justify-between rounded-[14px] border border-white/[12%] bg-transparent py-2 pl-3 pr-4">
                          <div className="flex flex-col justify-center gap-y-0.5 truncate">
                            <span className="inline-block text-xs text-fontColorSecondary">
                              Wallet
                            </span>
                            <span className="line-clamp-1 inline-block flex-grow truncate font-geistSemiBold text-sm text-fontColorPrimary">
                              {generatedWallet?.address}
                            </span>
                          </div>

                          <Copy
                            variant="white"
                            value={generatedWallet?.address || ""}
                            className="flex-shrink-0 md:size-5"
                          />
                        </div>
                      </div>
                      <BaseButton
                        variant="primary"
                        className="h-[48px] w-full transition-all duration-1000"
                        onClick={() => {
                          cookies.set("isNew", "false");
                          setBaseTVState();
                          setBaseCosmoFilterState();
                          resetSnappedPopups();
                          window.location.href = "/";
                        }}
                      >
                        <span className="inline-block font-geistSemiBold text-base text-[#080811]">
                          Start Trading
                        </span>
                      </BaseButton>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="relative z-20 flex w-full max-w-[360px] flex-col gap-y-8 rounded-2xl border border-border bg-[#10101E]/80 p-6 backdrop-blur-[16px] sm:max-w-[400px]"
                  >
                    <div className="flex flex-col items-center gap-y-2">
                      <div className="relative aspect-square h-[96px] w-[96px] flex-shrink-0">
                        <Image
                          src="/images/auth-logo.png"
                          alt="Auth Logo Image"
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </div>
                      <h1 className="px-4 text-center font-geistSemiBold text-[32px] leading-[42px] text-fontColorPrimary">
                        Oops! Your Nova wallet has{" "}
                        <span className="text-fontColorAction">
                          {balanceWallet}
                        </span>{" "}
                        SOL
                      </h1>
                      <span className="inline-block text-center text-base text-fontColorSecondary">
                        Deposit SOL to this wallet to start trading.
                      </span>
                    </div>

                    <div className="flex w-full flex-col items-center gap-y-4">
                      <div className="flex w-full flex-col items-center gap-y-4">
                        <div className="flex h-[56px] w-full items-center justify-between rounded-[14px] border border-white/[12%] bg-transparent py-2 pl-3 pr-4">
                          <div className="flex flex-col justify-center gap-y-0.5 truncate">
                            <span className="inline-block text-xs text-fontColorSecondary">
                              Wallet
                            </span>
                            <span className="line-clamp-1 inline-block flex-grow truncate font-geistSemiBold text-sm text-fontColorPrimary">
                              {generatedWallet?.address}
                            </span>
                          </div>

                          <Copy
                            variant="white"
                            value={generatedWallet?.address || ""}
                            className="flex-shrink-0 md:size-5"
                          />
                        </div>
                      </div>
                      <BaseButton
                        variant="primary"
                        className="h-[48px] w-full transition-all duration-1000"
                        onClick={() => {
                          if (generatedWallet) {
                            checkBalanceMutation(generatedWallet.address);
                          }
                        }}
                        disabled={isPending}
                      >
                        <span className="inline-block font-geistSemiBold text-base text-[#080811]">
                          Check Balance
                        </span>
                      </BaseButton>
                      <BaseButton
                        variant="gray"
                        className="h-[48px] w-full bg-[#17171F] transition-all duration-1000"
                        onClick={() => {
                          cookies.set("isNew", "false");
                          setBaseTVState();
                          setBaseCosmoFilterState();
                          resetSnappedPopups();
                          window.location.href = "/";
                        }}
                      >
                        <span className="inline-block font-geistSemiBold text-base text-fontColorPrimary">
                          Skip
                        </span>
                      </BaseButton>
                    </div>
                  </motion.div>
                ))}

              {step === 2 && (
                <motion.div
                  key="step6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="relative z-20 flex w-full max-w-[98vw] flex-col gap-y-8 rounded-[16px] border border-border bg-[#10101E]/80 p-6 backdrop-blur-[16px] sm:max-w-[400px]"
                >
                  <div className="flex w-full flex-col items-center gap-y-1">
                    <div className="relative aspect-square h-[96px] w-[96px] flex-shrink-0">
                      <Image
                        src="/images/auth-logo.png"
                        alt="Auth Logo"
                        fill
                        quality={100}
                        className="object-contain"
                      />
                    </div>
                    <div className="flex w-full flex-col items-center gap-y-2">
                      <h1 className="text-center font-geistMedium text-[32px] leading-[42px] text-fontColorPrimary">
                        2FA Required
                      </h1>
                      <span className="inline-block text-center text-base leading-[20px] text-fontColorSecondary">
                        Enter the 2FA code from your authenticator app to
                        continue.
                      </span>
                    </div>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handle2FAConnectSuccess();
                    }}
                    className="flex w-full flex-col gap-y-5"
                  >
                    <div className="flex flex-col gap-y-2">
                      <Label className="text-base font-normal text-fontColorPrimary">
                        Enter 2FA Code
                      </Label>
                      <InputOTP
                        type="password"
                        maxLength={6}
                        pattern={REGEXP_ONLY_DIGITS}
                        value={twoFACode}
                        onChange={(value) => setTwoFACode(value)}
                        disabled={loading || isAuthenticating}
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
                    </div>
                    <BaseButton
                      disabled={loading || isAuthenticating}
                      isLoading={loading || isAuthenticating}
                      type="submit"
                      variant="primary"
                      className="whitespace-nowrap py-[14px]"
                    >
                      {loading || isAuthenticating ? "Processing..." : "Submit"}
                    </BaseButton>
                  </form>
                </motion.div>
              )}
            </>
          ) : null}
        </AnimatePresence>

        <div className="absolute bottom-0 left-1/2 z-10 aspect-[1440/544] h-[400px] w-full flex-shrink-0 -translate-x-1/2 lg:h-auto">
          <Image
            src="/images/decorations/auth-bottom-gradient-decoration.webp"
            alt="Auth Bottom Gradient Decoration Image"
            fill
            draggable="false"
            quality={100}
            className="object-cover lg:object-contain"
            onLoadingComplete={() => setIsDCSecondImageLoading(false)}
          />
        </div>
      </section>

      {/* <AnimatePresence>
        {(isPageLoading || connectTelegramMutation.isPending) && <Preloader />}
      </AnimatePresence> */}
    </>
  );
};

export default LoginClient;
