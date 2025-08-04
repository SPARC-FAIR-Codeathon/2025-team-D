<template>
  <div>
    <!-- Configuration Panel -->
    <div v-if="showConfigPanel" class="config-panel">
      <div class="config-header">
        <h3>Configure {{ componentName }}</h3>
        <button @click="showConfigPanel = false" class="close-btn">×</button>
      </div>
      
      <div class="config-form">
        <!-- Mode Toggle -->
        <div class="mode-toggle">
          <button 
            @click="configMode = 'form'" 
            :class="{ active: configMode === 'form' }"
            class="mode-btn"
          >
            Form Mode
          </button>
          <button 
            @click="configMode = 'json'" 
            :class="{ active: configMode === 'json' }"
            class="mode-btn"
          >
            JSON Mode
          </button>
        </div>

        <!-- Form Mode -->
        <div v-if="configMode === 'form'" class="form-mode">
          <div v-if="Object.keys(typedRequiredProps).length === 0" class="no-config-message">
            <p>No configuration options found for this component.</p>
            <p>Try switching to JSON mode to paste custom configuration, or check if the component defines its configuration in metadata.json.</p>
          </div>
          <div v-else v-for="(prop, key) in typedRequiredProps" :key="key" class="prop-group">
            <label :for="key">{{ prop.label }}:</label>
            <input
              v-if="prop.type === 'string' || prop.type === 'number'"
              :id="key"
              v-model="configValues[key]"
              :type="prop.type === 'number' ? 'number' : 'text'"
              :placeholder="prop.placeholder ? String(prop.placeholder) : ''"
              class="prop-input"
            />
            <select
              v-else-if="prop.type === 'select'"
              :id="key"
              v-model="configValues[key]"
              class="prop-select"
            >
              <option v-for="option in prop.options" :key="option.value" :value="String(option.value)">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- JSON Mode -->
        <div v-if="configMode === 'json'" class="json-mode">
          <div class="json-info">
            <p>Paste your configuration as JSON:</p>
          </div>
          <textarea
            v-model="jsonConfig"
            placeholder="Paste your JSON configuration here..."
            class="json-textarea"
            :class="{ 'error': jsonError }"
          ></textarea>
          <div v-if="jsonError" class="json-error">
            <p>Invalid JSON: {{ jsonError }}</p>
          </div>
        </div>
        
        <div class="config-actions">
          <button @click="applyConfig" class="apply-btn">Apply Configuration</button>
          <button @click="resetConfig" class="reset-btn">Reset</button>
          <button @click="clearStoredConfig" class="clear-btn">Clear Stored</button>
        </div>
      </div>
    </div>

    <!-- Component Mount Area -->
    <div class="component-container">
      <div v-if="showConfigButton" class="config-toggle">
        <button @click="showConfigPanel = true" class="config-btn">⚙️ Configure</button>
      </div>
      
          <!-- Isolated Container for remote components -->
    <div v-if="mountTarget" ref="mountContainer" class="remote-component-frame"></div>
    <div v-else class="remote-component-frame">
      <div class="remote-component-isolation">
        <component :is="remoteApp" />
      </div>
    </div>
      
      <!-- API Error Notice -->
      <div v-if="apiError" class="api-error">
        <p>API connection failed. Configure the component settings above.</p>
      </div>
      
      <!-- Success Message -->
      <div v-if="successMessage" class="success-message">
        <p>{{ successMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// TypeScript interfaces for configuration
interface ConfigOption {
  value: string | number
  label: string
}

interface ConfigProperty {
  label: string
  type: 'string' | 'number' | 'select'
  placeholder?: string | number
  default: string | number
  options?: ConfigOption[]
}

interface ConfigObject {
  [key: string]: ConfigProperty
}

const props = defineProps({
  src: String,
  expose: String,
  componentProps: {
    type: Object,
    default: () => ({})
  }
})

import { onMounted, shallowRef, ref, nextTick, computed } from 'vue'
import { createApp } from 'vue'

const remoteApp = shallowRef<any>(null)
const mountTarget = ref(false)
const mountContainer = ref<HTMLElement | null>(null)
const mountedAppInstance = ref<any>(null)


const showConfigPanel = ref(false)
const showConfigButton = ref(false)
const apiError = ref(false)
const componentName = ref('')
const requiredProps = ref<ConfigObject>({})
const configValues = ref<Record<string, string | number>>({})
const jsonConfig = ref<string>('')
const configMode = ref<'form' | 'json'>('form')
const jsonError = ref<string | null>(null)
const successMessage = ref<string | null>(null)

// Computed property to ensure proper typing in template
const typedRequiredProps = computed(() => requiredProps.value as ConfigObject)

onMounted(async () => {
  try {
    await loadScript(props.src!)
    const remoteModule = (window as any)[props.expose!]
    
    console.log('Remote module loaded:', props.expose, remoteModule)
    
    if (!remoteModule) {
      console.error('Module not found on window:', props.expose)
      console.log('Available window properties:', Object.keys(window).filter(key => key.includes('Simulation') || key.includes('Chatbot')))
      return
    }
    
    // Detect the type of export and handle accordingly
    const componentType = detectComponentType(remoteModule)
    
    // Setup component configuration
    await setupComponentConfig(props.expose!)
    
    await handleComponentMount(remoteModule, componentType)
  } catch (error) {
    console.error('Error loading remote component:', error)
  }
})

function detectComponentType(module: any) {
  console.log('Detecting component type for:', module, typeof module)
  
  // Type 1: Vue App instance (has mount method)
  if (module && typeof module.mount === 'function') {
    console.log('Detected: app-instance')
    return 'app-instance'
  }
  
  // Type 2: App factory function (function that returns app instance)
  if (typeof module === 'function') {
    try {
      const result = module()
      if (result && typeof result.mount === 'function') {
        console.log('Detected: app-factory')
        return 'app-factory'
      }
    } catch (e) {
      // Not an app factory, might be a component constructor
      console.log('Function test failed:', e)
    }
  }
  
  // Type 3: Module with createApp factory
  if (module && typeof module.createApp === 'function') {
    console.log('Detected: create-app-factory')
    return 'create-app-factory'
  }
  
  // Type 4: Module with app factory
  if (module && typeof module.createSimulationVuerApp === 'function') {
    console.log('Detected: named-app-factory')
    return 'named-app-factory'
  }
  
  // Type 5: Module with default export that's a component
  if (module && module.default && (module.default.render || module.default.template || module.default.__vccOpts || module.default.setup)) {
    console.log('Detected: default-component')
    return 'default-component'
  }
  
  // Type 6: Direct Vue component (check for Vue component properties)
  if (module && (module.render || module.template || module.__vccOpts || module.setup || module.name)) {
    console.log('Detected: direct-component')
    return 'direct-component'
  }
  
  // Type 7: UMD module with named exports (SimulationVuer case)
  if (module && typeof module === 'object') {
    const keys = Object.keys(module)
    console.log('Module keys:', keys)
    
    // Generic named component detection
    for (const key of keys) {
      const exported = module[key]
      if (exported && (exported.render || exported.template || exported.__vccOpts || exported.setup)) {
        console.log('Detected: named-component', key)
        return 'named-component'
      }
    }
  }
  
  console.log('Unknown component type, module structure:', Object.keys(module || {}))
  return 'unknown'
}

async function handleComponentMount(module: any, type: string) {
  await nextTick()
  
  switch (type) {
    case 'app-instance':
      // Direct app instance - mount normally
      mountTarget.value = true
      await nextTick()
      if (mountContainer.value) {
        mountedAppInstance.value = module.mount(mountContainer.value)
      }
      break
      
    case 'app-factory':
      // Function that returns app instance
      mountTarget.value = true
      await nextTick()
      if (mountContainer.value) {
        const app = module()
        mountedAppInstance.value = app.mount(mountContainer.value)
      }
      break
      
    case 'create-app-factory':
      // Module with createApp method
      mountTarget.value = true
      await nextTick()
      if (mountContainer.value) {
        const app = module.createApp({...props.componentProps, ...configValues.value})
        mountedAppInstance.value = app.mount(mountContainer.value)
      }
      break
      
    case 'named-app-factory':
      // Module with specific named factory
      mountTarget.value = true  
      await nextTick()
      if (mountContainer.value) {
        const app = module.createSimulationVuerApp({...props.componentProps, ...configValues.value})
        mountedAppInstance.value = app.mount(mountContainer.value)
      }
      break
      
    case 'default-component':
      // Module with default export component
      remoteApp.value = createComponentWrapper(module.default)
      break
      
    case 'direct-component':
      // Direct component export
      remoteApp.value = createComponentWrapper(module)
      break
            
    case 'named-component':
      // Find the first component in named exports
      const keys = Object.keys(module)
      for (const key of keys) {
        const exported = module[key]
        if (exported && (exported.render || exported.template || exported.__vccOpts || exported.setup)) {
          remoteApp.value = createComponentWrapper(exported)
          break
        }
      }
      break
      
    default:
      console.warn('Unknown component type:', type, module)
      console.log('Module details:', {
        type: typeof module,
        keys: Object.keys(module || {}),
        module
      })
      // Fallback: try to use as direct component
      remoteApp.value = module
  }
}

async function setupComponentConfig(exposeName: string) {
  componentName.value = exposeName
  
  const config = await detectComponentConfig(exposeName)
  
  requiredProps.value = config
  
  configValues.value = {}
  Object.keys(config).forEach(key => {
    configValues.value[key] = config[key].default
  })

  jsonConfig.value = JSON.stringify(configValues.value, null, 2)
  
  showConfigButton.value = true
  
  if (Object.keys(config).length > 0) {
    await remountWithNewConfig(configValues.value)
  }
  
  monitorApiErrors()
}

async function detectComponentConfig(exposeName: string): Promise<ConfigObject> {
  // 1. Try to get config from the component itself (if it exposes a config schema)
  const componentConfig = tryGetComponentConfig(exposeName)
  if (componentConfig && Object.keys(componentConfig).length > 0) {
    console.log('Using component-provided config for:', exposeName)
    return componentConfig
  }
  
  // 2. Try to get config from localStorage
  const localStorageConfig = tryGetLocalStorageConfig(exposeName)
  if (localStorageConfig && Object.keys(localStorageConfig).length > 0) {
    console.log('Using localStorage config for:', exposeName)
    return localStorageConfig
  }
  
  // 3. Try to get config from metadata.json
  const metadataConfig = await tryGetMetadataConfig(exposeName)
  if (metadataConfig && Object.keys(metadataConfig).length > 0) {
    console.log('Using metadata config for:', exposeName)
    return metadataConfig
  }
  
  // 4. Try to infer config from component props/interface
  const inferredConfig = tryInferConfigFromComponent(exposeName)
  if (inferredConfig && Object.keys(inferredConfig).length > 0) {
    console.log('Using inferred config for:', exposeName)
    return inferredConfig
  }
  
  // 5. No fallback - components must define their own configuration
  console.log('No configuration found for:', exposeName)
  return {}
}

function tryGetComponentConfig(exposeName: string): ConfigObject {
  try {
    const component = (window as any)[exposeName]
    if (!component) return {}
    
    // Check if component exposes a config schema
    if (component.configSchema) {
      return parseConfigSchema(component.configSchema)
    }
    
    // Check if component has a getConfig method
    if (typeof component.getConfig === 'function') {
      return parseConfigSchema(component.getConfig())
    }
    
    // Check if component has a config property
    if (component.config) {
      return parseConfigSchema(component.config)
    }
    
    return {}
  } catch (error) {
    console.warn('Error getting component config:', error)
    return {}
  }
}

async function tryGetMetadataConfig(exposeName: string): Promise<ConfigObject> {
  try {
    // Fetch metadata.json to get component configuration
    const metadataUrl = '/metadata.json'
    const response = await fetch(metadataUrl)
    const data = await response.json()
    
    const component = data.components?.find((c: any) => c.expose === exposeName)
    if (component?.config) {
      return parseConfigSchema(component.config)
    }
    
    return {}
  } catch (error) {
    console.warn('Error getting metadata config:', error)
    return {}
  }
}

function tryGetLocalStorageConfig(exposeName: string): ConfigObject {
  try {
    const storageKey = `component-config-${exposeName}`
    const storedConfig = localStorage.getItem(storageKey)
    
    if (storedConfig) {
      const parsedConfig = JSON.parse(storedConfig)
      return parseConfigSchema(parsedConfig)
    }
    
    return {}
  } catch (error) {
    console.warn('Error getting localStorage config:', error)
    return {}
  }
}

function tryInferConfigFromComponent(exposeName: string): ConfigObject {
  try {
    const component = (window as any)[exposeName]
    if (!component) return {}
    
    const config: ConfigObject = {}
    
    // Try to infer from component props
    if (component.props) {
      Object.keys(component.props).forEach(propName => {
        const prop = component.props[propName]
        if (prop && typeof prop === 'object') {
          config[propName] = {
            label: propName.charAt(0).toUpperCase() + propName.slice(1).replace(/([A-Z])/g, ' $1'),
            type: inferPropType(prop),
            default: prop.default || '',
            placeholder: prop.placeholder || ''
          }
        }
      })
    }
    
    // Try to infer from component's setup function parameters
    if (component.setup && typeof component.setup === 'function') {
      const setupStr = component.setup.toString()
      const paramMatch = setupStr.match(/function\s*setup\s*\(([^)]+)\)/)
      if (paramMatch) {
        const params = paramMatch[1].split(',').map((p: string) => p.trim())
        params.forEach((param: string) => {
          if (param && !config[param]) {
            config[param] = {
              label: param.charAt(0).toUpperCase() + param.slice(1).replace(/([A-Z])/g, ' $1'),
              type: 'string',
              default: '',
              placeholder: `Enter ${param}`
            }
          }
        })
      }
    }
    
    return config
  } catch (error) {
    console.warn('Error inferring component config:', error)
    return {}
  }
}

function parseConfigSchema(schema: any): ConfigObject {
  if (!schema || typeof schema !== 'object') return {}
  
  const config: ConfigObject = {}
  
  Object.keys(schema).forEach(key => {
    const prop = schema[key]
    if (prop && typeof prop === 'object') {
      config[key] = {
        label: prop.label || key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
        type: prop.type || 'string',
        default: prop.default || '',
        placeholder: prop.placeholder || '',
        options: prop.options || undefined
      }
    }
  })
  
  return config
}

function inferPropType(prop: any): 'string' | 'number' | 'select' {
  if (prop.type === 'number' || prop.type === Number) return 'number'
  if (prop.type === 'select' || prop.options) return 'select'
  return 'string'
}

function monitorApiErrors() {
  // Listen for network errors that indicate API is down
  const originalFetch = window.fetch
  window.fetch = function(...args) {
    return originalFetch.apply(this, args).catch(error => {
      if (error.message.includes('ERR_CONNECTION_REFUSED') || 
          error.message.includes('Failed to fetch')) {
        apiError.value = true
      }
      throw error
    })
  }
  
  const originalXHR = window.XMLHttpRequest
  window.XMLHttpRequest = function() {
    const xhr = new originalXHR()
    const originalSend = xhr.send
    
    xhr.send = function(...args) {
      xhr.addEventListener('error', () => {
        apiError.value = true
      })
      return originalSend.apply(this, args)
    }
    
    return xhr
  }
}

async function applyConfig() {
  let finalConfig: Record<string, string | number>

  if (configMode.value === 'form') {
    finalConfig = { ...configValues.value }
  } else {
    try {
      const parsedJson = JSON.parse(jsonConfig.value)
      jsonError.value = null
      
      // Check if this is a schema format (has properties with 'default' values)
      // or a simple value format
      const isSchemaFormat = Object.values(parsedJson).some((value: any) => 
        typeof value === 'object' && value !== null && 'default' in value
      )
      
      if (isSchemaFormat) {
        // Extract default values from schema format
        finalConfig = {}
        Object.keys(parsedJson).forEach(key => {
          const prop = parsedJson[key]
          if (typeof prop === 'object' && prop !== null && 'default' in prop) {
            finalConfig[key] = prop.default
          } else {
            finalConfig[key] = prop
          }
        })
      } else {
        // Use as simple value format
        finalConfig = parsedJson
      }
    } catch (e) {
      const error = e as Error
      jsonError.value = `Invalid JSON: ${error.message}`
      return
    }
  }

  // Update configValues with the applied configuration
  configValues.value = { ...finalConfig }
  
  const updatedProps = { ...props.componentProps, ...finalConfig }
  
  // Unmount current instance if it exists
  if (mountedAppInstance.value && typeof mountedAppInstance.value.unmount === 'function') {
    mountedAppInstance.value.unmount()
    mountedAppInstance.value = null
  }

  if (mountTarget.value && mountContainer.value) {
    const remoteModule = (window as any)[props.expose!]
    if (remoteModule) {
      const componentType = detectComponentType(remoteModule)
      await remountComponent(remoteModule, componentType, finalConfig)
    }
  }

  showConfigPanel.value = false
  apiError.value = false
  
  successMessage.value = 'Configuration applied successfully!'
  setTimeout(() => {
    successMessage.value = null
  }, 3000)
  
  if (configMode.value === 'json') {
    await saveConfigToMetadata(finalConfig)
  }
  
  await setupComponentConfig(props.expose!)
  
  console.log('Applied configuration:', updatedProps)
}

async function remountComponent(module: any, type: string, newConfig: Record<string, string | number>) {
  await nextTick()
  
  switch (type) {
    case 'app-instance':
      // Direct app instance - mount normally
      mountTarget.value = true
      await nextTick()
      if (mountContainer.value) {
        mountedAppInstance.value = module.mount(mountContainer.value)
      }
      break
      
    case 'app-factory':
      // Function that returns app instance
      mountTarget.value = true
      await nextTick()
      if (mountContainer.value) {
        const app = module()
        mountedAppInstance.value = app.mount(mountContainer.value)
      }
      break
      
    case 'create-app-factory':
      // Module with createApp method
      mountTarget.value = true
      await nextTick()
      if (mountContainer.value) {
        const app = module.createApp({...props.componentProps, ...newConfig})
        mountedAppInstance.value = app.mount(mountContainer.value)
      }
      break
      
    case 'named-app-factory':
      // Module with specific named factory
      mountTarget.value = true  
      await nextTick()
      if (mountContainer.value) {
        const app = module.createSimulationVuerApp({...props.componentProps, ...newConfig})
        mountedAppInstance.value = app.mount(mountContainer.value)
      }
      break
      
    case 'default-component':
      // Module with default export component
      remoteApp.value = createComponentWrapper(module.default, newConfig)
      break
      
    case 'direct-component':
      // Direct component export
      remoteApp.value = createComponentWrapper(module, newConfig)
      break
      

    case 'named-component':
      // Find the first component in named exports
      const keys = Object.keys(module)
      for (const key of keys) {
        const exported = module[key]
        if (exported && (exported.render || exported.template || exported.__vccOpts || exported.setup)) {
          remoteApp.value = createComponentWrapper(exported, newConfig)
          break
        }
      }
      break
      
    default:
      console.warn('Unknown component type:', type, module)
      console.log('Module details:', {
        type: typeof module,
        keys: Object.keys(module || {}),
        module
      })
      remoteApp.value = module
  }
}

async function saveConfigToMetadata(config: Record<string, string | number>) {
  try {
    // Convert simple config back to schema format for localStorage
    const schemaConfig: Record<string, any> = {}
    
    Object.keys(config).forEach(key => {
      const value = config[key]
      schemaConfig[key] = {
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
        type: typeof value === 'number' ? 'number' : 'string',
        default: value,
        placeholder: `Enter ${key}`
      }
    })
    
    // Save to localStorage
    const storageKey = `component-config-${componentName.value}`
    localStorage.setItem(storageKey, JSON.stringify(schemaConfig))
    
    console.log('Configuration saved to localStorage:', {
      componentName: componentName.value,
      config: schemaConfig
    })
    
    // Show success message
    successMessage.value = 'Configuration saved to localStorage and applied!'
    setTimeout(() => {
      successMessage.value = null
    }, 3000)
    
  } catch (error) {
    console.warn('Error saving config to localStorage:', error)
    successMessage.value = 'Error saving configuration'
    setTimeout(() => {
      successMessage.value = null
    }, 3000)
  }
}

async function remountWithNewConfig(newConfig: Record<string, string | number>) {
  try {
    // Unmount current instance if it exists
    if (mountedAppInstance.value && typeof mountedAppInstance.value.unmount === 'function') {
      mountedAppInstance.value.unmount()
      mountedAppInstance.value = null
    }

    // Get the remote module and remount with new config
    const remoteModule = (window as any)[props.expose!]
    if (remoteModule) {
      const componentType = detectComponentType(remoteModule)
      await remountComponent(remoteModule, componentType, newConfig)
      console.log('Component remounted with new config from localStorage:', newConfig)
    }
  } catch (error) {
    console.warn('Error remounting with new config:', error)
  }
}

function resetConfig() {
  // Reset to default values
  Object.keys(requiredProps.value).forEach(key => {
    configValues.value[key] = requiredProps.value[key].default
  })
  jsonConfig.value = JSON.stringify(configValues.value, null, 2)
  jsonError.value = null
}

function clearStoredConfig() {
  try {
    const storageKey = `component-config-${componentName.value}`
    localStorage.removeItem(storageKey)
    
    successMessage.value = 'Stored configuration cleared!'
    setTimeout(() => {
      successMessage.value = null
    }, 3000)
    
    console.log('Cleared stored config for:', componentName.value)
  } catch (error) {
    console.warn('Error clearing stored config:', error)
    successMessage.value = 'Error clearing stored configuration'
    setTimeout(() => {
      successMessage.value = null
    }, 3000)
  }
}


function createComponentWrapper(component: any, newConfig?: Record<string, string | number>) {
  // Create a wrapper component that passes dynamic props
  return {
    components: { RemoteComponent: component },
    template: '<RemoteComponent v-bind="allProps" />',
    setup() {
      const allProps = computed(() => ({
        ...props.componentProps,
        ...(newConfig || configValues.value)
      }))
      
      return {
        allProps
      }
    }
  }
}


function loadScript(src: string) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

import { onBeforeUnmount } from 'vue'

onBeforeUnmount(() => {

  if (mountedAppInstance.value && typeof mountedAppInstance.value.unmount === 'function') {
    mountedAppInstance.value.unmount()
  }

  if (mountContainer.value) {
    const styleId = mountContainer.value.getAttribute('data-style-id')
    if (styleId) {
      const style = document.getElementById(styleId)
      if (style) {
        style.remove()
      }
    }
  }
  
})

</script>

<style scoped>
.config-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 350px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
  border-radius: 8px 8px 0 0;
}

