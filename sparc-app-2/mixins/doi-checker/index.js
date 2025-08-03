export default {
  data() {
    return {
      invalidDois: []
    }
  },
  computed: {
    showPrimaryPublications() {
      return this.primaryPublications?.filter(publication => {
        return !this.invalidDois.includes(publication.doi)
      }).length > 0
    },
    showAssociatedPublications() {
      return this.associatedPublications?.filter(publication => {
        return !this.invalidDois.includes(publication.doi)
      }).length > 0
    },
    showCitingPublications() {
      return this.citingPublications?.filter(publication => {
        return !this.invalidDois.includes(publication.doi)
      }).length > 0
    },
    showPreprints() {
      return this.preprints?.filter(publication => {
        return !this.invalidDois.includes(publication.doi)
      }).length > 0
    },
  },
  methods: {
    onDoiInvalid(doi) {
      this.invalidDois.push(doi)
    }
  }
}
