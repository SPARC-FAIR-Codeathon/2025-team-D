<template>
  <div class="resources-facet-menu">
    <facet-menu
      class="hide-bottom-border"
      :selected-facets="selectedFacets"
      :visible-facet-categories="visibleCategories"
      @deselect-facet="deselectFacet"
      @deselect-all-facets="deselectAllFacets"
    />
    <dropdown-multiselect
      :category="resourceTypeCategory"
      :default-checked-ids="selectedResourceTypeIds"
      collapse-by-default
      @selection-change="onResourceTypesChanged"
      ref="resourceTypeCategory"
    />
    <dropdown-multiselect
      :category="typeCategory"
      :default-checked-ids="selectedTypeIds"
      collapse-by-default
      @selection-change="onTypesChanged"
      ref="typeCategory"
    />
    <dropdown-multiselect
      :category="fundingCategory"
      :default-checked-ids="defaultCheckedFundingIds"
      collapse-by-default
      @selection-change="onFundingFacetSelectionChange"
      ref="fundingCategory"
    />
  </div>
</template>

<script>
import FacetMenu from './FacetMenu.vue'
import { pluck } from 'ramda'

const visibleCategories = ['resourceType', 'type', 'funding']


export const RESOURCE_TYPE_CATEGORY = {
  label: 'Type',
  id: 'resourceType',
  data: [
    {
      label: 'Databases',
      id: 'Data and Models'
    },
    {
      label: 'Software',
      id: 'Software'
    },
    {
      label: 'Information Services',
      id: 'Information Services'
    },
    {
      label: 'Devices',
      id: 'Devices'
    },
    {
      label: 'Biological',
      id: 'Biologicals'
    }
  ]
}

const TYPE_CATEGORY = {
  label: 'Developed By',
  id: 'type',
  data: [
    {
      label: 'SPARC',
      id: 'developedBySparc'
    },
    {
      label: 'Codeathon',
      id: 'codeathon'
    }
  ]
}

const FUNDING_CATEGORY_ID = 'funding'

export default {
  name: 'ToolsAndResourcesFacetMenu',

  components: { FacetMenu },

  data() {
    return {
      resourceTypeCategory: RESOURCE_TYPE_CATEGORY,
      selectedResourceTypeIds: [],
      selectedFundingFacets: [],
      typeCategory: TYPE_CATEGORY,
      selectedTypeIds: [],
      visibleCategories: visibleCategories,
      defaultCheckedFundingIds: []
    }
  },

  props: {
    fundingFacets: {
      type: Array,
      default: () => []
    }
  },

  computed: {
    selectedFacets: function() {
      let facets = []
      if (this.selectedTypeIds != []) {
        this.selectedTypeIds.forEach(selectedOption => {
          facets.push({
            label: `${selectedOption.label}`,
            id: `${selectedOption.id}`,
            facetPropPath: this.typeCategory.id
          })
        })
      }
      if (this.selectedResourceTypeIds != []) {
        this.selectedResourceTypeIds.forEach(selectedOption => {
          facets.push({
            label: `${selectedOption.label}`,
            id: `${selectedOption.id}`,
            facetPropPath: this.resourceTypeCategory.id
          })
        })
      }
      if (this.selectedFundingFacets != []) {
        this.selectedFundingFacets.forEach(selectedOption => {
          facets.push({
            label: `${selectedOption.label}`,
            id: `${selectedOption.id}`,
            facetPropPath: FUNDING_CATEGORY_ID
          })
        })
      }
      return facets
    },
    fundingCategory: function () {
      return {
        label: 'Consortia',
        id: FUNDING_CATEGORY_ID,
        data: this.fundingFacets
      }
    },
  },

  mounted() {
    if (this.$route.query.type) {
      this.selectedTypeIds = this.$route.query.type.split(',')
    }
    if (this.$route.query.resourceType) {
      this.selectedResourceTypeIds = this.$route.query.resourceType.split(',')
    }
    if (this.$route.query.selectedResourcesFundingIds) {
      this.defaultCheckedFundingIds = this.$route.query.selectedResourcesFundingIds.split(",")
    }
  },

  methods: {
    visibleFacetsForCategory: function(key) {
      return this.visibleFacets[key]
    },
    onResourceTypesChanged: function (newValue) {
      this.selectedResourceTypeIds = newValue.checkedNodes
      this.$router.replace(
        {
          query: { ...this.$route.query, resourceType: this.selectedResourceTypeIds.length === 0 ? undefined : pluck('id', this.selectedResourceTypeIds).toString() }
        },
        () => {
          this.$emit('tool-and-resources-selections-changed')
        }
      )
    },
    onTypesChanged: function(newValue) {
      this.selectedTypeIds = newValue.checkedNodes
      this.$router.replace(
        {
          query: { ...this.$route.query, type: this.selectedTypeIds.length === 0 ? undefined : pluck('id', this.selectedTypeIds).toString() }
        },
        () => {
          this.$emit('tool-and-resources-selections-changed')
        }
      )
    },
    onFundingFacetSelectionChange: function (newValue) {
      this.selectedFundingFacets = newValue.checkedNodes

      this.$router.replace(
        {
          query: { ...this.$route.query, selectedResourcesFundingIds: this.selectedFundingFacets.length === 0 ? undefined : pluck('id', this.selectedFundingFacets).toString() }
        },
        () => {
        this.$emit('tool-and-resources-selections-changed')
        }
      )
    },
    async deselectAllFacets() {
      await this.$router.replace(
        {
          query: {
            ...this.$route.query,
            type: undefined,
            resourceType: undefined,
            selectedResourcesFundingIds: undefined
          }
        }).then(() => {
          this.$refs.resourceTypeCategory.uncheckAll()
          this.$refs.typeCategory.uncheckAll()
          this.$refs.fundingCategory.uncheckAll()
          this.$emit('tool-and-resources-selections-changed')
        })
    },
    deselectFacet(id) {
      this.$refs.resourceTypeCategory.uncheck(id)
      this.$refs.typeCategory.uncheck(id)
      this.$refs.fundingCategory.uncheck(id)
    },
  }
}
</script>
<style lang="scss" scoped>
.resources-facet-menu>.sparc-design-system-component-dropdown-multiselect:not(:last-child) {
  border-bottom: none;
}
.hide-bottom-border {
  // hacky fix to address placing the design system drop down for the category outside the facet menu since it handles its own borders
  border-bottom: none;
}
</style>
