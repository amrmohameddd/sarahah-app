
import {
  registerUser,
  loginUser,
  requestTwoFactorSetup,
  verifyTwoFactorSetup,
  confirmLoginOtp,
} from "./auth.service.js";

// Register
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body ?? {};

    if (
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const cleanUsername = username.trim();
    const cleanEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (cleanUsername.length < 3 || cleanUsername.length > 30) {
      return res.status(400).json({
        message: "Username must be between 3 and 30 characters",
      });
    }

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    const user = await registerUser({
      username: cleanUsername,
      email: cleanEmail,
      password,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    if (error.statusCode === 409 || error.code === 11000) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const cleanEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email",
      });
    }

    const result = await loginUser({
      email: cleanEmail,
      password,
    });

    if (result.requiresTwoFactor) {
      return res.status(200).json({
        message: result.message,
        requiresTwoFactor: true,
        user: result.user,
      });
    }

    return res.status(200).json({
      message: "Login successful",
      requiresTwoFactor: false,
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    if (error.statusCode === 401) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (error.statusCode === 423) {
      return res.status(423).json({
        message: error.message,
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Request 2FA setup OTP
export const enableTwoFactor = async (req, res) => {
  try {
    const result = await requestTwoFactorSetup(req.user.userId);

    return res.status(200).json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Failed to send verification email",
    });
  }
};

// Verify 2FA setup OTP
export const verifyTwoFactor = async (req, res) => {
  try {
    const { otp } = req.body ?? {};

    if (typeof otp !== "string" || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        message: "A valid 6-digit OTP is required",
      });
    }

    const result = await verifyTwoFactorSetup(req.user.userId, otp);

    return res.status(200).json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Failed to verify code",
    });
  }
};

// Confirm login OTP
export const confirmLogin = async (req, res) => {
  try {
    const { email, otp } = req.body ?? {};

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof otp !== "string" ||
      !/^\d{6}$/.test(otp)
    ) {
      return res.status(400).json({
        message: "Valid email and 6-digit OTP are required",
      });
    }

    const result = await confirmLoginOtp({
      email: email.trim(),
      otp,
    });

    return res.status(200).json({
      message: "Login successful",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Login verification failed",
    });
  }
};
