<template>
  <div class="metric-container pt-0 px-16 pb-16">
    <el-tooltip
      v-if="tooltip"
      placement="bottom"
      popper-class="consortia-tooltips"
      effect="customized"
    >
      <template #default>
        <img
          class="icon"
          :style="imageStyle"
          :src=iconUrl
        />
      </template>
      <template #content>
        {{ tooltip }}
      </template>
    </el-tooltip>
    <img
      v-else
      class="icon"
      :style="imageStyle"
      :src=iconUrl
    />
    <div class="numbers-container">
      <div  class="heading1">
        <span v-if="!automaticMetric">
          {{ description }}
        </span>
        <span v-else>
          {{ automaticDescription }}
        </span>
      </div>
      <div class="body1">
        {{ title }}
      </div>
    </div>
  </div>
</template>

<script>
import { pathOr, propOr } from 'ramda'
import marked from '@/mixins/marked/index'

export default {
  name: 'PortalFeature',

  mixins: [marked],

  props: {
    metric: {
      type: Object,
      default: () => {}
    },
    consortiaIds: {
      type: Array,
      default: []
    },
    textColor: {
      type: String,
      default: ""
    }
  },

  async setup(props) {
    if (!props.metric?.automaticMetric) {
      return
    }
    const config = useRuntimeConfig()
    const { $algoliaClient } = useNuxtApp()
    const algoliaIndex = await $algoliaClient.initIndex(config.public.ALGOLIA_INDEX)
    const facetId = props.metric?.fields?.description
    let orgsFilter = ''
    if (props.consortiaIds) {
      props.consortiaIds.forEach((orgId, index) => {
        orgsFilter += `pennsieve.organization.identifier:${orgId}`
        if (index < props.consortiaIds.length - 1) {
          orgsFilter += ' OR '
        }
      })
    }
    const { facets } = await algoliaIndex.search('', {
      hitsPerPage: 9999,
      facets: `${facetId}`,
      filters: orgsFilter
    })
    return {
      automaticDescription: facets[facetId] ? Object.keys(facets[facetId]).length : 0
    }
  },


  computed: {
    description() {
      return pathOr('', ['fields','description'], this.metric)
    },
    title() {
      return pathOr('', ['fields','title'], this.metric)
    },
    iconUrl() {
      return pathOr('', ['fields','icon', 'fields', 'file', 'url'], this.metric)
    },
    tooltip() {
      return pathOr('', ['fields','buttonText'], this.metric)
    },
    imageStyle() {
      if (this.textColor == "") return
      return {
        border: `1px solid #${this.textColor}`
      }
    },
    automaticMetric() {
      return propOr(false, 'automaticMetric', this.metric)
    }
  },
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.metric-container {
  text-align: left;
  display: flex;
  flex-direction: row;
  height: fit-content;
}
.numbers-container {
  display: flex;
  flex-direction: column;
  margin: auto;
  margin-left: .5rem;
}
.icon {
  margin: 0 auto;
  margin-right: .5rem;
}
img {
  border-radius: 50%;
  margin-bottom: 8px;
  height: 128px;
  width: 128px;
  object-fit: contain;
}
</style>
