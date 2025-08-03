<template>
  <div id="container" class="mb-16">
    <el-row :gutter="20">
      <el-col :span="8">
        <img class="banner-image" :src="dataset?.banner" :alt="'image could not load'" />
      </el-col>
      <el-col :span="16">
        <nuxt-link
          class="dataset-name"
          :to="{
            name: 'datasets-datasetId',
            params: {
              datasetId: id
            }
          }"
        >
          {{ dataset?.name }}
        </nuxt-link>
        <div class="dataset-description mt-8">
          {{ dataset?.description }}
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
const getDiscoverData = async (axios, discoverHost, id) => {
  let dataset = {}
  await axios.get(`${discoverHost}/datasets/${id}`)
    .then(({ data }) => {
      dataset = data
    })
    .catch(() => {
    })
  return dataset
}
export default {
  name: 'DatasetCard',
  props: {
    id: {
      type: Number,
      default: 0
    }
  },
  async setup(props) {
    const config = useRuntimeConfig()
    const { $axios } = useNuxtApp()
    const dataset = ref()
    dataset.value = await getDiscoverData($axios, config.public.discover_api_host, props.id)
    return {
      dataset
    }
  },
  watch: {
    id: async function (val) {
      this.dataset = await getDiscoverData(this.$axios, this.$config.public.discover_api_host, val)
    }
  },
}
</script>

<style lang="scss" scoped>

.banner-image {
  display: block;
  width: 100%;
  max-height: 200px;
}

.dataset-name {
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
  text-decoration: underline;
}

.dataset-description {
  font-size: 14px;
  line-height: 20px;
  word-wrap: break-word;
}
</style>
