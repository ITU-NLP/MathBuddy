import {
  type FaceEmotion,
  type InsertFaceEmotion,
  type InsertMessage,
  type InsertSession,
  type Message,
  type Session
} from "@shared/schema.ts";

export interface IStorage {
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesBySessionId(sessionId: string): Promise<Message[]>;
  getLastMessageBySessionId(sessionId: string): Promise<Message | undefined>;

  createFaceEmotion(faceEmotion: InsertFaceEmotion): Promise<FaceEmotion>;
  getFaceEmotionsBySessionId(sessionId: string): Promise<FaceEmotion[]>;
  getFaceEmotionsBySessionIdSince(sessionId: string, start: Date): Promise<FaceEmotion[]>;

  createSession(insertSession: InsertSession): Promise<Session>;
  getSession(sessionId: string): Promise<Session | undefined>;
  getSessionCondition(sessionId: string): Promise<number | undefined>;
  isValidSession(sessionId: string): Promise<boolean>;
  updateSessionLastActive(sessionId: string): Promise<Session | undefined>;
  clearSessionMessages(sessionId: string): Promise<void>;
}

