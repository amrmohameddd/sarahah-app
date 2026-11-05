
import mongoose from "mongoose";

const identityRequestSchema = new mongoose.Schema(
  {
    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true,
    },

    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Prevent duplicate requests for the same message
identityRequestSchema.index(
  { message: 1, requester: 1 },
  { unique: true }
);

const IdentityRequest = mongoose.model(
  "IdentityRequest",
  identityRequestSchema
);

export default IdentityRequest;
