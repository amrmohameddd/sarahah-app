
import User from "../../DB/models/usr.model.js";
import bcrypt from "bcrypt";
import {
  hashPassword,
  comparePassword,
} from "../../Utils/security/hash.security.js";
import jwt from "jsonwebtoken";
import { jwtConfig } from "../../Config/jwt.config.js";
import {
  randomInt,
  createHash,
  timingSafeEqual,
} from "node:crypto";
import { sendEmail } from "../../Utils/email.util.js";

const OTP_EXPIRATION = 5 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

const generateOtp = () => randomInt(100000, 1000000).toString();

const hashOtp = (otp) =>
  createHash("sha256").update(otp).digest("hex");

const verifyOtpHash = (otp, storedHash) => {
  if (!storedHash) return false;

  const suppliedHash = Buffer.from(hashOtp(otp), "hex");
  const savedHash = Buffer.from(storedHash, "hex");

  return (
    suppliedHash.length === savedHash.length &&
    timingSafeEqual(suppliedHash, savedHash)
  );
};

const createToken = (user) =>
  jwt.sign(
    { userId: user._id.toString() },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );

const getSafeUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
});

// Register
export const registerUser = async ({ username, email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    const error = new Error("Email already exists");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await hashPassword(password);

  return User.create({
    username,
    email: normalizedEmail,
    password: hashedPassword,
  });
};

// Login
export const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+password");

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (user.lockUntil && user.lockUntil > new Date()) {
    const error = new Error("Account locked for 5 minutes");
    error.statusCode = 423;
    throw error;
  }

  if (user.lockUntil && user.lockUntil <= new Date()) {
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
  }

  let isPasswordValid = false;

  if (user.password.startsWith("$argon2")) {
    isPasswordValid = await comparePassword(password, user.password);
  } else if (user.password.startsWith("$2")) {
    isPasswordValid = await bcrypt.compare(password, user.password);
  }

  if (!isPasswordValid) {
    user.failedLoginAttempts += 1;

    if (user.failedLoginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + OTP_EXPIRATION);
      await user.save();

      const error = new Error("Account locked for 5 minutes");
      error.statusCode = 423;
      throw error;
    }

    await user.save();

    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  user.failedLoginAttempts = 0;
  user.lockUntil = null;

  if (user.twoFactorEnabled) {
    const otp = generateOtp();

    user.loginOtpHash = hashOtp(otp);
    user.loginOtpExpiresAt = new Date(Date.now() + OTP_EXPIRATION);
    user.loginOtpAttempts = 0;

    await user.save();

    try {
      await sendEmail({
        to: user.email,
        subject: "Your Login Verification Code",
        text: `Your verification code is ${otp}. It expires in 5 minutes.`,
      });
    } catch (error) {
      user.loginOtpHash = undefined;
      user.loginOtpExpiresAt = null;
      user.loginOtpAttempts = 0;
      await user.save();
      throw error;
    }

    return {
      requiresTwoFactor: true,
      message: "Verification code sent to your email",
      user: getSafeUser(user),
    };
  }

  await user.save();

  return {
    requiresTwoFactor: false,
    token: createToken(user),
    user: getSafeUser(user),
  };
};

// Request 2FA setup OTP
export const requestTwoFactorSetup = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (user.twoFactorEnabled) {
    const error = new Error("Two-factor authentication is already enabled");
    error.statusCode = 400;
    throw error;
  }

  const otp = generateOtp();

  user.twoFactorSetupOtpHash = hashOtp(otp);
  user.twoFactorSetupOtpExpiresAt = new Date(Date.now() + OTP_EXPIRATION);
  user.twoFactorSetupOtpAttempts = 0;

  await user.save();

  try {
    await sendEmail({
      to: user.email,
      subject: "Enable Two-Factor Authentication",
      text: `Your verification code is ${otp}. It expires in 5 minutes.`,
    });
  } catch (error) {
    user.twoFactorSetupOtpHash = undefined;
    user.twoFactorSetupOtpExpiresAt = null;
    user.twoFactorSetupOtpAttempts = 0;
    await user.save();
    throw error;
  }

  return {
    message: "Verification code sent to your email",
  };
};

