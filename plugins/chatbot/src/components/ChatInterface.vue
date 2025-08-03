<template>
  <div class="chat-interface">
    <!-- Header -->
    <div class="chat-header">
      <div class="header-content">
        <div class="brand-section">
          <h1 class="brand-title">SPARC AI</h1>
        </div>
        
        <div class="header-controls">
          <v-tooltip bottom>
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                variant="text"
                icon
                @click="handleClearChat"
                :disabled="messages.length === 0"
                class="control-btn"
                size="small"
              >
                <v-icon size="20">mdi-plus</v-icon>
              </v-btn>
            </template>
            <span>New chat</span>
          </v-tooltip>
          
        </div>
      </div>
    </div>

    <!-- Messages Area -->
    <div class="messages-container" ref="messagesContainer">
      <div v-if="messages.length === 0" class="empty-state">
        <div class="welcome-content">
          <div class="welcome-icon">
            <div class="logo-circle">
              <v-icon size="32" color="white">mdi-brain</v-icon>
            </div>
          </div>
          <h2 class="welcome-title">How can I help you today?</h2>
        </div>
        
        <div class="suggestion-grid">
          <div
            v-for="(suggestion, index) in suggestions"
            :key="index"
            class="suggestion-card"
            @click="handleSuggestion(suggestion.prompt)"
          >
            <div class="suggestion-content">
              <div class="suggestion-text">
                <p>{{ suggestion.prompt }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="messages-list">
        <div
          v-for="message in messages"
          :key="message.id"
          class="message-wrapper"
        >
          <chat-message :message="message" />
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div class="input-section">
      <div class="input-container">
        <div class="input-wrapper">
          <div class="input-box">
            <textarea
              v-model="input"
              ref="textareaRef"
              placeholder="Message SPARC AI"
              :disabled="isLoading"
              @keydown.enter.exact.prevent="handleSubmit"
              @keydown.enter.shift.exact="handleNewLine"
              @input="adjustTextareaHeight"
              class="message-textarea"
              rows="1"
            ></textarea>
            
            <div class="input-actions">
              <button
                type="button"
                class="attach-btn"
              >
                <v-icon size="18">mdi-paperclip</v-icon>
              </button>
              
              <button
                type="button"
                :disabled="!input.trim() || isLoading"
                class="send-button"
                @click="handleSubmit"
              >
                <v-icon size="18" v-if="!isLoading">mdi-arrow-up</v-icon>
                <div v-else class="loading-spinner"></div>
              </button>
            </div>
          </div>
        </div>
        
        <div class="input-footer">
          <div class="footer-content">
            <div class="model-selector-wrapper">
              <v-menu>
                <template v-slot:activator="{ props }">
                  <span v-bind="props" class="model-text">{{ selectedModel }}</span>
                </template>
                <v-list class="model-menu">
                  <v-list-item
                    v-for="model in availableModels"
                    :key="model.value"
                    @click="handleModelChange(model.value)"
                    :class="{ 'model-selected': selectedModel === model.value }"
                  >
                    <v-list-item-title>{{ model.name }}</v-list-item-title>
                    <v-list-item-subtitle>{{ model.description }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
            
            <div class="footer-actions">
              <span class="hint-text">SPARC AI Beta.</span>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import ChatMessage from './ChatMessage.vue'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const messagesContainer = ref<HTMLElement>()
const textareaRef = ref<HTMLTextAreaElement>()
const input = ref('')
const messages = ref<Message[]>([])
const isLoading = ref(false)
const selectedModel = ref('gpt-4.1')

const availableModels = [
  {
    value: 'gpt-4.1',
    name: 'GPT-4.1',
    description: 'Most capable model, best for complex tasks'
  },
  {
    value: 'gpt-4.1-mini',
    name: 'GPT-4.1 Mini',
    description: 'Fast and efficient for most tasks'
  }
]

const suggestions = [
  {
    prompt: 'Find heart datasets in SPARC'
  },
  {
    prompt: 'Show me spinal cord research data'
  }
]


onMounted(() => {
  const savedModel = localStorage.getItem('selected-model')
  if (savedModel) {
    selectedModel.value = savedModel
  }

  connectWebSocket()
})


let ws: WebSocket | null = null

const connectWebSocket = () => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    return
  }

  try {
    ws = new WebSocket('ws://localhost:8080/ws/chat')
    
    ws.onopen = () => {
      console.log('WebSocket connected')
    }
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        let content: string
        if (data.datasets && Array.isArray(data.datasets)) {
          content = JSON.stringify(data)
        } else {
          content = data.response || data.message || 'No response received'
        }
        
        const assistantMessage: Message = {
          id: Date.now().toString() + '_assistant',
          role: 'assistant',
          content: content,
          timestamp: new Date()
        }
        messages.value.push(assistantMessage)
        
        nextTick(() => scrollToBottom())
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      } finally {
        isLoading.value = false
      }
    }
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      const errorMessage: Message = {
        id: Date.now().toString() + '_error',
        role: 'assistant',
        content: 'Sorry, I encountered a connection error. Please check if the WebSocket server is running.',
        timestamp: new Date()
      }
      messages.value.push(errorMessage)
      isLoading.value = false
    }
    
    ws.onclose = () => {
      console.log('WebSocket disconnected')
      ws = null
    }
  } catch (error) {
    console.error('Failed to connect WebSocket:', error)
    const errorMessage: Message = {
      id: Date.now().toString() + '_error',
      role: 'assistant',
      content: 'Failed to connect to WebSocket server. Please check if the server is running.',
      timestamp: new Date()
    }
    messages.value.push(errorMessage)
    isLoading.value = false
  }
}

