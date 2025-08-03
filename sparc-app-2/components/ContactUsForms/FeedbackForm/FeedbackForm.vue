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
      label="What area of the SPARC Portal is this related to?"
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

    <el-form-item
      prop="shortDescription"
      label="Provide a short description of your feedback *"
    >
      <el-input
        v-model="form.shortDescription"
        placeholder="(Example: I think it would be great to <your idea>)"
      />
    </el-form-item>

    <el-form-item prop="detailedDescription" label="Provide a detailed description *">
      <el-input
        v-model="form.detailedDescription"
        type="textarea"
        :rows="3"
        placeholder="Provide a detailed description of your feedback"
      />
    </el-form-item>

    <hr/>

    <user-contact-form-item v-model="form.user" showFollowUpOption/>

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
import NewsletterMixin from '../NewsletterMixin'
import RecaptchaMixin from '@/mixins/recaptcha/index'
import UserContactFormItem from '../UserContactFormItem.vue'
import { mapState } from 'pinia'
import { useMainStore } from '@/store/index'
import { loadForm, populateFormWithUserData, saveForm } from '~/utils/utils'

export default {
  name: 'FeedbackForm',

  mixins: [NewsletterMixin, RecaptchaMixin],

  components: {
    UserContactFormItem
  },

  data() {
    return {
      form: {
        captchaToken: '',
        pageOrResource: '',
        detailedDescription: '',
        shortDescription: '',
        user: {
          firstName: useMainStore().firstName,
          lastName: useMainStore().lastName,
          email: useMainStore().profileEmail,
          sendCopy: true,
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
    }),
    formattedDetailedDescription() {
      // GitHub only treats double line breaks as a line break, so must do this to retain when the user presses enter key
      return this.form.detailedDescription?.replace(/\n/g, '<br>\n')
    },
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
      const body = `
### What area of the SPARC Portal is this related to?
${this.form.pageOrResource}

### Detailed description:
${this.formattedDetailedDescription}

### Would you like to receive updates about this submission:
${this.form.user.shouldFollowUp ? 'Yes' : 'No'}

## Contact Info

### Name
${this.form.user.firstName} ${this.form.user.lastName}

### Email
${this.form.user.email}`

      let formData = new FormData();
      formData.append("type", "feedback")
      formData.append("sendCopy", this.form.user.sendCopy)
      formData.append("title", `${this.form.shortDescription}`)
      formData.append("body", body)
      formData.append("captcha_token", this.form.captchaToken)
      formData.append("email", this.form.user.email)

      // Save form to sessionStorage
      saveForm(this.form)

      try {
        const { data } = await this.$axios.post(`${config.public.portal_api}/create_issue`, formData)
        if (this.form.user.shouldSubscribe) {
          this.subscribeToNewsletter(this.form.user.email, this.form.user.firstName, this.form.user.lastName)
        }
        const status = data?.status
        const message = data?.message
        switch (status) {
          case 'success':
            ElMessage({
              showClose: true,
              message: message,
              type: 'success',
              duration: 5000
            })
            break
          case 'warning':
            ElMessage({
              showClose: true,
              message: message,
              type: 'info',
              duration: 0
            })
            break
          case 'error':
            ElMessage({
              showClose: true,
              message: `There was a problem when attempting to create a bug report. If this problem persists, please visit <a href='https://github.com/${config.public.GITHUB_ORG}/${config.public.GITHUB_REPO}/issues' target='_blank'>https://github.com/${config.public.GITHUB_ORG}/${config.public.GITHUB_REPO}/issues</a> to file a new issue`,
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
          message: `There was a problem when attempting to submit feedback. If this problem persists, please visit <a href='https://github.com/${config.public.GITHUB_ORG}/${config.public.GITHUB_REPO}/issues' target='_blank'>https://github.com/${config.public.GITHUB_ORG}/${config.public.GITHUB_REPO}/issues</a> to file a new issue`,
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
</style>
