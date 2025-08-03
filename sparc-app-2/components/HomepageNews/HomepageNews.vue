<template>
  <div class="featured-datasets container pt-24">
    <h2 class="heading2 title mt-0 mb-24">
      News &amp; Upcoming Events
    </h2>
    <sparc-card
      v-for="(item, index) in upcomingNews"
      :key="item.sys.id"
      :image-align="index % 2 ? 'right' : ''"
    >
      <template v-slot:image>
        <div class="sparc-card__image-container">
          <a class="centered" v-if="item.fields.requiresADetailsPage" :href="href(item)">
            <img
              class="sparc-card__image"
              :src="getImageSrc(item)" 
              :alt="getImageAlt(item)" 
            />
          </a>
          <template v-else>
            <div class="centered" v-if="item.fields.url">
              <a :href="item.fields.url" :target="newsItemIsInternalLink[index] ? '_self' : '_blank'">
                <img
                  class="sparc-card__image"
                  :src="getImageSrc(item)" 
                  :alt="getImageAlt(item)" 
                />
              </a>
            </div>
            <div v-else class="centered">
              <img
                  class="sparc-card__image"
                  :src="getImageSrc(item)" 
                  :alt="getImageAlt(item)" 
                />
            </div>
          </template>
        </div>
      </template>
      <div>
        <h3>
          <nuxt-link
            v-if="item.fields.requiresADetailsPage"
            :to="nuxtLink(item)"
          >
            {{ item.fields.title }}
          </nuxt-link>
          <a
            v-else
            :href="item.fields.url"
            :target="newsItemIsInternalLink[index] ? '_self' : '_blank'"
          >
            {{ item.fields.title }}
          </a>
        </h3>
        <div class="sparc-card__detail" v-if="eventDate(item) || item.fields.location">
          <template v-if="eventDate(item)">
            <svgo-icon-calendar class="body1"/>
            <p>{{ eventDate(item) }}</p>
          </template>
          <template v-if="item.fields.location">
            <svgo-icon-map
              class="body1 sparc-card__detail--location"
            />
            <p>{{ item.fields.location }}</p>
          </template>
        </div>
        <!-- eslint-disable vue/no-v-html -->
        <!-- marked will sanitize the HTML injected -->
        <div class="markdown-text" v-html="parseMarkdown(item.fields.summary)" />
      </div>
      <nuxt-link v-if="item.fields.requiresADetailsPage" :to="nuxtLink(item)">
        <el-button size="default" class="secondary">
          Learn More
        </el-button>
      </nuxt-link>
      <a
        v-else
        :href="item.fields.url"
        :target="newsItemIsInternalLink[index] ? '_self' : '_blank'"
      >
        <el-button size="default" class="secondary">
          Learn More
        </el-button>
      </a>
      <nuxt-link to="news-and-events" class="view-all-link">
        View All News &amp; Events
      </nuxt-link>
    </sparc-card>
  </div>
</template>