.config-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
}

.config-form {
  padding: 20px;
}

.mode-toggle {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.mode-btn {
  padding: 6px 12px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  background: #f8f9fa;
  color: #333;
}

.mode-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.mode-btn:hover {
  background: #e9ecef;
}

.form-mode,
.json-mode {
  margin-top: 16px;
}

.json-info {
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.json-info p {
  margin-bottom: 5px;
  font-size: 14px;
  color: #555;
}

.json-example {
  display: flex;
  gap: 8px;
}

.example-btn {
  padding: 6px 12px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  background: #f8f9fa;
  color: #333;
}

.example-btn:hover {
  background: #e9ecef;
}

.json-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  min-height: 150px;
  resize: vertical;
}

.json-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.json-textarea.error {
  border-color: #dc3545;
  box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.25);
}

.json-error {
  margin-top: 8px;
  padding: 8px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  color: #856404;
  font-size: 13px;
}

.no-config-message {
  padding: 16px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  margin-bottom: 16px;
}

.no-config-message p {
  margin: 0 0 8px 0;
  color: #6c757d;
  font-size: 14px;
}

.no-config-message p:last-child {
  margin-bottom: 0;
  font-size: 13px;
  color: #6c757d;
}

.prop-group {
  margin-bottom: 16px;
}

