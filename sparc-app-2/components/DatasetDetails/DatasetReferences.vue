<template>
  <div class="dataset-references">
    <div v-if="showPrimaryPublications">
      <div class="heading2 mb-8">
        Primary Publications for this Dataset
      </div>
      <div v-for="(item, index) in primaryPublicationsDisplay" :key="index">
        <apa-citation @doi-invalid="onDoiInvalid" class="mb-8" :doi="item.doi" />
      </div>
      <hr v-if="associatedPublications" />
    </div>
    <div v-if="showAssociatedPublications">
      <div class="heading2 mb-8">
        Associated Protocols for this Dataset
      </div>
      <div v-for="(item, index) in associatedPublicationsDisplay" :key="index">
        <apa-citation @doi-invalid="onDoiInvalid" class="mb-8" :doi="item.doi" />
      </div>
      <hr v-if="citingPublications" />
    </div>
    <div v-if="showCitingPublications">
      <div class="heading2 mb-8">
        Publications That Cite This Dataset
      </div>
      <div v-for="(item, index) in this.citingPublicationsWithHtml" 
          :key="index"
          :class="[
            'citation-container',
            'py-16',
            'pl-16',
            'pr-24',
            index !== citingPublicationsWithHtml.length - 1 ? 'mb-16' : ''
          ]"
      >
        <button class="copy-button" @click="handleCitationCopy(item.citation)">
          <img src="../../static/images/copyIcon.png" />
        </button>
        <div v-html="item.citationHtml" />
      </div>
      <hr v-if="preprints" />
    </div>
    <div v-if="showPreprints">
      <div class="heading2 mb-8">
        Preprints
      </div>
      <div v-for="(item, index) in preprints" :key="index">
        <apa-citation @doi-invalid="onDoiInvalid" class="mb-8" :doi="item.doi" />
      </div>
    </div>
  </div>
</template>

<script>

import DoiChecker from '@/mixins/doi-checker'
import ApaCitation from '@/components/DatasetCitations/ApaCitation'
import { isEmpty } from 'ramda'

const PREPRINT_DOI_LINKS = ['https://doi.org/10.1101/']

export default {
  name: 'DatasetReferences',
  components: {
    ApaCitation
  },
  mixins: [DoiChecker],
  props: {
    primaryPublications: {
      type: Array,
      default: () => []
    },
    associatedPublications: {
      type: Array,
      default: () => []
    },
    citingPublications: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      primaryPublicationsDisplay: [],
      associatedPublicationsDisplay: []
    }
  },
  methods: {
    addPublicationsForDisplay: function(original, display) {
      if (original) {
        const total = original.length
        const current = display.length
        if (total > current) {
          display.push(original[current])
          if (original.length === display.length) return
          setTimeout(() => {
            this.addPublicationsForDisplay(original, display)
          }, 1000)
        }
      }
    },
    updatePrimaryPublicationsDisplay: function() {
      this.primaryPublicationsDisplay.length = 0
      this.addPublicationsForDisplay(this.primaryPublications,
        this.primaryPublicationsDisplay)
    },
    updateAssociatedPublicationsDisplay: function() {
      this.associatedPublicationsDisplay.length = 0
      this.addPublicationsForDisplay(this.associatedPublications,
        this.associatedPublicationsDisplay)
    },
    handleCitationCopy: function(text) {
      navigator.clipboard.writeText(text).then(() => {
        successMessage(
          `Successfully copied citation.`
        )
      }),
        () => {
          failMessage('Failed to copy citation.')
        }
    },
  },
  watch: {
    primaryPublications: {
      handler: function () {
        this.updatePrimaryPublicationsDisplay()
      },
      immediate: false
    },
    associatedPublications: {
      handler: function () {
        this.updateAssociatedPublicationsDisplay()
      },
      immediate: false
    }
  },
  computed: {
    preprints: function() {
      let preprintPublications = []
      let allPublications = this.primaryPublications ? this.primaryPublications : []
      allPublications = this.associatedPublications ? allPublications.concat(this.associatedPublications) : allPublications
      allPublications.forEach(publication => {
        const publicationDoiLink = `https://doi.org/${publication.doi}`
        if(PREPRINT_DOI_LINKS.some(preprintDoiLink => publicationDoiLink.includes(preprintDoiLink))){
          preprintPublications.push(publication)
        }
      })
      return isEmpty(preprintPublications) ? undefined : preprintPublications
    },
    citingPublicationsWithHtml: function () {
      return this.citingPublications.map(publication => {
        const updatedCitation = publication.citation.replace(/https:\/\/[^\s]+/g, url => `<a href="${url}" target="_blank">${url}</a>`)
        return { ...publication, citationHtml: updatedCitation }
      })
    }
  },
  mounted: function() {
    //Add a timeout at the beginnering as well as there is a chance
    //other part of the dataset page are accessing api from the same domain
    setTimeout(() => {
      this.updatePrimaryPublicationsDisplay()
    }, 500)
    setTimeout(() => {
      this.updateAssociatedPublicationsDisplay()
    }, 1000)
  }
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';

.dataset-references {
  hr {
    margin-top: 1rem;
    border-top: none;
  }
}
.citation-container {
  background-color: $background;
    position: relative;
    .copy-button {
      border: none;
      background: transparent;
      cursor: pointer;
      position: absolute;
      right: 0;
      top: .25rem;
      img {
        width: 20px;
        height: 20px;
      }
    }
}
</style>
