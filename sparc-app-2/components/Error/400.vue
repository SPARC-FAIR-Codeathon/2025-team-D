<template>
  <div class="error-400">
    <div class="container">
      <div class="subpage">
        <!-- only display custom message if it is available -->
        <p v-if="error && error.display && error.message">
          {{ error.message }}
        </p>
        <p v-else>
          One of our external resources is down. This part of the site is not
          accessible. Please come back later.
        </p>
        <p>
          Please check our service status or consider submit a bug report if the
          issue persists.
        </p>
        <br />
        <el-row>
          <el-col :span="3">
            <a
              href="https://docs.sparc.science/docs/portal-status"
              target="_blank"
            >
              Service Status
            </a>
          </el-col>
          <el-col :span="4">
            <nuxt-link
              :to="{
                name: 'contact-us',
                query: {
                  type: 'bug',
                  source_url: $route.fullPath
                }
              }"
            >
              Submit A Bug Report
            </nuxt-link>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ErrorPage',
  props: ['error']
}
</script>
