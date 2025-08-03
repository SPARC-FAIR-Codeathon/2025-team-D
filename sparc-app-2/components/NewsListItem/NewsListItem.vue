<template>
  <div :v-if="isDestinationLinkRetreived" class="news-list-item">
    <div v-if="item.fields.image" class="image">
      <event-banner-image :src="item.fields.image.fields.file?.url"/>
      <sparc-pill class="sparc-pill" v-if="fundingOpportunity">
        Funding
      </sparc-pill>
    </div>
    <div class="news-content-wrap">
      <h3>
        <nuxt-link
          v-if="item.fields.requiresADetailsPage"
          :to="{
            name: 'news-and-events-news-id',
            params: { id: item.sys.id }
          }"
        >
          <p v-html="highlightMatches(item.fields.title, $route.query.search)"/>
        </nuxt-link>
        <a
          v-else
          :href="item.fields?.url"
          :target="openInNewTab ? '_blank' : '_self'"
        >
          <span v-html="highlightMatches(item.fields.title, $route.query.search)"/>
          <svgo-icon-open class="icon-open" v-if="openInNewTab" />
        </a>
      </h3>
      <p v-html="highlightMatches(item.fields.summary, $route.query.search)"/>
      <p class="news-list-item__date">
        {{ publishedDate }}
      </p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  item: Object,
})
const { item } = toRefs(props)
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
import { pathOr } from 'ramda'
import FormatDate from '@/mixins/format-date'
import EventBannerImage from '@/components/EventBannerImage/EventBannerImage.vue'
import SparcPill from '@/components/SparcPill/SparcPill.vue'

import { isInternalLink, opensInNewTab } from '@/mixins/marked/index'
import { highlightMatches } from '@/utils/utils'

export default {
  name: 'NewsListItem',

  components: {
    EventBannerImage,
    SparcPill
  },

  mixins: [FormatDate],

  computed: {
    /**
     * Compute and formate start date
     * @returns {String}
     */
    publishedDate: function() {
      return this.formatDate(this.item.fields.publishedDate || '')
    },
    fundingOpportunity: function() {
      const subjectTag = pathOr([], ['fields', 'subject'], this.item)
      return subjectTag == 'Funding Opportunity'
    }
  },

  methods: {
    isInternalLink,
    opensInNewTab,
    highlightMatches
  }
}
</script>

<style lang="scss" scoped>
h3 {
  font-size: 1em;
  font-weight: 500;
  line-height: 1.2;
  margin-bottom: 0.5rem;
}
p {
  margin-bottom: 0.5rem;
}
.news-list-item__date {
  font-size: 0.875rem;
  font-style: italic;
  margin: 0;
}
.news-list-item {
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

  .news-content-wrap {
    margin-left: 16px;
  }
}
.sparc-pill {
  position: absolute;
  right: .25rem;
  top: .25rem;
}
.icon-open {
  height: 1.5rem;
  width: 1.5rem
}
</style>
