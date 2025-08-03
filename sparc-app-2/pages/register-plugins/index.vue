<template>
  <div class="file-list-container">
    <button class="file-btn" @click="openModal = true">
      Register a new plugin
    </button>

    <FancyModal :visible="openModal" @close="openModal = false">
      <h2 style="margin-top: 0;">✨ Annotate plugin information</h2>
      <div class="w-full d-flex justify-center">
        <form @submit.prevent="submit" style="width:60%">
          <v-text-field
            v-model="pluginUrl.value.value"
            :counter="100"
            :error-messages="pluginUrl.errorMessage.value"
            label="Plugin Repository Path"
          ></v-text-field>
          <v-text-field
            v-model="pluginName.value.value"
            :counter="100"
            :error-messages="pluginName.errorMessage.value"
            label="Plugin App Expose Name"
          ></v-text-field>
        </form>
      </div>
      <div class="w-full d-flex justify-end">
          <v-btn variant="tonal" color="green-darken-1">Submit</v-btn>
      </div>
    </FancyModal>

    <ul class="file-list">
      <li v-for="(item, index) in items" :key="index" class="file-item" @click.prevent="handleItemClick(item)">
        <a class="file-link" >
          {{ item.name }}
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, shallowRef } from 'vue'
import { useRemoteAppStore } from '@/store/remoteStore'
import FancyModal from '@/components/FancyModal/FancyModal.vue'
import { useField, useForm } from 'vee-validate'

type Item = {
    name: string;
    path: string;
    expose: string;
    description: string;
}

const openModal = ref(false)

const items = ref<Item[]>([])

const selected = shallowRef([0])
const remoteAppStore = useRemoteAppStore()
const router = useRouter()


const { handleSubmit, handleReset } = useForm({
    validationSchema: {
      pluginUrl (value: string) {
        if (typeof value === 'string') return true

        return 'You need to provide a valid repository URL.'
      },
      pluginName (value:string) {
        if (typeof value === 'string') return true

        return 'Please provide a valid plugin name.'
      }
    },
  })
  const pluginUrl = useField('pluginUrl')
  const pluginName = useField('pluginName')

  const submit = handleSubmit(values => {
    alert(JSON.stringify(values, null, 2))
  })

onMounted(async () => {
  try {
    const res = await fetch('/metadata.json')
    if (!res.ok) throw new Error(`Failed to fetch list.json: ${res.status}`)

    const data = await res.json()
    if (Array.isArray(data.conponents)) {
      items.value = data.conponents
    } else {
      console.warn('list.json is not an array')
    }
  } catch (err) {
    console.error('Error loading list.json:', err)
  }
})

const handleItemClick = (item: Item) => {
  remoteAppStore.setRemoteApp(item)
  router.push('/remote')
}
</script>

<style scoped>
.file-list-container {
  max-width: 60%;
  margin: 40px auto;
  padding: 24px;
  background: #f9f9fb;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  font-family: 'Segoe UI', sans-serif;
}

.file-list-container h2 {
  font-size: 1.6rem;
  margin-bottom: 20px;
  color: #333;
  text-align: center;
}

.file-list {
  list-style: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
}

.file-item {
  margin-bottom: 12px;
  padding: 12px 16px;
  background: white;
  border-radius: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.file-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.file-link {
  text-decoration: none;
  color: #007acc;
  font-weight: 500;
  word-break: break-all;
}

.file-link:hover {
  text-decoration: underline;
}

.file-btn {
  margin-bottom: 12px;
  padding: 14px 20px;
  background: linear-gradient(to right, #ffffff, #f9fafb);
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  color: #111827;
  font-size: 16px;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  cursor: pointer;
  display: inline-block;
}

.file-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  background: linear-gradient(to right, #f0f9ff, #e0f2fe);
  border-color: #bae6fd;
  color: #0c4a6e;
}

.file-btn:active {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
</style>