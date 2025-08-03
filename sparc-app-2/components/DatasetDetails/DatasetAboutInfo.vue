<template>
  <div class="dataset-about-info">
    <div class="heading2 mb-8">
      About this dataset
    </div>
    <div class="mb-16"><span class="label4">Title: </span>{{datasetTitle}}</div>
    <div class="mb-16"><span class="label4">First Published: </span>{{firstPublishedDate}}</div>
    <div class="mb-16"><span class="label4">Last Published: </span>{{latestVersionDate}}</div>
    <hr />
    <div class="about-section-container">
      <span class="author-section-name-column label4">Contact Author: </span>
      <span>
        <div>{{datasetOwnerName}}</div>
        <div>
          <a
            :href="`mailto:${datasetOwnerEmail}`"
          >
            {{ datasetOwnerEmail }}
          </a>
        </div>
      </span>
    </div>
    <hr />
    <div class="mb-16">
      <span class="label4">
        Award(s): 
      </span>
      <span v-if="(associatedProjects == null || associatedProjects.length < 1) && (externalProjectAwards == null || externalProjectAwards.length < 1)">None specified</span>
      <template v-else>
        <span v-for="(project, index) in associatedProjects" :key="index">
          <span v-for="(award, index) in getAwards(project)" :key="award.title">
            {{award.agency?.name}}
            <nuxt-link :to="getProjectLink(project)">
               {{ award.identifier }}<span v-if="index < getAwards(project).length - 1">, </span>
            </nuxt-link>
          </span>
          <span v-if="index < associatedProjects.length - 1 || externalProjectAwards.length > 0">, </span>
        </span>
        <span v-for="(award, index) in externalProjectAwards" :key="index">
          {{  getAwardAgency(award) }} {{ getAwardId(award) }}
          <span v-if="index < externalProjectAwards.length - 1">, </span>
        </span>
      </template>
    </div>
    <div class="mb-16">
      <span class="label4">
        Funding Program(s): 
      </span>
      <span v-if="associatedProjects == null || associatedProjects.length < 1">None specified</span>
      <span v-else v-for="(project, index) in associatedProjects" :key="index">
        {{ getFundingProgram(project) }}
        <span v-if="index < associatedProjects.length - 1">, </span>
      </span>
    </div>
    <hr />
    <div class="mb-16">
      <span class="label4">
        Associated project(s): 
      </span>
      <span v-if="associatedProjects == null || associatedProjects.length < 1">None specified</span>
      <span v-else v-for="(project, index) in associatedProjects" :key="index">
        <nuxt-link :to="getProjectLink(project)">
        {{ getProjectTitle(project) }}
        </nuxt-link>
        <span v-if="index < associatedProjects.length - 1">, </span>
      </span>
    </div>
    <div class="mb-16">
      <span class="label4">
        Institution(s): 
      </span>
      <span v-if="associatedProjects == null || associatedProjects.length < 1">None specified</span>
      <span v-else v-for="(project, index) in associatedProjects" :key="index">
        {{ getProjectInstitution(project) }}<span v-if="index < associatedProjects.length - 1">, </span>
      </span>
    </div>
    <hr />
    <h2 class="heading2 mb-8">
      About this version
    </h2>
    <div class="mb-16"><span class="label4">{{versionRevisionText}}: </span>Publication date: {{publicationDate}} (Last updated: {{lastPublishedDate}})</div>
    <div class="mb-16"><span class="label4">Dataset DOI: </span>
      <a
          :href="doiLink"
      >
        {{ doiLink }}
      </a>
    </div>
  </div>
</template>

<script>
import { pathOr, propOr } from 'ramda'
import { mapState } from 'pinia'
import { useMainStore } from '../../store'

import DateUtils from '@/mixins/format-date'

