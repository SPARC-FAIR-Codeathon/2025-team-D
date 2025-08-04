<template>
  <div class="chat-message" :class="messageClass">
    <div class="message-content">
      <div class="message-avatar">
        <v-avatar :color="avatarColor" size="40" class="avatar-container">
          <v-icon v-if="message.role === 'user'" color="white" size="20">mdi-account-circle</v-icon>
          <v-icon v-else color="white" size="20">mdi-robot</v-icon>
        </v-avatar>
      </div>
      
      <div class="message-body">
        <div class="message-header">
          <span class="message-role">{{ message.role === 'user' ? 'You' : 'SPARC AI' }}</span>
          <span class="message-time">{{ formatTime(message.timestamp || new Date()) }}</span>
        </div>
        
        <div class="message-bubble">
          <div v-if="isLoading" class="typing-indicator">
            <div class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span class="typing-text">Thinking...</span>
          </div>
          <div v-else-if="datasetResponse" class="message-text">
            <div class="dataset-response">
              <p class="dataset-response-text">{{ datasetResponse.response }}</p>
              <div class="dataset-grid">
                <DatasetCard 
                  v-for="dataset in datasetResponse.datasets" 
                  :key="dataset.id" 
                  :dataset="dataset"
                />
              </div>
            </div>
          </div>
          <div v-else class="message-text markdown-content" v-html="renderedContent"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import DatasetCard from './DatasetCard.vue'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp?: Date
}

interface Props {
  message: Message
}

const props = defineProps<Props>()

const renderer = new marked.Renderer()
renderer.code = function({ text, lang }: { text: string; lang?: string }) {
  if (lang && hljs.getLanguage(lang)) {
    try {
      return hljs.highlight(text, { language: lang }).value
    } catch (err) {}
  }
  return hljs.highlightAuto(text).value
}

marked.setOptions({
  renderer: renderer,
  breaks: true,
  gfm: true
})

const isLoading = computed(() => 
  props.message.role === 'assistant' && !props.message.content
)

const datasetResponse = computed(() => {
  if (!props.message.content || props.message.role !== 'assistant') return null
  
  try {
    const parsed = JSON.parse(props.message.content)
    if (parsed.datasets && Array.isArray(parsed.datasets)) {
      return parsed
    }
  } catch (error) {
    const jsonMatch = props.message.content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        if (parsed.datasets && Array.isArray(parsed.datasets)) {
          return parsed
        }
      } catch (innerError) {
        console.log('Inner JSON parse failed:', innerError)
      }
    }
  }
  
  if (props.message.content.includes('"datasets"') && props.message.content.includes('"response"')) {
    console.log('Found dataset-like content but failed to parse:', props.message.content.substring(0, 200))
  }
  
  return null
})

const renderedContent = computed(() => {
  if (!props.message.content) return ''
  if (datasetResponse.value) return ''
  
  try {
    return marked.parse(props.message.content)
  } catch (error) {
    console.error('Markdown parsing error:', error)
    return props.message.content
  }
})

const messageClass = computed(() => ({
  'user-message': props.message.role === 'user',
  'assistant-message': props.message.role === 'assistant'
}))

const avatarColor = computed(() => 
  props.message.role === 'user' ? '#3b82f6' : '#10b981'
)

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}
</script>

<style scoped>
.chat-message {
  padding: 0.75rem 0;
  margin-bottom: 1rem;
}

.message-content {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  max-width: 48rem;
  margin: 0 auto;
}

