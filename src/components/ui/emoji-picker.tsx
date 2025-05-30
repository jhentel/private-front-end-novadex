"use client";

import {
  type EmojiPickerListCategoryHeaderProps,
  type EmojiPickerListEmojiProps,
  type EmojiPickerListRowProps,
  EmojiPicker as EmojiPickerPrimitive,
  type EmojiPickerRootProps,
} from "frimousse";
import type { CSSProperties, ComponentProps } from "react";
import { cn } from "@/libraries/utils";

interface EmojiPickerProps extends EmojiPickerRootProps {
  autoFocus?: boolean;
}

function SpinnerIcon(props: ComponentProps<"svg">) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Spinner</title>
      <path d="M3 10a7 7 0 0 1 7-7" />
    </svg>
  );
}

function EmojiPickerRow({
  children,
  className,
  ...props
}: EmojiPickerListRowProps) {
  return (
    <div
      {...props}
      className={cn(
        "scroll-my-[2vw] px-[2vw] md:scroll-my-1.5 md:px-1.5",
        className,
      )}
    >
      {children}
    </div>
  );
}

function EmojiPickerEmoji({
  emoji,
  className,
  style,
  ...props
}: EmojiPickerListEmojiProps) {
  return (
    <button
      {...props}
      className={cn(
        "data-[active]:bg-muted/80 relative flex aspect-square min-w-8 max-w-[calc(100%/var(--frimousse-list-columns))] flex-1 items-center justify-center overflow-hidden whitespace-nowrap rounded-[max(2vw,var(--radius-md))] text-[max(4vw,var(--text-lg))] transition-colors duration-200 ease-out hover:bg-white/[10%] data-[active]:duration-0 md:size-8 md:flex-none md:rounded-md md:text-lg",
        "before:-z-1 before:transition-discrete before:content-(--emoji) before:absolute before:inset-0 before:hidden before:items-center before:justify-center before:text-[2.5em] before:opacity-0 before:blur-lg before:saturate-200 before:transition-[display,opacity] before:duration-200 before:ease-out data-[active]:before:flex data-[active]:before:opacity-100 data-[active]:before:duration-0",
        className,
      )}
      style={
        {
          "--emoji": `"${emoji.emoji}"`,
          ...style,
        } as CSSProperties
      }
    >
      {emoji.emoji}
    </button>
  );
}

function EmojiPickerCategoryHeader({
  category,
  className,
  ...props
}: EmojiPickerListCategoryHeaderProps) {
  return (
    <div
      {...props}
      className={cn(
        "relative bg-background px-4 pb-1.5 pt-3 text-xs font-medium text-fontColorSecondary after:absolute after:inset-x-0 after:-top-1 after:h-2 after:bg-background md:px-3",
        className,
      )}
    >
      {category.label}
    </div>
  );
}

function EmojiPicker({
  className,
  autoFocus,
  columns,
  ...props
}: EmojiPickerProps) {
  const skinToneSelector = (
    <EmojiPickerPrimitive.SkinToneSelector
      className={cn(
        "data-[active]:bg-muted/80 relative flex aspect-square min-w-8 max-w-[500px] flex-1 items-center justify-center overflow-hidden whitespace-nowrap rounded-[8px] text-[max(4vw,var(--text-lg))] transition-colors duration-200 ease-out hover:bg-white/[10%] data-[active]:duration-0 md:size-8 md:flex-none md:rounded-md md:text-lg",
      )}
      title="Change skin tone"
      emoji="👋"
    />
  );

  return (
    <EmojiPickerPrimitive.Root
      className={cn(
        "isolate flex h-[calc(100%_-_var(--spacing)*8)] w-full flex-col border border-border md:h-[382px]",
        className,
      )}
      columns={columns}
      {...props}
    >
      <div className="relative z-10 flex flex-none items-center gap-2 p-4 pb-0 md:px-2 md:pt-2">
        <div className="relative flex-1">
          <EmojiPickerPrimitive.Search
            autoFocus={autoFocus}
            className="base__input__style flex h-8 w-full appearance-none rounded-[8px] border border-border bg-transparent px-3 py-1 text-sm text-fontColorPrimary shadow-md transition-colors file:border-0 file:bg-transparent file:font-medium file:text-neutral-950 placeholder:text-fontColorSecondary invalid:border-destructive invalid:bg-destructive/[4%]"
          />
        </div>
        <div className="ml-auto flex-none">{skinToneSelector}</div>
      </div>
      <EmojiPickerPrimitive.Viewport className="nova-scroller hide relative flex-1 outline-none">
        <EmojiPickerPrimitive.Loading className="text-muted-foreground absolute inset-0 flex items-center justify-center">
          <SpinnerIcon className="size-4 animate-spin" />
        </EmojiPickerPrimitive.Loading>
        <EmojiPickerPrimitive.Empty className="text-muted-foreground text-md absolute inset-0 flex items-center justify-center">
          No emoji found.
        </EmojiPickerPrimitive.Empty>
        <EmojiPickerPrimitive.List
          className="select-none pb-[2vw] md:pb-1.5"
          components={{
            Row: EmojiPickerRow,
            Emoji: EmojiPickerEmoji,
            CategoryHeader: EmojiPickerCategoryHeader,
          }}
        />
      </EmojiPickerPrimitive.Viewport>
      <div className="z-10 hidden w-full min-w-0 max-w-[500px] flex-none items-center gap-1 p-2 shadow-[0_-1px_--alpha(var(--color-neutral-200)/65%)] dark:shadow-[0_-1px_var(--color-neutral-800)] md:flex">
        <EmojiPickerPrimitive.ActiveEmoji>
          {({ emoji }) =>
            emoji ? (
              <>
                <div className="flex size-8 flex-none items-center justify-center text-xl">
                  {emoji.emoji}
                </div>
                <span className="text-secondary-foreground truncate text-xs font-medium">
                  {emoji.label}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground ml-2 truncate text-xs font-medium">
                Select an emoji…
              </span>
            )
          }
        </EmojiPickerPrimitive.ActiveEmoji>
      </div>
    </EmojiPickerPrimitive.Root>
  );
}

export { EmojiPicker };
