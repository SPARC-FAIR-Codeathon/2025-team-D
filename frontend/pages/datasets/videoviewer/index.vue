<script>
// Need to re-direct from the old path of /datasets/videoviewer?dataset_version={id}&dataset_id={id}&file_path={filePath} to the corresponding file with that viewer:
// Example: https://sparc.science/datasets/videoviewer?dataset_version=1&dataset_id=316&file_path=316%2F1%2Ffiles%2Fprimary%2Fsub-VN120219%2Fperf-12-17-19-awake%2FVN120219_2019-12-17_15-18-05.mp4&mimetype=video%2Fmp4 now maps to
// https://sparc.science/datasets/file/316/1?path=files%2Fprimary%2Fsub-VN120219%2Fperf-12-17-19-awake%2FVN120219_2019-12-17_15-18-05.mp4
export default {
  name: 'VideoViewerPage',

  async setup() {
    const router = useRouter()
    const route = useRoute()
    const datasetId = route.query.dataset_id
    const versionId = route.query.dataset_version
    // For some reason the file_path query param is preceded by datasetId/versionId/
    const index = route.query.file_path.indexOf('files')
    const filePath = route.query.file_path.substring(index)

    router.push(`/datasets/file/${datasetId}/${versionId}?path=${filePath}`)
  }
}
</script>
