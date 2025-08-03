export default {
  data() {
    return {
      hasError: false,
      isSubmitting: false
    }
  },

  methods: {
    /**
     * Subscribe to Newsletter
     */
    subscribeToNewsletter(email, firstName, lastName) {
      this.isSubmitting = true

      this.$axios
        .post(`${this.$config.public.portal_api}/subscribe_to_newsletter`, {
          email_address: email,
          first_name: firstName,
          last_name: lastName
        })
        .catch(() => {
          this.hasError = true
        })
        .finally(() => {
          this.isSubmitting = false
        })
    },

    /**
     * Validate name
     * @param {Object} rule
     * @param {String} value
     * @param {Function} callback
     */
    validateForNewsletter: function(rule, value, callback) {
      if (this.form.shouldSubscribe && value === '') {
        callback(new Error(rule.message))
      }
      callback()
    }
  }
}
