<template>
  <div class="page-data">
    <page-hero>
      <h1 v-if="heroHeading">
        {{ heroHeading }}
      </h1>
      <!-- eslint-disable vue/no-v-html -->
      <!-- marked will sanitize the HTML injected -->
      <div v-html="parseMarkdown(heroCopy)" />
      <template v-slot:image>
        <img
          v-if="heroImage"
          class="page-hero-img"
          :src="heroImage?.fields?.file.url"
        />
      </template>
    </page-hero>
    <hr />
    <portal-features class="secondary-background" :features="portalFeatures" />
    <hr />
    <div>
      <sparc-numbers :explore-data="exploreData" :consortiaItems="consortiaItems"/>
    </div>
    <hr />
    <div class="secondary-background">
      <featured-data :featured-data="featuredData" :categories="featuredDataCategories"/>
    </div>
    <hr />
    <projects-and-datasets :datasetSectionTitle="datasetSectionTitle" :projectOrResource="featuredProject" :dataset="featuredDataset" />
    <hr />
    <div class="secondary-background">
      <homepage-news :news="newsAndEvents" />
    </div>
    <hr />
    <stay-connected />
    <hr />
  </div>
</template>

<script setup>
import FeaturedData from '@/components/FeaturedData/FeaturedData.vue'
import SparcNumbers from '@/components/SparcNumbers/SparcNumbers.vue'
import HomepageNews from '@/components/HomepageNews/HomepageNews.vue'
import PortalFeatures from '@/components/PortalFeatures/PortalFeatures.vue'
import ProjectsAndDatasets from '@/components/ProjectsAndDatasets/ProjectsAndDatasets.vue'
import StayConnected from '@/components/StayConnected/StayConnected.vue'
import { failMessage } from '@/utils/notification-messages'
import { parseMarkdown } from '@/utils/formattingUtils.js'
import getHomepageFields from '@/utils/homepageFields'
import { useMainStore } from '../store/index.js'
import { pathOr } from 'ramda'
import { useRuntimeConfig, useAsyncData } from '#app'

const config = useRuntimeConfig()
const { $contentfulClient, $axios } = useNuxtApp()
useHead({
  title: 'SPARC Portal',
  meta: [
    {
      hid: 'description',
      name: 'description',
      content:
        'The open community platform for bridging the body and the brain through neuroscience and systems physiology data, computational and spatial modeling, and device design.'
    },
    {
      name: 'og:type',
      content: 'website'
    },
    {
      hid: 'og:title',
      property: 'og:title',
      content: 'SPARC Portal'
    },
    {
      name: "google-site-verification",
      content: `${config.public.GOOGLE_SEARCH_CONSOLE_VERIFICATION_ID}`
    },
    {
      hid: 'og:image',
      property: 'og:image',
      content: 'https://images.ctfassets.net/6bya4tyw8399/7r5WTb92QnHkub8RsExuc1/2ac134de2ddfd65eb6316421df7578f9/sparc-logo-primary.png'
    },
    {
      hid: 'og:image:secure_url', property: 'og:image:secure_url',
      content: 'https://images.ctfassets.net/6bya4tyw8399/7r5WTb92QnHkub8RsExuc1/2ac134de2ddfd65eb6316421df7578f9/sparc-logo-primary.png'
    },
    {
      name: 'og:site_name',
      content: 'SPARC Portal'
    },
    {
      name: 'twitter:card',
      content: 'summary'
    },
    {
      name: 'twitter:site',
      content: '@sparc_science'
    },
    {
      name: 'twitter:title',
      content: 'SPARC Portal'
    },
    {
      name: 'twitter:image',
      content: 'https://images.ctfassets.net/6bya4tyw8399/7r5WTb92QnHkub8RsExuc1/2ac134de2ddfd65eb6316421df7578f9/sparc-logo-primary.png'
    },
    {
      name: 'twitter:description',
      content: 'The open community platform for bridging the body and the brain through neuroscience and systems physiology data, computational and spatial modeling, and device design.'
    }
  ]
})
    
const { data: consortiaItems, error: consortiaError } = useAsyncData('consortiaItems', async () => {
  try {
    const { items } = await $contentfulClient.getEntries({
      content_type: config.public.ctf_consortia_content_type_id,
      order: 'fields.displayOrder',
      'fields.displayOnHomepage': true,
    })
    return items
  } catch (err) {
    console.error('Could not fetch consortia data from Contentful.', err)
    return []
  }
})

