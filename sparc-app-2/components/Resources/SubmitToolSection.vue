<template>
  <div class="subpage">
    <div class="heading2 mb-12">
      Submit a Tool or Resource
    </div>
    <div class="mb-12">
      Our goal is to collect useful Tools and Resources to share with the Community to enable researchers to access and enhance the current datasets and knowledge they can gain from the SPARC Portal for their own research.
    </div>
    <a
      :href="`/contact-us?type=tool`"
      target="_blank"
    >
      <el-button class="secondary">
        Submit Tool <svgo-icon-open class="icon-open" />
      </el-button>
    </a>
  </div>
</template>

<script>
export default {
  name: 'SubmitToolSection'
}
</script>
<style lang="scss" scoped>
.subpage {
  margin-top: 0;
  margin-bottom: 0;
  padding-top: 1rem;
}
.icon-open {
  height: 1rem;
  width: 1rem;
}
</style>
