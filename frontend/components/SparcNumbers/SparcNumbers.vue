<template>
  <div class="container p-24">
    <div class="heading2">
      SPARC by the numbers
    </div>
    <Consortias :items=consortiaItems />
    <div class="body1">
      Explore the data to find out what amazing research we have:
    </div>
    <div class="data-wrap py-16">
      <nuxt-link v-for="item in exploreData" :key="item.sys.id" class="sparc-number"
        :to="`${item.fields.link}`">
        <img :src="imageUrl(item)" :alt="`Icon for ${item.fields.label} category`" />
        <p class="mb-0 mt-8">
          {{ item.fields.label }}
        </p>
      </nuxt-link>
    </div>
    <div class="body1">
      Explore some of our key metrics:
    </div>
    <div class="data-wrap pt-16">
      <nuxt-link v-for="item in metricsData.filter(data => data.metric && data.metric > 0)" :key="item.label" class="sparc-number"
        :to="`${item.link}`">
        <div class="heading1 metric">{{ item.metric }}</div>
        <p class="mb-0 mt-8">
          {{ item.label }}
        </p>
      </nuxt-link>
    </div>
  </div>
</template>

<script>
import { pathOr } from 'ramda'
import { getPreviousDate } from '@/utils/common'
import Consortias from '@/components/Consortias/Consortias.vue'

export default {
  name: 'SparcNumbers',
  components: {
    Consortias
  },
  async setup() {
    const config = useRuntimeConfig()
    const { $axios } = useNuxtApp()
    const currentDate = new Date()
    let currentMonth = currentDate.getMonth() + 1
    currentMonth = currentMonth.toString().padStart(2, "0")
    const currentDay = currentDate.getDate().toString().padStart(2, '0')
    const currentYear = currentDate.getFullYear()
    // we use last months date to get the metrics bc the metrics for the current month aren't published until the end of the month
    const lastMonthsDate = getPreviousDate(currentMonth, currentYear)
    const totalContributors =
      await $axios.get(config.public.METRICS_URL + `/pennsieve?year=${lastMonthsDate.year}&month=${lastMonthsDate.month}`)
      .then(({ data }) => {
        const metrics = data[0]
        return parseInt(metrics['number_of_sparc_users_overall']['N'])
      }).catch(() => {
        const monthBeforeLastDate = getPreviousDate(lastMonthsDate.month, lastMonthsDate.year)
        return $axios
          .get(config.public.METRICS_URL + `/pennsieve?year=${monthBeforeLastDate.year}&month=${monthBeforeLastDate.month}`)
          .then(({ data }) => {
            const metrics = data[0]
            return parseInt(metrics['number_of_sparc_users_overall']['N'])
          })
          .catch(() => {
            return -1
          })
      })
    const downloadsUrl = `${config.public.discover_api_host}/metrics/dataset/downloads/summary?startDate=2020-01-01&endDate=${currentYear}-${currentMonth}-${currentDay}`
    let totalDownloads = 0
    try {
      const response = await $axios.get(downloadsUrl)
      response.data.forEach(item => {
          if (item.origin === 'SPARC') {
            totalDownloads += parseInt(item['downloads'])
          }
      })
    } catch (err) {
        console.error('Error retrieving download count.', err)
    }
    const protocolViewsUrl = `${config.public.portal_api}/total_protocol_views`
    let totalProtocolViews = 0
    try {
      const { data } = await $axios.get(protocolViewsUrl)
      totalProtocolViews = data.total_views
    } catch (err) {
        console.error('Error retrieving total protocol views.', err)
    }
    const totalCitationsUrl = `${config.public.portal_api}/total_dataset_citations`
    let totalCitations = 0
    try {
      const { data } = await $axios.get(totalCitationsUrl)
      totalCitations = data.total_citations
    } catch (err) {
      console.error('Error retrieving total citations.', err)
    }
    return {
      metricsData: [{
          label: 'Dataset downloads',
          metric: totalDownloads,
          link: '/about/metrics'
        },
        {
          label: 'Dataset contributors',
          metric: totalContributors,
          link: '/about/metrics'
        },
        {
          label: 'Dataset citations',
          metric: totalCitations,
          link: '/about/metrics'
        },
        {
          label: 'Protocol views',
          metric: totalProtocolViews,
          link: '/about/metrics'
        }]
    }
  },
  props: {
    exploreData: {
      type: Array,
      default: () => []
    },
    consortiaItems: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    imageUrl: function (item) {
      return pathOr('', ['fields', 'image', 'fields', 'file', 'url'], item)
    },
  }
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.data-wrap {
  justify-content: center;
  width: 100%;
  display: flex;
}
.sparc-number {
  color: #000;
  text-decoration: none;

  margin: 0rem 2rem;
  text-align: center;

  &:hover,
  &:focus {
    opacity: 0.9;
  }

  img {
    background: #fff;
    border-radius: 50%;
    display: block;
    margin-bottom: 8px;
    width: 128px;
    border: solid 1px #c0c4cc;
    height: 128px;
    object-fit: contain;
    margin: auto;
  }

  p {
    font-size: 1em;
    font-weight: 700;
    color: #24245b;
    width: 11rem;

    &:hover {
      text-decoration: underline;
    }
  }
  .metric {
    width: 128px;
    height: 128px;
    color: $purple !important;
    border-radius: 50%;
    border: solid 1px #c0c4cc;
    margin: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
  }
}
</style>
