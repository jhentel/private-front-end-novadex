"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { useQuery } from "@tanstack/react-query";
import cookies from "js-cookie";
import toast from "react-hot-toast";

// ######## Components 🧩 ########
import Image from "next/image";
import BaseButton from "@/components/customs/buttons/BaseButton";
import CustomToast from "@/components/customs/toasts/CustomToast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PopoverClose } from "@radix-ui/react-popover";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { DialogClose } from "@radix-ui/react-dialog";
import { Loader2 } from "lucide-react";
import { cn } from "@/libraries/utils";
import ConfirmationDialog, {
  useConfirmationDialog,
} from "./AddTwitterCancelConfirmation";
import { useWindowSizeStore } from "@/stores/use-window-size.store";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { DiscordChannel, SuggestedDiscordChannel } from "@/types/monitor";
import { useDiscordMonitorMessageStore } from "@/stores/footer/use-discord-monitor-message.store";
import {
  getSuggestedDiscordChannel,
  updateDiscordMonitorChannel,
} from "@/apis/rest/discord-monitor";

const ADD_TS_POPOVER_CLASSNAME =
  "gb__white__popover flex flex-col gap-y-0 rounded-[8px] border border-border bg-card p-0 shadow-[0_0_20px_0_#000000] z-[9999] h-[50%] w-full";

interface AddDiscordContentProps {
  closeComponent: React.ReactNode;
  onHasChanges: (hasChanges: boolean) => void;
  onResetInputs: (resetFn: () => void) => void;
  onSubmitStart: () => void;
  onSubmitEnd: () => void;
}

