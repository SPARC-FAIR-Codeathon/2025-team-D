<template>
  <el-table :show-header="false" :data="tableData" empty-text="No Results">
		<el-table-column>
      <template slot-scope="scope">
        <news-list-item
          :key="scope.row.sys.id"
          :item="scope.row"
        />
      </template>
		</el-table-column>
  </el-table>
</template>

<script>
import NewsListItem from '@/components/NewsListItem/NewsListItem.vue'

export default {
  name: 'NewsSearchResults',

	components: {
    NewsListItem
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
.el-table {
  width: 100%;
}
</style>
