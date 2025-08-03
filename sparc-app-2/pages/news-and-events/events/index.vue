<template>
  <Head>
    <Title>{{ searchTypes[1].label }}</Title>
    <Meta name="og:title" hid="og:title" :content="searchTypes[1].label" />
    <Meta name="twitter:title" :content="searchTypes[1].label" />
    <Meta name="description" hid="description" :content="`Browse ${searchTypes[1].label}`" />
    <Meta name="og:description" hid="og:description" :content="`Browse ${searchTypes[1].label}`" />
    <Meta name="twitter:description" :content="`Browse ${searchTypes[1].label}`" />
  </Head>
  <div class="page-data">
    <Breadcrumb :breadcrumb="breadcrumb" title="Events" />
    <div class="container">
      <h1 hidden>Search for events</h1>
      <div class="search-tabs__container">
        <h3>
          Browse categories
        </h3>
        <ul class="search-tabs">
          <li v-for="searchType in searchTypes" :key="searchType.label">
            <nuxt-link
              class="search-tabs__button"
              :class="{ active: searchType.path === 'events' }"
              :to="{
                path: searchType.path,
                query: {
                  ...$route.query,
                }
              }"
            >
              {{ searchType.label }}
            </nuxt-link>
          </li>
        </ul>
      </div>
      <div class="search-bar__container">
        <h5>
          Search within category
        </h5>
        <search-controls-contentful
          class="search-bar"
          placeholder="Enter search criteria"
          path="/news-and-events/events"
          showSearchText
        />
      </div>
    </div>
    <div class="pb-16 container">
      <el-row :gutter="32" type="flex">
        <el-col :span="24">
          <el-row :gutter="32">
            <el-col
              class="facet-menu"
              :sm="24"
              :md="6"
              :lg="6"
            >
              <client-only>
                <events-facet-menu
                  ref="eventsFacetMenu"
                  class="events-facet-menu"
                  @events-selections-changed="onPaginationPageChange(1)"
                />
              </client-only>
            </el-col>
            <el-col
              :sm='24'
              :md='18'
              :lg='18'
            >
              <div class="search-heading mt-32 mb-16">
                <div class="label1" v-show="eventItems?.length">
                  {{ eventsData?.total }} Results | Showing
                  <client-only>
                    <pagination-menu
                      :page-size="eventsData?.limit"
                      @update-page-size="onPaginationLimitChange"
                    />
                  </client-only>
                </div>
                <span class="label1">
                  Sort
                  <client-only>
                    <sort-menu
                      :options="sortOptions"
                      :selected-option="selectedSortOption"
                      @update-selected-option="onSortOptionChange"
                    />
                  </client-only>
                </span>
              </div>
              <div ref="eventsWrap" class="subpage">
                <client-only>
                  <event-list-item
                    v-for="(item, index) in eventItems"
                    :key="`${item.sys.id} - ${index}`"
                    :item="item"
                    :show-past-events-divider="showPastEventsDivider && item.sys.id == firstPastEventId"
                  />
                  <alternative-search-results-news
                    ref="altSearchResults"
                    :search-had-results="eventItems?.length > 0"
                    @vue:mounted="altResultsMounted"
                  />
                </client-only>
              </div>
              <div class="search-heading">
                <div class="label1" v-if="eventItems?.length">
                  {{ eventsData?.total }} Results | Showing
                  <client-only>
                    <pagination-menu
                      :page-size="eventsData?.limit"
                      @update-page-size="onPaginationLimitChange"
                    />
                  </client-only>
                </div>
                <client-only>
                  <pagination
                    v-if="eventsData?.limit < eventsData?.total"
                    :selected="curSearchPage"
                    :page-size="eventsData?.limit"
                    :total-count="eventsData?.total"
                    @select-page="onPaginationPageChange"
                  />
                </client-only>
              </div>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </div>
    <div class="pb-16 pt-16 container">
      <submit-news-section/>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useAsyncData } from '#app'
