<template>
  <div>
    <breadcrumb :breadcrumb="breadcrumb" :title="heroTitle" />
    <page-hero class="py-24">
      <h1>{{ heroTitle }}</h1>
      <client-only><p v-html="parseMarkdown(heroSummary)" /></client-only>
    </page-hero>
    <div class="container">
      <div class="subpage mb-32">
        <!-- eslint-disable vue/no-v-html -->
        <!-- marked will sanitize the HTML injected -->
        <slot />
        <div class="content" v-html="parseMarkdown(htmlContent)" />
        <hr v-if="hasTutorial || hasWebinar" class="my-24"/>
        <div class="mb-16" v-if="hasTutorial">
          <div class="label4 mb-4" >
            TUTORIALS & GUIDES
          </div>
          <a class="resource-link" v-for="(tutorial, index) in tutorials" :key="index" :href="tutorial.fields.url" :target="!opensInNewTab(tutorial.fields.url) ? '_self' : '_blank'">
            {{ tutorial.fields.title }}
            <svgo-icon-open v-if="!isInternalLink(tutorial.fields.url)" name="icon-open" height="25" width="25" />
          </a>
        </div>
        <div v-if="hasWebinar">
          <div class="label4 mb-4" >
            VIDEOS & WEBINARS
          </div>
          <a class="resource-link" v-for="(webinar, index) in webinars" :key="index" :href="webinar.fields.url" :target="!opensInNewTab(webinar.fields.url) ? '_self' : '_blank'">
            {{ webinar.fields.title }}
            <svgo-icon-open v-if="!isInternalLink(webinar.fields.url)" name="icon-open" height="25" width="25" />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MarkedMixin from '@/mixins/marked'
import FormatDate from '@/mixins/format-date'
import { pathOr } from 'ramda'
import { isInternalLink, opensInNewTab } from '@/mixins/marked/index'

export default {
  name: 'ToolsAndResourcesPage',

  mixins: [FormatDate, MarkedMixin],

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
    }
  },

  methods: {
    isInternalLink,
    opensInNewTab
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
      return `${this.$$config.public.ROOT_URL}${this.$route.fullPath}`
    },
    tutorials: function() {
      return pathOr(null, ['fields', 'tutorials'], this.page)
    },
    hasTutorial: function() {
      return this.tutorials != null
    },
    webinars: function() {
      return pathOr(null, ['fields', 'webinars'], this.page)
    },
    hasWebinar: function() {
      return this.webinars != null
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
hr {
  border-top: none;
  border-left: none;
  border-right: none;
}
.resource-link {
  display: block;
  text-decoration: underline;
}
</style>
