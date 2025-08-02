<template>
  <client-only>
    <div class="mt-16 similar-datasets-container">
      <div class="header">
        <div class="header-content">
          <div v-if="datasetTypeName === 'dataset'" class="p-8 mb-0">Search related datasets</div>
          <div v-else class="p-8 mb-0">Search related models/simulations</div>
          <el-popover
            width="160"
            trigger="hover"
            :append-to-body=false
            class="popover"
          >
            <template v-slot:reference>
              <svgo-icon-help class="help-icon"/>
            </template>
            <div>
              Click a button below to search within that facet.
            </div>
          </el-popover>
        </div>
        <hr />
      </div>
      <div class="px-8">
        <div v-if="associatedProjects">
          <div class="capitalize">project(s):</div>
          <div class="mt-8" v-for="(project, index) in associatedProjects" :key="index">
            <nuxt-link :to="getProjectLink(project)">
              <u>{{ getProjectTitle(project) }}</u>
            </nuxt-link>
          </div>
          <hr class="mt-16"/>
        </div>
        <div class="my-8" v-for="facet in datasetFacetsData" :key="facet.key">
          <div v-if="facet.children && showFacet(facet)">
            <div class="capitalize mb-8">{{facet.label}}:</div>
            <div class="facet-button-container parent-facet mt-8" v-for="child in facet.children" :key="child.id">
              <div v-if="child.children.length > 0">
                <sparc-tooltip placement="left-center" :content="capitalize(child.label)" is-repeating-item-content>
                  <template #item>
                    <div class="tooltip-item facet-button my-2 px-12 label2">
                      <a
                        :href="getSelectedFacetLink(getFacetId(child))"
                      >
                        <div class="facet-label capitalize">
                          {{child.label}}
                        </div>
                      </a>
                    </div>
                  </template>
                </sparc-tooltip>
                <div class="facet-button-container child-facet" v-for="nestedChild in child.children" :key="nestedChild.id">
                  <sparc-tooltip placement="left-center" :content="capitalize(nestedChild.label.split('.')[1])" is-repeating-item-content>
                    <template #item>
                      <div class="ml-32 tooltip-item facet-button my-2 px-12 label2">
                        <a
                          :href="getSelectedFacetLink(getFacetId(nestedChild))"
                        >
                          <div class="facet-label capitalize">
                            {{nestedChild.label.split('.')[1]}}
                          </div>
                        </a>
                      </div>
                    </template>
                  </sparc-tooltip> 
                </div>
              </div>
              <sparc-tooltip v-else placement="left-center" :content="capitalize(child.label)" is-repeating-item-content>
                <template #item>
                  <div class="tooltip-item facet-button my-2 px-12 label2">
                    <nuxt-link
                      :to="getSelectedFacetLink(getFacetId(child))"
                    >
                      <div class="facet-label capitalize">
                        {{child.label}}
                      </div>
                    </nuxt-link>
                  </div>
                </template>
              </sparc-tooltip> 
            </div>
            <hr class="my-16"/>
          </div>
        </div>
        <div class="mb-16" v-if="contributors">
          <div class="capitalize mb-8">contributors:</div>
          <div
            class="ml-8"
            v-for="contributor in contributors"
            :key="contributor.id"
          >
            <ul class="contributor-list">
              <li>
                <sparc-tooltip placement="left-center" :content="getContributorFullName(contributor)" is-repeating-item-content>
                  <template #item>
                    <div class="tooltip-item">
                      <nuxt-link
                        :to="getSelectedContributorLink(contributor)"
                      >
                        <u>{{getContributorFullName(contributor)}}</u>
                      </nuxt-link>
                    </div>
                  </template>
                </sparc-tooltip>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </client-only>
</template>

<script>
import { mapState } from 'pinia'
import { useMainStore } from '../../store'
import { propOr} from 'ramda'

import { getAlgoliaFacets, facetPropPathMapping } from '../../utils/algolia'
import FormatString from '@/mixins/format-string'

const EXPERIMENTAL_APPROACH_LABEL = facetPropPathMapping.find(item => item.id == 'item.modalities').label

const getPageTypeName = typeFacet => {
  let typeName = 'dataset'
  if (typeFacet === 'scaffold') {
    typeName = 'model'
  } else if (typeFacet === 'computational model') {
    typeName = 'simulation'
  }
  return typeName
}

