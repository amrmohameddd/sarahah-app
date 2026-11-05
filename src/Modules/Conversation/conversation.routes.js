
import express from "express";

import {
  sendConversationMessageController,
  getConversationMessagesController,
} from "./conversation.controller.js";

import { authMiddleware } from "../../Middleware/auth.middleware.js";

const router = express.Router();

// Send a message inside a conversation
router.post(
  "/:conversationId/messages",
  authMiddleware,
  sendConversationMessageController
);

// Get messages inside a conversation
router.get(
  "/:conversationId/messages",
  authMiddleware,
  getConversationMessagesController
);

export default router;
