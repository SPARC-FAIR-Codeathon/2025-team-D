<template>
  <el-table :show-header="false" :data="tableData" empty-text="No Results">
    <el-table-column>
      <template slot-scope="scope">
        <learn-more-card
          class="small-title"
          :about-details-item="scope.row"
        />
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import Truncate from '@/mixins/truncate'
import LearnMoreCard from '../LearnMoreCard/LearnMoreCard.vue'

const typeToPageMapping = {
  Portal: 'sparc-portal',
  'What We Offer': 'what-we-offer',
  Policies: 'policies-and-standards',
  'Get Involved': 'get-involved',
  Team: 'team-and-leadership'
}

export default {
  name: 'AboutDetailsSearchResults',
  components: { LearnMoreCard },

  mixins: [Truncate],

  props: {
    tableData: {
      type: Array,
      default: () => []
    },
    type: {
      type: String,
      default: () => 'about'
    }
  },

  methods: {
    calculateParentPath: function(aboutDetailsItem) {
      return typeToPageMapping[aboutDetailsItem.fields.type]
    }
  }
}
</script>

<style lang="scss" scoped>
.el-table {
  width: 100%;
}
</style>
