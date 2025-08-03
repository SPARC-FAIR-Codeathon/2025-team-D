export default {
  methods: {
    /**
     * Truncate the field to a limit
     * @param {String} fnName method to use, i.e., warn, log, error, trace, etc.
     * @param {Boolean} disabled turns logging off completely
     * @returns {Object} console function or no-op
     */
    truncateField: function(field, limit = 250) {
      return field.length > limit ? field.slice(0, limit) + '...' : field
    }
  }
}
