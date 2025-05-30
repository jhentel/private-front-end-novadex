"use client";

import { useState, useRef, useEffect } from "react";
import "emoji-picker-element";

const Picker: React.FC<{ onEmojiSelect?: (emoji: string) => void }> = ({
  onEmojiSelect,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !ref.current) return;

    const emojiPicker = ref.current as unknown as HTMLElement;

    const handleEmojiClick = (event: any) => {
      const emoji = event?.detail?.unicode;
      if (emoji && onEmojiSelect) {
        onEmojiSelect(emoji);
      }
    };

    emojiPicker.addEventListener("emoji-click", handleEmojiClick);
    (emojiPicker as any).skinToneEmoji = "👍";

    return () => {
      emojiPicker.removeEventListener("emoji-click", handleEmojiClick);
    };
  }, [onEmojiSelect, isClient]);

  if (!isClient) return null;

  // @ts-ignore
  return <emoji-picker ref={ref} className="dark"></emoji-picker>;
};
export default Picker;
