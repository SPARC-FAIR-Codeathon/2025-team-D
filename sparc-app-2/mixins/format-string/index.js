
export default {
  methods: {
    /**
     * Return the string with the first letter capitalized
     * @param {String} text
     */
    capitalize: function(text) {
      if (text && (typeof text === 'string' || text instanceof String))
        return text.charAt(0).toUpperCase() + text.slice(1)
      return text
    }
  }
}
