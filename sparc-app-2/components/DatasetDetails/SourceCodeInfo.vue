<template>
  <div>
    <div class="heading2 mb-8">
      Repository
    </div>
    <div class="mb-16">
      The design and code files for the device are stored in a public repository on GitHUB. Please feel free to clone the repository for your usage.
    </div>
    <div class="mb-16"><span class="label4">Repository Link: </span><a target="_blank" :href="repoLink">{{ repoLink }}</a></div>
    <a
      :href="repoLink"
      target="_blank"
    >
      <el-button>
        Visit Repository <svgo-icon-open class="icon-open" />
      </el-button>
    </a>
  </div>
</template>

<script>
export default {
  name: 'SourceCodeInfo',
  props: {
    repoLink: {
      type: String,
      default: () => "",
      required: true
    },
  }
}
</script>

<style lang="scss" scoped>
.icon-open {
  height: 1.5rem;
  width: 1.5rem;
  margin-top: 2px;
}
</style>
