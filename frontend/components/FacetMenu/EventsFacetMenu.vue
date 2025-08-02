<template>
  <div>
    <facet-menu
      class="events-facet-menu"
      :selected-facets="selectedFacet"
      :visible-facet-categories="visibleCategories"
      @deselect-facet="deselectFacet"
      @deselect-all-facets="deselectAllFacets"
    >
      <facet-radio-button-date-category
        ref="eventCategory"
        label="Event Date"
        enabled
        :default-selected-option="eventDateOption"
        :default-selected-month="eventMonth"
        :default-selected-year="eventYear"
        @selected-date-option-changed="eventDateOptionChanged"
        @selected-month-changed="eventMonthChanged"
        @selected-year-changed="eventYearChanged"
      />
    </facet-menu>
    <dropdown-multiselect
      ref="eventTypeCategory"
      collapse-by-default
      :category="eventTypeOptions"
      enabled
      :default-checked-ids="selectedEventTypeOptions"
      @selection-change="selectedEventTypeOptionsChanged"
    />
  </div>
</template>

<script>
import { pluck } from 'ramda'
import FacetMenu from './FacetMenu.vue'
import FacetRadioButtonDateCategory from './FacetRadioButtonDateCategory.vue'

const eventTypeOptions = {
  label: 'Event Type',
  id: 'event type',
  data: [
    {
      label: 'Cancelled',
      id: 'Cancelled',
    },
    {
      label: 'Conference',
      id: 'Conference',
    },
    {
      label: 'Funding',
      id: 'Funding',
    },
    {
      label: 'Other Event',
      id: 'Other Event',
    },
    {
      label: 'Postponed',
      id: 'Postponed',
    },{
      label: 'Virtual Conference',
      id: 'Virtual Conference',
    },
    {
      label: 'Webinar',
      id: 'Webinar',
    },
    {
      label: 'Workshop',
      id: 'Workshop',
    }
  ]
}

const visibleCategories = ['events']

const EVENT_DATE_FACET_ID = 'event date'

export default {
  name: 'EventsFacetMenu',

  components: {
    FacetMenu,
    FacetRadioButtonDateCategory
  },

  data() {
    return {
      eventTypeOptions: eventTypeOptions,
      selectedEventTypeOptions: [],
      eventDateOption: 'show all',
      eventTypeOption: 'show all',
      eventMonth: new Date().toLocaleString('en-US', {month: 'short'}),
      eventYear: new Date().getFullYear(),
      visibleCategories: visibleCategories,
    }
  },

  computed: {
    selectedFacet: function() {
      let facets = []
      if (this.eventDateOption !== 'show all') {
        facets.push({
          label: `${this.eventDateOption} ${this.eventMonth} ${this.eventYear}`,
          id: EVENT_DATE_FACET_ID,
          facetPropPath: 'events'
        })
      }
      if (this.selectedEventTypeOptions != []) {
        this.selectedEventTypeOptions.forEach(selectedOption => {
          facets.push({
            label: `${selectedOption.label}`,
            id: `${selectedOption.id}`,
            facetPropPath: 'events'
          })
        })
      }
      return facets
    }
  },

  mounted() {
    if (this.$route.query.selectedEventTypeOptions) {
      this.selectedEventTypeOptions = this.$route.query.selectedEventTypeOptions.split(",")
    }
    if (this.$route.query.eventDateOption) {
      this.eventDateOption = this.$route.query.eventDateOption
    }
    if (this.$route.query.eventMonth) {
      this.eventMonth = this.$route.query.eventMonth
    }
    if (this.$route.query.eventYear) {
      this.eventYear = Number(this.$route.query.eventYear)
    }
  },

  methods: {
    selectedEventTypeOptionsChanged(newValue) {
      this.selectedEventTypeOptions = newValue.checkedNodes
      this.$router.replace(
        {
          query: { ...this.$route.query, selectedEventTypeOptions: this.selectedEventTypeOptions.length === 0 ? undefined : pluck('id', this.selectedEventTypeOptions).toString() }
        },
        () => {
          this.$emit('events-selections-changed')
        }
      )
    },
    eventDateOptionChanged(newValue) {
      if (this.eventDateOption === newValue) {
        this.$emit('events-selections-changed')
        return
      }
      this.eventDateOption = newValue
      this.$router.replace(
        {
          query: { ...this.$route.query, eventDateOption: newValue }
        },
        () => {
          this.$emit('events-selections-changed')
        }
      )
    },
    eventMonthChanged(newValue) {
      if (this.eventMonth === newValue) {
        return
      }
      this.eventMonth = newValue
      this.$router.replace(
        {
          query: { ...this.$route.query, eventMonth: newValue }
        },
        () => {
          this.$emit('events-selections-changed')
        }
      )
    },
    eventYearChanged(newValue) {
      if (this.eventYear === newValue) {
        return
      }
      this.eventYear = newValue
      this.$router.replace(
        {
          query: { ...this.$route.query, eventYear: newValue }
        },
        () => {
          this.$emit('events-selections-changed')
        }
      )
    },
    getStartLessThanDate() {
      return this.$refs.eventCategory.getLessThanDate()
    },
    getStartGreaterThanOrEqualToDate() {
      return this.$refs.eventCategory.getGreaterThanOrEqualToDate()
    },
    deselectAllFacets() {
      this.$refs.eventCategory.reset()
      this.$refs.eventTypeCategory.uncheckAll()
    },
    deselectFacet(facetId) {
      if (facetId === EVENT_DATE_FACET_ID) {
        this.$refs.eventCategory.reset()
      }
      else {
        this.$refs.eventTypeCategory.uncheck(facetId)
      }
    }
  }
}
</script>

<style scoped lang="scss" >
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.white-background {
  background-color: white;
  border: 0.1rem solid $lineColor2;
}

hr {
  border: none;
  border-bottom: 1px solid $lineColor1;
  margin: 0;
}

.events-facet-menu {
  // hacky fix to address placing the design system drop down for the event type category outside the facet menu since it handles its own borders
  border-bottom: none;
}
</style>
