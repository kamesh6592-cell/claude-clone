import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

interface ConversationStore {
  conversations: Conversation[]
  activeConversationId: string | null
  addConversation: (conversation: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateConversation: (id: string, updates: Partial<Conversation>) => void
  addMessage: (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => void
  setActiveConversation: (id: string | null) => void
  deleteConversation: (id: string) => void
  getConversationsByPeriod: () => {
    today: Conversation[]
    yesterday: Conversation[]
    lastWeek: Conversation[]
    lastMonth: Conversation[]
    older: Conversation[]
  }
}

const generateId = () => Math.random().toString(36).substr(2, 9)

const generateTitle = (messages: Message[]): string => {
  const firstUserMessage = messages.find(m => m.role === 'user')?.content
  if (!firstUserMessage) return 'New Conversation'
  
  // Take first 50 characters and add ellipsis if longer
  const title = firstUserMessage.slice(0, 50)
  return title.length < firstUserMessage.length ? title + '...' : title
}

const getTimePeriod = (timestamp: number) => {
  const now = Date.now()
  const diff = now - timestamp
  const oneDay = 24 * 60 * 60 * 1000
  const oneWeek = 7 * oneDay
  const oneMonth = 30 * oneDay

  if (diff < oneDay) return 'today'
  if (diff < 2 * oneDay) return 'yesterday'
  if (diff < oneWeek) return 'lastWeek'
  if (diff < oneMonth) return 'lastMonth'
  return 'older'
}

export const useConversationStore = create<ConversationStore>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,

      addConversation: (conversationData) => {
        const id = generateId()
        const now = Date.now()
        const newConversation: Conversation = {
          ...conversationData,
          id,
          createdAt: now,
          updatedAt: now,
        }

        set((state) => ({
          conversations: [newConversation, ...state.conversations.slice(0, 999)], // Limit to 1000 conversations
          activeConversationId: id,
        }))

        return id
      },

      updateConversation: (id, updates) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === id
              ? { ...conv, ...updates, updatedAt: Date.now() }
              : conv
          ),
        }))
      },

      addMessage: (conversationId, messageData) => {
        const messageId = generateId()
        const timestamp = Date.now()
        const message: Message = {
          ...messageData,
          id: messageId,
          timestamp,
        }

        set((state) => {
          const updatedConversations = state.conversations.map((conv) => {
            if (conv.id === conversationId) {
              const updatedMessages = [...conv.messages, message]
              return {
                ...conv,
                messages: updatedMessages,
                title: conv.messages.length === 0 ? generateTitle(updatedMessages) : conv.title,
                updatedAt: timestamp,
              }
            }
            return conv
          })

          // Sort conversations by updatedAt (most recent first)
          updatedConversations.sort((a, b) => b.updatedAt - a.updatedAt)

          return { conversations: updatedConversations }
        })
      },

      setActiveConversation: (id) => {
        set({ activeConversationId: id })
      },

      deleteConversation: (id) => {
        set((state) => ({
          conversations: state.conversations.filter((conv) => conv.id !== id),
          activeConversationId: state.activeConversationId === id ? null : state.activeConversationId,
        }))
      },

      getConversationsByPeriod: () => {
        const { conversations } = get()
        const grouped = {
          today: [] as Conversation[],
          yesterday: [] as Conversation[],
          lastWeek: [] as Conversation[],
          lastMonth: [] as Conversation[],
          older: [] as Conversation[],
        }

        conversations.forEach((conv) => {
          const period = getTimePeriod(conv.updatedAt)
          grouped[period].push(conv)
        })

        return grouped
      },
    }),
    {
      name: 'conversation-store',
    }
  )
)