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
import { useTSMonitorMessageStore } from "@/stores/footer/use-ts-monitor-message.store";
import cookies from "js-cookie";
import toast from "react-hot-toast";

// ######## APIs 🛜 ########
import {
  updateTSMonitorAccounts,
  getTSMonitorAccounts,
  getSuggestedTSAccounts,
  TSAccount,
} from "@/apis/rest/ts-monitor";

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

// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";

// ######## Types 🗨️ ########
import { SuggestedTSAccount } from "@/types/truth-social";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { ComboboxTS } from "@/components/customs/ComboboxTS";

const ADD_TS_POPOVER_CLASSNAME =
  "gb__white__popover flex flex-col gap-y-0 rounded-[8px] border border-border bg-card p-0 shadow-[0_0_20px_0_#000000] z-[9999] h-[85%] w-full";

interface AddTSContentProps {
  closeComponent: React.ReactNode;
  onHasChanges: (hasChanges: boolean) => void;
  onResetInputs: (resetFn: () => void) => void;
  onSubmitStart: () => void;
  onSubmitEnd: () => void;
}

export const AddTSContent: React.FC<AddTSContentProps> = ({
  closeComponent,
  onHasChanges,
  onResetInputs,
  onSubmitStart,
  onSubmitEnd,
}) => {
  const wsRef = useTSMonitorMessageStore((state) => state.websocketRef);
  const accounts = useTSMonitorMessageStore((state) => state.accounts);
  const setAccounts = useTSMonitorMessageStore((state) => state.setAccounts);

  // State to track changes
  const [hasLocalChanges, setHasLocalChanges] = useState(false);

  // Original state references
  const originalRegularAccountsRef = useRef<TSAccount[]>([]);
  const originalSuggestedAccountsRef = useRef<TSAccount[]>([]);

  const { isLoading: isLoadingAccounts } = useQuery({
    queryKey: ["ts-monitor-accounts"],
    queryFn: async () => {
      const res = await getTSMonitorAccounts();
      const accounts = res || [];
      setUserRegularAndSuggestedTSAccounts(accounts);

      const filledInputs = Array.from({ length: 5 }, () => ({
        name: "",
        username: "",
        profilePicture: "",
      }));

      accounts
        .filter((a) => a.type === "regular")
        ?.forEach((account, index) => {
          if (index < 5) {
            filledInputs[index] = { ...account };
          }
        });

      setRegularTSAccountInputs(filledInputs);

      // Save original state for change detection
      originalRegularAccountsRef.current = JSON.parse(
        JSON.stringify(filledInputs),
      );

      return accounts;
    },
  });

  const { data: suggestedAccounts, isLoading: isLoadingSuggested } = useQuery<
    SuggestedTSAccount[]
  >({
    queryKey: ["ts-suggested-accounts"],
    queryFn: getSuggestedTSAccounts,
  });

  const filteredSuggestedAccounts = useMemo(() => {
    if (!suggestedAccounts) return [];

    const selectedUsernames = new Set(
      accounts.map((account) => account.username.replace("@", "")),
    );

    // Filter suggested accounts that aren't already selected
    return suggestedAccounts.filter((account) => {
      // Remove @ if present for consistent comparison
      const username = account.username.replace("@", "");
      return !selectedUsernames.has(username);
    });
  }, [suggestedAccounts, accounts]);

  const [regularTSAccountInputs, setRegularTSAccountInputs] = useState<
    TSAccount[]
  >(
    Array(5).fill({
      name: "",
      username: "",
      profilePicture: "",
    }),
  );

  const [suggestedTSAccountsDraft, setSuggestedTSAccountsDraft] = useState<
    TSAccount[]
  >(accounts.filter((account) => account.type !== "regular"));

  // Save original suggested accounts for change detection
  useEffect(() => {
    originalSuggestedAccountsRef.current = JSON.parse(
      JSON.stringify(accounts.filter((account) => account.type !== "regular")),
    );
  }, [accounts]);

  // Check for changes whenever inputs change
  useEffect(() => {
    if (originalRegularAccountsRef.current.length > 0) {
      const regularAccountsChanged =
        JSON.stringify(regularTSAccountInputs) !==
        JSON.stringify(originalRegularAccountsRef.current);

      const suggestedAccountsChanged =
        JSON.stringify(suggestedTSAccountsDraft) !==
        JSON.stringify(originalSuggestedAccountsRef.current);

      const newHasChanges = regularAccountsChanged || suggestedAccountsChanged;
      setHasLocalChanges(newHasChanges);
      onHasChanges(newHasChanges);
    }
  }, [regularTSAccountInputs, suggestedTSAccountsDraft, onHasChanges]);

  const handleInputChange = (value: TSAccount, index: number) => {
    const newInputs = [...regularTSAccountInputs];

    // If username is empty, set the entire object to empty values
    if (!value.username.trim()) {
      newInputs[index] = {
        username: "",
        profilePicture: "",
        name: "",
        type: "regular", // Maintain the type
      };
    } else {
      newInputs[index] = {
        username: value.username,
        profilePicture: value.profilePicture,
        name: value.name,
        type: "regular", // Ensure type is consistently set
      };
    }

    setRegularTSAccountInputs(newInputs);
  };

  const getFilledInputsCount = () =>
    regularTSAccountInputs.filter((username) => username.username.trim() !== "")
      .length;

  const handleAddSuggestedAccount = (tsAccount: TSAccount) => {
    setSuggestedTSAccountsDraft([...suggestedTSAccountsDraft, tsAccount]);
  };

  const resetInputsToOriginal = useCallback(() => {
    // Reset regular accounts to original state
    setRegularTSAccountInputs(
      JSON.parse(JSON.stringify(originalRegularAccountsRef.current)),
    );

    // Reset suggested accounts to original state
    setSuggestedTSAccountsDraft(
      JSON.parse(JSON.stringify(originalSuggestedAccountsRef.current)),
    );

    setHasLocalChanges(false);
    onHasChanges(false);
  }, [onHasChanges]);

  // Expose resetInputs function to parent via prop
  useEffect(() => {
    onResetInputs(resetInputsToOriginal);
  }, [resetInputsToOriginal, onResetInputs]);

  const handleAddTSSubmit = async () => {
    // Signal we're starting submission
    onSubmitStart();

    // Combine both arrays
    const allTSAccounts = [
      ...regularTSAccountInputs.filter(
        (account) => account.username && account.username.trim() !== "",
      ),
      ...suggestedTSAccountsDraft,
    ];

    if (allTSAccounts.length === 0) {
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

    try {
      const result = await updateTSMonitorAccounts({
        accounts: allTSAccounts.map((account) => ({
          name: account.name,
          username: account.username,
          profilePicture: account.profilePicture,
          type: account.type,
        })),
      });

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
        setAccounts(allTSAccounts);
        const currentAccounts = accounts.map((acc) =>
          acc.username.replace("@", ""),
        );
        const newAccounts = allTSAccounts.map((acc) =>
          acc.username.replace("@", ""),
        );

        handleSendMessage(
          allTSAccounts.filter((a) => !currentAccounts.includes(a.username)),
          accounts.filter((a) => !newAccounts.includes(a.username)),
        );
      }

      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message={`${allTSAccounts.length} Truth Social Accounts Updated`}
        />
      ));

      // Update original state references after successful submission
      originalRegularAccountsRef.current = JSON.parse(
        JSON.stringify(regularTSAccountInputs),
      );
      originalSuggestedAccountsRef.current = JSON.parse(
        JSON.stringify(suggestedTSAccountsDraft),
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
          message="Failed to update Truth Social accounts"
        />
      ));
    } finally {
      onSubmitEnd(); // Signal submission has ended regardless of outcome
    }
  };

  const handleSendMessage = async (
    newList: TSAccount[],
    removedList: TSAccount[],
  ) => {
    if (wsRef) {
      if (newList.length > 0) {
        const subscriptionMessage = {
          action: "subscribe",
          licenseKey: cookies.get("_truthsocial_api_key"),
          usernames: [...newList.map((acc) => acc.username)],
        };

        wsRef.send(JSON.stringify(subscriptionMessage));
      }
      if (removedList.length > 0) {
        const unsubscriptionMessage = {
          action: "unsubscribe",
          licenseKey: cookies.get("_truthsocial_api_key"),
          usernames: [...removedList.map((acc) => acc.username)],
        };

        wsRef.send(JSON.stringify(unsubscriptionMessage));
      }
    }
  };

  const [
    userRegularAndSuggestedTSAccounts,
    setUserRegularAndSuggestedTSAccounts,
  ] = useState<TSAccount[]>([]);

  return (
    <>
      <div className="flex h-[56px] w-full items-center justify-between border-b border-border p-4">
        <h4 className="text-nowrap font-geistSemiBold text-lg text-fontColorPrimary">
          Add Truth Social
        </h4>
        {closeComponent}
      </div>
      <div className="grid w-full overflow-hidden xl:h-[290px] xl:grid-cols-2">
        <div className="flex flex-grow flex-col border-border max-xl:border-b xl:h-full xl:border-r">
          <OverlayScrollbarsComponent
            defer
            element="div"
            className="flex h-[290px] w-full flex-grow flex-col p-4"
          >
            <h1 className="mb-[5px] flex w-fit items-center justify-center font-geistSemiBold text-[14px] leading-3 text-white">
              <div className="relative mr-1 inline-block size-4">
                <Image
                  src="/icons/social/suggested-badge-red.svg"
                  alt="Star Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </div>
              Suggested Accounts
            </h1>
            <p className="mb-[12px] w-full max-w-[275px] font-geistLight text-[12px] leading-tight text-foreground">
              Manage your accounts in the &apos;Manage Account&apos; tab below
              the &apos;Add Account&apos; button.
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
                  (account: SuggestedTSAccount, index: number) => (
                    <div
                      key={account.username + index}
                      className="flex h-[50px] w-full items-center gap-x-3 rounded-[4px] bg-white/[4%] px-3 py-[10px] transition-all duration-200 ease-out hover:bg-white/[8%]"
                    >
                      <div
                        className="relative aspect-square h-8 w-8 flex-shrink-0 cursor-pointer overflow-hidden rounded-full"
                        onClick={() =>
                          window.open(
                            `https://truthsocial.com/${account.username}`,
                            "_blank",
                          )
                        }
                      >
                        <Image
                          src={account.profilePicture}
                          alt={`${account.name} Image`}
                          fill
                          quality={100}
                          className="object-contain"
                          unoptimized
                        />
                      </div>

                      <div className="flex flex-grow flex-col justify-center overflow-hidden">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-x-0.5">
                            <h4
                              className="cursor-pointer text-nowrap font-geistSemiBold text-xs text-fontColorPrimary"
                              onClick={() =>
                                window.open(
                                  `https://truthsocial.com/${account.username}`,
                                  "_blank",
                                )
                              }
                            >
                              {account.name}
                            </h4>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="relative inline-block size-3 flex-shrink-0">
                                    <Image
                                      src="/icons/social/suggested-badge-red.svg"
                                      alt="Star Icon"
                                      fill
                                      quality={100}
                                      className="object-contain"
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent
                                  className="z-[9999] bg-[#202037] px-2 py-1 font-geistRegular text-xs font-normal"
                                  style={
                                    {
                                      "--tooltip-arrow-color": "#202037",
                                      boxShadow:
                                        "0px 4px 16px 0px rgba(0, 0, 0, 1)",
                                    } as React.CSSProperties
                                  }
                                >
                                  <p>Suggested</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>

                          <h5
                            className="cursor-pointer truncate font-geistLight text-[10px] text-foreground"
                            onClick={() =>
                              window.open(
                                `https://truthsocial.com/${account.username}`,
                                "_blank",
                              )
                            }
                          >
                            {account.username}
                          </h5>
                        </div>
                      </div>

                      <div className="flex w-4 flex-shrink-0 items-center justify-center">
                        <button
                          title="Add Account"
                          type="button"
                          className="flex h-4 w-4 items-center justify-center"
                          onClick={() =>
                            handleAddSuggestedAccount({
                              name: account.name,
                              username: account.username.replace("@", ""),
                              profilePicture: account.profilePicture,
                              type: "suggested",
                            })
                          }
                          disabled={Boolean(
                            suggestedTSAccountsDraft.find(
                              (a) =>
                                a.username ===
                                account.username.replace("@", ""),
                            ),
                          )}
                        >
                          <div className="relative aspect-square h-4 w-4">
                            <Image
                              src={
                                Boolean(
                                  suggestedTSAccountsDraft.find(
                                    (a) =>
                                      a.username ===
                                      account.username.replace("@", ""),
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
              <div className="flex h-full w-full flex-grow items-center justify-center">
                <div className="-mt-16 text-center text-sm text-foreground">
                  All suggested accounts added
                </div>
              </div>
            )}
          </OverlayScrollbarsComponent>
        </div>
        <div className="flex h-full flex-col p-4 xl:h-full">
          <h1 className="mb-[5px] flex w-full items-center justify-between font-geistSemiBold text-white">
            <span className="flex w-fit items-center justify-center text-[14px]">
              <div className="relative mr-1 inline-block size-4">
                <Image
                  src="/icons/social/truthsocial.svg"
                  alt="TS Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </div>
              Regular Accounts
            </span>
            <span className="ml-auto h-fit text-[10px]">
              <span className="font-geistSemiBold text-primary">
                {getFilledInputsCount()}/5
              </span>
              <span className="ml-1 font-geistLight text-foreground">
                account added
              </span>
            </span>
          </h1>
          <p className="mb-[12px] font-geistLight text-[12px] leading-3 text-foreground">
            Add up to 5 accounts to manage.
          </p>
          <div className="flex h-full flex-col items-center justify-center gap-y-[12px]">
            {isLoadingAccounts &&
            userRegularAndSuggestedTSAccounts.length === 0 ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="animate-spin" />
              </div>
            ) : (
              regularTSAccountInputs.map((username, index) => (
                <ComboboxTS
                  key={index}
                  id={`account-input-combobox-${index}`}
                  onChange={(value) => handleInputChange(value, index)}
                  value={username.username || ""}
                />
              ))
            )}
          </div>
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
          onClick={handleAddTSSubmit}
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
const AddTSWithConfirmation = ({
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
          >
            <AddTSContent
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
          <DrawerTitle>Add TS Account</DrawerTitle>
        </DrawerHeader>
        <DrawerContent className={cn(ADD_TS_POPOVER_CLASSNAME)}>
          <AddTSContent
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

export default AddTSWithConfirmation;
