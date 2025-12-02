"use client";

import { AssistantRuntimeProvider, useLocalRuntime } from "@assistant-ui/react";
import { useChat } from "ai/react";
import { type FC, type PropsWithChildren } from "react";

const RuntimeProvider: FC<PropsWithChildren> = ({ children }) => {
  const chat = useChat({
    api: "/api/chat",
  });

  const runtime = useLocalRuntime({
    messages: chat.messages,
    isRunning: chat.isLoading,
    onNew: async (message) => {
      await chat.append({
        role: "user",
        content: message.content.map(part => part.text || "").join(""),
      });
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
};

export default RuntimeProvider;