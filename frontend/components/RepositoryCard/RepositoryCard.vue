<template>
  <el-card 
    class="mr-8"
    :style="{ border: 'none', maxWidth: width + 'rem', minWidth: width + 'rem' }"
    :body-style="{ 
      'height': '90%',
      'display': 'flex',
      'flex-direction': 'column',
      'justify-content': 'space-between',
      'text-align': 'center' }" 
  >
    <div>
      <div class="image-container">
        <img class="thumbnail" :src="thumbnailUrl" alt="thumbnail loading ..." />
      </div>
      <div class="body1">
        {{description}}
      </div>
    </div>
    <div>
      <div class="body1 mb-16">
        Status: <b>{{ status }}</b>
      </div>
      <el-button @click="launchPennsieve" class='secondary'>
        Launch Pennsieve <svgo-icon-open class="open-icon" />
      </el-button>
    </div>
  </el-card>
</template>
<script>
import { propOr } from 'ramda'
import PennsieveOrganizations from '@/mixins/pennsieve-organizations'

export default {
  name: 'RepositoryCard',
  mixins: [PennsieveOrganizations],
  props: {
    width: {
      type: Number,
      default: 13.8
    },
    organizationInfo: {
      type: Object,
      default: {}
    },
  },
  computed: {
    link() {
      return `${this.$config.public.PENNSIEVE_URL}/${propOr('', 'id', this.organizationInfo)}/datasets`
    },
    thumbnailUrl() {
      return propOr('', 'logo', this.organizationInfo)
    },
    description() {
      return `Open the ${propOr('', 'name', this.organizationInfo)} workspace in Pennsieve`
    },
    status() {
      return propOr('', 'status', this.organizationInfo)
    }
  }
}
</script>
<style lang="scss" scoped>
.image-container {
  margin: auto;
  img {
    height: 5rem;
    width: 100%;
    aspect-ratio: 1;
    object-fit: contain;
  }
}
.open-icon {
  height: 1.5rem;
  width: 1.5rem;
}
</style>