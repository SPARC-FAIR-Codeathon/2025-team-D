<template>
  <div class="error-404">
    <div class="container">
      <div class="subpage">
        <h1>This page does not exist</h1>
        <br />
        <!-- only display custom message if it is available -->
        <p v-if="error && error.display && error.message">
          {{ error.message }}
        </p>
        <p v-else>
          The link you clicked on may be broken or no longer exist.
        </p>
        <p>
          Please check our service status or consider submit a bug report if this page should exist.
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
import { useRoute } from 'vue-router'
export default {
  name: 'error-404',
  props: {
    error: {
      type: Object,
      default: () => {}
    }
  }
}
</script>
