<script>
import scicrunch from '@/services/scicrunch'
// Need to re-direct from the old path of /datasets/plotviewer?dataset_id={id}&dataset_version={id}&identifier={packageId} to the corresponding file with that viewer:
// Example: https://sparc.science/datasets/plotviewer?dataset_id=46&dataset_version=2&identifier=package%3Acd272e68-94cb-497c-bb17-fbedceadabe8 now maps to
// https://sparc.science/datasets/file/46/2?path=files%2Fderivative%2FExperiment2_Meal-size.csv
export default {
  name: 'PlotViewerPage',

  async setup() {
    const router = useRouter()
    const route = useRoute()
    const datasetId = route.query.dataset_id
    const versionId = route.query.dataset_version

    const identifier = route.query.identifier
    const scicrunchResponse = await scicrunch.getDatasetInfoFromObjectIdentifier(
      identifier
    )
    const scicrunchData = scicrunchResponse.data.result[0]
    const matchedData = scicrunchData['abi-plot'].filter(function(el) {
      return el.identifier === identifier
    })
    const plot_info = matchedData[0]
    const filePath = `files/${plot_info.dataset.path}`
    
    router.push(`/datasets/file/${datasetId}/${versionId}?path=${filePath}`)
  }
}
</script>
