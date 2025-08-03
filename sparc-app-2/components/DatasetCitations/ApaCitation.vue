<template>
  <div v-if="isDoiValid">
    <div v-if="canCopyCitation" class="citation-container py-16 pl-16 pr-24" v-loading="citationLoading">
      <button class="copy-button" @click="handleCitationCopy">
        <img src="../../static/images/copyIcon.png" />
      </button>
      <div>
        {{authorCitations}} ({{year}}) {{title}}. 
        <em v-if="publisher.length > 0">{{publisher}}. </em>
        <a :href="url" target="_blank">{{url}}</a>
      </div>
    </div>
    <div v-else v-loading="citationLoading">
      {{authorCitations}} ({{year}}) {{title}}. 
      <em v-if="publisher.length > 0">{{publisher}}. </em>
      <a :href="url" target="_blank">{{url}}</a>
    </div>
  </div>
</template>

<script>
import { propOr } from 'ramda'
import { successMessage, failMessage } from '@/utils/notification-messages'

export default {
  name: 'ApaCitation',

  props : {
    doi: {
      type: String,
      default: '',
    },
    canCopyCitation: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      citationLoading: true,
      authors: [],
      title: "",
      publisher: "",
      year: 0,
      url: "",
      isDoiValid: true
    }
  },

  created() {
    this.getCitationInfo()
  },

  methods: {
    getAuthorLastName(author) {
      const familyName = propOr('', 'family', author)
      let lastNameStartIndex = familyName.lastIndexOf(" ")
      lastNameStartIndex = lastNameStartIndex === -1 ? 0 : lastNameStartIndex + 1
      let lastName = familyName.substring(lastNameStartIndex)
      return lastName.charAt(0).toUpperCase() + lastName.slice(1)
    },
    getAuthorFirstName(author) {
      let firstName = propOr('', 'given', author)
      return firstName.charAt(0).toUpperCase() + firstName.slice(1)
    },
    /**
     * Get the Title from doi.org
     */
    getCitationInfo() {
      this.citationLoading = true
      fetch(this.doiLink, {
        method: 'GET',
        headers: { Accept: 'application/json'}
      })
      .then(async response => {
        if (response.status == '404') {
          this.isDoiValid = false
          this.$emit('doi-invalid', this.doi)
        } else {
          const json = await response.json()
          this.title = json.title
          this.authors = json.author
          this.publisher = json["container-title"]
          this.year = json.published["date-parts"][0][0]
          this.url = json.URL
        }
      })
      .finally(() => {
        this.citationLoading = false
      })
    },
    /**
     * Handle copy citation to clipboard
     */
    handleCitationCopy: function() {
      navigator.clipboard.writeText(this.citationText).then(() => {
        successMessage(
          `Successfully copied citation.`
        )
      }),
        () => {
          failMessage('Failed to copy citation.')
        }
    },
  },

  computed: {
    doiLink() {
      if (this.doi === "") {
        return undefined
      }
      return `https://doi.org/${this.doi}`
    },
    authorCitations() {
      let authorCitationText = ""
      let num = 0
      if (this.authors) {
        if (this.authors.length == 1) {
          let author = this.authors[0]
          let lastName = this.getAuthorLastName(author)
          let firstName = this.getAuthorFirstName(author)
          authorCitationText = `${lastName}, ${firstName.charAt(0)}. `
        }
        else {
          this.authors.forEach(author => {
            let lastName = this.getAuthorLastName(author)
            let firstName = this.getAuthorFirstName(author)
            authorCitationText += num === this.authors.length-1 ? `and ${lastName}, ${firstName.charAt(0)}. ` : `${lastName}, ${firstName.charAt(0)}., `
            num++
          })
        }
      }
      return authorCitationText
    },
    citationText() {
      return `${this.authorCitations} (${this.year}) ${this.title}. ${this.publisher.length > 0 ? this.publisher + "." : ""} ${this.url}`
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
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
