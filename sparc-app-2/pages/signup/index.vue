<template>
  <div>
    Redirecting you to the signup form...
  </div>
</template>
<script>
export default {
  async setup() {
    await navigateTo("https://eepurl.com/hgBxgv", { external: true, redirectCode: 301 })
  },
}
</script>
