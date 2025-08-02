<template>
  <div v-loading="loadingMarkdown" class="dataset-description-info">
    <div
      class="description-container"
      v-html="parseMarkdown(markdown.markdownTop)"
    />
    <div
      v-if="markdown.markdownBottom"
      class="description-container"
      v-html="parseMarkdown(markdown.markdownBottom)"
    />
    <hr>
    <div class="heading2 mb-8">
      Metadata
    </div>
    <template v-if="isDevice">
      <p class="mb-8"><strong>Intended Use: </strong>{{ intendedUseText }}</p>
      <p class="mb-8"><strong>Current Use: </strong>{{ currentUse }}</p>
      <p class="mb-8"><strong>Device Type: </strong>{{ deviceType }}</p>
      <p class="mb-8"><strong>Application: </strong>{{ deviceApplication }}</p>
      <p class="mb-8"><strong>Device Target (disease or disorder): </strong> {{ deviceTarget }}</p>
      <p class="mb-8"><strong>Target Population: </strong></p>
    </template>
    <template v-else>
      <p class="mb-8"><strong>Experimental Design: </strong></p>
      <div class="experimental-design-container mb-8">
        <span class="experimental-design-section-text-column"><strong>Protocol Links: </strong></span>
        <span v-if="datasetRecords.length !== 0">
          <div v-for="record in datasetRecords" :key="record.id">
            <a
              class="link2"
              :href="record.url"
              target="_blank"
            >
              {{ record.url }}
            </a>
          </div> 
        </span>
        <span
          v-else
        >
          N/A
        </span>
      </div>
      <div class="experimental-design-container mb-16">
        <span><strong>Experimental Approach: </strong>{{experimentalApproachText}}</span>
      </div>
      <p class="mb-8"><strong>Subject Information: </strong></p>
    </template>
    <div class="experimental-design-container mb-8">
      <span><strong>Anatomical Structure: </strong>{{anatomicalStructureText}}</span>
    </div>
    <div class="experimental-design-container mb-8">
      <span><strong>Species: </strong>{{speciesText}}</span>
    </div>
    <div class="experimental-design-container mb-8">
      <span><strong>Sex: </strong>{{sexText}}</span>
    </div>
    <div class="experimental-design-container mb-8">
      <span><strong>Age Range: </strong>{{ageRangeText}}</span>
    </div>
    <div v-if="!isDevice" class="experimental-design-container mb-16">
      <span><strong>Number of Samples: </strong>{{samplesMetadataText}}</span>
    </div>
    <div class="mb-16" v-if="sdsVersion != undefined">
      <span>
        <strong>SDS Version: 
        </strong>{{sdsVersion}}
        <sparc-tooltip
          placement="left-center"
        >
        <template #item>
          <svgo-icon-help class="help-icon"/>
        </template>
          <template #data>
            The version of the <a href="https://docs.sparc.science/docs/sparc-dataset-structure">SPARC Dataset Structure</a> used when publishing this dataset.
          </template>
        </sparc-tooltip>
      </span>
    </div>
    <div class="mb-16">
      <sparc-tooltip
        v-if="datasetInfo.embargo"
        placement="left-center"
      >
        <template #data>
          <div v-if="embargoed && embargoAccess !== EMBARGO_ACCESS.GRANTED">
            This dataset is currently <a href="https://docs.sparc.science/docs/embargoed-data" target="_blank">embargoed</a>.<br />SPARC datasets are subject to a 1-year<br />embargo during which time the datasets<br />are visible only to members of the<br />SPARC consortium. During embargo, the<br />public will be able to view basic<br />metadata about these datasets as well<br />as their release date.
          </div>
        </template>
        
        <template #item>
          <el-button
            class="secondary"
            
            :disabled="embargoed && embargoAccess !== EMBARGO_ACCESS.GRANTED"
            @click.prevent="
              downloadItem({
                url: downloadMetadataUrl,
                label: 'metadata.json',
              })
          "
          >
            Download Metadata File
          </el-button>
        </template>
      </sparc-tooltip>
      <a
        v-else
        :href="downloadMetadataUrl"
        @click.prevent="
          downloadItem({
            url: downloadMetadataUrl,
            label: 'metadata.json',
          })
        "
      >
        <el-button class="secondary">Download Metadata file</el-button>
      </a>
    </div>
    <hr>
    <span><strong>Keywords: </strong></span>
    <span v-if="datasetTags.length !== 0">
      <span class="keywords" v-for="(item, index) in datasetTags" :key="index">
        <p v-if="index !== datasetTags.length - 1">{{item}},&nbsp;</p>
        <p v-else>{{item}}</p>
      </span>
    </span>
    <span v-else>
      <p>N/A</p>
    </span>
  </div>
</template>

<script>
import marked from '@/mixins/marked/index'
import { mapState } from 'pinia'
import { useMainStore } from '../../store'
import { propOr } from 'ramda'
import _ from 'lodash'
import axios from 'axios'
import { EMBARGO_ACCESS } from '@/utils/constants'