export const AddDiscordContent: React.FC<AddDiscordContentProps> = ({
  closeComponent,
  onHasChanges,
  onResetInputs,
  onSubmitStart,
  onSubmitEnd,
}) => {
  const wsRef = useDiscordMonitorMessageStore((state) => state.websocketRef);
  const groups = useDiscordMonitorMessageStore((state) => state.accounts);
  const setAccounts = useDiscordMonitorMessageStore(
    (state) => state.setAccounts,
  );

  // State to track changes
  const [hasLocalChanges, setHasLocalChanges] = useState(false);

  // Original state references
  const originalSuggestedChannelsRef = useRef<DiscordChannel[]>([]);

  const { data: suggestedGroups, isLoading: isLoadingSuggested } = useQuery<
    SuggestedDiscordChannel[]
  >({
    queryKey: ["discord-suggested-groups"],
    queryFn: getSuggestedDiscordChannel,
  });

  const filteredSuggestedAccounts = useMemo(() => {
    if (!suggestedGroups) return [];
    return suggestedGroups.filter((group) => {
      const accountNames = groups.map((account) =>
        typeof account === "string" ? account : account.name,
      );
      return !accountNames.includes(group.name);
    });
  }, [suggestedGroups, groups]);

  const currentAddedAccounts = useMemo(() => {
    if (!suggestedGroups) return [];
    return suggestedGroups.filter((group) =>
      groups.some((item) =>
        typeof item === "string"
          ? item === group.name
          : item.name === group.name,
      ),
    );
  }, [suggestedGroups, groups]);

  const [suggestedDiscordChannelDraft, setSuggestedDiscordChannelDraft] =
    useState<DiscordChannel[]>([]);

  useEffect(() => {
    if (suggestedGroups && suggestedGroups.length > 0 && !isLoadingSuggested) {
      setSuggestedDiscordChannelDraft(
        suggestedGroups.filter((group) =>
          groups.some((selected) => group.name.includes(selected as string)),
        ) || [],
      );
    }
  }, [suggestedGroups, isLoadingSuggested, groups]);

  // Save original suggested accounts for change detection
  useEffect(() => {
    originalSuggestedChannelsRef.current = JSON.parse(JSON.stringify(groups));
  }, [groups]);

  const handleAddSuggestedChannel = (discordChannel: DiscordChannel) => {
    setSuggestedDiscordChannelDraft([
      ...suggestedDiscordChannelDraft,
      discordChannel,
    ]);
  };

  const resetInputsToOriginal = useCallback(() => {
    // Reset suggested accounts to original state
    setSuggestedDiscordChannelDraft(
      JSON.parse(JSON.stringify(originalSuggestedChannelsRef.current)),
    );

    setHasLocalChanges(false);
    onHasChanges(false);
  }, [onHasChanges]);

  // Expose resetInputs function to parent via prop
  useEffect(() => {
    onResetInputs(resetInputsToOriginal);
  }, [resetInputsToOriginal, onResetInputs]);

  const handleAddGroupSubmit = async () => {
    // Signal we're starting submission
    onSubmitStart();

    if (suggestedDiscordChannelDraft.length === 0) {
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          state="ERROR"
          message="There's no account to be added"
        />
      ));
      onSubmitEnd(); // Signal we've ended submission
      return;
    }

    const finalGroups = suggestedDiscordChannelDraft.map(
      (channel) => channel.name,
    );

    try {
      const result = await updateDiscordMonitorChannel(finalGroups);

      if (!result.success) {
        toast.custom((t: any) => (
          <CustomToast
            tVisibleState={t.visible}
            state="ERROR"
            message={result.message || "Failed to update accounts"}
          />
        ));
        onSubmitEnd(); // Signal we've ended submission
        return;
      }

      if (wsRef?.OPEN) {
        setAccounts(finalGroups);
        const currentGroups = groups.map((acc) => acc);
        const newGroups = suggestedDiscordChannelDraft.map((acc) => acc.name);

        handleSendMessage(
          suggestedDiscordChannelDraft.filter(
            (a) => !currentGroups.includes(a.name),
          ),
          groups
            .filter((a) => {
              // For string type, compare directly
              if (typeof a === "string") return !newGroups.includes(a);
              // For DiscordChannel type, compare the name property
              return !newGroups.includes(a.name);
            })
            .map((channel) => {
              // If it's already a DiscordChannel object, return it directly
              if (typeof channel !== "string") return channel;
              // Otherwise create a DiscordChannel object from the string
              return { name: channel, image: "" };
            }),
        );
      }

      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message={`${suggestedDiscordChannelDraft.length - currentAddedAccounts.length} Discord Servers Updated`}
        />
      ));

      // Update original state references after successful submission
      originalSuggestedChannelsRef.current = JSON.parse(
        JSON.stringify(suggestedDiscordChannelDraft),
      );

      setHasLocalChanges(false);
      onHasChanges(false);

      // Close the dialog
      const closeButton = document.querySelector(
        "[data-close-add-ts]",
      ) as HTMLButtonElement;
      if (closeButton) closeButton.click();
    } catch (error) {
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          state="ERROR"
          message="Failed to update discord servers"
        />
      ));
    } finally {
      onSubmitEnd(); // Signal submission has ended regardless of outcome
    }
  };

  const handleSendMessage = async (
    newList: DiscordChannel[],
    removedList: DiscordChannel[],
  ) => {
    if (wsRef) {
      if (newList.length > 0) {
        const subscriptionMessage = {
          action: "subscribe",
          licenseKey: cookies.get("_discord_api_key"),
          groups: [...newList.map((acc) => acc.name)],
        };

        wsRef.send(JSON.stringify(subscriptionMessage));
      }
      if (removedList.length > 0) {
        const unsubscriptionMessage = {
          action: "unsubscribe",
          licenseKey: cookies.get("_discord_api_key"),
          groups: [...removedList.map((acc) => acc.name)],
        };

        wsRef.send(JSON.stringify(unsubscriptionMessage));
      }
    }
  };

  return (
    <>
      <div className="flex h-[56px] w-full items-center justify-between border-b border-border p-4">
        <h4 className="text-nowrap font-geistSemiBold text-lg text-fontColorPrimary">
          Add Discord
        </h4>
        {closeComponent}
      </div>
      <div className="grid w-full overflow-hidden xl:grid-cols-1">
        <div className="flex flex-grow flex-col border-border max-xl:border-b xl:border-r">
          <OverlayScrollbarsComponent
            defer
            element="div"
            className="flex h-[30vh] min-h-[200px] w-full flex-grow flex-col p-4"
          >
            <h1 className="mb-[5px] flex w-fit items-center justify-center font-geistSemiBold text-[14px] leading-3 text-white">
              <div className="relative mr-1 inline-block size-4">
                <Image
                  src="/icons/social/discord.svg"
                  alt="Star Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </div>
              Discord Servers
            </h1>
            <p className="mb-[12px] w-full max-w-[275px] font-geistLight text-[12px] leading-tight text-foreground">
              Add a Discord server to manage.
            </p>
            {isLoadingSuggested ? (
              <div className="flex h-full w-full flex-grow items-center justify-center">
                <div className="-mt-10 flex items-center justify-center p-4">
                  <Loader2 className="animate-spin" />
                </div>
              </div>
            ) : filteredSuggestedAccounts &&
              filteredSuggestedAccounts.length > 0 ? (
              <div className="flex h-auto w-full flex-grow flex-col gap-y-2">
                {filteredSuggestedAccounts.map(
                  (discord: SuggestedDiscordChannel, index: number) => (
                    <div
                      key={discord.name + index}
                      className="flex h-[50px] w-full cursor-pointer items-center gap-x-3 rounded-[4px] bg-white/[4%] px-3 py-[10px] transition-all duration-200 ease-out hover:bg-white/[8%]"
                      onClick={() =>
                        handleAddSuggestedChannel({
                          name: discord.name,
                          image: discord.image,
                        })
                      }
                    >
                      <div className="relative aspect-square h-8 w-8 flex-shrink-0 cursor-pointer overflow-hidden rounded-full">
                        <Image
                          src={discord.image}
                          alt={`${discord.name} Image`}
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </div>

                      <div className="flex flex-grow flex-col justify-center overflow-hidden">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-x-0.5">
                            <p className="cursor-pointer text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                              {discord.name}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex w-4 flex-shrink-0 items-center justify-center">
                        <button
                          title="Add Account"
                          type="button"
                          className="flex h-4 w-4 items-center justify-center"
                          onClick={() =>
                            handleAddSuggestedChannel({
                              name: discord.name,
                              image: discord.image,
                            })
                          }
                          disabled={Boolean(
                            suggestedDiscordChannelDraft.find(
                              (a) => a.name === discord.name,
                            ),
                          )}
                        >
                          <div className="relative aspect-square h-4 w-4">
                            <Image
                              src={
                                Boolean(
                                  suggestedDiscordChannelDraft.find(
                                    (a) => a.name === discord.name,
                                  ),
                                )
                                  ? "/icons/pink-check.png"
                                  : "/icons/pink-plus.svg"
                              }
                              alt="Action Icon"
                              fill
                              quality={100}
                              className="object-contain"
                            />
                          </div>
                        </button>
                      </div>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <div className="flex h-[17vh] max-h-[30vh] w-full flex-grow items-center justify-center">
                <div className=" text-center text-sm text-foreground">
                  All suggested accounts added
                </div>
              </div>
            )}
          </OverlayScrollbarsComponent>
        </div>
      </div>
      <div className="grid grid-cols-1 justify-end gap-x-2 border-t border-border p-4 lg:grid-cols-2 xl:flex">
        <BaseButton
          variant="gray"
          onClick={() => {
            // If there are changes, trigger the close attempt which will show confirmation
            // The handleCloseAttempt is provided as a clickHandler on the closeComponent
            if (hasLocalChanges) {
              // We trigger close from parent component
              const closeButton = document.querySelector(
                "[data-trigger-confirmation]",
              ) as HTMLButtonElement;
              if (closeButton) closeButton.click();
            } else {
              // No changes, just close
              const closeButton = document.querySelector(
                "[data-close-add-ts]",
              ) as HTMLButtonElement;
              if (closeButton) closeButton.click();
            }
          }}
          className="hidden h-[32px] w-full lg:flex xl:w-[128px]"
        >
          <span className="inline-block whitespace-nowrap font-geistSemiBold text-sm">
            Cancel
          </span>
        </BaseButton>
        <BaseButton
          variant="primary"
          onClick={handleAddGroupSubmit}
          className="h-[32px] w-full xl:w-[128px]"
        >
          <span className="inline-block whitespace-nowrap font-geistSemiBold text-sm">
            Submit
          </span>
        </BaseButton>
      </div>
    </>
  );
};

// Main component with confirmation for closing dialog
const AddDiscordWithConfirmation = ({
  open,
  setOpen,
  trigger,
}: {
  trigger: React.ReactNode;
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const width = useWindowSizeStore((state) => state.width);
  const isDesktop = width && width >= 1280;

  // State to track changes in the dialog
  const [hasChanges, setHasChanges] = useState(false);
  // State to track if form submission is in progress
  const [isSubmitting, setIsSubmitting] = useState(false);
  const resetInputFnRef = useRef<() => void>(() => {});

  // Use our custom hook to handle confirmation dialog - now with isSubmitting
  const {
    isOpen: isDialogOpen,
    setIsOpen: setIsDialogOpen,
    isConfirmationOpen,
    setIsConfirmationOpen,
    onOpenChange,
    handleConfirmClose,
    handleCancelClose,
  } = useConfirmationDialog(
    hasChanges,
    () => {
      // Execute reset function first
      resetInputFnRef.current();
      // Then close dialog
      setIsDialogOpen(false);
    },
    isSubmitting, // Pass the submission state to prevent confirmation during submit
  );

  // Handle submission start
  const handleSubmitStart = useCallback(() => {
    setIsSubmitting(true);
  }, []);

  // Handle submission end
  const handleSubmitEnd = useCallback(() => {
    setIsSubmitting(false);
  }, []);

  // Callback to receive change notifications from child component
  const handleHasChangesUpdate = useCallback((newHasChanges: boolean) => {
    setHasChanges(newHasChanges);
  }, []);

  // Callback to receive resetInputs function from child
  const handleResetInputs = useCallback((resetFn: () => void) => {
    resetInputFnRef.current = resetFn;
  }, []);

  // Function to open confirmation dialog
  const triggerConfirmation = useCallback(() => {
    // Only show confirmation if there are changes AND we're not submitting
    if (hasChanges && !isSubmitting) {
      setIsConfirmationOpen(true);
    }
  }, [hasChanges, isSubmitting, setIsConfirmationOpen]);

  // Create wrapper for close button with confirmation if needed
  const createCloseButton = useCallback(
    (Component: React.ElementType) => {
      return (
        <>
          {/* Hidden button to trigger confirmation */}
          <button
            title="Confirmation"
            data-trigger-confirmation
            className="hidden"
            onClick={triggerConfirmation}
          />

          {/* Actual close button */}
          <Component data-close-add-ts asChild>
            <button
              title="Close"
              className="relative aspect-square h-6 w-6 flex-shrink-0 duration-300 hover:opacity-70"
              onClick={(e) => {
                // Only show confirmation if there are changes AND we're not submitting
                if (hasChanges && !isSubmitting) {
                  // If there are changes, prevent default close and show confirmation
                  e.preventDefault();
                  e.stopPropagation();
                  setIsConfirmationOpen(true);
                }
              }}
            >
              <Image
                src="/icons/close.png"
                alt="Close Icon"
                fill
                quality={100}
                className="object-contain"
                sizes="24px"
              />
            </button>
          </Component>
        </>
      );
    },
    [hasChanges, isSubmitting, setIsConfirmationOpen, triggerConfirmation],
  );

  if (isDesktop) {
    return (
      <>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild className="w-full">
            {trigger}
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={6}
            className={ADD_TS_POPOVER_CLASSNAME}
            avoidCollisions={true}
            collisionPadding={10}
          >
            <AddDiscordContent
              onHasChanges={handleHasChangesUpdate}
              onResetInputs={handleResetInputs}
              onSubmitStart={handleSubmitStart}
              onSubmitEnd={handleSubmitEnd}
              closeComponent={createCloseButton(PopoverClose)}
            />
          </PopoverContent>
        </Popover>

        {/* The confirmation dialog stays outside the Popover so it can render on top */}
        <ConfirmationDialog
          isOpen={isConfirmationOpen}
          onOpenChange={setIsConfirmationOpen}
          onConfirm={handleConfirmClose}
          onCancel={handleCancelClose}
          title="Discard Changes"
          message="You have unsaved changes. Are you sure you want to discard them?"
          confirmText="Yes, Discard"
          cancelText="No, Keep Editing"
        />
      </>
    );
  }

  return (
    <>
      <Drawer open={isDialogOpen} onOpenChange={onOpenChange}>
        <DrawerTrigger asChild className="w-full">
          <div>{trigger}</div>
        </DrawerTrigger>
        <DrawerHeader className="hidden">
          <DrawerTitle>Add Discord</DrawerTitle>
        </DrawerHeader>
        <DrawerContent className={cn(ADD_TS_POPOVER_CLASSNAME)}>
          <AddDiscordContent
            onHasChanges={handleHasChangesUpdate}
            onResetInputs={handleResetInputs}
            onSubmitStart={handleSubmitStart}
            onSubmitEnd={handleSubmitEnd}
            closeComponent={createCloseButton(DialogClose)}
          />
        </DrawerContent>
      </Drawer>

      {/* The confirmation dialog stays outside the Dialog so it can render on top */}
      <ConfirmationDialog
        isOpen={isConfirmationOpen}
        onOpenChange={setIsConfirmationOpen}
        onConfirm={handleConfirmClose}
        onCancel={handleCancelClose}
        title="Discard Changes"
        message="You have unsaved changes. Are you sure you want to discard them?"
        confirmText="Yes, Discard"
        cancelText="No, Keep Editing"
      />
    </>
  );
};

export default AddDiscordWithConfirmation;
