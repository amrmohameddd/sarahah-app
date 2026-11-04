
import User from "../../DB/models/usr.model.js";
import bcrypt from "bcrypt";
import {
  hashPassword,
  comparePassword,
} from "../../Utils/security/hash.security.js";
import jwt from "jsonwebtoken";
import { jwtConfig } from "../../Config/jwt.config.js";

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

  const user = await User.create({
    username,
    email: normalizedEmail,
    password: hashedPassword,
  });

  return user;
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

  let isPasswordValid = false;

  if (user.password.startsWith("$argon2")) {
    isPasswordValid = await comparePassword(
      password,
      user.password
    );
  } else if (user.password.startsWith("$2")) {
    isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );
  }

  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  // Generate JWT Token
  const token = jwt.sign(
    { userId: user._id.toString() },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );

  return {
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  };
};
