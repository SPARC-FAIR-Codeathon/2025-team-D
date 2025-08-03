<template>
  <div>
    <div class="subpage-col about-page-border p-24">
      <div class="subpage-row">
        <img v-if="logoSrc" class="logo-image mr-16" :src="logoSrc" />
        <div class="subpage-col">
          <div class="about-page-text" v-html="text" />
          <div v-if="showShareLinks">
            <share-links />
          </div>
        </div>
      </div>
      <nuxt-link v-if="buttonText != '' && buttonLinkExternal == ''" class="margin-top-auto" :to="buttonLink"
        :target="newTab ? '_blank' : '_self'">
        <el-button class="secondary">
          {{ buttonText }}
        </el-button>
      </nuxt-link>
      <a v-if="buttonText != '' && buttonLinkExternal != ''" class="margin-top-auto" :href="buttonLinkExternal"
        target="_blank">
        <el-button class="secondary">
          {{ buttonText }}
        </el-button>
      </a>
    </div>
    <img v-if="imgSrc" :v-slot="image" class="portal-image midnightblue-background" :src="imgSrc" />
  </div>
</template>

<script>
import ShareLinks from '@/components/ShareLinks/ShareLinks'
export default {
  name: 'Paper',
  components: {
    ShareLinks
  },
  props: {
    text: {
      type: String,
      default: ''
    },
    buttonLink: {
      type: [Object, String],
      default: null
    },
    buttonLinkExternal: {
      type: String,
      default: ''
    },
    buttonText: {
      type: String,
      default: ''
    },
    imgSrc: {
      type: String,
      default: null
    },
    newTab: {
      type: Boolean,
      default: false
    },
    logoSrc: {
      type: String,
      default: null
    },
    showShareLinks: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.subpage-col {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background-color: white;
  width: 100%;

  @media screen and (max-width: 767px) {
    margin-top: 0;
  }
  .about-page-text {
    width: 100%;
    @media screen and (max-width: 767px) {
      margin-left: 0;
    }
  }
}
.subpage-row {
  display: flex;
  flex-direction: row;
  width: 100%;
}
.about-page-border {
  border: 1px solid #dcdfe6;
}
.margin-top-auto {
  margin-top: auto;
}
.midnightblue-background {
  background-color: midnightblue;
}
.portal-image {
  height: auto;
  width: 30%;
  min-width: 20rem;

  @media screen and (max-width: 767px) {
    display: none;
  }
}
.logo-image {
  width: 8rem;
  height: 8rem;
  object-fit: contain;
  border: solid $lineColor1 1px;
}
:deep(img) {
  max-width: 100%;
}
</style>
