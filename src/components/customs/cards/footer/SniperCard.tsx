"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useEffect, useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  useActivePresetStore,
  Preset,
} from "@/stores/dex-setting/use-active-preset.store";
// ######## Components 🧩 ########
import Image from "next/image";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import SniperMigratingButtons from "@/components/customs/buttons/footer/SniperMigratingButtons";
import SellBuyBadge from "@/components/customs/SellBuyBadge";
import TaskStatus from "@/components/customs/TaskStatus";
import Copy from "@/components/customs/Copy";
import ProgressBadge from "@/components/customs/ProgressBadge";
import AvatarWithBadges from "@/components/customs/AvatarWithBadges";
import PresetSelectionButtons from "../../PresetSelectionButtons";
import {
  editMigrationTask,
  EditMigrationTaskRequest,
  editMigrationTaskSchema,
  editNewPairTask,
  EditNewPairTaskRequest,
  editNewPairTaskSchema,
  MigrationTaskRequest,
  SniperTask,
} from "@/apis/rest/sniper";
import { truncateString } from "@/utils/truncateString";
import { truncateAddress } from "@/utils/truncateAddress";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useBuySniperSettingsStore } from "@/stores/setting/use-buy-sniper-settings.store";
import {
  convertNumberToPresetId,
  convertNumberToPresetKey,
  convertPresetIdToNumber,
} from "@/utils/convertPreset";
import CustomToast from "../../toasts/CustomToast";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserWalletStore } from "@/stores/wallet/use-user-wallet.store";
import { useRouter } from "nextjs-toploader/app";
import { formatAmountWithoutLeadingZero } from "@/utils/formatAmount";
import truncateCA from "@/utils/truncateCA";
import { CachedImage } from "../../CachedImage";
import { useWindowSizeStore } from "@/stores/use-window-size.store";

interface Props {
  task: SniperTask;
  type?: "completed" | "migration";
  index?: number;
}

