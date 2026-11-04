
import {
  getUserById,
  updateUserProfile,
  changeUserPassword,
  deleteUserAccount,
} from "./user.servies.js";

// Get profile
export const getProfile = async (req, res) => {
  try {
    const user = await getUserById(req.user.userId);

    return res.status(200).json({
      message: "User fetched successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Update profile
export const updateProfile = async (req, res) => {
  try {
    const { username } = req.body ?? {};

    if (
      typeof username !== "string" ||
      !username.trim()
    ) {
      return res.status(400).json({
        message: "Username is required",
      });
    }

    if (
      username.trim().length < 3 ||
      username.trim().length > 30
    ) {
      return res.status(400).json({
        message: "Username must be between 3 and 30 characters",
      });
    }

    const user = await updateUserProfile(
      req.user.userId,
      username
    );

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body ?? {};

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      !currentPassword ||
      !newPassword
    ) {
      return res.status(400).json({
        message: "Current and new passwords are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "New password must be at least 8 characters",
      });
    }

    await changeUserPassword(
      req.user.userId,
      currentPassword,
      newPassword
    );

    return res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    if (error.statusCode === 401) {
      return res.status(401).json({
        message: "Current password is incorrect",
      });
    }

    if (error.statusCode === 404) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (error.statusCode === 400) {
      return res.status(400).json({
        message: error.message,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Delete account
export const deleteAccount = async (req, res) => {
  try {
    await deleteUserAccount(req.user.userId);

    return res.status(200).json({
      message: "Account deleted successfully",
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};