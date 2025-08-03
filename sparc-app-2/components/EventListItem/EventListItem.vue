<template>
  <div :v-if="isDestinationLinkRetreived" :class="['event-list-item', { 'past-events-divider': showPastEventsDivider }]" >
    <hr v-if="showPastEventsDivider" class="divider-text" data-content="PAST EVENTS" />
    <div class="event-content">
      <div class="image">
        <event-banner-image :src="bannerUrl" />
      </div>
      <div class="event-content-wrap">
        <nuxt-link
          class="link1"
          v-if="item.fields.requiresADetailsPage"
          :to="{
            name: 'news-and-events-events-id',
            params: { id: item.sys.id }
          }"
        >
          <p v-html="highlightMatches(item.fields.title, $route.query.search)" />
        </nuxt-link>
        <a v-else-if="item.fields.url" class="link1" :href="item.fields.url" :target="openInNewTab ? '_blank' : '_self'">
          <span v-html="highlightMatches(item.fields.title, $route.query.search)"/>
          <svgo-icon-open v-if="openInNewTab" class="open-icon" />
        </a>
        <div v-else>
          <span v-html="highlightMatches(item.fields.title, $route.query.search)"/>
        </div>
        <div>
          <div class="body1 my-8" v-html="highlightMatches(item.fields.summary, $route.query.search)"/>
          <table class="property-table">
            <tr>
              <td class="property-name-column">
                Event Type
              </td>
              <td>
                {{ item.fields.eventType }}
              </td>
            </tr>
            <tr>
              <td class="property-name-column">
                Event Date(s)
              </td>
              <td>
                {{ dateRange }}
              </td>
            </tr>
            <tr>
              <td class="property-name-column">
                Location
              </td>
              <td>
                {{ item.fields.location }}
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  item: Object,
  showPastEventsDivider: Boolean
})
const { item, showPastEventsDivider } = toRefs(props)
const openInNewTab = ref({})
const isDestinationLinkRetreived = ref(false)

const config = useRuntimeConfig()
const { $axios } = useNuxtApp()
const url = pathOr("", ['fields', 'url'], item)
if (url.includes('bit.ly')) {
  const bitlyId = url.replace("https://", "")
  await $axios.post(config.public.bitly_expand_endpoint, { bitlink_id: bitlyId }, {
    headers: {
      Authorization: `Bearer ${config.public.BITLY_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    }
  }).then(response => {
    openInNewTab.value = !isInternalLink(response.data.long_url)
    isDestinationLinkRetreived.value = true
  })
  .catch(err => {
    console.error('Error retreiving bitly link destination URL.', err)
    openInNewTab.value = !isInternalLink(url)
    isDestinationLinkRetreived.value = true
  })
}
</script>

<script>
import { isEmpty, pathOr } from 'ramda'
import EventBannerImage from '@/components/EventBannerImage/EventBannerImage.vue'
import FormatDate from '@/mixins/format-date'

import { isInternalLink, opensInNewTab } from '@/mixins/marked/index'
import { highlightMatches } from '@/utils/utils'

export default {
  name: 'EventListItem',
  components: {
    EventBannerImage
  },
  mixins: [FormatDate],
  computed: {
    /**
     * Compute banner URL
     * @returns {String}
     */
    bannerUrl: function() {
      return pathOr(
        '',
        ['fields', 'image', 'fields', 'file', 'url'],
        this.item
      )
    },

    /**
     * Compute and formate start date
     * @returns {String}
     */
    startDate: function() {
      return this.formatDate(this.item.fields.startDate || '')
    },

    /**
     * Compute and formate end date
     * @returns {String}
     */
    endDate: function() {
      return this.formatDate(this.item.fields.endDate || '')
    },
    dateRange: function() {
      return this.startDate == this.endDate || isEmpty(this.endDate) ? this.startDate : `${this.startDate} - ${this.endDate}`
    },
  },
  methods: {
    isInternalLink,
    highlightMatches,
    opensInNewTab
  }
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.el-table {
  width: 100%;
}
.property-table {
  td {
    background-color: transparent !important;
    padding: 0.25rem 0 0 0;
    border: none;
    cursor: default;
  }
  border: none;
  padding: 0;
}
// The outermost bottom border of the table. Element UI adds psuedo elements to create the bottom table border that we must hide to remove
table:not([class^='el-table__'])::before {
  display: none;
}
.property-name-column {
  width: 180px;
  font-weight: bold;
}
.event-list-item {
  border-radius: 3px 3px 0 0;
  background-color: white;
  margin-bottom: 5px;
}
.divider-text {
  line-height: 1em;
  position: relative;
  outline: 0;
  border: 0;
  color: $grey;
  text-align: center;
  height: 1.5em;
  &:before {
    content: '';
    background: linear-gradient(to right, transparent, $grey, transparent);
    position: absolute;
    left: 0;
    top: 50%;
    width: 100%;
    height: 1px;
  }
  &:after {
    content: attr(data-content);
    position: relative;
    display: inline-block;
    color: $grey;
    padding: 0 .5em;
    line-height: 1.5em;
    font-weight: 500;
    background-color: white;
  }
}
.event-content {
  display: flex;
  flex-direction: row;
  img {
    display: block;
    object-fit: cover;
    width: 8rem;
    height: 8rem;
  }

  .image {
    position: relative;
    margin: 2px;
  }

  .event-content-wrap {
    margin-left: 16px;
  }
}
.open-icon {
  height: 1.5rem;
  width: 1.5rem;
}
</style>
