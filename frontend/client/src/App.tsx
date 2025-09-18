import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Home from "@/pages/Home";
import { useEffect } from "react";
import * as faceapi from "face-api.js";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Load face-api.js models on app initialization
  useEffect(() => {
    const loadModels = async () => {
      try {
        // We'll load models dynamically - may take some time on first load
        const MODEL_URL = '/models';
        
        // Create a public/models directory if needed
        try {
          // First attempt to load models
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
          ]);
          
          console.log("Face-api models loaded successfully in App component");
        } catch (initialError) {
          console.warn("Initial model loading failed, trying CDN:", initialError);
          
          // Fallback to CDN if local models are not available
          const CDN_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(CDN_URL),
            faceapi.nets.faceExpressionNet.loadFromUri(CDN_URL)
          ]);
          
          console.log("Face-api models loaded from CDN in App component");
        }
      } catch (error) {
        console.error("Error loading face-api models:", error);
      }
    };

    loadModels();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
