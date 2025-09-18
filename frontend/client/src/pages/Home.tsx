import {useState, useEffect} from 'react';
import {useQuery, useMutation} from '@tanstack/react-query';
import {apiRequest, queryClient} from '@/lib/queryClient';
import {useToast} from '@/hooks/useToast';
import Header from '@/components/Header';
import VisualizationCanvas from '@/components/VisualizationCanvas';
import ChatInterface from '@/components/ChatInterface';
import UserConditionForm  from "@/components/UserConditionForm";
import {Message, RoleSchema} from '@shared/schema';
import {ALLOW_NO_CONDITION_MODE, USE_CONDITION_MODE} from "@shared/settings";
import e from "express";


const Home = () => {
  const {toast} = useToast();
  const [userId, setUserId] = useState<number>(-1);
  const [condition, setCondition] = useState<number>(-1);
  const [userInitialized, setUserInitialized] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [enableWebcamInput, setEnableWebcamInput] = useState<boolean>(false);
  const [visualizeWebcamEmotion, setVisualizeWebcamEmotion] = useState<boolean>(false);

  const [activePanel, setActivePanel] = useState<'chat' | 'canvas'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Create a new session
  const createSession = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/sessions', {
        userId: userId,
        condition: condition,
        usesEmotion: enableWebcamInput,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      // Load messages for the new session
      queryClient.invalidateQueries({queryKey: [`/api/sessions/${data.sessionId}/messages`]});
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create a new session',
        variant: 'destructive',
      });
      console.error('Error creating session:', error);
    }
  });

  // Fetch messages when session changes
  const {data: fetchedMessages, isLoading: messagesLoading} = useQuery<Message[]>({
    queryKey: [sessionId ? `/api/sessions/${sessionId}/messages` : null],
    enabled: !!sessionId,
    queryFn: async () => {
      if (!sessionId) return [];
      const response = await apiRequest('GET', `/api/sessions/${sessionId}/messages`);
      const data = await response.json();
      return data as Message[];
    },
    staleTime: 5000,
    refetchOnWindowFocus: false,
  });

  // Reset chat - clear all messages
  const resetChat = useMutation({
    mutationFn: async () => {
      if (!sessionId) return null;
      const response = await apiRequest('DELETE', `/api/sessions/${sessionId}/messages`, {});
      return response.json();
    },
    onSuccess: () => {
      // Reload messages after reset
      queryClient.invalidateQueries({queryKey: [`/api/sessions/${sessionId}/messages`]});

      toast({
        title: 'Chat Reset',
        description: 'Started a new conversation',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to reset the chat',
        variant: 'destructive',
      });
      console.error('Error resetting chat:', error);
    }
  });

  // Function to handle reset chat button click
  const handleReset = () => {
    if (!sessionId) {
      createSession.mutate();
      return;
    }

    try {
      // Reset chat and create new session
      resetChat.mutate(undefined, {
        onSuccess: () => {
          createSession.mutate();
          setMessages([]); // Clear messages immediately

          toast({
            title: "Chat Reset",
            description: "Started a new math conversation",
            variant: "default",
          });
        },
        onError: (error) => {
          console.error("Error resetting chat:", error);
          toast({
            title: "Reset Failed",
            description: "Unable to reset chat. Please try again.",
            variant: "destructive",
          });
        }
      });
    } catch (error) {
      console.error("Error resetting chat:", error);
      toast({
        title: 'Reset Failed',
        description: 'Unable to reset chat. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Switch between chat and canvas on mobile
  const togglePanel = (panel: 'chat' | 'canvas') => {
    setActivePanel(panel);
  };

  // Get the latest visualization data from AI messages
  const getLatestVisualization = () => {
    if (!messages || messages.length === 0) return null;

    // Find the latest AI message with visualization data
    const aiMessagesWithVisualizations = messages
      .filter(m => m.role !== RoleSchema.enum.student && m.visualization)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return aiMessagesWithVisualizations.length > 0
      ? aiMessagesWithVisualizations[0].visualization
      : null;
  };

  // Submit a drawing as a user message
  const handleDrawingSubmit = async (drawingData: string) => {
    if (!sessionId) return;

    try {
      // Create a new user message with the drawing
      const newMessage: Partial<Message> = {
        content: "Here's my drawing. Can you help me with this?",
        role: RoleSchema.enum.student,
        // Store the drawing data as visualization so we can display it in the chat
        visualization: {
          type: "user_drawing",
          data: drawingData,
          title: "User Drawing"
        }
      };

      // Add message to the UI immediately for responsive feedback
      const tempMessage = {
        ...newMessage,
        id: Date.now(),
        timestamp: new Date(),
      } as Message;

      setMessages(prev => [...prev, tempMessage]);

      // Send message to server
      const response = await apiRequest('POST', `/api/sessions/${sessionId}/messages`, newMessage);
      const data = await response.json();

      // Reload messages to get AI response
      queryClient.invalidateQueries({queryKey: [`/api/sessions/${sessionId}/messages`]});

      // On mobile, switch to chat panel after submitting a drawing so user can see the response
      if (isMobile) {
        togglePanel('chat');
      }

      toast({
        title: 'Drawing Submitted',
        description: 'Your drawing has been submitted for analysis',
      });
    } catch (error) {
      console.error('Error submitting drawing:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit your drawing',
        variant: 'destructive',
      });
    }
  };


  // Create a new session if not in condition mode
  useEffect(() => {
    if (!USE_CONDITION_MODE) {
      setEnableWebcamInput(true);
      setVisualizeWebcamEmotion(true);
      createSession.mutate();
    }
  }, []);

  useEffect(() => {
    if (userInitialized) {
      setEnableWebcamInput(true);
      setVisualizeWebcamEmotion(condition < 0 || condition > 1);
      createSession.mutate();
    }
  }, [userInitialized]);

  // Update messages when fetchedMessages changes
  useEffect(() => {
    if (fetchedMessages) {
      setMessages(fetchedMessages);
    }
  }, [fetchedMessages]);

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  return (
    <div className="flex flex-col h-screen">
      <Header onResetClick={handleReset} allowReset={!USE_CONDITION_MODE} resetPending={resetChat.isPending}/>

      {/* Mobile Navigation */}
      {(!USE_CONDITION_MODE || userInitialized) && isMobile && (
        <div className="md:hidden bg-white border-b border-neutral-300">
          <div className="flex justify-around">
            <button
              className={`py-3 px-6 font-medium ${activePanel === 'chat' ? 'border-b-3 border-primary text-primary' : ''}`}
              onClick={() => togglePanel('chat')}
            >
              <i className="fas fa-comment-alt mr-1"></i> Chat
            </button>
            <button
              className={`py-3 px-6 font-medium ${activePanel === 'canvas' ? 'border-b-3 border-primary text-primary' : ''}`}
              onClick={() => togglePanel('canvas')}
            >
              <i className="fas fa-draw-polygon mr-1"></i> Canvas
            </button>
          </div>
        </div>
      )}

      {(!USE_CONDITION_MODE || userInitialized) ? (
        /* Main Content */
        <main className="flex flex-grow flex-col md:flex-row">
          {/* Chat Interface (hidden on mobile when canvas is active) */}
          <div
            className={`${isMobile && activePanel !== 'chat' ? 'hidden' : 'flex'} 
                     ${isMobile ? 'w-full' : 'md:w-2/3'} 
                     bg-white h-full`}
          >
            <ChatInterface
              sessionId={sessionId}
              messages={messages}
              setMessages={setMessages}
              isLoading={messagesLoading || createSession.isPending}
              enableWebcamInput={enableWebcamInput}
              visualizeWebcamEmotion={visualizeWebcamEmotion}
              enableVoiceInput={false}
            />
          </div>

          {/* Canvas (hidden on mobile when chat is active) */}
          <div
            className={`${isMobile && activePanel !== 'canvas' ? 'hidden' : 'flex'} 
                     ${isMobile ? 'w-full' : 'md:w-1/3'} 
                     p-2 md:p-3 bg-neutral-200 h-full`}
          >
            <VisualizationCanvas
              visualization={getLatestVisualization()}
              onDrawingSubmit={handleDrawingSubmit}
              onlyDrawing={true}
              allowSubmit={false}
            />
          </div>
        </main>
      ) : (
        /* UserId and Condition form */
        <main className="min-h-screen flex items-center justify-center bg-gray-100">
          <UserConditionForm
            setUserId={setUserId}
            setCondition={setCondition}
            setUserInitialized={setUserInitialized}
            allowNoConditionMode={ALLOW_NO_CONDITION_MODE}
          />
        </main>
      )}
    </div>
  );
};

export default Home;
