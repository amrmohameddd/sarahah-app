
import Message from "../../DB/models/message.model.js";
import User from "../../DB/models/usr.model.js";

// Send a new message
export const createMessage = async ({ recipient, content }) => {
  const user = await User.findById(recipient);

  if (!user) {
    const error = new Error("Recipient not found");
    error.statusCode = 404;
    throw error;
  }

  const message = await Message.create({
    recipient: user._id,
    content: content.trim(),
  });

  return message;
};

// Get all messages received by a user
export const getMyMessages = async (userId) => {
  return await Message.find({
    recipient: userId,
  }).sort({ createdAt: -1 });
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
