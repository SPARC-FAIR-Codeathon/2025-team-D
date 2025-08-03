<template>
  <div class="version-history-container">
    <large-modal
      :visible="dialogVisible"
      @close-download-dialog="dialogVisible = false"
    >
      <template #optionalContent>
        <div class="content">
          <h1>Download</h1>
          <p>Download changelog file for Version {{changeLogFileInfo.version}} </p>
          <p>Published on: {{logPublishedAt}}</p>
          <el-button
            class="download-button"
            @click="downloadChangeLogFile(changeLogFileInfo.version)"
          >
            Download
          </el-button>
        </div>
      </template>
      <template #mainContent>
        <div class="content">
          <h1>Changelog for Version {{changeLogFileInfo.version}}</h1>
          <div v-html="parseMarkdown(markdown)" />
          <el-button class="secondary" @click="dialogVisible = false">
            Close
          </el-button>
        </div>
      </template>
    </large-modal>
    <div class="heading2 mb-8">
      Versions for this Dataset
    </div>
    <div class="mb-8">
      <span class="label4">Current version: </span
      >{{ latestVersionRevisionText }}
    </div>
    <div class="mb-8">
      <span class="label4">Original version: </span
      >{{ originalVersionRevisionText }}
    </div>
    <div class="mb-16">
      A dataset version refers to a DOI-specific, version-controlled iteration
      of a dataset. A new version of a dataset must be released when there are
      any changes to the files or scientific metadata made within a dataset. A
      dataset revision refers to an update made to dataset metadata (i.e. title,
      subtitle, description, etc.) that does not require an updated DOI.
    </div>
    <div class="version-table">
      <el-row class="table-header py-12" type="flex" justify="center">
        <el-col :span="4" :pull="1">
          Version
        </el-col>
        <el-col :span="4">
          Revisions
        </el-col>
        <el-col :span="4">
          Date
        </el-col>
        <el-col :span="4">
          Changelog
        </el-col>
        <el-col :span="4" :push="1">
          DOI
        </el-col>
      </el-row>
      <el-row
        v-for="version in versions"
        :key="version.doi"
        class="table-rows py-12"
        type="flex"
        justify="center"
      >
        <el-col :span="4" :pull="1">
          Version {{ version.version }}
        </el-col>
        <el-col :span="4">
          Revision {{ version.revision ? version.revision : '0' }}
        </el-col>
        <el-col :span="4">
          {{ formatDate(getVersionRevisionDate(version)) }}
        </el-col>
        <el-col v-if="isChangelogAvailable(version.version)" :span="4">
          <div class="circle" @click="viewChangeLogFile(version)">
            <sparc-tooltip placement="bottom-center" content="View changelog">
              <template #item>
                <svgo-icon-view
                  class="changelog-icon"
                />
              </template>
            </sparc-tooltip>
          </div>
          <div class="circle" @click="downloadChangeLogFile(version.version)">
            <sparc-tooltip
              placement="bottom-center"
              content="Download changelog file"
            >
              <template #item>
                <svgo-icon-download
                  class="changelog-icon"
                />
              </template>
            </sparc-tooltip>
          </div>
        </el-col>
        <el-col v-else :span="4">
          Not available
        </el-col>
        <el-col :span="4" :push="1">
          <a :href="getDoiLink(version.doi)">
            <u>{{ version.doi }}</u>
          </a>
        </el-col>
      </el-row>
    </div>
    <div v-if="embargoed" class="label2">
      <em
        >NOTE: If dataset is currently embargoed, you may view the metadata
        pertaining to the dataset and request that access be permitted.</em
      >
    </div>
  </div>
</template>

<script>
import { mapState } from 'pinia'
import { useMainStore } from '../../store'
import { propOr } from 'ramda'

import RequestDownloadFile from '@/mixins/request-download-file'
import FormatDate from '@/mixins/format-date'
import marked from '@/mixins/marked/index'

