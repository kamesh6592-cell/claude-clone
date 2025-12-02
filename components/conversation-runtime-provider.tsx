"use client";

import { AssistantRuntimeProvider, useLocalRuntime } from "@assistant-ui/react";
import { type FC, type PropsWithChildren, useEffect } from "react";
import { useConversationStore } from "@/lib/conversation-store";

const ConversationRuntimeProvider: FC<PropsWithChildren> = ({ children }) => {
  const { 
    activeConversationId, 
    addMessage, 
    addConversation,
    conversations 
  } = useConversationStore();

  const runtime = useLocalRuntime({
    async run({ messages }: { messages: readonly any[] }) {
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

        // Add the user message to the conversation
        addMessage(conversationId, {
          role: "user",
          content: userText || "",
        });

        try {
          // Call our API
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          // Handle streaming response
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let result = "";
          
          if (reader) {
            while (true) {
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
          
          // Add the assistant message to the conversation
          addMessage(conversationId, {
            role: "assistant",
            content: assistantResponse,
          });

          return {
            content: [{ type: "text" as const, text: assistantResponse }],
          };
        } catch (error) {
          const errorMessage = "Sorry, I encountered an error while processing your request.";
          
          // Add error message to conversation
          addMessage(conversationId, {
            role: "assistant",
            content: errorMessage,
          });

          return {
            content: [{ type: "text" as const, text: errorMessage }],
          };
        }
      }

      return {
        content: [{ type: "text" as const, text: "Hello! How can I help you today?" }],
      };
    },
  });

  // Load existing messages when active conversation changes
  useEffect(() => {
    if (!activeConversationId) {
      // Clear the runtime when no conversation is active
      return;
    }
    
    const conversation = conversations.find(c => c.id === activeConversationId);
    if (!conversation) return;
    
    // Note: The assistant-ui runtime doesn't support loading initial messages directly
    // This is a limitation we'll need to work around in a future update
    
  }, [activeConversationId, conversations]);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
};

export default ConversationRuntimeProvider;