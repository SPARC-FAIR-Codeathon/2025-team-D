<script>
export default {
  setup() {
    const route = useRoute()
    const newPath = route.href.replace('/about/team-and-leadership', '/about')
    const router = useRouter()
    router.replace({ path: newPath })
  }
}
</script>
