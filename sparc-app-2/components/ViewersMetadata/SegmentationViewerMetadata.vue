<template>
  <div class="subpage pt-0 pb-16">
    <div class="file-detail">
      <strong class="file-detail__column_1">Dataset</strong>
      <div class="file-detail__column_2">
        <nuxt-link
          :to="{
            name: 'datasets-datasetId',
            params: {
              datasetId
            }
          }"
        >
          {{ title }}
        </nuxt-link>
      </div>
    </div>
    <div class="file-detail">
      <strong class="file-detail__column_1">Filename</strong>
      <div class="file-detail__column_2">
        {{ segmentation_info?.name }}
      </div>
    </div>
    <div class="file-detail">
      <strong class="file-detail__column_1">File location</strong>
      <div class="file-detail__column_2">
        <nuxt-link
          :to="{
            name: `datasets-datasetId`,
            params: {
              datasetId: datasetId
            },
            query: {
              datasetDetailsTab: 'files',
              path: fileFolderLocation
            }
          }"
        >
          {{ filePath }}
        </nuxt-link>
      </div>
    </div>
    <div class="file-detail">
      <strong class="file-detail__column_1">Data collection</strong>
      <div class="file-detail__column_2">
        {{ data_collection }}
      </div>
    </div>
    <div class="file-detail">
      <strong class="file-detail__column_1">Subject</strong>
      <div class="file-detail__column_2">
        {{ subjectId }}
      </div>
    </div>
    <div class="file-detail">
      <strong class="file-detail__column_1">Species</strong>
      <div class="file-detail__column_2">
        {{ human_readable_species }}
      </div>
    </div>
    <div class="file-detail">
      <strong class="file-detail__column_1">Sex</strong>
      <div class="file-detail__column_2">
        {{ sex }}
      </div>
    </div>
    <div class="file-detail">
      <strong class="file-detail__column_1">Age</strong>
      <div class="file-detail__column_2">
        {{ age }}
      </div>
    </div>
    <div class="file-detail">
      <strong class="file-detail__column_1">Organ</strong>
      <div class="file-detail__column_2">
        {{ organ }}
      </div>
    </div>
    <div class="pt-16">
      <el-button @click="requestDownloadFile({...file, version: versionId})">
        Download file
      </el-button>
    </div>
  </div>
</template>

<script>
import discover from '@/services/discover'
import general from '@/services/general'

import RequestDownloadFile from '@/mixins/request-download-file'
import ImageScaling from '@/components/Images/ImageScaling.vue'
import ImageChannels from '@/components/Images/ImageChannels.vue'
import MarkedMixin from '@/mixins/marked'
import FileDetails from '@/mixins/file-details'

import { baseName, extractSection, extractS3BucketName } from '@/utils/common'
import { pathOr, propOr } from 'ramda'

export default {
  name: "SegmentationViewerMetadata",
  components: {
    ImageScaling,
    ImageChannels
  },
  props: {
    segmentationData: {
      type: Object,
      default: () => {
        return {
          share_link: '',
          status: '',
        }
      }
    },
    file: {
      type: Object,
      default: () => {}
    },
    datasetInfo: {
      type: Object,
      default: () => {}
    },
  },
  mixins: [MarkedMixin, FileDetails, RequestDownloadFile],

  async setup(props) {
    try {
      const s3Bucket = props.datasetInfo ? extractS3BucketName(props.datasetInfo.uri) : undefined

      const [segmentation_info_response, readme_markdown] = await Promise.all([
        discover.getSegmentationInfo(
          props.datasetInfo.id,
          props.file.path,
          s3Bucket
        ),
        fetch(props.datasetInfo.readme).then((response) => {
          return response.text()
        })
      ])
      const segmentation_info = {
        ...segmentation_info_response.data,
        name: baseName(props.file.path)
      }

      const species_lookup_response = await general.lookupOntoTerm(segmentation_info?.subject.species)

      const human_readable_species = species_lookup_response.label

      const html = MarkedMixin.methods.parseMarkdown(readme_markdown)
      const data_collection = extractSection(/data collect[^:]+:/i, html)
      return {
        segmentation_info,
        human_readable_species,
        data_collection
      }
    } catch (e) {
      console.log(e)
    }
  },

  computed: {
    title: function() {
      return propOr("", 'name', this.datasetInfo)
    },
    datasetId() {
      return propOr(undefined, "id", this.datasetInfo)
    },
    versionId() {
      return propOr(undefined, "version", this.datasetInfo)
    },
    segmentationType: function() {
      return 'application/vnd.mbfbioscience.neurolucida+xml'
    },
    subjectId() {
      return pathOr("", ['subject','subjectid'], this.segmentation_info)
    },
    sex() {
      return pathOr("", ['subject','sex'], this.segmentation_info)
    },
    age() {
      return pathOr("", ['subject','age'], this.segmentation_info)
    },
    organ() {
      return pathOr("", ['atlas','organ'], this.segmentation_info)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/_viewer.scss';
</style>
