import { EmojiPicker } from "frimousse";

export default function NewEmojiPicker() {
  return (
    <EmojiPicker.Root>
      <EmojiPicker.Search />
      <EmojiPicker.Viewport>
        <EmojiPicker.Loading>Loading…</EmojiPicker.Loading>
        <EmojiPicker.Empty>No emoji found.</EmojiPicker.Empty>
        <EmojiPicker.List />
      </EmojiPicker.Viewport>
    </EmojiPicker.Root>
  );
}
