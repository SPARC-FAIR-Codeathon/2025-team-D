<template>
  <div :class="['facet-label', { disabled: disabled }]">
    <div @click.stop="onArrowClicked" class="body1 title">
      <span>
        {{ label }}
        <sparc-tooltip placement="left-center">
          <template #data>
            <div v-html="tooltip"/>
          </template>
          <template #item>
            <svgo-icon-help v-show="showHelpIcon" class="purple-fill" width="26" height="26" />
          </template>
        </sparc-tooltip>
      </span>
      <svgo-icon-arrow
        v-show="showCollapsibleArrow"
        :class="showContent ? 'arrow-down' : 'arrow-up'"
        class="ml-8"
        height="15"
        width="15"
      />
    </div>
    <div v-show="showContent" class="light-gray-background">
      <slot />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
export default {
  name: 'FacetLabel',

  components: {},

  props: {
    label: {
      type: String,
      default: ''
    },
    collapseByDefault: {
      type: Boolean,
      default: true
    },
    showCollapsibleArrow: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    showHelpIcon: {
      type: Boolean,
      default: false
    },
    tooltip: {
      type: String,
      default: ""
    }
  },

  data() {
    return {
      collapsed: ref(this.collapseByDefault)
    }
  },
  computed: {
    collapsibleArrowDir: function() {
      return this.showContent ? 'down' : 'up'
    },
    showContent: function() {
      return !(this.collapsed || this.disabled)
    }
  },
  methods: {
    onArrowClicked() {
      if (this.showCollapsibleArrow && !this.disabled) {
        this.collapsed = !this.collapsed
      }
      return this.collapsed
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.light-gray-background {
  background-color: #FAFBFC
}

.facet-label {
  border-top: 1px solid $lineColor2;
}

.title {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0;
  padding: 0.5rem 1rem;
  font-weight: 500;
  align-items: center;
  text-transform: uppercase;
  cursor: pointer;
  svg {
    cursor: pointer
  }
}

.purple-fill {
  fill: $purple;
}

.disabled {
  opacity: 0.5;
  background-color: $background;
}
.arrow-down {
  transform: rotate(180deg);
}
</style>
