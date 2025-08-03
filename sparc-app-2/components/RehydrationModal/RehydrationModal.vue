<template>
  <el-dialog class="px-16 pb-24" :style="{ maxWidth: '36rem', minWidth: '22rem' }" :visible="visible"
    @close="closeDialog">
    <template #header>
      <div class="heading2">Request Access</div>
    </template>
    <div class="rehydration-modal-container">
      <div class="copy-container">
        <div class="heading3">
          You are requesting temporary access for version {{ version }} of this
          dataset.
        </div>
        <p v-if="authenticatedUserEmail">
          After submitting your request, the dataset version will be temporarily accessible in an S3 folder. 
          An email notification from support@pennsieve.io will be sent to <b>{{ authenticatedUserEmail }}</b> once the restoration is complete within 24 hours. 
          Access lasts for 14 days before automatic removal. 
          Further details are available in the <a href="https://docs.sparc.science/docs/accessing-public-datasets">SPARC Help Center</a>.
        </p>
        <p v-else>
          After submitting your request, the dataset version will be temporarily accessible in an S3 folder. 
          You'll receive an email from support@pennsieve.io once the restoration is complete within 24 hours. 
          Access lasts for 14 days before automatic removal. Further details are available in the 
          <a href="https://docs.sparc.science/docs/accessing-public-datasets">SPARC Help Center</a>.
        </p>
      </div>
      <p>
        Please contact SPARC Support at <a href="mailto:support@sparc.science">support@sparc.science</a> if you have any
        questions.
      </p>
      <div v-if="!isUserAuthenticated">
        <el-form id="rehydration-request-form" ref="rehydrationForm" :model="rehydrationForm" :rules="rehydrationRules"
          @keyup.enter="onFormSubmit" hide-required-asterisk>
          <el-form-item label="Full Name" prop="unauthenticatedUserName">
            <el-input v-model="rehydrationForm.unauthenticatedUserName" class="full-name-input" autofocus></el-input>
          </el-form-item>
          <el-form-item label="Email" prop="unauthenticatedEmail">
            <el-input v-model="rehydrationForm.unauthenticatedEmail" />
          </el-form-item>
        </el-form>

      </div>
      <el-button @click="onFormSubmit">
        Submit
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'pinia'
import { pathOr } from 'ramda'
import { successMessage, failMessage } from '@/utils/notification-messages'
import { useMainStore } from '@/store/index'

export default {
  name: 'RehydrationModal',

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    version: {
      type: Number,
      default: 0
    },
    datasetId: {
      type: Number,
      default: 0
    },
    closeRehydrationDialog: {
      type: Function
    }
  },

  data() {
    return {
      rehydrationForm: {
        unauthenticatedUserName: '',
        unauthenticatedEmail: ''
      },
      rehydrationRules: {
        unauthenticatedUserName: [
          {
            required: true,
            message: 'Please enter your full name',
            trigger: 'blur',
          }
        ],
        unauthenticatedEmail: [
          {
            required: true,
            message: 'Please enter a valid email',
            trigger: 'blur',
            type: 'email'
          }
        ]
      },
      isRehydrationModalVisible: false,
      authenticatedUserEmail: '',
      isFormValid: false,
    }
  },

  computed: {
    ...mapState(useMainStore, ['userProfile', 'datasetInfo', 'userToken']),
    /**
     * checks to see if user is authenticated
     * @returns {Boolean}
     */
    isUserAuthenticated() {
      return this.userToken
    }
  },

  mounted() {
    this.authenticatedUserEmail = pathOr('', ['email'], this.userProfile)
  },

  methods: {
    /**
     * Clears the form
     */
    clearForm() {
      this.$refs.rehydrationForm.resetFields()
    },
    /**
     * Closes dialog
     */
    closeDialog() {
      if (!this.isUserAuthenticated) {
        this.clearForm();
      }
      this.$emit('close-rehydration-dialog');
    },
    onFormSubmit() {
      if (this.isUserAuthenticated) {
        this.submitRehydrationRequest();
      } else {
        this.$refs.rehydrationForm.validate(valid => {
          if (!valid) {
            return;
          }
          this.submitRehydrationRequest();
        })
      }
    },
    /**
     * Click Handler for submit rehydration request button
     */
    async submitRehydrationRequest() {
      const firstName = pathOr('', ['firstName'], this.userProfile)
      const lastName = pathOr('', ['lastName'], this.userProfile)
      const email = pathOr('', ['email'], this.userProfile)

      const url = `${this.$config.public.PENNSIEVE_API_VERSION_2}/discover/rehydrate`;

      await this.$axios.post(url, {
        datasetVersionId: this.version,
        datasetId: this.datasetId,
        name: this.isUserAuthenticated
          ? `${firstName} ${lastName}`
          : this.rehydrationForm.unauthenticatedUserName,
        email: this.isUserAuthenticated
          ? email
          : this.rehydrationForm.unauthenticatedEmail
      }).then(({ data }) => {
        if (data) {
          successMessage('Your request has been successfully submitted.')
        }
      }).catch(() => {
        failMessage('We encountered an error with your request. The request did not go through.')
      })
      this.closeDialog();

    }
  }
}
</script>
