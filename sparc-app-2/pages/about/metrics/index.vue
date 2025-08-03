<template>
  <Head>
    <Title>Metrics</Title>
    <Meta name="og:title" hid="og:title" content="Metrics" />
    <Meta name="twitter:title" content="Metrics" />
    <Meta name="description" hid="description" content="Browse Metrics" />
    <Meta name="og:description" hid="og:description" content="Browse Metrics" />
    <Meta name="twitter:description" content="Browse Metrics" />
  </Head>
  <div class="page-data pb-16">
    <breadcrumb :breadcrumb="breadcrumb" title="Metrics"/>
    <div class="container">
      <div class="search-tabs__container">
        <h1>
          Browse Metrics
        </h1>
        <ul class="search-tabs">
          <li v-for="type in metricsTypes" :key="type.label">
            <nuxt-link
              class="search-tabs__button"
              :class="{ active: type.type === $route.query.metricsType }"
              :to="{
                name: 'about-metrics',
                query: {
                  ...$route.query,
                  metricsType: type.type,
                }
              }"
            >
              {{ type.label }}
            </nuxt-link>
          </li>
        </ul>
      </div>
    </div>
    <div class="container mt-16">
      <user-behaviors
        v-if="$route.query.metricsType == 'userBehaviors'"
        :metrics-data="metricsData"
        :date-last-updated="dateLastUpdated"
      />
      <scientific-contribution
        v-else
        :metrics-data="metricsData"
        :date-last-updated="dateLastUpdated"
      />
    </div>
  </div>
</template>

<script>
import {
  compose,
  defaultTo,
  find,
  head,
  pathOr,
  propEq,
  propOr
} from 'ramda'
import { getPreviousDate } from '@/utils/common'
import UserBehaviors from '@/components/Metrics/UserBehaviors.vue'
import ScientificContribution from '@/components/Metrics/ScientificContribution.vue'

const metricsComponents = {
  userBehaviors: UserBehaviors,
  scientificContribution: ScientificContribution,
}

const metricsTypes = [
    {
    label: 'User Behaviors',
    type: 'userBehaviors',
    dataSource: ''
  },
  {
    label: 'Scientific Contribution',
    type: 'scientificContribution',
    dataSource: ''
  }
]

const fetchTotalDatasetDownloads = async (axios, url) => {
  const currentDate = new Date()
  const currentDay = currentDate.getDate().toString().padStart(2, '0')
  let currentMonth = currentDate.getMonth() + 1
  currentMonth = currentMonth.toString().padStart(2, '0')
  const currentYear = currentDate.getFullYear()
  const totalDownloadsUrl = `${url}/metrics/dataset/downloads/summary?startDate=2020-01-01&endDate=${currentYear}-${currentMonth}-${currentDay}`
  let totalDownloads = 0
  try {
    const response = await axios.get(totalDownloadsUrl)
    response.data.forEach(item => {
        if (item.origin === 'SPARC') {
          totalDownloads += parseInt(item['downloads'])
        }
    })
  } catch (err) {
    console.error('Error retrieving download count.', err)
  } finally {
    return totalDownloads
  }
}

