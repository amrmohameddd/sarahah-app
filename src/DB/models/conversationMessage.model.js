
import mongoose from "mongoose";

const conversationMessageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
      minlength: [1, "Message cannot be empty"],
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },
  },
  { timestamps: true }
);

const ConversationMessage = mongoose.model(
  "ConversationMessage",
  conversationMessageSchema
);

export default ConversationMessage;
