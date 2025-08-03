<template>
  <Head>
    <Title>{{ page?.fields?.title }}</Title>
    <Meta name="og:title" hid="og:title" :content="page?.fields?.title" />
    <Meta name="twitter:title" :content="page?.fields?.title" />
    <Meta name="description" hid="description" :content="page?.fields?.summary" />
    <Meta name="og:description" hid="og:description" :content="page?.fields?.summary" />
    <Meta name="twitter:description" :content="page?.fields?.summary" />
  </Head>
  <news-events-resources-page
    :page="page"
    :content="page?.fields?.copy"
    :breadcrumb="breadcrumb"
    :hero-title="page?.fields?.title"
    :hero-summary="page?.fields?.summary"
    type="news"
  >
    <template v-if="newsImage">
      <img :src="newsImage" :alt="newsImageAlt" />
      <hr />
    </template>

    <h3>Published Date</h3>
    <p>{{ publishedDate }}</p>

    <h3 v-if="page?.fields?.url">External Link</h3>
    <p v-if="page?.fields?.url">
      <a :href="page?.fields?.url" target="_blank">
        {{ page?.fields?.url }}
      </a>
    </p>
  </news-events-resources-page>
</template>

<script setup>
import { computed } from 'vue';
import { pathOr } from 'ramda';
import NewsEventsResourcesPage from '@/components/NewsEventsResourcesPage/NewsEventsResourcesPage';
import { useNuxtApp, useRoute } from '#app';
import { formatDate } from '@/utils/dateUtils.js'

const breadcrumb = [
  {
    label: 'Home',
    to: { name: 'index' }
  },
  {
    label: 'News & Events',
    to: { name: 'news-and-events' }
  }
]

const route = useRoute();
const { $contentfulClient } = useNuxtApp()

const { data: page, error } = useAsyncData(
  'newsPage',
  async () => {
    try {
      return await $contentfulClient.getEntry(route.params.id);
    } catch {
      return { fields: [] };
    }
  }
)

const newsImage = computed(() =>
  pathOr('', ['fields', 'image', 'fields', 'file', 'url'], page?.value)
)

const newsImageAlt = computed(() =>
  pathOr('', ['fields', 'image', 'fields', 'title'], page?.value)
)

const publishedDate = computed(() =>
  page?.value?.fields.publishedDate
    ? formatDate(page.value.fields.publishedDate)
    : ''
)
</script>
