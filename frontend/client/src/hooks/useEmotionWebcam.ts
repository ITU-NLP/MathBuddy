import {useCallback, useEffect, useRef, useState} from 'react';
import {WebcamData} from '@/types';
import {Emotion} from "@shared/schema.ts";

import * as faceApi from 'face-api.js';
import {apiRequest} from "@/lib/queryClient.ts";
import {WEBCAM_EMOTION_DETECTION_DELAY} from "@shared/settings.ts";

export enum FaceEmotionModel {
  faceApi = 0,
  backend
}

export interface EmotionWebcamProps {
  emotionModel: FaceEmotionModel;
}

export const useEmotionWebcam = ({emotionModel}: EmotionWebcamProps) => {
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [webcamReady, setWebcamReady] = useState(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>("neutral");
  const [detectedEmotion, setDetectedEmotion] = useState<WebcamData>({
    emotion: "neutral",
    previousEmotion: "neutral",
    changed: true,
    confidence: 0
  });
  const [modelsLoaded, setModelsLoaded] = useState<boolean>(emotionModel !== FaceEmotionModel.faceApi);
  const [emotionLoopActive, setEmotionLoopActive] = useState<boolean>(false);

  const currentEmotionRef = useRef(currentEmotion);
  const emotionLoopActiveRef = useRef(emotionLoopActive);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // region webcam functions

  const startWebcam = useCallback(async () => {
    try {
      // Reset all states when starting
      setWebcamError(null);
      setWebcamReady(false);
      setIsWebcamActive(false);

      console.log("Starting webcam...");

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser API navigator.mediaDevices.getUserMedia not available');
      }

      // Display loading indicator first
      setIsWebcamActive(true);

      let stream: MediaStream | null = null;

      /* Detect if in Replit environment (likely stricter permissions)
      const isReplitEnv = window.location.hostname.includes('replit');

      // For Replit, first explicitly request user permission through a simpler request
      if (isReplitEnv) {
        try {
          console.log("Replit environment detected, requesting camera permission...");
          // Use a direct permission request first
          await navigator.permissions.query({ name: 'camera' as PermissionName });
        } catch (permError) {
          console.warn("Permission query not supported, continuing with direct request");
        }
      }
      */

      // First try with basic settings (most important for permission)
      try {
        console.log("Requesting basic camera access...");
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
        console.log("Basic camera access granted");
      } catch (basicError: any) {
        console.error('Failed with basic settings:', basicError);

        // Handle common error cases
        switch (basicError.name) {
          case 'NotAllowedError':
          case 'PermissionDeniedError':
            throw new Error('Camera access denied. Please allow camera access in your browser settings.');
          case 'NotFoundError':
            throw new Error('No camera found. Please connect a camera and try again.');
          case 'NotReadableError':
          case 'TrackStartError':
            throw new Error('Camera is in use by another application or not accessible.');
          default:
            throw basicError;
        }
      }

      // If we have a stream, use it - ideally after this we'd get an optimized stream, but we already have permission
      if (stream && videoRef.current) {
        // Set the video source
        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        // Set up error handling for the video element
        videoRef.current.onerror = (event) => {
          console.error('Video element error:', event);
          setWebcamError('Video playback error occurred');
          stopWebcam();
        };

        // Set up metadata loading
        videoRef.current.onloadedmetadata = () => {
          if (!videoRef.current) return;

          // Play the video
          videoRef.current.play()
            .then(() => {
              console.log('Camera started successfully');
              setWebcamReady(true);
            })
            .catch(playError => {
              console.error('Error playing video:', playError);
              setWebcamError('Unable to play video: ' + (playError.message || 'Unknown error'));
              stopWebcam();
            });
        };

        // Log success
        console.log("Camera initialized successfully");
      } else {
        throw new Error('Failed to initialize camera stream');
      }
    } catch (error: any) {
      console.error('Error starting webcam:', error);

      // Show user-friendly error message
      const errorMessage = error.message || 'Unknown camera error';
      setWebcamError(errorMessage);

      // Cleanup
      stopWebcam();
    }
  }, []);

  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsWebcamActive(false);
    setWebcamReady(false);
  }, []);

  const toggleWebcam = useCallback(() => {
    if (isWebcamActive) {
      stopWebcam();
    } else {
      startWebcam();
    }
  }, [isWebcamActive, startWebcam, stopWebcam]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, [stopWebcam]);

  // endregion

  // Check if models are loaded (only when using face-api)
  useEffect(() => {
    if (emotionModel != FaceEmotionModel.faceApi) return;
    const checkModelsLoaded = async () => {
      // Wait a bit to allow models to load in App.tsx
      setTimeout(() => {
        const tinyFaceDetectorLoaded = faceApi.nets.tinyFaceDetector.isLoaded;
        const faceExpressionNetLoaded = faceApi.nets.faceExpressionNet.isLoaded;

        setModelsLoaded(tinyFaceDetectorLoaded && faceExpressionNetLoaded);

        if (tinyFaceDetectorLoaded && faceExpressionNetLoaded) {
          console.log('Face-api models verified in useWebcam hook');
        } else {
          console.warn('Face-api models not fully loaded in useWebcam hook');
        }
      }, 1000);
    };

    checkModelsLoaded();
  }, []);

  // Send image to backend for emotion analysis (only when using backend)


  // webcam emotion detection loop
  useEffect(() => {
    if (!isWebcamActive || !webcamReady || !videoRef.current || !modelsLoaded) return;

    let intervalId: NodeJS.Timeout;
    let active = true;

    const detectEmotions = async () => {
      if (!active || !videoRef.current) return;
      switch (emotionModel) {
        case FaceEmotionModel.faceApi:
          try {
            if (videoRef.current.readyState < 2) return;

            const detections = await faceApi
              .detectSingleFace(
                videoRef.current,
                new faceApi.TinyFaceDetectorOptions({
                  inputSize: 224,
                  scoreThreshold: 0.5,
                })
              )
              .withFaceExpressions();

            if (detections) {
              const expressions = detections.expressions
              const emotions: [Emotion, number][] = [
                ['happy', expressions.happy],
                ['sad', expressions.sad],
                ['angry', expressions.angry],
                ['surprised', expressions.surprised],
                ['fearful', expressions.fearful],
                ['disgusted', expressions.disgusted],
                ['neutral', expressions.neutral]
              ];

              emotions.sort((a, b) => b[1] - a[1]);
              const emotion = emotions[0][0];
              const previous = currentEmotionRef.current
              const emotionData = {
                emotion: emotion,
                previousEmotion: previous,
                changed: emotion !== previous,
                confidence: emotions[0][1]
              };
              setDetectedEmotion(emotionData);
              currentEmotionRef.current = emotionData.emotion;
            }
          } catch (error) {
            console.error("Error detecting emotions:", error);
          }

          break;
        case FaceEmotionModel.backend:
          console.log("detecting emotion via backend")
          try {
            if (videoRef.current.readyState < 2) return;
            const video = videoRef.current;

            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(async (blob) => {
              console.log(blob)
              let emotion = "neutral";
              let confidence = 0.0;

              if (blob !== null) {
                try {
                  const formData = new FormData();
                  const now_str = new Date().toISOString().replace(/[:.]/g, '-');
                  formData.append("image", blob, `frame_${now_str}.jpg`);

                  const response = await fetch("/api/emotion/face", {
                    method: "POST",
                    body: formData,
                  });

                  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                  const data = await response.json();

                  emotion = data.emotion ?? "neutral";
                  confidence = data.confidence ?? 0.0;
                } catch (error) {
                  console.error("Error sending frame to API:", error);
                }
              }

              const previous = currentEmotionRef.current
              const emotionData = {
                emotion: emotion,
                previousEmotion: previous,
                changed: emotion !== previous,
                confidence: confidence
              };
              setDetectedEmotion(emotionData);
              currentEmotionRef.current = emotionData.emotion;
            }, "image/jpeg");
          } catch (error) {
            console.error("Error capturing frame:", error);
          }

          break;
        default:
          throw new Error("Invalid Face Emotion Model Selected");
      }
    }

    intervalId = setInterval(detectEmotions, WEBCAM_EMOTION_DETECTION_DELAY);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [isWebcamActive, webcamReady, modelsLoaded]);


  return {
    videoRef,
    isWebcamActive,
    webcamReady,
    webcamError,
    detectedEmotion,
    startWebcam,
    stopWebcam,
    toggleWebcam
  };
};

export default useEmotionWebcam;
