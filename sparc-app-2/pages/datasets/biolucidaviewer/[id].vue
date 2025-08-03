<script>
import biolucida from '@/services/biolucida'
import scicrunch from '@/services/scicrunch'
import { pathOr } from 'ramda'
// Need to re-direct from the old path of /datasets/biolucidaviewer/{imageId}?view={viewId}&dataset_version={id}&dataset_id={id}&item_id={packageId} to the corresponding file with that viewer:
// Example: https://sparc.science/datasets/biolucidaviewer/7543?view=NzU0My1jb2wtMTk0&dataset_version=2&dataset_id=226&item_id=N%3Apackage%3A2c9b015d-1357-42be-945d-f8099adea9b5 now maps to
// https://sparc.science/datasets/file/226/2?path=files%2Fderivative%2Fsub-10896%2Fsam-3%2F896-5_F1.jp2
export default {
  name: 'BiolucidaViewerPage',

  async setup() {
    const router = useRouter()
    const route = useRoute()
    const image_identifier = route.params.id
    const datasetId = route.query.dataset_id
    const versionId = route.query.dataset_version
    const [
      image_info,
      dataset_response
    ] = await Promise.all([
      biolucida.getImageInfo(image_identifier),
      scicrunch.getDatasetInfoFromPennsieveIdentifier(datasetId)
    ])
    let dataset_info = dataset_response.data.result[0]
    if (dataset_info === undefined) {
      redirect(`/datasets/file/${datasetId}/${versionId}`)
    } else {
      // Find the biolucida object with the same image name to determine the file path
      const biolucidaObjects = pathOr(
        [],
        ['biolucida-2d'],
        dataset_info
      ).concat(pathOr([], ['biolucida-3d'], dataset_info))
      const biolucidaObject = biolucidaObjects.find(biolucidaObject => {
        return pathOr('', ['dataset', 'path'], biolucidaObject).includes(
          image_info.name
        )
      })
      const filePath = `files/${pathOr(
        '',
        ['dataset', 'path'],
        biolucidaObject
      )}`
      router.push(`/datasets/file/${datasetId}/${versionId}?path=${filePath}`)
    }
  }
}
</script>
