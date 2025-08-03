<template>
  <client-only>
    <div class="pb-32 page-data">
      <breadcrumb :breadcrumb="breadcrumb" :title="fileName" />
      <div class="container">
        <h1 hidden>File viewer for {{ file.path }}</h1>
        <form ref="zipForm" method="POST" :action="zipitUrl">
          <input v-model="zipData" type="hidden" name="data" />
        </form>  
        <span class="help-link" v-if="hasViewer && (activeTabId in helpers)">
          <a :href="`https://docs.sparc.science/docs/${helpers[activeTabId].link}`" target="_blank">
            Find out more about the {{ helpers[activeTabId].name }}
          </a>
        </span>
        <content-tab-card v-if="hasViewer" class="mt-24" :tabs="tabs" :active-tab-id="activeTabId">
          <biolucida-viewer v-if="hasBiolucidaViewer" v-show="activeTabId === 'imageViewer'" :data="biolucidaData"
            :datasetInfo="datasetInfo" :file="file" />
          <segmentation-viewer v-if="hasSegmentationViewer" v-show="activeTabId === 'segmentationViewer'"
            :data="segmentationData" :datasetInfo="datasetInfo" :file="file" />
          <plot-viewer v-if="hasPlotViewer" v-show="activeTabId === 'plotViewer'" :plotInfo="plotInfo"
            :datasetInfo="datasetInfo" :file="file" />
          <video-viewer v-if="hasVideoViewer" v-show="activeTabId === 'videoViewer'" :videoData="videoData"
            :videoSource="signedUrl" :datasetInfo="datasetInfo" :file="file" />
        </content-tab-card>
        <file-viewer-metadata v-if="!hasViewer" :datasetInfo="datasetInfo" :file="file"
          @download-file="executeDownload" />
      </div>
      <div v-if="hasRelatedDatasets" class="container">
        <div class="subpage">
          <div class="heading3 mb-16">
            Find related images among other datasets that share the same award id
          </div>
          <gallery galleryItemType="relatedDatasets" :items="relatedDatasets" :cardWidth="12" />
        </div>
      </div>
    </div>
  </client-only>
</template>

<script>
import discover from '@/services/discover'
import scicrunch from '@/services/scicrunch'
import BiolucidaViewer from '@/components/BiolucidaViewer/BiolucidaViewer'
import SegmentationViewer from '@/components/SegmentationViewer/SegmentationViewer'
import PlotViewer from '@/components/PlotViewer/PlotViewer.vue'
import VideoViewer from '@/components/VideoViewer/VideoViewer'
import FileViewerMetadata from '@/components/ViewersMetadata/FileViewerMetadata.vue'
import FormatDate from '@/mixins/format-date'
import FetchPennsieveFile from '@/mixins/fetch-pennsieve-file'
import FileDetails from '@/mixins/file-details'
import Gallery from '@/components/Gallery/Gallery.vue'

import { extractS3BucketName } from '@/utils/common'

import { isEmpty, pathOr, propOr } from 'ramda'
import { Base64  } from 'js-base64'

