<template>
  <div ref="myButton" class="gallery">
    <div class="resources-gallery-strip">
      <div class="card-line">
        <!--template needed in order to force windowedItems to recompute when items changes-->
        <template v-if="items?.length">
          <span v-for="(item, index) in windowedItems" :key="index" :class="['key-image-span']">
            <template v-if="item">
              <component v-if="galleryItemType === 'resources'" :is="galleryItemComponent" :width="cardWidth"
                :key="item.sys.id" :title="item.fields.name" :subtitle="item.fields.resourceType.join(', ')"
                :showSparcTag="item.fields.developedBySparc" :description="item.fields.description"
                :thumbnail-url="item.fields.logo.fields.file.url" :button-link="`/resources/${item.sys.id}`"
                :external-url="item.fields.url" @card-clicked="cardClicked" />
              <component v-else-if="galleryItemType === 'metrics'" :is="galleryItemComponent" :width="cardWidth"
                :key="item.title" :title="item.title" :data="item.data" :subData="item.subData" :showSubData="showMetricsCardSubData"/>
              <component v-else-if="galleryItemType === 'highlights'" :is="galleryItemComponent" :width="cardWidth"
                :item="item" />
              <component v-else-if="galleryItemType === 'datasets'" :is="galleryItemComponent" :width="cardWidth"
                :key="item.intId" :item="item" />
              <component v-else-if="galleryItemType === 'fileViewer'" :is="galleryItemComponent" :data="item"
                :width="cardWidth" show-card-details @card-clicked="cardClicked" />
              <component v-else-if="galleryItemType === 'featuredData'" :is="galleryItemComponent" :item="item" 
                :width="cardWidth" @card-clicked="cardClicked" />
              <component v-else-if="galleryItemType === 'inProgressDatasets'" :is="galleryItemComponent" :width="cardWidth"
                :key="item" :item="item" />
              <component v-else-if="galleryItemType === 'relatedDatasets'" :is="galleryItemComponent" :width="cardWidth"
                :key="item.id" :item="item" />
            </template>
          </span>
        </template>
      </div>
    </div>
    <client-only>
      <pagination v-if="items?.length > 0" background :total-count="itemCount" :selected="currentIndex"
        :page-size="numberOfItemsVisible" :pager-count=7 @select-page="indicatorClicked" />
    </client-only>
  </div>
</template>

<script>
import ResourceCard from '~/components/Gallery/GalleryItems/ResourceCard.vue'
import MetricsCard from '~/components/Gallery/GalleryItems/MetricsCard.vue'
import HighlightCard from '~/components/Gallery/GalleryItems/HighlightCard.vue'
import DatasetCard from '~/components/Gallery/GalleryItems/DatasetCard.vue'
import FileViewerCard from '~/components/Gallery/GalleryItems/FileViewerCard.vue'
import FeaturedDataCard from '~/components/Gallery/GalleryItems/FeaturedDataCard.vue'
import PennsieveDatasetCard from '~/components/Gallery/GalleryItems/PennsieveDatasetCard.vue'
import RelatedDatasetCard from '~/components/Gallery/GalleryItems/RelatedDatasetCard.vue'

import { defaultTo } from 'ramda'
import { ref } from 'vue'

const galleryItemComponents = {
  resources: ResourceCard,  
  metrics: MetricsCard,
  highlights: HighlightCard,
  datasets: DatasetCard,
  fileViewer: FileViewerCard,
  featuredData: FeaturedDataCard,
  inProgressDatasets: PennsieveDatasetCard,
  relatedDatasets: RelatedDatasetCard
}

function convertRemToPixels(rem) {
  if (typeof window !== 'undefined') {
    return rem * parseFloat(window.getComputedStyle(document.documentElement).fontSize)
  }
  return rem * 16
}

