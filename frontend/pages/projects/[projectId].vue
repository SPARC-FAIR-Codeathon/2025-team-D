<script>
export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const newPath = route.href.replace('/projects', '/about/projects')
    router.replace({ path: newPath })
  },
}
</script>
