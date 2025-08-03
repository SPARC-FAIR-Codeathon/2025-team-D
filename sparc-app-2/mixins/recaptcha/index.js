export default {
  data() {
    return {
      hasError: false
    }
  },
  methods: {
    /**
     * Submit the form and validate
     */
    async onSubmit() {
      await this.$refs.submitForm.validate(async valid => {
        if (valid) {
          await this.sendForm()
        }
      })
    }
  }
}
