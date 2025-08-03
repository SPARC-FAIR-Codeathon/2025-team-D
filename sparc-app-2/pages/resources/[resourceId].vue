<script>
export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const newPath = route.href.replace('/resources/', '/tools-and-resources/')
    router.replace({ path: newPath })
  },
}
</script>
