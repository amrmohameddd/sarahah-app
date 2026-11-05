
import {
  sendConversationMessage,
  getConversationMessages,
} from "./conversation.service.js";

// Send a message inside a conversation
export const sendConversationMessageController = async (
  req,
  res,
  next
) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;

    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      });
    }

    if (content.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Message cannot exceed 2000 characters",
      });
    }

    const message = await sendConversationMessage({
      conversationId,
      senderId: req.user.userId,
      content: content.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

// Get conversation messages
export const getConversationMessagesController = async (
  req,
  res,
  next
) => {
  try {
    const { conversationId } = req.params;

    const messages = await getConversationMessages({
      conversationId,
      userId: req.user.userId,
    });

    return res.status(200).json({
      success: true,
      results: messages.length,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};