const fetchMetrics = async (axios, config, month, year) => {
  let ga4MetricsData = await axios.get(`${config.public.METRICS_URL}/ga4?year=${year}&month=${month}`)
  ga4MetricsData = ga4MetricsData.data[0]
  let pennsieveMetricsData = await axios.get(`${config.public.METRICS_URL}/pennsieve?year=${year}&month=${month}`)
  pennsieveMetricsData = pennsieveMetricsData.data[0]
  let sparcMetricsData = await axios.get(`${config.public.METRICS_URL}/sparc?year=${year}&month=${month}`)
  sparcMetricsData = sparcMetricsData.data[0]

  const top5AnatomicalStructuresObject = sparcMetricsData['anatomical_structures_breakdown']['M']
  let top5AnatomicalStructuresArray = []
  // convert the response object into an object array of the form { 'name': <structure name>, 'value': <number of structures>}
  Object.keys(top5AnatomicalStructuresObject).forEach(key => top5AnatomicalStructuresArray.push({
    name: key,
    value: parseInt(top5AnatomicalStructuresObject[key]['N'])
  }))
  const totalDownloads = await fetchTotalDatasetDownloads(axios, config.public.discover_api_host)
  return {
    userBehaviors: {
      pageViewsLabels: ['Homepage', 'Find Data', 'Tools & Resources', 'Maps', 'News & Events'],
      pageViewsData: {
        lastMonth: [parseInt(ga4MetricsData['all_home_page_views_last_mo']['N']), parseInt(ga4MetricsData['all_find_data_page_views_last_mo']['N']), parseInt(ga4MetricsData['all_tools_resources_page_views_last_mo']['N']), parseInt(ga4MetricsData['all_maps_page_views_last_mo']['N']), parseInt(ga4MetricsData['all_news_events_page_views_last_mo']['N'])],
        last3Months: [parseInt(ga4MetricsData['all_home_page_views_last_quarter']['N']), parseInt(ga4MetricsData['all_find_data_page_views_last_quarter']['N']), parseInt(ga4MetricsData['all_tools_resources_page_views_last_quarter']['N']), parseInt(ga4MetricsData['all_maps_page_views_last_quarter']['N']), parseInt(ga4MetricsData['all_news_events_page_views_last_quarter']['N'])]
      },
      usersData: {
        lastMonth: [parseInt(ga4MetricsData['returning_users_in_last_month']['N']), parseInt(ga4MetricsData['new_users_in_last_month']['N'])],
        last3Months: [parseInt(ga4MetricsData['returning_users_in_last_quarter']['N']), parseInt(ga4MetricsData['new_users_in_last_quarter']['N'])]
      },
      totalDownloadsData: {
        lastMonth: parseInt(pennsieveMetricsData['number_of_sparc_downloads_last_mo']['N']),
        last3Months: parseInt(pennsieveMetricsData['number_of_sparc_downloads_last_quarter']['N']),
        total: totalDownloads
      },
      datasetContributorsData: {
        total: parseInt(pennsieveMetricsData['number_of_sparc_users_overall']['N']),
        newLastMonth: parseInt(pennsieveMetricsData['number_of_new_sparc_users_last_quarter']['N'])
      },
    },
    scientificContribution: {
      dataChartLabels: ['All', 'Datasets', 'Anatomical Models', 'Computational Models', 'Embargoed (across all)'],
      dataChartData: {
        total: [parseInt(sparcMetricsData['all_sparc_categories_cumulative']['N']), parseInt(sparcMetricsData['sparc_datasets_cumulative']['N']), parseInt(sparcMetricsData['sparc_maps_cumulative']['N']), parseInt(sparcMetricsData['sparc_computational_models_cumulative']['N']), parseInt(sparcMetricsData['embargoed_overall']['N'])],
        lastMonth: [parseInt(sparcMetricsData['all_sparc_categories_last_mo']['N']), parseInt(sparcMetricsData['new_sparc_datasets_last_1_mo']['N']), parseInt(sparcMetricsData['sparc_maps_cumulative']['N']), parseInt(sparcMetricsData['new_sparc_computational_models_last_1_mo']['N'])],
        last3Months: [parseInt(sparcMetricsData['all_sparc_categories_last_quarter']['N']), parseInt(sparcMetricsData['new_sparc_datasets_last_quarter']['N']), parseInt(sparcMetricsData['sparc_maps_cumulative']['N']), parseInt(sparcMetricsData['new_sparc_computational_models_last_quarter']['N'])]
      },
      samples: {
        total: parseInt(sparcMetricsData['number_of_samples_cumulative']['N']),
        newLastMonth: parseInt(sparcMetricsData['number_of_samples_last_mo']['N']),
        newLast3Months: parseInt(sparcMetricsData['number_of_samples_last_quarter']['N']),
      },
      subjects: {
        total: parseInt(sparcMetricsData['number_of_subjects_cumulative']['N']),
        newLastMonth: parseInt(sparcMetricsData['number_of_subjects_last_month']['N']),
        newLast3Months: parseInt(sparcMetricsData['number_of_subjects_last_quarter']['N']),
      },
      anatomicalStructures: {
        total: parseInt(sparcMetricsData['current_number_of_anatomical_structures']['N'])
      },
      anatomicalStructuresChartLabels: top5AnatomicalStructuresArray.map(structure => structure.name),
      anatomicalStructuresChartData: top5AnatomicalStructuresArray.map(structure => structure.value),
      fileStorage: {
        totalGB: parseInt(pennsieveMetricsData['total_number_gigabytes']['N'])
      }
    }
  }
}