export default {
  name: 'DatasetDescriptionInfo',

  mixins: [marked],

  data() {
    return {
      datasetMetadataInfo: {}
    }
  },

  props: {
    loadingMarkdown: {
      type: Boolean,
      default: false
    },
    markdown: {
      type: Object,
      default: () => {}
    },
    datasetRecords: {
      type: Array,
      default: () => []
    },
    datasetTags: {
      type: Array,
      default: () => []
    },
  },

  computed: {
    ...mapState(useMainStore, ['datasetFacetsData', 'datasetTypeName', 'datasetInfo', 'userToken']),
    EMBARGO_ACCESS() {
      return EMBARGO_ACCESS
    },
    embargoAccess() {
      return propOr(null, 'embargoAccess', this.datasetInfo)
    },
    embargoed: function() {
      return propOr(false, 'embargo', this.datasetInfo)
    },
    anatomicalStructureText: function() {
      return this.getFacetText('anatomy.organ.name')
    },
    experimentalApproachText: function() {
      return this.getFacetText('item.modalities.keyword')
    },
    speciesText: function() {
      return this.getFacetText('organisms.primary.species.name')
    },
    sexText: function() {
      return this.getFacetText('attributes.subject.sex.value')
    },
    ageRangeText: function() {
      return this.getFacetText('attributes.subject.ageCategory.value')
    },
    numberSamples: function() {
      return _.get(this.datasetMetadataInfo.item, 'statistics.samples.count')
    },
    numberSubjects: function() {
      return _.get(this.datasetMetadataInfo.item, 'statistics.subjects.count')
    },
    samplesMetadataText: function() {
      if (this.numberSamples && this.numberSubjects)
      {
        return `${this.numberSamples} samples from ${this.numberSubjects} subjects`
      }
      return 'N/A'
    },
    intendedUseText() {
      let intendedUse = _.get(this.datasetMetadataInfo, 'device.intendedUse[0].name', 'N/A')
      if (intendedUse.length > 0)
        intendedUse = intendedUse.charAt(0).toUpperCase() + intendedUse.slice(1)
      return intendedUse
    },
    currentUse() {
      let currentUse = _.get(this.datasetMetadataInfo, 'device.currentUse[0].name', 'N/A')
      if (currentUse.length > 0)
        currentUse = currentUse.charAt(0).toUpperCase() + currentUse.slice(1)
      return currentUse
    },
    deviceType() {
      let deviceType = _.get(this.datasetMetadataInfo, 'device.type[0].name', 'N/A')
      if (deviceType.length > 0)
        deviceType = deviceType.charAt(0).toUpperCase() + deviceType.slice(1)
      return deviceType
    },
    deviceApplication() {
      let deviceApplication = _.get(this.datasetMetadataInfo, 'device.application[0].description', 'N/A')
      if (deviceApplication.length > 0)
        deviceApplication = deviceApplication.charAt(0).toUpperCase() + deviceApplication.slice(1)
      return deviceApplication
    },
    deviceTarget() {
      let deviceTarget = _.get(this.datasetMetadataInfo, 'device.target[0].name', 'N/A')
      if (deviceTarget.length > 0)
        deviceTarget = deviceTarget.charAt(0).toUpperCase() + deviceTarget.slice(1)
      return deviceTarget
    },
    /**
     * Gets dataset id
     * @returns {Number}
     */
    datasetId: function() {
      return propOr(0, 'id', this.datasetInfo)
    },
    /**
     * Gets dataset version
     * @returns {Number}
     */
    versionId: function() {
      return propOr(0, 'version', this.datasetInfo)
    },
    sdsVersion: function () {
      return _.get(this.datasetMetadataInfo.item, 'sds_version')
    },
    /**
     * Computes the API url for downloading the metadata of a dataset
     * @returns {String}
     */
    downloadMetadataUrl: function() {
      var url = `${this.$config.public.discover_api_host}/datasets/${this.datasetId}/versions/${this.versionId}/metadata`
      if (this.userToken) {
        url += `?api_key=${this.userToken}`
      }
      return url
    },
    isDevice() {
      return this.datasetTypeName == 'device'
    }
  },

  created() {
    const objectId = this.datasetInfo.id
    try {
      this.$algoliaClient.initIndex(this.$config.public.ALGOLIA_INDEX).getObject(objectId).then(response => {
        this.datasetMetadataInfo = response
      })
    } catch (error) {

    }
  },

  methods: {
    getFacetText(facetKey) {
      let text = ''
      const facet = this.datasetFacetsData.find(item => item.key === facetKey)
      if (facet === undefined || !facet.children)
      {
        return 'N/A'
      }
      facet.children.forEach(child => {
        let childLabel = child.label.charAt(0).toUpperCase() + child.label.slice(1)
        text += `${childLabel}, `
      })
      return text.substring(0, text.length-2);
    },
    downloadItem({ url, label }) {
      axios.get(url, { responseType: "blob" }).then(response => {
        const blob = new Blob([response.data], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = label;
        link.click();
        URL.revokeObjectURL(link.href);
      })
    },
  }
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';

.dataset-description-info {
  overflow-wrap: anywhere;
  word-wrap: normal;
  :deep(hr){
    margin-top: 1rem;
    border-top: none;
  }
  :deep(p:first-of-type) {
    margin-top: 0;
  }
  .keywords {
    p {
      display: inline-block;
      margin: 0;
    }
    p:first-letter {
      text-transform: uppercase;
    }
  }

  .experimental-design-container {
    padding-left: 2rem;
    display: flex;
    a {
      text-decoration: underline;
    }
    @media (max-width: 48em) {
      flex-direction: column;
    }
    .experimental-design-section-text-column {
      min-width: 6.75rem;
    }
  }
  .help-icon {
    color: $purple;
    height: 1.5rem;
    width: 1.5rem;
  }
}
</style>
