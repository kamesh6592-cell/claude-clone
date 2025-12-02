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

        const data = await response.text();
        
        return {
          content: [{ type: "text" as const, text: data }],
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