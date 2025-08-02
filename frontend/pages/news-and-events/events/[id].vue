<template>
  <Head>
    <Title>{{ page.fields.title }}</Title>
    <Meta name="og:title" hid="og:title" :content="page.fields.title" />
    <Meta name="twitter:title" :content="page.fields.title" />
    <Meta name="description" hid="description" :content="page.fields.summary" />
    <Meta name="og:description" hid="og:description" :content="page.fields.summary" />
    <Meta name="twitter:description" :content="page.fields.summary" />
  </Head>
  <news-events-resources-page
    :page="page"
    :content="page.fields?.description"
    :breadcrumb="breadcrumb"
    :hero-title="page.fields?.title"
    :hero-summary="page.fields?.summary"
    :has-event-details-page="hasEventDetailsPage"
    type="event"
  >
    <a :href="page.fields?.url" target="_blank">
      <img :src="newsImage" :alt="newsImageAlt" />
    </a>
    <hr />

    <h3>Type</h3>
    <p>{{ page.fields?.eventType }}</p>

    <h3>Date</h3>
    <p>{{ eventDate }}</p>

    <h3>Location</h3>
    <p>{{ page.fields?.location }}</p>

    <h3 v-if="page.fields?.url">External Link</h3>
    <p v-if="page.fields?.url">
      <a :href="page.fields?.url" target="_blank">{{ page.fields?.url }}</a>
    </p>
  </news-events-resources-page>
</template>

<script setup>
import { computed } from 'vue'
import { pathOr } from 'ramda'
import NewsEventsResourcesPage from '@/components/NewsEventsResourcesPage/NewsEventsResourcesPage'
import { useNuxtApp, useRoute, useRouter } from '#app'
import { formatDate } from '@/utils/dateUtils.js'

const route = useRoute()
const router = useRouter()
const { $contentfulClient } = useNuxtApp()
const config = useRuntimeConfig()

const { data: page, error } = useAsyncData(
  'eventPage',
  async () => {
    const id = route.params.id;
    const isSlug = id.split('-').length > 1

    const result = isSlug
      ? await $contentfulClient.getEntries({
          content_type: config.public.ctf_event_id,
          'fields.slug': id
        })
      : await $contentfulClient.getEntry(id);

    const eventPage = isSlug ? result.items[0] : result

    // Redirect if the slug doesn't match
    const slug = pathOr(null, ['fields', 'slug'], eventPage)
    if (slug && id !== slug) {
      router.replace(`/news-and-events/events/${slug}`);
    }

    return eventPage || { fields: [] }
  }
)

const breadcrumb = [
  {
    label: 'Home',
    to: { name: 'index' }
  },
  {
    label: 'News & Events',
    to: { name: 'news-and-events' }
  },
  {
    label: 'Events',
    to: { name: 'news-and-events-events' }
  }
]

const newsImage = computed(() =>
  pathOr('', ['fields', 'image', 'fields', 'file', 'url'], page.value)
)

const newsImageAlt = computed(() =>
  pathOr('', ['fields', 'image', 'fields', 'title'], page.value)
)

const eventDetails = computed(() =>
  pathOr(null, ['fields', 'eventDetails'], page.value)
)

const hasEventDetailsPage = computed(() => eventDetails.value !== null)

const eventDate = computed(() => {
  const startDate = page.value.fields?.startDate
    ? formatDate(page.value.fields.startDate)
    : '';
  const endDate = page.value.fields?.endDate
    ? formatDate(page.value.fields.endDate)
    : '';
  return startDate === endDate || !endDate
    ? startDate
    : `${startDate} - ${endDate}`
});
</script>
