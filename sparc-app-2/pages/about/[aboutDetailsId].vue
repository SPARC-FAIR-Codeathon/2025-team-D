
<template>
  <Head>
    <Title>{{ aboutDetailsItem?.fields?.title }}</Title>
    <Meta name="og:title" hid="og:title" :content="aboutDetailsItem?.fields?.title" />
    <Meta name="twitter:title" :content="aboutDetailsItem?.fields?.title" />
    <Meta name="description" hid="description" :content="aboutDetailsItem?.fields?.summary" />
    <Meta name="og:description" hid="og:description" :content="aboutDetailsItem?.fields?.summary" />
    <Meta name="twitter:description" :content="aboutDetailsItem?.fields?.summary" />
  </Head>
  <div>
    <Breadcrumb :breadcrumb="breadcrumb" :title="aboutDetailsItem?.fields?.title" />
    <page-hero class="py-24">
      <h1>{{ aboutDetailsItem?.fields?.title }}</h1>
      <p>{{ aboutDetailsItem?.fields?.summary }}</p>
    </page-hero>
    <div class="container">
      <div class="subpage">
        <div v-html="parseMarkdown(aboutDetailsItem?.fields?.description)" />
        <hr />
        <p class="share-text">SHARE</p>
        <share-links />
      </div>
      <div v-if="aboutDetailsItem?.fields?.learnMore" class="subpage">
        <div class="heading2 mb-16">Learn More</div>
        <template v-for="(item, index) in aboutDetailsItem.fields.learnMore" :key="item + index">
          <div>
            <learn-more-card :about-details-item="item" :parent-path="aboutDetailsItem?.fields?.slug" />
            <hr
              v-if="aboutDetailsItem?.fields?.learnMore.length > 1 && index !== aboutDetailsItem?.fields?.learnMore.length - 1" />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRuntimeConfig, useAsyncData } from '#app'
import { pathOr, isEmpty } from 'ramda'
import LearnMoreCard from '@/components/LearnMoreCard/LearnMoreCard.vue'
import ShareLinks from '~/components/ShareLinks/ShareLinks.vue'
import { parseMarkdown } from '@/utils/formattingUtils.js'

const config = useRuntimeConfig()
const { $contentfulClient } = useNuxtApp()
const { params } = useRoute()
const router = useRouter()

const { data: aboutDetailsItem } = useAsyncData('aboutDetailsItem', async () => {
  try {
    const entries = await $contentfulClient.getEntries({
      content_type: config.public.ctf_about_details_content_type_id,
      'fields.slug': params.aboutDetailsId
    })

    if (entries.items.length === 0) {
      const response = await $contentfulClient.getEntry(params.aboutDetailsId)
      const slug = pathOr('', ['fields', 'slug'], response)

      if (!isEmpty(slug)) {
        await router.replace({ path: `/about/${slug}` })
      }
      return response
    } else {
      return entries.items[0]
    }
  } catch (err) {
    console.error('Error fetching about details item:', err)
    return null
  }
})

const breadcrumb = computed(() => [
  {
    to: { name: 'index' },
    label: 'Home'
  },
  {
    label: 'About',
    to: { name: 'about' }
  }
])

</script>

<style scoped>
.share-text {
  font-weight: bold;
  text-transform: uppercase;
  margin-bottom: 1rem;
}
</style>

<style scoped lang="scss">
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.subpage {
  margin: 1em 0;
  padding: 1em;
  border: 1px solid #dcdfe6;
  background: white;
  @media (min-width: 48em) {
    margin: 2.5em 0;
    padding: 1em 2em;
  }
  hr {
    opacity: 0.3;
  }
  h1 {
    font-weight: 300;
  }
}

.share-text {
  font-weight: 500;
  margin-bottom: 0;
}
:deep(img) {
  max-width: 100%;
}
:deep(img) {
  display: block;
  margin-left: auto;
  margin-right: auto;
}
</style>
