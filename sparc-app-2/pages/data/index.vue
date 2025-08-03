<template>
  <Head>
    <Title>{{ searchType.label }}</Title>
    <Meta name="og:title" hid="og:title" :content="title" />
    <Meta name="twitter:title" :content="title" />
    <Meta name="description" hid="description" :content="`Browse ${title}`" />
    <Meta name="og:description" hid="og:description" :content="`Browse ${title}`" />
    <Meta name="twitter:description" :content="`Browse ${title}`" />
    <link rel="canonical" href="https://sparc.science/data" />
    <Meta name="robots" content="noindex, nofollow" />
  </Head>
  <div class="page-data">
    <breadcrumb :breadcrumb="breadcrumb" :title="searchType.label" />
    <div class="container">
      <div class="search-tabs__container">
        <h1 hidden>Dataset search</h1>
        <div class="heading2 pl-8 mb-8">
          Browse categories
        </div>
        <ul class="search-tabs">
          <template v-for="search in searchTypes" :key="search.label">
            <li v-if="(search.type == 'device' && showDeviceType) || search.type != 'device'">
              <nuxt-link class="search-tabs__button" :class="{ active: search.type === $route.query.type }" :to="{
                  name: 'data',
                  query: {
                    ...$route.query,
                    type: search.type,
                  }
                }">
                {{ search.label }}
              </nuxt-link>
            </li>
          </template>
        </ul>
      </div>
      <div class="search-bar__container">
        <div class="body1 mb-8">
          Search within category
        </div>
        <search-controls-contentful class="search-bar" placeholder="Enter search criteria (e.g., researcher name or other keywords)" :path="$route.path"
          showSearchText />
      </div>
    </div>
    <div class="container">
      <el-row :gutter="32" type="flex">
        <el-col :span="24">
          <el-row :gutter="32">
            <el-col class="facet-menu" :sm="24" :md="8" :lg="6">
              <client-only>
                <dataset-facet-menu :facets="facets" :visible-facets="visibleFacets"
                  @selected-facets-changed="onFacetSelectionChange()" @hook:mounted="facetMenuMounted"
                  ref="datasetFacetMenu" />
              </client-only>
            </el-col>
            <el-col :sm="searchColSpan('sm')" :md="searchColSpan('md')" :lg="searchColSpan('lg')">
              <div class="search-heading">
                <p v-show="!isLoadingSearch && searchData.items.length">
                  {{ searchData.total }} Results | Showing
                  <client-only>
                    <pagination-menu :page-size="searchData.limit" @update-page-size="updateDataSearchLimit" />
                  </client-only>
                </p>
                <span v-if="searchData.items.length" class="label1">
                  Sort
                  <sort-menu :options="algoliaSortOptions" :selected-option="selectedAlgoliaSortOption"
                    @update-selected-option="onAlgoliaSortOptionChange" />
                </span>
              </div>
              <div v-loading="isLoadingSearch" class="table-wrap">
                <p v-if="searchFailed" class="search-error">
                  Sorry, the search engine has encountered an unexpected
                  error, please try again later.
                </p>
                <dataset-search-results :tableData="tableData" />
                <div v-if="searchHasAltResults" class="mt-24">
                  <template v-if="searchData.total === 0">
                    No results were found for <strong>{{ searchType.label }}</strong>.
                  </template>
                  The following results were discovered for the other categories:
                  <br />
                  <br />
                  <template v-for="dataType in dataTypes">
                    <dd v-if="resultCounts[dataType] > 0" :key="dataType">
                      <nuxt-link class="alternative-links" :to="{
                          name: 'data',
                          query: {
                            ...$route.query,
                            type: dataType
                          }
                        }">
                        {{ resultCounts[dataType] }} result{{
                        resultCounts[dataType] > 1 ? 's' : ''
                        }}
                      </nuxt-link>
                      - {{ humanReadableDataTypesLookup[dataType] }}
                    </dd>
                  </template>
                </div>
              </div>
              <div class="search-heading">
                <p v-if="!isLoadingSearch && searchData.items.length">
                  {{ searchHeading }} | Showing
                  <client-only>
                    <pagination-menu :page-size="searchData.limit" @update-page-size="updateDataSearchLimit" />
                  </client-only>
                </p>
                <client-only>
                  <pagination v-if="searchData.limit < searchData.total" :selected="curSearchPage"
                    :page-size="searchData.limit" :total-count="searchData.total" @select-page="onPaginationPageChange" />
                </client-only>
              </div>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import {
  compose,
  defaultTo,
  head,
  mergeLeft,
  pathOr,
  propOr
} from 'ramda'
import SearchControlsContentful from '@/components/SearchControlsContentful/SearchControlsContentful.vue'
import DatasetFacetMenu from '@/components/FacetMenu/DatasetFacetMenu.vue'
import { facetPropPathMapping, getAlgoliaFacets } from '../../utils/algolia'
import { HIGHLIGHT_HTML_TAG } from '../../utils/utils'
import DatasetSearchResults from '@/components/SearchResults/DatasetSearchResults.vue'
import SortMenu from '@/components/SortMenu/SortMenu.vue'

