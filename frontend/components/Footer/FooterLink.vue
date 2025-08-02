<template>
  <a
    :href="linkUrl"
    :target="!opensInNewTab(linkUrl) && !isFeedbackLink ? '_self' : '_blank'"
  >
  {{ link.fields.title }}
  </a>
</template>

<script>
import { opensInNewTab } from '@/mixins/marked/index'

export default {
  name: 'FooterLink',

  props: {
    link: {
      type: Object,
      default: () => {
        return {
          sys: {},
          fields: {}
        }
      }
    }
  },

  methods: {
    opensInNewTab
  },

  computed: {
    currentUrl() {
      const config = useRuntimeConfig()
      const url = new URL(this.$route.fullPath, config.public.ROOT_URL)
      url.searchParams.delete('source_url') // Remove existing source_url in order to prevent indexing recursion
      return encodeURIComponent(url.pathname + url.search)
    },
    isFeedbackLink() {
      const title = this.link.fields.title
      return title == 'Site Feedback'
    },
    linkUrl() {
      let url = this.link.fields.longUrl || this.link.fields.url
      if (this.isFeedbackLink) {
        url = url + `&source_url=${this.currentUrl}`
      }
      return url
    }
  }
}
</script>
