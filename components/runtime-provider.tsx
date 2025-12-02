"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { type FC, type PropsWithChildren } from "react";

const RuntimeProvider: FC<PropsWithChildren> = ({ children }) => {
  const runtime = useChatRuntime({
    api: "/api/chat",
    onError: (error) => {
      console.error("Runtime error:", error);
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
};

export default RuntimeProvider;