export default {
  name: 'VersionHistory',

  mixins: [FormatDate, RequestDownloadFile, marked],

  props: {
    versions: {
      type: Array,
      default: () => []
    },
  },
  data: function() {
    return {
      markdown: '',
      dialogVisible: false,
      changeLogFileInfo: {},
      changelogFiles: []
    }
  },
  async created() {
    const changelogFileRequests = []
    this.versions.forEach(({ version }) => {
      var changelogEndpoint = `${this.$config.public.discover_api_host}/datasets/${this.datasetId}/versions/${version}/files?path=changelog.md`
      changelogFileRequests.push(
        this.$pennsieveApiClient.value.get(changelogEndpoint).then(({ data }) => {
          return {
            ...data,
            version: version
          }
        }).catch(() => {
          return {}
        })
      )
    })

    this.changelogFiles = await Promise.all(changelogFileRequests)
  },
  computed: {
    /**
     * Get dataset info from the store
     * @returns {Object}
     */
    ...mapState(useMainStore, ['datasetInfo']),
    /**
     * Gets dataset id
     * @returns {Number}
     */
    datasetId: function() {
      return propOr(0, 'id', this.datasetInfo)
    },
    latestVersionRevisionText: function() {
      let version = this.versions[0].version
      let revision = this.versions[0].revision || '0'
      let latestDate =
        this.versions[0].revisedAt || this.versions[0].versionPublishedAt
      let date = this.formatDate(latestDate)
      return `Version ${version}, Revision ${revision}; ${date}`
    },
    originalVersionRevisionText: function() {
      const originalVersionPosition = this.versions.length - 1
      let date = this.formatDate(
        this.versions[originalVersionPosition].firstPublishedAt
      )
      return `Version 1, Revision 0; ${date}`
    },
    embargoed: function() {
      return propOr(false, 'embargo', this.datasetInfo)
    },
    logPublishedAt: function(){
      if (this.changeLogFileInfo.versionPublishedAt) {
        return this.formatDate(this.changeLogFileInfo.versionPublishedAt)
      }
      return ''
    },
  },
  methods: {
    getDoiLink(doi) {
      return doi ? `https://doi.org/${doi}` : ''
    },
    getVersionRevisionDate: function(version) {
      return version.revisedAt || version.versionPublishedAt
    },
    isChangelogAvailable: function(version) {
      return this.changelogFiles.some(file => file.version === version)
    },
    getChangelogFile(version) {
      return this.changelogFiles.find(file => file.version === version) || {}
    },
    viewChangeLogFile(versionInfo) {
      // Note that requestFileContent is a mixin
      const changelogFile = this.getChangelogFile(versionInfo.version)
      this.requestFileContent(changelogFile).then(content => {
        this.markdown = content
        this.dialogVisible = true
        this.changeLogFileInfo = versionInfo // Set the version metadata for the currently stored markdown
      })
    },
    downloadChangeLogFile(version) {
      this.requestDownloadFile(this.getChangelogFile(version))
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.version-history-container {
  min-width: 30rem;
  width: 100%;
  .version-table {
    font-size: 0.875rem;
    line-height: 1rem;
  }
  .table-header {
    background-color: $background;
    font-weight: 600;
  }

  .table-rows {
    color: #000000;
    a {
      text-decoration: underline;
    }
  }
  .changelog-file {
    cursor: pointer;
  }
  .circle {
    font-size: 1rem;
    display: inline-block;
    height: 1.5em;
    width: 1.5em;
    line-height: 1.5em;
    margin-right: 4px;
    -moz-border-radius: 0.75em; /* or 50% */
    border-radius: 0.75em; /* or 50% */
    background-color: $purple;
    color: #fff;
    cursor: pointer;
    writing-mode: vertical-rl;
    -webkit-writing-mode: vertical-rl;
    vertical-align: top;
  }
  .changelog-icon {
    height: 1.5rem;
    width: 1.5rem;
  }
}
</style>
