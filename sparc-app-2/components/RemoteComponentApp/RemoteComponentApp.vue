<template>
  <div>
    <component :is="remoteApp" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  src: String,
  expose: String
})
import { onMounted, shallowRef } from 'vue'

const remoteApp = shallowRef(null)

onMounted(async () => {
  await loadScript(props.src!)
  remoteApp.value = (window as any)[props.expose!]
})

function loadScript(src:string) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

</script>

<style scoped>

</style>