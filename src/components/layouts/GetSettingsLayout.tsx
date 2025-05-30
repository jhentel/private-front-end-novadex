"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useBuySniperSettingsStore } from "@/stores/setting/use-buy-sniper-settings.store";
import { useCopyTradeSettingsStore } from "@/stores/setting/use-copy-trade-settings.store";
import { useLimitOrderSettingsStore } from "@/stores/setting/use-limit-order-settings.store";
import { useQuickBuySettingsStore } from "@/stores/setting/use-quick-buy-settings.store";
import { useQuickSellSettingsStore } from "@/stores/setting/use-quick-sell-settings.store";
import { useSellSniperSettingsStore } from "@/stores/setting/use-sell-sniper-settings.store";
import { useQuery } from "@tanstack/react-query";
// ######## APIs 🛜 ########
import { getSettings } from "@/apis/rest/settings/settings";
import { getWallets } from "@/apis/rest/wallet-manager";
import { useUserWalletStore } from "@/stores/wallet/use-user-wallet.store";
import { useQuickAmountStore } from "@/stores/dex-setting/use-quick-amount.store";
import { useWalletTrackerStore } from "@/stores/footer/use-wallet-tracker";
import { useRouter } from "nextjs-toploader/app";
import cookies from "js-cookie";
import { useWindowSize } from "@/hooks/use-window-size";

const GetSettingsLayout = ({ children }: { children?: React.ReactNode }) => {
  const pathname = usePathname();

  // Settings
  const setQuickBuyPresets = useQuickBuySettingsStore(
    (state) => state.setPresets,
  );
  const setQuickSellPresets = useQuickSellSettingsStore(
    (state) => state.setPresets,
  );
  const setBuySniperPresets = useBuySniperSettingsStore(
    (state) => state.setPresets,
  );
  const setSellSniperPresets = useSellSniperSettingsStore(
    (state) => state.setPresets,
  );
  const setCopyTradePresets = useCopyTradeSettingsStore(
    (state) => state.setPresets,
  );
  const setLimitOrderPresets = useLimitOrderSettingsStore(
    (state) => state.setPresets,
  );

  // Wallets
  const {
    selectedMultipleActiveWallet,
    selectedMultipleActiveWalletBuySell,
    selectedMultipleActiveWalletCosmo,
    selectedMultipleActiveWalletHoldings,
    selectedMultipleActiveWalletSniper,
    selectedMultipleActiveWalletTrending,
    selectedMultipleActiveWalletToken,
    balance,
    setActiveWallet,
    setIsLoading,
    setSelectedMultipleActiveWallet,
    setSelectedMultipleActiveWalletBuySell,
    setSelectedMultipleActiveWalletCosmo,
    setSelectedMultipleActiveWalletHoldings,
    setSelectedMultipleActiveWalletSniper,
    setSelectedMultipleActiveWalletTrending,
    setSelectedMultipleActiveWalletToken,
    setWalletFullList,
  } = useUserWalletStore();
  const { trackerWalletsQuick, setTrackerWalletsQuick } =
    useWalletTrackerStore();
  const { setCosmoWallets, cosmoWallets, setCosmoQuickBuyAmount } =
    useQuickAmountStore();

  useWindowSize();

  // Get settings
  useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await getSettings();

      setQuickBuyPresets(res?.quickBuySettings);
      setQuickSellPresets(res?.quickSellSettings);
      setBuySniperPresets(res?.buySniperSettings);
      setSellSniperPresets(res?.sellSniperSettings);
      setCopyTradePresets(res?.copyTradeSettings);
      setLimitOrderPresets(res?.limitOrderSettings);

      setCosmoQuickBuyAmount(
        res?.quickBuySettings?.cosmoQuickBuyAmount || 0.0001,
      );

      // console.log("QBA ✨", {
      //   cosmo: res?.quickBuySettings?.cosmoQuickBuyAmount,
      //   trending: res?.quickBuySettings?.trendingQuickBuyAmount,
      //   twitter: res?.quickBuySettings?.twitterQuickBuyAmount,
      //   footer: res?.quickBuySettings?.footerQuickBuyAmount,
      // });

      return res;
    },
    enabled: pathname !== "/login",
  });

  // Get wallets
  const { data: wallets, isLoading } = useQuery({
    queryKey: ["wallets"],
    queryFn: async () => {
      const res = await getWallets();

      return res;
    },
    enabled: pathname !== "/login",
  });

  useEffect(() => {
    if (wallets) {
      const res = wallets.map((wallet) => ({
        ...wallet,
        balance: String(balance[wallet.address] || "0"),
      }));
      setWalletFullList(res);

      const selectedWallet = res.find((w) => w.selected) || res[0];

      setActiveWallet(selectedWallet);
      // ########## Global🌐 ##########
      if (selectedMultipleActiveWallet.length === 0) {
        setSelectedMultipleActiveWallet([selectedWallet]);
      }
      // ########## Cosmo3️⃣ ##########
      if (selectedMultipleActiveWalletCosmo.length === 0) {
        setSelectedMultipleActiveWalletCosmo([selectedWallet]);
      }
      // ########## Trending3️⃣ ##########
      if (selectedMultipleActiveWalletTrending.length === 0) {
        setSelectedMultipleActiveWalletTrending([selectedWallet]);
      }
      // ########## Holdings✊ ##########
      if (selectedMultipleActiveWalletHoldings.length === 0) {
        setSelectedMultipleActiveWalletHoldings([selectedWallet]);
      }
      // ########## Token🪙 ##########
      if (selectedMultipleActiveWalletToken.length === 0) {
        setSelectedMultipleActiveWalletToken([selectedWallet]);
      }
      // ########## BuySell🔄 ##########
      if (selectedMultipleActiveWalletBuySell.length === 0) {
        setSelectedMultipleActiveWalletBuySell([selectedWallet]);
      }
      // ########## Sniper🎯 ##########
      if (selectedMultipleActiveWalletSniper.length === 0) {
        setSelectedMultipleActiveWalletSniper([selectedWallet]);
      }

      // ########## Tracker🔍 ##########
      if (trackerWalletsQuick.length === 0) {
        setTrackerWalletsQuick([selectedWallet]);
      }

      // ########## Cosmo3️⃣ ##########
      if (cosmoWallets.length === 0) {
        setCosmoWallets([selectedWallet]);
      }
    }
  }, [wallets, balance]);

  useEffect(() => {
    setIsLoading(true);
  }, []);

  useEffect(() => {
    let loadingTimeout: NodeJS.Timeout;
    if (!isLoading) {
      loadingTimeout = setTimeout(() => {
        setIsLoading(isLoading);
      }, 500);
    }
    return () => {
      clearTimeout(loadingTimeout);
    };
  }, [isLoading]);

  const isNew = cookies.get("isNew") === "true";
  const router = useRouter();

  useEffect(() => {
    if (isNew) {
      router.push("/login");
    }
  }, []);

  useEffect(() => {
    // Initialize audio context with user interaction
    const handleInteraction = () => {
      // Create and resume AudioContext
      const audioCtx = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }

      // Remove listeners after first interaction
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };

    window.addEventListener("click", handleInteraction);
    window.addEventListener("touchstart", handleInteraction);
    window.addEventListener("keydown", handleInteraction);

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, []);

  return <>{children}</>;
};

export default GetSettingsLayout;
