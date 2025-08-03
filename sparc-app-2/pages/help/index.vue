<template>
  <div>
    Redirecting you to the SPARC Help Center...
  </div>
</template>
<script>
export default {
  async setup() {
    await navigateTo("https://docs.sparc.science/", { external: true, redirectCode: 301 })
  },
}
</script>