export default React.memo(function SniperCard({
  task,
  type = "migration",
  index,
}: Props) {
  const width = useWindowSizeStore((state) => state.width);
  const router = useRouter();
  const queryClient = useQueryClient();
  const presetData = useBuySniperSettingsStore((state) => state.presets);
  const [preset, setPreset] = useState<number | null>(null);

  const tokenUrl = useMemo(() => {
    if (!task?.mint) return "#";

    const params = new URLSearchParams({
      symbol: task?.symbol || "",
      name: task?.name || "",
      image: task?.image || "",
      dex: task?.dex || "",
    });

    return `/token/${task.mint}?${params.toString()}`;
  }, [task?.symbol, task?.name, task?.image, task?.dex]);

  const form = useForm<EditMigrationTaskRequest>({
    resolver: zodResolver(
      task.type == "migration"
        ? editMigrationTaskSchema
        : editNewPairTaskSchema,
    ),
    mode: "onChange",
    defaultValues: {
      mint: task.mint,
      taskId: task.taskId,
      method: task.method,
      autoTipEnabled: false,
      mevProtectEnabled: task.mevProtectEnabled,
      amount: task.amount,
      slippage: task.slippage,
      fee: task.fee,
      minTip: task.minTip,
      minAmountOut: task.minAmountOut,
      mode: (["fast", "secure"].includes(task.processor)
        ? task.processor
        : "secure") as "fast" | "secure",
      ...(task.type == "migration" && {
        dev: task.developer,
        ticker: task.ticker,
      }),
      wallet: task.wallet,
      percentage: task.percentage,
    },
  });

  // Buy transaction mutation
  const mutation = useMutation({
    mutationFn: async (
      finalData: EditMigrationTaskRequest | EditNewPairTaskRequest,
    ) => {
      if (task.type == "migration") {
        return await editMigrationTask(finalData as EditMigrationTaskRequest);
      } else {
        return await editNewPairTask(finalData as EditNewPairTaskRequest);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["sniper-tasks"] });
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message="Sniper task edited successfully"
          state="SUCCESS"
        />
      ));
    },
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

  // Handle form submission
  const onSubmit = (
    data: EditMigrationTaskRequest | EditNewPairTaskRequest,
    preset: number,
  ) => {
    let finalData = data;
    if (presetData) {
      const presetKey = convertNumberToPresetKey(
        preset,
      ) as keyof typeof presetData;
      finalData = {
        ...data,
        slippage: presetData[presetKey].slippage,
        minAmountOut: presetData[presetKey].minAmountOut,
        mode: (["secure", "fast"].includes(presetData[presetKey]?.processor)
          ? presetData[presetKey].processor
          : task.processor) as "fast" | "secure",
        autoTipEnabled: presetData[presetKey].autoTipEnabled,
        fee: presetData[presetKey].fee,
        minTip: presetData[presetKey].minTip,
        maxTip: presetData[presetKey].maxTip,
        taskId: task.taskId,
      };
    }
    mutation.mutate(
      finalData as EditMigrationTaskRequest | EditNewPairTaskRequest,
    );
  };

  let hoverTimeout: NodeJS.Timeout;

  return (
    <div
      className={cn(
        "transition-color group flex-shrink-0 items-center overflow-hidden rounded-[8px] border-border duration-300 ease-out hover:border-border max-md:border max-md:bg-card md:flex md:h-[64px] md:min-w-max md:rounded-none md:pl-4 md:pr-4 md:even:bg-transparent md:hover:bg-shadeTableHover",
        index! % 2 == 0 ? "md:bg-shadeTable md:hover:bg-shadeTableHover" : "",
      )}
    >
      {/* ########## 💻 DESKTOP ########## */}
      {width! >= 768 && (
        <>
          {/* Task status */}
          <div className="flex h-full w-full min-w-[120px] items-center max-md:hidden">
            <TaskStatus
              isCompleted={task.isCompleted}
              isRunning={task.status == "running"}
            />
          </div>
          {/* Token */}
          <div
            onClick={() => {
              router.push(tokenUrl);

              // setTimeout(() => {
              //   prefetchCandles(data.mint);
              // }, 10);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.open("/token/" + task.mint, "_blank");
            }}
            className="flex h-full w-full min-w-[170px] cursor-pointer items-center max-md:hidden"
          >
            <div className="flex items-center gap-x-2">
              <AvatarWithBadges
                src={task.type.includes("migration") ? task.image : ""}
                alt={`${task.type.includes("migration") ? task.symbol : "-"} Image`}
              />
              <div>
                <span className="inline-block max-w-[80px] overflow-hidden text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                  {truncateString(task?.name, 8)}
                </span>
                <div className="-mt-0.5 flex items-center gap-x-1">
                  <span className="text-nowrap text-xs uppercase text-fontColorPrimary/70">
                    {truncateCA(task.mint, 10)}
                  </span>
                  <Copy value={task.mint} dataDetail={task} />
                </div>
              </div>
            </div>
          </div>
          {/* Snipe */}
          <div className="flex h-full w-full min-w-[20px] items-center max-md:hidden">
            <SellBuyBadge
              type={task.method == "sell" ? "sell" : "buy"}
              size="sm"
            />
          </div>
          {/* SOL */}
          <div className="flex h-full w-full min-w-[70px] items-center max-md:hidden">
            <div className="flex items-center gap-x-1">
              <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                <CachedImage
                  src="/icons/solana-sq.svg"
                  alt="Solana SQ Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </div>
              <span
                className={cn(
                  "inline-block text-nowrap font-geistSemiBold text-sm",
                  task.method == "sell" ? "text-destructive" : "text-success",
                )}
              >
                {formatAmountWithoutLeadingZero(task.amount)}
              </span>
            </div>
          </div>
          {type == "completed" && (
            <div className="flex h-full w-full min-w-[120px] items-center max-md:hidden">
              <div className="flex items-center gap-x-1">
                <span
                  className={cn(
                    "inline-block text-nowrap font-geistSemiBold text-sm",
                    task.method == "sell" ? "text-destructive" : "text-success",
                  )}
                >
                  ${formatAmountWithoutLeadingZero(task.marketCapUsd)}
                </span>
              </div>
            </div>
          )}
          <div className="flex h-full w-full min-w-[200px] items-center max-md:hidden">
            <ProgressBadge
              color={task.progressColour}
              label={task.progress}
              // type={task.isCompleted ? "completed" : task.progress}
            />
          </div>
          <div className="flex h-full w-full min-w-[155px] items-center max-md:hidden">
            <PresetSelectionButtons
              isWithAutoFee={false}
              activePreset={convertNumberToPresetId(preset as number)}
              setActivePreset={(value: string) => {
                onSubmit(form.watch(), convertPresetIdToNumber(value));
                setPreset(convertPresetIdToNumber(value));
              }}
            />
          </div>
          <div className="flex h-full w-full min-w-[90px] items-center justify-end max-md:hidden">
            <div className="flex items-center gap-x-2">
              <SniperMigratingButtons task={task} />
            </div>
          </div>
        </>
      )}

      {/* ########## 📱 Mobile ########## */}
      {width! < 768 && (
        <>
          {/* Header */}
          <div className="relative flex h-[48px] w-full items-center justify-between overflow-hidden bg-white/[4%] px-3 py-7 md:hidden">
            <div className="relative z-20 flex items-center gap-x-2">
              <AvatarWithBadges
                src={task.type.includes("migration") ? task.image : ""}
                alt={`${task.type.includes("migration") ? task.symbol : "-"} Image`}
                size="sm"
              />
              <h4
                onClick={() => {
                  router.push(tokenUrl);
                }}
                className="text-nowrap font-geistSemiBold text-xs text-fontColorPrimary"
              >
                {truncateString(
                  task.type.includes("migration") ? task.symbol : "-",
                  8,
                )}
              </h4>
              <span className="inline-block text-nowrap font-geistSemiBold text-xs uppercase text-fontColorSecondary">
                {truncateAddress(task.mint)}
              </span>
              <Copy value={task.mint} />
            </div>
            <div className="relative z-20 flex items-center gap-x-2">
              <ProgressBadge
                color={task.progressColour}
                label={task.progress}
              />
              <TaskStatus
                isCompleted={task.isCompleted}
                isRunning={task.status == "running"}
              />
            </div>
          </div>
          {/* Content */}
          <div className="relative flex w-full justify-between p-3 md:hidden">
            <div className="flex w-full flex-col">
              <span className="inline-block text-nowrap font-geistRegular text-xs text-fontColorSecondary">
                Invested
              </span>
              <span
                className={cn(
                  "inline-block text-nowrap font-geistSemiBold text-xs",
                  task.method == "sell" ? "text-destructive" : "text-success",
                )}
              >
                {task.method == "sell" ? "Sell" : "Buy"}
              </span>
            </div>

            <div className="flex w-full flex-col">
              <span className="inline-block text-nowrap font-geistRegular text-xs text-fontColorSecondary">
                Remaining
              </span>
              <span
                className={cn(
                  "flex items-center gap-1 text-nowrap font-geistSemiBold text-xs",
                  task.method == "sell" ? "text-destructive" : "text-success",
                )}
              >
                <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                  <CachedImage
                    src="/icons/solana-sq.svg"
                    alt="Solana SQ Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
                {task.amount}
              </span>
            </div>

            <PresetSelectionButtons
              isWithAutoFee={false}
              activePreset={convertNumberToPresetId(preset as number)}
              setActivePreset={(value: string) => {
                onSubmit(form.watch(), convertPresetIdToNumber(value));
                setPreset(convertPresetIdToNumber(value));
              }}
            />

            <div className="flex w-full items-center justify-end gap-x-2">
              <SniperMigratingButtons task={task} />
            </div>
          </div>
        </>
      )}
    </div>
  );
});
