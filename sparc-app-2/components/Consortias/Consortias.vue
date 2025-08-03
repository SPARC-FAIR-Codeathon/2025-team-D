<template>
  <div class="body1">
    The SPARC Portal currently supports <b><span class="heading2">{{ items?.length }}</span></b> consortia. Visit
    the consortia pages to find out more about them:
  </div>
  <div class="data-wrap py-16">
    <nuxt-link
      v-for="item in items"
      :key="item.sys.id"
      class="consortia-item"
      :to="`/about/consortia/${item.fields.slug}`"
    >
      <img :src="logoUrl(item)" :alt="`Logo for ${item.fields.title}`" />
      <p class="mb-0 mt-8">
        {{ item.fields.title }}
      </p>
    </nuxt-link>
  </div>
</template>

<script>
import { pathOr } from 'ramda'

export default {
  name: 'Consortias',

  props: {
    items: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    logoUrl: function (item) {
      return pathOr('', ['fields', 'logo', 'fields', 'file', 'url'], item)
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.data-wrap {
  justify-content: center;
  width: 100%;
  display: flex;
}
.consortia-item {
  color: #000;
  text-decoration: none;

  margin: 0rem 2rem;
  text-align: center;

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
    object-fit: contain;
    margin: auto;
  }

  p {
    font-size: 1em;
    font-weight: 700;
    color: #24245b;
    width: 11rem;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