import { pathOr, propOr } from 'ramda'
import EventsFacetMenu from '@/components/FacetMenu/EventsFacetMenu.vue'
import EventListItem from '@/components/EventListItem/EventListItem.vue'
import SearchControlsContentful from '@/components/SearchControlsContentful/SearchControlsContentful.vue'
import SortMenu from '@/components/SortMenu/SortMenu.vue'
import SubmitNewsSection from '~/components/NewsEventsResourcesPage/SubmitNewsSection.vue'
import AlternativeSearchResultsNews from '~/components/AlternativeSearchResults/AlternativeSearchResultsNews.vue'
import { fetchEvents } from '../model'

const searchTypes = [
  { label: 'News', path: 'news' },
  { label: 'Events', path: 'events' },
  { label: 'Community Spotlight', path: 'community-spotlight' }
]

const sortOptions = [
  { label: 'Upcoming', id: 'upcoming', sortOrder: '-fields.upcomingSortOrder' },
  { label: 'Latest', id: 'latest', sortOrder: '-fields.startDate' },
  { label: 'A-Z', id: 'alphabatical', sortOrder: 'fields.title' },
  { label: 'Z-A', id: 'reverseAlphabatical', sortOrder: '-fields.title' }
]

const route = useRoute()
const { $contentfulClient } = useNuxtApp()

const altSearchResults = ref(null)
const eventsFacetMenu = ref(null)

const selectedSortOption = ref(sortOptions[0])

const breadcrumb = [
  { label: 'Home', to: { name: 'index' } },
  { label: 'News & Events', to: { name: 'news-and-events' } }
]

// Fetch events data using `useAsyncData` for server-side rendering
const { data: eventsData } = useAsyncData('eventsData', async () => {
  return await fetchEvents($contentfulClient, route.query.search, startLessThanDate.value, startGreaterThanOrEqualToDate.value, eventTypes.value, sortOrder.value, 10, 0)
})

const eventItems = computed(() => {
  return eventsData.value?.items
})

const startLessThanDate = computed(() => {
  return eventsFacetMenu.value?.getStartLessThanDate()
})

const startGreaterThanOrEqualToDate = computed(() => {
  return eventsFacetMenu.value?.getStartGreaterThanOrEqualToDate()
})

const eventTypes = computed(() => {
  return route.query.selectedEventTypeOptions || undefined
})

const sortOrder = computed(() => {
  return propOr('-fields.startDate', 'sortOrder', selectedSortOption.value)
})

const curSearchPage = computed(() => {
  return eventsData.value?.skip / eventsData.value?.limit + 1
})

const firstPastEventId = computed(() => {
  if (!eventItems?.value) return -1

  for (let i = 0; i < eventItems.value.length; i++) {
    const event = eventItems.value[i];
    const upcomingSortOrder = pathOr("", ['fields', 'upcomingSortOrder'], event);
    if (upcomingSortOrder < 0) {
      return pathOr("", ['sys', 'id'], event)
    }
  }
  return -1
})

const showPastEventsDivider = computed(() => {
  if (selectedSortOption.value?.id !== "upcoming") {
    return false
  }

  const firstEventId = pathOr(-1, [0, 'sys', 'id'], eventItems?.value)
  return firstPastEventId.value !== firstEventId
})

watch(
  () => route.query,
  async () => {
    // Have to do this anywhere we are setting eventsData.value in order to force reactivity to work since we are relying on nested reactivity causing some Vue reactivity quirkyness with eventsData.items.
    eventsData.value = { ...eventsData.value, items: [] }
    await nextTick()
    eventsData.value = await fetchEvents(
      $contentfulClient,
      route.query.search, 
      startLessThanDate.value, 
      startGreaterThanOrEqualToDate.value,
      eventTypes.value, 
      sortOrder.value, 
      10, 
      0
    )
    altSearchResults.value?.retrieveAltTotals()
  }
)

