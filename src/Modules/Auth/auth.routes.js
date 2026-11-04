
import express from "express";

import {
  register,
  login,
  enableTwoFactor,
  verifyTwoFactor,
  confirmLogin,
} from "./auth.controller.js";

import { authMiddleware } from "../../Middleware/auth.middleware.js";

const router = express.Router();

// Authentication
router.post("/register", register);
router.post("/login", login);

// Two-Factor Authentication
router.post("/2fa/enable", authMiddleware, enableTwoFactor);
router.post("/2fa/verify", authMiddleware, verifyTwoFactor);

// Login OTP confirmation
router.post("/login/confirm", confirmLogin);

export default router;
