<template>
  <el-form
    ref="submitForm"
    label-position="top"
    :model="form"
    :rules="formRules"
    :hide-required-asterisk="true"
  >
    <el-form-item
      prop="pageOrResource"
      label="Is this about a specific page or resource? *"
    >
      <el-select
        v-model="form.pageOrResource"
        placeholder="Select one"
      >
        <el-option
          v-for="area in areasOfSparc"
          :key="area"
          :label="area"
          :value="area"
        />
      </el-select>
    </el-form-item>

    <el-form-item prop="pageUrl" label="Please provide the specific page URL">
      <el-input v-model="form.pageUrl" placeholder="URL">
        <template #prepend>Http://</template>
      </el-input>
    </el-form-item>

    <el-form-item
      prop="description"
      label="Provide a short description of your inquiry *"
    >
      <el-input
        v-model="form.description"
        placeholder="(Example: I have a question about <area of inquiry>)"
      />
    </el-form-item>

    <el-form-item prop="message" label="Your question or comment *">
      <el-input
        v-model="form.message"
        type="textarea"
        :rows="3"
        placeholder="Enter your question or comment"
      />
    </el-form-item>

    <hr />

    <user-contact-form-item showFollowUpOption v-model="form.user"/>

    <hr />

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
import NewsletterMixin from '../NewsletterMixin'
import RecaptchaMixin from '@/mixins/recaptcha/index'
import UserContactFormItem from '../UserContactFormItem.vue'
import { mapState } from 'pinia'
import { useMainStore } from '@/store/index'
import { loadForm, populateFormWithUserData, saveForm } from '~/utils/utils'

export default {
  name: 'GeneralForm',

  mixins: [NewsletterMixin, RecaptchaMixin],

  components: {
    UserContactFormItem
  },

  data() {
    return {
      form: {
        captchaToken: '',
        description: '',
        pageUrl: '',
        pageOrResource: '',
        message: '',
        user: {
          firstName: useMainStore().firstName,
          lastName: useMainStore().lastName,
          email: useMainStore().profileEmail,
          shouldFollowUp: true,
          shouldSubscribe: false,
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
        description: [
          {
            required: true,
            message: 'Please enter a description',
            trigger: 'change'
          }
        ],
        pageOrResource: [
          {
            required: true,
            message: 'Please select an option',
            trigger: 'change'
          }
        ],
        message: [
          {
            required: true,
            message: 'Please enter a message',
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

  computed: {
    ...mapState(useMainStore, {
      areasOfSparc: state => state.formOptions.areasOfSparc
    })
  },

  mounted() {
    // Reset form fields when showing the form
    this.$refs.submitForm.resetFields()
    this.hasError = false
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
    validateEmail: function(rule, value, callback) {
      if (value === '') {
        callback(new Error(rule.message))
      }
      callback()
    },

    validateUrl: function(rule, value, callback) {
      if (!value.includes('.') || value.lastIndexOf('.') == value.length - 1 || value.indexOf('.') == 0) {
        callback(new Error(rule.message))
      }
      callback()
    },
    /**
     * Send form to endpoint
     */
    async sendForm() {
      const config = useRuntimeConfig()
      this.isSubmitting = true
      const message = `
        <b>Is this about a specific page or resource?</b><br>${this.form.pageOrResource}<br><br>
        <b>Please provide the specific page URL:</b><br>${this.form.pageUrl}<br><br>
        <b>Provide a short description of your inquiry:</b><br>${this.form.description}<br><br>
        <b>Your question or comment:</b><br>${this.form.message}<br><br>
        <b>Name:</b><br>${this.form.user.firstName} ${this.form.user.lastName}<br><br>
        <b>Email:</b><br>${this.form.user.email}<br><br>
        <b>I'd like updates about this submission:</b><br>${this.form.user.shouldFollowUp ? 'Yes' : 'No'}
      `
      const fullName = `${this.form.user.firstName} ${this.form.user.lastName}`

      // Save form to sessionStorage
      saveForm(this.form)
      try {
        const response = await this.$axios.post(`${config.public.portal_api}/contact_support`, {
            name: fullName,
            email: this.form.user.email,
            message: message,
            subject: 'SPARC Question or Inquiry Submission'
        })
        const data = response.data
        const status = response.status
        if (this.form.user.shouldSubscribe) {
          this.subscribeToNewsletter(this.form.user.email, this.form.user.firstName, this.form.user.lastName)
        }
        let response_message = ''
        switch (status) {
          case 200:
            response_message = `${data?.message}`
            ElMessage({
              showClose: true,
              message: response_message,
              type: 'success',
              duration: 5000
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
    }
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

.submit-button {
  text-align: left;
  margin-bottom: 0 !important;
}
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
:deep(.file-upload) {
  .el-form-item__label {
    margin-bottom: .3rem;
  }
}
</style>
