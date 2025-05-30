import { useMutation } from "@tanstack/react-query";
import {
  authenticate,
  AuthenticateSignatureRequest,
  AuthResponse,
} from "@/apis/rest/auth";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Use2FAAuthProps {
  onSuccess?: (res: {
    token: string;
    isNew: boolean;
    isTelegramConnected: boolean;
  }) => void;
  onError?: (error: Error) => void;
  redirectAfterLogin?: string;
}

export function use2FAAuthentication({
  onSuccess,
  onError,
  redirectAfterLogin = "/",
}: Use2FAAuthProps = {}) {
  const router = useRouter();
  const [requires2FA, setRequires2FA] = useState(false);
  const [walletAuthenticated, setWalletAuthenticated] = useState(false);

  // Use mutateAsync to get a promise-based mutation
  const { mutateAsync: authenticateUser, isPending: isAuthenticating } =
    useMutation({
      mutationFn: authenticate,
      // Keep onSuccess/onError for UI state updates
      onSuccess: (response: AuthResponse) => {
        /* console.log("2FA Authentication response:", response) */;

        if (
          response.requires2FA ||
          response.message ===
            "Wallet authentication successful. Please provide 2FA code."
        ) {
          /* console.log("2FA required (from response)") */;
          setRequires2FA(true);
          setWalletAuthenticated(true);
          return;
        }

        if (response.success !== false && response.token) {
          /* console.log("Fully authenticated with token") */;
          setRequires2FA(false);
          setWalletAuthenticated(true);

          if (onSuccess) {
            onSuccess({
              token: response.token,
              isNew: response.isNew || false,
              isTelegramConnected: response.isTelegramConnected || false,
            });
          }

          localStorage.setItem("authToken", response.token);

          if (redirectAfterLogin) {
            router.push(redirectAfterLogin);
          }
        }
      },
      onError: (error: Error) => {
        console.error("2FA Authentication error:", error);

        if (
          error.message ===
          "Wallet authentication successful. Please provide 2FA code."
        ) {
          /* console.log("2FA required (from error)") */;
          setRequires2FA(true);
          setWalletAuthenticated(true);
          return;
        }

        if (onError) {
          onError(error);
        }
      },
    });

  /**
   * Initial authentication with wallet - now returns a promise
   */
  const authenticateWithWallet = async (
    signature: string,
    nonce: string,
    signer: string,
    code: string,
  ) => {
    /* console.log("Attempting wallet authentication") */;
    // Reset states before new authentication attempt
    setRequires2FA(false);
    setWalletAuthenticated(false);

    try {
      // Use mutateAsync which returns a promise
      const result = await authenticateUser({
        signature,
        nonce,
        signer,
        ...(code ? { code } : {}),
      });
      return result;
    } catch (error) {
      // Let the error bubble up
      throw error;
    }
  };

  /**
   * Complete authentication with 2FA code - now returns a promise
   */
  const completeAuthWith2FA = async (
    signature: string,
    nonce: string,
    signer: string,
    code: string,
    twoFactorCode: string,
  ) => {
    /* console.log("Completing 2FA authentication") */;

    try {
      const result = await authenticateUser({
        signature,
        nonce,
        signer,
        ...(code ? { code } : {}),
        two_factor_code: twoFactorCode,
      });
      return result;
    } catch (error) {
      throw error;
    }
  };

  return {
    authenticateWithWallet,
    completeAuthWith2FA,
    requires2FA,
    walletAuthenticated,
    isAuthenticating,
  };
}
