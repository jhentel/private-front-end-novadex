"use client";

import { usePnlSettings } from "@/stores/use-pnl-settings";
import { useUserWalletStore } from "@/stores/wallet/use-user-wallet.store";
import * as Sentry from "@sentry/nextjs";
import cookies from "js-cookie";
import { useEffect, useRef } from "react";

export default function SentryProvider({ children }: { children: React.ReactNode }) {
  const activeWallet = useUserWalletStore((state) => state.activeWallet);
  const userName = usePnlSettings((state) => state.userName);
  const hasSetSentry = useRef(false);

  useEffect(() => {
    const sessionId = cookies.get("_nova_session");
    if (!sessionId || !activeWallet?.address || hasSetSentry.current) return;

    // console.log("🧠 Sentry userInfo", {
    //   id: sessionId,
    //   userName,
    //   activeWallet: activeWallet.address,
    // });

    Sentry.setContext("User Info", {
      id: sessionId,
      userName,
      walletAddress: activeWallet.address,
      walletName: activeWallet.name,
    });

    hasSetSentry.current = true;

    return () => {
      hasSetSentry.current = false;
    };
  }, [activeWallet?.address, userName]);

  return <>{children}</>;
}
