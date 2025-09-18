import {randomUUID} from "crypto";
import {IStorage} from "./storage";
import {SerialId} from "./serialId.ts";
import {FaceEmotion, type InsertFaceEmotion, InsertMessage, InsertSession, Message, Session} from "@shared/schema";

export class InMemStorage implements IStorage {
  protected messages: Map<number, Message>;
  protected faceEmotions: Map<number, FaceEmotion>
  protected sessions: Map<string, Session>;

  private currentMessageId: SerialId;
  private currentFaceEmotionId: SerialId;

  public constructor() {
    this.messages = new Map();
    this.faceEmotions = new Map();
    this.sessions = new Map();

    this.currentMessageId = new SerialId(1000);
    this.currentFaceEmotionId = new SerialId(1000);
  }

  // region message operations

  public async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId.next();
    const timestamp = new Date();
    const message: Message = {
      ...insertMessage,
      id,
      timestamp,
      visualization: null,
      sentimentEngagement: null,
      confidenceEngagement: null,
      sentimentNeutral: null,
      confidenceNeutral: null,
      sentimentBoredom: null,
      confidenceBoredom: null,
      sentimentAggFaceEmotion: null,
      confidenceAggFaceEmotion: null,
      mergedSentiment: null,
    };
    this.messages.set(id, message);
    return message;
  }

  public async getMessagesBySessionId(sessionId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.sessionId === sessionId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  public async getLastMessageBySessionId(sessionId: string): Promise<Message | undefined> {
    let result: Message | undefined = undefined;

    for (const message of this.messages.values()) {
      if (message.sessionId === sessionId && (!result || message.timestamp > result.timestamp)) {
        result = message;
      }
    }

    return result;
  }

  // endregion

  // region face emotion operations

  public async createFaceEmotion(insertFaceEmotion: InsertFaceEmotion): Promise<FaceEmotion> {
    const id = this.currentFaceEmotionId.next();
    const timestamp = new Date();
    const faceEmotion: FaceEmotion = {
      ...insertFaceEmotion,
      id,
      timestamp,
    }
    this.faceEmotions.set(id, faceEmotion);
    return faceEmotion;
  }

  public async getFaceEmotionsBySessionId(sessionId: string): Promise<FaceEmotion[]> {
    return Array.from(this.faceEmotions.values())
      .filter(faceEmotion => faceEmotion.sessionId === sessionId);
  }

  public async getFaceEmotionsBySessionIdSince(sessionId: string, start: Date): Promise<FaceEmotion[]> {
    return Array.from(this.faceEmotions.values())
      .filter(faceEmotion => faceEmotion.sessionId === sessionId && faceEmotion.timestamp >= start);

  }


  // endregion

  // region session operations

  public async createSession(insertSession: InsertSession): Promise<Session> {
    const sessionId = randomUUID();
    const createdAt = new Date();
    const lastActive = new Date();
    const session: Session = {...insertSession, sessionId, createdAt, lastActive};
    this.sessions.set(sessionId, session);
    return session;
  }

  public async getSession(sessionId: string): Promise<Session | undefined> {
    return this.sessions.get(sessionId);
  }

  public async getSessionCondition(sessionId: string): Promise<number | undefined> {
    return this.sessions.get(sessionId)?.condition;
  }

  public async isValidSession(sessionId: string): Promise<boolean> {
    return this.sessions.has(sessionId);
  }

  public async updateSessionLastActive(sessionId: string): Promise<Session | undefined> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActive = new Date();
      this.sessions.set(sessionId, session);
      return session;
    }
    return undefined;
  }

  public async clearSessionMessages(sessionId: string): Promise<void> {
    const messagesToDelete: number[] = [];

    this.messages.forEach((message, id) => {
      if (message.sessionId === sessionId) {
        messagesToDelete.push(id);
      }
    });

    messagesToDelete.forEach(id => {
      this.messages.delete(id);
    });
  }

  // endregion
}