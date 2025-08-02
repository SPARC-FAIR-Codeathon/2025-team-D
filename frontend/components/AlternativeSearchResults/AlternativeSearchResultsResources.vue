<template>
  <div v-if="searchHasAltResults" class="mt-8">
    The following results were discovered for the other categories:
    <br />
    <br />
    <template v-for="dataType in dataTypes">
      <dd v-if="resultCounts[dataType] > 0" :key="dataType">
        <nuxt-link
          :to="{
            name: `${dataType}`,
            query: {
              ...$route.query
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
import { fetchResources } from '@/pages/resources/utils'

function getLastUrlSegment(path) {
  return path
    .split('/')
    .filter(Boolean)
    .pop()
}

export default {
  name: 'AlternativeSearchResultsResources',
  props: {
    searchHadResults: {
      type: Boolean,
      default: true
    }
  },
  data: function() {
    return {
      searchHasAltResults: false,
      dataTypes: [
        'tools',
        'resources',
      ],
      humanReadableDataTypesLookup: {
        tools: 'Tools',
        resources: 'Resources',
      },
      resultCounts: {
        tools: 0,
        resources: 0
      }
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
    retrieveAltTotal: function (category) {
      const isTool = category == 'tools'
      fetchResources(
        this.$route.query.resourceType,
        this.$route.query.selectedResourcesFundingIds,
        isTool,
        this.$route.query.search,
        undefined,
        this.$route.query.type,
        10,
        0
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
