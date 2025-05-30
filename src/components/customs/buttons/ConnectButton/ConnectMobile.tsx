"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useEffect, useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import bs58 from "bs58";
import nacl from "tweetnacl";

// ######## Components 🧩 ########
import Image from "next/image";
import BaseButton from "@/components/customs/buttons/BaseButton";
import CustomToast from "@/components/customs/toasts/CustomToast";
import { cn } from "@/libraries/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

// ######## APIs 🛜 ########
import { generateNonce } from "@/apis/rest/auth";

// ######## Utils 🔧 ########
import {
  buildUrl,
  decryptPayload,
  encryptPayload,
  getOrCreateKeyPair,
} from "@/utils/phantom-wallet";
import { LoaderCircle } from "lucide-react";

interface ConnectMobileProps {
  onSuccess?: (authResponse: any) => Promise<void>;
  className?: string;
  isLoading?: boolean;
  setIsLoading: (loading: boolean) => void;
}

const ConnectMobile = ({
  onSuccess,
  className,
  isLoading = false,
  setIsLoading,
}: ConnectMobileProps) => {
  const [isSigned, setIsSigned] = useState(false);
  const [phantomMobilePublicKey, setPhantomMobilePublicKey] = useState<
    string | null
  >(null);
  const [sharedSecret, setSharedSecret] = useState<Uint8Array | undefined>();
  const [session, setSession] = useState<string | undefined>();

  // Add state for the Sheet open status
  const [showConfirmationSheet, setShowConfirmationSheet] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("idle"); // "idle", "connected", "signing", "success"

  // Use the persistence util for keypair
  const [dappKeyPair] = useState(() => {
    // Only run in the browser
    if (typeof window !== "undefined") {
      try {
        return getOrCreateKeyPair();
      } catch (e) {
        console.warn("Could not generate keypair", e);
        return null;
      }
    }
    return null;
  });

  const handleSheetOpenChange = (open: boolean) => {
    setShowConfirmationSheet(open);
  };

  const generateNonceMutation = useMutation({
    mutationFn: generateNonce,
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

  // Add this helper function near the top of the component
  const clearLocalStorageExceptEssentials = () => {
    const loginStep = localStorage.getItem("loginStep");
    const phantomKeyPair = localStorage.getItem("phantom_dapp_keypair");

    localStorage.clear();

    if (loginStep) {
      localStorage.setItem("loginStep", loginStep);
    }

    if (phantomKeyPair) {
      localStorage.setItem("phantom_dapp_keypair", phantomKeyPair);
    }
  };

  const resetConnectionState = () => {
    setIsLoading(false);
    setConnectionStatus("idle");
    setPhantomMobilePublicKey(null);
    setSharedSecret(undefined);
    setSession(undefined);
    setIsSigned(false);
    setShowConfirmationSheet(false);
    localStorage.removeItem("phantomConnectionPending");
    localStorage.removeItem("phantom_signing_pending");
    localStorage.removeItem("phantom_public_key");
    localStorage.removeItem("phantom_shared_secret");
  };

  // Process phantom deep link responses - called on component mount and URL changes
  const processPhantomResponse = useCallback(async () => {
    if (typeof window === "undefined" || !dappKeyPair) return;

    try {
      const url = new URL(window.location.href);
      const phantomData = url.searchParams.get("data");
      const phantomNonce = url.searchParams.get("nonce");
      const errorCode = url.searchParams.get("errorCode");
      const errorMessage = url.searchParams.get("errorMessage");

      // Handle user rejection
      if (errorCode || errorMessage) {
        resetConnectionState();
        console.warn(errorCode, errorMessage);
        clearLocalStorageExceptEssentials();
        setPhantomMobilePublicKey(null);
        setSharedSecret(undefined);
        setSession(undefined);
        setIsSigned(false);
        setIsLoading(false);
        setShowConfirmationSheet(false);

        toast.custom((t: any) => (
          <CustomToast
            tVisibleState={t.visible}
            message={errorMessage || "Operation cancelled by user"}
            state="ERROR"
          />
        ));

        // Clean URL
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete("errorCode");
        cleanUrl.searchParams.delete("errorMessage");
        window.history.replaceState({}, document.title, cleanUrl.toString());
        return;
      }

      if (!phantomData || !phantomNonce) return;

      setIsLoading(true);

      // Remove phantom connection parameters from URL
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete("data");
      cleanUrl.searchParams.delete("nonce");
      cleanUrl.searchParams.delete("phantom_encryption_public_key");
      window.history.replaceState({}, document.title, cleanUrl.toString());

      // This is a response from a connect request
      const phantomEncryptionPubkey = url.searchParams.get(
        "phantom_encryption_public_key",
      );

      if (phantomEncryptionPubkey) {
        // We're handling a connect response
        try {
          const sharedSecretDapp = nacl.box.before(
            bs58.decode(phantomEncryptionPubkey),
            dappKeyPair.secretKey,
          );

          const connectData = decryptPayload(
            phantomData,
            phantomNonce,
            sharedSecretDapp,
          );

          setSharedSecret(sharedSecretDapp);
          setSession(connectData.session);
          setPhantomMobilePublicKey(connectData.public_key);

          // Store in localStorage for persistence
          localStorage.setItem("phantom_session", connectData.session);
          localStorage.setItem("phantom_public_key", connectData.public_key);
          localStorage.setItem(
            "phantom_shared_secret",
            bs58.encode(sharedSecretDapp),
          );

          // Proceed with authentication
          if (connectData.public_key) {
            setConnectionStatus("connected");
            setIsLoading(false);
            setShowConfirmationSheet(true);
          }
        } catch (decryptError) {
          console.warn(
            "Failed to decrypt Phantom connect response:",
            decryptError,
          );
          toast.custom((t: any) => (
            <CustomToast
              tVisibleState={t.visible}
              message="Failed to decrypt Phantom connect data"
              state="ERROR"
            />
          ));
          setIsLoading(false);
        }
      } else {
        const storedSession = localStorage.getItem("phantom_session");
        const storedSecretStr = localStorage.getItem("phantom_shared_secret");
        const storedPublicKey = localStorage.getItem("phantom_public_key");

        let currentSharedSecret = sharedSecret;
        if (!currentSharedSecret && storedSecretStr) {
          try {
            const secretBytes = bs58.decode(storedSecretStr);
            currentSharedSecret = secretBytes;
            setSharedSecret(currentSharedSecret);
          } catch (e) {
            console.warn("Failed to restore shared secret", e);
          }
        }

        if (currentSharedSecret) {
          try {
            // We're handling another response type (sign, transaction, etc.)
            const responseData = decryptPayload(
              phantomData,
              phantomNonce,
              currentSharedSecret,
            );

            if (responseData.signature) {
              // Handle signature response
              handleSignatureResponse(
                responseData,
                storedPublicKey || undefined,
              );

              // Close the confirmation sheet after successful signature
              setShowConfirmationSheet(false);
            }
          } catch (decryptError) {
            console.warn("Failed to decrypt Phantom response:", decryptError);
            toast.custom((t: any) => (
              <CustomToast
                tVisibleState={t.visible}
                message="Failed to decrypt Phantom response"
                state="ERROR"
              />
            ));
            setIsLoading(false);
          }
        }
      }
    } catch (error) {
      console.warn("Failed to process Phantom deep link response:", error);

      resetConnectionState();

      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message="Failed to connect with Phantom"
          state="ERROR"
        />
      ));
      localStorage.removeItem("phantomConnectionPending");
      setIsLoading(false);
      setShowConfirmationSheet(false);
    }
  }, [dappKeyPair, sharedSecret, setIsLoading]);

  // Initialize on component mount
  useEffect(() => {
    // Restore session if it exists
    const storedSession = localStorage.getItem("phantom_session");
    const storedPublicKey = localStorage.getItem("phantom_public_key");
    const storedSecretStr = localStorage.getItem("phantom_shared_secret");

    if (storedSession) setSession(storedSession);
    if (storedPublicKey) setPhantomMobilePublicKey(storedPublicKey);

    if (storedSecretStr) {
      try {
        const secretBytes = bs58.decode(storedSecretStr);
        setSharedSecret(secretBytes);
      } catch (e) {
        console.warn("Failed to restore shared secret", e);
      }
    }

    // Process any phantom deep link parameters
    processPhantomResponse();

    // Check if we're in a pending connection state
    const isPendingConnection =
      localStorage.getItem("phantomConnectionPending") === "true";
    if (isPendingConnection) {
      // Check if we have URL parameters to process
      const url = new URL(window.location.href);
      const phantomData = url.searchParams.get("data");
      const phantomNonce = url.searchParams.get("nonce");

      if (!phantomData && !phantomNonce && !storedSession) {
        handleConnect();
      }
    }
  }, []);

  // Handle signature response from Phantom mobile
  const handleSignatureResponse = (responseData: any, pubKey?: string) => {
    try {
      const walletPubKey = pubKey || phantomMobilePublicKey;

      if (!responseData.signature || !walletPubKey) {
        console.warn("Missing signature or public key in response");
        throw new Error("Missing signature or public key");
      }

      // Get the nonce for authentication - CRITICAL for mobile flow
      const storedNonce = localStorage.getItem("phantom_signing_nonce");

      if (!storedNonce && !responseData.nonce) {
        throw new Error("Authentication nonce not found");
      }

      // Construct auth response with other data as needed for auth
      const authResponse = {
        signature: responseData.signature,
        nonce: storedNonce || responseData.nonce || "",
        signer: walletPubKey,
      };

      setIsSigned(true);
      setConnectionStatus("success");

      if (onSuccess) {
        onSuccess(authResponse)
          .then((res) => {
            /* console.log({ res }) */;

            toast.custom((t: any) => (
              <CustomToast
                tVisibleState={t.visible}
                message={"Login succeed!"}
                state="SUCCESS"
              />
            ));
          })
          .catch((err) => {
            /* console.log({ err }) */;
            resetConnectionState();
          });
      } else {
        console.warn("No onSuccess handler provided");
      }

      // Clear the pending states
      localStorage.removeItem("phantomConnectionPending");
      localStorage.removeItem("phantom_signing_pending");
      localStorage.removeItem("phantom_signing_nonce");
    } catch (error) {
      console.warn("Signature response error:", error);
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message={
            error instanceof Error
              ? error.message
              : "Failed to process signature"
          }
          state="ERROR"
        />
      ));

      setIsSigned(false);
      setConnectionStatus("connected");
    } finally {
      setIsLoading(false);
    }
  };

  // Request signature from Phantom mobile with retry logic
  const requestPhantomSignature = async (
    walletPublicKey: string,
    retryCount = 0,
  ) => {
    try {
      setConnectionStatus("signing");
      setIsLoading(true);

      // Make sure we're still on step 1 for signatures
      localStorage.setItem("loginStep", "0");

      // Add a small delay before generating nonce to ensure backend is ready
      if (retryCount === 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        // Longer delay for retries
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      // Generate nonce for authentication
      let nonce: string;
      try {
        nonce = await generateNonceMutation.mutateAsync();
      } catch (nonceError) {
        console.warn("Nonce generation error:", nonceError);

        // Retry logic for nonce generation
        if (retryCount < 2) {
          toast.custom((t: any) => (
            <CustomToast
              tVisibleState={t.visible}
              message="Retrying connection..."
              state="WARNING"
            />
          ));
          // Recursive retry with increased counter
          return requestPhantomSignature(walletPublicKey, retryCount + 1);
        }

        throw new Error(
          "Failed to generate authentication nonce after multiple attempts",
        );
      }

      if (!session && !localStorage.getItem("phantom_session")) {
        throw new Error("No active session found");
      }

      // Get shared secret from state or localStorage
      let currentSharedSecret = sharedSecret;
      if (!currentSharedSecret) {
        const storedSecret = localStorage.getItem("phantom_shared_secret");
        if (storedSecret) {
          try {
            currentSharedSecret = bs58.decode(storedSecret);
            setSharedSecret(currentSharedSecret);
          } catch (e) {
            console.warn("Failed to decode stored shared secret", e);
            throw new Error("Failed to restore shared secret");
          }
        } else {
          throw new Error("Missing shared secret");
        }
      }

      // Create the message to sign
      const message = `Welcome to TradeOnNova. Please sign this message to authenticate your wallet: ${nonce}`;
      const encodedMessage = new TextEncoder().encode(message);
      const messageBase58 = bs58.encode(encodedMessage);

      // Prepare the payload for the signMessage request
      const payload = {
        session: session || localStorage.getItem("phantom_session"),
        message: messageBase58,
      };

      const [nonceValue, encryptedPayload] = encryptPayload(
        payload,
        currentSharedSecret,
      );

      // Create a redirect URL that'll bring users back to this exact page
      const currentURL = window.location.href;
      const redirectLink = currentURL.split("?")[0]; // Remove any existing query params

      // Store that we're waiting for a signature
      localStorage.setItem("phantom_signing_pending", "true");
      localStorage.setItem("phantom_signing_nonce", nonce);

      // Build URL parameters
      const params = new URLSearchParams({
        dapp_encryption_public_key: bs58.encode(dappKeyPair?.publicKey as any),
        nonce: bs58.encode(nonceValue),
        redirect_link: redirectLink,
        payload: bs58.encode(encryptedPayload),
      });

      const url = buildUrl("signMessage", params);

      // Redirect to Phantom app
      window.location.href = url;
    } catch (error) {
      console.warn("Sign request error:", error);

      setConnectionStatus("connected");

      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message={
            error instanceof Error
              ? error.message
              : "Failed to request signature"
          }
          state="ERROR"
        />
      ));

      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      // Explicitly set login step to 1 first thing
      localStorage.setItem("loginStep", "0");

      // Store some state to indicate we're in the connecting process
      localStorage.setItem("phantomConnectionPending", "true");

      // Check if we already have stored credentials
      const storedPublicKey = localStorage.getItem("phantom_public_key");

      if (storedPublicKey) {
        // In this case, we want to use the signature flow if we have all required data
        const sharedSecretStr = localStorage.getItem("phantom_shared_secret");
        const session = localStorage.getItem("phantom_session");

        if (sharedSecretStr && session) {
          setPhantomMobilePublicKey(storedPublicKey);
          setConnectionStatus("connected");
          setShowConfirmationSheet(true);
          setIsLoading(false);
          return;
        }
      }

      // Make sure we have a key pair for encryption
      if (!dappKeyPair) {
        throw new Error("Failed to generate key pair for secure communication");
      }

      const PROD_URL =
        process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const isProd = process.env.NODE_ENV === "production";
      const currentPath = window.location.pathname;

      const appUrl = isProd ? PROD_URL : window.location.origin;
      const redirectLink = `${PROD_URL}${currentPath}`;
      // Build proper Phantom deep link using the method from their blog
      const params = new URLSearchParams({
        dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
        cluster: "mainnet-beta",
        app_url: appUrl,
        redirect_link: redirectLink,
      });

      const url = buildUrl("connect", params);

      // Redirect to Phantom app
      window.location.href = url;
      return;
    } catch (error) {
      console.warn("Mobile connection error:", error);
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message={error instanceof Error ? error.message : "Failed to connect"}
          state="ERROR"
        />
      ));

      setIsLoading(false);
      localStorage.removeItem("phantomConnectionPending");
    }
  };

  const handleDisconnect = async () => {
    try {
      if (!session || !sharedSecret || !dappKeyPair) return;
      const payload = { session };
      const [nonce, encryptedPayload] = encryptPayload(payload, sharedSecret);

      // Get the current URL to redirect back to
      const redirectLink = window.location.href.split("?")[0];

      const params = new URLSearchParams({
        dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
        nonce: bs58.encode(nonce),
        redirect_link: redirectLink,
        payload: bs58.encode(encryptedPayload),
      });

      const url = buildUrl("disconnect", params);

      // Clear states
      setSession(undefined);
      setSharedSecret(undefined);
      setIsSigned(false);
      setPhantomMobilePublicKey(null);
      setShowConfirmationSheet(false);
      setConnectionStatus("idle");

      // Clear localStorage items
      localStorage.removeItem("phantom_session");
      localStorage.removeItem("phantom_public_key");
      localStorage.removeItem("phantom_shared_secret");
      localStorage.removeItem("phantomConnectionPending");
      localStorage.removeItem("phantom_signing_pending");
      localStorage.removeItem("phantom_signing_nonce");
      localStorage.removeItem("phantom_dapp_keypair"); // Add this line for complete cleanup

      // Redirect to Phantom app for disconnect
      window.location.href = url;
    } catch (error) {
      console.warn("Disconnect error:", error);
    }
  };

  const connected = !!phantomMobilePublicKey;

  // Create abbreviated wallet address for display
  const abbreviatedAddress = phantomMobilePublicKey
    ? `${phantomMobilePublicKey.substring(0, 4)}...${phantomMobilePublicKey.substring(phantomMobilePublicKey.length - 4)}`
    : "";

  // Determine button text based on states
  const getButtonText = () => {
    if (!dappKeyPair) return "Initializing Wallet";
    if (!connected) return "Connect Wallet";
    if (isLoading) return "Connecting Wallet";
    if (connected && connectionStatus === "connected" && !showConfirmationSheet)
      return "Sign Message to Login";

    if (connected && connectionStatus === "idle" && !showConfirmationSheet)
      return "Sign Message to Login";
    return "Redirecting...";
  };

  // Handle button click based on current state
  const handleButtonClick = () => {
    // console.log({
    //   connected,
    //   connectionStatus,
    //   showConfirmationSheet,
    //   phantomMobilePublicKey,
    // });

    if (!connected) {
      handleConnect();
    } else if (
      connected &&
      connectionStatus === "connected" &&
      !showConfirmationSheet
    ) {
      setShowConfirmationSheet(true);
    } else if (
      connected &&
      connectionStatus === "idle" &&
      !showConfirmationSheet
    ) {
      setShowConfirmationSheet(true);
    }
  };

  return (
    <>
      <BaseButton
        variant="gray"
        onClick={handleButtonClick}
        className={cn(className, "h-[48px]")}
        // disabled={
        //   isLoading ||
        //   (connected && connectionStatus === "signing") ||
        //   (connected && showConfirmationSheet)
        // }
        prefixIcon={
          isLoading || !dappKeyPair ? (
            <LoaderCircle
              className="size-6 flex-shrink-0 animate-spin"
              color="#DF74FF"
            />
          ) : (
            <div className="relative aspect-square h-6 w-6 flex-shrink-0">
              <Image
                src="/icons/white-wallet.svg"
                alt="Wallet Icon"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
          )
        }
      >
        <span className="inline-block font-geistSemiBold text-base">
          {getButtonText()}
        </span>
      </BaseButton>

      {/* Wallet Connection Confirmation Sheet */}
      <Sheet open={showConfirmationSheet} onOpenChange={handleSheetOpenChange}>
        <SheetContent
          side="bottom"
          className="flex flex-col justify-between border-border bg-[#10101E] text-fontColorPrimary"
        >
          <SheetHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="relative aspect-square h-16 w-16 flex-shrink-0">
                <Image
                  src="/images/auth-logo.png"
                  alt="Auth Logo"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </div>
            </div>
            <SheetTitle className="font-geistSemiBold text-2xl text-fontColorPrimary">
              Wallet Connected
            </SheetTitle>
            <SheetDescription className="mt-2 text-base text-fontColorSecondary">
              Your Phantom wallet has been successfully connected. Please sign
              the message to complete your login.
            </SheetDescription>
          </SheetHeader>

          <div className="my-6 flex flex-col gap-6">
            {/* Wallet Information */}
            <div className="flex flex-col gap-2">
              <div className="flex h-[56px] items-center justify-between rounded-[14px] border border-white/[12%] bg-transparent py-2 pl-3 pr-4">
                <div className="flex items-center gap-3">
                  <div className="relative aspect-square h-8 w-8 flex-shrink-0 rounded-[6px]">
                    <Image
                      src="/icons/phantom-wallet.svg"
                      alt="Phantom Icon"
                      fill
                      quality={100}
                      className="rounded-[6px] object-contain"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-fontColorSecondary">
                      Phantom Wallet
                    </span>
                    <span className="font-geistSemiBold text-fontColorPrimary">
                      {abbreviatedAddress}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-center rounded-full bg-[#1B1B2D] p-1">
                  <div className="relative aspect-square h-5 w-5 flex-shrink-0">
                    <Image
                      src="/icons/check-circle.svg"
                      alt="Connected"
                      fill
                      quality={100}
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-3 rounded-lg bg-[#1B1B2D] p-4">
              <span className="text-sm text-fontColorSecondary">
                {connectionStatus === "signing"
                  ? "Waiting for signature approval in Phantom app..."
                  : "Click the button below to sign the authentication message with your wallet."}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <BaseButton
              variant="primary"
              onClick={() => requestPhantomSignature(phantomMobilePublicKey!)}
              className="h-[48px] w-full"
              disabled={isLoading || connectionStatus === "signing"}
            >
              <span className="inline-block font-geistSemiBold text-base text-[#080811]">
                {isLoading || connectionStatus === "signing"
                  ? "Requesting Signature..."
                  : "Sign Message to Login"}
              </span>
            </BaseButton>

            <BaseButton
              variant="gray"
              onClick={() => {
                setShowConfirmationSheet(false);
                handleDisconnect();
              }}
              className="h-[48px] w-full"
              disabled={isLoading || connectionStatus === "signing"}
            >
              <span className="inline-block font-geistSemiBold text-base text-fontColorPrimary">
                Cancel
              </span>
            </BaseButton>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ConnectMobile;
