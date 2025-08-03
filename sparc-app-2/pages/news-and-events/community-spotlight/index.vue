<template>
  <Head>
    <Title>{{ searchTypes[2].label }}</Title>
    <Meta name="og:title" hid="og:title" :content="searchTypes[2].label" />
    <Meta name="twitter:title" :content="searchTypes[2].label" />
    <Meta name="description" hid="description" :content="`Browse ${searchTypes[2].label}`" />
    <Meta name="og:description" hid="og:description" :content="`Browse ${searchTypes[2].label}`" />
    <Meta name="twitter:description" :content="`Browse ${searchTypes[2].label}`" />
  </Head>
  <div class="page-data">
    <Breadcrumb :breadcrumb="breadcrumb" title="Community Spotlight" />
    <div class="container">
      <h1 hidden>Search for community spotlights</h1>
      <div class="search-tabs__container">
        <h3>
          Browse categories
        </h3>
        <ul class="search-tabs">
          <li v-for="searchType in searchTypes" :key="searchType.label">
            <nuxt-link
              class="search-tabs__button"
              :class="{ active: searchType.path === 'community-spotlight' }"
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
          path="/news-and-events/community-spotlight"
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
                <community-spotlight-facet-menu
                  ref="communitySpotlightFacetMenu"
                  class="community-spotlight-facet-menu"
                  :anatomical-structures="anatomicalStructures"
                  @community-spotlight-selections-changed="onPaginationPageChange(1)"
                />
              </client-only>
            </el-col>
            <el-col
              :sm='24'
              :md='18'
              :lg='18'
            >
              <div class="search-heading mt-32 mb-16">
                <div class="label1" v-show="communitySpotlightItems?.items?.length">
                  {{ communitySpotlightItems?.total }} Results | Showing
                  <client-only>
                    <pagination-menu
                      :page-size="communitySpotlightItems?.limit"
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
              <div class="subpage">
                <template v-if="communitySpotlightItems?.items?.length > 0">
                  <client-only>
                    <community-spotlight-item
                      v-for="(item, index) in communitySpotlightItems?.items"
                      :key="index"
                      :story="getLinkedItems(item)"
                    />
                  </client-only>
                </template>
                <template v-else>
                  <div class="no-results-container">
                    No Results
                    <hr />
                  </div>
                </template>
                <client-only>
                  <alternative-search-results-news
                    ref="altSearchResults"
                    :search-had-results="communitySpotlightItems?.items?.length > 0"
                    @vue:mounted="altResultsMounted"
                  />
                </client-only>
              </div>
              <div class="search-heading">
                <div class="label1" v-if="communitySpotlightItems?.items?.length">
                  {{ communitySpotlightItems?.total }} Results | Showing
                  <client-only>
                    <pagination-menu
                      :page-size="communitySpotlightItems?.limit"
                      @update-page-size="onPaginationLimitChange"
                    />
                  </client-only>
                </div>
                <client-only>
                  <pagination
                    v-if="communitySpotlightItems?.limit < communitySpotlightItems?.total"
                    :selected="curSearchPage"
                    :page-size="communitySpotlightItems?.limit"
                    :total-count="communitySpotlightItems?.total"
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
      <submit-community-section/>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useAsyncData } from '#app'
import { pathOr, propOr } from 'ramda'
import CommunitySpotlightItem from '@/components/CommunitySpotlight/CommunitySpotlightItem.vue'
import CommunitySpotlightFacetMenu from '@/components/FacetMenu/CommunitySpotlightFacetMenu.vue'
import SearchControlsContentful from '@/components/SearchControlsContentful/SearchControlsContentful.vue'
import SortMenu from '@/components/SortMenu/SortMenu.vue'
import SubmitCommunitySection from '~/components/NewsEventsResourcesPage/SubmitCommunitySection.vue'
import AlternativeSearchResultsNews from '~/components/AlternativeSearchResults/AlternativeSearchResultsNews.vue'
import { fetchCommunitySpotlightItems } from '../model.js'


const searchTypes = [
  { label: 'News', path: 'news' },
  { label: 'Events', path: 'events' },
  { label: 'Community Spotlight', path: 'community-spotlight' }
]

const sortOptions = [
  { label: 'Latest', id: 'latest', sortOrder: '-fields.publishedDate' },
  { label: 'A-Z', id: 'alphabatical', sortOrder: 'fields.title' },
  { label: 'Z-A', id: 'reverseAlphabatical', sortOrder: '-fields.title' }
]

const route = useRoute()
const { $contentfulClient } = useNuxtApp()

const altSearchResults = ref(null)
const communitySpotlightFacetMenu = ref(null)