export default {
  name: 'SimilarDatasetsInfoBox',

  mixins: [ FormatString ],

  props: {
    associatedProjects: {
      type: Array,
      default: () => []
    },
  },

  computed: {
    ...mapState(useMainStore, ['datasetInfo', 'datasetTypeName', 'datasetFacetsData']),
    datasetDoi: function() {
      return propOr('', 'doi', this.datasetInfo)
    },
    showExperimentalApproachFacet: function() {
      return this.datasetTypeName === 'dataset'
    },
    contributors: function() {
      return propOr([], 'contributors', this.datasetInfo)
    },
  },

  async setup() {
    const config = useRuntimeConfig()
    const { $algoliaClient } = useNuxtApp()
    const algoliaIndex = await $algoliaClient.initIndex(config.public.ALGOLIA_INDEX)

    const allFacetsData = await getAlgoliaFacets(algoliaIndex, facetPropPathMapping).then( data => {
      return data
    })
    return {
      allFacetsData
    }
  },
  methods: {
    getProjectLink: function(associatedProject) {
      const sys = propOr(null, 'sys', associatedProject)
      const entryId = propOr(null, 'id', sys)
      return entryId != null ? `/about/projects/${entryId}` : ''
    },
    getProjectTitle: function(associatedProject) {
      const fields = propOr(null, 'fields', associatedProject)
      const title = propOr(null, 'title', fields)
      return title ?? ''
    },
    getFacetId(datasetFacet) {
      const key = datasetFacet.facetPropPath;
      const label = datasetFacet.label;
      if (this.allFacetsData == []) {
        return
      }
      let category = this.allFacetsData.find(facet => facet.key === key)
      if (category === undefined) {
        // check heirarchal facets
        this.allFacetsData.forEach(facet => {
          let foundCategory = false
          facet.children.forEach(child => {
            if (child.children.length > 0) {
              child.children.forEach(nestedChild => {
                if (nestedChild.facetPropPath === key && nestedChild.label === label) {
                  category = child
                  foundCategory = true
                  return
                }
              })
              if (foundCategory) {
                return
              }
            }
          })
          if (foundCategory) {
            return
          }
        })
        if (category === undefined) {
          return
        }
      }
      const correspondingFacet = category.children.find(child => child.label === label)
      if (correspondingFacet == undefined) {
        return
      }
      return correspondingFacet.id
    },
    getSelectedFacetLink(facetId) {
      const pageName = getPageTypeName(this.datasetTypeName)
      return `/data?type=${pageName}&selectedFacetIds=${facetId}`
    },
    getSelectedContributorLink(contributor) {
      const name = this.getContributorFullName(contributor)
      const pageName = getPageTypeName(this.datasetTypeName)
      return `/data?type=${pageName}&search=${name}`
    },
    heirarchalFacetLabel(label) {
      const labels = label.split('.')
      return `${labels[0]} > ${labels[1]}`
    },
    showFacet(facet) {
      if (facet.label === EXPERIMENTAL_APPROACH_LABEL && !this.showExperimentalApproachFacet) {
        return false
      }
      if (facet.key === 'anatomy.organ.name') {
        return false
      }
      return true
    },
    getContributorFullName: function(contributor) {
      const firstName = propOr('', 'firstName', contributor)
      const lastName = propOr('', 'lastName', contributor)
      return `${firstName} ${lastName}`
    },
  }
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.similar-datasets-container {
  border: 1px solid $lineColor1;
  background: white;
  a {
    color: $purple;
  }
}
hr {
  border-top: none;
}
.header {
  font-weight: 500;
}

.header-content {
  display: flex;
  align-items: center;
}

.help-icon {
  color: $purple;
  height: 1.5rem;
  width: 1.5rem;
}

.facet-button {
  display: block !important;
  border-radius: 15px;
  max-width: fit-content;
  background-color: #f9f2fc;
  color: $purple !important;
  border: 1px solid $purple;
  cursor: pointer;
  a {
    color: $purple !important;
    text-decoration: none !important;
  }
}

.facet-button-container {
  max-width: fit-content;
  :hover {
    text-decoration: none !important;
  }
}

.capitalize {
  text-transform: uppercase;
}

.contributor-list {
  list-style-type: disc;
  padding-left: 18px;
  margin: 0;
}

.facet-label {
  display: contents;
}

.tooltip-item {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inherit;
}
.parent-facet .child-facet:first-of-type::after {
  content: url('../../static/images/child-parent-relationship.png');
  display: block;
  height: 0;
  position: relative;
  top: -1.8rem;
}

:deep(.child-facet > span) {
  display: block;
}
</style>
