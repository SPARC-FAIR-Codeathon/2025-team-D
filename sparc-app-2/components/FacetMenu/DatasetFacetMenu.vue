<template>
  <div class="dataset-facet-menu">
    <facet-menu
      :selectedFacets="selectedFacetArray"
      :visibleFacetCategories="visibleCategories"
      :visibleFacets="facetMenuVisibleFacets"
      @deselect-facet="deselectFacet"
      @deselect-all-facets="deselectAllFacets"
    />
    <hr class="expand-all-separator"/>
    <span class="flex expand-all-container">
      <el-link class="container-link" @click="expandAllCategories">
        Expand all
      </el-link>
    </span>
    <dropdown-multiselect
      v-for="item in facets"
      v-show="visibleCategories.includes(item.key)"
      :collapse-by-default="!containsSelectedId(item)"
      :key="item.id"
      :category="constructCategory(item)"
      :visible-data="visibleFacets"
      :default-checked-ids="defaultCheckedFacetIds"
      @selection-change="onSelectionChange"
      ref="facetCategories"
    />
    <dropdown-multiselect
      v-show="visibleCategories.includes(embargoedFacetCategory.id)"
      collapse-by-default
      :category="embargoedFacetCategory"
      :default-checked-ids="defaultCheckedFacetIds"
      :tooltip="embargoFacetCategoryTooltip"
      @selection-change="onSelectionChange"
      ref="embargoedFacetCategory"
    />
  </div>
</template>

<script>
import { pluck, pathOr, propOr } from 'ramda'
import FacetMenu from './FacetMenu.vue'
import { facetPropPathMapping } from '../../utils/algolia'

const embargoedFacetCategory = {
  label: 'Availability',
  id: 'availability',
  data: [
    {
      label: 'Embargoed',
      id: 'embargoed',
      facetPropPath: 'availability',
    },
    {
      label: 'Not Embargoed',
      id: 'not embargoed',
      facetPropPath: 'availability',
    }
  ]
}

const embargoFacetCategoryTooltip = "SPARC datasets are subject to a 1 year embargo during which time<br/>the datasets are visible only to members of the SPARC consortium.<br/>During embargo, the public will be able to view basic metadata about<br/>these datasets as well as their release date."

