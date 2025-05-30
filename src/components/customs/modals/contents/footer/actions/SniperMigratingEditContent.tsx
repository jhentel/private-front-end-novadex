"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useEffect, useState } from "react";
// ######## Components 🧩 ########
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SniperMigratingEditBuyForm from "@/components/customs/forms/footer/SniperMigratingEditBuyForm";
import SniperMigratingEditSellForm from "@/components/customs/forms/footer/SniperMigratingEditSellForm";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { TradeActionType } from "@/types/global";
import BuySellTabSelector from "@/components/customs/BuySellTabSelector";
import {
  EditMigrationTaskRequest,
  editMigrationTaskSchema,
  MigrationTaskRequest,
  SniperTask,
} from "@/apis/rest/sniper";
import { useForm, UseFormReturn } from "react-hook-form";
import { BuySniperPresetData } from "@/apis/rest/settings/settings";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";

type Tab = {
  label: TradeActionType;
  icons: {
    active: string;
    inactive: string;
  };
  tooltipMessage: string;
  content: React.ComponentType<{
    toggleModal: () => void;
    prevData: SniperTask;
    form: UseFormReturn<EditMigrationTaskRequest>;
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
    content: SniperMigratingEditBuyForm,
  },
  {
    label: "Sell",
    icons: {
      active: "/icons/token/active-sell.png",
      inactive: "/icons/token/inactive-sell.png",
    },
    tooltipMessage: "Sell Information",
    content: SniperMigratingEditSellForm,
  },
];

type SniperMigratingEditContentProps = {
  toggleModal: () => void;
  task: SniperTask;
};

export default function SniperMigratingEditContent({
  toggleModal,
  task,
}: SniperMigratingEditContentProps) {
  const [activeTab, setActiveTab] = useState<TradeActionType>("Buy");
  // console.log("BALALALA🦋🦋🦋", task)
  // Initialize form with mode to trigger validation
  const form = useForm<EditMigrationTaskRequest>({
    resolver: zodResolver(editMigrationTaskSchema),
    mode: "onChange",
    defaultValues: {
      mint: task.mint,
      taskId: task.taskId,
      method: activeTab == "Buy" ? "buy" : "sell",
      autoTipEnabled: false,
      mevProtectEnabled: true,
      // amount: 0,
      slippage: 20,
      fee: 0,
      minTip: 0,
      minAmountOut: 0,
      mode: "secure",
    },
  });

  useEffect(() => {
    form.setValue("method", activeTab == "Buy" ? "buy" : "sell");
  }, [activeTab]);

  return (
    <>
      <div className="flex h-[58px] w-full items-center justify-between border-b border-border p-4">
        <h4 className="text-nowrap font-geistSemiBold text-[18px] text-fontColorPrimary">
          Edit
        </h4>

        <button onClick={toggleModal}>
          <div className="relative aspect-square h-6 w-6 flex-shrink-0">
            <Image
              src="/icons/footer/close.png"
              alt="Footer Close Icon"
              fill
              quality={100}
              className="object-contain"
            />
          </div>
        </button>
      </div>

      <div className="flex w-full flex-grow flex-col">
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

        {/* Buy / Sell Tabs */}
        <Form {...form}>
          <div className="relative grid w-full flex-grow grid-cols-1">
            {tabList.map((tab) => {
              const isActive = activeTab === tab.label;
              const FormComponent = tab.content;
              return isActive ? (
                <FormComponent
                  key={tab.label}
                  form={form}
                  prevData={task}
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
