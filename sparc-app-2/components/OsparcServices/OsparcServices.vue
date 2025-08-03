<template>
  <div class="page-data">
    <div class="search-tabs__container p-16">
      <h3>
        o<sup>2</sup>S<sup>2</sup>PARC Services
      </h3>
      <div class="search-bar__container">
        <h5>
          Search within o<sup>2</sup>S<sup>2</sup>PARC Services
        </h5>
        <search-controls-contentful class="search-bar" placeholder="Enter search criteria" showSearchText />
      </div>
    </div>

    <div class="pb-16 pt-32">
      <el-row :gutter="32" type="flex">
        <el-col :span="24">
          <el-row :gutter="32">
            <el-col>
              <p><em>By clicking on the button next to each search result, you can instantiate the service in the
                  <a href="/resources/4LkLiH5s4FV0LVJd3htsvH">o<sup>2</sup>S<sup>2</sup>PARC cloud platform</a>.</em>
              </p>
              <div class="search-heading mb-16">
                <div class="label1" v-show="resources.items.length">
                  {{ resources.total }} Results | Showing
                  <pagination-menu :page-size="resources.limit" @update-page-size="onPaginationLimitChange" />
                </div>
              </div>
              <div class="subpage">
                <services-search-results :services="resources.items" />
              </div>
              <div class="search-heading">
                <div class="label1" v-if="resources.items.length">
                  {{ resources.total }} Results | Showing
                  <pagination-menu :page-size="resources.limit" @update-page-size="onPaginationLimitChange" />
                </div>
                <pagination v-if="resources.limit < resources.total" :selected="curSearchPage"
                  :page-size="resources.limit" :total-count="resources.total" @select-page="onPaginationPageChange" />
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
import SearchControlsContentful from '@/components/SearchControlsContentful/SearchControlsContentful.vue'
import ServicesSearchResults from '@/components/Resources/ServicesSearchResults.vue'

export default {
  name: 'OsparcServices',

  components: {
    SearchControlsContentful,
    ServicesSearchResults
  },

  async setup() {
    const config = useRuntimeConfig()
    const route = useRoute()
    const { $axios } = useNuxtApp()

    const url = new URL(`${config.public.portal_api}/sim/service`)
    if (route.query.search) {
      url.searchParams.append('search', route.query.search)
    }
    let resources = {}
    await $axios.get(url.toString()).then(({ data }) => {
      resources = data
    })
    return {
      resources: ref(resources)
    }
  },

  watch: {
    '$route.query': {
      handler: async function () {
        this.resources = await this.getResources()
      },
      immediate: true
    },
  },

  computed: {
    /**
     * Compute the current page based off the limit and the offset
     * @returns {Number}
     */
    curSearchPage: function () {
      return this.resources.skip / this.resources.limit + 1
    },
  },

  methods: {
    /**
     * Get more events for the new page
     * @param {Number} page
     */
    async onPaginationPageChange(page) {
      const { limit } = this.resources
      const offset = (page - 1) * limit
      const response = await this.getResources(limit, offset)
      this.resources = response
    },
    /**
     * Update limit based on pagination menu selection and get more events
     * @param {Number} limit
     */
    async onPaginationLimitChange(limit) {
      const newLimit = limit === 'View All' ? this.resources.total : limit
      const response = await this.getResources(newLimit)
      this.resources = response
    },
    async getResources(limit, skip) {
      const url = new URL(`${this.$config.public.portal_api}/sim/service`)
      if (this.$route.query.search) {
        url.searchParams.set('search', this.$route.query.search)
      }
      if (this.resources && limit) {
        url.searchParams.set('limit', limit)
      }
      if (this.resources && skip) {
        url.searchParams.set('skip', skip)
      }
      let resources = {}
      await this.$axios.get(url.toString()).then(({ data }) => {
        resources = data
      })
      return resources
    },
  }
}
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

  li:last-child>a {
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

:deep(.sparc-design-system-pagination) {
  padding-top: 0 !important;
}
</style>
