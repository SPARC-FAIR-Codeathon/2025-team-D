<template>
  <large-modal
    v-if="dialogVisible"
    :visible="dialogVisible"
    @close-download-dialog="dialogVisible = false"
  >
    <template #mainContent>
      <div v-loading="agreementLoading" class="content p-16">
        <h1 class="heading1 mb-8">
          {{ title }}
        </h1>
        <div class="agreement-body-container">
          <span class="agreement-body" v-html="content" />
        </div>
        <div class="mt-16">
          <sparc-checkbox
            v-model="checkboxVal"
            :label=true
            display="I agree to the terms and conditions of this data use agreement."
          />
        </div>
        <div class="close-button-container pt-16">
          <el-button class="secondary" @click="dialogVisible = false">
            Cancel
          </el-button>
          <el-button :disabled="!hasAcceptedAgreement" @click="submit">
            Accept and Submit
          </el-button>
        </div>
      </div>
    </template>
  </large-modal>
</template>
<script>
import { pathOr, propOr } from 'ramda'

export default {
  name: 'DataUseAgreementPopup',
  data() {
    return {
      dialogVisible: false,
      checkboxVal: false,
      dataUseAgreement: {},
      agreementLoading: true
    }
  },
  props: {
    showDialog: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    showDialog: {
      handler: function(show) {
        if (show) {
          this.dialogVisible = true
        }
      }
    },
    dialogVisible: {
      handler: function(show) {
        if (!show) {
          this.$emit('dialog-closed')
        }
      }
    }
  },
  computed: {
    hasAcceptedAgreement() {
      return this.checkboxVal
    },
    title() {
      return propOr('', 'name', this.dataUseAgreement)
    },
    content() {
      return propOr('', 'body', this.dataUseAgreement)
    }
  },
  mounted() {
    const datasetId = pathOr('', ['params', 'datasetId'], this.$route)
    const url = `${this.$config.public.discover_api_host}/datasets/${datasetId}/data-use-agreement`
    this.$axios
      .get(url)
      .then(({ data }) => {
        this.dataUseAgreement = data
      })
      .catch(() => {
        return
      })
      .finally(() => {
        this.$emit('agreement-loaded', propOr(null, 'id', this.dataUseAgreement))
        this.agreementLoading = false
      })
  },
  methods: {
    submit: async function(x) {
      x.preventDefault()
      this.dialogVisible = false
      this.$emit('agreement-signed', true)
    },
  }
}
</script>
<style scoped lang="scss">
.close-button-container {
  text-align: right;
}
.agreement-body-container {
  max-height: 20rem; 
  overflow: auto;  
}
.agreement-body {
  white-space: pre-wrap;
  overflow-wrap: break-word;
}
</style>
