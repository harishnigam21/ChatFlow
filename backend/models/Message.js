import mongoose from "mongoose";
const messageSchema = mongoose.Schema(
  {
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    receiver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    message: {
      type: String,
    },
    image: {
      type: String,
      default: null,
    },
    thumbnail: {
      type: String,
      default: null,
    },
    seen: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);
messageSchema.index({ createdAt: 1 });
export default mongoose.model("messages", messageSchema);
