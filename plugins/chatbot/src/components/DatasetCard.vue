<template>
  <div class="dataset-card">
    <div class="dataset-banner" v-if="dataset.banner">
      <img :src="dataset.banner" :alt="dataset.name" />
    </div>
    
    <div class="dataset-content">
      <div class="dataset-header">
        <h3 class="dataset-title">{{ dataset.name }}</h3>
        <span class="dataset-version">v{{ dataset.version }}</span>
      </div>
      
      <div class="dataset-meta">
        <div class="dataset-date">
          <v-icon size="14">mdi-calendar</v-icon>
          {{ formatDate(dataset.date) }}
        </div>
        <div class="dataset-size">
          <v-icon size="14">mdi-database</v-icon>
          {{ formatFileSize(dataset.size) }}
        </div>
      </div>
      
      <div class="dataset-tags" v-if="dataset.tags?.length">
        <span 
          v-for="tag in dataset.tags.slice(0, 4)" 
          :key="tag" 
          class="dataset-tag"
        >
          {{ tag }}
        </span>
        <span v-if="dataset.tags.length > 4" class="dataset-tag-more">
          +{{ dataset.tags.length - 4 }} more
        </span>
      </div>
      
      <div class="dataset-actions">
        <a 
          :href="`https://doi.org/${dataset.doi}`" 
          target="_blank" 
          class="dataset-link"
        >
          <v-icon size="16">mdi-open-in-new</v-icon>
          View Dataset
        </a>
        <div class="dataset-license">
          <v-icon size="14">mdi-license</v-icon>
          {{ dataset.license }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Dataset {
  name: string
  version: number
  date: string
  doi: string
  banner?: string
  id: number
  size: number
  license: string
  tags?: string[]
}

interface Props {
  dataset: Dataset
}

defineProps<Props>()

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
</script>

<style scoped>
.dataset-card {
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  overflow: hidden;
  margin: 0;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  width: 100%;
}

.dataset-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.dataset-banner {
  width: 100%;
  height: 120px;
  overflow: hidden;
  background: #f3f4f6;
}

.dataset-banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dataset-content {
  padding: 1rem;
}

.dataset-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.dataset-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  line-height: 1.4;
  flex: 1;
  margin-right: 0.5rem;
}

.dataset-version {
  background: #e5e7eb;
  color: #374151;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  flex-shrink: 0;
}

.dataset-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.dataset-date,
.dataset-size {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.dataset-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-bottom: 0.75rem;
}

.dataset-tag {
  background: #f3f4f6;
  color: #374151;
  padding: 0.125rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.dataset-tag-more {
  background: #e5e7eb;
  color: #6b7280;
  padding: 0.125rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-style: italic;
}

.dataset-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.dataset-link {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: #3b82f6;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.2s ease;
}

.dataset-link:hover {
  color: #1d4ed8;
}

.dataset-license {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #6b7280;
  font-size: 0.75rem;
}

/* Responsive Design */
@media (max-width: 480px) {
  .dataset-content {
    padding: 0.75rem;
  }
  
  .dataset-banner {
    height: 100px;
  }
  
  .dataset-title {
    font-size: 0.9375rem;
  }
  
  .dataset-meta {
    flex-direction: column;
    gap: 0.375rem;
  }
  
  .dataset-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>