<template>
  <div class="no-results" v-if="stories.length === 0">
    <el-table :show-header="false" empty-text="No Results">
      <el-table-column />
    </el-table>
  </div>
  <div v-else class="subpage mb-16">
    <div v-for="(item, index) in stories" :key="index">
      <client-only><community-spotlight-item :story="getLinkedItem(item)" /></client-only>
      <div v-if="index !== stories.length - 1 || bottomLink" class="seperator-path my-16" />
    </div>
    <nuxt-link
      v-if="bottomLink"
      class="btn-load-more mt-16"
      :to="{
        name: linkLocation
      }"
    >
      {{ linkText }}
    </nuxt-link>
  </div>
</template>

<script>
import { pathOr } from 'ramda'
import CommunitySpotlightItem from './CommunitySpotlightItem.vue'

const SPOTLIGHT_TYPE_MAPPING = [
  {
    label: 'Fireside Chat',
    id: 'firesideChat',
  },
  {
    label: 'Success Story',
    id: 'successStory',
  }
]

export default {
  name: 'CommunitySpotlightListings',
  components: {
    CommunitySpotlightItem
  },
  props: {
    stories: {
      type: Array,
      default: () => []
    },
    bottomLink: {
      type: Boolean,
      default: false
    },
    linkLocation: {
      type: String,
      default: 'news-and-events-community-spotlight'
    },
    linkText: {
      type: String,
      default: 'View All Community Spotlights'
    }
  },
  methods: {
    // The community spotlight item component needs to use the properties off the actual success stories/fireside chats
    getLinkedItem(communitySpotlightItem) {
      const linkedItem = pathOr('', ['fields','linkedItem'], communitySpotlightItem)
      const anatomicalStructures = pathOr('', ['fields','anatomicalStructure'], communitySpotlightItem)
      const spotlightTypeId = pathOr('', ['fields','itemType'], communitySpotlightItem)
      const spotlightType = SPOTLIGHT_TYPE_MAPPING.find(item => {
        return item.id == spotlightTypeId
      })?.label
      return {
        ...linkedItem,
        spotlightType,
        anatomicalStructures
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';

.seperator-path {
  width: 100%;
  height: 0.125rem;
  background: rgb(216, 216, 216);
  border-radius: 0px;
}

.btn-load-more {
  background: none;
  border: none;
  color: $purple;
  cursor: pointer;
  display: block;
  padding: 0;
  font-weight: 500;
  text-decoration: underline;
}
</style>
