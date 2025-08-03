<template>
  <client-only>
    <el-dialog
      :style="{ maxWidth: '54rem', minWidth: '22rem' }" 
      v-model="dialogVisible"
      :show-close="true"
      :append-to-body="true"
      @close="dialogVisible = false"
    >
      <template #header="{ titleId }">
        <div class="heading1" :id="titleId">Sign into SPARC</div>
      </template>
        <!-- eslint-disable vue/no-v-html -->
        <!-- marked will sanitize the HTML injected -->
        <div class="body1">
          <p>
            SPARC Portal login authentication is provided by <a href="https://orcid.org">ORCID iD</a>. Create a SPARC Portal account or sign in to your existing SPARC Portal account by using your existing ORCID iD credentials. If you do not have an existing ORCID iD, please <a href="https://orcid.org/register">register here</a> for a free account.
          </p>
          <p>
            Upon initial login to the SPARC Portal via ORCID iD, you will also be creating* an account on <a href="https://app.pennsieve.io/">Pennsieve</a> to unlock all the features the SPARC Portal has to offer.
          </p>
          <p>
            Learn more <a href="https://docs.sparc.science/docs/sparc-portal-login">here</a> about why a Pennsieve account is being created for you and which features are enabled by the SPARC Portal login.
          </p>
        </div>
        <el-button class="secondary" @click="onLoginWithORCID">
          <img
            class="orcid-logo mr-2"
            src="@/static/images/orcid_24x24.png"
            width="16"
            height="16"
            alt="Logo for ORCID"
          />
          Sign In With ORCID iD
        </el-button>
        <!-- eslint-disable vue/no-v-html -->
        <!-- marked will sanitize the HTML injected -->
        <p class="mt-16 body4">
          Use of the SPARC Portal, its data and resources, regardless of registration status, implies acceptance of the <a href="https://docs.sparc.science/docs/policies">SPARC Data and Resource Center Privacy Policy</a> and adherence to the <a href="https://docs.sparc.science/docs/terms-of-service">SPARC Terms of Service</a> and the <a href="https://docs.sparc.science/docs/instructions-for-sparc-investigators-to-cite-their-datasets-in-manuscripts-1">SPARC Citation Policy</a>. By signing in to SPARC, you are also accepting the <a href="https://docs.pennsieve.io/page/pennsieve-terms-of-use">Pennsieve Terms of Use</a> and <a href="https://docs.pennsieve.io/page/privacy-policy">Pennsieve Privacy Policy</a>.
        </p>
        <p class="body4">
          * If you already have an account on Pennsieve, you will be able to link your newly created SPARC account to it by entering your existing Pennsieve account's e-mail address when prompted.
        </p>
        <template #footer>
          <el-button @click="dialogVisible = false">
            Close
          </el-button>
        </template>
    </el-dialog>
  </client-only>
</template>

<script>
import marked from '@/mixins/marked/index'
import { mapActions } from 'pinia'
import { useMainStore } from '../../store'

export default {
  name: 'LoginModal',

  mixins: [marked],

  data() {
    return {
      dialogVisible: this.showDialog,
    }
  },
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
    redirectUrl: {
      type: String,
      default: ''
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

  methods: {
    ...mapActions(useMainStore, ['login']),
    onLoginWithORCID: async function(x) {
      x.preventDefault()
      this.dialogVisible = false
      await this.login('ORCID')
    },
  }
}
</script>
<style scoped lang="scss">
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.close-button-container {
  text-align: right;
}
.orcid-logo {
  vertical-align: text-top;
}
a {
  color: $purple;
}
:deep(.el-dialog__headerbtn):hover {
  color: $purple !important
}
</style>