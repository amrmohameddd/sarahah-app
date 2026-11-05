
import Message from "../../DB/models/message.model.js";
import User from "../../DB/models/usr.model.js";
import IdentityRequest from "../../DB/models/identityRequest.model.js";

// Send a new anonymous message
export const createMessage = async ({ sender, recipient, content }) => {
  const senderUser = await User.findById(sender);

  if (!senderUser) {
    const error = new Error("Sender not found");
    error.statusCode = 404;
    throw error;
  }

  const recipientUser = await User.findById(recipient);

  if (!recipientUser) {
    const error = new Error("Recipient not found");
    error.statusCode = 404;
    throw error;
  }

  if (senderUser._id.equals(recipientUser._id)) {
    const error = new Error("You cannot send a message to yourself");
    error.statusCode = 400;
    throw error;
  }

  const message = await Message.create({
    sender: senderUser._id,
    recipient: recipientUser._id,
    content: content.trim(),
  });

  return message;
};

// Get all messages received by a user
export const getMyMessages = async (userId) => {
  const messages = await Message.find({
    recipient: userId,
  })
    .select("+sender")
    .sort({ createdAt: -1 });

  const messageIds = messages.map((message) => message._id);

  // Find only identity requests accepted by the original sender
  const acceptedRequests = await IdentityRequest.find({
    message: { $in: messageIds },
    requester: userId,
    status: "accepted",
  }).select("message");

  const revealedMessageIds = new Set(
    acceptedRequests.map((request) => request.message.toString())
  );

  return messages.map((message) => {
    const messageData = message.toObject();

    const isIdentityRevealed = revealedMessageIds.has(
      message._id.toString()
    );

    if (!isIdentityRevealed) {
      delete messageData.sender;
    }

    return messageData;
  });
};

// Mark a message as read
export const markMessageAsRead = async (messageId, userId) => {
  const message = await Message.findOneAndUpdate(
    {
      _id: messageId,
      recipient: userId,
    },
    {
      isRead: true,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!message) {
    const error = new Error("Message not found");
    error.statusCode = 404;
    throw error;
  }

  return message;
};

// Delete all messages received by a user
export const deleteMessagesByRecipient = async (userId) => {
  return await Message.deleteMany({
    recipient: userId,
  });
};

// Delete one message received by the logged-in user
export const deleteMessage = async (messageId, userId) => {
  const message = await Message.findOneAndDelete({
    _id: messageId,
    recipient: userId,
  });

  if (!message) {
    const error = new Error("Message not found");
    error.statusCode = 404;
    throw error;
  }

  return true;
};
