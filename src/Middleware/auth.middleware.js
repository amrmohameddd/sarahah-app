
import jwt from "jsonwebtoken";
import { jwtConfig } from "../Config/jwt.config.js";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access denied. Token is required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, jwtConfig.secret);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};
