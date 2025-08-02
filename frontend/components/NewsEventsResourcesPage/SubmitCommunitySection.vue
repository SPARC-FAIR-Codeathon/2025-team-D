<template>
  <paper
    :text="parseMarkdown(searchPaperText)"
    :button-text="searchPaperCSButton"
    :button-link="{ name: 'contact-us', query: { type: 'story'} }"
    new-tab
  />
</template>

<script>
import Paper from '@/components/Paper/Paper.vue'
import marked from '@/mixins/marked/index'

export default {
  name: 'SubmitCommunitySection',

  mixins: [marked],

  components: {
    Paper
  },

  async setup() {
    const config = useRuntimeConfig()
    const { $contentfulClient } = useNuxtApp()
    const response = await $contentfulClient.getEntry(config.public.ctf_news_and_events_page_id)
    const searchPaperCSButton = response.fields.searchPaperCsButton
    const searchPaperText = response.fields.searchPaperText
    return {
      searchPaperText,
      searchPaperCSButton
    }
  }
}
</script>