const { data: homepageData, error: homepageError } = useAsyncData('homepage', async () => {
  return $contentfulClient.getEntry(config.public.ctf_home_page_id);
})

const { data: featuredDataCategories, error: featuredDataCategoriesError } = useAsyncData('featuredDataCategories', async () => {
  let categories = []
  await $contentfulClient.getContentType('featuredData').then(contentType => {
    contentType.fields.forEach((field) => {
      if (field.id === 'facetType') {
        categories = field.items?.validations[0]['in']
      }
    })
  })
  return categories
})

const { data: featuredDatasets, error: featuredDatasetsError } = useAsyncData('featuredDatasets', async () => {
  const response = await $axios.get(`${config.public.discover_api_host}/datasets/32`)
  return [response.data]
});

const institutionId = computed(() => 
  pathOr(
    undefined,
    ['featuredProject', 'fields', 'institutions', 0, 'sys', 'id'],
    homepageData?.value?.fields
  )
);

const { data: institutionData, error: institutionError } = useAsyncData(
  'institution',
  async () => {
    if (!institutionId.value) return null;
    return $contentfulClient.getEntry(institutionId.value);
  },
  { watch: [institutionId] }
);

const fields = computed(() => {
  if (!homepageData.value) return null;

  let fields = getHomepageFields(homepageData.value?.fields);
  const datasetSectionTitle = homepageData.value?.fields.datasetSectionTitle;

  if (featuredDatasets.value?.length > 0) {
    const featuredDataset = {
      title: featuredDatasets.value[0].name,
      description: featuredDatasets.value[0].description,
      banner: featuredDatasets.value[0].banner,
      id: featuredDatasets.value[0].id,
    }
    fields = { ...fields, featuredDataset, datasetSectionTitle }
  }

  if (institutionData.value) {
    fields.featuredProject.fields.banner = institutionData.value?.fields.logo.fields.file.url;
  }

  return fields;
})

const heroHeading = computed(() => fields.value?.heroHeading)
const heroImage = computed(() => fields.value?.heroImage)
const heroCopy = computed(() => fields.value?.heroCopy)
const portalFeatures = computed(() => fields.value?.portalFeatures)
const exploreData = computed(() => fields.value?.exploreData)
const featuredData = computed(() => fields.value?.featuredData)
const featuredDataset = computed(() => fields.value?.featuredDataset)
const featuredProject = computed(() => fields.value?.featuredProject)
const datasetSectionTitle = computed(() => fields.value?.datasetSectionTitle)
const newsAndEvents = computed(() => fields.value?.newsAndEvents)

if (homepageError.value || featuredDatasetsError.value || institutionError.value) {
  console.error(homepageError.value || featuredDatasetsError.value || institutionError.value);
  failMessage("Some services are temporarily unavailable, which may cause certain pages to load incompletely.");
}
  
const { profileComplete, userProfile } = storeToRefs(useMainStore)

watch(
  () => profileComplete?.value, (newVal) => {
    if (userProfile?.value && !newVal) {
      // Redirect to the welcome page if profile is incomplete
      navigateTo('/welcome');
    }
  },
  { immediate: true }
)

// When trying to do federated sign in using a middleware (like we do for sign out), Cognito's callback would only
// execute client-side (after the middleware had already redirected to the new page) causing it to overwrite the 
// previous redirect. This issue was supposed to be addressed by https://github.com/aws-amplify/amplify-js/pull/3588, 
// but attempting to handle dynamic routing after amplify federated sign in via a custom state hook as suggested 
// here: https://github.com/aws-amplify/amplify-js/issues/3125#issuecomment-814265328 did not work
onBeforeMount(() => {
  const signInRedirectCookie = useCookie('sign-in-redirect-url');
  if (signInRedirectCookie.value) {
    const signInRedirectUrl = signInRedirectCookie.value;
    signInRedirectCookie.value = null;
    return navigateTo(signInRedirectUrl)
  }
});
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.page-data {
  background-color: #f8faff;
}
.secondary-background {
  background-color: $background;
}
.page-hero-video {
  width: 406px;
}

hr {
  margin: 0;
  padding: 0;
  border-top: none;
  border-color: $lineColor1;
}
</style>
