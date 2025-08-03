<script>
import { pathOr, isEmpty } from 'ramda'
import { infoMessage } from '@/utils/notification-messages'
export default {
  setup() {
    const route = useRoute()
    const query = pathOr('', ['query'], route)
    let newPath = ''
    if (isEmpty(query)) {
      newPath = route.href.replace('/maps', '/apps')
      infoMessage('All available map viewers have now been integrated with SPARC Apps and can be found below!')
    } else {
      newPath = route.href.replace('/maps', `/apps/maps?${query}`)
    }
    const router = useRouter()
    router.replace({ path: newPath, query: query })
  }
}
</script>
