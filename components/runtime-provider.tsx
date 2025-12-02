"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useVercelUseChatRuntime } from "@assistant-ui/react-ai-sdk";
import { type FC, type PropsWithChildren } from "react";

const RuntimeProvider: FC<PropsWithChildren> = ({ children }) => {
  const runtime = useVercelUseChatRuntime({
    api: "/api/chat",
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
};

export default RuntimeProvider;