
import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      required: true,
      validate: {
        validator: function (participants) {
          return (
            participants.length === 2 &&
            !participants[0].equals(participants[1])
          );
        },
        message: "A conversation must have exactly two different participants",
      },
    },

    originalMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true,
      unique: true,
    },

    identityRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IdentityRequest",
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const Conversation = mongoose.model(
  "Conversation",
  conversationSchema
);

export default Conversation;
