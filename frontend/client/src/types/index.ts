import {Emotion} from "@shared/schema.ts";

export interface WebcamData {
  emotion: Emotion;
  previousEmotion?: Emotion;
  changed: boolean;
  confidence: number;
}