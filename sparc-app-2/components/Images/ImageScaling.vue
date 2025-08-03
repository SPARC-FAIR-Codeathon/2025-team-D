<template>
  <div class="container">
    <div class="scale_item">
      <strong>X Scaling:</strong> {{ xScale }} &mu;m/pixel
    </div>
    <div class="scale_item">
      <strong>Y Scaling:</strong> {{ yScale }} &mu;m/pixel
    </div>
    <div v-if="haveZScale" class="scale_item">
      <strong>Z Scaling:</strong> {{ zScale }} &mu;m
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageScaling',

  props: {
    xScale: {
      type: String,
      default: ''
    },
    yScale: {
      type: String,
      default: ''
    },
    zScale: {
      type: String,
      default: ''
    }
  },
  computed: {
    haveZScale: function() {
      return this.zScale !== ''
    }
  }
}
</script>
