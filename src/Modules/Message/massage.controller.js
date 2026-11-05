
import {
  createMessage,
  getMyMessages,
  markMessageAsRead,
  deleteMessage,
} from "./massage.servies.js";

// Send an anonymous message
export const sendMessage = async (req, res) => {
  try {
    const { recipient, content } = req.body ?? {};

    if (
      typeof recipient !== "string" ||
      typeof content !== "string" ||
      !recipient.trim() ||
      !content.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Recipient and content are required",
      });
    }

    if (content.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Message cannot exceed 2000 characters",
      });
    }

    const message = await createMessage({
      sender: req.user.userId,
      recipient: recipient.trim(),
      content: content.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Anonymous message sent successfully",
      data: {
        id: message._id,
        recipient: message.recipient,
        content: message.content,
        isRead: message.isRead,
        createdAt: message.createdAt,
      },
    });
  } catch (error) {
    if (error.statusCode === 404 || error.statusCode === 400) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid recipient ID",
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};

// Get my received messages
export const getMyMessagesController = async (req, res) => {
  try {
    const messages = await getMyMessages(req.user.userId);

    return res.status(200).json({
      success: true,
      results: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
};

// Mark a message as read
export const markMessageAsReadController = async (req, res) => {
  try {
    const message = await markMessageAsRead(
      req.params.messageId,
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      message: "Message marked as read",
      data: message,
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID",
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark message as read",
    });
  }
};

// Delete one received message
export const deleteMessageController = async (req, res) => {
  try {
    await deleteMessage(req.params.messageId, req.user.userId);

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID",
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete message",
    });
  }
};
