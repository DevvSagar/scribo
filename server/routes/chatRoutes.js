import express from "express";
import Chat from "../models/Chat.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

const buildChatResponse = (message) => {
  const trimmedMessage = message.trim();
  return `Saved message: "${trimmedMessage}". This is your simple demo response from Scribo.`;
};

router.post("/chat", authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required." });
    }

    const response = buildChatResponse(message);

    const chat = await Chat.create({
      userId: req.user._id,
      type: "chat",
      message: message.trim(),
      response,
    });

    res.status(201).json(chat);
  } catch {
    res.status(500).json({ error: "Could not save chat." });
  }
});

router.get("/chats", authMiddleware, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(chats);
  } catch {
    res.status(500).json({ error: "Could not load chats." });
  }
});

export default router;
