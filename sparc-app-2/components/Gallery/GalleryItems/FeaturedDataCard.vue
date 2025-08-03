<template>
  <div class="data-wrap">
    <nuxt-link class="data-item" :to="link">
      <img :src="imageUrl" />
      <p class="mb-0 mt-8">
        {{ item.fields.label }}
      </p>
    </nuxt-link>
  </div>
</template>
<script>
import { pathOr } from 'ramda'
export default {
  name: 'FeaturedDataCard',

  props: {
    item: {
      type: Object,
      default: {}
    }
  },
  computed: {
    imageUrl() {
      return pathOr('', ['fields', 'image', 'fields', 'file', 'url'], this.item)
    },
    label() {
      return pathOr('', ['fields', 'label'], this.item)
    },
    link() {
      return pathOr('', ['fields', 'linkWithFacets'], this.item)
    }
  }
}
</script>
<style scoped lang="scss">
.data-wrap {
  align-items: center;
  display: grid;
  justify-items: center;
  justify-content: space-evenly;

  @media (min-width: 768px) {
    padding-left: 0.4375rem;
    padding-right: 0.4375rem;
  }
}

.data-item {
  color: #000;
  text-decoration: none;
  width: 128px;
  margin: 0.525em 0rem;

  &:hover,
  &:focus {
    opacity: 0.9;
  }

  img {
    background: #fff;
    border-radius: 50%;
    display: block;
    margin-bottom: 8px;
    width: 128px;
    border: solid 1px #c0c4cc;
    height: 128px;
  }

  p {
    font-size: 1em;
    font-weight: 700;
    color: #24245b;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