export default {
  name: 'DatasetFileDetailPage',

  components: {
    BiolucidaViewer,
    SegmentationViewer,
    PlotViewer,
    VideoViewer,
    FileViewerMetadata,
    Gallery
  },

  mixins: [
    FormatDate,
    FetchPennsieveFile,
    FileDetails
  ],

  async setup() {
    const router = useRouter()
    const route = useRoute()
    const config = useRuntimeConfig()
    const { $axios, $pennsieveApiClient, $algoliaClient } = useNuxtApp()
    const url = `${config.public.discover_api_host}/datasets/${route.params.datasetId}`
    var datasetUrl = route.params.datasetVersion ? `${url}/versions/${route.params.datasetVersion}` : url
    let datasetInfo = {}
    await $pennsieveApiClient.value.get(datasetUrl).catch(e => {
      console.log(`Could not get the dataset's info: ${e}`)
    }).then(({ data }) => {
      datasetInfo = data
    })
    const s3Bucket = datasetInfo ? extractS3BucketName(datasetInfo.uri) : undefined
    const filePath = route.query.path   
    const file = await FetchPennsieveFile.methods.fetchPennsieveFile(
      filePath,
      route.params.datasetId,
      route.params.datasetVersion
    )

    let packageType =
      file.packageType == 'Image' ? 'Image' : // Biolucida
        file.packageType == 'Unsupported' ? 'Unsupported' : // Segmentation
          'Others' // All other types of files, e.g. plot, video, timeseries, etc.
    //packageType is not correct for biolucida image in some cases so we will check
    //the extension as well
    if (packageType == 'Others' && file.name) {
      let extension = file.name.split('.').pop();
      if (extension === 'jp2' || extension === 'jpx') {
        packageType = 'Image'
      }
    }

    let sourcePackageId = ""
    // We must remove the N: in order for scicrunch to realize the package
    sourcePackageId = file.sourcePackageId
    const expectedScicrunchIdentifier = sourcePackageId != undefined ? sourcePackageId.replace("N:", "") : ""
    let scicrunchData = {}
    try {
      if ((packageType == 'Others' || packageType == 'Image') &&
        expectedScicrunchIdentifier != "") {
        const scicrunchResponse = await scicrunch.getDatasetInfoFromObjectIdentifier(expectedScicrunchIdentifier)
        const result = pathOr([], ['data', 'result'], scicrunchResponse)
        scicrunchData = result?.length > 0 ? result[0] : []
      }
    } catch(e) {
      console.log(`Error retrieving sci crunch data (possibly because there is none for this file): ${e}`)
    }

    let segmentationData = {}
    // We should just be able to just pull from scicrunch response as shown below, but due to discrepancies we pull from the sparc api endpoint
    // const matchedSegmentationData = scicrunchData['mbf-segmentation']?.filter(function(el) {
    //   return el.identifier == expectedScicrunchIdentifier
    // })
    // segmentationData = segmentationData?.length > 0 ? matchedSegmentationData[0] : {}*/
    try {
      if (packageType == 'Unsupported') {
        await discover.getSegmentationInfo(route.params.datasetId, filePath, s3Bucket).then(({ data }) => {
          segmentationData = data
          // file is from Pennsieve, filePath is from Scicrunch
          if (file.path != filePath) {
            // Normally filePath will be correct if file.path and filePath not the same
            file.path = filePath
            // Need to update the file.name as well if file.path is changed
            file.name = filePath.substring(filePath.lastIndexOf('/') + 1)
          }
        })
      }
    } catch(e) {
      console.log(`Error retrieving segmentation data (possibly because there is none for this file): ${e}`)
    }
    const hasSegmentationViewer = !isEmpty(segmentationData)

    let biolucidaData = {}
    let matchedBioData = scicrunchData['biolucida-2d']?.filter(function(el) {
      return el.identifier == expectedScicrunchIdentifier
    })
    if (!matchedBioData?.length) {
      matchedBioData = scicrunchData['biolucida-3d']?.filter(function(el) {
        return el.identifier == expectedScicrunchIdentifier
      })
    }
    if (matchedBioData?.length) {
      const image_id = pathOr('', ['biolucida', 'identifier'], matchedBioData[0])
      biolucidaData.biolucida_image_id = image_id
      // The encoded string is in the following format -
      // ${image_id}-col-${collection_id}, collection id can be any valid collection id
      // and 260 is used for now.
      const code = encodeURIComponent(Base64.encode(`${image_id}-col-260`))
      biolucidaData.share_link = `${config.public.BL_SHARE_LINK_PREFIX}${code}`
      biolucidaData.status = "Successful"
    }
    const hasBiolucidaViewer = !isEmpty(biolucidaData) && biolucidaData.status !== 'error' && biolucidaData.biolucida_image_id
    
    let plotInfo = {}
    const matchedplotInfo = scicrunchData['abi-plot']?.filter(function(el) {
      return el.identifier == expectedScicrunchIdentifier
    })
    plotInfo = matchedplotInfo?.length > 0 ? matchedplotInfo[0] : {}
    const hasPlotViewer = !isEmpty(plotInfo)

    let videoData = {}
    const matchedVideoData = scicrunchData['video']?.filter(function(el) {
      return el.identifier == expectedScicrunchIdentifier
    })
    videoData = matchedVideoData?.length > 0 ? matchedVideoData[0] : {}
    const hasVideoViewer = !isEmpty(videoData)
    let signedUrl = ""
    if (hasVideoViewer) {
      const videoConfig = {
        params: {
          key: `${route.params.datasetId}/${filePath}`,
          contentType: videoData.mimetype.name,
          s3BucketName: s3Bucket
        }
      }
      signedUrl = await $axios.get(
          `${config.public.portal_api}/download`,
          videoConfig
        )
        .then(({ data }) => {
          return data
        })
    }

    if (sourcePackageId !== 'details') {
      packageType = file.packageType
    }
    const hasTimeseriesViewer = packageType === 'TimeSeries'
    if (hasTimeseriesViewer && config.public.SHOW_TIMESERIES_VIEWER == 'true') {
      router.push(`/datasets/timeseriesviewer?dataset_id=${route.params.datasetId}&dataset_version=${route.params.datasetVersion}&file_path=${filePath}`)
    }

    let activeTabId = hasBiolucidaViewer ? 'imageViewer' :
      hasTimeseriesViewer ? 'timeseriesViewer' :
      hasSegmentationViewer ? 'segmentationViewer' : 
      hasPlotViewer ? 'plotViewer' :
      hasVideoViewer ? 'videoViewer' : ''

    const algoliaIndex = await $algoliaClient.initIndex(config.public.ALGOLIA_INDEX)
    const { supportingAwards } = await algoliaIndex.getObject(route.params.datasetId)
    const awardIds = supportingAwards.map(award => award.identifier).filter(identifier => identifier != undefined)
    let relatedDatasets = []
    try {
      relatedDatasets = await Promise.all(
        awardIds.map(async (awardId) => {
          const { data } = await $axios.get(`${config.public.portal_api}/project/${awardId}`)
          return data
        })
      )
      relatedDatasets = relatedDatasets.flat()
    } catch (error) {
        console.error('Error fetching related datasets:', error)
    }
    relatedDatasets = relatedDatasets.map((dataset) => {
      const datasetId = propOr('', 'objectID', dataset)
      const datasetName = pathOr('', ['pennsieve', 'name'], dataset)
      const datasetDescription = pathOr('', ['pennsieve', 'description'], dataset)
      const datasetBanner = pathOr('', ['pennsieve', 'banner', 'uri'], dataset)

      return {
        'name': datasetName,
        'description': datasetDescription,
        'id': datasetId,
        'banner': datasetBanner
      }
    })

    return {
      biolucidaData,
      videoData,
      plotInfo,
      segmentationData: {
        share_link: `${config.public.NL_LINK_PREFIX}/dataviewer?datasetId=${route.params.datasetId}&version=${route.params.datasetVersion}&path=${filePath}`,
        status: ''
      },
      file,
      hasBiolucidaViewer,
      hasPlotViewer,
      hasVideoViewer,
      hasSegmentationViewer,
      sourcePackageId,
      signedUrl,
      packageType,
      activeTabId,
      datasetInfo,
      relatedDatasets
    }
  },

  data: () => {
    const config = useRuntimeConfig()
    return {
      biolucidaData: {
        biolucida_image_id: '',
        share_link: '',
        status: ''
      },
      tabs: [],
      file: {},
      zipData: '',
      zipitUrl: config.public.zipit_api_host,
      helpers: {
        imageViewer: {
          name: 'Biolucida Viewer',
          link: 'image-viewer-overview'
        },
        segmentationViewer: {
          name: 'Segmentation Viewer',
          link: 'segmentation-viewer-overview'
        },
        plotViewer: {
          name: 'Plot Viewer',
          link: 'plot-viewer'
        }
      }
    }
  },

  computed: {
    hasViewer: function() {
      return this.hasBiolucidaViewer || this.hasSegmentationViewer || this.hasPlotViewer || this.hasVideoViewer
    },
    datasetId: function() {
      return this.$route.params.datasetId
    },
    readme: function() {
      return propOr('', 'readme', this.datasetInfo)
    },
    hasRelatedDatasets() {
      return !isEmpty(this.relatedDatasets)
    },
    breadcrumb: function() {
      return [
        {
          to: {
            name: 'index'
          },
          label: 'Home'
        },
        {
          to: {
            name: 'data'
          },
          label: 'Data & Models'
        },
        {
          to: {
            name: 'datasets-datasetId',
            params: {
              datasetId: this.datasetInfo.id
            },
          },
          label: `${this.datasetInfo.name}`
        },
        {
          to: {
            name: 'datasets-datasetId',
            params: {
              datasetId: this.datasetInfo.id
            },
            query: {
              datasetDetailsTab: 'files',
              path: `${this.fileFolderLocation}`
            }
          },
          label: 'File'
        }
      ]
    }
  },

  watch: {
    hasBiolucidaViewer: {
      handler: function(hasViewer) {
        if (hasViewer) {
          this.tabs.push({
            label: 'Biolucida Viewer',
            id: 'imageViewer'
          })
        } else {
          this.tabs = this.tabs.filter(tab => tab.id !== 'imageViewer')
        }
      },
      immediate: true
    },
    hasPlotViewer: {
      handler: function(hasViewer) {
        if (hasViewer) {
          this.tabs.push({
            label: 'Plot Viewer',
            id: 'plotViewer'
          })
        } else {
          this.tabs = this.tabs.filter(tab => tab.id !== 'plotViewer')
        }
      },
      immediate: true
    },
    hasVideoViewer: {
      handler: function(hasViewer) {
        if (hasViewer) {
          this.tabs.push({
            label: 'Video Viewer',
            id: 'videoViewer'
          })
        } else {
          this.tabs = this.tabs.filter(tab => tab.id !== 'videoViewer')
        }
      },
      immediate: true
    },
    hasSegmentationViewer: {
      handler: function(hasViewer) {
        if (hasViewer) {
          this.tabs.push({
            label: 'Segmentation Viewer',
            id: 'segmentationViewer'
          })
        } else {
          this.tabs = this.tabs.filter(tab => tab.id !== 'segmentationViewer')
        }
      },
      immediate: true
    }
  },

  methods: {
    executeDownload(file) {
      const version = this.$route.params.datasetVersion
      const datasetVersionRegexp = /(?<datasetId>\d*)\/(?<filePath>.*)/
      let params = file.uri.replace("s3://", "")
      let firstIndex = params.indexOf("/") + 1
      params = params.substr(firstIndex)
      const matches = params.match(datasetVersionRegexp)

      const payload = {
        paths: [matches.groups.filePath, "manifest.json"],
        datasetId: matches.groups.datasetId,
        version: version,
        archiveName: `sparc-portal-dataset-${this.datasetInfo.id}-version-${this.datasetInfo.version}-data`
      }

      this.zipData = JSON.stringify(payload, undefined)
      this.$nextTick(() => {
        this.$refs.zipForm.submit() // eslint-disable-line no-undef
      })
    },
    /**
     * Checks if file is MS Word, MS Excel, or MS Powerpoint
     * @param {Object} file
     */
    isMicrosoftFileType: function(file) {
      return (
        file.fileType == 'MSWord' ||
        file.fileType == 'MSExcel' ||
        file.fileType == 'PowerPoint'
      )
    },
  }
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';

.page-data {
  background-color: $background;
}
.help-link {
  float: right;
  @media screen and (max-width: 29rem) {
    float: none;
  }
}
.help-icon {
  color: $purple;
    height: 1.5rem;
    width: 1.5rem;
}
</style>
