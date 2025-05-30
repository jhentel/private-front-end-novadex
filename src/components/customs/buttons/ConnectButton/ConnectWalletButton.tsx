"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useEffect, useState } from "react";

// ######## Components 🧩 ########
import ConnectDesktop from "./ConnectDesktop";
import ConnectMobile from "./ConnectMobile";

// ######## Utils 🔧 ########
import { isMobileDevice as detectMobileDevice } from "@/utils/phantom-wallet/mobileAuthUtils";

interface ConnectWalletButtonProps {
  onSuccess?: (authResponse: any) => Promise<void>;
  className?: string;
  variant?: "primary" | "gray";
  is2FARequired?: boolean;
}

// ########## CONNECT WALLET BUTTON🤖 ##########
const ConnectWalletButton = ({
  onSuccess,
  className,
  variant = "primary",
}: ConnectWalletButtonProps) => {
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Detect device type on component mount
  useEffect(() => {
    setIsMobileDevice(detectMobileDevice());
  }, []);

  return (
    <>
      {isMobileDevice ? (
        <ConnectMobile
          onSuccess={onSuccess}
          className={className}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      ) : (
        <ConnectDesktop
          onSuccess={onSuccess}
          className={className}
          variant={variant}
        />
      )}
    </>
  );
};

export default ConnectWalletButton;
