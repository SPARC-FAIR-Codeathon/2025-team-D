<template>
  <div>
    <url-input class="my-4" v-for="(val, index) in modelValue"
      :disabled="disabled" :modelValue="modelValue[index]" @update:modelValue="updateUrl(index, $event)"
      :placeholder="placeholder" @add-link="addLink" :showAddLink="index === modelValue.length - 1"
      :key="index"
    />
  </div>
</template>

<script>

import UrlInput from '@/components/Url/UrlInput.vue'

export default {
  name: 'UrlList',
  components: {
    UrlInput
  },
  props: {
    modelValue: {
      type: Array
    },
    disabled: {
      type: Boolean,
      default: false
    },
    placeholder: String
  },
  methods: {
    addLink() {
      this.$emit('add-link')
    },
    updateUrl(index, value) {
      this.$emit('update:modelValue', [
        ...this.modelValue.slice(0, index),
        value,
        ...this.modelValue.slice(index + 1)
      ])
    }
  }
}
</script>
