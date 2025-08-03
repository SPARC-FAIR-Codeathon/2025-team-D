<template>
  <div class="dataset-references">
    <div class="heading2 mb-8">
      Metrics
    </div>
    <div class="body1" v-loading="loadingMetrics">
      <div>
        Citations: <span class="label4">{{ citations }}</span>
      </div>
      <div>
        Downloads: <span class="label4">{{ fullDownloads }}</span>
      </div>
      <div v-if="protocolSuffixes?.length > 0">
        Protocols: 
        <sparc-tooltip
          placement="left-center"
        >
        <template #item>
          <svgo-icon-help class="help-icon"/>
        </template>
          <template #data>
            Protocol metrics come from <a href="https://protocols.io" target="_blank">Protocols.io</a>
          </template>
        </sparc-tooltip>
      </div>
      <div v-for="(suffix, index) in protocolSuffixes" :key="index">
        <div class="ml-32">
          Protocol Link: <a :href="'https://dx.doi.org/10.17504/' + suffix" target="_blank">https://dx.doi.org/10.17504/{{ suffix }}</a>
        </div>
        <div class="ml-32">
          Protocol Views: <span class="label4">{{ getProtocolViews(suffix) }}</span>
        </div>
        <div class="ml-32">
          Number of Protocol Forks:
        </div>
        <div class="ml-64">
          Private: <span class="label4">{{ getProtocolPrivateForks(suffix) }}</span>
        </div>
        <div class="ml-64">
          Public: <span class="label4">{{ getProtocolPublicForks(suffix) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { pathOr } from 'ramda'

const protocolsMap = ref({})
const loadingMetrics = ref(true)

const props = defineProps({
  protocolSuffixes: Array,
  citations: Number,
  fullDownloads: Number
})
const { protocolSuffixes } = toRefs(props)

const config = useRuntimeConfig()
const { $axios } = useNuxtApp()

async function fetchWithRetry(axios, url, retries = 3, delay = 500) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const headers = {
        headers: {
          Authorization: `Bearer ${config.public.PROTOCOLS_IO_TOKEN}`
        }
      }
      const { data } = await axios.get(url, headers)
      return pathOr(null, ['payload', 'stats'], data)
    } catch (err) {
      if (attempt < retries) {
        await new Promise((res) => setTimeout(res, delay))
      } else {
        console.error(`Failed after ${retries} retries: ${url}`)
        return null
      }
    }
  }
}

async function fetchProtocolsWithLimit(suffixes, $axios, config, concurrency = 5) {
  if (!suffixes) { return }
  const results = {}
  const queue = [...suffixes]

  const workers = Array.from({ length: concurrency }, async () => {
    while (queue.length > 0) {
      const suffix = queue.shift()
      const url = `${config.public.PROTOCOLS_IO_HOST}/api/v4/protocols/${suffix}`
      const data = await fetchWithRetry($axios, url)
      results[suffix] = data
    }
  })

  await Promise.all(workers)
  return results
}


protocolsMap.value = await fetchProtocolsWithLimit(protocolSuffixes?.value, $axios, config, 5)

loadingMetrics.value = false

const getProtocolViews = (protocolSuffix) => {
  return pathOr('N/A', [protocolSuffix,'number_of_views'], protocolsMap.value)
}

const getProtocolPrivateForks = (protocolSuffix) => {
  return pathOr('N/A', [protocolSuffix,'number_of_forks', 'private'], protocolsMap.value)
}

const getProtocolPublicForks = (protocolSuffix) => {
  return pathOr('N/A', [protocolSuffix,'number_of_forks', 'public'], protocolsMap.value)
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.help-icon {
  color: $purple;
  height: 1.5rem;
  width: 1.5rem;
}
</style>
