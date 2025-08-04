import { defineStore } from 'pinia'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isLoading?: boolean
}

export const useChatStore = defineStore('chat', {
  state: () => ({
    messages: [] as ChatMessage[],
    isTyping: false,
    apiKey: '',
    model: 'gpt-3.5-turbo'
  }),

  actions: {
    addMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>) {
      const newMessage: ChatMessage = {
        ...message,
        id: Date.now().toString(),
        timestamp: new Date()
      }
      this.messages.push(newMessage)
      return newMessage
    },

    updateMessage(id: string, updates: Partial<ChatMessage>) {
      const index = this.messages.findIndex(msg => msg.id === id)
      if (index !== -1) {
        this.messages[index] = { ...this.messages[index], ...updates }
      }
    },

    removeMessage(id: string) {
      const index = this.messages.findIndex(msg => msg.id === id)
      if (index !== -1) {
        this.messages.splice(index, 1)
      }
    },

    clearMessages() {
      this.messages = []
    },

    setTyping(isTyping: boolean) {
      this.isTyping = isTyping
    },

    setApiKey(key: string) {
      this.apiKey = key
    },

    setModel(model: string) {
      this.model = model
    }
  },

  getters: {
    lastMessage: (state) => state.messages[state.messages.length - 1],
    messageCount: (state) => state.messages.length,
    hasApiKey: (state) => !!state.apiKey
  }
})