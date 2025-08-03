<template>
  <div class="mapClass">
    <MapContent
      class="map"
      ref="map"
      :state="state"
      :starting-map="startingMap"
      :showOpenMapButton="false"
      :options="options"
      :share-link="shareLink"
      :useHelpModeDialog="true"
      @updateShareLinkRequested="$emit('updateShareLinkRequested', $event)"
      @isReady="$emit('isReady')"
      @mapLoaded="$emit('mapLoaded', $event)"
      @trackEvent="onTrackEvent"
    />
  </div>
</template>

<script>
  import { MapContent } from "@abi-software/mapintegratedvuer"

  export default {
    name: 'MapViewer',
    components: {
      MapContent,
    },
    props: {
      /**
       * A link (URL) to share.
       */
      shareLink: {
        type: String,
        default: undefined
      },
      /**
       * State containing state of the scaffold.
       */
      state: {
        type: Object,
        default: undefined
      },
      /**
       * The options include APIs and Keys.
       */
      options: {
        type: Object,
        default: () => {},
        required: true
      },
      /**
       * New option to start the map in AC, FC or WholeBody.
       */
      startingMap: {
        type: String,
        default: "AC"
      }
    },
    methods: {
      getInstance: function(){
        return this.$refs.map;
      },
      onTrackEvent: function(eventData) {
        this.$gtm.push(eventData);
      },
    },
  }
</script>

<style scope lang="scss">
//@import 'sparc-design-system-components-2/src/assets/_variables.scss';
@import '@abi-software/mapintegratedvuer/dist/style.css';
@import '@abi-software/mapintegratedvuer/src/assets/mapicon-species-style.css';

.mapClass {
  position: relative;
  width: 100%;
  height: 100%;
  border: solid 1px #dcdfe6;
  box-shadow: 0 1px 8px 0 rgba(0, 0, 0, 0.06);

  .el-button.share-options {
    font-size:11px!important;
    padding: 5px 11px !important
  }

  .map-icon {
    color: #8300bf;
  }

  .background-popper.el-popover.el-popper,
  .open-map-popper.el-popover.el-popper,
  .context-card-popover.el-popover.el-popper {
    background: #fff !important;

    .el-popper__arrow::before {
      background-color: #fff !important;
    }
  }

  .context-card-popover {
    .flatmap-context-card,
    .context-card-container.context-card {
      border-radius: 4px;
    }
  }

  .open-map-popper.el-popover.el-popper {
    width: unset !important;
  }

  .pathway-container {
    .container {
      padding-left: 0px;
    }
  }

  .el-popover.right-popper {
    .popper__arrow {
      border-top-color: transparent !important;
      border-bottom-color: transparent !important;
    }
  }
}

.gallery-popper {
  background: #f3ecf6 !important;
  border: 1px solid #8300bf;
  border-radius: 4px;
  color: #303133 !important;
  font-size: 12px;
  line-height: 1rem;
  height: fit-content;
  padding: 10px;

  &.el-popper[x-placement^='top'] {
    .popper__arrow {
      border-top-color: #8300bf !important;
    }

    .popper__arrow:after {
      border-top-color: #f3ecf6 !important;
    }
  }
}
</style>
