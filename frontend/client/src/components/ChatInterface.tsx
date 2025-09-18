import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/useToast.ts';
import WebcamInput from './WebcamInput';
import VoiceInput from './VoiceInput';
import TextInput from './TextInput';
import useEmotionWebcam, {FaceEmotionModel} from '@/hooks/useEmotionWebcam.ts';
import useVoiceRecognition from '@/hooks/useVoiceRecognition.ts';
import {Message, RoleSchema} from "@shared/schema.ts";
import {WebcamData} from "@/types";

interface ChatInterfaceProps {
  sessionId: string | null;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isLoading: boolean;
  enableWebcamInput: boolean;
  visualizeWebcamEmotion: boolean;
  enableVoiceInput: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  sessionId,
  messages,
  setMessages,
  isLoading,
  enableWebcamInput,
  visualizeWebcamEmotion,
  enableVoiceInput,
}) => {
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const lastMessageRef = useRef<HTMLDivElement | null>(null);

  // Get webcam and voice recognition hooks
  const webcam = useEmotionWebcam({
    emotionModel: FaceEmotionModel.faceApi
  });
  const voice = useVoiceRecognition();

  const sendFaceEmotion = useMutation({
    mutationFn: async (detectedEmotion: WebcamData) => {
      if (!sessionId) throw new Error('No active session');

      await apiRequest('POST', `/api/sessions/${sessionId}/faceEmotions`, {
        emotion: detectedEmotion.emotion,
        confidence: detectedEmotion.confidence,
      });
      return true;
    },
    onError: (error) => {
      console.error('Error sending face emotion:', error);
    }
  })

  // Send the detected emotion to the server on change
  useEffect(() => {
    if (webcam.detectedEmotion.changed) {
      sendFaceEmotion.mutate(webcam.detectedEmotion);
    }
  }, [webcam.detectedEmotion]);

  // Mutation for sending a message
  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      if (!sessionId) throw new Error('No active session');

      // Send the message to the server
      const response = await apiRequest('POST', `/api/sessions/${sessionId}/messages`, {
        content: content,
        role: RoleSchema.enum.student
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Update messages with both user message and AI response
      setMessages(prev => [
        ...prev,
        data.userMessage,
        data.aiResponse
      ]);

      setMessage('');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
      console.error('Error sending message:', error);
    }
  });

  // Handle form submission
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    await sendFaceEmotion.mutateAsync(webcam.detectedEmotion);  // always commit detected emotion even if it has not changed
    sendMessage.mutate(message);
  };

  // Update message state when voice transcription changes
  useEffect(() => {
    if (voice.isListening && voice.transcript) {
      setMessage(voice.transcript);
    }
  }, [voice.transcript, voice.isListening]);

  // Send message automatically when voice recognition is final
  useEffect(() => {
    if (voice.isListening && voice.voiceData.isFinal && voice.voiceData.transcript) {
      sendMessage.mutate(voice.voiceData.transcript);
      voice.stopListening();
    }
  }, [voice.voiceData.isFinal, voice.voiceData.transcript]);

  // Scroll to the last chat massage when messages change
  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col w-full">
      {/* Chat Messages Container */}
      <div className="flex-1 mb-4 overflow-y-auto">
          <div className="flex flex-col h-24 p-4 space-y-4">
            {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : (messages.map((msg, index) => (
                <div
                    key={index}
                    className={`chat-message ${msg.role === RoleSchema.enum.student ? 'user-message self-end' : 'ai-message self-start'}`}
                    ref={index === messages.length - 1 ? lastMessageRef : null}
                >
                  <div className="mb-1 font-bold text-sm opacity-75">
                    {msg.role === RoleSchema.enum.student ? 'You' : 'MathBuddy'}
                  </div>
                  <p className="whitespace-pre-line">{msg.content}</p>
                </div>
                ))
            )}
          </div>
      </div>


      {/* Inputs */}
      <div className="border-t border-neutral-300 flex flex-row gap-4 p-4">
        {/* Webcam & Voice Controls */}
        <div className="flex flex-row gap-4 h-32">
          {enableWebcamInput &&
              <div className="h-full">
                <WebcamInput
                    isWebcamActive={webcam.isWebcamActive}
                    videoRef={webcam.videoRef}
                    onToggleWebcam={webcam.toggleWebcam}
                    detectedEmotion={webcam.detectedEmotion}
                    visualizeEmotion={visualizeWebcamEmotion}
                    webcamError={webcam.webcamError}
                    webcamReady={webcam.webcamReady}
                />
              </div>
          }
          {enableVoiceInput &&
              <div className="flex-grow">
                <VoiceInput
                    isListening={voice.isListening}
                    onToggleListening={voice.toggleListening}
                    hasRecognitionSupport={voice.hasRecognitionSupport}
                />
              </div>
          }
        </div>

        <TextInput
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onSubmit={handleSendMessage}
            disabled={sendMessage.isPending}
            placeholder="Type your question here..."
        />
      </div>
    </div>
  );
};

export default ChatInterface;