.user-message .message-content {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.avatar-container {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 2px solid #f3f4f6;
}

.message-body {
  flex: 1;
  min-width: 0;
  max-width: 70%;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.user-message .message-header {
  justify-content: flex-end;
}

.message-role {
  font-weight: 600;
  font-size: 0.875rem;
  color: #374151;
}

.message-time {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 400;
}

.message-bubble {
  background: #f9fafb;
  border-radius: 1rem;
  padding: 0.875rem 1.125rem;
  max-width: 100%;
  word-wrap: break-word;
  border: 1px solid #e5e7eb;
  position: relative;
  overflow: hidden;
}

.user-message .message-bubble {
  background: #3b82f6;
  color: white;
  border: none;
  border-bottom-right-radius: 0.25rem;
}

.assistant-message .message-bubble {
  border-bottom-left-radius: 0.25rem;
}

.message-text {
  line-height: 1.6;
  font-size: 0.9375rem;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.user-message .message-text {
  color: white;
}

.assistant-message .message-text {
  color: #1f2937;
}

.dataset-response {
  width: 100%;
}

.dataset-response-text {
  margin: 0 0 1rem 0;
  color: inherit;
  font-size: inherit;
  line-height: inherit;
}

.dataset-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.typing-dots {
  display: flex;
  gap: 0.25rem;
}

.typing-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #9ca3af;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

.typing-text {
  font-size: 0.875rem;
  color: #6b7280;
  font-style: italic;
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .message-body {
    max-width: 80%;
  }
  
  .dataset-grid {
    gap: 0.5rem;
  }
  
  .message-bubble {
    padding: 0.75rem 1rem;
  }
  
  .message-text {
    font-size: 0.875rem;
  }
  
  .message-content {
    gap: 0.625rem;
  }
  
  .avatar-container {
    width: 36px !important;
    height: 36px !important;
  }
  
  .message-role {
    font-size: 0.8125rem;
  }
  
  .message-time {
    font-size: 0.6875rem;
  }
}

@media (max-width: 480px) {
  .message-body {
    max-width: 85%;
  }
  
  .dataset-response-text {
    margin-bottom: 0.75rem;
  }
  
  .dataset-grid {
    gap: 0.5rem;
  }
  
  .message-bubble {
    padding: 0.625rem 0.875rem;
    border-radius: 0.875rem;
  }
  
  .user-message .message-bubble {
    border-bottom-right-radius: 0.125rem;
  }
  
  .assistant-message .message-bubble {
    border-bottom-left-radius: 0.125rem;
  }
  
  .message-text {
    font-size: 0.8125rem;
  }
  
  .avatar-container {
    width: 32px !important;
    height: 32px !important;
  }
  
  .message-content {
    gap: 0.5rem;
  }
  
  .chat-message {
    padding: 0.5rem 0;
    margin-bottom: 0.75rem;
  }
  
  .typing-dots span {
    width: 6px;
    height: 6px;
  }
}


.markdown-content {
  overflow-wrap: break-word;
  word-wrap: break-word;
  width: 100%;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  margin: 1rem 0 0.5rem 0;
  line-height: 1.3;
  font-weight: 600;
}

.user-message .markdown-content h1,
.user-message .markdown-content h2,
.user-message .markdown-content h3,
.user-message .markdown-content h4,
.user-message .markdown-content h5,
.user-message .markdown-content h6 {
  color: rgba(255, 255, 255, 0.95);
}

.markdown-content h1 { font-size: 1.5rem; }
.markdown-content h2 { font-size: 1.3rem; }
.markdown-content h3 { font-size: 1.15rem; }
.markdown-content h4 { font-size: 1.05rem; }
.markdown-content h5 { font-size: 1rem; }
.markdown-content h6 { font-size: 0.95rem; }

.markdown-content p {
  margin: 0.75rem 0;
  line-height: 1.6;
}

.markdown-content p:first-child {
  margin-top: 0;
}

.markdown-content p:last-child {
  margin-bottom: 0;
}

.markdown-content ul,
.markdown-content ol {
  margin: 0.75rem 0;
  padding-left: 1.5rem;
}

.markdown-content li {
  margin: 0.25rem 0;
  line-height: 1.5;
}

.markdown-content blockquote {
  margin: 1rem 0;
  padding: 0.75rem 1rem;
  border-left: 4px solid #cbd5e0;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 0 0.375rem 0.375rem 0;
  font-style: italic;
}

.user-message .markdown-content blockquote {
  border-left-color: rgba(255, 255, 255, 0.4);
  background-color: rgba(255, 255, 255, 0.1);
}

.markdown-content code:not(pre code) {
  background-color: #e5e7eb;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 0.875em;
  color: #dc2626;
  font-weight: 500;
}

.user-message .markdown-content code:not(pre code) {
  background-color: rgba(255, 255, 255, 0.25);
  color: white;
}

.markdown-content pre {
  margin: 1rem 0;
  padding: 1rem;
  background-color: #0d1117;
  border-radius: 0.5rem;
  overflow-x: auto;
  border: 1px solid #30363d;
}

.markdown-content pre code {
  background: none;
  padding: 0;
  border-radius: 0;
  color: #f0f6fc;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
}

.markdown-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 1rem 0;
  border-radius: 0.375rem;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.markdown-content th,
.markdown-content td {
  border: 1px solid #e5e7eb;
  padding: 0.5rem 0.75rem;
  text-align: left;
}

.markdown-content th {
  background-color: #f9fafb;
  font-weight: 600;
}

.user-message .markdown-content table {
  border-color: rgba(255, 255, 255, 0.3);
}

.user-message .markdown-content th,
.user-message .markdown-content td {
  border-color: rgba(255, 255, 255, 0.3);
}

.user-message .markdown-content th {
  background-color: rgba(255, 255, 255, 0.1);
}

.markdown-content a {
  color: #3b82f6;
  text-decoration: underline;
  transition: color 0.2s ease;
}

.markdown-content a:hover {
  color: #1d4ed8;
}

.user-message .markdown-content a {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: underline;
}

.user-message .markdown-content a:hover {
  color: rgba(255, 255, 255, 1);
}

.markdown-content hr {
  margin: 1.5rem 0;
  border: none;
  border-top: 1px solid #e5e7eb;
}

.user-message .markdown-content hr {
  border-top-color: rgba(255, 255, 255, 0.3);
}

.markdown-content strong {
  font-weight: 700;
}

.markdown-content em {
  font-style: italic;
}

.markdown-content img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1rem 0;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.markdown-content p img {
  margin: 0.75rem 0;
}

.markdown-content p + p img:first-child {
  margin-top: 0.5rem;
}

.markdown-content p img:last-child {
  margin-bottom: 0.5rem;
}

.markdown-content img + img {
  margin-top: 0.5rem;
}

.markdown-content a img {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.markdown-content a img:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.markdown-content p img[style*="inline"] {
  display: inline-block;
  margin: 0 0.25rem;
  vertical-align: middle;
}

.markdown-content img + em {
  display: block;
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: -0.5rem;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .markdown-content h1 { font-size: 1.3rem; }
  .markdown-content h2 { font-size: 1.2rem; }
  .markdown-content h3 { font-size: 1.1rem; }
  
  .markdown-content pre {
    padding: 0.75rem;
  }
  
  .markdown-content pre code {
    font-size: 0.8125rem;
  }
  
  .markdown-content table {
    font-size: 0.875rem;
  }
  
  .markdown-content th,
  .markdown-content td {
    padding: 0.375rem 0.5rem;
  }
  
  .markdown-content img {
    margin: 0.75rem 0;
    border-radius: 0.375rem;
  }
  
  .markdown-content img + em {
    font-size: 0.8125rem;
  }
}

@media (max-width: 480px) {
  .markdown-content h1 { font-size: 1.2rem; }
  .markdown-content h2 { font-size: 1.1rem; }
  .markdown-content h3 { font-size: 1rem; }
  
  .markdown-content pre {
    padding: 0.5rem;
    margin: 0.75rem 0;
  }
  
  .markdown-content pre code {
    font-size: 0.75rem;
  }
  
  .markdown-content ul,
  .markdown-content ol {
    padding-left: 1.25rem;
  }
  
  .markdown-content blockquote {
    padding: 0.5rem 0.75rem;
    margin: 0.75rem 0;
  }
  
  .markdown-content img {
    margin: 0.5rem 0;
    border-radius: 0.25rem;
  }
}
</style>