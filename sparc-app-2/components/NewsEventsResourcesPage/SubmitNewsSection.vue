<template>
  <Paper
    :text="parseMarkdown(searchPaperText)"
    :button-text="searchPaperNEButton"
    :button-link="{ name: 'contact-us', query: { type: 'news-event'} }"
    new-tab
  />
</template>

<script setup>
import { useNuxtApp, useRuntimeConfig } from '#imports';
import Paper from '@/components/Paper/Paper.vue';
import { parseMarkdown } from '@/utils/formattingUtils.js'

const config = useRuntimeConfig();
const { $contentfulClient } = useNuxtApp();

const { data } = await useAsyncData('newsAndEventsPage', async () => {
  const pageData = await $contentfulClient.getEntry(config.public.ctf_news_and_events_page_id);
  return {
    fields: pageData.fields || {},
  }
});

const searchPaperNEButton = computed(() => data.value?.fields.searchPaperNeButton || '')
const searchPaperText = computed(() => data.value?.fields.searchPaperText || '')

</script>
