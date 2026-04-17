import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { AUTH_COOKIE_NAME } from "../utils/security.js";
import logger from "../utils/logger.js";

const loadUserFromToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return User.findById(decoded.userId).select("-password");
};

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.[AUTH_COOKIE_NAME];

    if (!token) {
      return res.status(401).json({ error: "Authentication is required." });
    }

    const user = await loadUserFromToken(token);

    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.warn("Authentication failed.", {
      path: req.originalUrl,
      method: req.method,
      message: error.message,
    });
    res.status(401).json({ error: "Invalid or expired token." });
  }
};

export const optionalAuthMiddleware = async (req, _res, next) => {
  try {
    const token = req.cookies?.[AUTH_COOKIE_NAME];

    if (!token) {
      next();
      return;
    }

    const user = await loadUserFromToken(token);

    if (user) {
      req.user = user;
    }
  } catch (error) {
    logger.warn("Optional authentication failed.", {
      path: req.originalUrl,
      method: req.method,
      message: error.message,
    });
  }

  next();
};

export default authMiddleware;
