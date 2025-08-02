<template>
  <div>
    <el-radio class="mb-4" :value="label">
      {{ label }}
    </el-radio>
    <div class="flex ml-0 mr-24">
      <el-select
        v-model="month"
        class="mr-8 month"
        placeholder="Month"
        :disabled="!enabled"
        @change="monthChanged"
      >
        <el-option
          v-for="(month, index) in months"
          :key="index"
          :label="month"
          :value="month"
        />
      </el-select>
      <el-input-number
        v-model="year"
        controls-position="right"
        placeholder="Year"
        :precision="0"
        :min="2000"
        :max="2040"
        :disabled="!enabled"
        @change="yearChanged"
      />
    </div>
  </div>
</template>

<script>
const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
]

export default {
  name: 'RadioDateOption',

  components: {},

  props: {
    label: {
      type: String,
      default: ''
    },
    enabled: {
      type: Boolean,
      default: false
    },
    defaultMonth: {
      type: String,
      default: 'Mar'
    },
    defaultYear: {
      type: Number,
      default: 2020
    }
  },

  data() {
    return {
      months: months,
      month: this.defaultMonth,
      year: this.defaultYear
    }
  },

  computed: {},
  watch: {
    defaultMonth: function() {
      if (this.month === this.defaultMonth) {
        return
      }
      this.month = this.defaultMonth
    },
    defaultYear: function() {
      if (this.year === this.defaultYear) {
        return
      }
      this.year = this.defaultYear
    }
  },

  mounted() {},

  methods: {
    yearChanged: function(newValue) {
      this.$emit('year-changed', newValue)
    },
    monthChanged: function(newValue) {
      this.$emit('month-changed', newValue)
    }
  }
}
</script>

<style>
.el-radio__input.is-checked + .el-radio__label {
  color: #8300bf;
}
.el-radio__input.is-checked .el-radio__inner {
  border-color: #8300bf;
  background: #8300bf;
}
</style>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';

.flex {
  display: flex;
  justify-content: space-around;
  max-width: fit-content;
}

.margin-y {
  margin: 0 1.5rem;
}

.month {
  max-width: 5rem;
  min-width: 4.75rem;
}
</style>
