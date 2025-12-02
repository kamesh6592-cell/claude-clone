"use client";

import { Claude } from "@/components/claude";
import RuntimeProvider from "@/components/runtime-provider";

export default function Home() {
  return (
    <main className="h-screen">
      <RuntimeProvider>
        <Claude />
      </RuntimeProvider>
    </main>
  );
}