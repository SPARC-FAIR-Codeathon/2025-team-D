<template>
  <div>
    <facet-menu
      :selected-facets="selectedFacet"
      :visible-facet-categories="visibleCategories"
      @deselect-facet="deselectFacet"
      @deselect-all-facets="deselectAllFacets"
    >
      <facet-radio-button-date-category
        ref="publicationCategory"
        label="Publication Date"
        enabled
        :default-selected-option="publicationDateOption"
        :default-selected-month="publicationMonth"
        :default-selected-year="publicationYear"
        @selected-date-option-changed="publicationDateOptionChanged"
        @selected-month-changed="publicationMonthChanged"
        @selected-year-changed="publicationYearChanged"
      />
    </facet-menu>
    <dropdown-multiselect
      ref="newsSubjects"
      collapse-by-default
      :category="newsSubjects"
      :default-checked-ids="selectedNewsSubjectIds"
      @selection-change="selectedNewsSubjectIdsChanged"
    />
  </div>
</template>

<script>
import { pluck } from 'ramda'
import FacetMenu from './FacetMenu.vue'
import FacetRadioButtonDateCategory from './FacetRadioButtonDateCategory.vue'

const visibleCategories = ['news', 'subject']

const PUBLICATION_DATE_FACET_ID = 'publication date'

const SUBJECT_CATEGORY = {
  label: 'Subject',
  id: 'subject',
  data: [
    {
      label: 'General News',
      id: 'News Article',
    },
    {
      label: 'Funding Opportunity',
      id: 'Funding Opportunity',
    },
    {
      label: 'Highlight',
      id: 'Highlight',
    },
    {
      label: 'Portal Update',
      id: 'Portal Update',
    },
  ]
}

export default {
  name: 'NewsFacetMenu',

  components: {
    FacetMenu,
    FacetRadioButtonDateCategory
  },

  data() {
    return {
      newsSubjects: SUBJECT_CATEGORY,
      selectedNewsSubjectIds: [],
      publicationDateOption: 'show all',
      publicationMonth: new Date().toLocaleString('en-US', {month: 'short'}),
      publicationYear: new Date().getFullYear(),
      visibleCategories: visibleCategories,
    }
  },

  computed: {
    selectedFacet: function() {
      let facets = []
      if (this.selectedNewsSubjectIds != []) {
        this.selectedNewsSubjectIds.forEach(selectedOption => {
          facets.push({
            label: `${selectedOption.label}`,
            id: `${selectedOption.id}`,
            facetPropPath: this.newsSubjects.id
          })
        })
      }
      if (this.publicationDateOption !== 'show all') {
        facets.push({
          label: `${this.publicationDateOption} ${this.publicationMonth} ${this.publicationYear}`,
          id: PUBLICATION_DATE_FACET_ID,
          facetPropPath: 'news'
        })
      }
      return facets
    }
  },

  mounted() {
    if (this.$route.query.selectedNewsSubjectIds) {
      this.selectedNewsSubjectIds = this.$route.query.selectedNewsSubjectIds.split(',')
    }
    if (this.$route.query.publicationDateOption) {
      this.publicationDateOption = this.$route.query.publicationDateOption
    }
    if (this.$route.query.publicationMonth) {
      this.publicationMonth = this.$route.query.publicationMonth
    }
    if (this.$route.query.publicationYear) {
      this.publicationYear = Number(this.$route.query.publicationYear)
    }
  },

  methods: {
    selectedNewsSubjectIdsChanged(newValue) {
      this.selectedNewsSubjectIds = newValue.checkedNodes

      this.$router.replace(
        {
          query: { ...this.$route.query, selectedNewsSubjectIds: this.selectedNewsSubjectIds.length === 0 ? undefined : pluck('id', this.selectedNewsSubjectIds).toString() }
        },
        () => {
          this.$emit('news-selections-changed')
        }
      )
    },
    publicationDateOptionChanged(newValue) {
      if (this.publicationDateOption == newValue) {
        this.$emit('news-selections-changed')
        return
      }
      this.publicationDateOption = newValue
      this.$router.replace(
        {
          query: { ...this.$route.query, publicationDateOption: newValue }
        },
        () => {
          this.$emit('news-selections-changed')
        }
      )
    },
    publicationMonthChanged(newValue) {
      if (this.publicationMonth == newValue) {
        return
      }
      this.publicationMonth = newValue
      this.$router.replace(
        {
          query: { ...this.$route.query, publicationMonth: newValue }
        },
        () => {
          this.$emit('news-selections-changed')
        }
      )
    },
    publicationYearChanged(newValue) {
      if (this.publicationYear == newValue) {
        return
      }
      this.publicationYear = newValue
      this.$router.replace(
        {
          query: { ...this.$route.query, publicationYear: newValue }
        },
        () => {
          this.$emit('news-selections-changed')
        }
      )
    },
    getPublishedLessThanDate() {
      return this.$refs.publicationCategory.getLessThanDate()
    },
    getPublishedGreaterThanOrEqualToDate() {
      return this.$refs.publicationCategory.getGreaterThanOrEqualToDate()
    },
    getSelectedNewsSubjects() {
      return this.selectedNewsSubjectIds
    },
    async deselectAllFacets() {
      await this.$router.replace(
        {
          query: {
            ...this.$route.query,
            publicationDateOption: undefined,
            selectedNewsSubjectIds: undefined
          }
        }).then(() => {
          this.$refs.publicationCategory.reset()
          this.$refs.newsSubjects.uncheckAll()
          this.$emit('news-selections-changed')
        })
    },
    deselectFacet(facetId) {
      this.$refs.newsSubjects.uncheck(facetId)
      if (facetId === PUBLICATION_DATE_FACET_ID) {
        this.$refs.publicationCategory.reset()
      }
    }
  }
}
</script>
