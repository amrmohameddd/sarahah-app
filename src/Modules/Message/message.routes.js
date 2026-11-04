
import express from "express";
import {
  sendMessage,
  getMyMessagesController,
  markMessageAsReadController,
  deleteMessageController,
} from "./massage.controller.js";

import { authMiddleware } from "../../Middleware/auth.middleware.js";

const router = express.Router();

// Send a message
router.post("/send", authMiddleware, sendMessage);

// Get my messages
router.get("/my", authMiddleware, getMyMessagesController);

// Mark a message as read
router.patch(
  "/:messageId/read",
  authMiddleware,
  markMessageAsReadController
);

// Delete one received message
router.delete(
  "/:messageId",
  authMiddleware,
  deleteMessageController
);

export default router;
