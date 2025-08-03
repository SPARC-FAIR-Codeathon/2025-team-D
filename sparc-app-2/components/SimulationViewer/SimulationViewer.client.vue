<template>
  <div class="simulation-vuer-container">
    <simulation-vuer :apiLocation="apiLocation" :id="id" />
  </div>
</template>

<script>
  import { SimulationVuer } from '@abi-software/simulationvuer'
  
  export default {
    name: 'SimulationViewer',
    components: {
      SimulationVuer,
    },
    props: {
      /**
       * The the URL to the API location.
       */
      apiLocation: {
        required: true,
        type: String,
      },
      /**
       * The ID of the simulation-based dataset.
       */
      id: {
        required: true,
        type: Number,
      },
    },
  }
</script>

<style scope lang="scss">
@import '@abi-software/simulationvuer/dist/style.css';
.simulation-vuer-container {
  min-height: 24px;
  overflow: hidden;
}
</style>
