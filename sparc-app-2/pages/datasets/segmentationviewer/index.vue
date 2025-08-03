<script>
// Need to re-direct from the old path of /datasets/segmentationviewer?dataset_id={dataset_id}&dataset_version={dataset_version}&file_path={file_path} to the corresponding file with that viewer:
// Example: https://sparc.science/datasets/segmentationviewer?dataset_id=60&dataset_version=4&file_path=files/derivative/sub-22/sam-1/sub-22_sam-1_R22-1MergeMask+(1).xml now maps to
// https://sparc.science/datasets/file/60/4?path=files/derivative/sub-22/sam-1/sub-22_sam-1_R22-1MergeMask+(1).xml
export default {
  name: 'SegmentationViewerPage',

  async setup() {
    const router = useRouter()
    const route = useRoute()
    const datasetId = route.query.dataset_id
    const versionId = route.query.dataset_version
    const filePath = route.query.file_path
    const newPath = `/datasets/file/${datasetId}/${versionId}`
    
    router.replace({ path: newPath, query: {'path': filePath}})
  }
}
</script>