export default {
  name: 'Gallery',
  components: { DatasetCard, ResourceCard, MetricsCard, HighlightCard, FileViewerCard, FeaturedDataCard, RelatedDatasetCard },
  props: {
    items: {
      type: Array,
      default: () => {
        return []
      },
    },
    cardWidth: {
      type: Number,
      default: 21,
    },
    showIndicatorBar: {
      type: Boolean,
      default: true,
    },
    galleryItemType: {
      type: String,
      default: 'fileViewer'
    },
    showMetricsCardSubData: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      resizeObserver: null,
      currentIndex: ref(1),
      maxWidth: 0
    }
  },
  watch: {
    items() {
      this.currentIndex = 1
    }
  },
  mounted() {
    this.resizeObserver = new ResizeObserver(this.onResize).observe(this.$el)
  },
  destroyed() {
    delete this.resizeObserver
  },
  computed: {
    galleryItemComponent: function() {
      return defaultTo('', galleryItemComponents[this.galleryItemType])
    },
    itemCount() {
      return this.items?.length
    },
    isPrevPossible() {
      return this.currentIndex > 0
    },
    isNextPossible() {
      return this.currentIndex < this.itemCount - 1
    },
    cardHeight() {
      return 0.78 * this.cardWidth
    },
    cardLineWidth() {
      const cardSpacing = 0.25
      return this.itemCount * (this.cardWidth + cardSpacing) - cardSpacing
    },
    numberOfItemsVisible() {
      // The maximum width we are allowed minus two buttons for next and previous
      // divided by the width of a card.
      // const n = this.itemCount - 1
      const cardSpacingPx = convertRemToPixels(0.5)
      const buttonPx = convertRemToPixels(2)
      const cardWidthPx = convertRemToPixels(this.cardWidth)
      const cardItems = (this.maxWidth - 2 * buttonPx - 2 * cardSpacingPx) / (1.1 * cardWidthPx)
      //Display at least one item
      const possibleNumberVisible = Math.max(1, Math.floor(cardItems))
      return this.itemCount < possibleNumberVisible ? this.itemCount : possibleNumberVisible
    },
    valueAdjustment() {
      let valueAdjust = (this.currentIndex - 1) * this.numberOfItemsVisible
      if (valueAdjust < 0) {
        valueAdjust = 0
      } else if (valueAdjust + this.numberOfItemsVisible > this.itemCount) {
        valueAdjust = this.itemCount - this.numberOfItemsVisible
      }
      return valueAdjust
    },
    windowedItems() {
      let myArray = []
      for (let i = 0; i < this.numberOfItemsVisible; i++) {
        myArray.push(this.items[i + this.valueAdjustment])
      }
      return myArray
    },
  },
  methods: {
    cardClicked(payload) {
      this.$emit('card-clicked', payload)
    },
    goNext() {
      this.currentIndex += 1
    },
    goPrev() {
      this.currentIndex -= 1
    },
    indicatorClicked(index) {
      if (this.currentIndex !== index) {
        this.currentIndex = index
      }
    },
    onResize() {
      this.maxWidth = this.$el.clientWidth
    }
  },
}
</script>

<style scoped lang="scss">
@import 'sparc-design-system-components-2/src/assets/_variables.scss';

.arrow-button {
  min-width: 1.5rem;
  min-height: 1.5rem;
  border-radius: 50%;
  background: $purple;
  line-height: 1.1rem;
  display: flex;
  justify-content: center;
  user-select: none;
  align-self: center;
}
.resources-gallery-strip,
.card-line {
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-around;
  align-items: flex-start;
}
.card-line {
  flex-grow: 2;
}
.progress-button {
  font-size: 2rem;
  color: white;
}
.filler {
  flex-grow: .5;
}
a.prev:not(.underline),
a.next:not(.underline) {
  text-decoration: none;
}
.disabled {
  opacity: 0.5;
  pointer-events: none;
}
:deep(.sparc-design-system-pagination .el-pager li) {
  min-width: 2rem;
}
:deep(.el-pagination) {
  display: inline-flex;
}
</style>
