"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useRef } from "react";
import { useFooterStore } from "@/stores/footer/use-footer.store";
import { useAlertMessageStore } from "@/stores/footer/use-alert-message.store";
import { useQuery } from "@tanstack/react-query";
import { Virtuoso } from "react-virtuoso";
// ######## APIs 🛜 ########
import { clearFooterSection } from "@/apis/rest/footer";
// ######## Components 🧩 ########
import HeadCol from "@/components/customs/tables/HeadCol";
import AlertCard from "@/components/customs/cards/footer/AlertCard";
import EmptyState from "@/components/customs/EmptyState";
import LoadingState from "@/components/customs/LoadingState";

export default function AlertTable() {
  const alerts = useAlertMessageStore((state) => state.messages);
  const isLoading = useAlertMessageStore((state) => !state.isInitialFetched);
  const setFooterMessage = useFooterStore((state) => state.setMessage);
  const isFetched = useRef(false);

  useQuery({
    queryKey: ["clear-alerts"],
    queryFn: async () => {
      const footer = await clearFooterSection("alerts");
      setFooterMessage(footer);
      return footer;
    },
    enabled: !isFetched.current,
  });

  const HeaderData = [
    {
      label: "Time",
      tooltipContent: "Time since the action was made",
      className: "min-w-[60px]",
    },
    {
      label: "Type",
      tooltipContent: "The type of transaction made",
      className: "min-w-[60px]",
    },
    {
      label: "Token",
      tooltipContent: "Token name and address",
      className: "min-w-[190px]",
    },
    {
      label: "Amount",
      tooltipContent: "Amount of SOL put in and the amount of tokens bought",
      className: "min-w-[110px]",
    },
    {
      label: "Market Cap",
      tooltipContent: "Indicates token value",
      className: "min-w-[110px]",
    },
    {
      label: "Wallet Name",
      tooltipContent: "The name provided for the wallet",
      className: "min-w-[130px]",
    },
    {
      label: "Mode",
      tooltipContent: "Type of transaction made",
      className: "min-w-[100px]",
    },
    {
      label: "Action",
      tooltipContent:
        "Action button which includes the Solscan link of the transaction",
      className: "min-w-[45px] justify-center",
    },
  ];

  return (
    <div className="relative flex w-full flex-grow flex-col">
      <div className="absolute left-0 top-0 flex h-full w-full flex-grow flex-col">
        <div className="header__table__container">
          {HeaderData.map((item, index) => (
            <HeadCol key={index} {...item} />
          ))}
        </div>

        {isLoading ? (
          <div className="my-auto flex size-full flex-grow items-center justify-center">
            <LoadingState state="Alerts" />
          </div>
        ) : alerts && alerts?.length > 0 ? (
          <div className="nova-scroller relative flex h-full w-full flex-grow flex-col max-md:gap-y-2 max-md:p-3">
            {alerts.map((alert, index) => (
              <AlertCard
                key={index}
                alert={alert}
                type={alert.type?.toLowerCase() as "buy" | "sell"}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-full w-full flex-grow items-center justify-center p-4">
            <EmptyState state="Alerts" />
          </div>
        )}
      </div>
    </div>
  );
}