.prop-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  font-size: 14px;
  color: #333;
}

.prop-input,
.prop-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.prop-input:focus,
.prop-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.config-actions {
  display: flex;
  gap: 8px;
  margin-top: 20px;
}

.apply-btn,
.reset-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.apply-btn {
  background: #007bff;
  color: white;
  flex: 1;
}

.apply-btn:hover {
  background: #0056b3;
}

.reset-btn {
  background: #6c757d;
  color: white;
  flex: 0 0 auto;
}

.reset-btn:hover {
  background: #545b62;
}

.clear-btn {
  background: #dc3545;
  color: white;
  flex: 0 0 auto;
}

.clear-btn:hover {
  background: #c82333;
}

.component-container {
  position: relative;
}

.config-toggle {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 100;
}

.config-btn {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 20px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
}

.config-btn:hover {
  background: #e9ecef;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.api-error {
  position: absolute;
  top: 50px;
  left: 10px;
  right: 10px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  padding: 12px;
  z-index: 50;
}

.api-error p {
  margin: 0;
  color: #856404;
  font-size: 14px;
}

.success-message {
  position: absolute;
  top: 50px;
  left: 10px;
  right: 10px;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  padding: 12px;
  z-index: 50;
}

.success-message p {
  margin: 0;
  color: #155724;
  font-size: 14px;
}

