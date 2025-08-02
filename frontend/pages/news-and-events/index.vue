<template>
  <Head>
    <Title>{{ page?.fields?.page_title }}</Title>
    <Meta name="og:title" hid="og:title" :content="page?.fields?.page_title" />
    <Meta name="twitter:title" :content="page?.fields?.page_title" />
    <Meta name="description" hid="description" :content="page?.fields?.heroCopy" />
    <Meta name="og:description" hid="og:description" :content="page?.fields?.heroCopy" />
    <Meta name="twitter:description" :content="page?.fields?.heroCopy" />
  </Head>
  <div class="page-data">
    <Breadcrumb :breadcrumb="breadcrumb" :title="title" />
    <page-hero class="py-24">
      <h1>{{ page?.fields?.page_title }}</h1>
      <div v-html="parseMarkdown(page?.fields?.heroCopy)" />
      <img
        v-if="page?.fields?.heroImage"
        class="page-hero-img"
        :src="page.fields.heroImage.fields.file.url"
      />
      <NuxtLink to="/news-and-events/news">
        <el-button class="secondary mb-16">Browse All News &amp; Events</el-button>
      </NuxtLink>
    </page-hero>

    <div class="pt-32 pb-16">
      <div class="container">
        <div v-if="Object.keys(featuredEvent).length" class="mb-48">
          <div class="heading2 mb-16">Featured Event</div>
          <FeaturedEvent :event="featuredEvent" />
        </div>

        <el-row :gutter="32">
          <el-col class="mb-16" :sm="12">
            <div class="heading2 mb-16">Latest News</div>
            <div class="subpage news-wrap">
              <news-list-item
                v-for="newsItem in news.items"
                :key="newsItem.sys.id"
                :item="newsItem"
              />
              <nuxt-link class="btn-load-more mt-16" to="/news-and-events/news">
                View All News
              </nuxt-link>
            </div>
          </el-col>
          <el-col :sm="12">
            <div class="heading2 mb-16">Events</div>
            <div class="upcoming-events">
              <event-card
                v-for="event in upcomingEvents.items"
                :key="event.sys.id"
                :event="event"
              />
            </div>
            <nuxt-link class="btn-load-more mt-16" to="/news-and-events/events">
              View All Events
            </nuxt-link>
          </el-col>
        </el-row>

        <div>
          <div class="heading2 mb-16 mt-32">Community Spotlight</div>
          <community-spotlight-listings
            :stories="stories.items"
            :bottom-link="true"
          />
        </div>

        <div id="stayConnected" class="heading2 mt-32 mb-16">Stay Connected</div>
        <div class="subpage py-16">
          <el-row :gutter="32">
            <el-col :xs="24" :sm="12" class="newsletter-wrap">
              <div class="heading2">Sign up for the SPARC Newsletter</div>
              <div class="body1 mb-16 mt-8">
                Keep up to date with all the latest news and events from the SPARC Portal.
              </div>
              <nuxt-link to="/communication-preferences">
                <el-button
                  class="secondary"
                >
                  Sign Up <svgo-icon-open class="tab1" />
                </el-button>
              </nuxt-link>
              <div class="newsletter-archive mt-16">
                <div class="heading2 mt-24">Current Newsletter</div>
                <a
                  class="mt-8"
                  href="https://docs.sparc.science/docs/sparc-plug-current"
                  target="_blank"
                >
                  Read the current SPARC Plug Newsletter<svgo-icon-open />
                </a>
                <a
                  class="mt-8"
                  href="https://docs.sparc.science/docs/sparc-plug-newsletter-archive"
                  target="_blank"
                >
                  View Newsletters Archive<svgo-icon-open />
                </a>
              </div>
              <div class="heading2 mt-24">Get Involved</div>
              <div class="body1 mb-16 mt-8">
                Empower SPARC to promote your science and interests by submitting your science
                story, news, or event.
              </div>
              <div class="get-involved-buttons-container">
                <nuxt-link :to="{ name: 'contact-us', query: { type: 'news-event' } }">
                  <el-button class="get-involved-button secondary">
                    Share News Or Events
                  </el-button>
                </nuxt-link>
                <nuxt-link :to="{ name: 'contact-us', query: { type: 'story' } }">
                  <el-button class="get-involved-button secondary mt-8">
                    Submit A Community Spotlight Idea
                  </el-button>
                </nuxt-link>
              </div>
            </el-col>
            <el-col :xs="24" :sm="12" class="newsletter-wrap right-panel bluesky-container">
              <div class="heading2">SPARC on Bluesky</div>
              <bsky-embed username="sparc.science" limit="4" load-more custom-styles="*, :before, :after { border-style: none; }" />
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAsyncData } from '#app'
import { fetchData } from './model'
import { parseMarkdown } from '@/utils/formattingUtils.js'

const breadcrumb = [
  {
    to: { name: 'index' },
    label: 'Home',
  },
];

const title = 'News & Events';

// Fetch initial data
const { data: pageData } = await useAsyncData(() => {
  const { $contentfulClient } = useNuxtApp()
  return fetchData($contentfulClient, '', 2)
});

const page = computed(() => pageData.value?.page || {})
const news = computed(() => pageData.value?.news || {})
const upcomingEvents = computed(() => pageData.value?.upcomingEvents || {})
const stories = computed(() => pageData.value?.stories || {})
const featuredEvent = computed(() => page.value?.fields?.featuredEvent || {})

onMounted(() => {
  const script = document.createElement('script')
  script.type = 'module'
  script.src = 'https://cdn.jsdelivr.net/npm/bsky-embed/dist/bsky-embed.es.js'
  document.body.appendChild(script)
})

</script>

<style scoped lang="scss">
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.page-data {
  background-color: $background;
}
.heading1 {
  font-weight: 300;
}
.subpage {
  margin: 0;
}
.event-card {
  margin-bottom: 2em;
}
.upcoming-events {
  justify-content: space-between;
  display: flex;
  flex-wrap: wrap;
}
.upcoming-event {
  margin: 0;
  width: 100%;
  @media (min-width: 48em) {
    width: calc(50% - 2.4rem); // Account for the margins and the border
  }
}
.news-list-item {
  border-bottom: 2px solid #d8d8d8;
  padding: 1.5em 0;
  &:first-child {
    padding-top: 0;
  }
}
.newsletter-wrap {
  font-size: 1.125rem;
  line-height: 1.5rem;
  margin-bottom: 2rem;
  @media (min-width: 48em) {
    margin-bottom: 0;
    &.right-panel {
      border-left: 2px solid #d8d8d8;
    }
  }
  p {
    color: $darkBlue
  }
}

.btn-load-more {
  background: none;
  border: none;
  color: $purple;
  cursor: pointer;
  display: block;
  font-size: 1rem;
  font-weight: 500;
  padding: 0;
  text-decoration: underline;
}

.newsletter-archive {
  & > a {
    display: inline-block;
  }
}
:deep(.el-button) {
  a {
    text-decoration: none !important;
  }
}

.get-involved-buttons-container {
  display: flex;
  flex-direction: column;
  width: fit-content;
}

.get-involved-button {
  width: 100%;
  margin-left: 0 !important;
}
:deep(.campaign) {
  margin-top: .5rem; 
}

.bluesky-container {
  max-height: 26rem;
  overflow: auto;
  display: flex;
  flex-direction: column;
  & > bsky-embed {
    flex: 1;
    overflow: auto;
  }
}
</style>
