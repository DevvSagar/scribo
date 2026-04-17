import express from "express";
import mongoose from "mongoose";
import Chat from "../models/Chat.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();
const MAX_CHAT_MESSAGE_LENGTH = 4000;

const buildChatResponse = (message) => {
  const trimmedMessage = message.trim();
  return `Saved message: "${trimmedMessage}". This is your simple demo response from Scribo.`;
};

router.post("/chat", authMiddleware, async (req, res) => {
  try {
    const message = typeof req.body?.message === "string" ? req.body.message : "";

    if (!message.trim()) {
      return res.status(400).json({ error: "Message is required." });
    }

    if (message.length > MAX_CHAT_MESSAGE_LENGTH) {
      return res.status(400).json({ error: "Message is too long." });
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

router.delete("/chats/:id", authMiddleware, async (req, res) => {
  try {
    const chatId = typeof req.params.id === "string" ? req.params.id.trim() : "";

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ error: "Chat id is invalid." });
    }

    const deletedChat = await Chat.findOneAndDelete({
      _id: chatId,
      userId: req.user._id,
    });

    if (!deletedChat) {
      return res.status(404).json({ error: "Chat not found." });
    }

    res.json({ message: "Chat deleted successfully." });
  } catch {
    res.status(500).json({ error: "Could not delete chat." });
  }
});

export default router;
