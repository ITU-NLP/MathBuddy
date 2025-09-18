import React, { useState, useEffect } from 'react';

interface VoiceInputProps {
  isListening: boolean;
  onToggleListening: () => void;
  hasRecognitionSupport: boolean;
}

const VoiceInput: React.FC<VoiceInputProps> = ({
  isListening,
  onToggleListening,
  hasRecognitionSupport
}) => {
  const [pulse, setPulse] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  
  // Add pulsing effect while listening
  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => {
        setPulse(p => !p);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isListening]);
  
  // Handle microphone click
  const handleMicClick = () => {
    try {
      // First time grant might fail due to permissions
      onToggleListening();
      setPermissionDenied(false);
    } catch (error) {
      console.error("Error with voice recognition:", error);
      setPermissionDenied(true);
    }
  };
  
  // Common container style
  const containerClass = "bg-neutral-200 rounded-lg overflow-hidden p-4 flex flex-col items-center justify-center h-full";
  
  // Render different button based on support status
  if (!hasRecognitionSupport) {
    return (
      <div className={containerClass}>
        <div className="text-3xl mb-2 text-neutral-400">🎤</div>
        <p className="text-sm font-medium text-neutral-700">Voice Not Supported</p>
        <p className="text-xs text-neutral-500 mt-1 text-center">
          Not supported by browser
        </p>
      </div>
    );
  }
  
  if (permissionDenied) {
    return (
      <div className={containerClass}>
        <div className="text-3xl mb-2 text-red-500">🚫</div>
        <p className="text-sm font-medium text-neutral-700">Microphone Access Denied</p>
        <p className="text-xs text-neutral-500 mt-1 text-center">
          Please allow microphone access in your browser
        </p>
      </div>
    );
  }
  
  return (
    <div className={containerClass}>
      <button
        className={`
          ${isListening 
            ? 'bg-gradient-to-r from-red-500 to-rose-600' 
            : 'bg-gradient-to-r from-blue-500 to-teal-400'} 
          hover:opacity-90 
          text-white 
          rounded-full 
          p-3
          flex 
          items-center 
          justify-center 
          transition-all 
          duration-200
          shadow-md
          ${isListening && pulse ? 'scale-110' : 'scale-100'}
          mb-2
          min-w-[56px]
          min-h-[56px]
        `}
        onClick={handleMicClick}
        aria-label={isListening ? "Stop listening" : "Start voice input"}
      >
        <span className="flex items-center gap-2">
          {isListening ? (
            <>
              <span className="text-lg animate-pulse">⏹️</span>
              <span className="text-sm font-medium">Stop</span>
            </>
          ) : (
            <>
              <span className="text-lg">🎤</span>
              <span className="text-sm font-medium">Talk</span>
            </>
          )}
        </span>
      </button>
      <p className="text-sm font-medium text-neutral-700">
        {isListening ? 'Listening...' : 'Voice Input'}
      </p>
      <p className="text-xs text-neutral-500 mt-1 text-center">
        {isListening 
          ? 'Speak clearly to the microphone' 
          : 'Click the button to start speaking'}
      </p>
      
      {isListening && (
        <div className="flex mt-1 gap-1">
          <div className={`w-1 h-3 ${pulse ? 'bg-primary' : 'bg-neutral-400'} rounded-full animate-bounce`} style={{animationDelay: '0ms'}}></div>
          <div className={`w-1 h-4 ${pulse ? 'bg-primary' : 'bg-neutral-400'} rounded-full animate-bounce`} style={{animationDelay: '100ms'}}></div>
          <div className={`w-1 h-5 ${pulse ? 'bg-primary' : 'bg-neutral-400'} rounded-full animate-bounce`} style={{animationDelay: '200ms'}}></div>
          <div className={`w-1 h-3 ${pulse ? 'bg-primary' : 'bg-neutral-400'} rounded-full animate-bounce`} style={{animationDelay: '300ms'}}></div>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