const sendWebSocketMessage = (message: string) => {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    const errorMessage: Message = {
      id: Date.now().toString() + '_error',
      role: 'assistant',
      content: 'WebSocket connection is not available. Please try again.',
      timestamp: new Date()
    }
    messages.value.push(errorMessage)
    isLoading.value = false
    return
  }

  isLoading.value = true

  try {
    const messageData = {
      message: message,
      model: selectedModel.value
    }
    
    ws.send(JSON.stringify(messageData))
  } catch (error) {
    console.error('Failed to send WebSocket message:', error)
    const errorMessage: Message = {
      id: Date.now().toString() + '_error',
      role: 'assistant',
      content: 'Failed to send message. Please try again.',
      timestamp: new Date()
    }
    messages.value.push(errorMessage)
    isLoading.value = false
  }
}

const sendMessage = (message: string) => {
  const userMessage: Message = {
    id: Date.now().toString(),
    role: 'user',
    content: message,
    timestamp: new Date()
  }
  messages.value.push(userMessage)

  if (!ws || ws.readyState !== WebSocket.OPEN) {
    connectWebSocket()
    setTimeout(() => sendWebSocketMessage(message), 100)
  } else {
    sendWebSocketMessage(message)
  }
}

const handleSubmit = () => {
  if (!input.value.trim() || isLoading.value) {
    return
  }
  
  const message = input.value.trim()
  input.value = ''
  resetTextareaHeight()
  sendMessage(message)
}


const handleSuggestion = (suggestion: string) => {
  input.value = suggestion
  handleSubmit()
}

const handleClearChat = () => {
  messages.value = []
}

const handleNewLine = () => {
  input.value += '\n'
}

const handleModelChange = (newModel: string) => {
  selectedModel.value = newModel
  localStorage.setItem('selected-model', newModel)
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    setTimeout(() => {
      const container = messagesContainer.value
      if (container) {
        container.scrollTop = container.scrollHeight - container.clientHeight
      }
    }, 100)
  }
}

const adjustTextareaHeight = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    const scrollHeight = textareaRef.value.scrollHeight
    const maxHeight = 150
    textareaRef.value.style.height = Math.min(scrollHeight, maxHeight) + 'px'
  }
}

const resetTextareaHeight = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
  }
}
</script>

<style scoped>
.chat-interface {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  font-family: inherit;
  color: #2d333a;
  overflow: hidden;
}

.chat-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  padding: 1rem;
  z-index: 10;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 48rem;
  margin: 0 auto;
}

.brand-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2d333a;
  margin: 0;
}

.header-controls {
  display: flex;
  gap: 0.25rem;
}

.control-btn {
  border-radius: 0.5rem !important;
  color: #6b7280 !important;
}

.control-btn:hover {
  background-color: #f3f4f6 !important;
  color: #374151 !important;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  max-width: 48rem;
  margin: 0 auto;
  width: 100%;
  padding: 4.5rem 1rem 1rem;
  margin-bottom: 120px;
  scroll-behavior: smooth;
  background: #ffffff;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 13rem);
  padding: 1.5rem 1rem;
  gap: 2rem;
}

.welcome-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.logo-circle {
  width: 3rem;
  height: 3rem;
  background: #10a37f;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome-title {
  font-size: 2rem;
  font-weight: 600;
  color: #2d333a;
  margin: 0;
  line-height: 1.2;
}

.suggestion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: 0.75rem;
  width: 100%;
  max-width: 32rem;
}

