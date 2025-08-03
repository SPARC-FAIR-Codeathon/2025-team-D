<template>
  <div class="featured-data container py-24">
    <div class="categories-container mb-8">
      <h2 class="heading2 mt-0 mr-12">Find by</h2>
      <el-select class="categories-select" v-model="selectedCategory">
        <el-option v-for="category in categories" :key="category" :label="category" :value="category" />
      </el-select>
    </div>
    <client-only><gallery galleryItemType="featuredData" :card-width=Number(10) :items="selectedCategoryFeaturedData" /></client-only>
  </div>
</template>
<script setup>
import { ref, reactive, watch } from 'vue'
import { getAlgoliaFacets, facetPropPathMapping } from '../../utils/algolia'
import { isEmpty } from 'ramda'

const config = useRuntimeConfig()
const { $algoliaClient } = useNuxtApp()

const props = defineProps({
  featuredData: {
    type: Array,
    default: () => []
  },
  categories: {
    type: Array,
    default: () => []
  }
})

const selectedCategory = ref(null)
const facets = ref([])
const localFeaturedData = reactive([...props.featuredData])

if (props.categories?.length > 0) {
  selectedCategory.value = props.categories[0]
}

watch(
  () => props.featuredData,
  (newVal) => {
    localFeaturedData.splice(0, localFeaturedData.length, ...newVal)
  }
)
watch(
  () => props.categories,
  (newVal) => {
    if (newVal?.length > 0 && !selectedCategory.value) {
      selectedCategory.value = newVal[0]
    }
  }
)

const selectedCategoryFeaturedData = ref([])

watch(selectedCategory, async (newCategory) => {
  const categoryKey = facetPropPathMapping.find(item => item.label == newCategory)?.facetPropPath

  if (categoryKey) {
    // Load facets to determine links for the featured data
    const algoliaIndex = $algoliaClient.initIndex(config.public.ALGOLIA_INDEX)
    const facetsData = await getAlgoliaFacets(algoliaIndex, facetPropPathMapping)
    facets.value = facetsData.find(facet => facet.key == categoryKey)?.children || []

    // Update localFeaturedData with the links
    localFeaturedData.forEach(({ fields }) => {
      fields['linkWithFacets'] = getLink(fields, facets.value)
    })
    selectedCategoryFeaturedData.value = localFeaturedData.filter(data => data.fields.facetType == newCategory)
  }
},
  { immediate: true }
)

const filterOrgans = (contentfulFields, organFacets) => {
  const normStr = str => str.toLowerCase().trim()
  let organs = organFacets.filter(
    organ =>
      normStr(organ.label).includes(normStr(contentfulFields.label)) ||
      (contentfulFields.containsSearch &&
        contentfulFields.containsSearch.some(keyword => normStr(organ.label).includes(normStr(keyword))))
  )
  organFacets.forEach(organFacet => {
    if (!organFacet?.children?.length) return

    const subOrgans = organFacet.children.filter(
      subOrgan =>
        normStr(subOrgan.label).includes(normStr(contentfulFields.label)) ||
        (contentfulFields.containsSearch &&
          contentfulFields.containsSearch.some(keyword => normStr(subOrgan.label).includes(normStr(keyword))))
    )
    organs = organs.concat(subOrgans)
  })
  return organs
}

const getLink = (contentfulFields, organFacets) => {
  if (isEmpty(organFacets)) {
    return contentfulFields.link
  }
  const organIds = filterOrgans(contentfulFields, organFacets).map(organ => organ.id)
  return organIds.length === 0
    ? contentfulFields.link
    : `${contentfulFields.link}&selectedFacetIds=${organIds.join(',')}`
}
</script>
<style lang="scss" scoped>
.featured-data {
  text-align: center;
}
.categories-container {
  display: flex;
  text-align: left;
}
.categories-select {
  width: 12rem;;
}
</style>
