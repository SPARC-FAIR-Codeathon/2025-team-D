<template>
  <Head>
    <Title>{{ title }}</Title>
    <Meta name="og:title" hid="og:title" :content="title" />
    <Meta name="twitter:title" :content="title" />
    <Meta name="description" hid="description" :content="`Browse ${title}`" />
    <Meta name="og:description" hid="og:description" :content="`Browse ${title}`" />
    <Meta name="twitter:description" :content="`Browse ${title}`" />
  </Head>
  <div class="page-data">
    <Breadcrumb :breadcrumb="breadcrumb" :title="title" />
    <div class="container">
      <h1 hidden>Search for tools and resources</h1>
      <div class="search-tabs__container">
        <h3>
          Browse categories
        </h3>
        <ul class="search-tabs">
          <li v-for="searchType in searchTypes" :key="searchType.label">
            <nuxt-link
              class="search-tabs__button"
              :class="{ active: searchType.path === path }"
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
          :path="path"
          showSearchText
        />
      </div>
    </div>
    <div class="pb-16 container pt-32">
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
                <tools-and-resources-facet-menu
                  :fundingFacets="resourcesFundingFacets"
                  @tool-and-resources-selections-changed="onPaginationPageChange(1)"
                />
              </client-only>
            </el-col>
            <el-col
              :sm='24'
              :md='18'
              :lg='18'
            >
              <div class="search-heading mb-16">
                <div class="label1" v-show="resources?.items?.length">
                  {{ resources?.total }} Results | Showing
                  <client-only>
                    <pagination-menu
                      :page-size="resources?.limit"
                      @update-page-size="onPaginationLimitChange"
                    />
                  </client-only>
                </div>
                <span v-if="resources?.items?.length" class="label1">
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
                <client-only><resources-search-results :table-data="resources?.items" /></client-only>
                <alternative-search-results
                  ref="altSearchResults"
                  :search-had-results="resources?.items?.length > 0"
                />
              </div>
              <div class="search-heading">
                <div class="label1" v-if="resources?.items?.length">
                  {{ resources?.total }} Results | Showing
                  <client-only>
                    <pagination-menu
                      :page-size="resources?.limit"
                      @update-page-size="onPaginationLimitChange"
                    />
                  </client-only>
                </div>
                <client-only>
                  <pagination
                    v-if="resources?.limit < resources?.total"
                    :selected="curSearchPage"
                    :page-size="resources?.limit"
                    :total-count="resources?.total"
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
      <submit-tool-section/>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useNuxtApp } from '#imports'
import { useAsyncData } from '#app'
import SearchControlsContentful from '@/components/SearchControlsContentful/SearchControlsContentful.vue'
import SortMenu from '@/components/SortMenu/SortMenu.vue'
import ResourcesSearchResults from '@/components/Resources/ResourcesSearchResults.vue'
import ToolsAndResourcesFacetMenu from '@/components/FacetMenu/ToolsAndResourcesFacetMenu.vue'
import AlternativeSearchResults from '@/components/AlternativeSearchResults/AlternativeSearchResultsResources.vue'
import SubmitToolSection from '@/components/Resources/SubmitToolSection.vue'
import { fetchResources, searchTypes, sortOptions } from '@/pages/resources/utils'

const route = useRoute()
const { $contentfulClient } = useNuxtApp()
const resources = ref(null)

const { data: resourcesFundingFacets } = await useAsyncData(
  'resources-funding-facets',
  async () => {
    const facetData = []
    try {
      const contentType = await $contentfulClient.getContentType('sparcPartners')
      contentType.fields.forEach(field => {
        if (field.name === 'Program') {
          let fundingItems = field.items?.validations[0]['in']
          fundingItems.forEach(itemLabel => {
            facetData.push({
              label: itemLabel,
              id: itemLabel,
            })
          })
        }
      })
    } catch (e) {
      console.error('Error fetching funding facets:', e)
    }
    return facetData
  }
)

const altSearchResults = ref(null)
const selectedSortOption = ref(sortOptions[0])
const breadcrumb = ref([
  { label: 'Home', to: { name: 'index' } },
  { label: 'Tools & Resources', to: { name: 'tools' } }
])

const curSearchPage = computed(() => resources.value.skip / resources.value.limit + 1)

const sortOrder = computed(() => {
  return selectedSortOption.value ? selectedSortOption.value['sortOrder'] : '-fields.name'
})

const resourceType = computed(() => route.query.resourceType || undefined)
const fundingProgram = computed(() => route.query.selectedResourcesFundingIds || undefined)
const type = computed(() => route.query.type || undefined)
const path = computed(() => route.path)
const searchType = computed(() => searchTypes.find(searchType => searchType.path === route.path))
const title = computed(() => searchType.value?.label)
const isTool = computed(() => title.value === 'Tools')

const onPaginationPageChange = async (page) => {
  const { limit } = resources.value
  const offset = (page - 1) * limit
  const response = await fetchResources(resourceType.value, fundingProgram.value, isTool.value, route.query.search, sortOrder.value, type.value, limit, offset)
  resources.value = response
}

const onPaginationLimitChange = async (limit) => {
  const newLimit = limit === 'View All' ? resources.value.total : limit
  const response = await fetchResources(resourceType.value, fundingProgram.value, isTool.value, route.query.search, sortOrder.value, type.value, newLimit, 0)
  resources.value = response
}

const onSortOptionChange = async (option) => {
  selectedSortOption.value = option
  const response = await fetchResources(resourceType.value, fundingProgram.value, isTool.value, route.query.search, sortOrder.value, type.value, resources.value.limit, 0)
  resources.value = response
}

watch(() => route.query, async () => {
  resources.value = await fetchResources(resourceType.value, fundingProgram.value, isTool.value, route.query.search, sortOrder.value, type.value, 10, 0)
  altSearchResults.value?.retrieveAltTotals()
}, { immediate: true })
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.page-data {
  background-color: $background;
}
:deep(.resources-search-results__items) {
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
.subpage {
  margin-bottom: 1rem;
  margin-top: 1rem;
  padding-bottom: 1rem;
}
.page-wrap {
  margin-bottom: 2.5rem;
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
