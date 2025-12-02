"use client"

import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { PlusIcon, Search, MessageSquare, Trash2 } from "lucide-react"
import { Claude } from "@/components/claude"
import ConversationRuntimeProvider from "@/components/conversation-runtime-provider"
import { useConversationStore } from "@/lib/conversation-store"
import { useState } from "react"

function SidebarWithChatHistory() {
  const { 
    getConversationsByPeriod, 
    setActiveConversation, 
    activeConversationId,
    addConversation,
    deleteConversation
  } = useConversationStore()
  
  const conversationsByPeriod = getConversationsByPeriod()

  const handleNewChat = () => {
    const newConversationId = addConversation({
      title: "New Conversation",
      messages: [],
    })
    setActiveConversation(newConversationId)
  }

  const handleConversationClick = (conversationId: string) => {
    setActiveConversation(conversationId)
  }

  const handleDeleteConversation = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteConversation(conversationId)
  }

  const periods = [
    { key: 'today', label: 'Today', conversations: conversationsByPeriod.today },
    { key: 'yesterday', label: 'Yesterday', conversations: conversationsByPeriod.yesterday },
    { key: 'lastWeek', label: 'Last 7 days', conversations: conversationsByPeriod.lastWeek },
    { key: 'lastMonth', label: 'Last month', conversations: conversationsByPeriod.lastMonth },
    { key: 'older', label: 'Older', conversations: conversationsByPeriod.older },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="flex flex-row items-center justify-between gap-2 px-2 py-4">
        <div className="flex flex-row items-center gap-2 px-2">
          <div className="bg-primary/10 size-8 rounded-md flex items-center justify-center">
            <MessageSquare className="size-4 text-primary" />
          </div>
          <div className="text-md font-base text-primary tracking-tight">
            Claude Chat
          </div>
        </div>
        <Button variant="ghost" className="size-8" onClick={handleNewChat}>
          <PlusIcon className="size-4" />
        </Button>
      </SidebarHeader>
      <SidebarContent className="pt-4">
        {periods.map((period) => (
          period.conversations.length > 0 && (
            <SidebarGroup key={period.key}>
              <SidebarGroupLabel>{period.label}</SidebarGroupLabel>
              <SidebarMenu>
                {period.conversations.map((conversation) => (
                  <div key={conversation.id} className="group relative">
                    <SidebarMenuButton
                      onClick={() => handleConversationClick(conversation.id)}
                      className={`w-full justify-start ${
                        activeConversationId === conversation.id ? 'bg-sidebar-accent' : ''
                      }`}
                    >
                      <MessageSquare className="size-4" />
                      <span className="truncate">{conversation.title}</span>
                    </SidebarMenuButton>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleDeleteConversation(conversation.id, e)}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          )
        ))}
        {Object.values(conversationsByPeriod).every(arr => arr.length === 0) && (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <MessageSquare className="size-8 mb-2" />
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs">Start a new chat to begin</p>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  )
}

function AppContent() {
  return (
    <main className="flex h-screen flex-col overflow-hidden">
      <header className="bg-background z-10 flex h-16 w-full shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-semibold text-primary">C</span>
          </div>
          <span className="font-semibold">Claude Chat</span>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <ConversationRuntimeProvider>
          <Claude />
        </ConversationRuntimeProvider>
      </div>
    </main>
  )
}

function SidebarChatHistory() {
  return (
    <SidebarProvider>
      <SidebarWithChatHistory />
      <SidebarInset>
        <AppContent />
      </SidebarInset>
    </SidebarProvider>
  )
}

export { SidebarChatHistory }