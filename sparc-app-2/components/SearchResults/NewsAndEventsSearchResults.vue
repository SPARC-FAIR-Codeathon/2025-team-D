<template>
  <div>
    <event-search-results
      v-if="this.$route.query.newsAndEventsType === 'event'"
      :table-data="tableData"
    />
    <community-spotlight-listings 
      v-else-if="this.$route.query.newsAndEventsType === 'successStoryDisplay'" 
      :stories="tableData" 
    />
    <news-search-results v-else :table-data="tableData" />
  </div>
</template>

<script>
import CommunitySpotlightListings from '../CommunitySpotlight/CommunitySpotlightListings.vue'
import NewsSearchResults from './NewsSearchResults.vue'
import EventSearchResults from './EventSearchResults.vue'

export default {
  name: 'NewsAndEventsSearchResults',

  components: {
    CommunitySpotlightListings,
    NewsSearchResults,
    EventSearchResults
  },

  props: {
    tableData: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style lang="scss" scoped></style>
