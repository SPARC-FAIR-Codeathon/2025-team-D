<template>
  <Head>
    <Title>{{ title }}</Title>
    <Meta name="og:title" hid="og:title" :content="title" />
    <Meta name="twitter:title" :content="title" />
    <Meta name="description" hid="description" :content="summary" />
    <Meta name="og:description" hid="og:description" :content="summary" />
    <Meta name="twitter:description" :content="summary" />
  </Head>
  <div class="page-data pb-16">
    <Breadcrumb :breadcrumb="breadcrumb" :title="title" />
    <page-hero class="py-24">
      <h1>{{ title }}</h1>
      <p>{{ summary }}</p>
    </page-hero>
    <div class="container">
      <div class="subpage px-32 py-16">
        <div v-html="parseMarkdown(description)" />
        <div v-for="callToAction in callsToAction" :key="callToAction.sys.id" class="mb-16">
          <a v-if="callToAction.fields" :href="callToAction.fields.url" @click="callToAction.fields.url == null && $emit('click')">
            <el-button>{{ callToAction.fields.title }}</el-button>
          </a>
        </div>
      </div>
      <div v-if="learnMore" class="subpage px-32 mb-0">
        <div class="heading2 mb-16">Learn More</div>
        <div v-for="(item, i) in learnMore" :key="item.sys.id">
          <learn-more-card :about-details-item="item" :parent-path="slug" />
          <hr v-if="i < learnMore.length - 1" />
        </div>
      </div>
    </div>
    <login-modal :show-dialog="showLoginDialog" redirectUrl="/user/profile" @dialog-closed="showLoginDialog = false" />
  </div>
</template>

<script setup>
import { useAsyncData } from '#app'
import LearnMoreCard from '@/components/LearnMoreCard/LearnMoreCard.vue'
import { parseMarkdown } from '@/utils/formattingUtils.js'
import LoginModal from '@/components/LoginModal/LoginModal.vue'

// Props or data
const breadcrumb = [
  {
    to: {
      name: 'index'
    },
    label: 'Home'
  }
]
const showLoginDialog = ref(false)

const { data: pageData, error } = await useAsyncData('pageData', async () => {
  const { $contentfulClient } = useNuxtApp()
  const config = useRuntimeConfig()
  const pageData = await $contentfulClient.getEntry(config.public.ctf_share_data_page_id)
  return pageData.fields
})

const title = computed(() => pageData.value?.title || '')
const summary = computed(() => pageData.value?.summary || '')
const description = computed(() => pageData.value?.description || '')
const learnMore = computed(() => pageData.value?.learnMore || [])
const callsToAction = computed(() => pageData.value?.callsToAction || [])
const slug = computed(() => pageData.value?.slug || '')

if (error.value) {
  console.error('Error fetching page data:', error.value)
}
</script>

<style scoped lang="scss">
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.page-data {
  background-color: $background;
}
hr {
  border-top: none;
}
:deep(img) {
  max-width: 100%;
}
</style>
