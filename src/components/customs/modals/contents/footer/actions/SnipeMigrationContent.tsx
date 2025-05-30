"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState, useEffect } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { migrationTaskSchema, MigrationTaskRequest } from "@/apis/rest/sniper";
import { Form } from "@/components/ui/form";
// ######## Components 🧩 ########
import Image from "next/image";
import SnipeMigrationBuyForm from "@/components/customs/forms/footer/SnipeMigrationBuyForm";
import SnipeMigrationSellForm from "@/components/customs/forms/footer/SnipeMigrationSellForm";
// ######## Utils & Helpers 🤝 ########
import BuySellTabSelector from "@/components/customs/BuySellTabSelector";
import { TradeActionType } from "@/types/global";
import { useSniperFooterStore } from "@/stores/footer/use-sniper-footer.store";
import { DrawerClose } from "@/components/ui/drawer";

type Tab = {
  label: TradeActionType;
  icons: {
    active: string;
    inactive: string;
  };
  tooltipMessage: string;
  content: React.ComponentType<{
    toggleModal: () => void;
    form: UseFormReturn<MigrationTaskRequest>;
  }>;
};

const tabList: Tab[] = [
  {
    label: "Buy",
    icons: {
      active: "/icons/token/active-buy.png",
      inactive: "/icons/token/inactive-buy.png",
    },
    tooltipMessage: "Buy Information",
    content: SnipeMigrationBuyForm,
  },
  {
    label: "Sell",
    icons: {
      active: "/icons/token/active-sell.png",
      inactive: "/icons/token/inactive-sell.png",
    },
    tooltipMessage: "Sell Information",
    content: SnipeMigrationSellForm,
  },
];

type SnipeMigrationContentProps = {
  toggleModal: () => void;
  isOpen: boolean;
  isDrawer?: boolean;
};

export default function SnipeMigrationContent({
  toggleModal,
  isOpen,
  isDrawer = false,
}: SnipeMigrationContentProps) {
  const [activeTab, setActiveTab] = useState<TradeActionType>("Buy");
  const { setTokenInfoState: setSniperState, tokenInfoState: sniperState } =
    useSniperFooterStore();

  // Initialize form with mode to trigger validation
  const form = useForm<MigrationTaskRequest>({
    resolver: zodResolver(migrationTaskSchema),
    mode: "onSubmit",
    defaultValues: {
      method: activeTab == "Buy" ? "buy" : "sell",
      autoTipEnabled: false,
      mevProtectEnabled: true,
      slippage: 20,
      fee: 0,
      minTip: 0,
      // amount: 0,
      mint: "",
      minAmountOut: 0,
      mode: "secure",
    },
  });

  useEffect(() => {
    if (sniperState && isOpen) {
      form.reset({
        ...form.watch(),
        mint: sniperState.mint,
        dex: sniperState.dex,
        image: sniperState.image,
        symbol: sniperState.symbol,
      });
      setSniperState(null);
    }
  }, [sniperState, isOpen]);

  return (
    <>
      <div className="flex h-[56px] w-full flex-shrink-0 items-center justify-between border-b border-border px-4">
        <h4 className="text-nowrap font-geistSemiBold text-[18px] text-fontColorPrimary">
          Snipe Migration
        </h4>

        {isDrawer ? (
          <DrawerClose asChild>
            <button onClick={toggleModal} className="cursor-pointer">
              <div className="relative z-10 aspect-square h-6 w-6 flex-shrink-0">
                <Image
                  src="/icons/footer/close.png"
                  alt="Footer Close Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </div>
            </button>
          </DrawerClose>
        ) : (
          <button onClick={toggleModal} className="cursor-pointer">
            <div className="relative z-10 aspect-square h-6 w-6 flex-shrink-0">
              <Image
                src="/icons/footer/close.png"
                alt="Footer Close Icon"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
          </button>
        )}
      </div>

      {/* Buy / Sell Tabs */}
      <div className="flex h-full w-full flex-grow flex-col">
        <div className="flex-shrink-0">
          <BuySellTabSelector
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tabList={
              tabList as unknown as {
                label: TradeActionType;
                icons?: {
                  active: string;
                  inactive: string;
                };
                tooltipMessage: string;
                content:
                  | React.ComponentType
                  | React.ComponentType<{ toggleModal: () => void }>;
              }[]
            }
          />
        </div>

        <Form {...form}>
          <div className="relative grid h-full w-full flex-grow grid-cols-1 pb-28 md:pb-0">
            {tabList.map((tab) => {
              const isActive = activeTab === tab.label;
              const FormComponent = tab.content;
              return isActive ? (
                <FormComponent
                  key={tab.label}
                  form={form}
                  toggleModal={toggleModal}
                />
              ) : null;
            })}
          </div>
        </Form>
      </div>
    </>
  );
}
