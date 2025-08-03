<template>
  <el-form
    ref="submitForm"
    label-position="top"
    :model="form"
    :rules="formRules"
    :hide-required-asterisk="true"
  >
    <el-form-item
      prop="shortDescription"
      label="Draft title of dataset *"
    >
      <el-input
        v-model="form.shortDescription"
        placeholder="A brief description of the data you'd like to contribute. For example, your draft manuscript title would be fine here."
      />
    </el-form-item>

    <el-form-item prop="detailedDescription" label="Please provide a short description of the research *">
      <el-input
        v-model="form.detailedDescription"
        type="textarea"
        :rows="3"
        placeholder="A few sentences that describe the experiment and the data acquired and analyzed. For example, a portion of your draft manuscript abstract would be fine to provide here."
      />
    </el-form-item>

    <el-form-item
      class="mt-32"
      prop="publishedManuscript"
      label="Have you submitted the manuscript that interprets this data for consideration by a journal? *"
    >
      <sparc-radio
        :value="form.publishedManuscript"
        @input="form.publishedManuscript = $event.target.value"
        label="No"
        display="No"
      />
      <sparc-radio
        :value="form.publishedManuscript"
        @input="form.publishedManuscript = $event.target.value"
        label="Yes"
        display="Yes"
      />
      <sparc-radio
        :value="form.publishedManuscript"
        @input="form.publishedManuscript = $event.target.value"
        label="Pending"
        display="Pending"
      />
      <sparc-radio
        :value="form.publishedManuscript"
        @input="form.publishedManuscript = $event.target.value"
        label="Published"
        display="Published"
      />
    </el-form-item>

    <el-form-item
      class="mt-0 vertical-content"
      prop="manuscriptDoi"
      :disabled="form.publishedManuscript == 'No' || form.publishedManuscript == ''"
    >
      <url-input :disabled="form.publishedManuscript == 'No' || form.publishedManuscript == ''" v-model="form.manuscriptDoi" placeholder="Enter DOI URL"/>
    </el-form-item>

    <div class="heading3 mt-32">
      The next questions help us understand the lab organization related to data contributions. Typically, there is someone who manages the dataset creation process, which may or may not be the Dataset Owner. The dataset owner is typically the Principal Investigator (PI) of the originating lab.
    </div>

    <el-form-item
      class="mt-32"
      prop="isDatasetOwner"
      label="Are you the dataset owner? *"
    >
      <sparc-radio
        :value="form.isDatasetOwner"
        @input="form.isDatasetOwner = $event.target.value"
        label="Yes"
        display="Yes"
      />
      <sparc-radio
        :value="form.isDatasetOwner"
        @input="form.isDatasetOwner = $event.target.value"
        label="No"
        display="No"
      />
    </el-form-item>

    <el-form-item :disabled="form.isDatasetOwner == 'Yes'" prop="datasetOwnerName" label="Dataset owner name, if not self:">
      <el-input :disabled="form.isDatasetOwner == 'Yes'" v-model="form.datasetOwnerName" placeholder="Enter their full name" />
    </el-form-item>

    <el-form-item :disabled="form.isDatasetOwner == 'Yes'" prop="datasetOwnerEmail" label="Dataset owner email, if not self:">
      <el-input :disabled="form.isDatasetOwner == 'Yes'" v-model="form.datasetOwnerEmail" placeholder="Enter their email address" type="email" />
    </el-form-item>

    <div class="heading3 mt-32">
      Tell us about the data. We can reduce the cost to curate and publish datasets from your lab based on the number you anticipate contributing.
    </div>

    <el-form-item
      class="mt-32"
      prop="datasetSize"
      label="What is the approximate total size of your dataset? *"
    >
      <sparc-radio
        :value="form.datasetSize"
        @input="form.datasetSize = $event.target.value"
        label="<100GB"
        display="< 100 GB"
      />
      <sparc-radio
        :value="form.datasetSize"
        @input="form.datasetSize = $event.target.value"
        label="<1TB"
        display="< 1 TB"
      />
      <sparc-radio
        :value="form.datasetSize"
        @input="form.datasetSize = $event.target.value"
        label="≥1TB"
        display="≥ 1 TB"
      />
    </el-form-item>

    <el-form-item
      prop="numDatasets"
      label="Including the dataset you are inquiring about now, how many datasets are you interested in contributing? *"
    >
      <el-select
        v-model="form.numDatasets"
        placeholder="Select one"
      >
        <el-option
          label="1"
          value="1"
        />
        <el-option
          label="<5"
          value="<5"
        />
        <el-option
          label="6+"
          value="6+"
        />
      </el-select>
    </el-form-item>

    <hr/>

    <user-contact-form-item v-model="form.user"/>

    <hr/>

    <div class="heading2">
      Please check the box to proceed
    </div>

    <el-form-item prop="captchaToken">
      <NuxtTurnstile v-model="form.captchaToken"/>
    </el-form-item>

    <hr/>

    <el-form-item>
      <el-button class="primary" :disabled="isSubmitting" @click="onSubmit">
        Submit
      </el-button>
      <p v-if="hasError" class="error">
        An error has occurred, please try again.
      </p>
    </el-form-item>
  </el-form>