// Verify setup OTP
export const verifyTwoFactorSetup = async (userId, otp) => {
  const user = await User.findById(userId).select(
    "+twoFactorSetupOtpHash +twoFactorSetupOtpExpiresAt"
  );

  if (!user || !user.twoFactorSetupOtpHash) {
    const error = new Error("No pending verification request");
    error.statusCode = 400;
    throw error;
  }

  if (
    !user.twoFactorSetupOtpExpiresAt ||
    user.twoFactorSetupOtpExpiresAt < new Date()
  ) {
    user.twoFactorSetupOtpHash = undefined;
    user.twoFactorSetupOtpExpiresAt = null;
    user.twoFactorSetupOtpAttempts = 0;
    await user.save();

    const error = new Error("Verification code expired");
    error.statusCode = 400;
    throw error;
  }

  if (user.twoFactorSetupOtpAttempts >= MAX_OTP_ATTEMPTS) {
    user.twoFactorSetupOtpHash = undefined;
    user.twoFactorSetupOtpExpiresAt = null;
    user.twoFactorSetupOtpAttempts = 0;
    await user.save();

    const error = new Error("Too many attempts. Request a new code");
    error.statusCode = 429;
    throw error;
  }

  if (!verifyOtpHash(otp, user.twoFactorSetupOtpHash)) {
    user.twoFactorSetupOtpAttempts += 1;

    if (user.twoFactorSetupOtpAttempts >= MAX_OTP_ATTEMPTS) {
      user.twoFactorSetupOtpHash = undefined;
      user.twoFactorSetupOtpExpiresAt = null;
      user.twoFactorSetupOtpAttempts = 0;
      await user.save();

      const error = new Error("Too many attempts. Request a new code");
      error.statusCode = 429;
      throw error;
    }

    await user.save();

    const error = new Error("Invalid verification code");
    error.statusCode = 400;
    throw error;
  }

  user.twoFactorEnabled = true;
  user.twoFactorSetupOtpHash = undefined;
  user.twoFactorSetupOtpExpiresAt = null;
  user.twoFactorSetupOtpAttempts = 0;

  await user.save();

  return {
    message: "Two-factor authentication enabled successfully",
  };
};

// Confirm login OTP
export const confirmLoginOtp = async ({ email, otp }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+loginOtpHash +loginOtpExpiresAt +loginOtpAttempts");

  if (!user || !user.twoFactorEnabled || !user.loginOtpHash) {
    const error = new Error("Invalid verification request");
    error.statusCode = 401;
    throw error;
  }

  if (!user.loginOtpExpiresAt || user.loginOtpExpiresAt < new Date()) {
    user.loginOtpHash = undefined;
    user.loginOtpExpiresAt = null;
    user.loginOtpAttempts = 0;
    await user.save();

    const error = new Error("Verification code expired");
    error.statusCode = 400;
    throw error;
  }

  if (user.loginOtpAttempts >= MAX_OTP_ATTEMPTS) {
    user.loginOtpHash = undefined;
    user.loginOtpExpiresAt = null;
    user.loginOtpAttempts = 0;
    await user.save();

    const error = new Error("Too many attempts. Login again");
    error.statusCode = 429;
    throw error;
  }

  if (!verifyOtpHash(otp, user.loginOtpHash)) {
    user.loginOtpAttempts += 1;

    if (user.loginOtpAttempts >= MAX_OTP_ATTEMPTS) {
      user.loginOtpHash = undefined;
      user.loginOtpExpiresAt = null;
      user.loginOtpAttempts = 0;
      await user.save();

      const error = new Error("Too many attempts. Login again");
      error.statusCode = 429;
      throw error;
    }

    await user.save();

    const error = new Error("Invalid verification code");
    error.statusCode = 401;
    throw error;
  }

  user.loginOtpHash = undefined;
  user.loginOtpExpiresAt = null;
  user.loginOtpAttempts = 0;

  await user.save();

  return {
    token: createToken(user),
    user: getSafeUser(user),
  };
};
