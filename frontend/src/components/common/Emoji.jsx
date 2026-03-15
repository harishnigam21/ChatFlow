import EmojiPicker from "emoji-picker-react";
export default function Emoji({ setMessage, showPicker }) {
  const onEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };
  return (
    showPicker && (
      <div className="absolute left-2 bottom-0">
        <EmojiPicker onEmojiClick={onEmojiClick} />
      </div>
    )
  );
}
