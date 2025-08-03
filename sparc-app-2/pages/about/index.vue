<template>
  <Head>
    <Title>{{ pageTitle }}</Title>
    <Meta name="og:title" hid="og:title" :content="pageTitle" />
    <Meta name="twitter:title" :content="pageTitle" />
    <Meta name="description" hid="description" :content="heroCopy" />
    <Meta name="og:description" hid="og:description" :content="heroCopy" />
    <Meta name="twitter:description" :content="heroCopy" />
  </Head>
  <div class="about-page pb-16">
    <Breadcrumb :breadcrumb="breadcrumb" title="About" />
    <page-hero class="py-24" v-if="heroCopy">
      <h1>{{ pageTitle }}</h1>
      <div v-html="parseMarkdown(heroCopy)" />
    </page-hero>
    <div class="container">
      <paper class="row mt-32" :text="parseMarkdown(sparcPortal)" button-text="View The Roadmap"
        button-link-external="https://docs.sparc.science/docs/sparc-portal-roadmap" />
      <div class="who-we-support-container p-24 mt-32">
        <div class="heading2">Who We Support</div>
        <Consortias :items="consortiaItems" />
        <nuxt-link to="/about/projects">
          <el-button class="secondary">
            View All Projects
          </el-button>
        </nuxt-link>
      </div>
      <div class="row mt-32">
        <paper class="row-item" :text="parseMarkdown(whatWeOffer)" :button-text="whatWeOfferButtonText"
          :button-link="aboutLink(whatWeOfferPageId)" />
        <paper class="row-item" :text="parseMarkdown(teamLeadership)" :button-text="teamLeadershipButtonText"
          :button-link="aboutLink(teamAndLeadershipPageId)" />
        <paper class="row-item" :text="parseMarkdown(getInvolved)" :button-text="getInvolvedButtonText"
          :button-link="aboutLink(getInvolvedPageId)" />
      </div>

      <div class="gallery-items-container p-24 mt-32">
        <div class="heading2 mb-16">Portal Metrics</div>
        <gallery galleryItemType="metrics" :card-width=Number(16.3) :items="metricsItems" />
        <nuxt-link to="/about/metrics">
          <el-button class="secondary mt-16">
            View All Metrics
          </el-button>
        </nuxt-link>
      </div>

      <div class="gallery-items-container p-24 mt-32">
        <div class="heading2 mb-16">Highlights</div>
        <gallery galleryItemType="highlights" :cardWidth="68" :items="highlights" />
      </div>

      <paper class="row mt-32" :text="parseMarkdown(historyOfSparc)" button-text="Read More"
        button-link="/about/history-of-sparc" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRuntimeConfig, useAsyncData } from '#app'
import Paper from '~/components/Paper/Paper.vue'
import Gallery from '~/components/Gallery/Gallery.vue'
import Consortias from '~/components/Consortias/Consortias.vue'
import { getPreviousDate } from '@/utils/common'
import { parseMarkdown } from '@/utils/formattingUtils.js'
import { pathOr } from 'ramda'

const config = useRuntimeConfig()
const currentDate = new Date()
const currentDay = currentDate.getDate().toString().padStart(2, '0')
let currentMonth = currentDate.getMonth() + 1
currentMonth = currentMonth.toString().padStart(2, '0')
const currentYear = currentDate.getFullYear()
const whatWeOfferPageId = config.public.ctf_what_we_offer_page_id
const teamAndLeadershipPageId = config.public.ctf_team_and_leadership_page_id
const getInvolvedPageId = config.public.ctf_get_involved_page_id
const lastMonthsDate = getPreviousDate(currentMonth, currentYear)

const months = [
  'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
]

const { data: pageData, error: pageDataError } = useAsyncData('pageData', async () => {
  try {
    const { $contentfulClient } = useNuxtApp()
    const cfPage = await $contentfulClient.getEntry(config.public.ctf_about_page_id)
    return cfPage.fields
  } catch (err) {
    console.error('Could not fetch page data from Contentful.', err)
    return {}
  }
})

const { data: consortiaItems, error: consortiaError } = useAsyncData('consortiaItems', async () => {
  try {
    const { $contentfulClient } = useNuxtApp()
    const { items } = await $contentfulClient.getEntries({
      content_type: config.public.ctf_consortia_content_type_id,
      order: 'fields.displayOrder',
      'fields.displayOnAboutPage': true
    })
    return items
  } catch (err) {
    console.error('Could not fetch consortia data from Contentful.', err)
    return []
  }
})

const { data: metricsData, error: metricsError } = useAsyncData('metricsData', async () => {
  try {
    const { $axios } = useNuxtApp()
    const url = `${config.public.METRICS_URL}/pennsieve?year=${lastMonthsDate.year}&month=${lastMonthsDate.month}`
    const response = await $axios.get(url)
    const metrics = response.data[0]
    return {
      totalContributors: parseInt(metrics['number_of_sparc_users_overall']['N']),
      newContributors: parseInt(metrics['number_of_new_sparc_users_last_quarter']['N']),
      downloadsLastMonth: parseInt(metrics['number_of_sparc_downloads_last_mo']['N'])
    }
  } catch (err) {
    const monthBeforeLastDate = getPreviousDate(lastMonthsDate.month, lastMonthsDate.year)
    const url = `${config.public.METRICS_URL}/pennsieve?year=${monthBeforeLastDate.year}&month=${monthBeforeLastDate.month}`
    const response = await $axios.get(url)
    const metrics = response.data[0]
    return {
      totalContributors: parseInt(metrics['number_of_sparc_users_overall']['N']),
      newContributors: parseInt(metrics['number_of_new_sparc_users_last_quarter']['N']),
      downloadsLastMonth: parseInt(metrics['number_of_sparc_downloads_last_mo']['N'])
    }
  }
})

