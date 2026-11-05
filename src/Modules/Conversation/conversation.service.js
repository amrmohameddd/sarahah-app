
import Conversation from "../../DB/models/conversation.model.js";
import ConversationMessage from "../../DB/models/conversationMessage.model.js";

// Send a message inside a conversation
export const sendConversationMessage = async ({
  conversationId,
  senderId,
  content,
}) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: senderId,
  });

  if (!conversation) {
    const error = new Error("Conversation not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  const message = await ConversationMessage.create({
    conversation: conversation._id,
    sender: senderId,
    content: content.trim(),
  });

  return message;
};

// Get messages inside a conversation
export const getConversationMessages = async ({
  conversationId,
  userId,
}) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  });

  if (!conversation) {
    const error = new Error("Conversation not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  return await ConversationMessage.find({
    conversation: conversation._id,
  })
    .populate("sender", "username")
    .sort({ createdAt: 1 });
};
