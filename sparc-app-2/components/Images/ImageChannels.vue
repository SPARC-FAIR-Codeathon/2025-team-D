<template>
  <div class="container">
    <div v-for="ch in channelColours" :key="ch.label" class="channel_item">
      <span
        :style="'background-color:' + ch.colour"
        class="channel_colour_box"
      />
      {{ ch.label }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageChannels',

  props: {
    channelColours: {
      type: Array,
      default: null
    }
  }
}
</script>

<style scoped>
.channel_colour_box {
  float: left;
  height: 1rem;
  width: 1rem;
  margin-right: 0.3rem;
  border: 1px solid black;
  clear: both;
}
</style>
