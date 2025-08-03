<template>
</template>
<script>
export default {
  name: 'FlatmapViewerPage',
  setup() {
    const router = useRouter()
    const route = useRoute()
    router.replace({
      name: 'maps',
      query: {type: "flatmap", ...route.query}
    })
  }
}
</script>
