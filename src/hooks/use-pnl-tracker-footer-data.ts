import { Wallet } from "@/apis/rest/wallet-manager";
import { usePnlSettings } from "@/stores/use-pnl-settings";
import { useSolPriceMessageStore } from "@/stores/use-solprice-message.store";
import { useUserWalletStore } from "@/stores/wallet/use-user-wallet.store";
import { useEffect, useMemo } from "react";

interface UsePnlTrackerFooterData {
  totalStoredBalance: number;
  totalBalance: number;
  totalProfitAndLoss: number;
  totalProfitAndLossPercentage: number;
  solPrice: number;
  isLoading: boolean;
  handleWalletSelection: (wallets: Wallet[]) => void;
}

export const usePnlTrackerFooterData = (): UsePnlTrackerFooterData => {
  const {
    storedWallets,
    isInitialized: pnlSettingsIsInitialized,
    setIsInitialized,
    handleResetPNLSettings,
  } = usePnlSettings();

  const {
    userWalletFullList,
    isLoading,
    selectedMultipleActiveWalletPnLTracker,
    setSelectedMultipleActiveWalletPnLTracker,
    balance,
  } = useUserWalletStore();

  const solPriceState = useSolPriceMessageStore(
    (state) => state.messages?.price,
  );

  const safeSolPrice = useMemo(() => {
    if (typeof window === "undefined") return 0;
    return parseFloat(localStorage.getItem("current_solana_price") ?? "0");
  }, []);

  const solPrice = solPriceState ?? safeSolPrice;

  const finalWallets = useMemo(
    () =>
      selectedMultipleActiveWalletPnLTracker?.filter((w) => !w.archived) ?? [],
    [selectedMultipleActiveWalletPnLTracker],
  );

  const selectedAddresses = useMemo(
    () => finalWallets.map((wallet) => wallet.address),
    [finalWallets],
  );

  const isStoredWalletsMatch = storedWallets.find(
    (item) => item.address === userWalletFullList[0]?.address,
  );

  const initStoredWallets = useMemo(() => {
    return userWalletFullList.map((w) => {
      return {
        balance: Number(balance[w.address] ?? 0),
        address: w.address,
      };
    });
  }, [userWalletFullList]);

  const totalStoredBalance = useMemo(() => {
    return (storedWallets.length < 1 ? userWalletFullList : storedWallets)
      .filter((w) => selectedAddresses.includes(w.address))
      .reduce((sum, wallet) => {
        return sum + (Number(wallet.balance) || 0);
      }, 0);
  }, [storedWallets, selectedAddresses]);

  const totalCurrentBalance = useMemo(() => {
    return userWalletFullList
      .filter((wallet) => selectedAddresses.includes(wallet.address))
      .reduce((sum, w) => sum + Number(w.balance), 0);
  }, [userWalletFullList, selectedAddresses]);

  const totalProfitAndLoss = useMemo(() => {
    return totalCurrentBalance - totalStoredBalance;
  }, [totalStoredBalance, totalCurrentBalance]);

  const totalProfitAndLossPercentage = useMemo(() => {
    return totalCurrentBalance
      ? ((totalCurrentBalance - totalStoredBalance) / totalCurrentBalance) * 100
      : 0;
  }, [
    selectedMultipleActiveWalletPnLTracker,
    totalStoredBalance,
    totalCurrentBalance,
  ]);

  // useEffect(() => {
  //   if (!pnlSettingsIsInitialized) {
  //     console.log("SET storedWallets", initStoredWallets);
  //
  //     handleResetPNLSettings(initStoredWallets);
  //     setIsInitialized(true);
  //   }
  //   if (!isStoredWalletsMatch || storedWallets.length <= 0) {
  //     handleResetPNLSettings(initStoredWallets);
  //     handleWalletSelection(userWalletFullList);
  //   }
  // }, [initStoredWallets, isStoredWalletsMatch, storedWallets]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = localStorage.getItem("selected_wallet_pnl_tracker"); 
    const isSavedExist = !!saved && (JSON.parse(saved || "[]")?.length) > 0
    const wallets = (isSavedExist ? JSON.parse(saved || "[]") : userWalletFullList).filter((w: any) => !w?.archived);

    if (!isSavedExist) {
      localStorage.setItem(
        "selected_wallet_pnl_tracker",
        JSON.stringify(userWalletFullList.filter((w) => !w?.archived)),
      );
    }

    setSelectedMultipleActiveWalletPnLTracker(wallets);
  }, [userWalletFullList, setSelectedMultipleActiveWalletPnLTracker]);

  const handleWalletSelection = (wallets: Wallet[]) => {
    setSelectedMultipleActiveWalletPnLTracker(wallets?.filter((w) => !w?.archived));
    localStorage.setItem(
      "selected_wallet_pnl_tracker",
      JSON.stringify(wallets?.filter((w) => !w?.archived)),
    );
  };

  return {
    totalStoredBalance,
    totalBalance: totalCurrentBalance,
    totalProfitAndLoss,
    totalProfitAndLossPercentage,
    handleWalletSelection,
    solPrice,
    isLoading,
  };
};