.remote-component-frame {
  /* Create isolated rendering context without breaking functionality */
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  min-height: 500px;
  
  contain: layout paint style;
  
  /* Create new stacking context */
  isolation: isolate;
  z-index: 1;
  
  /* Reset inherited styles that commonly cause issues */
  font-size: initial;
  font-weight: initial;
  line-height: initial;
  color: initial;
  text-align: initial;
  text-decoration: initial;
  text-transform: initial;
  letter-spacing: initial;
  word-spacing: initial;
  
  /* Prevent inheritance of problematic properties */
  background: initial;
  border: initial;
  margin: initial;
  padding: initial;
}

/* Enhanced isolation for all child elements */
.remote-component-frame * {
  /* Ensure consistent box model */
  box-sizing: border-box;
  
  /* Reset inherited styles that can cause sizing issues */
  font-size: inherit;
  line-height: inherit;
  
  /* Prevent inheritance of problematic properties */
  background: initial;
  border: initial;
  margin: initial;
  padding: initial;
}

/* Specific resets for common problematic elements */
.remote-component-frame h1,
.remote-component-frame h2, 
.remote-component-frame h3,
.remote-component-frame h4,
.remote-component-frame h5,
.remote-component-frame h6 {
  font-size: inherit;
  font-weight: inherit;
  margin: initial;
  padding: initial;
  line-height: inherit;
}

