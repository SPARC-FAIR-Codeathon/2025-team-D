<template>
  <div
    class="sparc-card"
    :class="{ 'sparc-card--image-right': imageAlign === 'right' }"
  >
    <div
      v-if="!$slots.image"
      class="sparc-card__image"
      :style="`background-image: url(${image})`"
    >
      <img class="visuallyhidden" :src="image" :alt="imageAlt" />
    </div>
    <slot name="image" class="sparc-card__image" />

    <div class="sparc-card__content-wrap">
      <div class="sparc-card__content-wrap__content">
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SparcCard',

  props: {
    image: {
      type: String,
      default: ''
    },
    imageAlt: {
      type: String,
      default: ''
    },
    imageAlign: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss" scoped>
$tablet-small: 48em;
$tablet-large: 64em;
.sparc-card--image-right {
  :slotted(.sparc-card__image-container) {
    order: 2;
  }
}
.sparc-card {
  display: flex;
  :slotted(.sparc-card__image-container) {
    display: flex;
    visibility: visible;
    background-color: white;
    width: 25%;
    @media (max-width: $tablet-large) {
      display: none;
    }
  }
  :slotted(.sparc-card__image) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .sparc-card__content-wrap {
    display: flex;
    flex: 1;
    background: #24245b;
  }
  .sparc-card__image,.sparc-card__content-wrap {
    flex: 1 0 0em; // Unit required for IE11
    :deep(.sparc-card__content-wrap__content) {
      color: #fff;
      font-size: 0.75em;
      line-height: 1.3125rem;
      padding: 1em;
      display: flex;
      flex-direction: column;
      a {
        font-weight: 300;
        color: #fff;
        text-decoration: none;
        &:hover,
        &:focus {
          text-decoration: underline;
        }
      }
      @media (min-width: $tablet-small) and (max-width: $tablet-large) {
        font-size: 1em;
        line-height: 2rem;
        padding: 2em;
      }
      @media (min-width: $tablet-large) {
        font-size: 1.125em;
        line-height: 2rem;
        padding: 2rem 2.5rem;
      }
    }
  }
}
</style>
