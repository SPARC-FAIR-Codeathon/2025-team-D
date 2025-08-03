<template>
    <RemoteComponentApp :src="remoteApp.path" :expose="remoteApp.expose" />
</template>

<script setup lang="ts">
import { useRemoteAppStore } from '../../store/remoteStore'
const {remoteApp} = useRemoteAppStore()

</script>

<style scoped>

</style>