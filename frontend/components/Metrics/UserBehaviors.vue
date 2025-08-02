<template>
  <div class="user-behaviors-container p-16 mt-16">
    <div class="heading2 mb-0">
      Page Views
    </div>
    <BarChart
      :chartData="pageChartData"
      :chartOptions="pageChartOptions"
    />
    <hr class="my-16"/>
    <div class="heading2 mb-0">
      User Types
    </div>
    <BarChart
      :chartData="usersChartData"
      :chartOptions="usersChartOptions"
    />
    <hr class="mt-16 mb-32"/>
    <div class="grid-container">
      <div class="grid">
        <div class="card">
          <div class="heading2">Dataset Downloads</div>
          <div class="heading1 data">{{ totalDownloads }}</div>
          <div class="sub-label">({{ totalDownloadsLastMonth }} in {{ monthLastUpdated }})</div>
        </div>
        <div class="card">
          <div class="heading2">Dataset Contributors</div>
          <div class="heading1 data">{{ totalContributers }}</div>
          <div class="sub-label">({{ newContributers }} new in {{  monthLastUpdated }})</div>
        </div>
        <div v-if="totalCitations" class="card">
          <div class="heading2">Dataset Citations</div>
          <div class="heading1 data">{{  totalCitations }}</div>
        </div>
        <div v-if="totalProtocolViews" class="card">
          <div class="heading2">Protocol Views</div>
          <div class="heading1 data">{{ totalProtocolViews }}</div>
        </div>
      </div>
    </div>
    <div class="body1 mt-32">
      Last metrics update: {{ monthLastUpdated }} {{ yearLastUpdated }}
    </div>
  </div>
</template>

<script>

import { pathOr, propOr } from 'ramda'
import BarChart from '@/components/Charts/BarChart.vue'

