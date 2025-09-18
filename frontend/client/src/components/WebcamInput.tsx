import React, { useEffect, useState } from 'react';
import {WebcamData} from '@/types';
import {Emotion} from "@shared/schema.ts";

interface WebcamInputProps {
  isWebcamActive: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  onToggleWebcam: () => void;
  detectedEmotion: WebcamData;
  visualizeEmotion: boolean;
  webcamError?: string | null;
  webcamReady?: boolean;
}

const WebcamInput: React.FC<WebcamInputProps> = ({
  isWebcamActive,
  videoRef,
  onToggleWebcam,
  detectedEmotion,
  visualizeEmotion,
  webcamError,
  webcamReady
}) => {
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Track permission status and handle timeouts
  useEffect(() => {
    if (isWebcamActive) {
      setIsLoading(true);
      setIsPermissionDenied(false);
      
      // Add a timeout to clear loading state after reasonable time
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 5000); // Allow 5 seconds for camera to start
      
      return () => clearTimeout(timeout);
    }
  }, [isWebcamActive]);
  
  // Handle webcam errors
  useEffect(() => {
    if (webcamError) {
      setIsPermissionDenied(true);
      setIsLoading(false);
    }
  }, [webcamError]);
  
  // When webcam becomes ready
  useEffect(() => {
    if (webcamReady) {
      setIsLoading(false);
    }
  }, [webcamReady]);

  // Handle camera button click
  const handleCameraClick = () => {
    if (!isWebcamActive) {
      setIsLoading(true);
    }
    
    // Attempt to toggle the webcam
    try {
      onToggleWebcam();
    } catch (error) {
      console.error("Error toggling webcam:", error);
      setIsPermissionDenied(true);
      setIsLoading(false);
    }
  };
  
  // Get the appropriate emoji for the detected emotion
  const getEmotionEmoji = (emotion: Emotion): string => {
    switch (emotion) {
      case "angry":
        return "😠";
      case "bored":
        return "🙄"
      case "confused":
        return "😕";
      case "contempt":
        return "😒"
      case "disgusted":
        return "🤢";
      case "engaged":
        return "😎";
      case "fearful":
        return "😨";
      case "frustrated":
        return "😫";
      case "happy":
        return "😊";
      case "negative":
        return "☹️";
      case "neutral":
        return "😐";
      case "positive":
        return "🙂";
      case "sad":
        return "😢";
      case "surprised":
        return "😲";
      default:
        return "🫥";
    }
  };

  return (
    <div className="bg-neutral-200 rounded-lg overflow-hidden aspect-video relative h-full">
      {isWebcamActive ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-300">
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-3"></div>
              <p className="text-neutral-600 text-sm font-medium">Activating camera...</p>
              <p className="text-neutral-500 text-xs mt-2">Please allow camera access in your browser</p>
            </>
          ) : webcamError ? (
            <>
              <span className="text-red-500 text-3xl mb-3">⚠️</span>
              <p className="text-neutral-700 text-sm font-medium mb-1">Camera Error</p>
              <p className="text-neutral-600 text-xs px-4 text-center">{webcamError}</p>
              
              <button 
                onClick={() => setShowHelp(!showHelp)}
                className="mt-3 text-xs underline text-blue-500"
              >
                {showHelp ? "Hide help" : "Show help"}
              </button>
              
              {showHelp && (
                <div className="mt-2 px-4 text-center">
                  <ul className="text-xs text-neutral-500 list-disc list-inside">
                    <li>Check if camera is connected</li>
                    <li>Allow camera permissions in browser</li>
                    <li>Close other apps using the camera</li>
                    <li>Try refreshing the page</li>
                  </ul>
                </div>
              )}
            </>
          ) : isPermissionDenied ? (
            <>
              <span className="text-red-500 text-3xl mb-3">🚫</span>
              <p className="text-neutral-700 text-sm font-medium">Camera access denied</p>
              <p className="text-neutral-600 text-xs mt-1 px-4 text-center">
                Please check your browser permissions and refresh the page
              </p>
            </>
          ) : (
            <>
              <span className="text-primary text-3xl mb-3">📷</span>
              <p className="text-neutral-700 text-sm font-medium">Camera is off</p>
              <p className="text-neutral-500 text-xs mt-1">Click the button to enable</p>
            </>
          )}
        </div>
      )}
      
      {visualizeEmotion && isWebcamActive && webcamReady && detectedEmotion && (
        <div className="absolute top-2 left-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-md shadow-md text-sm">
          <div className="flex items-center">
            <span className="text-xl mr-2">{getEmotionEmoji(detectedEmotion.emotion)}</span>
            <span className="font-medium">
              {detectedEmotion.emotion.charAt(0).toUpperCase() + detectedEmotion.emotion.slice(1)}
            </span>
          </div>
        </div>
      )}
      
      <div className="absolute top-2 right-2">
        <button
          className={`
            ${isWebcamActive 
              ? 'bg-gradient-to-r from-red-500 to-rose-600' 
              : 'bg-gradient-to-r from-blue-500 to-teal-400'} 
            hover:opacity-90 
            text-white 
            rounded-full 
            px-3
            py-2.5 
            text-sm
            font-medium
            transition-all 
            duration-200 
            shadow-md
            flex
            items-center
            justify-center
            min-w-[44px]
            min-h-[44px]
            aspect-square
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onClick={handleCameraClick}
          disabled={isLoading}
          aria-label={isWebcamActive ? "Turn off camera" : "Turn on camera"}
        >
          {isLoading ? (
            <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
          ) : (
            <span className="flex items-center gap-1.5">
              {isWebcamActive ? (
                <>
                  <span className="text-lg">◉</span>
                </>
              ) : (
                <>
                  <span className="text-lg">▶</span>
                </>
              )}
            </span>
          )}
        </button>
      </div>
      
      {/* Optional guide toast for first-time users
      {isWebcamActive && webcamReady && (
        <div className="absolute bottom-2 left-0 right-0 mx-auto w-3/4 text-center">
          <div className="bg-black/70 text-white px-3 py-1.5 rounded-full text-xs inline-block">
            Looking for your emotion...
          </div>
        </div>
      )}
      */}
    </div>
  );
};

export default WebcamInput;
