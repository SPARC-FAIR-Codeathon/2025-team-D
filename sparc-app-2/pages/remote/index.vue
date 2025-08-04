<template>
    <RemoteComponentApp 
      :src="remoteApp.path" 
      :expose="remoteApp.expose"
      :componentProps="getComponentProps()" 
    />
</template>

<script setup lang="ts">
import { useRemoteAppStore } from '@/store/remoteStore'
const {remoteApp} = useRemoteAppStore()

// Define props to pass to different remote components
function getComponentProps() {
  const props: any = {}  
  return props
}

</script>

<style scoped>

</style>