import FormData from "form-data";
import fetch from "node-fetch";

import {FaceEmotion, Message} from "@shared/schema";
import {PYTHON_BACKEND_URL} from "@shared/settings"

export interface PromptResponse {
  response: string,
  sentiment?: {
    neutral: number,
    confidenceNeutral: number,
    boredom: number,
    confidenceBoredom: number
    engagement: number,
    confidenceEngagement: number,
  }
  sentimentAggFaceEmotion?: string,
  confidenceAggFaceEmotion?: number,
  mergedSentiment?: string,
}

async function fetchData(
  sessionId: string,
  conversation: Message[],
  useEmotions: boolean,
  messageEmotions: FaceEmotion[],
): Promise<object | null> {
  // reduce conversation to content and role
  const conv = conversation.map(msg => {
    return {
      "content": msg.content,
      "role": msg.role
    }
  });

  // reduce face emotions
  const msgEmotions = messageEmotions.map(msgEmo => {
    return {
      "emotion": msgEmo.emotion,
      "confidence": msgEmo.confidence,
      "timestamp": msgEmo.timestamp,
    }
  })

  const req_url = `${PYTHON_BACKEND_URL}/tutor`
  try {
    const response = await fetch(req_url, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        conversation: conv,
        sessionId: sessionId,
        useEmotions: useEmotions,
        messageEmotions: msgEmotions
      }),
    });

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    return null;
  }
}

export async function fetchLLMResponse(
  sessionId: string,
  conversation: Message[],
  useEmotions: boolean,
  messageEmotions: FaceEmotion[],
): Promise<PromptResponse> {
  const result = await fetchData(sessionId, conversation, useEmotions, messageEmotions);

  if (!result) {
    return {
      response: "Failed to connect to the backend",
      sentiment: undefined
    }
  }

  const castResult = result as PromptResponse;

  return {
    response: castResult.response.trim(),
    sentiment: castResult.sentiment,
    sentimentAggFaceEmotion: castResult.sentimentAggFaceEmotion,
    confidenceAggFaceEmotion: castResult.confidenceAggFaceEmotion,
    mergedSentiment: castResult.mergedSentiment,
  };
}


export interface EmotionResponse{
  emotion: string,
  confidence: number
}

export const fetchFaceEmotion = async (file: Express.Multer.File) => {
  const form = new FormData();
  form.append("image", file.buffer, file.originalname);

  let result = null;
  try {
    const response = await fetch(`${PYTHON_BACKEND_URL}/faceEmotion`, {
      method: 'POST',
      body: form as any,
      headers: form.getHeaders(),
    });

    result = await response.json();
  } catch (error) {
    result = null;
  }

  if (!result) {
    return {
      response: "neutral",
      sentiment: 0.0
    }
  }

  const castResult = result as EmotionResponse;

  return {
    emotion: castResult.emotion,
    confidence: castResult.confidence,
  }
}