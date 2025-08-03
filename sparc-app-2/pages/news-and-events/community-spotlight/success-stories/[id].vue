<template>
  <Head>
    <Title>{{ title }}</Title>
    <Meta name="og:title" hid="og:title" :content="title" />
    <Meta name="twitter:title" :content="title" />
    <Meta name="description" hid="description" :content="entry.summary" />
    <Meta name="og:description" hid="og:description" :content="entry.summary" />
    <Meta name="twitter:description" :content="entry.summary" />
  </Head>
  <div class="events-page">
    <Breadcrumb :breadcrumb="breadcrumb" :title="title" />
    <page-hero class="py-24">
      <h1>{{ title }}</h1>
      <br />
      <p>{{ entry.summary }}</p>
    </page-hero>
    <div class="container pb-24">
      <div class="subpage">
        <el-row :gutter="38">
          <el-col :sm="13">
            <div class="content" v-html="parseMarkdown(entry.story)" />
          </el-col>
          <el-col :sm="11">
            <div class="banner-wrapper">
              <iframe
                v-if="entry.youtubeUrl"
                class="banner-asset"
                :src="embeddedVideoSrc"
                allowfullscreen
                allowtransparency
                allow="autoplay"
                frameBorder="0"
              />
              <img
                v-else-if="entry.files"
                class="banner-asset"
                :src="entry.files[0].fields.file.url"
                :alt="entry.files[0].description"
              />
            </div>
            <div class="seperator-path my-32" />
            <div class="label4">AUTHOR</div>
            <div class="content body4">{{ author }}</div>
            <br />
            <template v-if="entry.publishedDate">
              <div class="label4">PUBLISHED DATE</div>
              <div class="content body4">{{ formatDate(entry.publishedDate) }}</div>
              <br />
            </template>
            <template v-if="entry.contributorsMarkdown">
              <div class="label4">TEAM MEMBERS</div>
              <div class="content body4" v-html="parseMarkdown(entry.contributorsMarkdown)" />
              <br />
            </template>
            <template v-if="entry.referencesMarkdown">
              <div class="label4">SUPPORTING INFORMATION</div>
              <div class="content body4" v-html="parseMarkdown(entry.referencesMarkdown)" />
              <br />
            </template>
            <div class="label4">Share</div>
            <share-links />
            <div class="seperator-path my-32" />
            <template v-if="entry.associatedDatasets">
              <div class="label4">ASSOCIATED DATASETS</div>
              <br />
              <div
                v-for="(datasetUrl, index) in entry.associatedDatasets"
                :key="'dataset' + index"
                class="body4"
              >
                <dataset-card :id="datasetIdFromUrl(datasetUrl)" />
              </div>
            </template>
          </el-col>
        </el-row>
      </div>
      <nuxt-link
        class="btn-load-more mt-16"
        :to="{
          name: 'news-and-events-community-spotlight-success-stories'
        }"
      >
        View All Success Stories &gt;
      </nuxt-link>
      <div class="subpage">
        Have something to share with the community? We would love to hear from you! Submit your success story
        <nuxt-link to="/contact-us?type=story">here</nuxt-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAsyncData } from '#app'
import { computed } from 'vue'
import DatasetCard from '@/components/DatasetCard/DatasetCard.vue'
import youtubeEmbeddedSource from '@/mixins/youtube-embedded-src'
import { parseMarkdown } from '@/utils/formattingUtils.js'
import { formatDate } from '@/utils/dateUtils.js'
import ShareLinks from '~/components/ShareLinks/ShareLinks.vue'

const { $contentfulClient } = useNuxtApp()
const route = useRoute()

// Fetch data using useAsyncData to avoid rendering on both client and server
const { data, error } = await useAsyncData('story', async () => {
  try {
    const results = await $contentfulClient.getEntries({
      content_type: 'successStoryDisplay',
      'fields.storyRoute[match]': route.params.id,
      include: 1,
      order: '-fields.publishedDate',
    })
    return results.items[0]?.fields || {}
  } catch (err) {
    console.error(err)
    return {}
  }
})

// Variables from the fetched data
const entry = computed(() => data.value || {})
const title = computed(() => entry.value?.storyTitle || '')
const breadcrumb = computed(() => [
  { label: 'Home', to: { name: 'index' } },
  { label: 'News & Events', to: { name: 'news-and-events' } },
  { label: 'Community Spotlight', to: { name: 'news-and-events-community-spotlight' } },
  { label: 'Success Stories', to: { name: 'news-and-events-community-spotlight-success-stories' } },
])

// Computed properties
const pageUrl = computed(() => `${process.env.ROOT_URL}${route.fullPath}`)
const embeddedVideoSrc = computed(() => youtubeEmbeddedSource(entry.value?.youtubeUrl))
const author = computed(() => entry.value?.name || entry.value?.author || '')

// Methods
const datasetIdFromUrl = (url) => {
  if (!url.includes('/')) return Number(url)
  let datasetId = url.split('/').pop()
  if (datasetId.includes('?')) datasetId = datasetId.split('?')[0]
  return Number(datasetId)
}
</script>

<style scoped lang="scss">
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.events-page {
  background-color: $background;
}

.banner-wrapper {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 */
  height: 0;
}

.banner-wrapper .banner-asset {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.iframe-wrapper {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 */
  height: 0;
  min-width: 25.68rem;
}

:deep(.content) {
  color: $grey;
  p {
    margin-bottom: 1em;
  }
  img {
    height: auto;
    margin: 0.5em 0;
    max-width: 100%;
  }
  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  @media (max-width: 48em) {
    margin-bottom: 2rem;
  }
}

.seperator-path {
  width: 100%;
  height: 0.125rem;
  background: $lineColor1;
  border-radius: 0px;
}

.btn-copy-permalink {
  border: none;
  background: none;
  color: $purple;
  cursor: pointer;
  padding: 0;
  &:active {
    outline: none;
  }
}

.header {
  margin-bottom: 3em;
  .updated {
    color: #aaa;
  }
}

.btn-load-more {
  background: none;
  border: none;
  color: $darkBlue;
  cursor: pointer;
  display: block;
  font-size: 1rem;
  font-weight: 700;
  padding: 0;
  &:hover,
  &:active {
    text-decoration: underline;
  }
}

.subpage {
  margin-bottom: 0 !important;
}
</style>
