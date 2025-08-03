<script>
export default {
  setup() {
    const route = useRoute()
    const newPath = route.href.replace('/about/what-we-offer', '/about')
    const router = useRouter()
    router.replace({ path: newPath })
  }
}
</script>