</template>

<script>
import { useMainStore } from '@/store/index'
import NewsletterMixin from '@/components/ContactUsForms/NewsletterMixin'
import RecaptchaMixin from '@/mixins/recaptcha/index'
import UserContactFormItem from '@/components/ContactUsForms/UserContactFormItem.vue'
import ParseInputMixin from '@/mixins/parse-input/index'
import { saveForm, loadForm, populateFormWithUserData } from '~/utils/utils'
import UrlInput from '@/components/Url/UrlInput.vue'

export default {
  name: 'FeedbackForm',

  mixins: [NewsletterMixin, RecaptchaMixin, ParseInputMixin],

  components: {
    UserContactFormItem,
    UrlInput
  },

  data() {
    const validateEmail = (rule, value, callback) => {
      if (this.form.isDatasetOwner !== 'Yes' && this.form.datasetOwnerEmail?.length > 0 && !this.isValidEmail(this.form.datasetOwnerEmail)) {
        callback(new Error('Please enter a valid e-mail address'))
      }
      callback()
    }
    return {
      form: {
        captchaToken: '',
        detailedDescription: '',
        datasetSize: '',
        shortDescription: '',
        publishedManuscript: '',
        isDatasetOwner: '',
        datasetOwnerName: '',
        datasetOwnerEmail: '',
        numDatasets: '',
        manuscriptDoi: '',
        user: {
          firstName: useMainStore().firstName,
          lastName: useMainStore().lastName,
          email: useMainStore().profileEmail,
          sendCopy: true,
          shouldFollowUp: true,
          shouldSubscribe: false
        }
      },
      isSubmitting: false,
      formRules: {
        user: {
          email: [
            {
              required: true,
              message: 'Please enter your email',
              type: 'email',
              trigger: 'blur',
            }
          ],
          firstName: [
            {
              required: true,
              message: 'Please enter your first name',
              trigger: 'blur',
            }
          ],
          lastName: [
            {
              required: true,
              message: 'Please enter your last name',
              trigger: 'blur',
            }
          ]
        },

        shortDescription: [
          {
            required: true,
            message: 'Please enter a description',
            trigger: 'change'
          }
        ],

        detailedDescription: [
          {
            required: true,
            message: 'Please enter a description',
            trigger: 'change'
          }
        ],

        datasetSize: [
          {
            required: true,
            message: 'Please select one option',
            trigger: 'change'
          }
        ],

        publishedManuscript: [
          {
            required: true,
            message: 'Please select one option',
            trigger: 'change'
          }
        ],

        isDatasetOwner: [
          {
            required: true,
            message: 'Please select one option',
            trigger: 'change'
          }
        ],

        datasetOwnerEmail: [
          {
            trigger: 'change',
            validator: validateEmail
          }
        ],

        numDatasets: [
          {
            required: true,
            message: 'Please select one',
            trigger: 'change'
          }
        ],

        captchaToken: [
          {
            required: true,
            message: 'Please check the box',
            trigger: 'change'
          }
        ]
      }
    }
  },

  mounted() {
    // Reset form fields when showing the form
    this.hasError = false
    this.$refs.submitForm.resetFields()
    const form = loadForm()
    if (form) {
      this.form = {
        ...this.form,
        ...form
      }
    }
    populateFormWithUserData(this.form, this.firstName, this.lastName, this.profileEmail)
  },

  methods: {
    /**
     * Send form to endpoint
     */
    async sendForm() {
      const config = useRuntimeConfig()
      this.isSubmitting = true
      const isAnbcFormSubmission = this.$route.fullPath ? this.$route.fullPath.toLowerCase().includes('ref=anbc') : false
      const body = `
        <b>Submit Data/Models Submission:</b><br><br>
        <b>Draft title of dataset:</b><br>${this.form.shortDescription}<br><br>
        <b>Please provide a short description of the research:</b><br>${this.form.detailedDescription}<br><br>
        <b>What is the approximate total size of your dataset?</b><br>${this.escapeHTML(this.form.datasetSize)}<br><br>
        <b>Have you submitted the manuscript that interprets this data for consideration by a journal?</b><br>${this.form.publishedManuscript}<br><br>
        <b>Doi url:</b><br>${this.form.manuscriptDoi == '' ? 'N/A' : this.form.manuscriptDoi}<br><br>
        <b>Are you the dataset owner?</b><br>${this.form.isDatasetOwner}<br><br>
        <b>Dataset owner name:</b><br>${this.form.isDatasetOwner == 'Yes' ? 'N/A' : this.form.datasetOwnerName}<br><br>
        <b>Dataset owner email:</b><br>${this.form.isDatasetOwner == 'Yes' ? 'N/A' : this.form.datasetOwnerEmail}<br><br>
        <b>Including the dataset you are inquiring about now, how many datasets are you interested in contributing??</b><br>${this.escapeHTML(this.form.numDatasets)}<br><br>
        <b>Your name:</b><br>${this.form.user.firstName} ${this.form.user.lastName}<br><br>
        <b>Your email:</b><br>${this.form.user.email}
      `
      let formData = new FormData()
      formData.append("type", "research")
      formData.append("sendCopy", this.form.user.sendCopy)
      formData.append("title", `SPARC Research Submission: ${this.form.user.firstName} ${this.form.user.lastName}`)
      formData.append("body", body)
      formData.append("email", this.form.user.email)
      formData.append("firstname", this.form.user.firstName)
      formData.append("lastname", this.form.user.lastName)
      formData.append("isAnbcForm", isAnbcFormSubmission)
      formData.append("captcha_token", this.form.captchaToken)

      // Save form to sessionStorage
      saveForm(this.form)
      try {
        const response = await this.$axios.post(`${config.public.portal_api}/submit_data_inquiry`, formData)
        const data = response.data;
        const status = response.status;
        if (this.form.user.shouldSubscribe) {
          this.subscribeToNewsletter(this.form.user.email, this.form.user.firstName, this.form.user.lastName)
        }
        let message = ''
        switch (status) {
          case 201:
            message = `${data?.message}`
            ElMessage({
              showClose: true,
              message: message,
              type: 'success',
              duration: 5000
            })
            break
          case 207:
            message = `${data?.warning}${data?.details}`
            ElMessage({
              showClose: true,
              message: message,
              type: 'info',
              duration: 0
            })
            break
          case 400:
            message = `${data?.error}`
            ElMessage({
              showClose: true,
              message: `We encountered the following problem when attempting to submit your request: ${message}. If this problem persists, please visit <a href='https://${config.public.ROOT_URL}/contact-us?type=bug' target='_blank'>here</a> to file an issue`,
              type: 'error',
              duration: 0,
              dangerouslyUseHTMLString: true
            })
            break
          case 500:
            message = `${data?.error}${data?.details}`
            ElMessage({
              showClose: true,
              message: `We encountered the following problem when attempting to submit your request: ${message}. If this problem persists, please visit <a href='https://${config.public.ROOT_URL}/contact-us?type=bug' target='_blank'>here</a> to file an issue`,
              type: 'error',
              duration: 0,
              dangerouslyUseHTMLString: true
            })
            break
          default:
            ElMessage({
              showClose: true,
              message: `There was a problem when attempting to submit your request. If this problem persists, please visit <a href='https://${config.public.ROOT_URL}/contact-us?type=bug' target='_blank'>here</a> to file an issue`,
              type: 'error',
              duration: 0,
              dangerouslyUseHTMLString: true
            })
            break
        }
        this.$emit('submit', this.form.user.firstName)
      } catch (e) {
          ElMessage({
            showClose: true,
            message: `We encountered the following problem when attempting to submit your request: ${e} If this problem persists, please visit <a href='https://${config.public.ROOT_URL}/contact-us?type=bug' target='_blank'>here</a> to file an issue`,
            type: 'error',
            duration: 0,
            dangerouslyUseHTMLString: true
          })
          this.hasError = true
      }
      this.isSubmitting = false
    },
  },

  watch: {
    firstName() {
      this.form.user.firstName = this.firstName
    },
    lastName() {
      this.form.user.lastName = this.lastName
    },
    profileEmail() {
      this.form.user.email = this.profileEmail
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';

hr {
  border-top: none;
  border-left: none;
  border-width: 2px;
  border-color: $lineColor1;
  margin: 2rem 0;
}
.error {
  color: $danger;
}
.recaptcha {
  display: flex;
  justify-content: left;
}
:deep(.el-form-item__content) {
  display: block;
}
</style>
