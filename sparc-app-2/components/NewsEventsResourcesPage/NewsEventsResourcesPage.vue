<template>
  <div class="page">
    <breadcrumb :breadcrumb="breadcrumb" :title="heroTitle" />
    <page-hero class="news-header py-24">
      <h1 v-html="parseMarkdown(heroTitle)"/>
      <div class="body2" v-html="parseMarkdown(heroSummary)"/>
    </page-hero>
    <div class="container">
      <div class="subpage">
        <!-- eslint-disable vue/no-v-html -->
        <!-- marked will sanitize the HTML injected -->
        <el-row :gutter="32">
          <el-col :xs="24" :sm="firstCol" class="details">
            <slot />
            <h3>Share</h3>
            <share-links />
          </el-col>
          <el-col :xs="24" :sm="secondCol">
            <div class="content" v-html="parseMarkdown(htmlContent)" />
            <nuxt-link class="back-link" v-if="hasEventDetailsPage" :to="{ path: eventDetailsRoute }">
              View Additional Event Details >
            </nuxt-link>
          </el-col>
        </el-row>
      </div>

      <nuxt-link class="back-link" :to="{ name: backLink }">
        {{ backCopy }}
      </nuxt-link>
    </div>
  </div>
</template>

<script>
import MarkedMixin from '@/mixins/marked'
import FormatDate from '@/mixins/format-date'
import ShareLinks from '@/components/ShareLinks/ShareLinks'

import FirstCol from '@/mixins/first-col/index'

export default {
  name: 'NewsEventsResourcesPage',

  components: {
    ShareLinks
  },

  mixins: [FormatDate, MarkedMixin, FirstCol],

  props: {
    page: {
      type: Object,
      default: () => {
        return {}
      }
    },
    content: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: ''
    },
    heroTitle: {
      type: String,
      default: ''
    },
    heroSummary: {
      type: String,
      default: ''
    },
    breadcrumb: {
      type: Array,
      default: () => {
        return []
      }
    },
    hasEventDetailsPage: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    /**
     * Compute HTML Content for the page
     * @returns {String}
     */
    htmlContent() {
      return this.content || ''
    },

    /**
     * Construct current url 
     * @returns {String}
     */
    pageUrl: function() {
      return `${this.$config.public.ROOT_URL}${this.$route.fullPath}`
    },

    /**
     * Compute the first column's attributes
     * @returns {Object}
     */
    secondCol() {
      return this.type === 'event' ? { span: 12 } : { span: 12, pull: 12 }
    },

    /**
     * Compute back link, depending on the content type
     * @returns {String}
     */
    backLink() {
      const routesLookup = {
        event: 'news-and-events-events',
        news: 'news-and-events-news',
        resource: 'resources'
      }
      return routesLookup[this.type]
    },

    /**
     * Compute back link copy, depending on the content type
     * @returns {String}
     */
    backCopy() {
      const nameLookup = {
        event: 'Events',
        news: 'News',
        resource: 'Tools & Resources'
      }
      const name = nameLookup[this.type]

      return `View All ${name} >`
    },
    eventDetailsRoute: function() {
      return `${this.$route.path}/event-details`
    }
  },
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';

.content {
  & :deep(img),
  & :deep(video) {
    display: block;
    height: auto;
    margin: auto;
    max-width: 100%;
  }
}

.header {
  margin-bottom: 3em;
  .updated {
    color: #aaa;
  }
}
:deep(.details)  {
  font-size: 0.875rem;
  h3 {
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.5rem;
    text-transform: uppercase;
  }
  img {
    display: block;
    margin: auto;
    height: auto;
    max-width: 100%;
  }
}
.back-link {
  color: $darkBlue;
  font-weight: 700;
}
.page {
  background-color: $background;
  padding-bottom: 2rem;
}
</style>

<style lang="scss">
.news-header {
  & sup {
    vertical-align: baseline;
    position: relative;
    top: -0.4em;
  }
}
</style>
