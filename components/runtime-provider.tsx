"use client";

import { AssistantRuntimeProvider, useLocalRuntime } from "@assistant-ui/react";
import { type FC, type PropsWithChildren } from "react";

const RuntimeProvider: FC<PropsWithChildren> = ({ children }) => {
  const runtime = useLocalRuntime({
    async run({ messages }: { messages: readonly any[] }) {
      // Get the last user message
      const lastMessage = messages[messages.length - 1];
      
      if (lastMessage?.role === "user") {
        const userText = lastMessage.content.find((c: any) => c.type === "text")?.text;
        
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
        
        return {
          content: [{ type: "text" as const, text: result || "Sorry, I couldn't process that request." }],
        };
      }

      return {
        content: [{ type: "text" as const, text: "Hello! How can I help you today?" }],
      };
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
};

export default RuntimeProvider;