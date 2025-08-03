export default {
  methods: {
    isValidEmail(email) {
      const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/
      return emailRegex.test(email)
    },
    escapeHTML(str) {
      if (typeof str !== 'string') return str
      return str
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/≥/g, "&ge;")
        .replace(/≤/g, "&le;")
    }
  }
}