const searchResultsComponents = {
  dataset: DatasetSearchResults,
  simulation: DatasetSearchResults,
  model: DatasetSearchResults,
  device: DatasetSearchResults
}

const searchTypes = [
  {
    label: 'Datasets',
    type: 'dataset',
  },
  {
    label: 'Anatomical Models',
    type: 'model',
  },
  {
    label: 'Computational Models',
    type: 'simulation',
  },
  {
    label: 'Devices',
    type: 'device'
  }
]

export default {
  name: 'DataPage',

  components: {
    SearchControlsContentful,
    DatasetFacetMenu,
    DatasetSearchResults,
    SortMenu,
  },

  async setup() {
    const config = useRuntimeConfig()
    const route = useRoute()
    if (route.query.type == 'projects') {
      const focusQuery = route.query.selectedProjectsAnatomicalFocusIds
      const consortiaType = route.query.selectedProjectsFundingIds
      let newPath = '/about/projects?'
      // Because we used to allow multiple projects to be selected at once before they became seperate tabs we now just re-direct to the SPARC
      // project by default if more than 1 project was selected in the url. If only one was set then we can re-direct to that project
      if (consortiaType) {
        const consortiaTypes = consortiaType.split(",")
        if (consortiaTypes.length == 1) {
          newPath += `consortiaType=${consortiaTypes[0]}`
        } 
      }
      if (focusQuery) {
        newPath += `&selectedProjectsAnatomicalFocusIds=${focusQuery}`
      }
      const router = useRouter()
      router.push(newPath)
    }
    const { $algoliaClient } = useNuxtApp()
    const algoliaSortOptions = [
      {
        label: 'Date (desc)',
        id: 'newest',
        algoliaIndexName: config.public.ALGOLIA_INDEX_VERSION_PUBLISHED_TIME_DESC
      },
      {
        label: 'Date (asc)',
        id: 'oldest',
        algoliaIndexName: config.public.ALGOLIA_INDEX_VERSION_PUBLISHED_TIME_ASC
      },
      {
        label: 'A-Z',
        id: 'alphabetical',
        algoliaIndexName: config.public.ALGOLIA_INDEX_ALPHABETICAL_A_Z
      },
      {
        label: 'Z-A',
        id: 'reverseAlphabetical',
        algoliaIndexName: config.public.ALGOLIA_INDEX_ALPHABETICAL_Z_A
      },
    ]
    const algoliaIndex = await $algoliaClient.initIndex(config.public.ALGOLIA_INDEX_VERSION_PUBLISHED_TIME_DESC)

    const searchType = searchTypes.find(searchType => {
      return searchType.type == route.query.type
    })
    const title = propOr('', 'label', searchType)
    return {
      algoliaSortOptions,
      selectedAlgoliaSortOption: ref(algoliaSortOptions.find(opt => opt.id === route.query.datasetSort) || algoliaSortOptions[0]),
      algoliaIndex,
      title
    }
  },

  data: () => {
    return {
      searchQuery: '',
      searchData: {
        limit: 10,
        skip: 0,
        items: [],
        total: 0
      },
      facets: [],
      dataTypes: ['dataset', 'simulation', 'model', 'device'],
      humanReadableDataTypesLookup: {
        dataset: 'Datasets',
        model: 'Anatomical Models',
        simulation: 'Computational Models',
        device: 'Devices'
      },
      resultCounts: {
        model: 0,
        dataset: 0,
        simulation: 0,
      },
      searchHasAltResults: false,
      visibleFacets: {},
      isLoadingSearch: false,
      searchFailed: false,
      isSearchMapVisible: false,
      latestSearchTerm: '',
      searchTypes: searchTypes,
      breadcrumb: [
        {
          to: {
            name: 'index'
          },
          label: 'Home'
        },
        {
          to: {
            name: 'data',
            query: {
              type: 'dataset'
            }
          },
          label: 'Data & Models'
        },
      ],
      titleColumnWidth: 300,
      windowWidth: '',
      isComponentActive: true,
    }
  },

  computed: {
    showDeviceType() {
      return this.$config.public.SHOW_DEVICE_TYPE == 'true'
    },
    searchType: function () {
      const searchTypeQuery = pathOr('', ['query', 'type'], this.$route)
      const searchType = this.searchTypes.find(searchType => {
        return searchType.type == searchTypeQuery
      })

      return defaultTo(head(this.searchTypes), searchType)
    },

    tableData: function () {
      return propOr([], 'items', this.searchData)
    },

    searchResultsComponent: function () {
      return defaultTo('', searchResultsComponents[this.$route.query.type])
    },

    curSearchPage: function () {
      return this.searchData.skip / this.searchData.limit + 1
    },

    searchHeading: function () {
      const query = pathOr('', ['query', 'search'], this.$route)

      const searchType = this.searchTypes.find(searchType => {
        return searchType.type == this.$route.query.type
      })
      const searchTypeLabel = propOr('', 'label', searchType)

      let searchHeading = `${this.searchData.total} ${searchTypeLabel}`

      return query === '' ? searchHeading : `${searchHeading} for “${query}”`
    },

    search: function () {
      return this.$route.query.search || ''
    },

    isMobile: function () {
      return this.windowWidth <= 500
    }
  },

  watch: {
    '$route.query.type': function (val) {
      if (!this.$route.query.type) {
        return
      } else {
        this.searchData = {
          limit: 10,
          skip: 0,
          items: [],
          total: 0
        }
        this.fetchResults()
      }
    },

    '$route.query.search': {
      handler: function () {
        if (!this.isComponentActive) return
        this.searchQuery = this.$route.query.search
        this.fetchResults()
      },
      immediate: true
    },

    '$route.query.datasetSort': {
      handler: function () {
        if (!this.isComponentActive) return
        this.fetchResults()
      },
      immediate: true
    },

    selectedAlgoliaSortOption: {
      handler: function (option) {
        this.algoliaIndex = this.$algoliaClient.initIndex(option.algoliaIndexName)
      },
      immediate: true
    }
  },

  beforeMount: function () {
    this.windowWidth = window.innerWidth
  },
  beforeRouteLeave: function (to, from, next) {
    this.isComponentActive = false
    next()
  },
  activated: function () {
    this.isComponentActive = true
  },
  mounted: function () {
    if (!this.$route.query.type) {
      const firstTabType = compose(propOr('', 'type'), head)(searchTypes)
      this.$router.replace({ query: { type: firstTabType } })
    } else {
      const queryParams = {
        skip: Number(this.$route.query.skip || this.searchData.skip),
        limit: Number(this.$route.query.limit || this.searchData.limit),
        search: this.$route.query.search || ''
      }

      this.searchData = { ...this.searchData, ...queryParams }
    }
    if (window.innerWidth <= 768) this.titleColumnWidth = 150
    window.onresize = () => this.onResize(window.innerWidth)
    getAlgoliaFacets(this.algoliaIndex, facetPropPathMapping)
      .then(data => {
        this.facets = data
      })
      .finally(() => {
        this.fetchResults()
      })
  },

  methods: {
    updateDataSearchLimit: function (limit) {
      this.searchData.skip = 0

      const newLimit = limit === 'View All' ? this.searchData.total : limit

      this.searchData.limit = newLimit
      this.$router.replace({
        query: { ...this.$route.query, limit: newLimit, skip: 0 }
      })
      this.fetchResults()
    },

    facetMenuMounted: function () {
      this.fetchResults()
    },

    fetchResults: function () {
      this.isLoadingSearch = true
      this.searchFailed = false
      const query = this.$route.query.search

      const searchType = pathOr('dataset', ['query', 'type'], this.$route)
      const datasetsFilter =
        searchType === 'simulation' ? '(NOT item.types.name:Dataset AND NOT item.types.name:Scaffold)'
          : searchType === 'model' ? '(NOT item.types.name:Dataset AND item.types.name:Scaffold)'
          : searchType === 'device' ? 'item.types.name:Device'
          : "item.types.name:Dataset"

      /* First we need to find only those facets that are relevant to the search query.
       * If we attempt to do this in the same search as below than the response facets
       * will only contain those specified by the filter */
      this.latestSearchTerm = query
      this.algoliaIndex
        .search(query, {
          facets: ['*'],
          filters: `${datasetsFilter}`
        })
        .then(response => {
          this.visibleFacets = response.facets
        })
        .catch(() => {
          this.isLoadingSearch = false
          this.searchFailed = true
        })
        .finally(() => {
          var filters = this.$refs.datasetFacetMenu?.getFilters()
          filters = filters === undefined ?
            `${datasetsFilter}` :
            filters + ` AND ${datasetsFilter}`

          this.algoliaIndex
            .search(query, {
              facets: ['*'],
              hitsPerPage: this.searchData.limit,
              page: this.curSearchPage - 1,
              filters: filters,
              attributesToHighlight: [
                'item.name',
                'item.description',
                'item.modalities',
                'anatomy.organ',
                'organisms.primary.species.name',
                'pennsieve.owner.first.name',
                'pennsieve.owner.last.name'
              ],
              highlightPreTag: `<${HIGHLIGHT_HTML_TAG}>`,
              highlightPostTag: `</${HIGHLIGHT_HTML_TAG}>`
            })
            .then(response => {
              const searchData = {
                items: response.hits,
                total: response.nbHits
              }
              this.searchData = mergeLeft(searchData, this.searchData)
              this.isLoadingSearch = false

              // Update alternative search results
              this.alternativeSearchUpdate()
            })
            .catch(() => {
              this.isLoadingSearch = false
              this.searchFailed = true
            })
        })
    },

    // alternaticeSearchUpdate: Updates this.resultCounts which is used for displaying other search options to the user
    //    when a search returns 0 results
    alternativeSearchUpdate: function () {
      const searchTypeInURL = pathOr('dataset', ['query', 'type'], this.$route) // Get current data type

      this.searchHasAltResults = false
      for (let key in this.resultCounts) { // reset reults list
        this.resultCounts[key] = 0
      }
      let altSearchTypes = this.dataTypes.filter(e => e !== searchTypeInURL) // Remove from list of data types

      altSearchTypes.forEach(type => {  // Search on each data type remaining
        this.searchContentsCheck(type)
      })
    },

    //  searchContentsCheck(searchType): Takes in a search type and returns the number of datasets found with the current filters
    searchContentsCheck: function (searchType) {
      const query = this.$route.query.search

      const datasetsFilter =
        searchType === 'simulation' ? '(NOT item.types.name:Dataset AND NOT item.types.name:Scaffold)'
          : searchType === 'model' ? '(NOT item.types.name:Dataset AND item.types.name:Scaffold)'
          : searchType === 'device' ? 'item.types.name:Device'
          : "item.types.name:Dataset"

      var filters = this.$refs.datasetFacetMenu?.getFilters()
      filters = filters === undefined ?
        `${datasetsFilter}` :
        filters + ` AND ${datasetsFilter}`

      this.algoliaIndex
        .search(query, {
          facets: ['*'],
          filters: filters
        })
        .then(response => {
          response.nbHits > 0 ? (this.searchHasAltResults = true) : null
          this.resultCounts[searchType] = response.nbHits
        })
    },

    onFacetSelectionChange: function () {
      this.searchData.skip = 0
      this.fetchResults()
    },

    onPaginationPageChange: function (page) {
      const offset = (page - 1) * this.searchData.limit
      this.searchData.skip = offset

      this.$router.replace({
        query: { ...this.$route.query, skip: offset }
      })

      this.fetchResults()
    },

    onResize: function (width) {
      width <= 768
        ? (this.titleColumnWidth = 150)
        : (this.titleColumnWidth = 300)
      this.windowWidth = width
    },

    searchColSpan(viewport) {
      const viewports = {
        sm: 24,
        md: 16,
        lg: 18
      }

      return viewports[viewport] || 24
    },
    async onAlgoliaSortOptionChange(option) {
      this.selectedAlgoliaSortOption = option
      this.searchData.skip = 0
      this.$router.replace({
        query: {
          ...this.$route.query,
          skip: 0,
          datasetSort: option.id
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
@import 'sparc-design-system-components-2/src/assets/_variables.scss';

.alternative-links {
  text-decoration: underline;
  color: $purple;
}

.page-data {
  background-color: $background;
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

  li:last-child>a {
    border-right: none;
  }
}

.search-tabs__button {
  color: $purple;
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

.table-wrap {
  background: #fff;
  border: 1px solid $lineColor2;
  padding: 16px;

  .search-error {
    margin: 0 0 auto;
    text-align: center;
  }
}

.search-heading {
  align-items: flex-end;
  display: flex;
  margin-bottom: 1em;
  justify-content: space-between;

  @media screen and (max-width: 28em) {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 0;
  }

  p {
    font-size: 0.875em;
    flex-shrink: 0;
    margin: 2em 0 0 0;
  }
}

.facet-menu {
  margin-top: 2em;
}

:deep(.el-table td) {
  vertical-align: top;
}

:deep(.el-table .cell) {
  word-break: normal;
}

.dataset-filters {
  padding: 0.5rem 1rem 1rem;
  margin-bottom: 2rem;

  h2,
  h3 {
    font-size: 1.125rem;
    font-weight: normal;
    line-height: 1.2;
  }

  h2 {
    border-bottom: 1px solid $lineColor1;
    margin-bottom: 0.5rem;
    padding-bottom: 0.5rem;
  }

  h3 {
    font-size: 0.875rem;
    text-transform: uppercase;
  }

  :deep(.el-checkbox-group) {
    display: flex;
    flex-direction: column;
  }

  :deep(.el-checkbox__label) {
    color: $purple;
  }
}
</style>
