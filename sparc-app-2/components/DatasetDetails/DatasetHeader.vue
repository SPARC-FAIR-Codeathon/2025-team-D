<template>
  <client-only>
    <div class="details-header-container mt-16 py-16 px-24">
      <el-row>
        <el-col :sm="16" :md="18" :lg="19" :xl="20">
          <h1 class="heading2 mt-0">
            {{ title }}
          </h1>
          <div class="dataset-owners">
            <span class="label4">Contributors:&nbsp;</span>
            <div
              v-for="(contributor, idx) in contributors"
              :key="contributor.id"
              class="contributor-item-wrap mr-4"
            >
              <contributor-item :contributor="contributor" />
              <template v-if="idx < contributors.length - 1">
                ,
              </template>
            </div>
          </div>
          <hr />
          <div>
            <span class="label4">Description: </span>{{ formatDescription(description) }}
          </div>
        </el-col>
        <el-col :sm="8" :md="6" :lg="5" :xl="4">
          <dataset-information-box 
            :latest-version-revision="latestVersionRevision"
            :latest-version-date="latestVersionDate"
          />
        </el-col>
        <el-col>
          <hr />
          <div v-if="showPrimaryPublications">
            <div class="publications-container">
              <span class="primary-publications-title-column">
                <span class="label4">Primary Publication(s): </span>
              </span>
              <span>
                <div v-for="(item, index) in primaryPublications" :key="index" class="primary-publications-list-item">
                  <apa-citation @doi-invalid="onDoiInvalid" class="mb-8" :doi="item.doi" :can-copy-citation="false" />
                </div>
              </span>
            </div>
            <hr />
          </div>
          <div class="header-stats-block">
            <div>
              <span class="label4">
                Usage Rights: 
              </span>
              <span>
                <template v-if="license">
                  <client-only><sparc-tooltip
                    placement="left-center"
                    :content="licenseName"
                  >
                    <template #item>
                      <a class="link1" :href="licenseLink" target="_blank">
                        {{ license }}
                      </a>
                    </template>
                  </sparc-tooltip></client-only>
                </template>
                <template v-else>
                  No License Selected
                </template>
              </span>
            </div>
            <div class="metics-container">
              <span class="label4 mr-32">Citations: <span @click="onMetricClicked" class="link">{{numCitations}}</span></span>
              <span class="label4">Downloads: <span @click="onMetricClicked" class="link">{{numDownloads}}</span></span>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </client-only>
</template>

<script>
import { mapState } from 'pinia'
import { useMainStore } from '../../store'
import { propOr } from 'ramda'
import DoiChecker from '@/mixins/doi-checker'
import ApaCitation from '@/components/DatasetCitations/ApaCitation.vue'
import ContributorItem from '@/components/ContributorItem/ContributorItem.vue'
import DatasetInformationBox from '@/components/DatasetDetails/DatasetInformationBox.vue'
import { getLicenseLink, getLicenseAbbr } from '@/static/js/license-util'

export default {
  name: 'DatasetHeader',

  components: {
    ContributorItem,
    DatasetInformationBox,
    ApaCitation,
  },

  mixins: [DoiChecker],

  props: {
    latestVersionRevision: {
      type: String,
      default: ''
    },
    latestVersionDate: {
      type: String,
      default: ''
    },
    numCitations: {
      type: Number,
      default: 0
    },
    numDownloads: {
      type: Number,
      default: 0
    }
  },

  computed: {
    /**
     * Get dataset info from the store
     * @returns {Object}
     */
    ...mapState(useMainStore, ['datasetInfo']),
    /**
     * Gets license link
     * @returns {String}
     */
    licenseLink: function() {
      return getLicenseLink(this.license)
    },
    /**
     * Returns the list of contributors who contributed to the dataset
     * @returns {String}
     */
    contributors: function() {
      return propOr([], 'contributors', this.datasetInfo)
    },
    /**
     * Compute description
     * @returns {String}
     */
    description: function() {
      return propOr('', 'description', this.datasetInfo)
    },
    /**
     * Returns list of external publications for dataset
     * @returns {Array}
     */
    externalPublications: function() {
      return propOr([], 'externalPublications', this.datasetInfo)
    },
    /**
     * Returns the dataset title
     * @returns {String}
     */
    title: function() {
      return propOr('', 'name', this.datasetInfo)
    },
    /**
     * Returns the license abbr associated with the dataset
     * @returns {String}
     */
    license: function() {
      const licenseKey = this.licenseName
      return getLicenseAbbr(licenseKey)
    },
    embargoed: function() {
      return propOr(false, 'embargo', this.datasetInfo)
    },
    /**
     * Returns the license name associated with the dataset
     * @returns {String}
     */
    licenseName: function() {
      return propOr('', 'license', this.datasetInfo)
    },
    primaryPublications: function() {
      const valObj = this.externalPublications.filter(function(elem) {
        return elem.relationshipType == 'IsDescribedBy'
      })
      return valObj.length > 0 ? valObj : null
    },
    showCitations: function() {
      return !this.embargoed && this.numCitations !== 0
    },
  },

  methods: {
    /**
     * Formats description based on length for regular viewports
     * @param {String} description
     */
    formatDescription: function(description) {
      return description.length > 540
        ? description.substring(0, 540) + '...'
        : description
    },
    /**
     * Get the dataset details tab area by id
     * @returns {Object}
     */
    getDatasetDetailsTabArea: function() {
      return document.getElementById('datasetDetailsTabsContainer')
    },
    /**
     * scroll to the dataset details tab area
     */
    scrollToDatasetDetailsTabArea: function() {
      this.getDatasetDetailsTabArea().scrollIntoView()
    },
    onMetricClicked: function () {
      this.$router.replace({
        query: { ...this.$route.query, datasetDetailsTab: 'metrics' }
      }).finally(() => {
        this.scrollToDatasetDetailsTabArea()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.details-header-container {
  display: flex;
  flex-direction: row;
  border: solid 1px $lineColor1;
  background: white;
  .el-row {
    width: 100%;
  }
  :deep(.publications-container) {
    display: flex;
    a {
      color: $purple;
    }
    @media (max-width: 48em) {
      flex-direction: column;
    }
    .primary-publications-title-column {
      min-width: 10.25rem;
    }
    .primary-publications-list-item:not(:last-child) {
      margin-bottom: .5rem;
    }
  }
  .header-stats-block {
    align-items: center;
    justify-content: space-between;
    display: flex;
  }
  hr {
    border-top: none;
    margin-top: 1rem;
  }
  .dataset-owners {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    .contributor-item-wrap {
      display: inline-flex;
    }
  }
  .citations-link {
    cursor: pointer;
  }
  h1 {
    margin: 0 0 1rem;
  }
}
.link {
  color: $purple;
  cursor: pointer;
}
</style>
