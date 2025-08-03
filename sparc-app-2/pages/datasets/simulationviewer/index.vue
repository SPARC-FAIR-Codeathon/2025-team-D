<template>
  <div class="simulation-viewer-page">
    <div class="page-wrap container">
      <hi hidden>Simulation viewer</hi>
      <content-tab-card
        class="mt-24"
        :tabs="tabs"
        :active-tab-id="activeTabId"
      >
        <client-only placeholder="Loading simulation ...">
          <div class="simulation-vuer-container">
            <simulation-viewer :apiLocation="apiLocation" :id="id" />
          </div>
        </client-only>
      </content-tab-card>
    </div>
  </div>
</template>

<script>

export default {
  name: "SimulationViewerPage",
  setup() {
    const route = useRoute()
    const config = useRuntimeConfig()
    return {
      activeTabId: "simulationViewer",
      apiLocation: config.public.portal_api,
      id: Number(route.query.id),
      tabs: [
        {
          label: "Simulation Viewer",
          id: "simulationViewer",
        }
      ],
    }
  },
};
</script>