export default {
  name: 'UserBehaviors',
  components: {
    BarChart
  },
  props: {
    metricsData: {
      type: Object,
      default: () => {}
    },
    dateLastUpdated: {
      type: Date
    }
  },
  async setup() {
    const config = useRuntimeConfig()
    const { $axios } = useNuxtApp()
    let totalProtocolViews
    let totalCitations
    try {
      const { data } = await $axios.get(`${config.public.portal_api}/total_protocol_views`)
      totalProtocolViews = data['total_views']
    } catch (err) {
      console.error('Error retrieving total protocol views.', err)
    }
    try {
      const { data } = await $axios.get(`${config.public.portal_api}/total_dataset_citations`)
      totalCitations = data['total_citations']
    } catch (err) {
      console.error('Error retrieving total citations.', err)
    }
    return {
      totalProtocolViews,
      totalCitations
    }
  },
  watch: {
    userBehaviors: {
      handler: function(behaviors) {
        if (!behaviors) {
          return
        }
        this.pageChartData = {
          labels: behaviors.pageViewsLabels,
          datasets: [ 
            { 
              label: 'Last Month',
              backgroundColor: [
                'rgba(131, 0, 191, .5)',
                'rgba(131, 0, 191, .5)',
                'rgba(131, 0, 191, .5)',
                'rgba(131, 0, 191, .5)',
                'rgba(131, 0, 191, .5)',
                'rgba(131, 0, 191, .5)',
              ],
              borderColor: 'rgba(131, 0, 191, .5)',
              data: behaviors.pageViewsData?.lastMonth
            },
            { 
              label: 'Last Quarter',
              backgroundColor: [
                'rgba(188, 0, 252, .25)',
                'rgba(188, 0, 252, .25)',
                'rgba(188, 0, 252, .25)',
                'rgba(188, 0, 252, .25)',
                'rgba(188, 0, 252, .25)',
                'rgba(188, 0, 252, .25)',
              ],
              borderColor: 'rgba(188, 0, 252, .25)',
              data: behaviors.pageViewsData?.last3Months
            }
          ]
        }
        this.usersChartData = {
          labels: [ 'Returning', 'New' ],
          datasets: [ 
            { 
              label: 'Last Month',
              backgroundColor: [
                'rgba(131, 0, 191, .5)',
                'rgba(131, 0, 191, .5)',
              ],
              borderColor: 'rgba(131, 0, 191, .5)',
              data: behaviors.usersData?.lastMonth
            },
            { 
              label: 'Last Quarter',
              backgroundColor: [
                'rgba(188, 0, 252, .25)',
                'rgba(188, 0, 252, .25)',
              ],
              borderColor: 'rgba(188, 0, 252, .25)',
              data: behaviors.usersData?.last3Months
            }
          ]
        }
      },
      immediate: true
    }
  },
  data() {
    return {
      pageChartData: {},
      pageChartOptions: {
        responsive: true,
        drawOnChartArea: false,
        scales: {
          x: {
            barPercentage: 1.0,
            grid: {
              drawTicks: false,
              drawOnChartArea: false,
              lineWidth: 2
            },
            ticks: {
              padding: 8,
              fontFamily: 'sans-serif',
              fontSize: 16,
              fontStyle: 'bold'
            },
          },
          y: {
            grid: {
              drawTicks: true,
              drawOnChartArea: false,
              lineWidth: 2
            },
            ticks: {
              display: true,
              padding: 3,
              callback: (value, index, values) => {
                // we only want to show the greatest value tick
                if (values[values.length-1].value == value) {
                  return value
                }
              }
            },
            scaleLabel: {
              display: false,
            }
          },
        },
        plugins: {
          legend: {
            labels: {
              boxWidth: 13
            },
            position: 'right',
            align: 'start',
          },
          datalabels: {
            anchor: 'end',
            align: 'top',
            formatter: Math.round,
            font: {
                weight: 'bold',
                size: 16
            }
          }
        }    
      },
      usersChartData: {},
      usersChartOptions: {
        responsive: true,
        drawOnChartArea: false,
        scales: {
          y: {
            grid: {
              drawTicks: true,
              drawOnChartArea: false,
              lineWidth: 2
            },
            ticks: {
              display: true,
              padding: 3,
              callback: (value, index, values) => {
                // we only want to show the greatest value tick
                if (values[values.length-1].value == value) {
                  return value
                }
              }
            },
            scaleLabel: {
              display: false
            }
          },
          x: {
            barPercentage: 1.0,
            grid: {
              drawTicks: false,
              drawOnChartArea: false,
              lineWidth: 2
            },
            ticks: {
              padding: 8,
              fontFamily: 'sans-serif',
              fontSize: 16,
              fontStyle: 'bold'
            },
          }
        },
        plugins: {
          legend: {
            labels: {
              boxWidth: 13
            },
            position: 'right',
            align: 'start',
          },
          datalabels: {
            anchor: 'end',
            align: 'top',
            formatter: Math.round,
            font: {
                weight: 'bold',
                size: 16
            }
          }
        }    
      }
    }
  },
  computed: {
    userBehaviors() {
      return propOr({}, 'userBehaviors', this.metricsData)
    },
    totalDownloads() {
      return pathOr('', ['totalDownloadsData', 'total'], this.userBehaviors)
    },
    totalDownloadsLastMonth() {
      return pathOr('', ['totalDownloadsData', 'lastMonth'], this.userBehaviors)
    },
    totalDownloadsLastQuarter() {
      return pathOr('', ['totalDownloadsData', 'last3Months'], this.userBehaviors)
    },
    totalContributers() {
      return pathOr('', ['datasetContributorsData', 'total'], this.userBehaviors)
    },
    newContributers() {
      return pathOr('', ['datasetContributorsData', 'newLastMonth'], this.userBehaviors)
    },
    monthLastUpdated() {
      return this.dateLastUpdated ? this.dateLastUpdated.toLocaleString('default', { month: 'long' }) : undefined
    },
    yearLastUpdated() {
      return this.dateLastUpdated ? this.dateLastUpdated.getFullYear() : undefined
    },
  },
}

</script>
<style scoped lang="scss">
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.user-behaviors-container {
  background: white;
}

hr {
  border-top: none;
  border-left: none;
  border-right: none;
  border-width: 2px;
  border-color: $lineColor1;
}

.grid-container {
  display: flex;
  justify-content: center;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  row-gap: 2rem;
  column-gap: 8rem;
  max-width: 800px;
}

.card {
  background: white;
  padding: 1.25rem;
  text-align: center;
  min-height: 6.5rem;
  border: 1px solid $lineColor2;
}

.data {
  color: $purple;
}
</style>
