<template>
  <div class="search-form" @keyup.enter="submit">
    <div class="input-wrap">
      <el-input
        v-model="terms"
        :placeholder="placeholder"
        @keyup.enter="submit"
      />
      <button v-if="terms" class="btn-clear-search" @click="clear">
        <svgo-icon-clear class="body1 close-icon"/>
      </button>
    </div>
    <el-button :class="['px-8', 'py-0', searchButtonClass]" title="Search" @click="submit">
      <svgo-icon-magnifying-glass class="body2 mr-4 search-icon"/>
      <span class="search-text pr-2" v-if="showSearchText">Search</span>
    </el-button>
  </div>
</template>

<script>
export default {
  name: "SearchControlsContentful",
  props: {
    placeholder: {
      type: String,
      default: ''
    },
    path: {
      type: String,
      default: ''
    },
    showSearchText: {
      type: Boolean,
      default: false
    },
    searchButtonClass: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      loading: false,
      terms: this.$route.query.search
    }
  },

  watch: {
    '$route.query.search': function() {
      this.terms = this.$route.query.search
    }
  },

  methods: {
    submit() {
      this.terms = this.terms?.trim()
      this.$router.push({ path: this.path, query: { ...this.$route.query, search: this.terms } })
    },
    clear() {
      this.$router.push({ path: this.path, query: { ...this.$route.query, search: undefined } })
      this.terms = ''
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.search-form {
  display: flex;
  min-width: 275px;
  margin: 0;
}
.input-wrap {
  display: flex;
  margin-right: 0.5rem;
  position: relative;
  width: 100%;
}
input {
  background: #fff;
  border: 1px solid $lineColor2;
  border-radius: 4px;
  box-sizing: border-box;
  color: $lineColor2;
  flex: 1;
  font-size: 0.875rem;
  outline: none;
  margin: 0;
  padding: 0.5rem 2.25rem 0.5rem 0.8125rem;
  &:focus {
    border-color: $purple;
  }
  &::-ms-clear {
    display: none;
  }
}
.btn-clear-search {
  background: none;
  border: none;
  cursor: pointer;
  height: 100%;
  outline: none;
  margin: 0;
  position: absolute;
  right: 0;
  top: 0;
  &:hover,
  &:active {
    opacity: 0.75;
  }
}
.search-text {
  vertical-align: middle !important;
}
.search-icon {
  transform: rotate(270deg);
}
.close-icon {
  width: 1.5rem;
  height: 1.5rem;
  :deep(circle) {
    fill: none;
  }
}
</style>
