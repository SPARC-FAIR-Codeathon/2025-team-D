<template>
  <div v-if="searchHasAltResults" class="mt-8">
    The following results were discovered for the other categories:
    <br />
    <br />
    <template v-for="dataType in dataTypes">
      <dd v-if="resultCounts[dataType.id] > 0 && dataType.id != dataTypeSelected" :key="dataType.id">
        <nuxt-link :to="{
            query: {
              ...$route.query,
              consortiaType:`${dataType.id}`
            }
          }">
          {{ resultCounts[dataType.id] }} result{{
          resultCounts[dataType.id] > 1 ? 's' : ''
          }}
        </nuxt-link>
        - {{ dataType.label }}
      </dd>
    </template>
  </div>
</template>

<script>

export default {
  name: 'AlternativeSearchResultsProjects',
  props: {
    dataTypes: {
      type: Array,
      default: () => []
    }
  },
  data: function () {
    return {
      searchHasAltResults: false,
      resultCounts: {}
    }
  },
  computed: {
    dataTypeSelected: function () {
      return this.$route.query.consortiaType
    }
  },
  methods: {
    retrieveAltTotals: function () {
      this.searchHasAltResults = false
      for (let key in this.resultCounts) {
        // reset reults list
        this.resultCounts[key] = 0
      }
      let altSearchTypes = this.dataTypes.filter(
        e => e !== this.dataTypeSelected
      ) // Remove from list of data types

      altSearchTypes.forEach(type => {
        // Search on each data type remaining
        this.retrieveAltTotal(type.id)
      })
    },
    retrieveAltTotal: function (category) {
      this.$contentfulClient.getEntries({
        content_type: 'sparcAward',
        query: this.$route.query.search,
        'fields.focus[in]': this.$route.query.selectedProjectsAnatomicalFocusIds,
        'fields.program[in]': category
      })
        .then(resp => {
          this.resultCounts[category] = resp.total
          if (resp.total > 0 && category != this.dataTypeSelected)
            this.searchHasAltResults = true
      })
      .catch((err) => {
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
