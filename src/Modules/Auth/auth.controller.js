
import {
  registerUser,
  loginUser,
} from "./auth.service.js";

// Register
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body ?? {};

    // 1. Check required fields
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

    // 2. Validate username
    if (cleanUsername.length < 3 || cleanUsername.length > 30) {
      return res.status(400).json({
        message: "Username must be between 3 and 30 characters",
      });
    }

    // 3. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email",
      });
    }

    // 4. Validate password length
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    // 5. Call service
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

    // 1. Check required fields
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

    // 2. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email",
      });
    }

    // 3. Call service
    const result = await loginUser({
      email: cleanEmail,
      password,
    });

    return res.status(200).json({
      message: "Login successful",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    if (error.statusCode === 401) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
