"use client";

import React from "react";
import Image from "next/image";
import BaseButton from "@/components/customs/buttons/BaseButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import { useState, useCallback, useRef } from "react";

/**
 * Custom hook to handle confirmation for closing dialogs/popovers
 * @param hasUnsavedChanges Boolean indicating if there are unsaved changes
 * @param onConfirmDiscard Function to call when user confirms discarding changes
 * @param isSubmitting Boolean indicating if form submission is in progress
 */
export const useConfirmationDialog = (
  hasUnsavedChanges: boolean,
  onConfirmDiscard: () => void,
  isSubmitting: boolean = false,
) => {
  // State for the main dialog/popover
  const [isOpen, setIsOpen] = useState(false);

  // State for the confirmation dialog
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  // Store the pending close action
  const pendingCloseRef = useRef(false);

  // Handle open state change from Dialog/Popover
  const onOpenChange = useCallback(
    (open: boolean) => {
      // If trying to close and has unsaved changes AND not in submission process
      if (!open && isOpen && hasUnsavedChanges && !isSubmitting) {
        // Store that we want to close but don't actually close yet
        pendingCloseRef.current = true;

        // Show confirmation dialog
        setIsConfirmationOpen(true);

        // Prevent the dialog from closing
        return false;
      }

      // No unsaved changes or opening the dialog or in submission - update state normally
      setIsOpen(open);
      return true;
    },
    [isOpen, hasUnsavedChanges, isSubmitting],
  );

  // Function to directly close the main dialog without confirmation
  const closeDialogDirectly = useCallback(() => {
    setIsOpen(false);
    pendingCloseRef.current = false;
  }, []);

  // Handle confirmation result
  const handleConfirmClose = useCallback(() => {
    // First close the confirmation dialog
    setIsConfirmationOpen(false);

    // Then execute discard logic
    onConfirmDiscard();

    // Finally close the main dialog
    setIsOpen(false);
    pendingCloseRef.current = false;
  }, [onConfirmDiscard]);

  // Handle cancel (keep editing)
  const handleCancelClose = useCallback(() => {
    // Just close the confirmation dialog
    setIsConfirmationOpen(false);
    pendingCloseRef.current = false;
  }, []);

  return {
    isOpen,
    setIsOpen,
    isConfirmationOpen,
    setIsConfirmationOpen,
    onOpenChange,
    closeDialogDirectly,
    handleConfirmClose,
    handleCancelClose,
    pendingClose: pendingCloseRef.current,
  };
};

interface ConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  onCancel,
  title = "Confirm Cancel",
  message = "Are you sure you want to cancel? Any changes you've made will be lost.",
  confirmText = "Yes, Cancel",
  cancelText = "No, Keep Editing",
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogHeader className='hidden'>
        <DialogTitle>
          {title}
        </DialogTitle>
      </DialogHeader>
      <DialogContent
        showCloseButton={false}
        className="z-[9999] flex w-[320px] flex-col gap-y-2 rounded-[8px] border border-border bg-card p-4 shadow-[0_0_20px_0_#000000] nova-scoller"
      >
        <div className="flex w-full items-center justify-between">
          <h4 className="font-geistSemiBold text-base text-fontColorPrimary">
            {title}
          </h4>
          <DialogClose asChild>
            <button
              title="Close"
              className="relative aspect-square h-5 w-5 flex-shrink-0 duration-300 hover:opacity-70"
              onClick={onCancel}
            >
              <Image
                src="/icons/close.png"
                alt="Close Icon"
                fill
                quality={100}
                className="object-contain"
              />
            </button>
          </DialogClose>
        </div>
        <p className="text-sm text-foreground">{message}</p>
        <div className="mt-2 grid grid-cols-2 gap-x-2">
          <BaseButton
            variant="gray"
            onClick={onCancel}
            className="h-[32px] w-full"
          >
            <span className="inline-block whitespace-nowrap font-geistSemiBold text-sm">
              {cancelText}
            </span>
          </BaseButton>
          <BaseButton
            variant="primary"
            onClick={onConfirm}
            className="h-[32px] w-full"
          >
            <span className="inline-block whitespace-nowrap font-geistSemiBold text-sm">
              {confirmText}
            </span>
          </BaseButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog;