export default {
  name: 'DatasetFacetMenu',

  components: { FacetMenu },

  props: {
    facets: {
      type: Array,
      default: () => []
    },
    visibleFacets: {
      type: Object,
      default: () => {}
    },
  },

  setup() {
    const config = useRuntimeConfig()
    const visibleDatasetsFacetCategories = config.public.SHOW_HIERARCHAL_FACETS === 'true' ?
      [
        'anatomy.organ.category.name',
        'anatomy.organ.subcategory.name',
        'organisms.primary.species.name',
        'item.modalities.keyword',
        'attributes.subject.sex.value',
        'attributes.subject.ageCategory.value',
        'supportingAwards.consortium.name',
        'availability'
      ] :
      [
        'anatomy.organ.name',
        'organisms.primary.species.name',
        'item.modalities.keyword',
        'attributes.subject.sex.value',
        'attributes.subject.ageCategory.value',
        'supportingAwards.consortium.name',
        'availability'
      ]

    const visibleModelsAndSimulationsFacetCategories = config.public.SHOW_HIERARCHAL_FACETS === 'true' ?
      ['anatomy.organ.category.name', 'anatomy.organ.subcategory.name', 'supportingAwards.consortium.name', 'availability', 'organisms.primary.species.name'] :
      ['anatomy.organ.name', 'supportingAwards.consortium.name', 'availability', 'organisms.primary.species.name']

    return {
      visibleDatasetsFacetCategories,
      visibleModelsAndSimulationsFacetCategories
    }
  },

  computed: {
    visibleCategories: function() {
      const menuType = this.$route.query.type
      if (menuType === 'simulation' || menuType === 'model') {
        return this.visibleModelsAndSimulationsFacetCategories
      }
      return this.visibleDatasetsFacetCategories
    },
    facetMenuVisibleFacets: function() {
      const availability = {
        'Embargoed': true,
        'Not Embargoed': true,
        facetPropPath: 'availability',
      }
      return {...this.visibleFacets, availability}
    },
    embargoedFilter: function() {
      if(this.visibleCategories.includes(embargoedFacetCategory.id)) {
        if (this.selectedFacetArray.some(facet => facet.id === this.embargoedFacetCategory.data[0].id))
        {
          return 'item.published.status:embargo'
        } else if(this.selectedFacetArray.some(facet => facet.id === this.embargoedFacetCategory.data[1].id)) {
          return 'NOT item.published.status:embargo'
        } else {
          return 'NOT item.published.status:embargo OR item.published.status:embargo'
        }  
      }
      return ''
    }
  },

  data() {
    return {
      selectedFacets: {},
      selectedFacetArray: [],
      defaultCheckedFacetIds: [],
      embargoedFacetCategory : embargoedFacetCategory,
      embargoFacetCategoryTooltip: embargoFacetCategoryTooltip,
      numKeys: 0,
      latestUpdateId: '',
    }
  },

  mounted() {
    if (this.$route.query.selectedFacetIds) {
      this.defaultCheckedFacetIds = this.$route.query.selectedFacetIds.split(",")
    }
  },

  methods: {
    constructCategory: function(item) {
      if (item === null || item === undefined) {
        return
      }
      const categoryFacet = facetPropPathMapping.find(category => category.facetPropPath === item.key)
      const category = {
        label: item.label,
        facet: categoryFacet,
        data: item.children
      }
      return category
    },
    visibleFacetsForCategory: function(id) {
      return this.visibleFacets[id]
    },
    onSelectionChange: function(data) {
      this.selectedFacets[data.id] = data.checkedNodes

      this.selectedFacetArray = []
      for (const [id, value] of Object.entries(this.selectedFacets)) {
        this.selectedFacetArray = this.selectedFacetArray.concat(value)
      }
      const selectedFacetIds = this.selectedFacetArray.length === 0 ? undefined : pluck('id', this.selectedFacetArray).toString()
      this.$router.replace({
        query: {
          ...this.$route.query,
          selectedFacetIds: selectedFacetIds,
          skip: 0
        }
      }).then(() => {
        this.latestUpdateId = data.id;
        this.numKeys = data.checkedNodes.length
        this.$emit('selected-facets-changed')
      }).catch(() => {})
    },
    /* Returns filter for searching algolia. All facets of the same category are joined with OR,
     * and each of those results is then joined with an AND.
     * i.e. (color:blue OR color:red) AND (shape:circle OR shape:red) */
    getFilters() {
      if (this.selectedFacetArray === undefined) {
        return undefined
      }
      let filters = this.embargoedFilter
      filters = `(${filters}) AND `
      const facetPropPaths = facetPropPathMapping.map(item => item.facetPropPath)
      facetPropPaths.map(facetPropPath => {
        const subpropPath = facetPropPathMapping.find(facet => facet.facetPropPath == facetPropPath)?.facetSubpropPath || ''
        if (!this.visibleCategories.includes(facetPropPath)) {
          return
        }
        const facetsToOr = this.selectedFacetArray.filter(
          facet => facet.facetPropPath == facetPropPath
        )
        var filter = ''
        facetsToOr.map(facet => {
          if (pathOr(undefined, [facet.facetPropPath, facet.label], this.visibleFacets) === undefined) {
            return
          }
          filter += `"${facetPropPath}":"${facet.label}" OR `
        })
        const subfacetsToOr = this.selectedFacetArray.filter(
          facet => facet.facetPropPath == subpropPath
        )
        subfacetsToOr.map(facet => {
          if (pathOr(undefined, [facet.facetPropPath, facet.label], this.visibleFacets) === undefined) {
            return
          }
          filter += `"${subpropPath}":"${facet.label}" OR `
        })
        if (filter == '') {
          return
        }
        filter = `(${filter.substring(0, filter.lastIndexOf(' OR '))})`
        filters += `${filter} AND `
      })
      return filters.substring(0, filters.lastIndexOf(' AND '))
    },
    getLatestUpdateKey() {
      return this.latestUpdateId
    },
    hasKeys() {
      return this.numKeys > 0
    },
    deselectAllFacets() {
      this.$refs.facetCategories.map(facetCategory => {
        if (this.visibleCategories.includes(pathOr('', ['category','facet','facetPropPath'], facetCategory)))
          facetCategory.uncheckAll()
      })
      this.$refs.embargoedFacetCategory.uncheckAll()
    },
    deselectFacet(id) {
      this.$refs.facetCategories.map(facetCategory => facetCategory.uncheck(id))
      this.$refs.embargoedFacetCategory.uncheck(id)
    },
    expandAllCategories() {
      this.$refs.facetCategories.map(facetCategory => {
        if (this.visibleCategories.includes(pathOr('', ['category','facet','facetPropPath'], facetCategory)))
          facetCategory.setCollapsed(false)
      })
      this.$refs.embargoedFacetCategory.setCollapsed(false)
    },
    containsSelectedId(item) {
      const children = propOr([], 'children', item)
      return children.some(child => {
        let found = this.defaultCheckedFacetIds.some(checkedId => parseInt(checkedId) == (propOr('', 'id', child)))
        if (!found && child.children.length > 0) {
          found = child.children.some(nestedChild => {
            return this.defaultCheckedFacetIds.some(checkedId => parseInt(checkedId) == (propOr('', 'id', nestedChild)))
          })
        }
        return found
      })
    }
	}
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';

.dataset-facet-menu > .sparc-design-system-component-dropdown-multiselect:not(:last-child) {
  border-bottom: none;
}

hr {
  margin: 0;
  border: none;
  border-bottom: 1px solid $lineColor2;
}

.container-link {
  text-decoration: underline;
  text-transform: none;
  color: $purple;
  a:hover {
    text-decoration: none;
  }
}
//el-link adds a component with a border in order to underline the text.
//The underline is too low so we cannot use it, and must instead hide it
.el-link.el-link--default:after {
  border: none;
}

.flex {
  display: flex;
  border-left: 1px solid $lineColor2;
  border-right: 1px solid $lineColor2;
  .el-link {
    margin: .5rem .75rem .5rem auto;
  }
}

.expand-all-container {
  background-color: white;
}

</style>