const selectedSortOption = ref(sortOptions[0])

const breadcrumb = [
  { label: 'Home', to: { name: 'index' } },
  { label: 'News & Events', to: { name: 'news-and-events' } }
]

const SPOTLIGHT_TYPE_MAPPING = [
  {
    label: 'Fireside Chat',
    id: 'firesideChat',
  },
  {
    label: 'Success Story',
    id: 'successStory',
  }
]

const selectedAnatomicalStructures = computed(() => {
  return route.query.selectedAnatomicalStructures?.split(",") || undefined
})

const spotlightTypes = computed(() => {
  return route.query.selectedSpotlightTypes || undefined
})

const sortOrder = computed(() => {
  return propOr('-fields.startDate', 'sortOrder', selectedSortOption.value)
})

const curSearchPage = computed(() => {
  return communitySpotlightItems.value?.skip / communitySpotlightItems.value?.limit + 1
})

const { data: communitySpotlightItems } = useAsyncData('communitySpotlightItems', () => {
  return fetchCommunitySpotlightItems($contentfulClient, route.query.search, spotlightTypes.value, selectedAnatomicalStructures.value, sortOrder.value, 10, 0)
})

const { data: anatomicalStructures } = useAsyncData('anatomicalStructures', async () => {
  let anatomicalStructures = {}
  await $contentfulClient.getContentType('communitySpotlight').then(contentType => {
    contentType.fields.forEach((field) => {
      if (field.id === 'anatomicalStructure') {
        let structures = field.items?.validations[0]['in']
        let facetData = []
        structures.forEach(itemLabel => {
          facetData.push({
            label: itemLabel,
            id: itemLabel,
          })
        })
        anatomicalStructures = {
          label: 'Focus',
          id: 'spotlightAnatomicalStructure',
          data: facetData
        }
      }
    })
  })
  return anatomicalStructures
})

watch(
  () => route.query,
  async () => {
    communitySpotlightItems.value = await fetchCommunitySpotlightItems(
      $contentfulClient,
      route.query.search,
      spotlightTypes.value,
      selectedAnatomicalStructures.value,
      sortOrder.value,
      10,
      0
    )
    altSearchResults.value?.retrieveAltTotals()
  },
  { immediate: true }
)

const onPaginationPageChange = async (page) => {
  const { limit } = communitySpotlightItems.value
  const offset = (page - 1) * limit
  const response = await fetchCommunitySpotlightItems($contentfulClient, route.query.search, spotlightTypes.value, selectedAnatomicalStructures.value, sortOrder.value, limit, offset)
  communitySpotlightItems.value = response
}

const onPaginationLimitChange = async (limit) => {
  const newLimit = limit === 'View All' ? communitySpotlightItems.value?.total : limit
  const response = await fetchCommunitySpotlightItems($contentfulClient, route.query.search, spotlightTypes.value, selectedAnatomicalStructures.value, sortOrder.value, newLimit, 0)
  communitySpotlightItems.value = response
}

const onSortOptionChange = async (option) => {
  selectedSortOption.value = option
  const response = await fetchCommunitySpotlightItems($contentfulClient, route.query.search, spotlightTypes.value, selectedAnatomicalStructures.value, sortOrder.value, communitySpotlightItems.value.limit, 0)
  communitySpotlightItems.value = response
}

const altResultsMounted = () => {
  altSearchResults.value?.retrieveAltTotals()
}

// The community spotlight item component needs to use the properties off the actual success stories/fireside chats
const getLinkedItems = (communitySpotlightItem) => {
  const linkedItem = pathOr('', ['fields','linkedItem'], communitySpotlightItem)
  const anatomicalStructures = pathOr('', ['fields','anatomicalStructure'], communitySpotlightItem)
  const spotlightTypeId = pathOr('', ['fields','itemType'], communitySpotlightItem)
  const spotlightType = SPOTLIGHT_TYPE_MAPPING.find(item => {
    return item.id == spotlightTypeId
  })?.label
  return {
    ...linkedItem,
    spotlightType,
    anatomicalStructures
  }
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.page-data {
  background-color: $background;
}
.story-result {
  border-top: 1px solid $lineColor2;
  padding-top: 1rem;
  padding-bottom: 1rem;
  &:first-child {
    border: none;
    padding-top: 0;
  }
  &:last-child {
    padding-bottom: 0;
  }
}
.subpage {
  margin-bottom: 1rem;
  margin-top: .5rem;
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
.community-spotlight-facet-menu {
  margin-top: 2rem;
}
.no-results-container {
  text-align: center;
  color: $lightGrey;
  hr {
    border-top: none;
    margin-top: 1rem;
  }
}
</style>
