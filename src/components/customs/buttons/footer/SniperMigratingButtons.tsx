"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
// ######## Components 🧩 ########
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import FooterModal from "@/components/customs/modals/FooterModal";
import SniperMigrationEditContent from "../../modals/contents/footer/actions/SniperMigratingEditContent";
import BaseButton from "../BaseButton";
import { SniperTask, deleteSniperTask } from "@/apis/rest/sniper";
import CustomToast from "../../toasts/CustomToast";
import SnipeNewPairEditContent from "../../modals/contents/footer/actions/SnipeNewPairEditContent";

export default React.memo(function SniperMigratingButtons({
  task,
}: {
  task: SniperTask;
}) {
  const queryClient = useQueryClient();
  const [openEditModal, setOpenEditModal] = useState<boolean>(false);

  const deleteMutation = useMutation({
    mutationFn: () => deleteSniperTask({ taskId: task.taskId }),
    onSuccess: () => {
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message="Task deleted successfully"
          state="SUCCESS"
        />
      ));
      // Refetch tasks after deletion
      queryClient.invalidateQueries({ queryKey: ["sniper-tasks"] });
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

  const handleToggleOpenEditModal = () => setOpenEditModal((prev) => !prev);

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  return (
    <>
      <FooterModal
        modalState={openEditModal}
        toggleModal={handleToggleOpenEditModal}
        layer={2}
        responsiveWidthAt={920}
        triggerChildren={
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <BaseButton
                  onClick={handleToggleOpenEditModal}
                  size="short"
                  variant="gray"
                  className="z-[0] h-[30px] w-[30px] rounded-[8px]"
                >
                  <div className="relative z-30 aspect-square h-4 w-4 flex-shrink-0">
                    <Image
                      src="/icons/footer/edit.png"
                      alt="Edit Icon"
                      fill
                      quality={100}
                      className="object-contain"
                    />
                  </div>
                </BaseButton>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="z-[320] px-2 py-1">
                <span className="inline-block text-nowrap text-xs">Edit</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        }
        contentClassName="w-full max-w-[456px] flex flex-col h-auto !bottom-[50px] max-md:bottom-[40px]"
      >
        {task.type.includes("migration") ? (
          <SniperMigrationEditContent
            toggleModal={handleToggleOpenEditModal}
            task={task}
          />
        ) : (
          <SnipeNewPairEditContent
            toggleModal={handleToggleOpenEditModal}
            task={task}
          />
        )}
      </FooterModal>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <BaseButton
              onClick={handleDelete}
              size="short"
              variant="gray"
              className="z-[0] h-[30px] w-[30px] rounded-[8px]"
              disabled={deleteMutation.isPending}
            >
              <div className="relative z-30 aspect-square h-4 w-4 flex-shrink-0">
                {deleteMutation.isPending ? (
                  <Image
                    src="/icons/search-loading.png"
                    alt="Loading"
                    fill
                    quality={100}
                    className="animate-spin object-contain"
                  />
                ) : (
                  <Image
                    src="/icons/footer/delete.png"
                    alt="Delete Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                )}
              </div>
            </BaseButton>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="z-[320] px-2 py-1">
            <span className="inline-block text-nowrap text-xs">
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
});
