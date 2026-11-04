
import User from "../../DB/models/usr.model.js";
import Message from "../../DB/models/message.model.js";
import {
  hashPassword,
  comparePassword,
} from "../../Utils/security/hash.security.js";
import bcrypt from "bcrypt";

// Get user by ID
export const getUserById = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

// Update profile
export const updateUserProfile = async (userId, username) => {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      username: username.trim(),
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

// Change password
export const changeUserPassword = async (
  userId,
  currentPassword,
  newPassword
) => {
  const user = await User.findById(userId).select("+password");

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  let isPasswordValid = false;

  if (user.password.startsWith("$argon2")) {
    isPasswordValid = await comparePassword(
      currentPassword,
      user.password
    );
  } else if (user.password.startsWith("$2")) {
    isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
  }

  if (!isPasswordValid) {
    const error = new Error("Current password is incorrect");
    error.statusCode = 401;
    throw error;
  }

  const samePassword = user.password.startsWith("$argon2")
    ? await comparePassword(newPassword, user.password)
    : await bcrypt.compare(newPassword, user.password);

  if (samePassword) {
    const error = new Error(
      "New password must be different from current password"
    );
    error.statusCode = 400;
    throw error;
  }

  user.password = await hashPassword(newPassword);
  await user.save();

  return true;
};

// Delete user account and received messages
export const deleteUserAccount = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  // Delete messages received by this user
  await Message.deleteMany({
    recipient: userId,
  });

  // Delete the user account
  await User.findByIdAndDelete(userId);

  return true;
};
