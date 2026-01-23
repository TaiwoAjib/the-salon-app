import { Request, Response } from 'express';
import { processMessage } from '../services/chatbotService';

export const chat = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const reply = await processMessage(message);
    res.json({ reply });
  } catch (error) {
    console.error("Chatbot Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