export default {
  name: 'MetricsPage',
  components: {
    UserBehaviors,
    ScientificContribution
  },
  async setup() {
    const config = useRuntimeConfig()
    const { $axios } = useNuxtApp()
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()
    // we use last months date to get the metrics bc the metrics for the current month aren't published until the end of the month
    const lastMonthsDate = getPreviousDate(currentMonth, currentYear)
    let metricsData = undefined
    let dateLastUpdated
    try {
      metricsData = await fetchMetrics($axios, config, lastMonthsDate.month, lastMonthsDate.year)
      dateLastUpdated = new Date(`${lastMonthsDate.month}/01/${lastMonthsDate.year}`)
    } catch (e) {
      const monthBeforeLastDate = getPreviousDate(lastMonthsDate.month, lastMonthsDate.year)
      metricsData = await fetchMetrics($axios, config, monthBeforeLastDate.month, monthBeforeLastDate.year)
      dateLastUpdated = new Date(`${monthBeforeLastDate.month}/01/${monthBeforeLastDate.year}`)
    }
    return {
      metricsData,
      dateLastUpdated
    }
  },

  data: () => {
    return {
      metricsTypes,
      isLoadingMetrics: false,
      searchFailed: false,
      breadcrumb: [
        {
          to: {
            name: 'index'
          },
          label: 'Home'
        },
        {
          label: 'About',
          to: {
            name: 'about'
          }
        }
      ]
    }
  },

  computed: {
    /**
     * Compute search type
     * @returns {String}
     */
    searchType: function() {
      const metricsTypeQuery = pathOr('', ['query', 'metricsType'], this.$route)
      const metricsType = find(propEq('type', metricsTypeQuery), this.metricsTypes)

      return defaultTo(head(this.metricsTypes), metricsType)
    },

    /**
     * Compute which search results component to display based on the type of search
     * @returns {Function}
     */
    metricsComponent: function() {
      return defaultTo('', metricsComponents[this.$route.query.metricsType])
    },
  },
  /**
   * Check the metricsType param in the route and set it if it
   */
  mounted: function() {
    if (!this.$route.query.metricsType) {
      const firstTabType = compose(propOr('', 'type'), head)(metricsTypes)
      this.$router.replace({ query: { metricsType: firstTabType } })
    }
  },
}
</script>

<style scoped lang="scss">
@import 'sparc-design-system-components-2/src/assets/_variables.scss';

.page-data {
  background-color: $background;
}
.search-tabs__container {
  margin-top: 2rem;
  padding-top: 0.5rem;
  background-color: white;
  border: 0.1rem solid $lineColor2;
  h1 {
    padding-left: 0.75rem;
    font-weight: 600;
    font-size: 1.5rem;
    line-height: 2.75rem;
    margin: 0 0 0.5rem;
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
.table-wrap {
  background: white;
  border: 1px solid $lineColor2;
  padding: 1rem;
  .search-error {
    margin: 0 0  auto;
    text-align:center;
  }
}
</style>
