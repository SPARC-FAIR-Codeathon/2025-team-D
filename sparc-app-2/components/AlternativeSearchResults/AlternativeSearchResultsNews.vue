<template>
  <div v-if="searchHasAltResults && route.query.search" class="mt-8">
    <hr />
    <template v-if="!searchHadResults">
      No results were found for <strong><i>{{ route.query.search }}</i></strong>.
    </template>
    The following results were discovered for the other categories:
    <br />
    <br />
    <template v-for="dataType in dataTypes">
      <dd v-if="resultCounts[dataType] > 0" :key="dataType">
        <nuxt-link
          :to="{
            name: `news-and-events-${dataType}`,
            query: {
              ...route.query
            }
          }"
        >
          {{ resultCounts[dataType] }} result{{
            resultCounts[dataType] > 1 ? 's' : ''
          }}
        </nuxt-link>
        - {{ humanReadableDataTypesLookup[dataType] }}
      </dd>
    </template>
  </div>
</template>

<script>
import {
  fetchNews,
  fetchEvents,
  fetchCommunitySpotlightItems
} from '@/pages/news-and-events/model.js'

function getLastUrlSegment(path) {
  return path
    .split('/')
    .filter(Boolean)
    .pop()
}

export default {
  name: 'AlternativeSearchResultsNews',
  props: {
    searchHadResults: {
      type: Boolean,
      default: true
    }
  },
  setup() {
    const route = useRoute()
    return {
      route
    }
  },
  data: function() {
    return {
      searchHasAltResults: false,
      dataTypes: ['news', 'events', 'community-spotlight'],
      humanReadableDataTypesLookup: {
        news: 'News',
        events: 'Events',
        'community-spotlight': 'Community Spotlight'
      },
      functionLookup: {
        news: fetchNews,
        events: fetchEvents,
        'community-spotlight': fetchCommunitySpotlightItems
      },
      resultCounts: {
        news: 0,
        events: 0,
        'community-spotlight': 0
      },
      fetchNews: fetchNews,
      fetchEvents: fetchEvents,
      fetchCommunitySpotlightItems: fetchCommunitySpotlightItems
    }
  },
  computed: {
    dataTypeSeleced: function() {
      return getLastUrlSegment(this.$route.path)
    }
  },
  methods: {
    retrieveAltTotals: function() {
      this.searchHasAltResults = false
      for (let key in this.resultCounts) {
        // reset reults list
        this.resultCounts[key] = 0
      }
      let altSearchTypes = this.dataTypes.filter(
        e => e !== this.dataTypeSeleced
      ) // Remove from list of data types

      altSearchTypes.forEach(type => {
        // Search on each data type remaining
        this.retrieveAltTotal(type)
      })
    },
    retrieveAltTotal: function(category) {
      this.functionLookup[category](
        this.$contentfulClient,
        this.$route.query.search,
        undefined,
        undefined,
        undefined
      )
        .then(resp => {
          this.resultCounts[category] = resp.total
          resp.total > 0 ? (this.searchHasAltResults = true) : null
        })
        .catch(err => {
          console.log('Error in alternative Search results call:', err)
          this.resultCounts[category] = 0
        })
    }
  }
}
</script>

<style scoped>
hr {
  border-top: none;
}
</style>