.remote-component-frame p {
  margin: initial;
  padding: initial;
  line-height: inherit;
}

.remote-component-frame button {
  font-family: inherit;
  font-size: inherit;
  cursor: pointer;
  background: initial;
  border: initial;
  margin: initial;
  padding: initial;
}

.remote-component-frame input,
.remote-component-frame textarea,
.remote-component-frame select {
  font-family: inherit;
  font-size: inherit;
  background: initial;
  border: initial;
  margin: initial;
  padding: initial;
}

/* Reset icon and image sizes to prevent inheritance issues */
.remote-component-frame img,
.remote-component-frame svg,
.remote-component-frame i,
.remote-component-frame .icon {
  width: auto;
  height: auto;
  max-width: none;
  max-height: none;
  font-size: inherit;
}

/* Create a clean slate for the component root */
.remote-component-frame > * {
  position: relative;
  z-index: auto;
  /* Reset any inherited transforms that might affect sizing */
  transform: initial;
  scale: initial;
}

/* Additional isolation wrapper for better style containment */
.remote-component-isolation {
  /* Create a completely isolated context */
  contain: layout paint style;
  isolation: isolate;
  
  /* Reset all inherited styles */
  all: initial;
  
  /* Re-establish basic display */
  display: block;
  width: 100%;
  height: 100%;
  
  /* Reset font and sizing */
  font-size: initial;
  line-height: initial;
  color: initial;
  
  /* Prevent inheritance of problematic properties */
  background: initial;
  border: initial;
  margin: initial;
  padding: initial;
}


</style>