<template>
  <Head>
    <Title>{{ page.fields.title }}</Title>
    <Meta name="og:title" hid="og:title" :content="page.fields.title" />
    <Meta name="twitter:title" :content="page.fields.title" />
    <Meta name="description" hid="description" :content="page.fields.summary" />
    <Meta name="og:description" hid="og:description" :content="page.fields.summary" />
    <Meta name="twitter:description" :content="page.fields.summary" />
  </Head>
  <div class="page pb-32">
    <breadcrumb :breadcrumb="breadcrumb" title="Event Details" />
    <page-hero class="py-24">
      <h1>{{ heroTitle }}</h1>
      <div class="body2">
        {{ heroSummary }}
      </div>
    </page-hero>
    <div v-if="eventDetailsItem" class="container pt-32">
      <div class="subpage">
        <div class="header mb-32">
          <h2>Event Details</h2>
          <div class="updated">
            <i>Updated at: {{ updatedDate }} </i>
          </div>
        </div>
        <!-- eslint-disable vue/no-v-html -->
        <!-- marked will sanitize the HTML injected -->
        <div class="content" v-html="parseMarkdown(htmlDetails)" />
      </div>
    </div>
  </div>
</template>

<script>
import { format, parseISO } from 'date-fns'
import marked from '@/mixins/marked/index'
import FormatDate from '@/mixins/format-date'
import { pathOr, isEmpty } from 'ramda'

const getEventPage = async id => {
  const { $contentfulClient } = useNuxtApp()
  const config = useRuntimeConfig()
  try {
    const isSlug = id.split('-').length > 1

    const item = isSlug
      ? await $contentfulClient.getEntries({
          content_type: config.public.ctf_event_id,
          'fields.slug': id
        })
      : await $contentfulClient.getEntry(id)
    return isSlug ? item.items[0] : item
  } catch (error) {
    return {}
  }
}

export default {
  name: 'EventDetails',

  mixins: [FormatDate, marked],

  async setup() {
    const route = useRoute()
    try {
      const page = await getEventPage(route.params.eventId)
      const eventDetailsItem = pathOr(null, ['fields', 'eventDetails'], page)
      if (isEmpty(eventDetailsItem) || eventDetailsItem == null) {
        navigateTo(`/news-and-events/events/${route.params.eventId}`, { redirectCode: 301 })
      }
      return { 
        page,
        eventDetailsItem 
      }
    } catch (error) {
      return {
        page: {
          fields: [],
          eventDetailsItem: null
        },
      }
    }
  },

  computed: {
    /**
     * Compute HTML Event Details for the page
     * @returns {String}
     */
    htmlDetails: function() {
      return pathOr('', ['fields', 'eventDetails'], this.eventDetailsItem)
    },
    /**
     * Get event date range, if there is no end date, default to start date
     * @returns {String}
     */
    eventDate: function() {
      const startDate = this.formatDate(this.page.fields.startDate || '')
      const endDate = this.formatDate(this.page.fields.endDate || '')
      return startDate === endDate || !endDate
        ? startDate
        : `${startDate} - ${endDate}`
    },
    heroTitle: function() {
      return pathOr('', ['fields', 'title'], this.page)
    },
    heroSummary: function() {
      return pathOr('', ['fields', 'summary'], this.page)
    },
    eventId: function() {
      return this.$route.params.eventId
    },
    /**
     * Compute and convert the date the article was created
     * @returns {String}
     */
    updatedDate: function () {
      return this.eventDetailsItem ? format(parseISO(this.eventDetailsItem?.sys.updatedAt), 'MM/dd/yyyy') : undefined
    },
    breadcrumb: function() {
      return [
        {
          label: 'Home',
          to: {
            name: 'index'
          }
        },
        {
          label: 'News & Events',
          to: {
            name: 'news-and-events'
          }
        },
        {
          label: 'Events',
          to: {
            name: 'news-and-events-events'
          }
        },
        {
          label: `${this.heroTitle}`,
          to: {
            path: `/news-and-events/events/${this.eventId}`
          }
        }
      ]
    }
  }
}

</script>
<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.page {
  background-color: $background;
}
.content {
  :deep(img) {
    display: block;
    margin: auto;
    height: auto;
    max-width: 100%;
  }
}
.subpage {
  margin: 0;
}
</style>
