<template>
</template>

<script>
// supportOldRoutes:
//  Modifies the incoming $route.query to add the needed query parameters used in the new /scaffoldviewer route.
//  Note that modifying routes from Vue does not change the url, only the $route objecti in this component.
const supportOldRoutes = function(query) {
  if (query.scaffold) {
    // file_name
    const scaffold = query.scaffold
    const new_query = { }
    // dataset_id
    new_query.dataset_id = scaffold.substring(0, scaffold.indexOf('/')) || ''

    // version_number
    const postId =
      scaffold.substring(scaffold.indexOf('/') + 1, scaffold.length) || ''
    new_query.dataset_version = postId.substring(0, postId.indexOf('/')) || ''

    // file_path
    new_query.file_path =
      postId.substring(postId.indexOf('/') + 1, postId.length) || ''

    return new_query
  } else {
    return query
  }
}

export default {
  name: 'ScaffoldViewerPage',
  setup: function() {
    const router = useRouter()
    const route = useRoute()
    const query = supportOldRoutes(route.query)
    if (query && query.id) {
      query.scaffoldid = query.id
      delete query.id
    }
    router.replace({
      name: 'maps',
      query: {type: "scaffold", ...query}
    })
  }
}
</script>

