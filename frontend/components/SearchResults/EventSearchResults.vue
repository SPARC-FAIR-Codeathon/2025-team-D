<template>
  <div class="events">
    <div class="no-results px-16" v-if="tableData.length === 0">
      <el-table :show-header="false" empty-text="No Results">
        <el-table-column />
      </el-table>
    </div>
    <event-card
      v-else
      v-for="event in tableData"
      :key="event.sys.id"
      :event="event"
    />
  </div>
</template>

<script>
import EventCard from '../EventCard/EventCard.vue'

export default {
  name: 'EventSearchResults',

  components: {
    EventCard,
  },

  props: {
    tableData: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style lang="scss" scoped>
.events {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -1em;
}
.no-results {
  width: stretch;
}
.upcoming-event {
  margin: 0 1em 2em;
  @media (min-width: 48em) {
    width: calc(50% - 4.125em); // Account for the margins and the border
  }
  @media (min-width: 64em) {
    width: calc(25% - 4.125em); // Account for the margins and the border
  }
}
</style>
