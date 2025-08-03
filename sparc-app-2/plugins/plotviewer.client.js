import { PlotVuer } from '@abi-software/plotvuer'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component("plot-vuer", PlotVuer);
})
