
import IdentityRequest from "../../DB/models/identityRequest.model.js";
import Message from "../../DB/models/message.model.js";
import Conversation from "../../DB/models/conversation.model.js";

// Request to reveal the sender's identity
export const requestIdentity = async ({ messageId, requesterId }) => {
  const message = await Message.findOne({
    _id: messageId,
    recipient: requesterId,
  }).select("+sender");

  if (!message) {
    const error = new Error("Message not found");
    error.statusCode = 404;
    throw error;
  }

  const existingRequest = await IdentityRequest.findOne({
    message: message._id,
  });

  if (existingRequest) {
    const error = new Error("An identity request already exists");
    error.statusCode = 409;
    throw error;
  }

  const identityRequest = await IdentityRequest.create({
    message: message._id,
    requester: requesterId,
    sender: message.sender,
  });

  return {
    id: identityRequest._id,
    message: identityRequest.message,
    status: identityRequest.status,
    createdAt: identityRequest.createdAt,
  };
};

// Get identity requests received by the original sender
export const getIdentityRequests = async (senderId) => {
  return await IdentityRequest.find({
    sender: senderId,
  })
    .populate("requester", "username")
    .populate("message", "content createdAt")
    .select("-sender")
    .sort({ createdAt: -1 });
};

// Create or get the conversation linked to an accepted request
const createOrGetConversation = async (identityRequest) => {
  return await Conversation.findOneAndUpdate(
    {
      originalMessage: identityRequest.message,
    },
    {
      $setOnInsert: {
        participants: [
          identityRequest.sender,
          identityRequest.requester,
        ],
        originalMessage: identityRequest.message,
        identityRequest: identityRequest._id,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );
};

// Accept or reject an identity request
export const respondToIdentityRequest = async ({
  requestId,
  senderId,
  decision,
}) => {
  if (!["accepted", "rejected"].includes(decision)) {
    const error = new Error("Decision must be accepted or rejected");
    error.statusCode = 400;
    throw error;
  }

  let identityRequest = await IdentityRequest.findOne({
    _id: requestId,
    sender: senderId,
  });

  if (!identityRequest) {
    const error = new Error("Identity request not found");
    error.statusCode = 404;
    throw error;
  }

  // Update only pending requests
  if (identityRequest.status === "pending") {
    const updatedRequest = await IdentityRequest.findOneAndUpdate(
      {
        _id: requestId,
        sender: senderId,
        status: "pending",
      },
      {
        status: decision,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (updatedRequest) {
      identityRequest = updatedRequest;
    } else {
      // Another request may have handled it at the same time
      identityRequest = await IdentityRequest.findOne({
        _id: requestId,
        sender: senderId,
      });
    }
  }

  if (!identityRequest || identityRequest.status !== decision) {
    const error = new Error(
      "Identity request has already been handled with a different decision"
    );
    error.statusCode = 409;
    throw error;
  }

  let conversation = null;

  if (decision === "accepted") {
    // Create the conversation only after acceptance
    conversation = await createOrGetConversation(identityRequest);

    // Reveal the sender's identity on the original message
    await Message.findByIdAndUpdate(identityRequest.message, {
      senderIdentityRevealed: true,
    });
  }

  return {
    id: identityRequest._id,
    message: identityRequest.message,
    status: identityRequest.status,
    conversationId: conversation?._id || null,
  };
};