onMounted(async () => {
  eventsData.value = await fetchEvents(
      $contentfulClient,
      route.query.search, 
      startLessThanDate.value, 
      startGreaterThanOrEqualToDate.value,
      eventTypes.value, 
      sortOrder.value, 
      10, 
      0
    )
  altSearchResults.value?.retrieveAltTotals()
})

const onPaginationPageChange = async (page) => {
  const limit = eventsData.value?.limit || 10
  const offset = (page - 1) * limit || 0
  const response = await fetchEvents($contentfulClient, route.query.search, startLessThanDate.value, startGreaterThanOrEqualToDate.value, eventTypes.value, sortOrder.value, limit, offset)
  eventsData.value = { ...eventsData.value, items: [] }
  await nextTick()
  eventsData.value = response
}

const onPaginationLimitChange = async (limit) => {
  const newLimit = limit === 'View All' ? eventsData.value?.total : limit
  const response = await fetchEvents($contentfulClient, route.query.search, startLessThanDate.value, startGreaterThanOrEqualToDate.value, eventTypes.value, sortOrder.value, newLimit, 0)
  eventsData.value = { ...eventsData.value, items: [] }
  await nextTick()
  eventsData.value = response
}

const onSortOptionChange = async (option) => {
  selectedSortOption.value = option
  const response = await fetchEvents($contentfulClient, route.query.search, startLessThanDate.value, startGreaterThanOrEqualToDate.value, eventTypes.value, sortOrder.value, eventsData.value.limit, 0)
  eventsData.value = { ...eventsData.value, items: [] }
  await nextTick()
  eventsData.value = response
}

const altResultsMounted = () => {
  altSearchResults.value?.retrieveAltTotals()
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.page-data {
  background-color: $background;
}
.event-list-item {
  border-top: 1px solid $lineColor2;
  padding: 1rem 0;
  &:first-child {
    border: none;
    padding-top: 0;
  }
  &:last-child {
    padding-bottom: 0;
  }
}
:deep(.past-events-divider) {
  border-top: none;
  padding-top: 0;
}
.subpage {
  margin-bottom: 1rem;
  margin-top: 1rem;
  padding-bottom: 1rem;
}
.search-tabs__container {
  margin-top: 2rem;
  padding-top: 0.5rem;
  background-color: white;
  border: 0.1rem solid $lineColor2;
  h3 {
    padding-left: 0.75rem;
    font-weight: 600;
    font-size: 1.5rem;
  }
}
.search-bar__container {
  margin-top: 1em;
  padding: 0.75rem;
  border: 0.1rem solid $lineColor2;
  background: white;
  h5 {
    line-height: 1rem;
    font-weight: 600;
    font-size: 1rem;
  }
}
.search-tabs {
  display: flex;
  list-style: none;
  overflow: auto;
  margin: 0 0 0 0;
  padding: 0 0;
  outline: 0.1rem solid $purple;
  @media (max-width: 40rem) {
    display: block;
  }
  li {
    width: 100%;
    text-align: center;
    color: $purple;
  }
  li:last-child > a {
    border-right: none;
  }
}
.search-tabs__button {
  background: #f9f2fc;
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  outline: none;
  padding: 0;
  text-decoration: none;
  text-transform: uppercase;
  line-height: 3.5rem;
  @media (min-width: 40rem) {
    font-size: 0.65rem;
    border-right: 0.1rem solid $purple;
  }
  @media (min-width: 50rem) {
    font-size: .75rem;
  }
  @media (min-width: 64rem) {
    font-size: 1.25rem;
    font-weight: 600;
    text-transform: none;
  }
  &:hover,
  &.active {
    color: white;
    background-color: $purple;
    font-weight: 500;
  }
}
.search-heading {
  align-items: flex-end;
  display: flex;
  justify-content: space-between;
  @media screen and (max-width: 28em) {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 0;
  }
}
.events-facet-menu {
  margin-top: 2rem;
}
</style>
