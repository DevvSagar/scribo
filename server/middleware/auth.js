import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { AUTH_COOKIE_NAME, parseCookies } from "../utils/security.js";

const authMiddleware = async (req, res, next) => {
  try {
    const cookies = parseCookies(req.headers.cookie || "");
    const token = cookies[AUTH_COOKIE_NAME];

    console.log(
      `[auth] reading cookie token for ${req.method} ${req.originalUrl}: ${token ? "found" : "missing"}`,
    );

    if (!token) {
      return res.status(401).json({ error: "Authentication is required." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token." });
  }
};

export default authMiddleware;