export default {
  name: 'DatasetAboutInfo',

  components: {
  },
  props: {
    latestVersionRevision: {
      type: String,
      default: ''
    },
    latestVersionDate: {
      type: String,
      default: ''
    },
    associatedProjects: {
      type: Array,
      default: () => []
    },
    awards: {
      type: Array,
      default: () => []
    }
  },

  mixins: [DateUtils],

  methods: {
    /**
     * Construct the project link
     * @returns {String}
     */
     getProjectLink: function(associatedProject) {
      const sys = propOr(null, 'sys', associatedProject)
      const entryId = propOr(null, 'id', sys)
      return entryId != null ? `/about/projects/${entryId}` : ''
    },
    /**
     * Construct the sparc award number
     * @returns {String}
     */
    getAwards: function (associatedProject) {
      const awardNumbers = pathOr([], ['fields', 'awards'], associatedProject).map(award => award.fields.title)
      return this.awards.filter(award => awardNumbers.includes(award.identifier))
    },
    getAwardAgency: function(award) {
      return pathOr('', ['agency', 'name'], award)
    },
    getAwardId: function(award) {
      return propOr('', 'identifier', award)
    },
    /**
     * Get the funding program name
     * @returns {String}
     */
     getFundingProgram: function(associatedProject) {
      const program = pathOr(null, ['fields','program'], associatedProject)
      return program.length > 0 ? program[0] : 'N/A'
    },
    /**
     * Construct the project title
     * @returns {String}
     */
    getProjectTitle: function(associatedProject) {
      const fields = propOr(null, 'fields', associatedProject)
      const title = propOr(null, 'title', fields)
      return title ?? 'N/A'
    },
    /**
     * Compute the project institution
     * @returns {String}
     */
    getProjectInstitution: function(associatedProject) {
      const fields = propOr(null, 'fields', associatedProject)
      const institution = propOr(null, 'institution', fields)
      const institutionFields = propOr(null, 'fields', institution)
      const institutionName = propOr(null, 'name', institutionFields)
      return institutionName ?? 'N/A'
    },
  },

  computed: {
    ...mapState(useMainStore, ['datasetInfo']),
    /**
     * Returns the dataset title
     * @returns {String}
     */
    datasetTitle: function() {
      return propOr('', 'name', this.datasetInfo)
    },
    /**
     * Get formatted originally published date
     * @return {String}
     */
    firstPublishedDate: function() {
      const date = propOr('', 'firstPublishedAt', this.datasetInfo)
      return this.formatDate(date)
    },
    /**
     * Get formatted last updated date
     * @return {String}
     */
    lastPublishedDate: function() {
      const date =
        this.datasetInfo.revisedAt || this.datasetInfo.versionPublishedAt
      return this.formatDate(date)
    },
    /**
     * Get formatted publication date
     * @return {String}
     */
    publicationDate: function() {
      const date = this.datasetInfo.versionPublishedAt
      return this.formatDate(date)
    },
    /**
     * Returns dataset owner full name
     * @returns {String}
     */
    datasetOwnerName: function() {
      const ownerFirstName = this.datasetInfo.ownerFirstName || ''
      const ownerLastName = this.datasetInfo.ownerLastName || ''
      return `${ownerFirstName} ${ownerLastName}`
    },

    /**
     * Returns dataset owner email
     * @returns {String}
     */
    datasetOwnerEmail: function() {
      return this.datasetInfo.ownerEmail || ''
    },
    /**
     * Return DOI link
     * @returns {String}
     */
    doiLink: function() {
      const doi = propOr('', 'doi', this.datasetInfo)
      return doi ? `https://doi.org/${doi}` : ''
    },
    /**
     * computes the right text based on the version and revision
     * @returns {String}
     */
    versionRevisionText() {
      let revision = this.datasetInfo.revision ? this.datasetInfo.revision : '0'
      return `Version ${this.datasetInfo.version} Revision ${revision}`
    },
    externalProjectAwards() {
      if (this.associatedProjects == null || this.associatedProjects.length < 0) {
        return this.awards
      }
      return this.awards.filter(award => {
        const awardId = propOr('', 'identifier', award)
        return !this.associatedProjects.some(project => pathOr(null, ['fields', 'awardId'], project) == awardId)
      })
    }
  },
}
</script>

<style lang="scss" scoped>
.dataset-about-info {
  hr {
    margin-top: 1rem;
    border-top: none;
  }
  a {
    text-decoration: underline;
  }
  .about-section-container {
    display: flex;
    @media (max-width: 48em) {
      flex-direction: column;
    }
    .author-section-name-column {
      min-width: 7.25rem;
    }
  }
}
</style>
