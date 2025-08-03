<template>
  <facet-label :label="label" :disabled="!enabled">
    <hr />
    <el-radio-group
      v-model="selectedOption"
      class="indent"
      @change="selectedDateOptionChanged"
    >
      <el-radio class="pb-16" :value="showAllOption">
        Show All
      </el-radio>
      <radio-date-option
        v-for="(option, index) in dateOptions"
        :key="index"
        class="pb-16"
        :label="option"
        :enabled="selectedOption === option"
        :default-month="defaultSelectedMonth"
        :default-year="defaultSelectedYear"
        @year-changed="yearChanged"
        @month-changed="monthChanged"
      />
    </el-radio-group>
  </facet-label>
</template>

<script>
import FacetLabel from './FacetLabel.vue'
import RadioDateOption from './RadioDateOption.vue'
const showAllOption = 'show all'
const dateOptions = ['Before', 'During', 'After']

export default {
  name: 'FacetRadioButtonDateCategory',

  components: { FacetLabel, RadioDateOption },

  props: {
    label: {
      type: String,
      default: ''
    },
    defaultSelectedOption: {
      type: String,
      default: showAllOption
    },
    defaultSelectedMonth: {
      type: String,
      default: ''
    },
    defaultSelectedYear: {
      type: Number,
      default: 0
    },
    enabled: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      dateOptions: dateOptions,
      showAllOption: showAllOption,
      selectedOption: this.defaultSelectedOption,
      month: this.defaultSelectedMonth,
      year: this.defaultSelectedYear
    }
  },

  computed: {
    monthNumber: function() {
      // This Date format should be supported by all browsers. Used to convert month string to a number
      return new Date(`2001, ${this.month}, 01`).getMonth() + 1
    }
  },
  watch: {
    defaultSelectedOption: function() {
      if (this.selectedOption === this.defaultSelectedOption) {
        return
      }
      this.selectedOption = this.defaultSelectedOption
      this.$emit('selected-date-option-changed', this.selectedOption)
    },
    defaultSelectedYear: function() {
      if (this.year === this.defaultSelectedYear) {
        return
      }
      this.year = this.defaultSelectedYear
    },
    defaultSelectedMonth: function() {
      if (this.month === this.defaultSelectedMonth) {
        return
      }
      this.month = this.defaultSelectedMonth
    }
  },

  methods: {
    selectedDateOptionChanged: function(newValue) {
      this.$emit('selected-date-option-changed', newValue)
    },
    monthChanged: function(newValue) {
      this.month = newValue
      this.$emit('selected-month-changed', newValue)
    },
    yearChanged: function(newValue) {
      this.year = newValue
      this.$emit('selected-year-changed', newValue)
    },
    reset: function() {
      this.selectedOption = this.showAllOption
      this.$emit('selected-date-option-changed', this.selectedOption)
    },
    getLessThanDate: function() {
      switch (this.selectedOption) {
        case this.dateOptions[0]:
          return `${this.year}-${String(this.monthNumber).padStart(2, 0)}-01T00:00:00.000Z`
        case this.dateOptions[1]:
          return this.getNextMonthDate()
        default:
          return
      }
    },
    getGreaterThanOrEqualToDate: function() {
      switch (this.selectedOption) {
        case this.dateOptions[1]:
          return `${this.year}-${String(this.monthNumber).padStart(2, 0)}-01T00:00:00.000Z`
        case this.dateOptions[2]:
          return this.getNextMonthDate()
        default:
          return
      }
    },
    getNextMonthDate: function() {
      var nextMonth = this.monthNumber + 1
      var year = this.year
      if (nextMonth === 13) {
        nextMonth = 1
        year += 1
      }
      return `${year}-${String(nextMonth).padStart(2, 0)}-01T00:00:00.000Z`
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.indent {
  display: block;
  text-transform: capitalize;
  padding: 1rem 0 0 2rem;
}

hr {
  border: none;
  border-bottom: 1px solid $lineColor2;
  margin: 0;
}
</style>
