import { pgTable, boolean, doublePrecision, integer, jsonb, serial, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";


// region schemas

export const message = pgTable("message", {
  id: serial("id").primaryKey(),
  sessionId: uuid("session_id").notNull(),
  content: text("content").notNull(),
  role: varchar("role", {"length": 10}).notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  visualization: jsonb("visualization"),
  sentimentEngagement: integer("sentimentEngagement"),
  confidenceEngagement: doublePrecision("confidenceEngagement"),
  sentimentNeutral: integer("sentimentNeutral"),
  confidenceNeutral: doublePrecision("confidenceNeutral"),
  sentimentBoredom: integer("sentimentBoredom"),
  confidenceBoredom: doublePrecision("confidenceBoredom"),
  sentimentAggFaceEmotion: varchar("sentimentAggFaceEmotion"),
  confidenceAggFaceEmotion: doublePrecision("confidenceAggFaceEmotion"),
  mergedSentiment: varchar("mergedSentiment"),
});

export const insertMessageSchema = createInsertSchema(message).pick({
  sessionId: true,
  content: true,
  role: true
});


export const faceEmotion = pgTable("faceEmotion", {
  id: serial("id"),
  sessionId: uuid("session_id").notNull(),
  emotion: varchar("emotion").notNull(),
  confidence: doublePrecision("confidence").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
})

export const insertFaceEmotionSchema = createInsertSchema(faceEmotion).pick({
  sessionId: true,
  emotion: true,
  confidence: true,
})


export const session = pgTable("session", {
  sessionId: uuid("sessionId").primaryKey().defaultRandom(),
  userId: integer("userId").notNull(),
  condition: integer("condition").notNull(),
  usesEmotion: boolean("usesEmotion").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  lastActive: timestamp("lastActive").notNull().defaultNow(),
});

export const insertSessionSchema = createInsertSchema(session).pick({
  userId: true,
  condition: true,
  usesEmotion: true,
});

// endregion

// region types

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof message.$inferSelect;

export type InsertFaceEmotion = z.infer<typeof insertFaceEmotionSchema>;
export type FaceEmotion = typeof faceEmotion.$inferSelect;

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof session.$inferSelect;

export const roleOptions: readonly [string, ...string[]] = ["student", "tutor", "dean", "system"] as const;
export const RoleSchema = z.enum(roleOptions);
export type Role = z.infer<typeof RoleSchema>;

export const emotionOptions: readonly [string, ...string[]] = ["angry", "bored", "confused", "contempt", "disgusted", "engaged", "fearful", "frustrated", "happy", "negative", "neutral", "positive", "sad", "surprised"] as const;
export const EmotionSchema = z.enum(emotionOptions);
export type Emotion = z.infer<typeof EmotionSchema>;

export const sentimentOptions: readonly [string, ...string[]] = ["positive", "negative", "neutral"] as const;
export const SentimentSchema = z.enum(sentimentOptions);
export type  Sentiment = z.infer<typeof SentimentSchema>;

// endregion