<script>
import { pathOr } from 'ramda'
import SparcCard from '@/components/SparcCard/SparcCard.vue'
import MarkedMixin from '@/mixins/marked'
import FormatDate from '@/mixins/format-date'
import { isAnchor } from '@/mixins/marked/index'
export default {
  name: 'HomepageNews',
  components: {
    SparcCard
  },
  mixins: [MarkedMixin, FormatDate],
  props: {
    news: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      itemIsInternalLink: []
    }
  },
  async created() {
    await this.fetchBitlyLinks()
  },
  computed: {
    newsItemIsInternalLink() {
      return this.itemIsInternalLink
    },
    /**
     * Filter news to remove past events
     * @returns {Array}
     */
    upcomingNews: function() {
      return this.news.filter(event => this.isUpcoming(event))
    }
  },
  methods: {
    isAnchor,
    async fetchBitlyLinks() {
      this.upcomingNews.forEach(async item => {
        const url = pathOr("", ['fields', 'url'], item)
        if (url.includes('bit.ly')) {
          const bitlyId = url.replace("https://", "")
          try {
            const response = await this.$axios.post(this.$config.public.bitly_expand_endpoint, { bitlink_id: bitlyId }, {
              headers: {
                Authorization: `Bearer ${this.$config.public.BITLY_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
              }
            })
            const newUrl = response.data.long_url
            this.itemIsInternalLink.push(this.isInternalLink(newUrl))
          } catch {
            console.log("Error retreiving bitly link destination url")
            this.itemIsInternalLink.push(this.isInternalLink(url))
          }
        }
        else {
          this.itemIsInternalLink.push(this.isInternalLink(url))
        }
      })
    },
    isInternalLink(str){
      return isAnchor(str)
        ? true
        : str.includes(this.$config.public.ROOT_URL) || str.includes("sparc.science") || str.startsWith('/')
    },
    /**
     * Get image source
     * @param {Object} item
     * @returns {String}
     */
    getImageSrc: function(item) {
      return pathOr('', ['fields', 'image', 'fields', 'file', 'url'], item)
    },
    /**
     * Get image source
     * @param {Object} item
     * @returns {String}
     */
    getImageAlt: function(item) {
      return pathOr(
        '',
        ['fields', 'image', 'fields', 'file', 'description'],
        item
      )
    },
    /**
     * Get event date range, if there is no end date, default to start date
     * @returns {String}
     */
    eventDate: function(event) {
      const startDate = this.formatDate(event.fields.startDate || '')
      const endDate = this.formatDate(event.fields.endDate || '')
      return startDate === endDate || !endDate
        ? startDate
        : `${startDate} - ${endDate}`
    },
    /**
     * Check if an event is upcoming, if there is no end date, default to start date
     * @param {Object} item
     * @returns {Boolean}
     */
    isUpcoming: function(item) {
      const today = new Date()
      const checkDate = item.fields.endDate || item.fields.startDate || ''
      return checkDate ? Date.parse(checkDate) > Date.parse(today) : true
    },
    /**
     * Create nuxt link based on type
     * @param {Object} item
     * @returns {Object}
     */
     nuxtLink: function(item) {
      const contentTypeId = pathOr("", ["sys","contentType","sys","id"], item)
      const itemId = pathOr("", ["sys","id"], item)
      const name = contentTypeId == 'news'
          ? 'news-and-events-news-id'
          : 'news-and-events-events-id'
      return {
        name,
        params: { id: itemId }
      }
    },
    href: function(item) {
      const contentTypeId = pathOr("", ["sys","contentType","sys","id"], item)
      const itemId = pathOr("", ["sys","id"], item)
      return contentTypeId == 'news'
          ? `news-and-events/news/${itemId}`
          : `news-and-events/events/${itemId}`
    }
  }
}
</script>

<style lang="scss" scoped>
$tablet-small: 48em;
$tablet-large: 64em;
.title {
  text-align: center;
}
.centered {
  display: flex;
  margin: auto;
}
h2 a:not(:hover) {
  color: #000;
  text-decoration: none;
}
:deep(div.sparc-card) {
  padding-bottom: 1.5rem;
  @media (min-width: $tablet-small) {
    padding-bottom: 1.5rem;
  }
  .sparc-card__content-wrap {
    flex: 7 0 0rem;
    .sparc-card__content-wrap__content {
      @media (min-width: $tablet-small) {
        font-size: 0.9rem;
        line-height: 1.5rem;
        padding: 2rem;
        .markdown-text {
          p {
            margin: 0 0 1.5rem;
          }
        }
      }
      @media (min-width: $tablet-large) {
        font-size: 1rem;
      }
    }
  }
  h3 {
    font-size: 1.333333333rem;
    line-height:1.33333333rem;
    margin:0 0 1rem;
  }
  .sparc-card__detail {
    align-items: baseline;
    display: flex;
    margin-bottom: 1rem;
    .nuxt-icon {
      flex-shrink: 0;
      margin-right: 0.5rem;
    }
    p {
      margin-bottom: 0rem;
      margin-right: 2rem;
    }
    .sparc-card__detail--location {
      margin-left: 1.25rem;
    }
  }
}
.view-all-link {
  margin-top: auto;
  text-decoration: underline !important;
}
svg {
  color: white;
}
</style>
