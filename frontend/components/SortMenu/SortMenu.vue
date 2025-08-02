<template>
  <el-dropdown
    trigger="click"
    placement="bottom-start"
    @command="$emit('update-selected-option', $event)"
    @visible-change="isMenuOpen = $event"
  >
    <button class="filter-dropdown el-dropdown-link">
      <span class="el-dropdown-text-link">
        {{ selectedOption.label }}
      </span>
      <svgo-icon-arrow width="10" height="10" class="ml-8 icon-arrow" :class="menuArrowUp ? 'arrow-up' : 'arrow-down'"/>
    </button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="option in options"
          :key="option.id"
          class="icon-item"
          :command="option"
        >
          {{ option.label }}
          <svgo-icon-check v-if="selectedOption.id === option.id" />
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script>
export default {
  name: 'PaginationMenu',

  props: {
    selectedOption: {
      type: Object,
      default: () => {
        return {}
      }
    },
    options: {
      type: Array,
      default: () => {
        return []
      }
    }
  },

  data: function() {
    return {
      isMenuOpen: false
    }
  },

  computed: {
    /**
     * Compute dataset filter arrow direction
     * @returns {String}
     */
    menuArrowUp: function() {
      return this.isMenuOpen ? true : false
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';

.filter-dropdown {
  display: flex;
  align-items: center;
  border-radius: 4px;
  border: solid 1px $mediumGrey;
  background-color: transparent;
  font-size: 14px;
  font-weight: normal;
  color: $purple;
  margin-left: 5px;
}

:deep(.icon-arrow) {
  path {
    fill: $mediumGrey !important;
  }
}

.el-dropdown-link {
  cursor: pointer;
  outline: none;
}

.arrow-down {
  transform: rotate(180deg);
}

.el-dropdown-text-link {
  margin-right: -6px;
  padding-top: 3px;
  padding-bottom: 3px;
}
</style>
