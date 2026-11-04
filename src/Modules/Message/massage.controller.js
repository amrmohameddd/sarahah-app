
import {
  createMessage,
  getMyMessages,
  markMessageAsRead,
  deleteMessage,
} from "./massage.servies.js";

// Send a message
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
        message: "Recipient and content are required",
      });
    }

    const message = await createMessage({
      recipient: recipient.trim(),
      content: content.trim(),
    });

    // Return only the required message fields
    return res.status(201).json({
      message: "Message sent successfully",
      data: {
        id: message._id,
        recipient: message.recipient,
        content: message.content,
        isRead: message.isRead,
        createdAt: message.createdAt,
      },
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        message: "Recipient not found",
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid recipient ID",
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Failed to send message",
    });
  }
};

// Get my messages
export const getMyMessagesController = async (req, res) => {
  try {
    const messages = await getMyMessages(req.user.userId);

    return res.status(200).json({
      message: "Messages fetched successfully",
      data: messages,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
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
      message: "Message marked as read",
      data: message,
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid message ID",
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Failed to mark message as read",
    });
  }
};

// Delete one received message
export const deleteMessageController = async (req, res) => {
  try {
    await deleteMessage(
      req.params.messageId,
      req.user.userId
    );

    return res.status(200).json({
      message: "Message deleted successfully",
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid message ID",
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Failed to delete message",
    });
  }
};
