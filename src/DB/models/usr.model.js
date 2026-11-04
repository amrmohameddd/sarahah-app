
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    // Failed login attempts
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },

    // Account lock expiration time
    lockUntil: {
      type: Date,
      default: null,
    },

    // Two-Factor Authentication
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },

    // OTP used to enable 2FA
    twoFactorSetupOtpHash: {
      type: String,
      select: false,
    },

    twoFactorSetupOtpExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },

    twoFactorSetupOtpAttempts: {
  type: Number,
  default: 0,
  select: false,
},

    // OTP used during login
    loginOtpHash: {
      type: String,
      select: false,
    },

    loginOtpExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },

    loginOtpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
