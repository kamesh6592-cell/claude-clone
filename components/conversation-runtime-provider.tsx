"use client";

import { AssistantRuntimeProvider, useLocalRuntime } from "@assistant-ui/react";
import { type FC, type PropsWithChildren, useEffect, useRef, useCallback, useState } from "react";
import { useConversationStore } from "@/lib/conversation-store";

const ConversationRuntimeProvider: FC<PropsWithChildren> = ({ children }) => {
  const { 
    activeConversationId, 
    addMessage, 
    addConversation,
    conversations 
  } = useConversationStore();

  const abortControllerRef = useRef<AbortController | null>(null)
  const isProcessingRef = useRef(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize the runtime provider
  useEffect(() => {
    setIsInitialized(true)
    return () => {
      setIsInitialized(false)
    }
  }, [])

  const runtime = useLocalRuntime({
    async run({ messages }: { messages: readonly any[] }) {
      // Prevent multiple simultaneous requests
      if (isProcessingRef.current) {
        console.warn("Already processing a message, skipping");
        return {
          content: [{ type: "text" as const, text: "Please wait for the current message to finish processing." }],
        };
      }
      
      isProcessingRef.current = true
      
      try {
        // Cancel any previous request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort()
        }
        
        abortControllerRef.current = new AbortController()
        
        // Get the last user message
        const lastMessage = messages[messages.length - 1];
        
        if (lastMessage?.role === "user") {
          const userText = lastMessage.content.find((c: any) => c.type === "text")?.text;
          
          // Ensure we have an active conversation
          let conversationId = activeConversationId;
          if (!conversationId) {
            conversationId = addConversation({
              title: "New Conversation",
              messages: [],
            });
          }

          // Add the user message to the conversation (non-blocking)
          try {
            addMessage(conversationId, {
              role: "user",
              content: userText || "",
            });
          } catch (error) {
            console.error('Error adding user message:', error);
          }

          try {
            // Call our API with timeout and abort signal
            const response = await fetch("/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ messages }),
              signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Handle streaming response with proper timeout
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let result = "";
            const TIMEOUT = 30000; // 30 seconds
            
            if (reader) {
              const startTime = Date.now();
              
              while (true) {
                // Check if we've exceeded timeout
                if (Date.now() - startTime > TIMEOUT) {
                  reader.cancel();
                  throw new Error("Timeout");
                }
                
                const { done, value } = await reader.read();
                
                if (done) break;
                
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                  if (line.startsWith('0:')) {
                    // Extract the actual message content
                    try {
                      const content = JSON.parse(line.substring(2));
                      result += content;
                    } catch {
                      // If it's not JSON, just use the content after the colon
                      result += line.substring(2).replace(/"/g, '');
                    }
                  }
                }
              }
            }
          
            const assistantResponse = result || "Sorry, I couldn't process that request.";
            
            // Add the assistant message to the conversation (non-blocking)
            try {
              addMessage(conversationId, {
                role: "assistant",
                content: assistantResponse,
              });
            } catch (error) {
              console.error('Error adding assistant message:', error);
            }

            return {
              content: [{ type: "text" as const, text: assistantResponse }],
            };
          } catch (error: any) {
            // Handle abort gracefully
            if (error.name === 'AbortError') {
              throw error;
            }
            
            const errorMessage = error.message === "Timeout" 
              ? "Request timed out. Please try again."
              : "Sorry, I encountered an error while processing your request.";
            
            // Add error message to conversation (non-blocking)
            try {
              addMessage(conversationId, {
                role: "assistant",
                content: errorMessage,
              });
            } catch (error) {
              console.error('Error adding error message:', error);
            }

            return {
              content: [{ type: "text" as const, text: errorMessage }],
            };
          }
        }

        return {
          content: [{ type: "text" as const, text: "Hello! How can I help you today?" }],
        };
      } catch (criticalError: any) {
        console.error('Critical error in runtime:', criticalError);
        return {
          content: [{ type: "text" as const, text: "Sorry, I encountered a critical error. Please refresh the page and try again." }],
        };
      } finally {
        isProcessingRef.current = false;
        // Clear abort controller
        if (abortControllerRef.current) {
          abortControllerRef.current = null;
        }
      }
    },
  });

  // Cleanup and maintenance effects
  useEffect(() => {
    // Cleanup old conversations periodically
    const cleanup = () => {
      const { cleanupOldConversations } = useConversationStore.getState()
      cleanupOldConversations?.()
    }
    
    const interval = setInterval(cleanup, 5 * 60 * 1000) // Every 5 minutes
    
    return () => {
      clearInterval(interval)
      // Cancel any ongoing request on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Load existing messages when active conversation changes
  useEffect(() => {
    if (!activeConversationId) {
      return;
    }
    
    const conversation = conversations.find(c => c.id === activeConversationId);
    if (!conversation) return;
    
    // Note: The assistant-ui runtime doesn't support loading initial messages directly
    // This is a limitation we'll need to work around in a future update
    
  }, [activeConversationId, conversations]);

  // Don't render until initialized to prevent race conditions
  if (!isInitialized) {
    return <div className="flex h-full items-center justify-center">Loading...</div>
  }

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
};

export default ConversationRuntimeProvider;