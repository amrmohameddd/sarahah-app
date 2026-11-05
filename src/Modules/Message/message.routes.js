
import express from "express";

import {
  sendMessage,
  getMyMessagesController,
  markMessageAsReadController,
  deleteMessageController,
} from "./massage.controller.js";

import {
  requestIdentityController,
  getIdentityRequestsController,
  respondToIdentityRequestController,
} from "./identityRequest.controller.js";

import { authMiddleware } from "../../Middleware/auth.middleware.js";

const router = express.Router();

// Send an anonymous message
router.post("/send", authMiddleware, sendMessage);

// Get my received messages
router.get("/my", authMiddleware, getMyMessagesController);

// Request sender identity
router.post(
  "/:messageId/identity-request",
  authMiddleware,
  requestIdentityController
);

// Get identity requests received by the original sender
router.get(
  "/identity-requests",
  authMiddleware,
  getIdentityRequestsController
);

// Accept or reject an identity request
router.patch(
  "/identity-requests/:requestId/respond",
  authMiddleware,
  respondToIdentityRequestController
);

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
