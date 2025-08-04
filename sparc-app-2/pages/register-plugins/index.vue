<template>
  <div>
    <breadcrumb :breadcrumb="breadcrumb" title="SPARC Plugins" />
    <page-hero class="py-24">
      <h1>SPARC Plugins</h1>
      <p>Discover and register SPARC plugins that extend the platform functionality</p>
    </page-hero>
    
    <div class="container">
      <div class="subpage">
        <!-- Search and Controls -->
        <div class="search-controls-container">
          <div class="search-form">
            <el-form @submit.prevent="onSearchQuery">
              <el-row :gutter="8">
                <el-col :sm="14" :xs="24">
                  <el-input
                    v-model="searchQuery"
                    placeholder="Enter search criteria"
                    size="large"
                    @keyup.enter="onSearchQuery"
                  >
                    <template #append>
                      <el-button @click="onSearchQuery">
                        <svgo-icon-magnifying-glass />
                      </el-button>
                    </template>
                  </el-input>
                </el-col>
                <el-col :sm="6" :xs="12">
                  <el-select v-model="sortBy" placeholder="Sort" size="large" @change="onSortChanged">
                    <el-option label="A-Z" value="alphabeticalAsc" />
                    <el-option label="Z-A" value="alphabeticalDesc" />
                  </el-select>
                </el-col>
                <el-col :sm="4" :xs="12">
                  <el-button 
                    class="register-btn" 
                    type="primary" 
                    size="large"
                    @click="openModal = true"
                  >
                    Register Plugin
                  </el-button>
                </el-col>
              </el-row>
            </el-form>
          </div>
        </div>

        <!-- Results Section -->
        <div class="results-section">
          <div class="results-header">
            <div class="label2">
              {{ filteredItems.length }} Results | Page {{ currentPage }} of {{ totalPages }}
            </div>
            <el-button 
              size="small" 
              :loading="isRefreshing"
              @click="refreshPlugins"
            >
              Refresh
            </el-button>
          </div>

          <!-- Plugin Grid -->
          <div class="plugins-grid" v-if="paginatedItems.length > 0">
            <div 
              v-for="(item, index) in paginatedItems" 
              :key="index" 
              class="plugin-card"
              :data-launchable="item.source === 'metadata'"
            >
              <div class="plugin-card-content">
                <div class="plugin-header">
                  <div class="plugin-icon">
                    <svgo-icon-puzzle />
                  </div>
                  <div class="plugin-actions-corner">
                    <div class="plugin-actions-wrapper">
                      <el-button 
                        v-if="item.source === 'metadata'"
                        size="small" 
                        type="primary"
                        @click.stop="handleItemClick(item)"
                      >
                        Launch
                      </el-button>
                      <!-- API Plugin Actions -->
                      <el-button 
                        v-if="item.source === 'api' && item.status === 'pending'"
                        size="small" 
                        type="success"
                        :loading="buildingPlugins.has(item.id!)"
                        @click.stop="buildPlugin(item)"
                      >
                        {{ buildingPlugins.has(item.id!) ? 'Building...' : 'Build' }}
                      </el-button>
                      <el-button 
                        v-if="item.source === 'api' && item.status === 'building'"
                        size="small" 
                        disabled
                        @click.stop
                      >
                        Building...
                      </el-button>
                      <el-button 
                        v-if="item.source === 'api' && item.status === 'completed'"
                        size="small" 
                        type="success"
                        @click.stop="submitToApproval(item)"
                      >
                        Submit to Approval
                      </el-button>
                      <el-button 
                        v-if="item.source === 'api' && item.status === 'failed'"
                        size="small" 
                        type="danger"
                        :loading="buildingPlugins.has(item.id!)"
                        @click.stop="buildPlugin(item)"
                      >
                        {{ buildingPlugins.has(item.id!) ? 'Rebuilding...' : 'Rebuild' }}
                      </el-button>
                      
                      <!-- Three-dot menu for plugins -->
                      <el-dropdown 
                        trigger="click"
                        placement="bottom-end"
                        @click.stop
                      >
                        <span class="el-dropdown-link">
                          <el-button 
                            class="plugin-menu-btn"
                            size="small"
                            text
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="5" r="2" fill="currentColor"/>
                              <circle cx="12" cy="12" r="2" fill="currentColor"/>
                              <circle cx="12" cy="19" r="2" fill="currentColor"/>
                            </svg>
                          </el-button>
                        </span>
                        <template #dropdown>
                          <el-dropdown-menu>
                            <el-dropdown-item 
                              @click="buildPlugin(item)"
                            >
                            Rebuild Plugin
                            </el-dropdown-item>
                            <el-dropdown-item 
                              @click="submitToApproval(item)"
                            >
                              Submit to Approval
                            </el-dropdown-item>
                            <el-dropdown-item 
                              @click="deletePlugin(item)"
                              class="delete-menu-item"
                            >
                              <span style="color: #F56C6C;">Delete Plugin</span>
                            </el-dropdown-item>
                          </el-dropdown-menu>
                        </template>
                      </el-dropdown>
                    </div>
                  </div>
                </div>
                <div class="plugin-info">
                  <h3 class="plugin-name">{{ item.name }}</h3>
                  <p class="plugin-description">{{ item.description || 'No description available' }}</p>
                  <div class="plugin-meta">
                    <span v-if="item.version" class="plugin-version">v{{ item.version }}</span>
                    <span v-if="item.author" class="plugin-author">by {{ item.author }}</span>
                    <span v-if="item.status" class="plugin-status" :class="`status-${item.status}`">
                      {{ item.status.charAt(0).toUpperCase() + item.status.slice(1) }}
                    </span>
                  </div>
                </div>
                <div v-if="item.created_at" class="plugin-created-corner">
                  <span class="plugin-created">{{ formatDate(item.created_at) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- No Results -->
          <div v-else class="no-results">
            <div class="no-results-content">
              <svgo-icon-magnifying-glass />
              <h3>No plugins found</h3>
              <p>Try adjusting your search terms or browse all available plugins.</p>
            </div>
          </div>

          <!-- Pagination -->
          <div class="pagination-container" v-if="totalPages > 1">
            <el-pagination
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="filteredItems.length"
              layout="prev, pager, next"
              @current-change="onPageChanged"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Registration Modal -->
    <FancyModal :visible="openModal" @close="closeModal">
      <div class="plugin-registration-form">
        <div class="form-header">
          <h3 class="section-title">Register New Plugin</h3>
          <p class="form-subtitle">Contribute to the SPARC ecosystem by registering your plugin</p>
        </div>

        <!-- Stepper -->
        <div class="stepper-container">
          <el-steps :active="currentStep" finish-status="success" align-center>
            <el-step title="Registration" description="Fill out plugin details" />
            <el-step title="Build & Test" description="Build and test plugin" />
            <el-step title="Complete" description="Ready to use" />
          </el-steps>
        </div>
        
        <!-- Step 0: Registration Form -->
        <el-form
          v-if="currentStep === 0"
          ref="submitForm"
          label-position="top"
          :model="registrationForm"
          :rules="formRules"
          :hide-required-asterisk="true"
          @submit.prevent="submitRegistration"
        >
          <!-- Plugin Information -->
          <div class="form-section">
            <h3 class="section-title">Plugin Information</h3>
            
            <!-- Source URL Field -->
            <div class="form-full-width">
              <el-form-item prop="repository_url" label="Source URL *">
                <el-input 
                  v-model="registrationForm.repository_url" 
                  placeholder="https://github.com/user/repo.git or ./plugins/MyApp"
                  size="large"
                />
                <div class="form-help">
                  Git repository URL or local path
                </div>
              </el-form-item>
            </div>

            <!-- Optional Fields Row: Name, Author, Version -->
            <div class="form-row form-row-three">
              <div class="form-column-third">
                <el-form-item prop="name" label="Plugin Name">
                  <el-input 
                    v-model="registrationForm.name" 
                    placeholder="My Awesome Plugin"
                    size="large"
                  />
                </el-form-item>
              </div>

              <div class="form-column-third">
                <el-form-item prop="author" label="Author">
                  <el-input 
                    v-model="registrationForm.author" 
                    placeholder="Your name"
                    size="large"
                  />
                </el-form-item>
              </div>

              <div class="form-column-third">
                <el-form-item prop="version" label="Version">
                  <el-input 
                    v-model="registrationForm.version" 
                    placeholder="1.0.0"
                    size="large"
                  />
                  <div class="form-help">
                    Semantic versioning (e.g., 1.0.0)
                  </div>
                </el-form-item>
              </div>
            </div>

            <!-- Description - Full Width -->
            <div class="form-full-width">
              <el-form-item prop="description" label="Description">
                <el-input 
                  v-model="registrationForm.description" 
                  type="textarea"
                  :rows="3"
                  placeholder="Brief description of your plugin..."
                  size="large"
                />
              </el-form-item>
            </div>

            <!-- Build Command - Full Width -->
            <div class="form-full-width">
              <el-form-item prop="plugin_metadata.build_command" label="Build Command">
                <el-input 
                  v-model="registrationForm.plugin_metadata.build_command" 
                  placeholder="npm run build"
                  size="large"
                />
                <div class="form-help">
                  Command to build your plugin (e.g., npm run build, yarn build)
                </div>
              </el-form-item>
            </div>
          </div>

          <!-- Terms and Submission -->
          <div class="form-section">
            <el-form-item prop="agreeToTerms">
              <el-checkbox v-model="registrationForm.agreeToTerms">
                <span class="terms-text">
                  I agree that my plugin will be reviewed before being published on the SPARC Portal *
                </span>
              </el-checkbox>
            </el-form-item>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <el-button 
              size="large" 
              @click="closeModal"
            >
              Cancel
            </el-button>
            <el-button 
              type="primary" 
              size="large"
              :loading="isSubmitting"
              :disabled="!isFormValid || isSubmitting"
              @click="submitRegistration"
            >
              {{ isSubmitting ? 'Submitting...' : 'Submit Plugin' }}
            </el-button>
          </div>

          <p v-if="submitError" class="error-message">
            {{ submitError }}
          </p>
        </el-form>

        <!-- Step 1: Build & Test Process -->
        <div v-if="currentStep === 1" class="step-content">
          <div class="step-icon">
            <svgo-icon-cog />
          </div>
          <h3>Build & Test Plugin</h3>
          <p>Your plugin "<strong>{{ submittedPlugin?.name }}</strong>" has been submitted and is ready to build and test.</p>
          
          <div class="step-actions">
            <el-button 
              @click="buildSubmittedPlugin" 
              type="success" 
              size="large"
              :loading="isSubmitting"
            >
              {{ isSubmitting ? 'Building & Testing...' : 'Build & Test Plugin' }}
            </el-button>
            <el-button @click="closeModal" size="large">
              Close
            </el-button>
          </div>
        </div>

        <!-- Step 2: Complete -->
        <div v-if="currentStep === 2" class="step-content">
          <div class="step-icon success">
            <svgo-icon-check-circle />
          </div>
          <h3>Plugin Ready!</h3>
          <p>Your plugin "<strong>{{ submittedPlugin?.name }}</strong>" has been built successfully and is now available.</p>
          
          <div class="step-actions">
            <el-button @click="closeModal" type="primary" size="large">
              Done
            </el-button>
          </div>
        </div>
      </div>
    </FancyModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRemoteAppStore } from '@/store/remoteStore'
import FancyModal from '@/components/FancyModal/FancyModal.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

type Item = {
    name: string;
    expose: string;
    description: string;
    id?: string;
    status?: 'pending' | 'approved' | 'built' | 'failed';
    version?: string;
    author?: string;
    build_status?: string;
    source?: 'api' | 'metadata';
    created_at?: string;
    repository_url?: string;
}

// Reactive data
const openModal = ref(false)
const items = ref<Item[]>([])
const searchQuery = ref('')
const sortBy = ref('alphabeticalAsc')
const currentPage = ref(1)
const pageSize = ref(12)
const buildingPlugins = ref(new Set<string>())
const isRefreshing = ref(false)

// API Configuration
const API_BASE_URL = process.env.PLUGIN_API || 'http://localhost:8000'

const remoteAppStore = useRemoteAppStore()
const router = useRouter()

const breadcrumb = [
  {
    label: 'Home',
    to: { name: 'index' }
  },
  {
    label: 'SPARC Plugins'
  }
]

const submitForm = ref()
const isSubmitting = ref(false)
const submitError = ref('')
const currentStep = ref(0)
const submittedPlugin = ref<any>(null)

const registrationForm = ref({
  name: '',
  version: '1.0.0',
  description: '',
  author: '',
  repository_url: '',
  plugin_metadata: {
    build_command: 'npm run build'
  },
  agreeToTerms: false
})


const formRules = {
  repository_url: [
    { required: true, message: 'Please enter the source URL or local path', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: (error?: Error) => void) => {
        if (!value) {
          callback(new Error('Source URL or local path is required'))
          return
        }
        // Allow Git URLs or local paths
        const isGitUrl = /^https?:\/\/.+/.test(value) || value.startsWith('git@')
        const isLocalPath = value.startsWith('./plugins/') || 
                           value.startsWith('/plugins/') || 
                           value.startsWith('plugins/') ||
                           !value.includes('://')  // Simple folder name like "MyApp"
        
        if (!isGitUrl && !isLocalPath) {
          callback(new Error('Please enter a valid Git URL or local path (e.g., ./plugins/MyApp, plugins/MyApp, or MyApp)'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  version: [
    {
      pattern: /^\d+\.\d+\.\d+$/,
      message: 'Version must be in semantic versioning format (e.g., 1.0.0)',
      trigger: 'blur'
    }
  ],
  agreeToTerms: [
    {
      validator: (rule: any, value: boolean, callback: (error?: Error) => void) => {
        if (!value) {
          callback(new Error('You must agree to the terms to submit your plugin'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

const filteredItems = computed(() => {
  let filtered = [...items.value]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(query) ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      (item.author && item.author.toLowerCase().includes(query))
    )
  }

  filtered.sort((a, b) => {
    const nameA = a.name.toLowerCase()
    const nameB = b.name.toLowerCase()
    
    if (sortBy.value === 'alphabeticalAsc') {
      return nameA.localeCompare(nameB)
    } else {
      return nameB.localeCompare(nameA)
    }
  })

  return filtered
})

const totalPages = computed(() => {
  return Math.ceil(filteredItems.value.length / pageSize.value)
})

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredItems.value.slice(start, end)
})

const isFormValid = computed(() => {
  const form = registrationForm.value
  return (
    form.repository_url.trim() !== '' &&
    form.agreeToTerms
  )
})

const onSearchQuery = () => {
  currentPage.value = 1
}

const onSortChanged = () => {
  currentPage.value = 1
}

const onPageChanged = (page: number) => {
  currentPage.value = page
}

const handleItemClick = (item: Item) => {
  remoteAppStore.setRemoteApp(item)
  router.push('/remote')
}


const closeModal = () => {
  openModal.value = false
  resetForm()
  submitError.value = ''
  currentStep.value = 0
  submittedPlugin.value = null
}


const resetForm = () => {
  registrationForm.value = {
    name: '',
    version: '1.0.0',
    description: '',
    author: '',
    repository_url: '',
    plugin_metadata: {
      build_command: 'npm run build'
    },
    agreeToTerms: false
  }
  if (submitForm.value) {
    submitForm.value.resetFields()
  }
}

const submitRegistration = async () => {
  if (!submitForm.value) return
  
  try {
    await submitForm.value.validate()
  } catch (error) {
    console.error('Form validation failed:', error)
    return
  }

  isSubmitting.value = true
  submitError.value = ''

  try {
    const payload = {
      name: registrationForm.value.name,
      version: registrationForm.value.version,
      description: registrationForm.value.description,
      author: registrationForm.value.author,
      repository_url: registrationForm.value.repository_url,
      plugin_metadata: {
        build_command: registrationForm.value.plugin_metadata.build_command
      }
    }

    const response = await fetch(`${API_BASE_URL}/plugins/`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `API Error: ${response.status}`)
    }

    const result = await response.json()
    console.log('Plugin registered successfully:', result)
    
    submittedPlugin.value = result
    
    currentStep.value = 1
    
    await loadPluginsFromAPI()
    
  } catch (error: any) {
    console.error('Registration failed:', error)
    submitError.value = error.message || 'Failed to submit registration. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

const buildSubmittedPlugin = async () => {
  if (!submittedPlugin.value?.id) return
  
  isSubmitting.value = true
  
  try {
    const response = await fetch(`${API_BASE_URL}/plugins/${submittedPlugin.value.id}/build/`, {
      method: 'POST',
      headers: {
        'accept': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `Build failed: ${response.status}`)
    }

    const result = await response.json()
    console.log('Plugin built and tested successfully:', result)
    
    // Move to complete step
    currentStep.value = 2
    
    // Refresh the plugins list to get updated status
    await loadPluginsFromAPI()
    
  } catch (error: any) {
    console.error('Build failed:', error)
    ElMessage({
      message: error.message || 'Failed to build and test plugin. Please try again.',
      type: 'error',
      duration: 5000
    })
  } finally {
    isSubmitting.value = false
  }
}

const buildPlugin = async (plugin: Item) => {
  if (!plugin.id) return
  
  buildingPlugins.value.add(plugin.id)
  
  try {
    const response = await fetch(`${API_BASE_URL}/plugins/${plugin.id}/build/`, {
      method: 'POST',
      headers: {
        'accept': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `Build failed: ${response.status}`)
    }

    const result = await response.json()
    console.log('Plugin built successfully:', result)
    
    ElMessage({
      message: `Plugin "${plugin.name}" build submitted successfully! It will be available shortly.`,
      type: 'success',
      duration: 3000
    })
    
    // Refresh the plugins list to get updated status
    await loadPluginsFromAPI()
    
  } catch (error: any) {
    console.error('Build failed:', error)
    ElMessage({
      message: error.message || 'Failed to build plugin. Please try again.',
      type: 'error',
      duration: 5000
    })
  } finally {
    buildingPlugins.value.delete(plugin.id)
  }
}

const submitToApproval = async (plugin: Item) => {
  if (!plugin.id) return
  
  // Show confirmation dialog
  try {
    await ElMessageBox.confirm(
      `Submit plugin "${plugin.name}" for approval? This will make it available for review.`,
      'Submit to Approval',
      {
        confirmButtonText: 'Submit',
        cancelButtonText: 'Cancel',
        type: 'info'
      }
    )
  } catch {
    // User cancelled
    return
  }
  
  try {
    // For now, we'll just show a success message
    // In the future, this could call an API endpoint to submit for approval
    ElMessage({
      message: `Plugin "${plugin.name}" has been submitted for approval successfully.`,
      type: 'success',
      duration: 3000
    })
    
  } catch (error: any) {
    console.error('Submit to approval failed:', error)
    ElMessage({
      message: error.message || 'Failed to submit plugin for approval. Please try again.',
      type: 'error',
      duration: 5000
    })
  }
}

const deletePlugin = async (plugin: Item) => {
  if (!plugin.id) return
  
  // Show confirmation dialog
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete the plugin "${plugin.name}"? This action cannot be undone.`,
      'Delete Plugin',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
  } catch {
    // User cancelled
    return
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/plugins/${plugin.id}`, {
      method: 'DELETE',
      headers: {
        'accept': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `Delete failed: ${response.status}`)
    }

    ElMessage({
      message: `Plugin "${plugin.name}" has been deleted successfully.`,
      type: 'success',
      duration: 3000
    })
    
    // Refresh the plugins list
    await loadPluginsFromAPI()
    
  } catch (error: any) {
    console.error('Delete failed:', error)
    ElMessage({
      message: error.message || 'Failed to delete plugin. Please try again.',
      type: 'error',
      duration: 5000
    })
  }
}

const loadPluginsFromAPI = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/plugins/`)
    if (response.ok) {
      const apiPlugins = await response.json()
      
      // Convert API response to our Item format and get build status
      const formattedPlugins = await Promise.all(apiPlugins.map(async (plugin: any) => {
        let buildStatus = 'pending'
        
        // Get the latest build status for this plugin
        try {
          const buildsResponse = await fetch(`${API_BASE_URL}/plugins/${plugin.id}/builds/`)
          if (buildsResponse.ok) {
            const builds = await buildsResponse.json()
            if (builds.length > 0) {
              // Get the most recent build
              const latestBuild = builds.sort((a: any, b: any) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              )[0]
              buildStatus = latestBuild.status
            }
          }
        } catch (buildError) {
          console.warn(`Failed to fetch builds for plugin ${plugin.id}:`, buildError)
        }
        
        return {
          id: plugin.id,
          name: plugin.name,
          description: plugin.description,
          version: plugin.version,
          author: plugin.author,
          expose: plugin.plugin_metadata?.expose || '',
          status: buildStatus,
          source: 'api' as const,
          created_at: plugin.created_at,
          repository_url: plugin.repository_url
        }
      }))
      
      await loadPluginsFromMetadata()
      
      // Filter out API plugins that already exist in metadata (metadata takes priority)
      const metadataNames = new Set(items.value.filter(p => p.source === 'metadata').map(p => p.name))
      const uniqueApiPlugins = formattedPlugins.filter(plugin => !metadataNames.has(plugin.name))
      
      items.value = [...items.value, ...uniqueApiPlugins]
    }
  } catch (error) {
    console.error('Failed to load plugins from API:', error)
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 30) return `${diffDays} days ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}


const loadPluginsFromMetadata = async () => {
  try {
    const res = await fetch('/metadata.json')
    if (!res.ok) throw new Error(`Failed to fetch metadata.json: ${res.status}`)

    const data = await res.json()
    const metadataPlugins: Item[] = []
    
    if (Array.isArray(data.conponents)) {
      metadataPlugins.push(...data.conponents)
    }
    if (Array.isArray(data.components)) {
      metadataPlugins.push(...data.components)
    }
    
    items.value = metadataPlugins.map(plugin => ({
      ...plugin,
      status: 'built' as const,
      source: 'metadata' as const
    }))
    
  } catch (err) {
    console.error('Error loading metadata.json:', err)
  }
}

const refreshPlugins = async () => {
  isRefreshing.value = true
  try {
    // Clear existing items
    items.value = []
    // Reload plugins from both sources
    await loadPluginsFromMetadata()
    await loadPluginsFromAPI()
  } catch (error) {
    console.error('Failed to refresh plugins:', error)
  } finally {
    isRefreshing.value = false
  }
}

onMounted(async () => {
  // Load plugins from both metadata.json and API
  await loadPluginsFromMetadata()
  await loadPluginsFromAPI()
})
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';

.search-controls-container {
  background: #f9f9fb;
  border: 1px solid #dcdfe6;
  padding: 1rem;
  margin-bottom: 2rem;
  border-radius: 4px;
}

.search-form {
  max-width: 100%;
  
  :deep(.el-input-group__append) {
    padding: 0;
    border-left: none;
  }
  
  :deep(.el-input-group__append .el-button) {
    border: none;
    border-radius: 0 6px 6px 0;
    padding: 0 12px;
    margin: 0;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  :deep(.el-input-group__append .el-button svg) {
    width: 16px;
    height: 16px;
  }
  
  :deep(.el-input__wrapper) {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
}

.register-btn {
  width: 100%;
}

.results-section {
  min-height: 600px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #dcdfe6;
}

.plugins-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.plugin-card {
  background: white;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  height: 200px;
  display: flex;
  flex-direction: column;
  position: relative;
  
  &[data-launchable="true"] {
    cursor: pointer;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-color: $purple;
    }
  }
  
  &[data-launchable="false"] {
    cursor: default;
    opacity: 0.8;
    
    &:hover {
      transform: none;
      box-shadow: none;
      border-color: #dcdfe6;
    }
  }
}

.plugin-card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.plugin-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.plugin-icon {
  width: 48px;
  height: 48px;
  background: $purple;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.plugin-actions-corner {
  flex-shrink: 0;
}

.plugin-actions-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.plugin-menu-btn {
  padding: 4px !important;
  min-width: 32px !important;
  height: 32px !important;
  border: 1px solid #dcdfe6 !important;
  background: white !important;
  
  &:hover {
    background: #f5f7fa !important;
    border-color: $purple !important;
    color: $purple !important;
  }
  
  svg {
    width: 20px;
    height: 20px;
    color: #606266;
  }
  
  &:hover svg {
    color: $purple;
  }
}

.delete-menu-item {
  &:hover {
    background-color: #fef0f0;
  }
}

.plugin-info {
  flex: 1;
}

.plugin-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #333;
  line-height: 1.3;
}

.plugin-description {
  color: #666;
  font-size: 0.9rem;
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.plugin-meta {
  font-size: 0.8rem;
  color: #888;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.plugin-expose, .plugin-version, .plugin-author, .plugin-created, .plugin-status {
  background: #f0f2f5;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
}

.plugin-expose {
  font-family: monospace;
}

.plugin-version {
  background: #e8f4f8;
  color: #2c5aa0;
  font-weight: 500;
}

.plugin-author {
  background: #f0f9ff;
  color: #1e40af;
}

.plugin-created {
  background: #f0fdf4;
  color: #166534;
  font-weight: 500;
}

.plugin-status {
  font-weight: 500;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-building {
  background: #dbeafe;
  color: #1e40af;
}

.status-completed, .status-built {
  background: #dcfce7;
  color: #166534;
}

.status-failed {
  background: #fecaca;
  color: #dc2626;
}

.status-approved {
  background: #e0e7ff;
  color: #3730a3;
}

.plugin-created-corner {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
}

.no-results {
  text-align: center;
  padding: 4rem 2rem;
}

.no-results-content {
  max-width: 400px;
  margin: 0 auto;
}

.no-results-content svg {
  width: 64px;
  height: 64px;
  color: #ccc;
  margin-bottom: 1rem;
}

.no-results-content h3 {
  color: #666;
  margin-bottom: 0.5rem;
}

.no-results-content p {
  color: #888;
  font-size: 0.9rem;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

// Form styles
.plugin-registration-form {
  max-width: 100%;
  margin: 0;
  padding: 0 1rem;
}

.stepper-container {
  margin-bottom: 1.5rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.form-header {
  text-align: center;
  margin-bottom: 1.5rem;
  
  .section-title {
    color: $purple;
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid $purple;
    display: inline-block;
  }
  
  .form-subtitle {
    color: #666;
    font-size: 0.95rem;
    margin: 0;
  }
}

.form-section {
  background: #fafbfc;
  border: 1px solid #e1e4e8;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  
  .section-title {
    color: $purple;
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid $purple;
  }
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.form-row-three {
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
}



.form-full-width {
  margin-bottom: 1rem;
}

.form-help {
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.25rem;
  line-height: 1.4;
}


.terms-text {
  font-size: 0.9rem;
  line-height: 1.4;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e1e4e8;
}

.error-message {
  color: $danger;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  text-align: center;
}

.step-content {
  text-align: center;
  padding: 2rem;
  
  .step-icon {
    margin-bottom: 1rem;
    color: $purple;
    
    svg {
      width: 48px;
      height: 48px;
    }
    
    &.success {
      color: #67c23a;
    }
  }
  
  h3 {
    margin-bottom: 1rem;
    color: #333;
  }
  
  p {
    margin-bottom: 1rem;
    color: #666;
    line-height: 1.5;
  }
}

.step-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

// Element Plus form overrides for plugin form
:deep(.el-form-item__label) {
  color: #333 !important;
  font-weight: 500 !important;
  font-size: 0.9rem !important;
}

:deep(.el-input__wrapper) {
  border-radius: 6px;
}

:deep(.el-textarea__inner) {
  border-radius: 6px;
}

:deep(.el-checkbox__label) {
  font-size: 0.9rem;
  line-height: 1.4;
}

:deep(.el-radio__label) {
  font-size: 0.9rem;
}


// Responsive design
@media (max-width: 768px) {
  .plugins-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .plugin-card {
    height: auto;
    min-height: 180px;
  }
  
  .search-controls-container {
    padding: 0.75rem;
  }
  
  .plugin-registration-form {
    max-width: 100%;
    padding: 0 1rem;
  }
  
  .form-section {
    padding: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .form-row-three {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .form-actions {
    flex-direction: column;
    
    .el-button {
      width: 100%;
    }
  }
}

@media (max-width: 576px) {
  .results-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .form-header h2 {
    font-size: 1.5rem;
  }
}
</style>