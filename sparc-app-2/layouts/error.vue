<template>
  <div class="nuxt-error">
    <component :is="errorPage" :error="error" />
  </div>
</template>
<script>
import error404 from '~/components/Error/404.vue'
import error400 from '~/components/Error/400.vue'
export default {
  name: 'ErrorPage',
  props: {
    error: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    errorPage() {
      if (this.error.statusCode === 404) {
        return error404
      }
      // catch everything else
      return error400
    }
  }
}
</script>