.suggestion-card {
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  transition: all 0.2s ease;
  cursor: pointer;
  background: #ffffff;
  padding: 1rem;
}

.suggestion-card:hover {
  border-color: #9ca3af;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.suggestion-text p {
  font-size: 0.875rem;
  color: #374151;
  margin: 0;
  line-height: 1.4;
}

.messages-list {
  padding: 1.5rem 1.5rem 0.5rem;
}

.message-wrapper {
  margin-bottom: 1.5rem;
}

.input-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  padding: 1.5rem;
  z-index: 20;
}

.input-container {
  max-width: 48rem;
  margin: 0 auto;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-box {
  display: flex;
  align-items: center;
  border: 1px solid #d1d5db;
  border-radius: 1.5rem;
  padding: 0.75rem 1rem;
  background: #ffffff;
  min-height: 3rem;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.input-box:focus-within {
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), 0 2px 8px rgba(0, 0, 0, 0.15);
}

.message-textarea {
  flex: 1;
  margin-right: 0.5rem;
  border: none;
  outline: none;
  resize: none;
  background: transparent;
  font-family: inherit;
  font-size: 16px;
  line-height: 1.5;
  color: #1f2937;
  padding: 4px 0;
  min-height: 24px;
  max-height: 150px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
}

.message-textarea::placeholder {
  color: #6b7280;
}

.message-textarea:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.message-textarea::-webkit-scrollbar {
  width: 4px;
}

.message-textarea::-webkit-scrollbar-track {
  background: transparent;
}

.message-textarea::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 2px;
}

.message-textarea::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}

.input-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.attach-btn {
  background: none;
  border: none;
  color: #6b7280;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.attach-btn:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.send-button {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  min-width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.send-button:hover:not(:disabled) {
  background: #2563eb;
  transform: scale(1.05);
}

.send-button:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}

.send-button:active:not(:disabled) {
  transform: scale(0.95);
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

.model-text {
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  transition: background-color 0.2s ease;
}

.model-text:hover {
  background-color: #f3f4f6;
}

.model-menu {
  border-radius: 0.5rem !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  border: 1px solid #e5e7eb !important;
  min-width: 12.5rem;
}

.model-selected {
  background-color: #f3f4f6 !important;
}


.messages-container::-webkit-scrollbar {
  width: 0.375rem;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 0.1875rem;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}


@media (max-width: 768px) {
  .chat-header {
    padding: 0.875rem 0.75rem;
  }
  
  .input-section {
    padding: 1rem 0.75rem 1.5rem;
  }
  
  .messages-container {
    padding: 4rem 0.75rem 1rem;
    margin-bottom: 140px;
  }
  
  .input-box {
    padding: 0.625rem 0.875rem;
    min-height: 2.75rem;
    border-radius: 1.25rem;
  }
  
  .send-button {
    width: 32px;
    height: 32px;
    min-width: 32px;
  }
  
  .attach-btn {
    width: 28px;
    height: 28px;
  }
  
  .message-textarea {
    font-size: 16px;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
  
  .empty-state {
    min-height: calc(100vh - 13rem);
    padding: 1rem;
  }
  
  .suggestion-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
}

@media (max-width: 640px) {
  .brand-title {
    font-size: 1rem;
  }
  
  .welcome-title {
    font-size: 1.5rem;
  }
  
  .input-box {
    padding: 0.625rem 0.875rem;
    min-height: 2.75rem;
    border-radius: 1.25rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  }
  
  .input-section {
    padding: 0.875rem 0.5rem 1.25rem;
  }
  
  .messages-container {
    padding: 3.75rem 0.5rem 1rem;
    margin-bottom: 150px;
  }
  
  .send-button {
    width: 30px;
    height: 30px;
    min-width: 30px;
  }
  
  .attach-btn {
    width: 26px;
    height: 26px;
  }
}

@media (max-width: 480px) {
  .input-section {
    padding: 0.75rem 0.5rem 1rem;
  }
  
  .input-box {
    padding: 0.5rem 0.75rem;
    min-height: 2.5rem;
    border-radius: 1rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  }
  
  .messages-container {
    padding: 3.25rem 0.5rem 1rem;
    margin-bottom: 160px;
  }
  
  .empty-state {
    padding: 0.75rem;
    min-height: calc(100vh - 15rem);
  }
  
  .suggestion-card {
    padding: 0.75rem;
  }
  
  .send-button {
    width: 28px;
    height: 28px;
    min-width: 28px;
  }
  
  .attach-btn {
    width: 24px;
    height: 24px;
  }
  
  .message-textarea {
    margin-right: 0.375rem;
    font-size: 16px;
  }
}
</style>