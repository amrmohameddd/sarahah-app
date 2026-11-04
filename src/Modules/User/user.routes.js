
import express from "express";
import {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} from "./user.controller.js";

import { authMiddleware } from "../../Middleware/auth.middleware.js";

const router = express.Router();

// Get profile
router.get("/me", authMiddleware, getProfile);

// Update profile
router.patch("/me", authMiddleware, updateProfile);

// Change password
router.patch(
  "/me/password",
  authMiddleware,
  changePassword
);

// Delete account
router.delete("/me", authMiddleware, deleteAccount);

export default router;
