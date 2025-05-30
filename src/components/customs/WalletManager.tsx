// ######## Components 🧩 ########
import WithdrawModal from "@/components/customs/modals/WithdrawModal";
import ImportWalletPopoverModal from "@/components/customs/modals/ImportWalletPopoverModal";
import GenerateWalletPopoverModal from "@/components/customs/modals/GenerateWalletPopoverModal";
import DepositPopoverModal from "@/components/customs/modals/DepositPopoverModal";
import DepositWallet from "./DepositWallet";

export default function WalletManager() {
  return (
    <div className="flex items-center gap-x-2 lg:gap-x-3">
      {/* <DepositPopoverModal /> */}

      <div id="deposit-wallet">
        <div className="hidden xl:block">
          <DepositWallet />
        </div>

        <div className="xl:hidden">
          <DepositWallet isMobile />
        </div>
      </div>

      <div id="withdraw-wallet">
        <WithdrawModal />
      </div>

      <div id="import-wallet">
        <ImportWalletPopoverModal />
      </div>

      <div id="generate-new-wallet">
        <GenerateWalletPopoverModal />
      </div>
    </div>
  );
}
