<template>
  <div class="plot-viewer-page">
    <div class="container p-0">
      <div class="plot-container">
        <div id="plotly_graph" ref="plotly_plot_ref" class="vue-plotly" />
        <client-only>
          <div class="plot-controls">
            <data-filtering
              v-model:selection-x="filteredx"
              v-model:selection-y="filteredy"
              :titles="titles"
              @filter-clicked="onFilterClicked"
            ></data-filtering>
            <log-switch v-model="scaleState"></log-switch>
            <zoom-management
              v-model="plotly_layout"
              :plotlyPlot="plotly_plot_ref"
              :plotlyPlotReady="plotly_plot_ready"
              :dataReset="dataReset"
            ></zoom-management>
          </div>
        </client-only>
      </div>
      <plot-viewer-metadata
        :plotType="plotType"
        :file="file"
        :datasetInfo="datasetInfo"
      />
    </div>
  </div>
</template>

<script setup>
import { pathOr } from "ramda";
import PlotViewerMetadata from "@/components/ViewersMetadata/PlotViewerMetadata.vue";

import discover from "@/services/discover";
import { extractS3BucketName } from "@/utils/common";
import { getPlotlyInstance } from "@/utils/setupPlotly";

import {
  ZoomManagement,
  LogSwitch,
  DataFiltering,
} from "@abi-software/plotcomponents";
import {
  applyFilter,
  extractTitles,
  convertToPlotlyData,
} from "@abi-software/plotdatahelpers";
import { failMessage } from "@/utils/notification-messages";

const { plotInfo, file, datasetInfo } = defineProps({
  plotInfo: {
    type: Object,
    default: () => {
      return {
        share_link: "",
        status: "",
      };
    },
  },
  file: {
    type: Object,
    default: () => {},
  },
  datasetInfo: {
    type: Object,
    default: () => {},
  },
});

let plotly_data = ref(null);
let plotly_layout = ref(null);
let plotly_options = ref(null);

const filteredx = ref([]);
const filteredy = ref([]);
const titles = ref({ x: [], y: [] });
const dataReset = ref(true);
const plotly_plot_ref = ref(null);
const plotly_plot_ready = ref(false);
const source_uri = ref({});
const supplemental_data = ref([]);
const metadata = ref({});

let filtered_plotly_data = ref(null);

const isLoading = computed(
  () => toValue(plotly_plot_ref) === null || toValue(plotly_data) === null
);
const plotType = computed(() =>
  pathOr("", ["attrs", "style"], toValue(metadata))
);

const scaleState = computed({
  get: () => toValue(metadata)?.attrs?.logScale,
  set: value => (metadata.value.attrs.logScale = value),
});

function handlePlotDataError(error) {
  if (error.message === "Not Found") {
    failMessage("Some of the data for the plot is missing or incorrectly referenced, unable to show plot data.");
  } else {
    failMessage(`An unknown error occured, unable to show plot data: ${error.message}`)
  }
}

function isArrayWithEmptyString(arr) {
  return arr instanceof Array && arr.length === 1 && arr[0] === "";
}

watch(
  [() => plotInfo, () => datasetInfo],
  () => {
    const s3Bucket = datasetInfo
      ? extractS3BucketName(datasetInfo.uri)
      : undefined;

    try {
      metadata.value = JSON.parse(
        toValue(plotInfo).datacite.supplemental_json_metadata.description
      );
    } catch {
      failMessage("Metadata for plot is invalid, unable to show plot data.");
    }
    let apiCalls = [
      discover.downloadLink(
        `${toValue(datasetInfo).id}/files/${toValue(plotInfo).dataset.path}`,
        s3Bucket
      ),
    ];
    if (
      toValue(plotInfo).datacite.isSupplementedBy.path.length > 0 &&
      !isArrayWithEmptyString(toValue(plotInfo).datacite.isSupplementedBy.path)
    ) {
      apiCalls.push(
        discover.downloadLink(
          `${toValue(datasetInfo).id}/files/${
            toValue(plotInfo).datacite.isSupplementedBy.path[0]
          }`,
          s3Bucket
        )
      );
    }
    supplemental_data.value = [];
    Promise.allSettled(apiCalls).then(responses => {
      if (responses[0].value.status === 200) {
        source_uri.value = responses[0].value.data;
        if (responses.length > 1 && responses[1].value.status === 200) {
          supplemental_data.value = [{ uri: responses[1].value.data }];
        }
      }
    });
  },
  { immediate: true, deep: true }
);

watch([source_uri, scaleState], () => {
  convertToPlotlyData(
    toValue(source_uri),
    toValue(metadata),
    toValue(supplemental_data),
    plotly_data,
    plotly_layout,
    plotly_options,
    handlePlotDataError
  );
});

function onFilterClicked() {
  filtered_plotly_data.value = applyFilter(plotly_data, toValue(metadata), {
    x: toValue(filteredx),
    y: toValue(filteredy),
  });
}

async function updatePlot() {
  const Plotly = await getPlotlyInstance();
  Plotly.react(
    toValue(plotly_plot_ref),
    filtered_plotly_data.value
      ? toValue(filtered_plotly_data)
      : toValue(plotly_data),
    toValue(plotly_layout),
    {
      loading: false,
      scrollZoom: true,
      // displayModeBar: false,
      displaylogo: false,
      modeBarButtonsToRemove: [
        "zoom",
        "pan2d",
        "zoomIn2d",
        "zoomOut2d",
        "autoScale2d",
        "resetScale2d",
      ],
      ...toValue(plotly_options),
    }
  ).then(() => {
    plotly_plot_ready.value = true;
  });
}

watch([plotly_layout], () => {
  if (!toValue(isLoading) && toValue(plotly_layout).xaxis !== undefined) {
    updatePlot();
  }
});

watch(
  [plotly_data, filtered_plotly_data],
  () => {
    if (!toValue(isLoading)) {
      dataReset.value = false;
      setTimeout(() => {
        dataReset.value = true;
      }, 1);

      // plotly_plot_ready.value = true;

      extractTitles(plotly_data, toValue(metadata), titles);
      updatePlot();
    }
  },
  { deep: true }
);
</script>

<style lang="scss">
@import "@abi-software/plotcomponents/dist/plotcomponents.css";
@import "sparc-design-system-components-2/src/assets/_variables.scss";

.plot-container {
  margin-top: 1.5rem;
  // height: 90vh;
  max-width: calc(100% - 48px);
}

.plot-controls {
  display: flex;
  padding-top: 0.5rem;
  align-items: center;
}

.map-icon {
  color: $purple;
}

.page-heading {
  margin-bottom: 1.375rem;
}

.container {
  padding: 0;
}
</style>