const { data: totalDownloadsData, error: totalDownloadsError } = useAsyncData('totalDownloadsData', async () => {
  try {
    const { $axios } = useNuxtApp()
    const url = `${config.public.discover_api_host}/metrics/dataset/downloads/summary?startDate=2020-01-01&endDate=${currentYear}-${currentMonth}-${currentDay}`
    const response = await $axios.get(url)
    let totalDownloads = 0
    response.data.forEach(item => {
      if (item.origin === 'SPARC') {
        totalDownloads += parseInt(item['downloads'])
      }
    })
    return totalDownloads
  } catch (err) {
    console.error('Error retrieving download count.', err)
    return 0
  }
})

const { data: totalProtocolViewsData, error: totalProtocolViewsError } = useAsyncData('totalProtocolViewsData', async () => {
  try {
    const { $axios } = useNuxtApp()
    const url = `${config.public.portal_api}/total_protocol_views`
    const response = await $axios.get(url)
    return pathOr(-1, ['data', 'total_views'], response)
  } catch (err) {
    console.error('Error retrieving protocol views count.', err)
    return -1
  }
})

const { data: totalCitationsData, error: totalCitationsError } = useAsyncData('totalCitationsData', async () => {
  try {
    const { $axios } = useNuxtApp()
    const url = `${config.public.portal_api}/total_dataset_citations`
    const response = await $axios.get(url)
    return pathOr(undefined, ['data', 'total_citations'], response)
  } catch (err) {
    console.error('Error retrieving citations count.', err)
    return undefined
  }
})

const { data: highlights, error: highlightsError } = useAsyncData('highlightsData', async () => {
  try {
    const { $contentfulClient } = useNuxtApp()
    const response = await $contentfulClient.getEntries({
      'content_type': config.public.ctf_news_id,
      order: '-fields.publishedDate',
      limit: 999,
      'fields.subject': 'Highlight'
    })
    return response.items
  } catch (err) {
    console.log('Could not retrieve highlights.', err)
    return []
  }
})

const metricsItems = computed(() => {
  return [
    {
      title: 'Dataset Downloads',
      data: totalDownloadsData.value?.toString(),
      subData: `(${metricsData.value?.downloadsLastMonth} in ${months[lastMonthsDate.month - 1]})`
    },
    {
      title: 'Dataset Contributors',
      data: metricsData.value?.totalContributors?.toString(),
      subData: `(${metricsData.value?.newContributors} new in ${months[lastMonthsDate.month - 1]})`
    },
    {
      title: 'Protocol Views',
      data: totalProtocolViewsData.value?.toString(),
      subData: null
    },
    {
      title: 'Dataset Citations',
      data: totalCitationsData.value?.toString(),
      subData: null
    }
  ]
})

const breadcrumb = computed(() => [
  {
    to: { name: 'index' },
    label: 'Home'
  }
])

const pageTitle = computed(() => pageData.value?.pageTitle || 'About Page')

const heroCopy = computed(() => pageData.value?.heroCopy || '')

const sparcPortal = computed(() => pageData.value?.sparcPortal || '')

const whatWeOffer = computed(() => pageData.value?.whatWeOffer || '')

const teamLeadership = computed(() => pageData.value?.teamLeadership || '')

const getInvolved = computed(() => pageData.value?.getInvolved || '')

const historyOfSparc = computed(() => pageData.value?.historyOfSparc || '')

const whatWeOfferButtonText = computed(() => pageData.value?.whatWeOfferButtonText || 'What We Offer')

const teamLeadershipButtonText = computed(() => pageData.value?.teamLeadershipButtonText || 'Who We Are')

const getInvolvedButtonText = computed(() => pageData.value?.getInvolvedButtonText || 'Help Us Grow')

const aboutLink = (aboutDetailsId) => {
  const name = 'about-aboutDetailsId'
  return { name, params: { aboutDetailsId } }
}
</script>

<style scoped lang="scss">
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.about-page {
  background-color: $background;
}

.row-item {
  width: 30%;
  display: flex;
  @media screen and (max-width: 767px) {
    width: 100%;
  }
}

.row {
  display: flex;
  justify-content: space-between;
  @media screen and (max-width: 767px) {
    flex-direction: column;
  }
}

.portal-image {
  height: auto;
  width: 30%;
  min-width: 20rem;

  @media screen and (max-width: 767px) {
    display: none;
  }
}

.margin-top-auto {
  margin-top: auto;
}

.midnightblue-background {
  background-color: $darkBlue;
}

.white-text {
  color: white;
}

.about-page-border {
  border: 1px solid $lineColor2;
}
.gallery-items-container {
  background-color: white;
  border: 1px solid $lineColor1;
}
.data-wrap {
  justify-content: center;
  width: 100%;
  display: flex;
}
:deep(img) {
  display: block;
  margin-left: auto;
  margin-right: auto;
}
.who-we-support-item {
  color: #000;
  text-decoration: none;
  width: 128px;
  margin: 0rem 2rem;
  text-align: center;

  &:hover,
  &:focus {
    opacity: 0.9;
  }

  img {
    background: #fff;
    border-radius: 50%;
    margin-bottom: 8px;
    width: 128px;
    border: solid 1px #c0c4cc;
    height: 128px;
    object-fit: contain;
  }

  p {
    font-size: 1em;
    font-weight: 700;
    color: #24245b;

    &:hover {
      text-decoration: underline;
    }
  }
}
.who-we-support-container {
  background: white;
  border: solid $lineColor1 1px;
}
</style>
