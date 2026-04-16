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
    media: [
      {
        url: {
          type: String,
        },
        thumbnail: {
          type: String,
        },
        public_id: {
          type: String,
        },
        type: {
          type: String,
        },
        name: {
          type: String,
        },
        lastModified: {
          type: Number,
        },
        size: { type: Number },
        tag: { type: String },
      },
    ],
    seen: {
      type: Boolean,
      default: false,
    },
    deletedFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],
    deletedForEveryone: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);
messageSchema.index({ createdAt: 1 });
export default mongoose.model("messages", messageSchema);
