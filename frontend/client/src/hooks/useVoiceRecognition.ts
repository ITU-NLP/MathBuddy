import { useState, useEffect, useCallback } from 'react';
import { VoiceData } from '@/types';

// Define window with SpeechRecognition
interface WindowWithSpeechRecognition extends Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}

const windowWithSpeech = window as unknown as WindowWithSpeechRecognition;

// Get SpeechRecognition constructor (handle browser differences)
const SpeechRecognition = 
  windowWithSpeech.SpeechRecognition || 
  windowWithSpeech.webkitSpeechRecognition;

export const useVoiceRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [voiceData, setVoiceData] = useState<VoiceData>({
    transcript: '',
    confidence: 0,
    isFinal: false
  });
  const [hasRecognitionSupport, setHasRecognitionSupport] = useState(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  
  // Reference to speech recognition instance
  const [recognition, setRecognition] = useState<any>(null);

  // Check for browser support on mount
  useEffect(() => {
    if (SpeechRecognition) {
      setHasRecognitionSupport(true);
      const recognitionInstance = new SpeechRecognition();
      
      // Configure recognition
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      
      // Set up handlers
      recognitionInstance.onresult = (event: any) => {
        const resultIndex = event.resultIndex;
        const transcript = event.results[resultIndex][0].transcript;
        const confidence = event.results[resultIndex][0].confidence;
        const isFinal = event.results[resultIndex].isFinal;
        
        setVoiceData({
          transcript,
          confidence,
          isFinal
        });
      };
      
      recognitionInstance.onerror = (event: any) => {
        setRecognitionError(event.error);
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    } else {
      setHasRecognitionSupport(false);
      setRecognitionError("Your browser doesn't support speech recognition");
    }
  }, []);

  // Start listening
  const startListening = useCallback(() => {
    if (recognition && hasRecognitionSupport) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          try {
            recognition.start();
            setIsListening(true);
            setRecognitionError(null);
            
            // Reset transcript
            setVoiceData({
              transcript: '',
              confidence: 0,
              isFinal: false
            });
          } catch (error) {
            console.error('Error starting speech recognition:', error);
            setRecognitionError('Failed to start speech recognition');
          }
        })
        .catch(err => {
          console.error('Microphone permission denied:', err);
          setRecognitionError('Microphone permission denied');
        });
    }
  }, [recognition, hasRecognitionSupport]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition, isListening]);

  // Toggle listening state
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognition && isListening) {
        recognition.stop();
      }
    };
  }, [recognition, isListening]);

  return {
    transcript: voiceData.transcript,
    isListening,
    hasRecognitionSupport,
    recognitionError,
    voiceData,
    startListening,
    stopListening,
    toggleListening
  };
};

export default useVoiceRecognition;
