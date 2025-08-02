<template>
  <div class="card-container p-16">
    <div class="subpage-row">
      <div class="subpage-col">
        <div class="image-container"> 
          <img class="banner-image" :src="banner" :alt="'image could not load'" />
        </div>
      </div>
      <div class="subpage-col">
        <template v-if="link.isInternal">
          <nuxt-link
            class="dataset-name tab1"
            :to="link.path"
          >
            {{ title }}
          </nuxt-link>
          <div class="dataset-description body1 mt-8">
            {{ description }}
          </div>
          <nuxt-link
            class="button-link"
            :to="link.path"
          >
            <el-button class="secondary mt-16">
              {{ buttonText }}
            </el-button>
          </nuxt-link>
        </template>
        <template v-else>
          <a
            class="dataset-name tab1"
            :href="link.path"
          >
            {{ title }}
          </a>
          <div class="dataset-description body1 mt-8">
            {{ description }}
          </div>
          <a
            class="button-link"
            :href="link.path"
          >
            <el-button class="secondary mt-16">
              {{ buttonText }}
              <svgo-icon-open class="tab1" />
            </el-button>
          </a>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProjectsAndDatasetsCard',
  props: {
    title: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    banner: {
      type: String,
      default: ''
    },
    buttonText: {
      type: String,
      default: ''
    },
    link: {
      type: Object,
      default: {
        isInternal: true,
        path:'/'
      }
    }
  },
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.card-container {
  background-color: white;
  height: 100%;
  border: solid $lineColor1 1px;
}
.image-container {
  display: flex;
  aspect-ratio: 1;
  border: 1px solid $lineColor2;
  max-width: 12rem;
  min-width: 5rem;
}
.subpage-col {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background-color: white;
  padding: .5rem;
  min-width: 7rem;
}

.subpage-row {
  display: flex;
  flex-direction: row;
}
.banner-image {
  height: auto;
  width: 100%;
  margin: auto;
}
.dataset-name:hover {
  text-decoration: underline;
}
.button-link:hover {
  text-decoration: none;
}
.dataset-description {
  word-wrap: break-word;
}
</style>
