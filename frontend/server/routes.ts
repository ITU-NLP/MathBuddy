import type {Express, NextFunction, Request, Response} from "express";
import multer from "multer";
import {createServer, type Server} from "http";
import {z} from "zod";

import {storage} from "./globals.ts";
import {fetchFaceEmotion, fetchLLMResponse} from "./requests";
import {
  insertFaceEmotionSchema,
  InsertMessage,
  insertMessageSchema,
  insertSessionSchema,
  RoleSchema, Session
} from "@shared/schema";
import {getProblemStatement} from "./problems.ts";


const INVALID_SESSION_MESSAGE: string = "Missing or invalid session ID" as const;
const REQUIRED_SESSION_KEYS: readonly string[] = ["userId", "usesEmotion"] as const;

declare global {
  namespace Express {
    interface Request {
      sessionId: string;
    }
  }
}

async function validateSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  const sessionId = req.params.sessionId || req.query.sessionId || req.body.sessionId;

  if (!sessionId || !await storage.isValidSession(sessionId)) {
    res.status(401).json({ error: INVALID_SESSION_MESSAGE });
    return;
  }
  await storage.updateSessionLastActive(sessionId);
  req.sessionId = sessionId;
  next();
}




export async function registerRoutes(app: Express): Promise<Server> {
  const upload = multer({ storage: multer.memoryStorage() });

  // create a new session
  app.post("/api/sessions", async (req, res) => {
    try {
      const messageData = req.body;

      if (!REQUIRED_SESSION_KEYS.every(key => key in messageData)) {
        return res
            .status(400)
            .json({ message: `Missing one or more of the required fields ${REQUIRED_SESSION_KEYS}`})
      }

      const parsedData = insertSessionSchema.parse(messageData);
      const session = await storage.createSession(parsedData);
      const welcomeMessage = getProblemStatement(session);
      await storage.createMessage(welcomeMessage);

      return res.status(201).json({ sessionId: session.sessionId });
    } catch (error) {
      /// console.error("Error creating session:", error);
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid session data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create session" });
    }
  });

  // get messages for a session
  app.get("/api/sessions/:sessionId/messages", validateSession, async (req: Request, res) => {
    try {
      const sessionId = req.sessionId;
      const messages = await storage.getMessagesBySessionId(sessionId);
      return res.status(200).json(messages);
    } catch (error) {
      /// console.error("Error getting messages:", error);
      return res.status(500).json({ message: "Failed to retrieve messages" });
    }
  });

  // post a message to a session
  app.post("/api/sessions/:sessionId/messages", validateSession, async (req, res) => {
    try {
      const sessionId = req.sessionId;
      const messageData = req.body;
      const parsedData = insertMessageSchema.parse({
        ...messageData,
        sessionId,
      });

      const message = await storage.createMessage(parsedData);

      if (message.role === RoleSchema.enum.student) {
        // get all messages of the session
        const conversation = await storage.getMessagesBySessionId(sessionId);
        const previousMessage = conversation[conversation.length - 2];
        const condition = await storage.getSessionCondition(sessionId)
        const usesEmotions = condition !== 0;
        const msgEmotions = await storage.getFaceEmotionsBySessionIdSince(sessionId, previousMessage.timestamp)

        // fetch tutor response
        const promptResponse = await fetchLLMResponse(sessionId, conversation, usesEmotions, msgEmotions);

        if (promptResponse.sentiment) {
          const sentiment = promptResponse.sentiment;
          message.sentimentEngagement = sentiment.engagement;
          message.confidenceEngagement = sentiment.confidenceEngagement;
          message.sentimentNeutral = sentiment.neutral;
          message.confidenceNeutral = sentiment.confidenceNeutral;
          message.sentimentBoredom = sentiment.boredom;
          message.confidenceBoredom = sentiment.confidenceBoredom;
        }

        if (promptResponse.sentimentAggFaceEmotion && promptResponse.confidenceAggFaceEmotion) {
          message.sentimentAggFaceEmotion = promptResponse.sentimentAggFaceEmotion;
          message.confidenceAggFaceEmotion = promptResponse.confidenceAggFaceEmotion;
        }

        if (promptResponse.mergedSentiment) {
          message.mergedSentiment = promptResponse.mergedSentiment;
        }

        // add response to conversation
        const aiResponse = await storage.createMessage({
          sessionId,
          content: promptResponse.response,
          role: RoleSchema.enum.tutor
        });

        return res.status(201).json({
          userMessage: message,
          aiResponse,
        });
      }

      return res.status(201).json(message);
    } catch (error) {
      /// console.error("Error sending message:", error);
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid message data", errors: error.errors });
      }
      return res.status(500).json({ message: `Failed to send message: ${error}` });
    }
  });

  // delete chat
  app.delete("/api/sessions/:sessionId/messages", validateSession, async (req, res) => {
    try {
      const sessionId = req.sessionId;

      const session = await storage.getMessagesBySessionId(sessionId);

      if (!session) {
        await storage.clearSessionMessages(sessionId);
      }

      return res.status(200).json({ message: "Chat successfully deleted" });
    } catch (error) {
      /// console.error("Error resetting chat:", error);
      return res.status(500).json({ message: "Failed to reset chat" });
    }
  });

  // create a new face emotion
  app.post("/api/sessions/:sessionId/faceEmotions", validateSession, async (req, res) => {
    try {
      const sessionId = req.sessionId;
      const faceEmotionData = req.body;
      const parsedData = insertFaceEmotionSchema.parse({
        ...faceEmotionData,
        sessionId,
      });

      const faceEmotion = await storage.createFaceEmotion(parsedData);
      return res.status(201).json(faceEmotion);
    } catch (error) {
      /// console.error("Error sending face emotion:", error);
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid face emotion data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to send face emotion" });
    }
  });

  // fetch face emotion
  app.post("/api/emotion/face", upload.single("image"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const file = req.file;
    const faceEmotion = await fetchFaceEmotion(file);
    return res.status(201).json({
      emotion: faceEmotion.emotion,
      confidence: faceEmotion.confidence,
    })

  });

  return createServer(app);
}
