<template>
  <Head>
    <Title>{{ fields?.title }}</Title>
    <Meta name="og:title" hid="og:title" :content="fields?.title" />
    <Meta name="twitter:title" :content="fields?.title" />
    <Meta name="description" hid="description" :content="fields?.description" />
    <Meta name="og:description" hid="og:description" :content="fields?.description" />
    <Meta name="twitter:description" :content="fields?.description" />
  </Head>
  <div>
    <Breadcrumb :breadcrumb="breadcrumb" :title="title" />
    <page-hero class="py-24">
      <h1>{{ title }}</h1>
      <p>{{ description }}</p>
    </page-hero>
    <portal-features
      :features="appEntries"
      :title="appsSectionTitle"
      :icon-is-top-element="false"
      :max-per-row="3"
    />
    <div
      class="container"
      :style="'text-align: center; margin-top: 1rem; margin-bottom: 2rem;'"
      v-html="parseMarkdown(footer)"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { pathOr } from 'ramda'
import { parseMarkdown } from '@/utils/formattingUtils.js'
import { useAsyncData, useRuntimeConfig } from '#app'

const breadcrumb = [
  {
    to: { name: 'index' },
    label: 'Home',
  },
]

const constructPortalFeatureEntries = (apps) => {
  if (!apps) return []
  return apps.map((app) => {
    const buttonLink = app.fields.requiresDetailsPage
      ? `/resources/${app.sys.id}`
      : pathOr('', ['fields', 'url'], app)
    return {
      fields: {
        buttonLink,
        buttonText: pathOr('', ['fields', 'buttonText'], app),
        description: pathOr('', ['fields', 'description'], app),
        title: pathOr('', ['fields', 'name'], app),
        icon: {
          fields: {
            file: {
              url: pathOr('', ['fields', 'logo', 'fields', 'file', 'url'], app),
            },
          },
        },
      },
    }
  })
}

const config = useRuntimeConfig()

const { data: appData } = await useAsyncData('apps-page-data', async () => {
  const { $contentfulClient } = useNuxtApp()
  const appPage = await $contentfulClient.getEntry(config.public.ctf_apps_page_id)
  return {
    fields: appPage.fields || {},
    appEntries: constructPortalFeatureEntries(appPage.fields?.apps),
  }
})

const fields = computed(() => appData.value.fields || {})
const appEntries = computed(() => appData.value.appEntries || [])
const title = computed(() => fields.value?.title || '')
const description = computed(() => fields.value?.description || '')
const appsSectionTitle = computed(() => fields.value?.appsSectionTitle || '')
const footer = computed(() => fields.value?.footerText || '')
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
</style>
